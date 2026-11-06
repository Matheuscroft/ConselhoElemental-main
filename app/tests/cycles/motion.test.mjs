import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
import { fixture } from './load-store.mjs';
const { cycleCompletionEvents, reconcileCompletionBurst } = loadComponent('src/components/cycles/completion-event.ts');
const { CycleDailyCounter } = loadComponent('src/components/cycles/CycleDailyCounter.tsx');
const { subscribeMotionPreference, readMotionPreference } = loadComponent('src/components/motion/useMotionPreference.ts');
const day = new Date(2026,9,25,12);

test('rapid completions aggregate real receipts once, and Undo removes only reversed events', () => {
  const { store } = fixture();
  const a = store.getState().addHabit({name:'A'});
  const b = store.getState().addHabit({name:'B'});
  const initial = store.getState().habits;
  store.getState().completeHabit(a.id,1,day);
  const first = store.getState().habits;
  const eventsA = cycleCompletionEvents(initial,first,day);
  store.getState().completeHabit(b.id,1,day);
  const second = store.getState().habits;
  const eventsB = cycleCompletionEvents(first,second,day);
  const before = JSON.stringify(store.getState().user);
  const combined = reconcileCompletionBurst(eventsA,eventsB,second,day);
  assert.equal(combined.length,2);
  assert.equal(reconcileCompletionBurst(combined,eventsB,second,day).length,2);
  assert.equal(JSON.stringify(store.getState().user),before);
  store.getState().uncompleteHabit(a.id,day);
  const remainder = reconcileCompletionBurst(combined,[],store.getState().habits,day);
  assert.equal(remainder.length,1); assert.equal(remainder[0].name,'B');
  store.getState().uncompleteHabit(b.id,day);
  assert.deepEqual(reconcileCompletionBurst(remainder,[],store.getState().habits,day),[]);
});

test('presentation ignores old-day receipts and does not replay completion for quantity increments', () => {
  const {store}=fixture(); const habit=store.getState().addHabit({name:'Estudar'});
  const initial=store.getState().habits;
  store.getState().completeHabit(habit.id,1,day);
  assert.deepEqual(cycleCompletionEvents(initial,store.getState().habits,new Date(2026,9,26)),[]);
  store.getState().configureHabitDailyTracking(habit.id,{unit:'páginas',step:1,target:3});
  const completed=store.getState().habits;
  store.getState().recordHabitQuantity(habit.id,day);
  assert.deepEqual(cycleCompletionEvents(completed,store.getState().habits,day),[]);
});

test('motion preference responds to OS changes and removes its listener', () => {
  const previous=globalThis.window;
  const media=new EventTarget();media.matches=false;
  globalThis.window={matchMedia(query){assert.equal(query,'(prefers-reduced-motion: reduce)');return media;}};
  try {
    let notifications=0; const cleanup=subscribeMotionPreference(()=>notifications++);
    assert.equal(readMotionPreference(),false);
    media.matches=true;media.dispatchEvent(new Event('change'));
    assert.equal(notifications,1);assert.equal(readMotionPreference(),true);
    cleanup();media.matches=false;media.dispatchEvent(new Event('change'));
    assert.equal(notifications,1);
  } finally { if(previous===undefined)delete globalThis.window;else globalThis.window=previous; }
});

test('counter exposes actual quantity beyond goal while its visual fill stays capped', () => {
  const {store}=fixture();const habit=store.getState().addHabit({name:'Ler'});
  store.getState().configureHabitDailyTracking(habit.id,{unit:'páginas',step:2,target:3});
  store.getState().recordHabitQuantity(habit.id,day);store.getState().recordHabitQuantity(habit.id,day);
  const html=renderToStaticMarkup(React.createElement(CycleDailyCounter,{habit:store.getState().habits[0],date:day,onConfigure(){},onRecord(){},onRemove(){}}));
  assert.match(html,/scaleX\(1\)/);assert.match(html,/4 de 3 páginas/);
  assert.match(html,/Somar 2 páginas a Ler/);assert.match(html,/Meta atingida/);
});
