import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {fixture} from './load-store.mjs';
import {loadComponent} from '../elemental/load-component.mjs';
const {ScoreHierarchyPanel}=loadComponent('src/components/cards/ScoreHierarchyPanel.tsx');
const {AREAS}=loadComponent('src/constants/index.ts');
function render(store,presentation='explorer') {
  const state=store.getState();
  return renderToStaticMarkup(React.createElement(ScoreHierarchyPanel,{presentation,tasks:state.tasks,habits:state.habits,customAreas:state.customAreas,customSubareas:state.customSubareas}));
}
function scores(store) {
  return [...render(store).matchAll(/class="element-score-title"[\s\S]*?<strong>([^<]+) <small>pontos/g)].map(m=>Number(m[1]));
}
const day=new Date(2026,10,7,12);
const add=(store,elementId,plannedPoints,semanticType='VALUABLE')=>store.getState().addHabit({name:'Atividade de teste',elementId,areaId:AREAS.find(a=>a.elementId===elementId).id,plannedPoints,plannedTimeMinutes:0,semanticType});

test('Sua evolução includes existing uppercase Water/Air completions, persists them and reverses only undone points',async()=>{
  const {store}=fixture(),water=add(store,'agua',2),air=add(store,'ar',5);
  assert.deepEqual(scores(store),[0,0,0,0]);
  store.getState().completeHabit(water.id,0,day);store.getState().completeHabit(air.id,0,day);
  assert.deepEqual(scores(store),[0,0,2,5]);
  assert.deepEqual(scores(store),store.getState().getElementScores().map(s=>s.score));
  assert.match(render(store),/class="element-score-total"><strong>7<\/strong>/);
  for(const view of ['default','showcase'])assert.match(render(store,view),/Total 7 pts/);
  await store.persist.rehydrate();assert.deepEqual(scores(store),[0,0,2,5]);
  store.getState().completeHabit(water.id,0,day);assert.deepEqual(scores(store),[0,0,2,5]);
  store.getState().uncompleteHabit(air.id,day);assert.deepEqual(scores(store),[0,0,2,0]);
});

test('legacy lowercase and absent semantic types stay compatible; structural and note nodes stay zero',()=>{
  const {store}=fixture();
  for(const semanticType of ['valuable',undefined]){
    const h=add(store,'agua',2);store.getState().updateHabit(h.id,{semanticType});store.getState().completeHabit(h.id,0,day);
  }
  for(const semanticType of ['VALUELESS','NOTE','structural','text']){
    const h=add(store,'agua',99,semanticType);store.getState().completeHabit(h.id,0,day);
  }
  assert.deepEqual(scores(store),[0,0,4,0]);
});

test('completed uppercase leaves roll into the panel without double-counting the aggregate parent',()=>{
  const {store}=fixture(),root=add(store,'fogo',99);
  for(const elementId of ['agua','ar'])store.getState().addHabitChild(root.id,{name:'Subitem de teste',elementId,areaId:AREAS.find(a=>a.elementId===elementId).id,plannedPoints:2});
  store.getState().completeHabit(root.id,0,day);
  assert.deepEqual(scores(store),[0,0,2,2]);
  assert.deepEqual(scores(store),store.getState().getElementScores().map(s=>s.score));
});
