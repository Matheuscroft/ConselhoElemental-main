import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),flush=()=>new Promise(r=>setImmediate(r));
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
const result={baseline:{pair:{},snapshot:{}},summary:{createdAt:'2026-10-28T12:00:00Z',appVersion:'0.1.92',origin:'https://other.test',tasks:0,habits:1,quests:0,projects:0,profiles:1,sessions:2},audit:{issues:[],truncated:false},comparison:{accounts:[{id:'a',name:'Conta A',status:'existing',rows:[{label:'Rascunhos',before:1,after:2,added:1,changed:0,removed:0}],xp:[{label:'Água',before:5,after:2}]}]}};
function fixture(pending=false){
 let si=0,ri=0,mounted=false,tree,cleanup,stale=false,reloads=0;const slots=[],refs=[],listeners=new Set(),requests=[],copies=[],reviews=[],recoveryCopies=[],urls=[],downloads=[],timers=[];
 const memory=new Map(pending?[['conselho-elemental-restore-journal-v1','']]:[]);
 const react={useState(v){const i=si++;if(!(i in slots))slots[i]=v;return [slots[i],next=>slots[i]=next];},useRef(v){return refs[ri++]??={current:v};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const window={location:{origin:'http://fixture.test',reload:()=>reloads++},localStorage:{getItem:key=>memory.get(key)??null},addEventListener:(key,fn)=>listeners.add(fn),removeEventListener:(key,fn)=>listeners.delete(fn)};
 const document={body:{append:()=>{}},createElement(){return {click(){downloads.push(this.download);},remove(){}};}};
 const URL={createObjectURL:()=>{urls.push('created');return 'blob:fixture';},revokeObjectURL:()=>urls.push('revoked')};
 const source=ts.transpileModule(readFileSync('src/components/backup/RestoreWorkspace.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const mod={exports:{}};
 new Function('require','module','exports','window','document','URL','setTimeout',source)(id=>{
  if(id==='react')return react;
  if(id.endsWith('/account-resolution-key'))return {ACCOUNT_RESOLUTION_KEY:'conselho-elemental-account-resolution-v1'};
  if(id.endsWith('/progress-mode'))return {LOCAL_PROGRESS_MODE_KEY:'conselho-elemental-local-progress-mode-v1'};
  if(id.endsWith('/account-intent'))return {ACCOUNT_INTENT_KEY:'conselho-elemental-account-intent-v1'};
  if(id.endsWith('/RestoreActions'))return {RestoreActions:()=>null};
  if(id.endsWith('/restore-release'))return {RESTORE_WRITES_RELEASED:false};
  if(id.endsWith('/progress-backup'))return {MAX_BACKUP_BYTES:20*1024*1024,STORE_KEYS:{core:'conselho-elemental-storage',fitness:'dominio-do-mago-workout-storage-v1'}};
  if(id.endsWith('/restore-journal'))return {RESTORE_JOURNAL_KEY:'conselho-elemental-restore-journal-v1',reviewPendingRestore:()=>new Promise((resolve,reject)=>reviews.push({resolve,reject})),assertPendingRestoreReview(){if(stale)throw Error('Recuperação mudou.');},copyRecoveryBaseline:value=>structuredClone(value),createRecoverySafetyCopy:(_,review,side)=>new Promise((resolve,reject)=>recoveryCopies.push({resolve,reject,review,side}))};
  if(id.endsWith('/workspace-preview'))return {prepareWorkspacePreview:file=>new Promise((resolve,reject)=>requests.push({file,resolve,reject})),createWorkspaceSafetyCopy:()=>new Promise((resolve,reject)=>copies.push({resolve,reject})),assertWorkspaceBaseline(){if(stale)throw Error('Progresso mudou.');}};
  return require(id);
 },mod,mod.exports,window,document,URL,fn=>timers.push(fn));
 function render(){si=ri=0;tree=mod.exports.RestoreWorkspace();mounted=true;}
 render();render();
 const nodes=()=>flatten(tree);
 return {render,requests,copies,reviews,recoveryCopies,urls,downloads,timers,listeners,memory,get reloads(){return reloads;},content:()=>text(tree),nodes,
 select(file={size:10,text:async()=> 'archive'}){const input=nodes().find(n=>n.type==='input');const target={files:[file],value:'selected'};input.props.onChange({target});assert.equal(target.value,'');render();},
 click(label){const b=nodes().find(n=>n.type==='button'&&text(n.props.children)===label);assert.ok(b,label);b.props.onClick?.();render();},
 emit(key){for(const fn of listeners)fn({key});render();},markStale(){stale=true;},unmount(){cleanup();}};
}

test('workspace presents profile changes, exact recorded XP and disabled application',async()=>{
 const f=fixture();f.select();await flush();assert.equal(f.requests.length,1);f.requests[0].resolve(result);await flush();f.render();
 for(const part of ['Conta A','1 agora → 2 na cópia','5 → 2','outro endereço','não está liberada'])assert.ok(f.content().includes(part),part);
 assert.equal(f.nodes().find(n=>n.type==='button'&&text(n.props.children)==='Restauração ainda indisponível').props.disabled,true);
 assert.equal(f.nodes().find(n=>n.type==='a').props.href,'/grimorio#grimoire-backup');f.unmount();assert.equal(f.listeners.size,0);
});

test('cancel, external changes and unmount suppress late results; irrelevant storage events preserve preview',async()=>{
 for(const mode of ['cancel','change','unmount']){
  const f=fixture();f.select();await flush();
  if(mode==='cancel')f.click('Cancelar conferência');else if(mode==='change')f.emit('conselho-elemental-storage');else f.unmount();
  f.requests[0].resolve(result);await flush();f.render();assert.doesNotMatch(f.content(),/Conta A/);if(mode!=='unmount')f.unmount();
 }
 const f=fixture();f.select();await flush();f.requests[0].resolve(result);await flush();f.render();f.emit('unrelated-pref');assert.match(f.content(),/Conta A/);
 f.emit(null);assert.doesNotMatch(f.content(),/Conta A/);f.unmount();
});

test('journal blocks the controls and return-to-app link without clearing any data',()=>{
 const f=fixture(true);const before=[...f.memory];assert.match(f.content(),/recuperação pendente/);
 for(const label of ['Baixar cópia do estado atual','Escolher arquivo para conferir'])assert.equal(f.nodes().find(n=>n.type==='button'&&text(n.props.children)===label).props.disabled,true);
 assert.ok(!f.nodes().some(n=>n.type==='a'));f.click('Recarregar conferência');assert.equal(f.reloads,1);assert.deepEqual([...f.memory],before);
 f.memory.delete('conselho-elemental-restore-journal-v1');f.emit('conselho-elemental-restore-journal-v1');assert.ok(f.nodes().some(n=>n.type==='a'));f.unmount();
});

test('file limit, stale baseline and failed request allow a new selection without an apply action',async()=>{
 const f=fixture();let read=false;f.select({size:21*1024*1024,text:async()=>{read=true;return 'bad';}});await flush();f.render();assert.equal(read,false);assert.match(f.content(),/20 MB/);
 f.select();await flush();f.requests[0].reject(Error('Arquivo adulterado'));await flush();f.render();assert.match(f.content(),/Arquivo adulterado/);
 f.select();await flush();f.markStale();f.requests[1].resolve(result);await flush();f.render();assert.match(f.content(),/Progresso mudou/);assert.doesNotMatch(f.content(),/Conta A/);f.unmount();
});

test('download is only requested for a current result; cancellation prevents side effects and URL is cleaned',async()=>{
 const f=fixture();f.click('Baixar cópia do estado atual');f.click('Cancelar conferência');f.copies[0].resolve({text:'archive',baseline:{}});await flush();f.render();assert.equal(f.downloads.length,0);assert.equal(f.urls.length,0);
 f.click('Baixar cópia do estado atual');f.copies[1].resolve({text:'archive',baseline:{}});await flush();f.render();assert.equal(f.downloads.length,1);assert.match(f.content(),/Download solicitado/);assert.deepEqual(f.urls,['created']);f.timers.forEach(fn=>fn());assert.deepEqual(f.urls,['created','revoked']);f.unmount();
});

test('issues are deduplicated and private paths are not presented as content',async()=>{
 const f=fixture();f.select();await flush();f.requests[0].resolve({...result,audit:{truncated:true,issues:[{path:'secret-id',message:'Recibo incompatível.'},{path:'private-path',message:'Recibo incompatível.'}]}});await flush();f.render();
 assert.match(f.content(),/cópia precisa de revisão/);assert.equal(f.content().split('Recibo incompatível.').length,2);assert.doesNotMatch(f.content(),/secret-id|private-path/);f.unmount();
});

test('pending recovery explains rollback, committed destination and conflicts with no enabled recovery action',async()=>{
 for(const outcome of ['rollback','keep-target','conflict']){
  const f=fixture(true),before=[...f.memory];f.click('Conferir recuperação pendente');
  assert.equal(f.nodes().find(n=>n.type==='button'&&text(n.props.children)==='Conferir recuperação pendente').props.disabled,true);
  f.reviews[0].resolve({phase:outcome==='keep-target'?'committed':'prepared',outcome,before:outcome==='rollback'?null:{...result.summary,habits:3},target:result.summary,baseline:{journal:'private journal',pair:{core:'private core',fitness:'private fitness'}}});
  await flush();f.render();assert.match(f.content(),/Nenhuma recuperação foi executada/);
  assert.match(f.content(),outcome==='rollback'?/Não havia progresso salvo/:outcome==='keep-target'?/permanece isolada/:/alterações fora desta operação/);
  assert.equal(f.nodes().find(n=>n.type==='button'&&text(n.props.children)===(outcome==='keep-target'?'Abertura da cópia ainda indisponível':'Recuperação ainda indisponível')).props.disabled,true);
  assert.doesNotMatch(f.content(),/private journal|private core|private fitness/);assert.ok(!f.nodes().some(n=>n.type==='a'));assert.deepEqual([...f.memory],before);f.unmount();
 }
});

test('recovery review discards cancelled, changed, stale and unmounted results and supports retry',async()=>{
 for(const mode of ['cancel','change','stale','unmount']){
  const f=fixture(true);f.click('Conferir recuperação pendente');
  if(mode==='cancel')f.click('Cancelar conferência');else if(mode==='change')f.emit('conselho-elemental-storage');else if(mode==='stale')f.markStale();else f.unmount();
  f.reviews[0].resolve({phase:'prepared',outcome:'rollback',before:null,target:result.summary});await flush();f.render();assert.doesNotMatch(f.content(),/Substituição não confirmada/);
  if(mode!=='unmount')f.unmount();
 }
 const f=fixture(true);f.click('Conferir recuperação pendente');f.reviews[0].reject(Error('Integridade inválida'));await flush();f.render();assert.match(f.content(),/Integridade inválida/);
 f.click('Conferir recuperação pendente');f.reviews[1].resolve(null);await flush();f.render();assert.match(f.content(),/não está mais pendente/);f.unmount();
});

test('storage events invalidate a displayed recovery without exposing or changing saved versions',async()=>{
 const f=fixture(true);f.click('Conferir recuperação pendente');f.reviews[0].resolve({phase:'committed',outcome:'keep-target',before:result.summary,target:result.summary});await flush();f.render();
 assert.match(f.content(),/Substituição já confirmada/);f.emit('unrelated-pref');assert.match(f.content(),/Substituição já confirmada/);
 f.emit('dominio-do-mago-workout-storage-v1');assert.doesNotMatch(f.content(),/Substituição já confirmada/);assert.equal(f.memory.get('conselho-elemental-restore-journal-v1'),'');f.unmount();
});

async function reviewedFixture(empty=false){
 const f=fixture(true);f.click('Conferir recuperação pendente');f.reviews[0].resolve({phase:'prepared',outcome:'rollback',before:empty?null:result.summary,target:result.summary,baseline:{journal:'protected',pair:{core:'core',fitness:'fitness'}}});await flush();f.render();return f;
}

test('recovery downloads distinguish previous and target versions without clearing pending operation',async()=>{
 const f=await reviewedFixture(),before=[...f.memory];
 for(const [side,label] of [['before','Baixar versão anterior'],['target','Baixar versão de destino']]){
  f.click(label);assert.equal(f.nodes().find(n=>n.type==='button'&&text(n.props.children)===label).props.disabled,true);const request=f.recoveryCopies.at(-1);assert.equal(request.side,side);request.resolve('archive');await flush();f.render();
  assert.match(f.downloads.at(-1),side==='before'?/recuperacao-anterior-/:/recuperacao-destino-/);assert.match(f.content(),/Download da versão/);
  assert.ok(f.nodes().find(n=>n.type==='button'&&text(n.props.children)==='Recuperação ainda indisponível').props.disabled);
 }
 assert.deepEqual([...f.memory],before);f.timers.forEach(fn=>fn());assert.equal(f.urls.filter(v=>v==='revoked').length,2);f.unmount();
 const empty=await reviewedFixture(true);assert.ok(!empty.nodes().some(n=>n.type==='button'&&text(n.props.children)==='Baixar versão anterior'));assert.ok(empty.nodes().some(n=>n.type==='button'&&text(n.props.children)==='Baixar versão de destino'));empty.unmount();
});

test('cancelled, stale, externally changed or unmounted recovery copies never request downloads',async()=>{
 for(const mode of ['cancel','stale','change','unmount']){
  const f=await reviewedFixture();f.click('Baixar versão anterior');
  if(mode==='cancel')f.click('Cancelar conferência');else if(mode==='stale')f.markStale();else if(mode==='change')f.emit('conselho-elemental-storage');else f.unmount();
  f.recoveryCopies[0].resolve('archive');await flush();f.render();assert.equal(f.downloads.length,0);assert.equal(f.urls.length,0);if(mode!=='unmount')f.unmount();
 }
 const f=await reviewedFixture();f.click('Baixar versão anterior');f.recoveryCopies[0].reject(Error('Versão não disponível'));await flush();f.render();
 assert.match(f.content(),/Versão não disponível/);assert.doesNotMatch(f.content(),/Substituição não confirmada/);assert.equal(f.downloads.length,0);f.unmount();
});
