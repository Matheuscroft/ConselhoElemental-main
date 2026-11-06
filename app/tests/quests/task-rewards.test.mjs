import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from '../cycles/load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';

const xp = s => ['xp_earth','xp_fire','xp_water','xp_air'].reduce((sum,k)=>sum+s.user[k],0);
const root = store => store.getState().addTask({title:'Praticar',elementId:'agua',baseValue:10});
const task = (store,id) => store.getState().tasks.find(t=>t.id===id);
function child(store,id,baseValue=10,parentId=null) {
  store.getState().addTaskItem(id,{title:'Etapa',baseValue},parentId);
  const items=parentId ? task(store,id).childItems.find(i=>i.id===parentId).childItems : task(store,id).childItems;
  return items.at(-1).id;
}

test('ritual keeps existing XP ratio, persists payment and undoes original reward after edits', async () => {
  const {store}=fixture(); const t=root(store);
  store.getState().addExperience(40,'terra');
  const transitions=[];const off=store.subscribe((next,prev)=>{if(next.tasks!==prev.tasks)transitions.push(next);});
  const score=store.getState().completeTask(t.id,10);off();
  const amount=Math.round(score/2); assert.ok(amount>0);
  assert.equal(transitions.length,1); assert.equal(transitions[0].user.xp_water,amount);
  assert.equal(task(store,t.id).completionXp.amount,amount);
  store.getState().completeTask(t.id,50); assert.equal(xp(store.getState()),40+amount);
  await store.persist.rehydrate(); assert.equal(xp(store.getState()),40+amount);
  store.getState().updateTask(t.id,{elementId:'fogo',baseValue:999});
  store.getState().uncompleteTask(t.id);store.getState().uncompleteTask(t.id);
  assert.equal(xp(store.getState()),40);assert.equal(store.getState().user.xp_earth,40);
  assert.equal(task(store,t.id).completionXp,undefined);
});

test('individual leaf payment survives partial parent close/reopen without duplicated XP', () => {
  const {store}=fixture();const t=root(store);const a=child(store,t.id);child(store,t.id,20);
  store.getState().updateTaskItem(t.id,a,{elementId:'ar'});
  store.getState().completeTaskItem(t.id,a); const earned=xp(store.getState());assert.ok(earned>0);
  assert.equal(store.getState().user.xp_air,earned);
  store.getState().completeTaskItem(t.id,a);assert.equal(xp(store.getState()),earned);
  store.getState().completeTask(t.id);assert.equal(xp(store.getState()),earned);
  assert.equal(task(store,t.id).completionXp.amount,0);
  store.getState().uncompleteTask(t.id);assert.equal(xp(store.getState()),earned);
  store.getState().updateTaskItem(t.id,a,{elementId:'fogo',baseValue:999});
  store.getState().uncompleteTaskItem(t.id,a);assert.equal(xp(store.getState()),0);
});

test('nested parent cascade pays each leaf once and reverses its snapshots', () => {
  const {store}=fixture();const t=root(store);const branch=child(store,t.id);child(store,t.id,10,branch);child(store,t.id,20,branch);
  store.getState().completeTask(t.id);
  const current=task(store,t.id);const leaves=current.childItems[0].childItems;
  const expected=leaves.reduce((sum,i)=>sum+i.completionXp.amount,0);
  assert.ok(expected>0);assert.equal(xp(store.getState()),expected);
  assert.equal(current.completionXp.amount,0);assert.equal(current.childItems[0].completionXp.amount,0);
  store.getState().completeTaskItem(t.id,branch);assert.equal(xp(store.getState()),expected);
  store.getState().uncompleteTask(t.id);assert.equal(xp(store.getState()),0);
  store.getState().completeTask(t.id);assert.equal(xp(store.getState()),expected);
});

test('notes, structural items, legacy completions and native adapter do not receive inferred XP', () => {
  const {store}=fixture();const t=root(store);
  for(const semanticType of ['NOTE','VALUELESS','text','structural']) {
    const id=child(store,t.id);store.getState().updateTaskItem(t.id,id,{semanticType});
    store.getState().completeTaskItem(t.id,id);assert.equal(xp(store.getState()),0);
  }
  const legacy=root(store);store.getState().addExperience(23,'fogo');
  store.getState().updateTask(legacy.id,{isCompleted:true,completedScore:100});
  store.getState().uncompleteTask(legacy.id);assert.equal(xp(store.getState()),23);
  const {withTaskXpUpdate}=loadComponent('src/lib/task-rewards.ts');
  const before={...legacy,sourceModule:'modulo_treino',childItems:[]};
  const update={tasks:[{...before,isCompleted:true,completedScore:100}],user:{...store.getState().user,xp_earth:50}};
  const result=withTaskXpUpdate({tasks:[before],user:store.getState().user},update);
  assert.equal(result.user.xp_earth,50);assert.equal(result.tasks[0].completionXp,undefined);
});
