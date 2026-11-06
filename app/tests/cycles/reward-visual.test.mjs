import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
import { fixture } from './load-store.mjs';
const {cycleCompletionEvents,reconcileCompletionBurst}=loadComponent('src/components/cycles/completion-event.ts');
const {CycleRewardNotice}=loadComponent('src/components/cycles/CycleRewardNotice.tsx');
const day=new Date(2026,9,27,12);

test('receipt displays saved XP, correct element and level milestone from real calculator', () => {
  const {store}=fixture();store.getState().addExperience(99,'terra');
  const h=store.getState().addHabit({name:'Meu ritual diário',elementId:'agua',plannedPoints:3});
  const before=store.getState().habits;const fromLevel=store.getState().getLevelProgress().level;
  store.getState().completeHabit(h.id,5,day);
  const events=cycleCompletionEvents(before,store.getState().habits,day);
  const progress=store.getState().getLevelProgress(); assert.ok(progress.level>fromLevel);
  const html=renderToStaticMarkup(React.createElement(CycleRewardNotice,{events,progress,fromLevel,onDismiss(){}}));
  assert.match(html,/Você chegou ao nível 2!/);assert.match(html,/Água/);assert.match(html,/XP/);
  assert.match(html,/role="progressbar"/);assert.match(html,/Fechar recompensa/);
  assert.equal(events[0].xp,store.getState().habits[0].completions[0].xpAwarded);
  store.getState().uncompleteHabit(h.id,day);assert.deepEqual(reconcileCompletionBurst(events,[],store.getState().habits,day),[]);
});

test('an unpaid receipt does not invent XP from points and reduced milestone is not announced', () => {
  const html=renderToStaticMarkup(React.createElement(CycleRewardNotice,{
    events:[{id:'old',name:'Organizar',points:100,xp:0}],fromLevel:1,
    progress:{level:1,xpTotal:0,xpAtLevelStart:0,xpToNextLevel:100,progressFraction:0},onDismiss(){},
  }));
  assert.match(html,/Conclusão registrada/);assert.doesNotMatch(html,/\+100 XP|Você chegou/);
});
