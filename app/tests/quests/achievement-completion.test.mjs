import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from '../cycles/load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const {achievementPlan}=loadComponent('src/lib/achievement-completion.ts');
function setup(kind='quest',bonus=50) {
  const {store}=fixture();const entity=kind==='quest'?store.getState().addQuest({title:'Conquista',xpBonus:bonus,elementId:'ar'}):store.getState().addProject({title:'Conquista',xpBonus:bonus,elementId:'ar'});
  return {store,entity,plan:()=>achievementPlan(store.getState(),kind,entity.id),finish(completed=true,signature){return store.getState().setAchievementCompleted(kind,entity.id,completed,null,signature??this.plan().signature);}};
}

test('quest and project bonus are atomic, explicit, persistent, idempotent and exactly reversible after edits',async()=>{
  for(const kind of ['quest','project']) {
    const f=setup(kind);f.store.getState().addExperience(12,'terra');
    assert.equal(f.store.getState().user.xp_air,0);
    const signature=f.plan().signature; const states=[];const off=f.store.subscribe(s=>states.push(s));f.finish(true);off();
    assert.equal(states.length,1);assert.equal(states[0].user.xp_air,50);assert.equal(f.plan().entity.status,'completed');
    assert.equal(f.finish(true,signature).changed,false);assert.equal(f.store.getState().user.xp_air,50);
    await f.store.persist.rehydrate();assert.equal(f.store.getState().user.xp_air,50);
    f.store.getState()[kind==='quest'?'updateQuest':'updateProject'](f.entity.id,{xpBonus:900,elementId:'fogo'});
    f.store.getState().recomputeUserProgress();assert.equal(f.store.getState().user.totalScore,50);
    f.finish(false);assert.equal(f.store.getState().user.xp_air,0);assert.equal(f.store.getState().user.xp_earth,12);assert.equal(f.store.getState().user.totalScore,0);
    assert.equal(f.plan().entity.completionBonus,undefined);assert.equal(f.finish(false).changed,false);
  }
});

test('canonical task and nested subitem completion gate bonus; copied refs cannot unlock it',()=>{
  const f=setup();f.store.getState().addTaskToQuest(f.entity.id,{title:'Ritual'});
  const t=f.store.getState().tasks[0];assert.equal(f.plan().canComplete,false);assert.throws(()=>f.finish());
  f.store.getState().addTaskItem(t.id,{title:'Uma etapa',baseValue:10});f.store.getState().addTaskItem(t.id,{title:'Outra etapa',baseValue:10});
  const a=f.store.getState().tasks[0].childItems[0];f.store.getState().completeTaskItem(t.id,a.id);f.store.getState().completeTask(t.id);
  assert.equal(f.store.getState().tasks[0].isCompleted,true);assert.equal(f.plan().trail.done,0);assert.equal(f.plan().canComplete,false);assert.throws(()=>f.finish());
  f.store.getState().completeTaskItem(t.id,f.store.getState().tasks[0].childItems[1].id);
  const xp=f.store.getState().user.xp_air;assert.equal(f.plan().canComplete,true);f.finish();assert.equal(f.store.getState().user.xp_air,xp+50);
  f.finish(false);assert.equal(f.store.getState().user.xp_air,xp);assert.equal(f.store.getState().tasks[0].isCompleted,true);
});

test('project chapters and linked quests use real activities; recurring habits remain untouched',()=>{
  const f=setup('project',100);const s=()=>f.store.getState();
  s().addMissionToProject(f.entity.id,{title:'Capítulo'});const m=s().projects[0].missions[0];s().addTaskToMission(f.entity.id,m.id,{title:'Etapa'});
  const q=s().addQuest({title:'Ligada',xpBonus:25});s().addTaskToQuest(q.id,{title:'Outra'});s().addHabitToQuest(q.id,{name:'Rotina'});
  s().updateProject(f.entity.id,{quests:[s().quests[0]]});assert.equal(f.plan().pending.length,2);
  for(const t of s().tasks)s().completeTask(t.id,2);
  const habits=JSON.stringify(s().habits),quests=JSON.stringify(s().quests);const xp=s().user.xp_air;
  f.finish();assert.equal(s().user.xp_air,xp+100);assert.equal(JSON.stringify(s().habits),habits);assert.equal(JSON.stringify(s().quests),quests);
  f.finish(false);assert.equal(JSON.stringify(s().habits),habits);
});

test('stale account or preview, deleted task, archived project and malformed bonus cannot pay',()=>{
  const f=setup();const old=f.plan().signature;
  f.store.getState().updateQuest(f.entity.id,{xpBonus:75});assert.throws(()=>f.finish(true,old));
  assert.throws(()=>f.store.getState().setAchievementCompleted('quest',f.entity.id,true,'another',f.plan().signature));
  f.store.getState().addTaskToQuest(f.entity.id,{title:'Deleted'});f.store.getState().deleteTask(f.store.getState().tasks[0].id);assert.equal(f.plan().canComplete,false);assert.throws(()=>f.finish());
  const archived=setup('project');archived.store.getState().updateProject(archived.entity.id,{status:'archived'});assert.throws(()=>archived.finish());
  for(const amount of [-1,Infinity,NaN]) {const bad=setup();bad.store.getState().updateQuest(bad.entity.id,{xpBonus:amount});assert.throws(()=>bad.finish());assert.equal(bad.store.getState().user.xp_air,0);}
});

test('legacy completions never infer paid XP and zero-bonus manual milestones remain possible',()=>{
  const f=setup();f.store.getState().addExperience(200,'ar');f.store.getState().updateQuest(f.entity.id,{isCompleted:true,status:'completed'});
  f.store.getState().recomputeUserProgress();f.finish(false);assert.equal(f.store.getState().user.xp_air,200);assert.equal(f.store.getState().user.totalScore,0);
  const zero=setup('project',0);zero.finish();assert.equal(zero.plan().entity.completionBonus.amount,0);assert.equal(zero.store.getState().user.xp_air,0);zero.finish(false);
});
