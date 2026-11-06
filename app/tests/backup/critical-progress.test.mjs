import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';
async function seed(){
 const f=fixture(),s=f.core;
 const a=s.getState().createAccount('A',false);
 const task=s.getState().addTask({title:'Ler',elementId:'ar',baseValue:2,plannedTimeMinutes:5,effortLevel:2});s.getState().completeTask(task.id,5);
 const h=s.getState().addHabit({name:'Praticar',elementId:'agua',plannedPoints:3,plannedTimeMinutes:5});
 s.getState().configureHabitDailyTracking(h.id,{unit:'práticas',target:3,step:0.5});
 s.getState().recordHabitQuantity(h.id,new Date(2026,9,28,12));s.getState().completeHabit(h.id,5,new Date(2026,9,28,12));
 const b=s.getState().createAccount('B',false);s.getState().addDraft('Plano','');s.getState().switchAccount(a.id);
 const {backup}=await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://fixture.test')));
 return {f,a,b,backup};
}

test('real serialized profiles, counters, reward receipts and legacy absence pass without mutation',async()=>{
 const {f,backup}=await seed();const before=JSON.stringify(backup),memory=[...f.memory];
 assert.deepEqual(f.auditCriticalProgress(backup),{issues:[],truncated:false});
 assert.equal(JSON.stringify(backup),before);assert.deepEqual([...f.memory],memory);
 const legacy=structuredClone(backup);const completion=legacy.stores.core.state.habits[0].completions[0];
 delete completion.xpAwarded;delete completion.xpElementId;delete completion.xpRuleset;
 assert.deepEqual(f.auditCriticalProgress(legacy).issues,[]);
});

test('catches critical corruption inside inactive profiles and nested actions, with no repair',async()=>{
 const {f,backup,b}=await seed();
 backup.stores.core.state.accountDataById[b.id].user.xp_fire=-1;
 const habit=backup.stores.core.state.habits[0];
 habit.childHabits=[{...structuredClone(habit),id:'child',childHabits:[],dailyTracking:{target:0,step:1,unit:''}}];
 habit.dailyEntries[0].dateKey='2026-02-30';habit.completions[0].xpElementId=['agua'];
 backup.stores.core.state.tasks[0].completionXp.ruleset='unknown';
 const before=JSON.stringify(backup);const result=f.auditCriticalProgress(backup);
 for(const text of ['XP registrado','contador inválidos','Dia do contador','XP do ciclo','recompensa incompatível'])assert.ok(result.issues.some(i=>i.message.includes(text)),text);
 assert.ok(result.issues.some(i=>i.path.includes(b.id)));assert.ok(result.issues.some(i=>i.path.includes('childHabits')));
 assert.equal(JSON.stringify(backup),before);
});

test('duplicate IDs and invalid list shapes are scoped to each projection, not silently deduplicated',async()=>{
 const {f,backup}=await seed();const h=backup.stores.core.state.habits[0];h.dailyEntries.push({...h.dailyEntries[0]});
 backup.stores.core.state.tasks[0].childItems={};
 backup.stores.fitness.state.nativeDataById.extra={nativeCatalog:[],templates:[{id:'x'},{id:'x'}],sequences:[],nativeHistory:[]};
 const result=f.auditCriticalProgress(backup);assert.equal(result.issues.filter(i=>i.message.includes('repetida')).length,2);assert.ok(result.issues.some(i=>i.message.includes('Lista')));
});

test('incomplete quantity/completion records and invalid receipts are detected in project descendants',async()=>{
 const {f,backup}=await seed();backup.stores.core.state.projects=[{id:'p',missions:[{id:'m',quests:[{id:'q',habits:[{id:'h',dailyEntries:[{id:'d'}],completions:[{id:'c'}]}]}]}],completionBonus:{amount:2,elementId:'terra',ruleset:'achievement-bonus-v1'}}];
 const result=f.auditCriticalProgress(backup);
 for(const text of ['quantidade incompleto','conclusão incompleto','data da conquista inválida'])assert.ok(result.issues.some(i=>i.message.includes(text)),text);
});

test('file version and issue volume are explicit; public notices never copy content values',async()=>{
 const {f,backup}=await seed();backup.appVersion='99.0.0';backup.stores.core.state.drafts=Array.from({length:45},()=>({title:'Private title',createdAt:'private invalid date'}));
 const result=f.auditCriticalProgress(backup);assert.equal(result.issues.length,30);assert.equal(result.truncated,true);assert.equal(result.issues[0].path,'appVersion');
 assert.doesNotMatch(JSON.stringify(result),/Private title|private invalid date/);
});

test('preview carries findings without changing the archive or current state',async()=>{
 const {f,backup}=await seed();backup.stores.core.state.user.xp_air='bad';
 const original=JSON.stringify(backup);const {checksum,...snapshot}=backup;
 const text=await f.createProgressBackup(snapshot);const memory=[...f.memory];
 const result=await f.compareProgressBackup(text,f.captureProgress('http://fixture.test'));
 assert.ok(result.audit.issues.some(i=>i.path.endsWith('xp_air')));
 assert.equal(JSON.stringify(backup),original);assert.deepEqual([...f.memory],memory);
});
