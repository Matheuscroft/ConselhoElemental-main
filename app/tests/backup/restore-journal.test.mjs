import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { webcrypto } from 'node:crypto';
import { fixture } from './load-progress.mjs';
const bundled = await build({entryPoints:['src/lib/backup/restore-journal.ts'],bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
const mod={exports:{}};
new Function('module','exports','crypto',bundled.outputFiles[0].text)(mod,mod.exports,webcrypto);
const {prepareRestoreJournal,executePreparedRestore,recoverRestoreJournal,RESTORE_JOURNAL_KEY:J}=mod.exports;
const origin='http://fixture.test';
const coreKey='conselho-elemental-storage', fitnessKey='dominio-do-mago-workout-storage-v1';
function storage(before) {
  const memory=new Map(Object.entries({[coreKey]:before.core,[fitnessKey]:before.fitness}).filter(([,v])=>v!==null));
  memory.set('unrelated','untouched');
  const mutations=[];
  let step=0,hook=()=>{};
  const mutate=(key,value)=>{ const n=++step;hook(n,'before',key,value);if(value===null)memory.delete(key);else memory.set(key,value);mutations.push([key,value]);hook(n,'after',key,value); };
  return {memory,mutations,getItem:key=>memory.get(key)??null,setItem:(key,value)=>mutate(key,value),removeItem:key=>mutate(key,null),inject(fn){step=0;hook=fn;},pair(){return {core:this.getItem(coreKey),fitness:this.getItem(fitnessKey)};}};
}
async function setup(beforeOverride) {
  const f=fixture();f.core.getState().addDraft('Original','');
  const snapshot=f.captureProgress(origin);
  const before=beforeOverride??Object.fromEntries(Object.entries(snapshot.stores).map(([part,v])=>[part,JSON.stringify({state:v.state,version:v.version})]));
  const target=structuredClone(snapshot);target.stores.core.state.drafts[0].title='Importado';target.stores.core.state.user.xp_fire=17;
  target.stores.fitness.state.nativeDataById.local={nativeCatalog:[],templates:[],sequences:[],nativeCheckins:{},activeNativeSession:null,nativeHistory:[{id:'00000000-0000-4000-8000-000000000001',nameSnapshot:'Sessão sintética',status:'completed',startedAt:'2026-10-28T12:00:00Z',completedAt:'2026-10-28T12:01:00Z',durationSeconds:60,totalER:0,exerciseResults:[]}]};
  const backup=await f.createProgressBackup(target);
  const text=await prepareRestoreJournal(before,backup,origin);
  const expected=JSON.parse(JSON.parse(text).payload).target;
  return {f,before,backup,text,expected,store:storage(before)};
}
const stop=()=>{throw new Error('simulated interruption/quota');};

test('protocol writes both existing keys, preserves exact XP and unrelated data, and retains the committed handoff barrier',async()=>{
  const {store,text,expected}=await setup();
  await executePreparedRestore(store,text,origin);
  assert.deepEqual(store.pair(),expected);assert.ok(store.getItem(J));
  assert.equal(JSON.parse(store.getItem(coreKey)).state.user.xp_fire,17);
  assert.equal(store.getItem('unrelated'),'untouched');
  assert.equal(await recoverRestoreJournal(store,origin),'committed');
  assert.deepEqual(store.mutations.map(([k])=>k),[J,coreKey,fitnessKey,J]);
});

test('interruption before and after EACH write recovers coherent old or committed pair',async()=>{
  for(const side of ['before','after'])for(let step=1;step<=4;step++){
    const {store,text,before,expected}=await setup();
    store.inject((n,s)=>{if(n===step&&s===side)stop();});
    await assert.rejects(executePreparedRestore(store,text,origin),/simulated/);
    store.inject(()=>{});
    const outcome=await recoverRestoreJournal(store,origin);
    const committed=step===4&&side==='after';
    assert.deepEqual(store.pair(),committed?expected:before,`${side} ${step}`);
    assert.equal(store.getItem(J)!==null,committed);assert.equal(await recoverRestoreJournal(store,origin),committed?'committed':'none');
    assert.ok(['none','rolled-back','committed'].includes(outcome));
  }
});

test('quota before journal prevents data writes; failed rollback retains evidence and is retryable',async()=>{
  const a=await setup();a.store.inject((n,s)=>{if(n===1&&s==='before')stop();});
  await assert.rejects(executePreparedRestore(a.store,a.text,origin));assert.deepEqual(a.store.pair(),a.before);assert.equal(a.store.mutations.length,0);
  // Leave both destination values written but no commit.
  const b=await setup();b.store.inject((n,s)=>{if(n===4&&s==='before')stop();});
  await assert.rejects(executePreparedRestore(b.store,b.text,origin));
  b.store.inject((n,s)=>{if(n===2&&s==='before')stop();});
  await assert.rejects(recoverRestoreJournal(b.store,origin));assert.ok(b.store.getItem(J));
  b.store.inject(()=>{});assert.equal(await recoverRestoreJournal(b.store,origin),'rolled-back');assert.deepEqual(b.store.pair(),b.before);
});

test('recovery itself can be interrupted at every write boundary and resumed',async()=>{
  for(const side of ['before','after'])for(let step=1;step<=3;step++){
    const {store,text,before}=await setup();store.inject((n,s)=>{if(n===4&&s==='before')stop();});
    await assert.rejects(executePreparedRestore(store,text,origin));
    store.inject((n,s)=>{if(n===step&&s===side)stop();});
    await assert.rejects(recoverRestoreJournal(store,origin));
    store.inject(()=>{});await recoverRestoreJournal(store,origin);
    assert.deepEqual(store.pair(),before);assert.equal(store.getItem(J),null);
  }
});

test('rollback preserves original valid whitespace and an entirely absent pair',async()=>{
  const initial=await setup();
  for(const before of [{core:null,fitness:null},{core:'  '+initial.before.core+'  ',fitness:'\n'+initial.before.fitness+'\n'}]){
    const {store,text}=await setup(before);store.inject((n,s)=>{if(n===4&&s==='before')stop();});
    await assert.rejects(executePreparedRestore(store,text,origin));store.inject(()=>{});
    await recoverRestoreJournal(store,origin);assert.deepEqual(store.pair(),before);
  }
});

test('stale state, existing journal and changed origin refuse writes',async()=>{
  for(const kind of ['state','journal','origin']){
    const {store,text}=await setup();
    if(kind==='state')store.memory.set(coreKey,'external');
    if(kind==='journal')store.memory.set(J,'existing');
    const baseline=[...store.memory];
    await assert.rejects(executePreparedRestore(store,text,kind==='origin'?'http://other.test':origin));
    assert.deepEqual([...store.memory],baseline);assert.equal(store.mutations.length,0);
  }
});

test('unexpected edits block recovery of BOTH modules and retain journal',async()=>{
  for(const committed of [false,true]){
    const {store,text}=await setup();store.inject((n,s)=>{if(n===4&&s===(committed?'after':'before'))stop();});
    await assert.rejects(executePreparedRestore(store,text,origin));store.inject(()=>{});
    store.memory.set(fitnessKey,'external edit');const baseline=[...store.memory],n=store.mutations.length;
    await assert.rejects(recoverRestoreJournal(store,origin),/alterad|externas/);
    assert.deepEqual([...store.memory],baseline);assert.equal(store.mutations.length,n);
  }
});

test('corrupt and unsupported journal, denied read, tampered backup all fail without writes',async()=>{
  const {store,text,before,backup}=await setup();
  const envelope=JSON.parse(text),payload=JSON.parse(envelope.payload);payload.version=2;
  const changed=JSON.stringify(payload);
  const checksum=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(changed))).toString('hex');
  for(const bad of ['{',JSON.stringify({...envelope,checksum:'wrong'}),JSON.stringify({payload:changed,checksum})]){
    store.memory.set(J,bad);const baseline=[...store.memory];
    await assert.rejects(recoverRestoreJournal(store,origin));assert.deepEqual([...store.memory],baseline);
  }
  assert.equal(store.mutations.length,0);
  await assert.rejects(recoverRestoreJournal({...store,getItem:stop},origin));
  await assert.rejects(prepareRestoreJournal(before,backup.replace('Importado','Adulterado'),origin));
});

test('silent ignored writes are detected; recovery never removes journal without verified outcome',async()=>{
  for(let skip=1;skip<=4;skip++){
    const {store,text,before}=await setup();let n=0;
    const adapter={getItem:store.getItem,setItem:(k,v)=>{if(++n!==skip)store.setItem(k,v);},removeItem:k=>{if(++n!==skip)store.removeItem(k);}};
    await assert.rejects(executePreparedRestore(adapter,text,origin),/confirmada/);
    await recoverRestoreJournal(store,origin);
    assert.deepEqual(store.pair(),before);assert.equal(store.getItem(J),null);
  }
});

test('snapshot preparation freezes before values and pending recovery detects journal replacement',async()=>{
  const {before,backup,text,store}=await setup();const baseline={...before};
  const pending=prepareRestoreJournal(before,backup,origin);before.core='later';
  assert.deepEqual(JSON.parse(JSON.parse(await pending).payload).before,baseline);
  store.memory.set(J,text);const recovery=recoverRestoreJournal(store,origin);store.memory.set(J,'another operation');
  await assert.rejects(recovery,/Diário mudou/);assert.equal(store.mutations.length,0);
});

test('committed synthetic data hydrates the real stores without replaying XP',async()=>{
  const {store,text,expected}=await setup();await executePreparedRestore(store,text,origin);
  const reload=fixture([...store.memory]);
  assert.equal(reload.core.persist.hasHydrated(),true);assert.equal(reload.fitness.persist.hasHydrated(),true);
  const target=JSON.parse(expected.core).state;
  assert.deepEqual(JSON.parse(JSON.stringify(reload.core.getState().drafts)),target.drafts);
  assert.equal(reload.core.getState().user.id,target.user.id);assert.equal(reload.core.getState().user.xp_fire,17);
  assert.equal(reload.fitness.getState().nativeHistory[0].id,'00000000-0000-4000-8000-000000000001');
  const again=fixture([...reload.memory]);assert.equal(again.core.getState().user.xp_fire,17);
});

test('strict journal schema rejects rehashed invalid phases, extra keys and incomplete destinations',async()=>{
  const {store,text}=await setup();
  for(const change of [j=>{j.phase=['prepared'];},j=>{j.target.core=null;},j=>{j.before.other='extra';},j=>{j.extra=true;}]){
    const j=JSON.parse(JSON.parse(text).payload);change(j);const payload=JSON.stringify(j);
    const checksum=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(payload))).toString('hex');
    store.memory.set(J,JSON.stringify({payload,checksum}));const baseline=[...store.memory];
    await assert.rejects(recoverRestoreJournal(store,origin));assert.deepEqual([...store.memory],baseline);assert.equal(store.mutations.length,0);
  }
});

test('preparing a restore rejects checksum-valid but critically invalid data without writing',async()=>{
 const {f,before,backup,store}=await setup();const {checksum,...snapshot}=JSON.parse(backup);
 snapshot.stores.core.state.user.xp_fire=-5;
 const corrupted=await f.createProgressBackup(snapshot);const memory=[...store.memory];
 await assert.rejects(prepareRestoreJournal(before,corrupted,origin),/precisam de revisão/);
 assert.deepEqual([...store.memory],memory);assert.equal(store.mutations.length,0);
});
