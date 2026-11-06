import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { fixture } from './load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const require = createRequire(import.meta.url);
const date = new Date(2026,9,27,12);

function renderFeedback(store) {
  let index=0, previous, effect, tree;
  const slots=[], timers=new Map(); let timerId=0;
  const hooks={
    useState(initial){const i=index++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>{slots[i]=typeof value==='function'?value(slots[i]):value;}];},
    useEffect(fn,deps){effect={fn,deps};},
  };
  const output=ts.transpileModule(readFileSync('src/components/cycles/CycleCompletionFeedback.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mod={exports:{}};
  new Function('require','module','exports','setTimeout','clearTimeout',output)(id=>{
    if(id==='react')return hooks;
    if(id==='@/stores/appStore')return {useAppStore:store};
    if(id==='./CycleRewardNotice')return {CycleRewardNotice:'Notice'};
    if(id==='./completion-event')return loadComponent('src/components/cycles/completion-event.ts');
    if(id==='@/services/leveling-calculator')return loadComponent('src/services/leveling-calculator.ts');
    return require(id);
  },mod,mod.exports,fn=>{timers.set(++timerId,fn);return timerId;},id=>timers.delete(id));
  function render(){ index=0;tree=mod.exports.CycleCompletionFeedback({date});
    if(!previous||effect.deps.some((d,i)=>d!==previous.deps[i])){previous?.cleanup?.();previous={...effect,cleanup:effect.fn()};}
  }
  render();return {render,receipt:()=>tree.props.children?.props, timers,
    expire(){for(const fn of [...timers.values()])fn();render();},unmount(){previous?.cleanup?.();}};
}

test('feedback consumes real XP once, dismiss resets the burst, Undo removes it and account changes clear it', () => {
  const {store}=fixture();const a=store.getState().addHabit({name:'A',plannedPoints:2});const b=store.getState().addHabit({name:'B',plannedPoints:3});
  const f=renderFeedback(store);assert.equal(f.receipt(),undefined);
  store.getState().completeHabit(a.id,5,date);f.render();assert.ok(f.receipt().events[0].xp>0);
  f.receipt().onDismiss();f.render();assert.equal(f.receipt(),undefined);
  store.getState().completeHabit(b.id,5,date);f.render();assert.equal(f.receipt().events.length,1);assert.equal(f.receipt().events[0].name,'B');
  store.getState().uncompleteHabit(b.id,date);f.render();assert.equal(f.receipt(),undefined);
  store.getState().completeHabit(b.id,5,date);f.render();assert.ok(f.receipt());
  store.setState({currentAccountId:'other-isolated-account'});f.render();assert.equal(f.receipt(),undefined);
  f.unmount();assert.equal(f.timers.size,0);
});

test('hydration, opening history and expiry never replay rewards or change XP', async () => {
  const {store}=fixture();const a=store.getState().addHabit({name:'A'});store.getState().completeHabit(a.id,1,date);
  const f=renderFeedback(store);assert.equal(f.receipt(),undefined);
  const b=store.getState().addHabit({name:'B'});store.getState().completeHabit(b.id,1,date);f.render();assert.ok(f.receipt());
  const xp=store.getState().getLevelProgress().xpTotal;
  await store.persist.rehydrate();f.render();assert.equal(f.receipt(),undefined);assert.equal(store.getState().getLevelProgress().xpTotal,xp);
  const c=store.getState().addHabit({name:'C'});store.getState().completeHabit(c.id,1,date);f.render();assert.ok(f.receipt());
  const earned=store.getState().getLevelProgress().xpTotal;f.expire();assert.equal(f.receipt(),undefined);assert.equal(store.getState().getLevelProgress().xpTotal,earned);
  f.unmount();
});
