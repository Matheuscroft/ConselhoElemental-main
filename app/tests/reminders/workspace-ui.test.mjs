import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
const returnModule=loadComponent('src/lib/reminders/reminder-return.ts');
const require=createRequire(import.meta.url),tick=()=>new Promise(r=>setImmediate(r));
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
function sample(status='prepared',outcome=null){return {handoff:{raw:'private transport bytes',status},accounts:[null,null,null],localOnly:true,changes:[{key:'one',label:'Leitura',day:'2026-10-30',dueAt:'2026-10-30T12:00:00Z',status:'scheduled'}],recovery:outcome?{outcome}:null,orphanRecovery:false};}
function setup(released=true,search=''){
 let si=0,ri=0,mounted=false,cleanup,tree;const slots=[],refs=[],listeners=new Set(),reads=[],actions=[],destinations=[],focus=[];
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(v){return refs[ri++]??={current:v};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const module={exports:{}};
 const source=ts.transpileModule(readFileSync('src/components/reminders/ReminderWorkspace.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports','window','navigator','document',source)(id=>{
  if(id==='react')return react;
  if(id.endsWith('/reminder-return'))return returnModule;
  if(id.endsWith('/reminder-release'))return {REMINDER_WRITES_RELEASED:released};
  if(id.endsWith('/reminder-handoff'))return {REMINDER_HANDOFF_KEY:'handoff'};
  if(id.endsWith('/reminder-workspace'))return {REMINDER_WATCH_KEYS:['core','fitness','account'],reviewReminderWorkspace:()=>new Promise((resolve,reject)=>reads.push({resolve,reject})),runReminderWorkspaceAction:(...args)=>new Promise((resolve,reject)=>actions.push({args,resolve,reject}))};
  return require(id);
 },module,module.exports,{location:{origin:'http://synthetic.test',search,assign:url=>destinations.push(url)},localStorage:{},sessionStorage:{},addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)},{locks:{}},{getElementById:id=>({focus:opts=>focus.push([id,opts])})});
 function render(){si=ri=0;const outer=module.exports.ReminderWorkspace();tree=outer.type(outer.props);mounted=true;}
 const nodes=()=>flatten(tree),buttons=()=>nodes().filter(n=>n.type==='button');
 render();return {render,reads,actions,destinations,focus,listeners,content:()=>text(tree),nodes,buttons,
 panel:props=>module.exports.ReminderWorkspacePanel({review:null,busy:false,error:'',tabsClosed:false,confirmed:false,onTabs(){},onConfirm(){},onRefresh(){},onAction(){},...props}),
 click(label){const b=buttons().find(b=>text(b)===label);assert.ok(b,label);b.props.onClick();render();},
 toggle(i,v=true){nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox')[i].props.onChange({target:{checked:v}});render();},
 emit(key){listeners.forEach(fn=>fn({key}));render();},unmount(){cleanup?.();}};
}
async function reviewed(f,review=sample()){f.click('Atualizar conferência');f.reads.at(-1).resolve(review);await tick();f.render();}

test('isolated mount focuses heading, subscribes once and waits for explicit read; review does not write',async()=>{
 const f=setup();assert.equal(f.reads.length,0);assert.equal(f.actions.length,0);assert.deepEqual(f.focus,[['reminder-workspace-heading',{preventScroll:true}]]);await reviewed(f);assert.match(f.content(),/Leitura/);assert.doesNotMatch(f.content(),/private transport bytes/);assert.equal(f.actions.length,0);f.unmount();assert.equal(f.listeners.size,0);
});

test('gate and two unchecked consents prevent dispatch even if disabled click handlers are invoked',async()=>{
 for(const released of [true,false]){
  const f=setup(released);await reviewed(f);
  f.click('Salvar aviso');assert.equal(f.actions.length,0);f.toggle(0);f.click('Salvar aviso');assert.equal(f.actions.length,0);f.toggle(1);
  f.click('Salvar aviso');assert.equal(f.actions.length,released?1:0);f.unmount();
 }
});

test('apply suppresses double tap, refreshes review and resets all consents before local continuation',async()=>{
 const f=setup();await reviewed(f);f.toggle(0);f.toggle(1);f.click('Salvar aviso');f.click('Salvar aviso');assert.equal(f.actions.length,1);const args=f.actions[0].args;assert.equal(args[0].otherTabsClosed,true);assert.equal(args[0].reminderConfirmed,true);assert.equal(args[3],'apply');assert.equal(args[4],true);
 f.actions[0].resolve('review');await tick();f.reads.at(-1).resolve(sample('pending-recovery','keep-target'));await tick();f.render();assert.match(f.content(),/somente neste navegador/);f.click('Continuar somente local');assert.equal(f.actions.length,1);
 f.toggle(0);f.toggle(1);f.click('Continuar somente local');assert.equal(f.actions[1].args[3],'local');f.unmount();
});

test('storage changes and unmount revoke an in-flight command; late results cannot navigate',async()=>{
 for(const event of ['storage','unmount']){
  const f=setup();await reviewed(f);f.toggle(0);f.toggle(1);f.click('Salvar aviso');const command=f.actions[0];assert.equal(command.args[0].isCurrent(),true);
  if(event==='storage'){f.emit('unrelated');assert.equal(command.args[0].isCurrent(),true);f.emit('account');assert.match(f.content(),/outra aba/);}else f.unmount();
  assert.equal(command.args[0].isCurrent(),false);command.resolve('exit');await tick();f.render();assert.deepEqual(f.destinations,[]);if(event==='storage')f.unmount();
 }
});

test('explicit discard exits only on success; a failed read clears old consent and retains retry',async()=>{
 const f=setup(false);await reviewed(f);f.click('Descartar alteração do aviso');assert.equal(f.actions[0].args[3],'cancel');assert.equal(f.actions[0].args[4],true);assert.equal(f.destinations.length,0);f.actions[0].resolve('exit');await tick();assert.deepEqual(f.destinations,['/santuario']);f.unmount();
 const g=setup();await reviewed(g);g.toggle(0);g.toggle(1);g.click('Atualizar conferência');g.reads.at(-1).reject(Error('Confira a recuperação'));await tick();g.render();assert.match(g.content(),/Confira a recuperação/);assert.equal(g.nodes().filter(n=>n.type==='input').length,0);assert.ok(g.buttons().some(b=>text(b)==='Atualizar conferência'));g.unmount();
});

test('panel distinguishes connected/non-local/conflicting/orphan and empty states without mutation actions',()=>{
 const f=setup();
 for(const review of [{...sample(),localOnly:false},{...sample(),accounts:['private account binding',null,null]},sample('changed'),sample('pending-recovery','conflict')]){
  const content=text(f.panel({review}));assert.doesNotMatch(content,/private account binding/);const buttons=flatten(f.panel({review})).filter(n=>n.type==='button').map(text);assert.ok(!buttons.some(label=>['Salvar aviso','Continuar somente local','Recuperar progresso anterior','Voltar ao app'].includes(label)));
 }
 assert.match(text(f.panel({review:{...sample(),handoff:null,orphanRecovery:true}})),/Há uma recuperação/);assert.match(text(f.panel({review:{...sample(),handoff:null,orphanRecovery:false}})),/Nenhuma alteração/);f.unmount();
});


test('successful exit returns to the selected temporal day and rejects hostile return parameters',async()=>{
 for(const [destination,expected] of [['/temporal/mes?mes=2026-10&dia=2026-10-30','/temporal/mes?dia=2026-10-30&mes=2026-10'],['https://outside.test','/santuario']]){
  const f=setup(true,'?progresso=lembretes&voltar='+encodeURIComponent(destination));await reviewed(f);f.click('Descartar alteração do aviso');f.actions[0].resolve('exit');await tick();assert.deepEqual(f.destinations,[expected]);f.unmount();
 }
});
