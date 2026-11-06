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
 const envelope=JSON.parse(journal),value=JSON.parse(envelope.payload);change(value);
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
