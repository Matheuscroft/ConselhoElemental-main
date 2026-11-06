import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { fixture as storeFixture } from '../cycles/load-store.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const require=createRequire(import.meta.url);
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
function fixture() {
  const {store}=storeFixture();const q=store.getState().addQuest({title:'Meta',xpBonus:50,elementId:'ar'});
  const slots=[],refs=[];let si=0,ri=0,tree;
  const react={useMemo:fn=>fn(),useEffect:fn=>fn(),useRef:v=>refs[ri++]??={current:v},useState:v=>{const i=si++;if(!(i in slots))slots[i]=v;return [slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];}};
  const mod={exports:{}};
  const output=ts.transpileModule(readFileSync('src/components/quests/AchievementCompletion.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  new Function('require','module','exports',output)(id=>id==='react'?react:id==='zustand/react/shallow'?{useShallow:fn=>fn}:id==='react/jsx-runtime'?require(id):id==='@/stores/appStore'?{useAppStore:fn=>fn?fn(store.getState()):store.getState()}:id==='@/lib/achievement-completion'?loadComponent('src/lib/achievement-completion.ts'):id==='./quest-path'?loadComponent('src/lib/quest-trails.ts'):new Proxy({},{get:(_,key)=>key}),mod,mod.exports);
  const Component=mod.exports.AchievementCompletion({kind:'quest',id:q.id}).type;
  function render(){si=ri=0;tree=Component({kind:'quest',id:q.id});}
  render();
  return {store,q,render,button:label=>flatten(tree).find(n=>n.type==='button'&&text(n.props.children)===label)?.props,
    role:role=>flatten(tree).find(n=>n.props?.role===role)?.props,
  };
}
test('achievement UI requires review, guards double tap, reports actual XP and reverses only the bonus',()=>{
  const f=fixture();assert.equal(f.role('status'),undefined);assert.equal(f.store.getState().user.xp_air,0);
  assert.equal(f.button('Confirmar conclusão'),undefined);
  f.button('Concluir Jornada').onClick();f.render();const confirm=f.button('Confirmar conclusão').onClick;confirm();confirm();f.render();
  assert.equal(f.store.getState().user.xp_air,50);assert.match(text(f.role('status').children),/Jornada concluída/);
  f.button('Reabrir Jornada').onClick();f.render();f.button('Confirmar reabertura').onClick();f.render();
  assert.equal(f.store.getState().user.xp_air,0);assert.match(text(f.role('status').children),/Jornada reaberta/);
});
test('changed preview requires another review and command errors do not report success',()=>{
  const f=fixture();f.button('Concluir Jornada').onClick();f.render();
  f.store.getState().updateQuest(f.q.id,{xpBonus:75});f.render();assert.equal(f.button('Confirmar conclusão'),undefined);
  f.button('Concluir Jornada').onClick();f.render();
  f.store.setState({setAchievementCompleted(){throw new Error('Falha de gravação');}});f.render();
  f.button('Confirmar conclusão').onClick();f.render();
  assert.match(text(f.role('alert').children),/Falha de gravação/);assert.equal(f.role('status'),undefined);assert.equal(f.store.getState().user.xp_air,0);
  f.button('Cancelar').onClick();f.render();assert.ok(f.button('Concluir Jornada'));
});
