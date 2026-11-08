import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
const output=await build({stdin:{contents:`export * from './src/lib/backup/restore-journal'; export * from './src/lib/backup/stored-progress';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,format:'cjs',platform:'node',write:false,logLevel:'silent'});
const mod={exports:{}};new Function('module','exports','crypto',output.outputFiles[0].text)(mod,mod.exports,webcrypto);
const {prepareRestoreJournal,executePreparedRestore,recoverRestoreJournal,validateStoredProgress,RESTORE_JOURNAL_KEY:J}=mod.exports;
const origin='http://fixture.test';
async function setup(){
 const f=fixture();const h=f.core.getState().addHabit({name:'Prática',elementId:'ar',plannedTimeMinutes:5,plannedPoints:2});
 f.core.getState().completeHabit(h.id,5,new Date(2026,9,28,12));
 assert.ok(f.fitness.getState().startSession(undefined,3));
 const current=f.captureProgress(origin),before=Object.fromEntries(Object.entries(current.stores).map(([key,v])=>[key,JSON.stringify({version:v.version,state:v.state})]));
 const target=structuredClone(current);target.stores.core.state.user.xp_fire=20;
 const journal=await prepareRestoreJournal(before,await f.createProgressBackup(target),origin);
 const memory=new Map(Object.entries(before).map(([part,v])=>[part==='core'?f.STORE_KEYS.core:f.STORE_KEYS.fitness,v])),writes=[];
 const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>{writes.push([key,value]);memory.set(key,value);},removeItem:key=>{writes.push([key,null]);memory.delete(key);}};
 return {f,before,current,journal,memory,writes,storage};
}
async function resign(journal,change){
 const envelope=JSON.parse(journal),value=JSON.parse(await mod.exports.decodeRestoreJournalPayload(envelope.payload));change(value);
 const payload=JSON.stringify(value),checksum=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(payload))).toString('hex');
 return JSON.stringify({payload,checksum});
}
const editPair=(pair,change)=>{const v=JSON.parse(pair.core);change(v);pair.core=JSON.stringify(v);};

test('stored pair rejects incomplete, unsupported and structurally unsafe baselines without normalization',async()=>{
 const {before}=await setup();assert.equal(validateStoredProgress({core:null,fitness:null},origin),null);
 for(const pair of [{...before,core:null},{...before,fitness:'{'},{...before,core:'{}'}, {...before,core:before.core.replace('"version":0','"version":9')}, {...before,core:before.core.replace('"user":{','"user":{"__proto__":{},')}]){
  assert.throws(()=>validateStoredProgress(pair,origin));
 }
 const pretty={core:' \n'+before.core+'\n ',fitness:' '+before.fitness+' '};const raw=JSON.stringify(pretty);
 assert.ok(validateStoredProgress(pretty,origin));assert.equal(JSON.stringify(pretty),raw);
});

test('execute and recovery reject both sides of a rehashed journal before any write',async()=>{
 const variants=[
  j=>{j.target.core='{}';},
  j=>{const v=JSON.parse(j.target.fitness);v.state.accountDataById.local.exercisesCatalog[0].instructions=null;j.target.fitness=JSON.stringify(v);},
  j=>{const v=JSON.parse(j.before.fitness);v.state.accountDataById.local.strengthStat='invalid';j.before.fitness=JSON.stringify(v);},
  j=>{const v=JSON.parse(j.target.fitness);v.state.nativeDataById.local.activeNativeSession.status='cancelled';j.target.fitness=JSON.stringify(v);},
  j=>{const v=JSON.parse(j.before.fitness);v.state.nativeDataById.local.activeNativeSession.executionMode='invalid';j.before.fitness=JSON.stringify(v);},
  j=>{j.before.fitness=null;},
  j=>editPair(j.target,v=>v.version=1),
  j=>editPair(j.target,v=>v.state.user.xp_fire=-1),
  j=>editPair(j.before,v=>v.state.habits[0].completions[0].habitId='another-cycle'),
  j=>editPair(j.target,v=>v.state.currentAccountId='missing'),
 ];
 for(const change of variants){
  const {journal,memory,writes,storage}=await setup();const invalid=await resign(journal,change);const before=[...memory];
  await assert.rejects(executePreparedRestore(storage,invalid,origin));assert.deepEqual([...memory],before);assert.equal(writes.length,0);
  memory.set(J,invalid);const baseline=[...memory];await assert.rejects(recoverRestoreJournal(storage,origin));
  assert.deepEqual([...memory],baseline);assert.equal(writes.length,0);
 }
});

test('sequence memberships and descendant references pass before missing and circular links are flagged',async()=>{
 const {f,current}=await setup();const good=JSON.parse(JSON.stringify(current));const habit=good.stores.core.state.habits[0];
 good.stores.core.state.cycleSequences=[{id:'sequence',name:'Rotina'}];
 good.stores.core.state.sequenceMemberships=[{id:'membership',sequenceId:'sequence',habitId:habit.id,position:0}];
 assert.equal(f.auditCriticalProgress(good).issues.length,0);
 const corrupt=structuredClone(good);corrupt.stores.core.state.sequenceMemberships[0].habitId='absent';
 corrupt.stores.core.state.tasks=[{id:'a',parentId:'b',children:[]},{id:'b',parentId:'a',children:[]}];
 corrupt.stores.core.state.habits[0].completions[0].habitId='unrelated';
 const before=JSON.stringify(corrupt),issues=f.auditCriticalProgress(corrupt).issues;
 for(const text of ['vínculo circular','vínculo sem atividade','outro ciclo'])assert.ok(issues.some(i=>i.message.includes(text)),text);
 assert.equal(JSON.stringify(corrupt),before);
});

test('parent views, missing children, duplicate sequence links and active profile disagreement are explicit',async()=>{
 const {f,current}=await setup();const b=JSON.parse(JSON.stringify(current)),core=b.stores.core.state;
 core.tasks=[{id:'a',parentId:null,children:['absent']}];core.actions=[{id:'a',parentId:'absent'}];
 core.sequenceMemberships=[{id:'a',sequenceId:'x',habitId:'y',position:-1},{id:'b',sequenceId:'x',habitId:'y',position:0}];
 core.currentAccountId='not-registered';
 const issues=f.auditCriticalProgress(b).issues;
 for(const text of ['perfil ativo','projeções','subitem ausente','posição','mais de uma vez'])assert.ok(issues.some(i=>i.message.includes(text)),text);
});

test('legacy experience conversion is reproduced on hydration and flagged without changing its existing rule',async()=>{
 const {f,before}=await setup();const pair={...before};editPair(pair,v=>{for(const e of ['fire','earth','water','air'])v.state.user['xp_'+e]=0;v.state.user.experience=9;});
 const reload=fixture([[f.STORE_KEYS.core,pair.core],[f.STORE_KEYS.fitness,pair.fitness]]);
 assert.equal(reload.core.getState().user.xp_earth,9); // Existing hydration behavior, not a new formula.
 assert.throws(()=>validateStoredProgress(pair,origin),/precisam de revisão/);
});

test('long flat parent chains are checked without recursive parent walking or mutating data',async()=>{
 const {f,current}=await setup();const b=JSON.parse(JSON.stringify(current));
 b.stores.core.state.tasks=Array.from({length:10000},(_,i)=>({id:'node-'+i,parentId:i===9999?null:'node-'+(i+1),children:[]}));
 assert.equal(f.auditCriticalProgress(b).issues.length,0);
 b.stores.core.state.tasks[9999].parentId='node-0';assert.ok(f.auditCriticalProgress(b).issues.some(i=>i.message.includes('circular')));
});

test('a real app-created task with direct and nested legacy items restores without changing projections or XP',async()=>{
 const f=fixture();const task=f.core.getState().addTask({title:'Sintético'});
 f.core.getState().addTaskItem(task.id,{title:'Direto'});
 const child=f.core.getState().tasks[0].childItems[0];f.core.getState().addTaskItem(task.id,{title:'Neto'},child.id);
 const habit=f.core.getState().addHabit({name:'Prática sintética',elementId:'ar',plannedTimeMinutes:5,plannedPoints:2});
 f.core.getState().completeHabit(habit.id,5,new Date(2026,9,28,12));
 const snapshot=JSON.parse(JSON.stringify(f.captureProgress(origin))),before=JSON.stringify(snapshot);
 snapshot.appVersion='0.1.130'; // Same producer as the phone screenshot; archive remains untouched by import.
 const original=JSON.stringify(snapshot);
 assert.deepEqual(f.auditCriticalProgress(snapshot).issues,[]);
 const archive=await f.createProgressBackup(snapshot);const checked=await f.prepareWorkspacePreview(archive,{getItem:()=>null},origin);
 assert.deepEqual(checked.audit.issues,[]);assert.equal(JSON.stringify(snapshot),original);assert.equal(JSON.parse(before).stores.core.state.user.xp_air,snapshot.stores.core.state.user.xp_air);
 assert.equal(snapshot.stores.core.state.tasks[0].childItems[0].parentId,null);
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const journal=await prepareRestoreJournal({core:null,fitness:null},archive,origin);
 await executePreparedRestore(storage,journal,origin);
 for(const part of ['core','fitness'])assert.deepEqual(JSON.parse(storage.getItem(f.STORE_KEYS[part])).state,snapshot.stores[part].state);
 const restored=fixture([],memory);assert.deepEqual(restored.core.getState().user,snapshot.stores.core.state.user);
 assert.ok(snapshot.stores.core.state.user.xp_air>0);
 assert.equal(restored.core.getState().tasks[0].childItems[0].id,child.id);

 const bad=structuredClone(snapshot);bad.stores.core.state.actions.find(a=>a.id===child.id).parentId='another-parent';
 assert.ok(f.auditCriticalProgress(bad).issues.some(i=>i.message.includes('projeções')));
 const badOwner=structuredClone(snapshot);badOwner.stores.core.state.tasks[0].childItems[0].taskId='wrong-root';
 assert.ok(f.auditCriticalProgress(badOwner).issues.some(i=>i.message.includes('projeções')));
});

test('app-created quest and mission tasks/habits retain canonical roots and contextual native links through import and hydration',async()=>{
 const f=fixture(),s=f.core.getState();const project=s.addProject({title:'Projeto sintético'});s.addMissionToProject(project.id,{title:'Missão sintética'});
 const mission=f.core.getState().projects[0].missions[0];const quest=s.addQuest({title:'Jornada sintética'});
 for(const [addTask,addHabit] of [[data=>s.addTaskToQuest(quest.id,data),data=>s.addHabitToQuest(quest.id,data)],[data=>s.addTaskToMission(project.id,mission.id,data),data=>s.addHabitToMission(project.id,mission.id,data)]]){
  addTask({title:'Ritual sintético'});addHabit({name:'Ciclo sintético',elementId:'ar',plannedTimeMinutes:5,plannedPoints:2});
 }
 s.completeHabit(f.core.getState().habits[0].id,5,new Date(2026,10,6,12));
 const snapshot=JSON.parse(JSON.stringify(f.captureProgress(origin)));snapshot.appVersion='0.1.130';const original=JSON.stringify(snapshot);
 assert.deepEqual(f.auditCriticalProgress(snapshot).issues,[]);
 const archive=await f.createProgressBackup(snapshot),checked=await f.prepareWorkspacePreview(archive,{getItem:()=>null},origin);assert.deepEqual(checked.audit.issues,[]);assert.equal(JSON.stringify(snapshot),original);
 const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 await executePreparedRestore(storage,await prepareRestoreJournal({core:null,fitness:null},archive,origin),origin);
 for(const part of ['core','fitness'])assert.deepEqual(JSON.parse(storage.getItem(f.STORE_KEYS[part])).state,snapshot.stores[part].state);
 const reloaded=fixture([],memory);assert.deepEqual(reloaded.core.getState().user,snapshot.stores.core.state.user);assert.ok(reloaded.core.getState().user.xp_air>0);
 const badVariants=[
  b=>{b.stores.core.state.actions[0].parentId='wrong-explicit-parent';},
  b=>{b.stores.core.state.tasks[0].parentId=quest.id;},
  b=>{b.stores.core.state.projects[0].missions[0].tasks[0].parentId=quest.id;},
  b=>{b.stores.core.state.quests[0].tasks.push({...b.stores.core.state.tasks[0],parentId:quest.id});},
  b=>{b.stores.core.state.tasks=[];},
  b=>{b.stores.core.state.projects[0].missions[0].tasks=[];},
 ];
 for(const change of badVariants){const b=structuredClone(snapshot);change(b);assert.ok(f.auditCriticalProgress(b).issues.some(i=>i.message.includes('projeções')));}
});
