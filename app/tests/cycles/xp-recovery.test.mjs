import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const {planCycleXpRecovery}=loadComponent('src/lib/cycles/xp-recovery.ts');
const day=new Date(2026,9,25,12);
function setup() {
  const f=fixture();const habit=f.store.getState().addHabit({name:'Concluído antes',elementId:'agua',plannedPoints:100});
  f.store.getState().updateHabit(habit.id,{completions:[{id:'legacy',habitId:habit.id,completionDate:day,timeSpentMinutes:5,scoreEarned:7,executedScore:7,formulaVersion:'habit-v1'}]});
  return {...f,habit,plan:()=>planCycleXpRecovery(f.store.getState().habits)};
}

test('retroactive credit uses recorded value, backs up before mutation and cannot pay twice or on reload', async () => {
  const f=setup();f.store.getState().addExperience(50,'terra');
  const result=f.store.getState().recoverCycleXp(null,f.plan().signature);
  assert.equal(result.plan.total,7);assert.equal(f.store.getState().user.xp_water,7);assert.equal(f.store.getState().user.xp_earth,50);
  const snapshot=JSON.parse(f.memory.get(result.backupKey));assert.equal(snapshot.user.xp_water,0);assert.equal(snapshot.habits[0].completions[0].xpAwarded,undefined);
  assert.equal(f.store.getState().habits[0].completions[0].xpRuleset,'cycle-xp-recovery-v1');
  const count=f.memory.size;const second=f.store.getState().recoverCycleXp(null,f.plan().signature);assert.equal(second.plan.total,0);assert.equal(second.backupKey,null);assert.equal(f.memory.size,count);
  await f.store.persist.rehydrate();assert.equal(f.plan().total,0);assert.equal(f.store.getState().user.xp_water,7);
  f.store.getState().updateHabit(f.habit.id,{elementId:'fogo'});f.store.getState().uncompleteHabit(f.habit.id,day);
  assert.equal(f.store.getState().user.xp_water,0);assert.equal(f.store.getState().user.xp_earth,50);
});

test('backup failure and stale account/preview block credit before mutation', () => {
  const f=setup();const before=JSON.stringify(f.store.getState().user);
  assert.throws(()=>f.store.getState().recoverCycleXp('wrong',f.plan().signature));
  assert.throws(()=>f.store.getState().recoverCycleXp(null,'stale'));
  const original=f.memory.set.bind(f.memory);f.memory.set=(key,value)=>{if(key.startsWith('conselho-cycle-xp-backup:'))throw Error('quota');return original(key,value);};
  assert.throws(()=>f.store.getState().recoverCycleXp(null,f.plan().signature));
  assert.equal(JSON.stringify(f.store.getState().user),before);assert.equal(f.plan().total,7);
});

test('native, already paid, zero, malformed and conflicting receipts cannot create retroactive awards', () => {
  const f=setup();const old=f.store.getState().habits[0].completions[0];
  f.store.getState().updateHabit(f.habit.id,{completions:[
    {...old,id:'paid',xpAwarded:7}, {...old,id:'zero',executedScore:0,scoreEarned:0},
    {...old,id:'nan',executedScore:NaN}, {...old,id:'unknown',formulaVersion:undefined},
    {...old,id:'conflict',executedScore:10}, {...old,id:'bad-date',completionDate:'bad'},
    {...old,id:'duplicate'}, {...old,id:'duplicate'},
  ]});
  assert.equal(f.plan().total,0);assert.equal(f.plan().unresolved,7);
  f.store.getState().updateHabit(f.habit.id,{completions:[old],sourceModule:'modulo_treino'});
  assert.equal(f.plan().total,0);assert.equal(f.plan().unresolved,0);
});

test('recovery updates existing receipts without producing a new completion celebration', () => {
  const {cycleCompletionEvents}=loadComponent('src/components/cycles/completion-event.ts');
  const f=setup();const before=f.store.getState().habits;f.store.getState().recoverCycleXp(null,f.plan().signature);
  assert.deepEqual(cycleCompletionEvents(before,f.store.getState().habits,day),[]);
  assert.equal(before[0].completions[0].xpAwarded,undefined);
  assert.equal(f.store.getState().habits[0].completions.length,1);
});
