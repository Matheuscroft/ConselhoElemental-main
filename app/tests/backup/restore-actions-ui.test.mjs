import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),flush=()=>new Promise(r=>setImmediate(r));
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
const preview=()=>({text:'selected archive',baseline:{pair:{core:'core',fitness:'fitness'},snapshot:{},localMode:null},audit:{issues:[],truncated:false}});
function fixture({released=true,incoming=preview(),recovery=null}={}){
 let si,ri,ei,tree,pending=false,reloads=0;const slots=[],refs=[],effects=[],listeners=new Set(),copies=[],prepares=[],operations=[],completed=[];
 let props={preview:incoming,recovery,onComplete:r=>completed.push(r)};let effectQueue=[];
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],value=>slots[i]=value];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn,deps){const i=ei++,old=effects[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))effectQueue.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:fn()};});}};
 const window={location:{origin:'http://fixture.test',reload:()=>reloads++},localStorage:{getItem:()=>pending?'retained journal':null},addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)};
 const module={exports:{}};const source=ts.transpileModule(readFileSync('src/components/backup/RestoreActions.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports','window','navigator',source)(id=>{
  if(id==='react')return react;
  if(id.endsWith('/progress-backup'))return {MAX_BACKUP_BYTES:20*1024*1024,STORE_KEYS:{core:'conselho-elemental-storage',fitness:'dominio-do-mago-workout-storage-v1'}};
  if(id.endsWith('/progress-mode'))return {LOCAL_PROGRESS_MODE_KEY:'conselho-elemental-local-progress-mode-v1'};
  if(id.endsWith('/restore-journal'))return {RESTORE_JOURNAL_KEY:'conselho-elemental-restore-journal-v1'};
  if(id.endsWith('/restore-release'))return {RESTORE_WRITES_RELEASED:released};
  if(id.endsWith('/restore-confirmation'))return {verifyPreviousSafetyCopy:(...args)=>new Promise((resolve,reject)=>copies.push({args,resolve,reject})),prepareConfirmedRestore:(...args)=>new Promise((resolve,reject)=>prepares.push({args,resolve,reject}))};
  if(id.endsWith('/exclusive-restore'))return {runExclusiveRestore:(context,operation)=>new Promise((resolve,reject)=>operations.push({context,operation,resolve,reject}))};
  return require(id);
 },module,module.exports,window,{locks:{request(){}}});
 function render(){si=ri=ei=0;effectQueue=[];tree=module.exports.RestoreActions(props);effectQueue.forEach(fn=>fn());}
 render();render();const nodes=()=>flatten(tree);
 return {render,copies,prepares,operations,completed,nodes,markPending(){pending=true;},get reloads(){return reloads;},content:()=>text(tree),
  update(next){props={...props,...next};render();render();},
  toggle(i,value=true){nodes().filter(n=>n.type==='input'&&n.props.type==='checkbox')[i].props.onChange({target:{checked:value}});render();},
  click(){nodes().filter(n=>n.type==='button').at(-1)?.props.onClick?.();render();},
  select(file={size:10,text:async()=> 'saved archive'}){nodes().find(n=>n.type==='input'&&n.props.type==='file').props.onChange({target:{files:[file],value:'selected'}});render();},
  emit(key){listeners.forEach(fn=>fn({key}));render();},unmount(){effects.forEach(effect=>effect.cleanup?.());},listeners};
}
async function verified(f){f.select();await flush();f.copies.at(-1).resolve();await flush();f.render();}
async function confirmed(f){await verified(f);f.toggle(0);f.toggle(1);}

test('static release gate and unchecked consent prevent execution even if disabled handlers are called',async()=>{
 const f=fixture({released:false});await confirmed(f);assert.ok(f.nodes().filter(n=>n.type==='button').at(-1).props.disabled);f.click();assert.equal(f.prepares.length,0);assert.equal(f.operations.length,0);assert.match(f.content(),/gravação permanece bloqueada/);f.unmount();
 const active=fixture();await verified(active);for(const pair of [[false,false],[true,false],[false,true]]){active.toggle(0,pair[0]);active.toggle(1,pair[1]);active.click();assert.equal(active.prepares.length,0);}active.unmount();
 assert.match(readFileSync('src/lib/backup/restore-release.ts','utf8'),/RESTORE_WRITES_RELEASED = true;/);
});

test('restoration requires the saved file, binds reviewed bytes and suppresses duplicate submission',async()=>{
 const f=fixture();f.toggle(0);f.toggle(1);f.click();assert.equal(f.prepares.length,0);
 await verified(f);f.click();f.click();assert.equal(f.prepares.length,1);assert.equal(f.prepares[0].args[1],'saved archive');f.prepares[0].resolve('prepared journal');await flush();f.render();
 assert.equal(f.operations.length,1);assert.deepEqual(f.operations[0].operation,{mode:'apply',journal:'prepared journal',previousBackup:'saved archive',replacementConfirmed:true});assert.equal(f.operations[0].context.otherTabsClosed,true);
 f.operations[0].resolve('applied');await flush();f.render();assert.deepEqual(f.completed,['applied']);f.unmount();assert.equal(f.listeners.size,0);
});

test('recovery and local use have separate explicit consents and dispatch the exact reviewed baseline',async()=>{
 for(const outcome of ['rollback','keep-target','conflict']){
  const recovery={outcome,baseline:{journal:'reviewed bytes',pair:{core:'core',fitness:'fitness'},localMode:null}};
  const f=fixture({incoming:null,recovery});f.toggle(0);f.click();assert.equal(f.operations.length,0);f.toggle(1);f.click();
  if(outcome==='conflict')assert.equal(f.operations.length,0);else{assert.equal(f.operations[0].operation.mode,outcome==='rollback'?'recover':'local');assert.equal(f.operations[0].operation.expected,recovery.baseline);f.operations[0].resolve(outcome==='rollback'?'rolled-back':'local-ready');await flush();f.render();assert.equal(f.completed.length,1);}
  assert.equal(f.prepares.length,0);f.unmount();
 }
});

test('file size, invalid file and readback errors allow retry without writing',async()=>{
 const f=fixture();let read=false;f.select({size:21*1024*1024,text:async()=>{read=true;}});await flush();f.render();assert.equal(read,false);assert.match(f.content(),/20 MB/);
 f.select();await flush();f.copies[0].reject(Error('Arquivo diferente'));await flush();f.render();assert.match(f.content(),/Arquivo diferente/);assert.equal(f.operations.length,0);await confirmed(f);f.click();assert.equal(f.prepares.length,1);f.prepares[0].reject(Error('Revise a cópia'));await flush();f.render();assert.match(f.content(),/Revise a cópia/);f.unmount();
});

test('external changes, new preview and unmount invalidate late file reads or preparation',async()=>{
 for(const stage of ['read','prepare'])for(const change of ['storage','preview','unmount']){
  const f=fixture();if(stage==='read'){f.select();await flush();}else{await confirmed(f);f.click();}
  if(change==='storage')f.emit('conselho-elemental-local-progress-mode-v1');else if(change==='preview')f.update({preview:preview()});else f.unmount();
  if(stage==='read')f.copies[0].resolve();else f.prepares[0].resolve('late journal');await flush();f.render();assert.equal(f.operations.length,0);assert.equal(f.completed.length,0);if(change!=='unmount')f.unmount();
 }
});

test('in-flight coordination receives cancellation and never navigates after invalidation; irrelevant preferences do not cancel',async()=>{
 for(const key of ['conselho-elemental-storage','conselho-elemental-restore-journal-v1',null,'unrelated-pref']){
  const f=fixture();await confirmed(f);f.click();f.prepares[0].resolve('journal');await flush();f.render();const request=f.operations[0];assert.equal(request.context.isCurrent(),true);f.emit(key);
  assert.equal(request.context.isCurrent(),key==='unrelated-pref');request.resolve('applied');await flush();f.render();assert.equal(f.completed.length,key==='unrelated-pref'?1:0);f.unmount();
 }
});

test('empty origin does not require a previous copy and audit issues prevent submission',async()=>{
 const f=fixture({incoming:{...preview(),baseline:{...preview().baseline,snapshot:null}}});f.toggle(0);f.toggle(1);f.click();assert.equal(f.prepares.length,1);assert.equal(f.prepares[0].args[1],null);f.prepares[0].reject(Error('stop'));await flush();f.unmount();
 for(const audit of [{issues:[{message:'Review'}],truncated:false},{issues:[],truncated:true}]){const invalid=fixture({incoming:{...preview(),audit}});await confirmed(invalid);invalid.click();assert.equal(invalid.prepares.length,0);invalid.unmount();}
});


test('partial failure requires recovery review and blocks retry before a full reload',async()=>{
 const f=fixture();await confirmed(f);f.click();f.prepares[0].resolve('journal');await flush();f.markPending();f.operations[0].reject(Error('Gravação interrompida'));await flush();f.render();
 assert.match(f.content(),/operação para conferir/);const restore=f.nodes().find(n=>n.type==='button'&&text(n.props.children)==='Restaurar esta cópia');assert.equal(restore.props.disabled,true);restore.props.onClick();assert.equal(f.prepares.length,1);
 f.click();assert.equal(f.reloads,1);f.unmount();
});

test('disabled restore explains the exact outstanding steps and distinguishes safety copy from incoming progress',async()=>{
 const f=fixture();const button=()=>f.nodes().find(n=>n.type==='button'&&text(n.props.children)==='Restaurar esta cópia');
 assert.equal(button().props.disabled,true);assert.equal(button().props['aria-describedby'],'restore-missing-steps');
 assert.match(f.content(),/Baixar o arquivo não faz essa conferência/);assert.match(f.content(),/primeira confirmação/);assert.match(f.content(),/Marque a confirmação de substituição/);
 f.toggle(0);f.toggle(1);assert.equal(button().props.disabled,true);assert.match(f.content(),/Conferir cópia anterior salva/);assert.doesNotMatch(f.content(),/primeira confirmação|Marque a confirmação de substituição/);
 await verified(f);assert.equal(button().props.disabled,false);assert.match(f.content(),/Segurança deste aparelho conferida/);assert.match(f.content(),/Tudo conferido/);assert.doesNotMatch(f.content(),/Baixar o arquivo não faz essa conferência/);assert.equal(f.prepares.length,0);assert.equal(f.operations.length,0);
 f.emit('conselho-elemental-storage');assert.equal(button().props.disabled,true);assert.match(f.content(),/Baixar o arquivo não faz essa conferência/);f.unmount();
});

test('an empty destination needs only confirmations while audit and recovery blockers are explicitly named',async()=>{
 const empty=fixture({incoming:{...preview(),baseline:{...preview().baseline,snapshot:null}}});assert.doesNotMatch(empty.content(),/Baixar o arquivo não faz essa conferência/);empty.toggle(0);empty.toggle(1);assert.match(empty.content(),/Tudo conferido/);empty.unmount();
 const invalid=fixture({incoming:{...preview(),audit:{issues:[{message:'Synthetic invalid link'}],truncated:false}}});assert.match(invalid.content(),/Resolva os avisos/);invalid.unmount();
 const recovery=fixture({incoming:null,recovery:{outcome:'conflict',baseline:{}}});assert.match(recovery.content(),/versões da recuperação precisam de revisão/);recovery.unmount();
});
