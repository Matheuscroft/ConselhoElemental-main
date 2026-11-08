import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createRequire} from 'node:module';import ts from 'typescript';
const require=createRequire(import.meta.url),tick=()=>new Promise(r=>setImmediate(r));
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
function fixture({released=true,invalid=false}={}){
 let si,ri,ei,tree,pending=false;const slots=[],refs=[],effects=[],listeners=new Set(),prepares=[],operations=[],busyChanges=[],completed=[];
 let preview={audit:{issues:invalid?[{message:'invalid'}]:[],truncated:false},baseline:{pair:{}}},effectQueue=[];
 const onBusyChange=v=>busyChanges.push(v),onComplete=()=>completed.push('done');
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=v];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn,deps){const i=ei++,old=effects[i];if(!old||deps.some((v,j)=>v!==old.deps[j]))effectQueue.push(()=>{old?.cleanup?.();effects[i]={deps,cleanup:fn()};});}};
 const source=ts.transpileModule(readFileSync('src/components/backup/SimpleImportActions.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mod={exports:{}};const window={location:{origin:'https://fixture.test',reload(){}},localStorage:{getItem:()=>pending?'journal':null},addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)};
 new Function('require','module','exports','window','navigator',source)(id=>{
  if(id==='react')return react;
  if(id.endsWith('/restore-errors'))return {restoreFailureMessage:e=>e?.message??'import failed'};
  if(id.endsWith('/progress-backup'))return {STORE_KEYS:{core:'core',fitness:'fitness'}};
  if(id.endsWith('/restore-release'))return {RESTORE_WRITES_RELEASED:released};
  if(id.endsWith('/restore-journal'))return {RESTORE_JOURNAL_KEY:'journal'};
  if(id.endsWith('/progress-mode'))return {LOCAL_PROGRESS_MODE_KEY:'mode'};
  if(id.endsWith('/account-intent'))return {ACCOUNT_INTENT_KEY:'intent'};
  if(id.endsWith('/account-resolution-key'))return {ACCOUNT_RESOLUTION_KEY:'resolution'};
  if(id.endsWith('/restore-confirmation'))return {prepareLocalImport:(...args)=>new Promise((resolve,reject)=>prepares.push({args,resolve,reject}))};
  if(id.endsWith('/exclusive-restore'))return {runExclusiveRestore:(...args)=>new Promise((resolve,reject)=>operations.push({args,resolve,reject}))};
  return require(id);
 },mod,mod.exports,window,{locks:{}});
 function render(){si=ri=ei=0;effectQueue=[];tree=mod.exports.SimpleImportActions({preview,onBusyChange,onComplete});effectQueue.forEach(fn=>fn());}render();render();
 return {prepares,operations,completed,busyChanges,content:()=>text(tree),nodes:()=>flatten(tree),render,markPending(){pending=true;},click(){flatten(tree).find(n=>n.type==='button').props.onClick();render();},emit(){listeners.forEach(fn=>fn({key:'core'}));render();},unmount(){effects.forEach(e=>e.cleanup?.());}};
}
test('one click imports for local use with internal preparation and no file picker or checkbox; duplicate taps are ignored',async()=>{
 const f=fixture();assert.equal(f.nodes().filter(n=>n.type==='input').length,0);assert.match(f.content(),/substituir os dados deste aparelho/);f.click();f.click();assert.equal(f.prepares.length,1);assert.deepEqual(f.busyChanges,[true]);f.prepares[0].resolve({journal:'checked journal',previousBackup:'internal safety'});await tick();f.render();assert.equal(f.operations.length,1);assert.deepEqual(f.operations[0].args[1],{mode:'import-local',journal:'checked journal',previousBackup:'internal safety',replacementConfirmed:true});assert.equal(f.operations[0].args[0].otherTabsClosed,true);f.operations[0].resolve('local-ready');await tick();f.render();assert.deepEqual(f.completed,['done']);assert.deepEqual(f.busyChanges,[true,false]);f.unmount();
});
test('release and invalid archive still block forced handlers without starting an import',()=>{
 for(const options of [{released:false},{invalid:true}]){const f=fixture(options);assert.equal(f.nodes().find(n=>n.type==='button').props.disabled,true);f.click();assert.equal(f.prepares.length,0);f.unmount();}
});
test('context change or unmount invalidates late preparation; a partial failure asks for recovery and never opens the app',async()=>{
 for(const change of ['storage','unmount']){const f=fixture();f.click();change==='storage'?f.emit():f.unmount();f.prepares[0].resolve({journal:'late',previousBackup:null});await tick();assert.equal(f.operations.length,0);assert.deepEqual(f.completed,[]);if(change==='storage')f.unmount();}
 const f=fixture();f.click();f.prepares[0].resolve({journal:'checked',previousBackup:null});await tick();f.markPending();f.operations[0].reject(Error('synthetic interruption'));await tick();f.render();assert.match(f.content(),/synthetic interruption/);assert.match(f.content(),/Retomar importação/);assert.deepEqual(f.completed,[]);f.unmount();
});

test('an incomplete coordinator result cannot navigate to the app',async()=>{
 const f=fixture();f.click();f.prepares[0].resolve({journal:'checked',previousBackup:null});await tick();f.operations[0].resolve('applied');await tick();f.render();assert.deepEqual(f.completed,[]);assert.match(f.content(),/precisa terminar antes de abrir/);f.unmount();
});
