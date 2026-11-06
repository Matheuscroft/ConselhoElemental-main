import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const flatten=n=>!n||typeof n!=='object'?[]:Array.isArray(n)?n.flatMap(flatten):[n,...flatten(n.props?.children)];
const text=n=>Array.isArray(n)?n.map(text).join(''):typeof n==='object'?text(n?.props?.children):String(n??'');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const plan={audit:{issues:[],truncated:false},baseline:'before',fileCreatedAt:'2026-10-27T12:00:00Z',fileVersion:'0.1.85',sameOrigin:false,sameVersion:false,sameActiveAccount:false,currentAccount:'Atual',incomingAccount:'Arquivo',accounts:[{id:'a',name:'Perfil A',status:'removed',rows:[{label:'Rituais principais',before:2,after:1,added:0,changed:1,removed:1}],xp:[{label:'Ar',before:10,after:4}]}]};
function fixture(){
 let si=0,ri=0,tree,cleanup,mounted=false,fingerprint='before',captureError=false;
 const slots=[],refs=[],listeners=new Set(),requests=[];
 const react={useState(initial){const i=si++;if(!(i in slots))slots[i]=initial;return [slots[i],v=>slots[i]=v];},useRef(initial){return refs[ri++]??={current:initial};},useEffect(fn){if(!mounted)cleanup=fn();}};
 const source=ts.transpileModule(readFileSync('src/components/backup/RestoreComparison.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};
 new Function('require','module','exports','window',source)(id=>{
  if(id==='react')return react;
  if(id.includes('/stores/'))return {[id.endsWith('appStore')?'useAppStore':'useWorkoutStore']:{subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}}};
  if(id.includes('capture-progress'))return {captureProgress(){if(captureError)throw new Error('Aguarde o carregamento');return {fingerprint};}};
  if(id.includes('restore-comparison'))return {progressFingerprint:s=>s.fingerprint,compareProgressBackup(file,snapshot){return new Promise((resolve,reject)=>requests.push({resolve,reject,file,snapshot}));}};
  return require(id);
 },mod,mod.exports,{location:{origin:'http://fixture.test'}});
 function render(){si=ri=0;tree=mod.exports.RestoreComparison({fileText:'selected-archive'});mounted=true;}
 render();return {render,requests,listeners,change(){fingerprint='after';for(const fn of listeners)fn();render();},silentChange(){fingerprint='after';},failCapture(){captureError=true;},unmount(){cleanup();},content:()=>text(tree),
  click(label){const button=flatten(tree).find(n=>n.type==='button'&&text(n.props.children)===label);assert.ok(button,label);button.props.onClick();render();}
 };
}
test('preview renders replacement, XP and compatibility notices with no apply action',async()=>{
 const f=fixture();f.click('Comparar com meu progresso');f.click('Comparar com meu progresso');assert.equal(f.requests.length,1);
 f.requests[0].resolve(plan);await flush();f.render();assert.match(f.content(),/2 · Na cópia: 1/);assert.match(f.content(),/10 → 4/);
 for(const part of ['outro endereço','Versões do app diferentes','perfil ativo mudaria','Sairia da cópia local','ainda não está disponível'])assert.ok(f.content().includes(part));
 assert.doesNotMatch(f.content(),/Restaurar agora|Confirmar restauração/);
 f.change();assert.doesNotMatch(f.content(),/Rituais principais/);assert.match(f.content(),/estado do app mudou/);f.unmount();assert.equal(f.listeners.size,0);
});
test('cancelled and stale comparisons cannot replace a newer request',async()=>{
 const f=fixture();f.click('Comparar com meu progresso');f.click('Cancelar comparação');f.click('Comparar com meu progresso');
 f.requests[0].resolve(plan);await flush();f.render();assert.match(f.content(),/Comparando as contas/);assert.doesNotMatch(f.content(),/Rituais principais/);
 f.requests[1].resolve(plan);await flush();f.render();assert.match(f.content(),/Rituais principais/);f.click('Fechar prévia');assert.doesNotMatch(f.content(),/Rituais principais/);f.unmount();
 for(const mode of ['change','unmount','silentChange']){const g=fixture();g.click('Comparar com meu progresso');g[mode]();g.requests[0].resolve(plan);await flush();g.render();assert.doesNotMatch(g.content(),/Rituais principais/);if(mode!=='unmount')g.unmount();}
});
test('capture and comparison failures show an error and allow retry',async()=>{
 const f=fixture();f.click('Comparar com meu progresso');f.requests[0].reject(new Error('Arquivo incompatível'));await flush();f.render();assert.match(f.content(),/Arquivo incompatível/);
 f.click('Comparar com meu progresso');f.requests[1].resolve(plan);await flush();f.render();assert.match(f.content(),/Comparação pronta/);f.unmount();
 const g=fixture();g.failCapture();g.click('Comparar com meu progresso');await flush();g.render();assert.match(g.content(),/Aguarde o carregamento/);assert.equal(g.requests.length,0);g.unmount();
});

test('preview reports unique critical issues and keeps restore unavailable',async()=>{
 const f=fixture();f.click('Comparar com meu progresso');
 f.requests[0].resolve({...plan,audit:{truncated:true,issues:[{path:'private-id',message:'XP registrado inválido.'},{path:'another-id',message:'XP registrado inválido.'}]}});
 await flush();f.render();assert.match(f.content(),/Esta cópia precisa de revisão/);assert.match(f.content(),/mais registros para conferir/);
 assert.equal(f.content().split('XP registrado inválido.').length,2);assert.doesNotMatch(f.content(),/private-id|another-id|Restaurar agora/);f.unmount();
});
