import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
const out=await build({stdin:{contents:`export * from './src/lib/backup/exclusive-restore';export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/restore-journal';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
function moduleFixture(){const mod={exports:{}};new Function('module','exports','crypto',out.outputFiles[0].text)(mod,mod.exports,webcrypto);return mod.exports;}
const deferred=()=>{let resolve;return {promise:new Promise(r=>{resolve=r;}),resolve:()=>resolve()};};
const tick=()=>new Promise(r=>setImmediate(r));
function locks(){let readers=0,exclusive=false;return {get exclusive(){return exclusive;},async request(name,options,fn){
 assert.equal(name,'conselho-elemental-progress-session-v1');assert.equal(options.ifAvailable,true);
 if(exclusive||(options.mode==='exclusive'&&readers))return fn(null);
 if(options.mode==='exclusive')exclusive=true;else readers++;
 try{return await fn({name,mode:options.mode});}finally{if(options.mode==='exclusive')exclusive=false;else readers--;}
}};}
async function setup(){
 const m=moduleFixture(),f=fixture();f.core.getState().addDraft('Progresso atual','');
 const current=f.captureProgress('http://fixture.test');const backup=await f.createProgressBackup(current);
 const before=Object.fromEntries(Object.entries(current.stores).map(([key,v])=>[key,JSON.stringify({state:v.state,version:v.version})]));
 const target=structuredClone(current);target.stores.core.state.user.xp_air=12;
 const journal=await m.prepareRestoreJournal(before,await f.createProgressBackup(target),'http://fixture.test');
 const memory=new Map(Object.entries(before).map(([part,text])=>[f.STORE_KEYS[part],text]));const manager=locks(),writes=[],reads=[];
 const storage={getItem:key=>{assert.ok(manager.exclusive);reads.push(key);return memory.get(key)??null;},setItem:(key,value)=>{assert.ok(manager.exclusive);writes.push(key);memory.set(key,value);},removeItem:key=>{assert.ok(manager.exclusive);writes.push(key);memory.delete(key);}};
 return {m,f,manager,memory,writes,reads,storage,context:{storage:()=>storage,locks:manager,origin:'http://fixture.test',otherTabsClosed:true},operation:{mode:'apply',journal,previousBackup:backup,replacementConfirmed:true}};
}

async function pendingRecovery(){
 const a=await setup(),original=a.context.storage;let n=0;
 a.context.storage=()=>({...a.storage,setItem:(key,value)=>{if(++n===3)throw Error('interrupted');a.storage.setItem(key,value);}});
 await assert.rejects(a.m.runExclusiveRestore(a.context,a.operation),/interrupted/);a.context.storage=original;
 const review=await a.m.reviewPendingRestore({getItem:key=>a.memory.get(key)??null},a.context.origin);
 a.writes.length=0;a.reads.length=0;
 return {...a,recovery:{mode:'recover',expected:review.baseline,recoveryConfirmed:true}};
}

test('application holds exclusivity through validation and every write, verifies prior copy and releases after success',async()=>{
 const {m,context,operation,manager,memory,f}=await setup();assert.equal(await m.runExclusiveRestore(context,operation),'applied');
 assert.equal(manager.exclusive,false);assert.equal(memory.has(m.RESTORE_JOURNAL_KEY),true);assert.equal(JSON.parse(memory.get(f.STORE_KEYS.core)).state.user.xp_air,12);
});

test('no lock support, no close-tabs confirmation or held session refuse without reading progress',async()=>{
 for(const mode of ['unsupported','unconfirmed','invalid-confirmation','held']){
  const {m,context,operation,manager,writes,reads}=await setup();const life=deferred();let held;
  if(mode==='unsupported')context.locks=undefined;
  if(mode==='unconfirmed')context.otherTabsClosed=false;
  if(mode==='invalid-confirmation')context.otherTabsClosed='true';
  if(mode==='held'){held=manager.request(m.PROGRESS_SESSION_LOCK,{mode:'shared',ifAvailable:true},()=>life.promise);await tick();}
  await assert.rejects(m.runExclusiveRestore(context,operation));assert.equal(writes.length,0);assert.equal(reads.length,0);
  if(held){life.resolve();await held;}
 }
});

test('replacement consent and exact prior backup are required; refusal keeps bytes and releases lease',async()=>{
 for(const mode of ['consent','invalid-consent','missing','stale','origin']){
  const {m,context,operation,f,memory,writes,manager}=await setup();
  if(mode==='consent')operation.replacementConfirmed=false;
  if(mode==='invalid-consent')operation.replacementConfirmed='true';
  if(mode==='missing')operation.previousBackup=null;
  if(mode==='stale'||mode==='origin'){
   const {checksum,...snapshot}=JSON.parse(operation.previousBackup);
   if(mode==='stale')snapshot.stores.core.state.drafts=[];else snapshot.source.origin='https://other.test';
   operation.previousBackup=await f.createProgressBackup(snapshot);
  }
  const before=[...memory];await assert.rejects(m.runExclusiveRestore(context,operation));assert.deepEqual([...memory],before);assert.equal(writes.length,0);assert.equal(manager.exclusive,false);
 }
});

test('pending operation cannot gain new consent or change the selected journal after dispatch',async()=>{
 const a=await setup(),hold=deferred();
 a.context.locks={request:async(name,options,fn)=>{await hold.promise;return a.manager.request(name,options,fn);}};
 a.operation.replacementConfirmed=false;const rejected=a.m.runExclusiveRestore(a.context,a.operation);a.operation.replacementConfirmed=true;hold.resolve();await assert.rejects(rejected,/Confirme/);assert.equal(a.writes.length,0);
 const b=await setup(),delay=deferred();b.context.locks={request:async(name,options,fn)=>{await delay.promise;return b.manager.request(name,options,fn);}};
 const result=b.m.runExclusiveRestore(b.context,b.operation);b.operation.journal='corrupt';b.context.origin='other';delay.resolve();assert.equal(await result,'applied');
});

test('write failure leaves journal and exclusive recovery restores old bytes before releasing',async()=>{
 const {m,context,operation,storage,memory,writes,manager}=await setup();const original=[...memory];let n=0;
 context.storage=()=>({...storage,setItem:(key,value)=>{if(++n===3)throw Error('quota');storage.setItem(key,value);}});
 await assert.rejects(m.runExclusiveRestore(context,operation),/quota/);assert.ok(memory.has(m.RESTORE_JOURNAL_KEY));assert.equal(manager.exclusive,false);
 const review=await m.reviewPendingRestore({getItem:key=>memory.get(key)??null},context.origin);
 context.storage=()=>storage;assert.equal(await m.runExclusiveRestore(context,{mode:'recover',expected:review.baseline,recoveryConfirmed:true}),'rolled-back');
 assert.deepEqual([...memory].sort(),original.sort());assert.ok(writes.length>0);assert.equal(manager.exclusive,false);
});

test('same document cannot restore after application import begins, including partially failed startup',async()=>{
 for(const fail of [false,true]){
  const {m,context,operation,reads,writes}=await setup();
  await m.startProgressSession({storage:()=>({getItem:()=>null}),load:async()=>{if(fail)throw Error('partial import');},blocked:()=>{},lifetime:Promise.resolve()});
  assert.equal(m.hasProgressAppStarted(),true);await assert.rejects(m.runExclusiveRestore(context,operation),/já foi iniciado/);assert.equal(reads.length,0);assert.equal(writes.length,0);
 }
});

test('recovery refuses missing or invalid confirmation and an absent reviewed baseline before writes',async()=>{
 for(const variant of ['missing','false','string','no-baseline']){
  const a=await pendingRecovery();if(variant==='missing')delete a.recovery.recoveryConfirmed;
  if(variant==='false')a.recovery.recoveryConfirmed=false;if(variant==='string')a.recovery.recoveryConfirmed='true';
  if(variant==='no-baseline')delete a.recovery.expected;
  const before=[...a.memory];await assert.rejects(a.m.runExclusiveRestore(a.context,a.recovery));assert.deepEqual([...a.memory],before);assert.equal(a.writes.length,0);assert.equal(a.manager.exclusive,false);
 }
});

test('reviewed bytes are required even if changed values could otherwise be recovered',async()=>{
 for(const key of ['journal','core','removed-journal']){
  const a=await pendingRecovery();
  if(key==='journal')a.memory.set(a.m.RESTORE_JOURNAL_KEY,JSON.stringify(JSON.parse(a.operation.journal),null,2));
  if(key==='core')a.memory.set(a.f.STORE_KEYS.core,JSON.parse(await a.m.decodeRestoreJournalPayload(JSON.parse(a.operation.journal).payload)).before.core);
  if(key==='removed-journal')a.memory.delete(a.m.RESTORE_JOURNAL_KEY);
  const before=[...a.memory];await assert.rejects(a.m.runExclusiveRestore(a.context,a.recovery),/mudou|confer/);assert.deepEqual([...a.memory],before);assert.equal(a.writes.length,0);
 }
});

test('recovery binds nested reviewed bytes before a delayed lock and rechecks them after hashing',async()=>{
 const a=await pendingRecovery(),gate=deferred();
 a.context.locks={request:async(name,options,fn)=>{await gate.promise;return a.manager.request(name,options,fn);}};
 const result=a.m.runExclusiveRestore(a.context,a.recovery);
 a.recovery.expected.journal='changed';a.recovery.expected.pair.core='changed';a.recovery.recoveryConfirmed=false;gate.resolve();
 assert.equal(await result,'rolled-back');assert.equal(a.memory.has(a.m.RESTORE_JOURNAL_KEY),false);
 const b=await pendingRecovery();const beforeCore=JSON.parse(await b.m.decodeRestoreJournalPayload(JSON.parse(b.operation.journal).payload)).before.core;const pending=b.m.runExclusiveRestore(b.context,b.recovery);
 b.memory.set(b.f.STORE_KEYS.core,beforeCore);
 const before=[...b.memory];await assert.rejects(pending,/mudou/);assert.deepEqual([...b.memory],before);assert.equal(b.writes.length,0);assert.equal(b.manager.exclusive,false);
});
