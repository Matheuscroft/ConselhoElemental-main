import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
function fixture() {
  const slots=[],refs=[];let si=0,ri=0,tree,fail=false,calls=0;
  let plan={entries:[{}],total:7,byElement:{terra:0,fogo:0,agua:7,ar:0},unresolved:0,signature:'first'};
  const state={currentAccountId:null,habits:[],recoverCycleXp(){calls++;if(fail)throw Error('failure');return {plan,backupKey:'snapshot'};}};
  const react={useMemo:fn=>fn(),useRef:v=>refs[ri++]??={current:v},useState:v=>{const i=si++;if(!(i in slots))slots[i]=v;return [slots[i],next=>slots[i]=typeof next==='function'?next(slots[i]):next];}};
  const module={exports:{}};
  const output=ts.transpileModule(readFileSync('src/components/cycles/CycleXpRecovery.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  new Function('require','module','exports',output)(id=>id==='react'?react:id==='react/jsx-runtime'?require(id):id==='@/stores/appStore'?{useAppStore:fn=>fn(state)}:id.includes('xp-recovery')?{planCycleXpRecovery:()=>plan}:{ArcaneIcon:'Icon',ElementIcon:'Icon'},module,module.exports);
  const Component=module.exports.CycleXpRecovery().type;
  function render(){si=ri=0;tree=Component({accountId:null});}
  render();
  return {render,get calls(){return calls;},fail(v){fail=v;},change(){plan={...plan,total:9,signature:'changed'};render();},
    find:fn=>flatten(tree).find(fn)?.props,
    button:label=>flatten(tree).find(n=>n.type==='button'&&text(n.props.children)===label)?.props,
    confirm(){flatten(tree).find(n=>n.type==='input').props.onChange({target:{checked:true}});render();},
  };
}
test('recovery preview never writes on mount, requires confirmation, invalidates changed preview and guards double tap',()=>{
  const f=fixture();assert.equal(f.calls,0);
  f.button('Conferir recuperação').onClick();f.render();
  assert.equal(f.button('Recuperar 7 XP').disabled,true);
  f.button('Recuperar 7 XP').onClick();assert.equal(f.calls,0);
  f.confirm();f.change();assert.equal(f.button('Recuperar 9 XP').disabled,true);
  f.confirm();const apply=f.button('Recuperar 9 XP').onClick;apply();apply();f.render();
  assert.equal(f.calls,1);assert.ok(f.find(n=>n.props?.role==='status'));assert.ok(f.button('Baixar cópia anterior'));
});
test('recovery failure stays explicit and permits deliberate retry without automatic credit',()=>{
  const f=fixture();f.button('Conferir recuperação').onClick();f.render();f.confirm();f.fail(true);
  f.button('Recuperar 7 XP').onClick();f.render();
  assert.equal(f.calls,1);assert.ok(f.find(n=>n.props?.role==='alert'));assert.equal(f.find(n=>n.props?.role==='status'),undefined);
  f.fail(false);f.button('Recuperar 7 XP').onClick();f.render();
  assert.equal(f.calls,2);assert.ok(f.find(n=>n.props?.role==='status'));assert.equal(f.find(n=>n.props?.role==='alert'),undefined);
});
