import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),flush=()=>new Promise(r=>setImmediate(r));
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
const report={profileName:'Perfil atual',profileId:'private-id',summary:{profiles:2,tasks:3,habits:4,quests:1,projects:2,drafts:5,sessions:6},xp:[{element:'Terra',amount:0},{element:'Fogo',amount:13},{element:'Água',amount:2},{element:'Ar',amount:5}],associationAllowed:false};
function fixture(){
 let si,ri,mounted=false,tree,cleanup,stale=false,captures=0;const slots=[],refs=[],requests=[],subscriptions=new Set(),listeners=new Set();
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=v];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const store={subscribe(fn){subscriptions.add(fn);return ()=>subscriptions.delete(fn);}};
 const mod={exports:{}},source=ts.transpileModule(readFileSync('src/components/backup/AccountPreparation.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 new Function('require','module','exports','window',source)(id=>{
  if(id==='react')return react;
  if(id.endsWith('/appStore'))return {useAppStore:store};if(id.endsWith('/workoutStore'))return {useWorkoutStore:store};
  if(id.endsWith('/capture-progress'))return {captureProgress:()=>{captures++;return {};}};
  if(id.endsWith('/association-review'))return {prepareLocalAssociationReview:context=>new Promise((resolve,reject)=>requests.push({context,resolve,reject})),assertLocalAssociationReviewCurrent(){if(stale)throw Error('changed');}};
  if(id.endsWith('/progress-backup'))return {STORE_KEYS:{core:'conselho-elemental-storage',fitness:'dominio-do-mago-workout-storage-v1'}};
  if(id.endsWith('/account-resolution-key'))return {ACCOUNT_RESOLUTION_KEY:'conselho-elemental-account-resolution-v1'};
  if(id.endsWith('/progress-mode'))return {LOCAL_PROGRESS_MODE_KEY:'conselho-elemental-local-progress-mode-v1'};
  if(id.endsWith('/restore-journal'))return {RESTORE_JOURNAL_KEY:'conselho-elemental-restore-journal-v1'};
  return require(id);
 },mod,mod.exports,{location:{origin:'http://fixture.test'},addEventListener:(_,fn)=>listeners.add(fn),removeEventListener:(_,fn)=>listeners.delete(fn)});
 function render(){si=ri=0;tree=mod.exports.AccountPreparation();mounted=true;}render();
 const nodes=()=>flatten(tree);return {requests,render,nodes,content:()=>text(tree),subscriptions,listeners,get captures(){return captures;},
  click(label){nodes().find(n=>n.type==='button'&&text(n.props.children)===label)?.props.onClick();render();},emit(key){listeners.forEach(fn=>fn({key}));render();},change(value=true){stale=value;subscriptions.forEach(fn=>fn());render();},unmount(){cleanup();}};
}
async function shown(){const f=fixture();f.click('Conferir progresso local');f.requests[0].resolve(report);await flush();f.render();return f;}

test('preparation is user initiated and reports exact local values without a connect/upload action or exposing raw IDs',async()=>{
 const f=fixture();assert.equal(f.requests.length,0);assert.equal(f.captures,0);assert.match(f.content(),/transferência.*preparação/);f.click('Conferir progresso local');f.click('Conferir progresso local');assert.equal(f.requests.length,1);
 f.requests[0].resolve(report);await flush();f.render();for(const label of ['Perfil atual','13 XP','0 XP','todas as contas locais','não conecta uma conta'])assert.ok(f.content().includes(label),label);
 assert.doesNotMatch(f.content(),/private-id/);assert.ok(f.nodes().some(n=>n.props?.role==='status'));assert.ok(!f.nodes().some(n=>n.type==='button'&&/Conectar|Enviar|Associar/.test(text(n.props.children))));f.unmount();assert.equal(f.subscriptions.size,0);assert.equal(f.listeners.size,0);
});

test('cancelled old requests cannot close or unlock a newer attempt, and failed preparation can be retried',async()=>{
 const f=fixture();f.click('Conferir progresso local');f.click('Cancelar conferência local');f.click('Conferir progresso local');f.requests[0].resolve(report);await flush();f.render();
 assert.doesNotMatch(f.content(),/Perfil atual/);assert.equal(f.nodes().find(n=>n.type==='button'&&text(n.props.children)==='Conferir progresso local').props.disabled,true);f.click('Conferir progresso local');assert.equal(f.requests.length,2);
 f.requests[1].reject(Error('Aguarde o carregamento'));await flush();f.render();assert.match(f.content(),/Aguarde o carregamento/);f.click('Conferir progresso local');assert.equal(f.requests.length,3);f.requests[2].resolve(report);await flush();f.render();assert.match(f.content(),/Perfil atual/);f.unmount();
});

test('persisted changes remove the displayed review; irrelevant state and preference changes retain it',async()=>{
 const f=await shown();f.change(false);assert.match(f.content(),/Perfil atual/);f.emit('unrelated-pref');assert.match(f.content(),/Perfil atual/);
 f.change();assert.doesNotMatch(f.content(),/Perfil atual/);assert.match(f.content(),/progresso mudou/);f.unmount();
 for(const key of ['conselho-elemental-storage','dominio-do-mago-workout-storage-v1','conselho-elemental-restore-journal-v1','conselho-elemental-local-progress-mode-v1',null]){const g=await shown();g.emit(key);assert.doesNotMatch(g.content(),/Perfil atual/);g.unmount();}
});

test('external changes, stale result or unmount suppress late data and do not make a write request',async()=>{
 for(const mode of ['external','stale','unmount']){
  const f=fixture();f.click('Conferir progresso local');if(mode==='external')f.emit(null);else if(mode==='stale')f.change();else f.unmount();f.requests[0].resolve(report);await flush();f.render();assert.doesNotMatch(f.content(),/Perfil atual/);if(mode!=='unmount')f.unmount();
 }
 const f=await shown();f.click('Fechar conferência local');assert.doesNotMatch(f.content(),/Perfil atual/);assert.match(f.content(),/progresso foi preservado/);f.unmount();
});
