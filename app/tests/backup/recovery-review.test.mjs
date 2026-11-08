import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
const bundled=await build({entryPoints:['src/lib/backup/restore-journal.ts'],bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent'});
const mod={exports:{}};new Function('module','exports','crypto',bundled.outputFiles[0].text)(mod,mod.exports,webcrypto);
const {prepareRestoreJournal,executePreparedRestore,recoverRestoreJournal,reviewPendingRestore,assertPendingRestoreReview,createRecoverySafetyCopy,decodeRestoreJournalPayload,RESTORE_JOURNAL_KEY:J}=mod.exports;
const origin='http://fixture.test';
async function setup(empty=false){
 const f=fixture();f.core.getState().addDraft('Registro sintético','');
 const snapshot=f.captureProgress(origin),before=empty?{core:null,fitness:null}:Object.fromEntries(Object.entries(snapshot.stores).map(([part,v])=>[part,JSON.stringify({state:v.state,version:v.version})]));
 const target=structuredClone(snapshot);target.stores.core.state.drafts.push({...target.stores.core.state.drafts[0],id:'second',title:'Segundo registro'});target.stores.core.state.user.xp_air=13;
 const journal=await prepareRestoreJournal(before,await f.createProgressBackup(target),origin);
 const memory=new Map(Object.entries(before).filter(([,v])=>v!==null).map(([p,v])=>[f.STORE_KEYS[p],v])),writes=[],reads=[];
 let hook=()=>{};
 const storage={getItem:key=>{reads.push(key);return memory.get(key)??null;},setItem:(key,v)=>{hook(writes.length+1,key);writes.push([key,v]);memory.set(key,v);},removeItem:key=>{hook(writes.length+1,key);writes.push([key,null]);memory.delete(key);}};
 return {f,before,journal,memory,writes,reads,storage,interruptAt(step){hook=n=>{if(n===step)throw Error('interrupted');};}};
}

test('pending review reads only the fixed journal/domain keys and never imports stores or auth',async()=>{
 const f=await setup();assert.equal(await reviewPendingRestore(f.storage,origin),null);assert.deepEqual(f.reads,[J]);
 assert.ok(Object.keys(bundled.metafile.inputs).every(path=>!path.includes('/stores/')&&!path.includes('/services/')));
 f.memory.set(J,f.journal);const before=[...f.memory];const result=await reviewPendingRestore(f.storage,origin);
 assert.equal(result.phase,'prepared');assert.equal(result.outcome,'rollback');assert.equal(result.before.drafts,1);assert.equal(result.target.drafts,2);
 assert.deepEqual([...f.memory],before);assert.deepEqual(f.writes,[]);assert.ok(f.reads.every(key=>[J,'conselho-elemental-local-progress-mode-v1',...Object.values(f.f.STORE_KEYS)].includes(key)));
});

test('every interrupted write is reviewed from verified versions without treating a mixed pair as current progress',async()=>{
 for(let step=1;step<=5;step++){
  const f=await setup();f.interruptAt(step);if(step===5)await executePreparedRestore(f.storage,f.journal,origin);else await assert.rejects(executePreparedRestore(f.storage,f.journal,origin),/interrupted/);
  const before=[...f.memory],count=f.writes.length,result=await reviewPendingRestore(f.storage,origin);
  if(step===1)assert.equal(result,null);else{assert.equal(result.outcome,step===5?'keep-target':'rollback');assert.equal(result.before.drafts,1);assert.equal(result.target.drafts,2);}
  assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);
  // The forecast must agree with actual recovery on a separate in-memory copy.
  const copy=new Map(before),isolated={getItem:key=>copy.get(key)??null,setItem:(key,value)=>copy.set(key,value),removeItem:key=>copy.delete(key)};
  assert.equal(await recoverRestoreJournal(isolated,origin),result===null?'none':result.outcome==='rollback'?'rolled-back':'committed');
 }
});

test('external edits are conflicts in prepared and committed operations; no unrelated bytes are parsed or overwritten',async()=>{
 for(const step of [4,5]){
  const f=await setup();f.interruptAt(step);if(step===5)await executePreparedRestore(f.storage,f.journal,origin);else await assert.rejects(executePreparedRestore(f.storage,f.journal,origin));
  f.memory.set(f.f.STORE_KEYS.fitness,'external unparseable private data');const before=[...f.memory],count=f.writes.length;
  const result=await reviewPendingRestore(f.storage,origin);assert.equal(result.outcome,'conflict');assert.equal(result.before.drafts,1);assert.equal(result.target.drafts,2);
  assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);
 }
});

test('empty original origin remains distinguishable from a zero-count profile',async()=>{
 const f=await setup(true);f.memory.set(J,f.journal);const result=await reviewPendingRestore(f.storage,origin);
 assert.equal(result.before,null);assert.equal(result.target.drafts,2);assert.equal(result.outcome,'rollback');assert.equal(f.writes.length,0);
});

test('concurrent changes invalidate asynchronous reviews and previously displayed results',async()=>{
 for(const key of [J,'conselho-elemental-storage','dominio-do-mago-workout-storage-v1']){
  const f=await setup();f.memory.set(J,f.journal);const pending=reviewPendingRestore(f.storage,origin);f.memory.set(key,'changed');
  await assert.rejects(pending,/mudou durante/);assert.equal(f.writes.length,0);
  f.memory.set(J,f.journal);for(const [part,value] of Object.entries(f.before))f.memory.set(f.f.STORE_KEYS[part],value);
  const result=await reviewPendingRestore(f.storage,origin);f.memory.delete(key);assert.throws(()=>assertPendingRestoreReview(f.storage,result),/mudou durante/);
 }
});

test('corrupt journals, wrong origin and denied reads fail with no writes or private JSON errors',async()=>{
 const f=await setup();
 for(const raw of ['private malformed journal','{"private-identifier":',f.journal.replace('"checksum":"','"checksum":"bad')]){
  f.memory.set(J,raw);const before=[...f.memory];await assert.rejects(reviewPendingRestore(f.storage,origin),error=>!error.message.includes('private-identifier')&&!error.message.includes('private malformed'));
  assert.deepEqual([...f.memory],before);
 }
 f.memory.set(J,f.journal);await assert.rejects(reviewPendingRestore(f.storage,'https://other.test'),/origem/);
 for(const side of ['before','target']){
  const journal=JSON.parse(await decodeRestoreJournalPayload(JSON.parse(f.journal).payload)),core=JSON.parse(journal[side].core);core.state.user.xp_earth=-1;journal[side].core=JSON.stringify(core);
  const payload=JSON.stringify(journal),checksum=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(payload))).toString('hex');
  f.memory.set(J,JSON.stringify({payload,checksum}));const before=[...f.memory];await assert.rejects(reviewPendingRestore(f.storage,origin),/precisam de revisão/);assert.deepEqual([...f.memory],before);
 }
 await assert.rejects(reviewPendingRestore({getItem(){throw Error('read denied');}},origin),/read denied/);assert.equal(f.writes.length,0);
});

test('copies export each protected pair exactly, preserving XP and IDs instead of exporting mixed current keys',async()=>{
 const f=await setup();f.interruptAt(3);await assert.rejects(executePreparedRestore(f.storage,f.journal,origin));
 f.memory.set('private-auth-session','synthetic-auth-secret');const review=await reviewPendingRestore(f.storage,origin),before=[...f.memory],count=f.writes.length;
 const journal=JSON.parse(await decodeRestoreJournalPayload(JSON.parse(f.journal).payload));
 for(const side of ['before','target']){
  const text=await createRecoverySafetyCopy(f.storage,review,side,origin),{backup}=await f.f.inspectProgressBackup(text);
  for(const part of ['core','fitness'])assert.deepEqual(backup.stores[part],{key:f.f.STORE_KEYS[part],...JSON.parse(journal[side][part])});
  assert.equal(backup.stores.core.state.user.xp_air,side==='target'?13:0);assert.doesNotMatch(text,/synthetic-auth-secret|private-auth-session/);
 }
 assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);
});

test('copy of an empty original is refused; conflict still permits preservation of both verified journal versions',async()=>{
 const empty=await setup(true);empty.memory.set(J,empty.journal);const reviewed=await reviewPendingRestore(empty.storage,origin);
 await assert.rejects(createRecoverySafetyCopy(empty.storage,reviewed,'before',origin),/Não havia progresso/);
 assert.ok(await createRecoverySafetyCopy(empty.storage,reviewed,'target',origin));assert.equal(empty.writes.length,0);
 const f=await setup();f.memory.set(J,f.journal);f.memory.set(f.f.STORE_KEYS.core,'external private edit');
 const review=await reviewPendingRestore(f.storage,origin);assert.equal(review.outcome,'conflict');const before=[...f.memory];
 for(const side of ['before','target'])assert.ok(await createRecoverySafetyCopy(f.storage,review,side,origin));
 assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,0);
});

test('pending copies freeze reviewed bytes and reject external changes across hashing',async()=>{
 const a=await setup();a.memory.set(J,a.journal);const review=await reviewPendingRestore(a.storage,origin),pending=createRecoverySafetyCopy(a.storage,review,'target',origin);
 review.baseline.journal='changed';review.baseline.pair.core='changed';review.target.drafts=99;
 assert.equal((await a.f.inspectProgressBackup(await pending)).summary.drafts,2);
 for(const key of [J,'conselho-elemental-storage','dominio-do-mago-workout-storage-v1']){
  const f=await setup();f.memory.set(J,f.journal);const result=await reviewPendingRestore(f.storage,origin),copy=createRecoverySafetyCopy(f.storage,result,'before',origin);
  f.memory.set(key,'changed');const before=[...f.memory];await assert.rejects(copy,/mudou/);assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,0);
 }
});

test('copy rejects invalid side, stale view, origin and malformed journal without exposing raw JSON',async()=>{
 const f=await setup();f.memory.set(J,f.journal);const review=await reviewPendingRestore(f.storage,origin);
 await assert.rejects(createRecoverySafetyCopy(f.storage,review,'current',origin));await assert.rejects(createRecoverySafetyCopy(f.storage,review,'before','https://other.test'),/origem/);
 f.memory.set(J,'private raw contents');await assert.rejects(createRecoverySafetyCopy(f.storage,review,'target',origin),/mudou/);
 const forged={...review,baseline:{...review.baseline,journal:'private raw contents'}};
 await assert.rejects(createRecoverySafetyCopy(f.storage,forged,'before',origin),error=>!error.message.includes('private raw contents'));assert.equal(f.writes.length,0);
});
