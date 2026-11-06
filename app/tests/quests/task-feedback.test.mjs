import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { fixture } from '../cycles/load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const require = createRequire(import.meta.url);


function renderFeedback(store) {
  let index=0, previous, effect, tree;
  const slots=[], timers=new Map(); let timerId=0;
  const hooks={
    useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},
    useEffect(fn,deps){effect={fn,deps};},
  };
  const output=ts.transpileModule(readFileSync('src/components/rewards/TaskCompletionFeedback.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mod={exports:{}};
  new Function('require','module','exports','setTimeout','clearTimeout',output)(id=>{
    if(id==='react')return hooks;
    if(id==='@/stores/appStore')return {useAppStore:store};
    if(id==='./RewardNotice')return {RewardNotice:'Notice'};
    if(id==='./task-reward-events')return loadComponent('src/components/rewards/task-reward-events.ts');
    if(id==='@/services/leveling-calculator')return loadComponent('src/services/leveling-calculator.ts');
    return require(id);
  },mod,mod.exports,fn=>{timers.set(++timerId,fn);return timerId;},id=>timers.delete(id));
  function render(){ index=0;tree=mod.exports.TaskCompletionFeedback();
    if(!previous||effect.deps.some((d,i)=>d!==previous.deps[i])){previous?.cleanup?.();previous={...effect,cleanup:effect.fn()};}
  }
  render();return {render,receipt:()=>tree.props.children?.props, timers,
    expire(){for(const fn of [...timers.values()])fn();render();},unmount(){previous?.cleanup?.();}};
}


test('ritual list observes actual leaf rewards, batches, reverses and resets on dismissal/account change',()=>{
  const {store}=fixture();const a=store.getState().addTask({title:'A',baseValue:10});const b=store.getState().addTask({title:'B',baseValue:20});
  const f=renderFeedback(store);assert.equal(f.receipt(),undefined);
  store.getState().completeTask(a.id,5);f.render();const first=f.receipt().xp;assert.ok(first>0);
  store.getState().completeTask(b.id,5);f.render();assert.ok(f.receipt().xp>first);assert.equal(f.receipt().title,'2 etapas registradas');
  store.getState().uncompleteTask(a.id);f.render();assert.equal(f.receipt().xp,store.getState().tasks.find(t=>t.id===b.id).completionXp.amount);
  store.getState().uncompleteTask(b.id);f.render();assert.equal(f.receipt(),undefined);
  store.getState().completeTask(a.id,5);f.render();f.receipt().onDismiss();f.render();assert.equal(f.receipt(),undefined);
  store.getState().completeTask(b.id,5);f.render();assert.equal(f.receipt().title,'Ritual registrado');
  store.setState({currentAccountId:'other'});f.render();assert.equal(f.receipt(),undefined);f.unmount();assert.equal(f.timers.size,0);
});

test('ritual history, hydration, legacy changes and native rewards never replay; expiry writes no XP',async()=>{
  const {store}=fixture();const a=store.getState().addTask({title:'A'});store.getState().completeTask(a.id,5);
  const f=renderFeedback(store);assert.equal(f.receipt(),undefined);
  const b=store.getState().addTask({title:'B'});store.getState().completeTask(b.id,5);f.render();assert.ok(f.receipt());
  const xp=store.getState().getLevelProgress().xpTotal;await store.persist.rehydrate();f.render();assert.equal(f.receipt(),undefined);assert.equal(store.getState().getLevelProgress().xpTotal,xp);
  const legacy=store.getState().addTask({title:'Old'});store.getState().updateTask(legacy.id,{isCompleted:true});f.render();assert.equal(f.receipt(),undefined);
  const native=store.getState().addTask({title:'Native'});store.getState().updateTask(native.id,{sourceModule:'modulo_treino'});store.getState().updateTask(native.id,{isCompleted:true,completionXp:{amount:90,elementId:'terra',ruleset:'ritual-leaf-xp-v1'}});f.render();assert.equal(f.receipt(),undefined);
  const c=store.getState().addTask({title:'C'});store.getState().completeTask(c.id,5);f.render();assert.ok(f.receipt());
  const earned=store.getState().getLevelProgress().xpTotal;f.expire();assert.equal(f.receipt(),undefined);assert.equal(store.getState().getLevelProgress().xpTotal,earned);f.unmount();
});

test('task cascade displays paid leaves only, with no parent double count',()=>{
  const {store}=fixture();const t=store.getState().addTask({title:'Parent'});store.getState().addTaskItem(t.id,{title:'First',baseValue:10});store.getState().addTaskItem(t.id,{title:'Second',baseValue:20});
  const f=renderFeedback(store);store.getState().completeTask(t.id);f.render();assert.equal(f.receipt().title,'2 etapas registradas');
  assert.equal(f.receipt().xp,store.getState().getLevelProgress().xpTotal);
  store.getState().uncompleteTask(t.id);f.render();assert.equal(f.receipt(),undefined);f.unmount();
});
