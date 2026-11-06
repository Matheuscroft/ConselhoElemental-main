import test from 'node:test';
import assert from 'node:assert/strict';
import {authFixture} from './load-auth-sync.mjs';
import {cloudCoverage} from './cloud-coverage-contract.mjs';
const userId='synthetic-remote-a',origin='http://fixture.test',json=value=>JSON.parse(JSON.stringify(value));
const writes=f=>f.calls.filter(c=>['upsert','delete'].includes(c.operation));
function seed(f){
 const s=()=>f.local.core.getState(),account=s().createAccount('Perfil de origem',false);
 const task=s().addTask({title:'Prática de leitura',elementId:'ar',baseValue:2,plannedTimeMinutes:5,effortLevel:2});s().addTaskItem(task.id,{title:'Capítulo',baseValue:2});s().completeTaskItem(task.id,s().tasks[0].childItems[0].id);
 const habit=s().addHabit({name:'Prática diária',elementId:'agua',plannedPoints:3,plannedTimeMinutes:5});
 s().configureHabitDailyTracking(habit.id,{unit:'práticas',target:2,step:0.5});s().recordHabitQuantity(habit.id,new Date(2026,9,29,12));s().completeHabit(habit.id,5,new Date(2026,9,29,12));
 s().addExperience(17,'fogo');f.local.fitness.getState().addBodyMeasurement({weightKg:70});
 return {s,account,task,habit};
}

test('every persisted field has a reviewed classification; backup retains all fields while cloud coverage stays explicitly partial',async()=>{
 const f=authFixture();seed(f);const snapshot=f.local.captureProgress(origin),raw=json(snapshot);
 for(const module of ['core','fitness']){
  assert.deepEqual(Object.keys(snapshot.stores[module].state).sort(),Object.keys(cloudCoverage[module]).sort(),`${module}: review new/removed persisted fields before association`);
  for(const [classification,reason]of Object.values(cloudCoverage[module])){assert.ok(['local-only','partial','payload'].includes(classification));assert.ok(reason.length>20);}
 }
 const {backup}=await f.local.inspectProgressBackup(await f.local.createProgressBackup(snapshot));assert.deepEqual(backup.stores,raw.stores);assert.deepEqual(backup.source,raw.source);assert.equal(backup.checksum.algorithm,'SHA-256');
 assert.equal(Object.values(cloudCoverage.core).filter(([status])=>status==='payload').length,7);assert.equal(Object.values(cloudCoverage.core).filter(([status])=>status==='partial').length,5);
 assert.deepEqual(f.calls,[]);await f.close();
});

test('real cloud payload roundtrip retains activity IDs, child receipts, daily counts and achievement receipts, without replaying completions',async()=>{
 const source=authFixture(),{s}=seed(source);
 // Achievement methods require an explicit reviewed signature; use the real planner.
 const quest=s().addQuest({title:'Marco',xpBonus:11,elementId:'ar'});
 const {loadComponent}=await import('../elemental/load-component.mjs');const {achievementPlan}=loadComponent('src/lib/achievement-completion.ts');
 const plan=achievementPlan(s(),'quest',quest.id);s().setAchievementCompleted('quest',quest.id,true,s().currentAccountId,plan.signature);
 const before=json(source.local.captureProgress(origin));await source.persistAppStoreToCloud(userId);
 const target=authFixture();for(const [table,rows]of source.db)target.db.set(table,json(rows));
 const previousTargetXP=target.local.core.getState().user.xp_fire;await target.hydrateAppStoreFromCloud(userId);
 for(const field of ['tasks','habits','quests','projects','drafts'])assert.deepEqual(json(target.local.core.getState()[field]),before.stores.core.state[field].map(row=>({...row,local_id:row.id})),field);
 assert.ok(target.local.core.getState().tasks[0].childItems[0].completionXp);assert.equal(target.local.core.getState().habits[0].dailyEntries[0].quantity,0.5);
 assert.equal(target.local.core.getState().quests[0].completionBonus.amount,11);
 assert.equal(target.local.core.getState().user.xp_fire,previousTargetXP);assert.notEqual(target.local.core.getState().user.xp_fire,before.stores.core.state.user.xp_fire);
 assert.equal(writes(target).length,0);await source.close();await target.close();
});

test('character resources, other profiles and Fitness remain in backup but are not transferred by this service',async()=>{
 const f=authFixture(),{s,account}=seed(f),xp=s().user.xp_fire;
 const other=s().createAccount('Outro perfil',false);s().addDraft('Exclusiva do perfil inativo','');s().switchAccount(account.id);
 const before=json(f.local.captureProgress(origin));await f.persistAppStoreToCloud(userId);
 assert.ok(before.stores.core.state.accountDataById[other.id].drafts.some(d=>d.title==='Exclusiva do perfil inativo'));
 assert.ok(Object.values(before.stores.fitness.state.accountDataById).some(data=>data.bodyMeasurements?.length));assert.ok(xp>=17);
 const published=writes(f);assert.deepEqual(Object.keys(published.find(c=>c.table==='profiles').rows[0]).sort(),['avatar','display_name','id']);
 assert.ok(!published.some(c=>JSON.stringify(c.rows??[]).includes('Exclusiva do perfil inativo')));
 for(const missing of ['xp_fire','executionLogs','nativeDataById','bodyMeasurements','commitments'])assert.ok(!published.some(c=>JSON.stringify(c.rows??[]).includes('"'+missing+'"')),missing);
 await f.close();
});

test('repeated publication keeps the same remote row identities and receipt payloads; filters remain bound to the supplied user',async()=>{
 const f=authFixture();seed(f);await f.persistAppStoreToCloud(userId);const before=new Map([...f.db].map(([table,rows])=>[table,json(rows)]));f.calls.length=0;
 await f.persistAppStoreToCloud(userId);for(const [table,rows]of before)assert.deepEqual(f.db.get(table),rows,table);
 for(const call of f.calls.filter(c=>c.table&&c.table!=='profiles')){
  if(call.operation==='upsert')assert.ok(call.rows.every(row=>row.user_id===userId));else assert.ok(call.filters.some(([key,value])=>key==='user_id'&&value===userId));
 }
 await f.close();
});

test('mid-upload failure retains previous cloud rows but can leave a partially updated snapshot; no account association is inferred',async()=>{
 const f=authFixture();seed(f);
 const old={id:'remote-old',user_id:userId,local_id:'old-ritual',payload:{id:'old-ritual',title:'Ritual anterior'}};f.db.set('tasks',[old]);
 f.hooks.beforeQuery=async call=>call.table==='habits'&&call.operation==='upsert'?{message:'synthetic transfer interruption'}:undefined;
 await assert.rejects(f.persistAppStoreToCloud(userId),/synthetic transfer interruption/);
 assert.ok(f.db.get('tasks').some(row=>row.id===old.id));assert.ok(f.db.get('tasks').some(row=>row.local_id!==old.local_id));assert.ok(!f.calls.some(call=>call.operation==='delete'));
 const emergency=JSON.parse(f.local.memory.get('ce:cloud-emergency-backup:'+userId));assert.equal(emergency.snapshot.tasks[0].id,'old-ritual');
 assert.ok(!f.local.memory.has('conselho-elemental-local-progress-mode-v1'));await f.close();
});
