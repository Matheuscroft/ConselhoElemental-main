import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-store.mjs';
const day = new Date(2026, 9, 27, 12);
const xp = s => s.user.xp_earth + s.user.xp_fire + s.user.xp_water + s.user.xp_air;
const add = (store, elementId = 'agua') => store.getState().addHabit({ name: 'Atividade diária', elementId, areaId: 'sem-categoria', plannedPoints: 3, plannedTimeMinutes: 5 });

test('daily completion grants the computed reward once, persists it and undoes the original element', async () => {
  const {store} = fixture(); const h = add(store); const before = xp(store.getState());
  store.getState().completeHabit(h.id, 5, day);
  const receipt = store.getState().habits[0].completions[0];
  assert.ok(xp(store.getState()) > before, 'completion must advance avatar XP');
  assert.equal(receipt.xpAwarded, receipt.executedScore);
  assert.equal(store.getState().user.xp_water, receipt.xpAwarded);
  const earned = xp(store.getState());
  store.getState().completeHabit(h.id, 5, day); assert.equal(xp(store.getState()), earned);
  await store.persist.rehydrate(); assert.equal(xp(store.getState()), earned);
  store.getState().updateHabit(h.id, { elementId: 'fogo', plannedPoints: 99 });
  store.getState().uncompleteHabit(h.id, day); assert.equal(xp(store.getState()), before);
  store.getState().uncompleteHabit(h.id, day); assert.equal(xp(store.getState()), before);
});

test('all four elements and separate days grant independent rewards; quantities remain informational', () => {
  const {store} = fixture();
  for (const element of ['terra','fogo','agua','ar']) {
    const h=add(store,element); const before=xp(store.getState());
    store.getState().completeHabit(h.id,5,day);
    const first=xp(store.getState())-before; assert.ok(first>0);
    store.getState().completeHabit(h.id,5,new Date(2026,9,28,12)); assert.equal(xp(store.getState())-before,2*first);
    store.getState().configureHabitDailyTracking(h.id,{unit:'vezes',target:1,step:1});
    const after=xp(store.getState()); store.getState().recordHabitQuantity(h.id,day); store.getState().recordHabitQuantity(h.id,day);
    assert.equal(xp(store.getState()),after);
  }
});

test('small Water and Air rewards without a timer advance balances even before the next mastery level', async () => {
  const {store} = fixture();
  for (const [elementId, key, points, initial] of [['agua', 'xp_water', 2, 51], ['ar', 'xp_air', 5, 93]]) {
    store.getState().addExperience(initial, elementId);
    const habit = store.getState().addHabit({ name: `Constância de ${elementId}`, elementId, plannedPoints: points, plannedTimeMinutes: 0 });
    const beforeScore = store.getState().getElementScores().find(item => item.elementId === elementId).score;
    const beforeLevel = store.getState().getMasteryProgress()[elementId].level;
    store.getState().completeHabit(habit.id, 0, day);
    const receipt = store.getState().habits.find(item => item.id === habit.id).completions[0];
    assert.equal(receipt.xpAwarded, points);
    assert.equal(receipt.xpElementId, elementId);
    assert.equal(store.getState().user[key], initial + points);
    assert.equal(store.getState().getElementScores().find(item => item.elementId === elementId).score, beforeScore + points);
    assert.equal(store.getState().getMasteryProgress()[elementId].level, beforeLevel);
    await store.persist.rehydrate();
    assert.equal(store.getState().user[key], initial + points);
    store.getState().completeHabit(habit.id, 0, day);
    assert.equal(store.getState().user[key], initial + points);
    store.getState().uncompleteHabit(habit.id, day);
    assert.equal(store.getState().user[key], initial);
  }
});

test('parent cascade rewards each valuable leaf once in its own element and Undo reverses exact receipts', () => {
  const {store}=fixture(); const root=add(store);
  store.getState().addHabitChild(root.id,{name:'Ler',elementId:'ar',plannedPoints:2});
  store.getState().addHabitChild(root.id,{name:'Praticar',elementId:'fogo',plannedPoints:3});
  store.getState().completeHabit(root.id,20,day);
  const current=store.getState().habits[0];
  assert.equal(current.completions[0].xpAwarded,0);
  assert.ok(store.getState().user.xp_air>0); assert.ok(store.getState().user.xp_fire>0); assert.equal(store.getState().user.xp_water,0);
  const total=xp(store.getState());
  for(const child of current.childHabits) store.getState().completeHabitChild(child.id,20,day);
  assert.equal(xp(store.getState()),total);
  store.getState().uncompleteHabit(root.id,day); assert.equal(xp(store.getState()),0);
  store.getState().completeHabit(root.id,20,day); assert.equal(xp(store.getState()),total);
});

test('individual children pay once, parent status pays zero, and partial Undo leaves sibling XP', () => {
  const {store}=fixture(); const root=add(store);
  store.getState().addHabitChild(root.id,{name:'A',elementId:'terra',plannedPoints:2});
  store.getState().addHabitChild(root.id,{name:'B',elementId:'ar',plannedPoints:3});
  const [a,b]=store.getState().habits[0].childHabits;
  store.getState().completeHabitChild(a.id,5,day); const first=xp(store.getState()); assert.ok(first>0);
  store.getState().completeHabitChild(b.id,5,day); const second=xp(store.getState())-first; assert.ok(second>0);
  assert.equal(store.getState().habits[0].completions[0].xpAwarded,0);
  store.getState().uncompleteHabitChild(a.id,day); assert.equal(xp(store.getState()),second);
  store.getState().completeHabitChild(a.id,5,day); assert.equal(xp(store.getState()),first+second);
});

test('legacy completions never backfill or debit unrecorded XP and recompute does not erase paid XP', () => {
  const {store}=fixture(); const h=add(store); store.getState().addExperience(42,'fogo');
  store.getState().updateHabit(h.id,{completions:[{id:'old',habitId:h.id,completionDate:day,timeSpentMinutes:5,scoreEarned:99}]});
  store.getState().recomputeUserProgress(); assert.equal(xp(store.getState()),42);
  store.getState().uncompleteHabit(h.id,day); assert.equal(xp(store.getState()),42);
  store.getState().completeHabit(h.id,5,day); const total=xp(store.getState()); assert.ok(total>42);
  store.getState().recomputeUserProgress(); assert.equal(xp(store.getState()),total);
});

test('notes and structural checks do not manufacture reward; one atomic update contains receipt and XP', () => {
  const {store}=fixture(); const valuable=add(store);
  const transitions=[]; const off=store.subscribe((next,prev)=>{ if(next.habits!==prev.habits) transitions.push(next); });
  store.getState().completeHabit(valuable.id,5,day); off();
  assert.equal(transitions.length,1); assert.ok(xp(transitions[0])>0);
  for(const semanticType of ['NOTE','VALUELESS']) {
    const h=store.getState().addHabit({name:'Organização',semanticType,plannedPoints:5}); const before=xp(store.getState());
    store.getState().completeHabit(h.id,5,day); assert.equal(xp(store.getState()),before);
  }
});
