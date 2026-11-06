import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
const require=createRequire(import.meta.url),tick=()=>new Promise(r=>setImmediate(r));
const returnModule=loadComponent('src/lib/reminders/reminder-return.ts');
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
const sample=()=>({title:'Leitura',identity:{sourceType:'task',sourceId:'synthetic',day:'2026-10-30'},existing:null});
function fixture(released=true){
 let si=0,ri=0,mounted=false,cleanup,tree,review=sample(),readError=null;const slots=[],refs=[],reads=[],prepares=[],destinations=[];
 const react={useId:()=> 'control',useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(v){return refs[ri++]??={current:v};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const module={exports:{}};
 const source=ts.transpileModule(readFileSync('src/components/reminders/ActivityReminderControl.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports','window',source)(id=>{
  if(id==='react')return react;
  if(id.endsWith('/reminder-release'))return {REMINDER_WRITES_RELEASED:released};
  if(id.endsWith('/reminder-return'))return returnModule;
  if(id.endsWith('/activity-reminder-adapter'))return {reviewLiveActivityReminder:(...args)=>{reads.push(args);if(readError)throw readError;return review;},prepareLiveActivityReminder:(...args)=>new Promise((resolve,reject)=>prepares.push({args,resolve,reject}))};
  return require(id);
 },module,module.exports,{location:{assign:href=>destinations.push(href)}});
 function render(){si=ri=0;tree=module.exports.default({identity:sample().identity,returnTo:'/temporal/mes?mes=2026-10&dia=2026-10-30'});mounted=true;}
 const nodes=()=>flatten(tree);render();return {render,nodes,reads,prepares,destinations,content:()=>text(tree),
  review(next){review=next;},error(next){readError=next;},
  click(label){const b=nodes().find(n=>n.type==='button'&&text(n)===label);assert.ok(b,label);b.props.onClick();render();},
  change(type,value){const n=nodes().find(n=>type==='select'?n.type==='select':n.type==='input'&&n.props.type===type);assert.ok(n,type);n.props.onChange({target:{value,checked:value}});render();},
  submit(){const form=nodes().find(n=>n.type==='form');assert.ok(form);form.props.onSubmit({preventDefault(){}});render();},
  unmount(){cleanup?.();}};
}
async function opened(f){f.click('Aviso da atividade');await tick();f.render();}

test('closed release renders no controls and does not load the domain adapter',()=>{
 const f=fixture(false);assert.equal(f.content(),'');assert.equal(f.reads.length,0);assert.equal(f.prepares.length,0);f.unmount();
 const {TemporalReminderControl}=loadComponent('src/components/reminders/TemporalReminderControl.tsx');
 assert.equal(TemporalReminderControl({item:{sourceType:'habit',sourceId:'x',date:new Date()},returnTo:'/temporal/semana'}),null);
});

test('configure requires explicit time and fresh consent, never treats preparation as saved or completed',async()=>{
 const f=fixture();assert.equal(f.reads.length,0);await opened(f);assert.equal(f.reads.length,1);assert.match(f.content(),/Um aviso não conclui/);
 assert.equal(f.nodes().find(n=>n.type==='input'&&n.props.type==='time').props.required,true);
 f.change('time','09:30');f.submit();assert.equal(f.prepares.length,0);f.change('checkbox',true);f.change('time','10:30');f.submit();assert.equal(f.prepares.length,0);
 f.change('checkbox',true);f.submit();f.submit();await tick();assert.equal(f.prepares.length,1);assert.deepEqual(f.prepares[0].args[1],{kind:'configure',time:'10:30'});assert.equal(f.prepares[0].args[2],'/temporal/mes?mes=2026-10&dia=2026-10-30');assert.equal(f.prepares[0].args[3],true);assert.equal(f.destinations.length,0);
 f.prepares[0].resolve('/?progresso=lembretes');await tick();assert.deepEqual(f.destinations,['/?progresso=lembretes']);f.unmount();
});

test('errors retain time/action input, reset consent and allow a new read without leaving the page',async()=>{
 const f=fixture();await opened(f);f.change('time','11:45');f.change('checkbox',true);f.submit();await tick();f.prepares[0].reject(Error('Progresso mudou'));await tick();f.render();assert.match(f.content(),/Progresso mudou/);assert.equal(f.nodes().find(n=>n.type==='input'&&n.props.type==='time').props.value,'11:45');assert.equal(f.nodes().find(n=>n.type==='input'&&n.props.type==='checkbox').props.checked,false);assert.deepEqual(f.destinations,[]);
 f.click('Conferir atividade novamente');await tick();f.render();assert.equal(f.nodes().find(n=>n.type==='input'&&n.props.type==='time').props.value,'11:45');f.unmount();
});

test('existing reminder exposes the four domain commands, dismissed occurrence cannot reconfigure',async()=>{
 const f=fixture();f.review({...sample(),existing:{status:'scheduled',dueAt:'2026-10-30T12:00:00Z'}});await opened(f);
 const options=f.nodes().filter(n=>n.type==='option').map(n=>n.props.value);assert.deepEqual(options,['one-hour','tomorrow-nine','tomorrow-same-time','dismiss']);assert.equal(f.nodes().some(n=>n.type==='input'&&n.props.type==='time'),false);
 f.change('select','dismiss');f.change('checkbox',true);f.submit();await tick();assert.deepEqual(f.prepares[0].args[1],{kind:'command',action:'dismiss'});f.unmount();
 const g=fixture();g.review({...sample(),existing:{status:'dismissed',dueAt:'2026-10-30T12:00:00Z'}});await opened(g);assert.match(g.content(),/foi dispensado/);assert.equal(g.nodes().some(n=>n.type==='form'),false);g.unmount();
});

test('an unavailable session stays on the activity; unmount revokes generation and late navigation',async()=>{
 const f=fixture();f.error(Error('Conta vinculada'));await opened(f);assert.match(f.content(),/Conta vinculada/);assert.equal(f.nodes().some(n=>n.type==='form'),false);assert.deepEqual(f.destinations,[]);f.unmount();
 const g=fixture();await opened(g);g.change('time','09:00');g.change('checkbox',true);g.submit();await tick();const pending=g.prepares[0];assert.equal(pending.args[4](),true);g.unmount();assert.equal(pending.args[4](),false);pending.resolve('/?progresso=lembretes');await tick();assert.deepEqual(g.destinations,[]);
});
