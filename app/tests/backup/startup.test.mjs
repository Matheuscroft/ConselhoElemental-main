import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import ts from 'typescript';
const out=await build({stdin:{contents:`export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/startup-screen';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
const mod={exports:{}};new Function('module','exports',out.outputFiles[0].text)(mod,mod.exports);
const {startProgressSession,PROGRESS_SESSION_LOCK,showProgressStartup}=mod.exports;
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
const tick=()=>new Promise(r=>setImmediate(r));
// In-memory cooperative lock manager; no browser profile/storage is involved.
function locks(){
 let readers=0,writer=false;
 return {get readers(){return readers;},get writer(){return writer;},async request(name,options,callback){
  assert.equal(name,PROGRESS_SESSION_LOCK);assert.equal(options.ifAvailable,true);
  const shared=options.mode==='shared';
  if(writer||(!shared&&readers))return callback(null);
  if(shared)readers++;else writer=true;
  try{return await callback({name,mode:options.mode});}finally{if(shared)readers--;else writer=false;}
 }};
}
function options(extra={}){
 const events=[],life=deferred();
 return {events,life,config:{storage:()=>({getItem:k=>{events.push(['read',k]);return null;}}),load:async()=>events.push(['load']),blocked:r=>events.push(['blocked',r]),lifetime:life.promise,...extra}};
}

test('guard reads only journal before loading, performs no writes, and holds lease for document lifetime',async()=>{
 const manager=locks(),o=options({locks:manager});const done=startProgressSession(o.config);await tick();
 assert.deepEqual(o.events,[['read','conselho-elemental-account-resolution-v1'],['read','conselho-elemental-restore-journal-v1'],['read','conselho-elemental-account-intent-v1'],['read','conselho-elemental-local-progress-mode-v1'],['read','conselho-elemental-account-binding-v1'],['read','conselho-elemental-account-resolution-v1'],['load']]);assert.equal(manager.readers,1);
 let allowed=true;await manager.request(PROGRESS_SESSION_LOCK,{mode:'exclusive',ifAvailable:true},lock=>{allowed=!!lock;});assert.equal(allowed,false);
 o.life.resolve();await done;assert.equal(manager.readers,0);
});

test('two normal tabs coexist; exclusive pre-start operation blocks hydration then releases',async()=>{
 const manager=locks(),a=options({locks:manager}),b=options({locks:manager});
 const pa=startProgressSession(a.config),pb=startProgressSession(b.config);await tick();assert.equal(manager.readers,2);
 a.life.resolve();b.life.resolve();await Promise.all([pa,pb]);
 const exclusive=deferred();const held=manager.request(PROGRESS_SESSION_LOCK,{mode:'exclusive',ifAvailable:true},()=>exclusive.promise);
 const c=options({locks:manager});await startProgressSession(c.config);assert.deepEqual(c.events,[['blocked','busy']]);
 exclusive.resolve();await held;
 const d=options({locks:manager,lifetime:Promise.resolve()});await startProgressSession(d.config);assert.equal(d.events.at(-1)[0],'load');
});

test('ANY journal, including empty, corrupt or future format, blocks import without recovery or deletion',async()=>{
 for(const raw of ['', '{', '{"version":999}', 'pending']){
  const manager=locks(),o=options({locks:manager,storage:()=>({getItem:k=>k==='conselho-elemental-restore-journal-v1'?raw:null})});
  await startProgressSession(o.config);assert.deepEqual(o.events,[['blocked','pending-restore']]);assert.equal(manager.readers,0);
 }
});

test('denied storage getter/read fail closed; lock rejection does not bypass coordination',async()=>{
 const fail=()=>{throw new Error('private diagnostic');};
 for(const storage of [fail,()=>({getItem:fail})]){
  const manager=locks(),o=options({locks:manager,storage});await startProgressSession(o.config);
  assert.deepEqual(o.events,[['blocked','storage-unavailable']]);assert.equal(manager.readers,0);
 }
 const o=options({locks:{request:async()=>{throw new Error('unavailable');}}});await startProgressSession(o.config);
 assert.deepEqual(o.events,[['blocked','startup-failed']]);
});

test('module-load failure retains lease until reload because imports may be partially initialized',async()=>{
 const manager=locks(),o=options({locks:manager,load:async()=>{throw new Error('chunk failed');}});const failed=startProgressSession(o.config);await tick();
 assert.equal(o.events.at(-1)[1],'startup-failed');assert.equal(manager.readers,1);
 o.life.resolve();await failed;assert.equal(manager.readers,0);
 const next=options({locks:manager,lifetime:Promise.resolve()});await startProgressSession(next.config);assert.equal(next.events.at(-1)[0],'load');
});

test('shared lease spans asynchronous module import, not only initial check',async()=>{
 const manager=locks(),loading=deferred(),o=options({locks:manager,load:()=>loading.promise});
 const done=startProgressSession(o.config);await tick();assert.equal(manager.readers,1);
 let acquired;await manager.request(PROGRESS_SESSION_LOCK,{mode:'exclusive',ifAvailable:true},lock=>{acquired=!!lock;});assert.equal(acquired,false);
 loading.resolve();await tick();assert.equal(manager.readers,1);o.life.resolve();await done;
});

test('browsers without Web Locks retain ordinary startup but still block pending recovery',async()=>{
 const o=options({lifetime:Promise.resolve()});await startProgressSession(o.config);assert.equal(o.events.at(-1)[0],'load');
 const blocked=options({storage:()=>({getItem:k=>k==='conselho-elemental-restore-journal-v1'?'{pending}':null})});await startProgressSession(blocked.config);assert.deepEqual(blocked.events,[['blocked','pending-restore']]);
});

test('main static import graph cannot hydrate stores or initialize auth before guard',()=>{
 const seen=new Set();
 function visit(file){
  if(seen.has(file))return;seen.add(file);
  assert.ok(!/\/(stores|services)\//.test(file),`Eager domain import: ${file}`);
  const ast=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
  for(const stmt of ast.statements){
   if(!ts.isImportDeclaration(stmt)&&!ts.isExportDeclaration(stmt))continue;
   if((ts.isImportDeclaration(stmt)&&stmt.importClause?.isTypeOnly)||(ts.isExportDeclaration(stmt)&&stmt.isTypeOnly))continue;
   const spec=stmt.moduleSpecifier;if(!spec||!ts.isStringLiteral(spec))continue;
   const id=spec.text;if(id.endsWith('.css'))continue;
   const base=id.startsWith('@/')?resolve('src',id.slice(2)):id.startsWith('.')?resolve(dirname(file),id):null;
   if(!base)continue;
   const target=[base,base+'.ts',base+'.tsx',resolve(base,'index.ts'),resolve(base,'index.tsx')].find(p=>existsSync(p)&&statSync(p).isFile());assert.ok(target,id);visit(target);
  }
 }
 visit(resolve('src/main.tsx'));
 assert.ok(seen.has(resolve('src/lib/backup/progress-startup.ts')));
 assert.ok(!seen.has(resolve('src/bootstrap-app.tsx')));
 const entry=readFileSync('src/main.tsx','utf8');assert.match(entry,/await import\('\.\/bootstrap-app'\)/);
 visit(resolve('src/mount-restore-workspace.tsx'));
 assert.ok(!seen.has(resolve('src/App.tsx')));
 assert.ok(!seen.has(resolve('src/lib/backup/capture-progress.ts')));
});

function documentFixture(){
 let reloads=0,focus;
 const doc={defaultView:{location:{reload:()=>reloads++}},createElement(tag){return {tag,ownerDocument:doc,children:[],attrs:{},listeners:{},setAttribute(k,v){this.attrs[k]=v;},append(...children){this.children.push(...children);},replaceChildren(...children){this.children=children;},addEventListener(k,v){this.listeners[k]=v;},focus(options){focus={node:this,options};}};}};
 return {root:doc.createElement('div'),get reloads(){return reloads;},get focus(){return focus;}};
}
test('startup screen presents clear states and reload-only action, preserving data and keyboard focus',()=>{
 const d=documentFixture();showProgressStartup(d.root);
 assert.equal(d.root.children[0].children[2].attrs.role,'status');assert.equal(d.root.children[0].children.length,3);assert.equal(d.focus,undefined);
 for(const reason of ['pending-restore','storage-unavailable','busy','startup-failed']){
  showProgressStartup(d.root,reason);const panel=d.root.children[0];
  assert.equal(panel.children[2].attrs.role,'alert');assert.equal(panel.children[3].textContent,'Recarregar o app');
  assert.equal(d.focus.node,panel.children[1]);assert.deepEqual(d.focus.options,{preventScroll:true});
  panel.children[3].listeners.click();
 }
 assert.equal(d.reloads,4);
});

test('explicit online startup holds an exclusive lease through App lifetime and blocks normal cooperative tabs',async()=>{
 const manager=locks(),o=options({locks:manager,exclusive:true});const running=startProgressSession(o.config);await tick();assert.equal(manager.writer,true);assert.equal(manager.readers,0);
 const other=options({locks:manager,lifetime:Promise.resolve()});await startProgressSession(other.config);assert.deepEqual(other.events,[['blocked','busy']]);o.life.resolve();await running;assert.equal(manager.writer,false);
});

test('online startup cannot bypass missing locks or coexist with an already open local tab',async()=>{
 const unsupported=options({exclusive:true,lifetime:Promise.resolve()});await startProgressSession(unsupported.config);assert.deepEqual(unsupported.events,[['blocked','busy']]);
 const manager=locks(),local=options({locks:manager});const open=startProgressSession(local.config);await tick();const online=options({locks:manager,exclusive:true,lifetime:Promise.resolve()});await startProgressSession(online.config);assert.deepEqual(online.events,[['blocked','busy']]);local.life.resolve();await open;
});
