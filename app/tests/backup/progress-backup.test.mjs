import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';
function seed(f) {
  const task=f.core.getState().addTask({title:'Leitura',elementId:'ar',baseValue:2,plannedTimeMinutes:5,effortLevel:2});
  f.core.getState().completeTask(task.id,5);
  const habit=f.core.getState().addHabit({name:'Praticar',elementId:'agua',plannedPoints:3,plannedTimeMinutes:5});
  const day=new Date(2026,9,27,12);
  f.core.getState().configureHabitDailyTracking(habit.id,{unit:'repetições',target:3,step:1});
  f.core.getState().recordHabitQuantity(habit.id,day);f.core.getState().completeHabit(habit.id,5,day);
  f.core.getState().addDraft('Plano','Notas');
  // Canonical/legacy fixture history; never run reward commands during restore tests.
  const fitness=f.fitness.getState();
  f.fitness.setState({accountDataById:{...fitness.accountDataById,local:{...fitness.accountDataById.local,sessions:[{id:'legacy-session',workoutId:'plan-1',status:'completed'}],gamificationLedger:[{id:'receipt',sessionId:'legacy-session',xpAwarded:12}]}},
    nativeDataById:{local:{nativeCatalog:[],templates:[{id:'plan-2',name:'Fixture'}],sequences:[],nativeCheckins:{},activeNativeSession:null,nativeHistory:[{id:'native-session',templateId:'plan-2',status:'completed'}]}}});
}

test('archive preserves both real persist projections, completion snapshots, counters and IDs without commands',async()=>{
  const f=fixture();seed(f);const snapshot=f.captureProgress('http://example.test');
  const original=JSON.parse(JSON.stringify(snapshot));const state=f.core.getState();const workout=f.fitness.getState();const reads=f.reads.length;
  const text=await f.createProgressBackup(snapshot);const {backup,summary}=await f.inspectProgressBackup(text);
  assert.deepEqual(backup.stores,original.stores);assert.equal(summary.sessions,2);assert.equal(summary.tasks,1);assert.equal(summary.habits,1);
  assert.ok(backup.stores.core.state.tasks[0].completionXp.amount>0);
  assert.ok(backup.stores.core.state.habits[0].completions[0].xpAwarded>0);
  assert.equal(f.core.getState(),state);assert.equal(f.fitness.getState(),workout);assert.equal(f.reads.length,reads);
});

test('export freezes its data before async hashing and excludes nonpersisted sessions or arbitrary storage',async()=>{
  const f=fixture();seed(f);f.core.setState({session:{access_token:'not-exportable'},timer:{entityId:'running'}});
  f.memory.set('sb-private-auth','not-exportable');const snapshot=f.captureProgress('https://app.example');const pending=f.createProgressBackup(snapshot);
  snapshot.stores.core.state.user.name='Alterado depois';const text=await pending;
  assert.doesNotMatch(text,/not-exportable|access_token|"timer"|sb-private-auth/);
  assert.notEqual((await f.inspectProgressBackup(text)).backup.stores.core.state.user.name,'Alterado depois');
});

test('exported persisted data hydrates in an isolated instance preserving rewards, relationships and fitness history',async()=>{
  const f=fixture();seed(f);const {backup}=await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://example.test')));
  const entries=Object.values(backup.stores).map(store=>[store.key,JSON.stringify({state:store.state,version:store.version})]);
  const restored=fixture(entries);const next=restored.captureProgress('http://example.test');
  for(const key of ['tasks','habits','drafts','actions','executionLogs','cycleSequences','sequenceMemberships','projects','quests']) assert.deepEqual(JSON.parse(JSON.stringify(next.stores.core.state[key])),backup.stores.core.state[key],key);
  for(const element of ['earth','fire','water','air'])assert.equal(next.stores.core.state.user[`xp_${element}`],backup.stores.core.state.user[`xp_${element}`]);
  assert.deepEqual(JSON.parse(JSON.stringify(next.stores.fitness.state)),backup.stores.fitness.state);
});

test('all local profiles remain in the archive; the active root is not replaced by its older account snapshot',async()=>{
  const f=fixture();const first=f.core.getState().createAccount('Conta A',false);
  const second=f.core.getState().createAccount('Conta B',false);
  f.core.getState().switchAccount(first.id);f.core.getState().addDraft('A','');
  f.core.getState().switchAccount(second.id);f.core.getState().addDraft('B','');
  f.core.getState().switchAccount(first.id);f.core.getState().addDraft('A atual','');
  const snapshot=f.captureProgress('http://example.test');const {backup,summary}=await f.inspectProgressBackup(await f.createProgressBackup(snapshot));
  assert.equal(summary.profiles,2);assert.equal(summary.drafts,2);assert.equal(backup.source.accountId,first.id);
  assert.ok(backup.stores.core.state.accountDataById[second.id]);assert.ok(backup.stores.fitness.state.accountDataById[second.id]);
  assert.ok(backup.stores.core.state.drafts.some(draft=>draft.title==='A atual'));
});

test('tampered, truncated, oversized, future and credential-shaped envelopes are rejected without writes',async()=>{
  const f=fixture();const text=await f.createProgressBackup(f.captureProgress('http://example.test'));const before=[...f.memory];
  const edited=JSON.parse(text);edited.stores.core.state.user.name='Outro';await assert.rejects(f.inspectProgressBackup(JSON.stringify(edited)),/conteúdo mudou/);
  await assert.rejects(f.inspectProgressBackup(text.slice(0,-5)),/JSON/);
  await assert.rejects(f.inspectProgressBackup(' '.repeat(f.MAX_BACKUP_BYTES+1)),/20 MB/);
  for(const modify of [v=>v.schemaVersion=2,v=>delete v.stores.fitness,v=>v.stores.core.version=1,v=>v.stores.core.state.session={access_token:'test'},v=>v.stores.core.state.tasks={},v=>v.checksum.algorithm='MD5',v=>v.source.accountId='wrong']) {
    const value=JSON.parse(text);modify(value);await assert.rejects(f.inspectProgressBackup(JSON.stringify(value)));
  }
  await assert.rejects(f.inspectProgressBackup(text.replace('"user": {','"user": {"__proto__": {},')),/chave incompatível/);
  assert.deepEqual([...f.memory],before);
});

test('nonfinite existing values, mismatched accounts and changed persistence schema fail closed',async()=>{
  const f=fixture();const original=f.captureProgress('http://example.test');
  const invalid=structuredClone(original);invalid.stores.core.state.user.xp_fire=Infinity;await assert.rejects(f.createProgressBackup(invalid),/número inválido/);
  const mixed=structuredClone(original);mixed.stores.fitness.state.currentAccountId='other';await assert.rejects(f.createProgressBackup(mixed),/não estão alinhadas/);
  f.core.persist.setOptions({name:'unknown'});assert.throws(()=>f.captureProgress('http://example.test'),/configuração/);
});
