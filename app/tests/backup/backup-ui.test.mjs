import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const flatten=node=>!node||typeof node!=='object'?[]:Array.isArray(node)?node.flatMap(flatten):[node,...flatten(node.props?.children)];
const text=node=>Array.isArray(node)?node.map(text).join(''):typeof node==='object'?text(node?.props?.children):String(node??'');
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return {promise,resolve};};
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const summary={createdAt:'2026-10-27T12:00:00.000Z',appVersion:'0.1.85',origin:'http://fixture.test',accountId:null,profiles:0,tasks:2,habits:1,quests:1,projects:0,drafts:1,sessions:3};
function fixture(){
  let si=0,ri=0,tree,cleanup,mounted=false,accountId=null;
  const slots=[],refs=[],captures=[],exports=[],inspections=[],downloads=[],revoked=[],timers=[];
  const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>{slots[i]=typeof v==='function'?v(slots[i]):v;}];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn){if(!mounted)cleanup=fn();}};
  const source=ts.transpileModule(readFileSync('src/components/backup/ProgressBackup.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const mod={exports:{}};
  new Function('require','module','exports','window','document','URL','setTimeout',source)(id=>{
    if(id==='react')return react;
    if(id==='./RestoreComparison')return {RestoreComparison:()=>null};
    if(id==='./AccountPreparation')return {AccountPreparation:()=>null};
    if(id.endsWith('.css'))return {};
    if(id==='@/stores/appStore')return {useAppStore:{getState:()=>({currentAccountId:accountId})}};
    if(id.includes('capture-progress'))return {captureProgress(origin){captures.push(origin);return {createdAt:summary.createdAt};}};
    if(id.includes('progress-backup'))return {MAX_BACKUP_BYTES:1000,createProgressBackup(){const pending=deferred();exports.push(pending);return pending.promise;},async inspectProgressBackup(value){inspections.push(value);if(value==='bad')throw new Error('Arquivo inválido');return {summary};}};
    return require(id);
  },mod,mod.exports,{location:{origin:'http://fixture.test'}},{body:{append(){}},createElement(){return {remove(){},click(){downloads.push(this.download);}};}},{createObjectURL:()=> 'blob:test',revokeObjectURL:url=>revoked.push(url)},fn=>timers.push(fn));
  function render(){si=ri=0;tree=mod.exports.ProgressBackup();mounted=true;}
  const find=fn=>flatten(tree).find(fn)?.props;
  render();return {render,find,captures,exports,inspections,downloads,revoked,timers,unmount:()=>cleanup?.(),account(value){accountId=value;},
    click(label){const button=find(n=>n.type==='button'&&text(n.props.children)===label);assert.ok(button,label);button.onClick();render();},
    file(file){find(n=>n.type==='input').onChange({target:{files:[file],value:'file'}});render();},
    content:()=>text(tree),
  };
}

test('backup download waits for verification, prevents double clicks and releases its object URL',async()=>{
  const f=fixture();f.click('Baixar cópia do progresso');f.click('Baixar cópia do progresso');assert.equal(f.captures.length,1);assert.equal(f.downloads.length,0);
  f.exports[0].resolve('archive');await flush();f.render();assert.deepEqual(f.inspections,['archive']);assert.equal(f.downloads.length,1);
  assert.match(f.content(),/Confirme que ele foi salvo/);assert.match(f.content(),/O que esta cópia contém/);
  assert.doesNotMatch(f.content(),/Restaurar agora/);f.timers.forEach(fn=>fn());assert.deepEqual(f.revoked,['blob:test']);f.unmount();
});

test('cancellation and account/unmount changes prevent stale downloads without ending a newer operation',async()=>{
  const f=fixture();f.click('Baixar cópia do progresso');f.click('Cancelar');f.click('Baixar cópia do progresso');
  f.exports[0].resolve('old');await flush();f.render();assert.equal(f.downloads.length,0);assert.match(f.content(),/Preparando/);
  f.exports[1].resolve('new');await flush();f.render();assert.equal(f.downloads.length,1);f.unmount();
  for(const action of ['account','unmount']){const g=fixture();g.click('Baixar cópia do progresso');if(action==='account')g.account('other');else g.unmount();g.exports[0].resolve('stale');await flush();assert.equal(g.downloads.length,0);}
});

test('file inspection is read only, checks size first and replaces previews on errors or cancellation',async()=>{
  const f=fixture();let reads=0;
  f.file({size:1001,text:async()=>{reads++;return 'archive';}});await flush();f.render();assert.equal(reads,0);assert.match(f.content(),/até 20 MB/);
  f.file({size:5,text:async()=> 'valid'});await flush();f.render();assert.match(f.content(),/Integridade e formato conferidos/);assert.equal(f.downloads.length,0);assert.equal(f.captures.length,0);assert.equal(f.find(n=>n.props?.fileText)?.fileText,'valid');
  f.file({size:3,text:async()=> 'bad'});await flush();f.render();assert.match(f.content(),/Arquivo inválido/);assert.equal(f.find(n=>n.props?.fileText),undefined);assert.doesNotMatch(f.content(),/O que esta cópia contém/);
  const pending=deferred();f.file({size:5,text:()=>pending.promise});f.click('Cancelar');pending.resolve('old');await flush();f.render();assert.match(f.content(),/Conferência cancelada/);assert.doesNotMatch(f.content(),/O que esta cópia contém/);f.unmount();
});
