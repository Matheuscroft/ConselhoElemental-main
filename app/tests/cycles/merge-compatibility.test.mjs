import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './load-store.mjs';
const day=new Date(2026,10,5,12);
const xp=s=>s.user.xp_earth+s.user.xp_fire+s.user.xp_water+s.user.xp_air;

test('remote child area validation coexists with local daily counters, XP receipts and reload',async()=>{
 const {store}=fixture(),state=()=>store.getState();
 const area=state().addCustomArea('Área sintética','ar'),sub=state().addCustomSubarea(area.id,'Subárea sintética','ar','#aabbcc');
 const root=state().addHabit({name:'Atividade sintética',areaId:area.id,subareaId:sub.id,elementId:'ar',plannedPoints:2,plannedTimeMinutes:1});
 state().addHabitChild(root.id,{name:'Etapa sintética',plannedPoints:2,plannedTimeMinutes:1});
 const child=()=>state().habits.find(h=>h.id===root.id).childHabits[0];
 assert.equal(child().areaId,area.id);assert.equal(child().subareaId,sub.id);assert.equal(child().elementId,'ar');
 state().updateHabitChild(child().id,{areaId:'area-nutricao',subareaId:sub.id});
 assert.equal(child().subareaId,null);assert.equal(child().subareaPrimaryId,null);assert.equal(child().elementId,'terra');
 state().configureHabitDailyTracking(root.id,{unit:'ações',target:2,step:1});const before=xp(state());
 state().recordHabitQuantity(root.id,day);state().recordHabitQuantity(root.id,day);assert.equal(xp(state()),before);
 state().completeHabitChild(child().id,1,day);assert.ok(xp(state())>before);const earned=xp(state());
 state().completeHabitChild(child().id,1,day);assert.equal(xp(state()),earned);
 await store.persist.rehydrate();assert.equal(xp(state()),earned);assert.equal(child().subareaId,null);
 state().uncompleteHabitChild(child().id,day);assert.equal(xp(state()),before);
});

test('pure notes and empty structural children do not add phantom area points or time to their parent',()=>{
 const {store}=fixture(),state=()=>store.getState();const root=state().addHabit({name:'Grupo sintético',areaId:'area-nutricao',plannedPoints:4,plannedTimeMinutes:5});
 state().addHabitChild(root.id,{name:'Nota sintética',areaId:'area-nutricao',plannedPoints:3,plannedTimeMinutes:8});
 const id=state().habits[0].childHabits[0].id;state().updateHabitChild(id,{semanticType:'NOTE'});
 const parent=state().habits.find(h=>h.id===root.id),note=parent.childHabits[0];
 assert.equal(note.plannedPoints,0);assert.equal(note.plannedTimeMinutes,0);assert.equal(note.areaId,'sem-categoria');assert.equal(note.subareaId,null);
 assert.equal(parent.plannedPoints,0);assert.equal(parent.plannedTimeMinutes,0);assert.equal(parent.areaId,'sem-categoria');
 assert.ok(note.semanticValueBackup.plannedPoints>0);
});
