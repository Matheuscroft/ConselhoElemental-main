import test from 'node:test';import assert from 'node:assert/strict';import {build} from 'esbuild';import {createHash} from 'node:crypto';import {fixture} from './load-progress.mjs';
const output=await build({stdin:{contents:"export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/restore-confirmation';export * from './src/lib/backup/exclusive-restore';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});const module={exports:{}};new Function('module','exports',output.outputFiles[0].text)(module,module.exports);const api=module.exports;
const origin='https://fixture.test',limit=5*1024*1024;
function quotaStorage(before,cap=limit){const memory=new Map(Object.entries(before).map(([part,value])=>[part==='core'?'conselho-elemental-storage':'dominio-do-mago-workout-storage-v1',value]).filter(([,v])=>v!==null));memory.set('unrelated','untouched');let peak=0;
 const used=next=>[...next].reduce((n,[k,v])=>n+2*(k.length+v.length),0);return {memory,used:()=>used(memory),get peak(){return peak;},getItem:k=>memory.get(k)??null,setItem(k,v){const next=new Map(memory);next.set(k,v);const bytes=used(next);if(bytes>cap)throw new DOMException('The quota has been exceeded.','QuotaExceededError');memory.set(k,v);peak=Math.max(peak,bytes);},removeItem:k=>memory.delete(k)};}
async function setup(){const f=fixture(),initial=f.captureProgress(origin),before=Object.fromEntries(Object.entries(initial.stores).map(([part,v])=>[part,JSON.stringify({state:v.state,version:v.version})]));
 for(let i=0;i<35;i++)f.core.getState().addDraft('Synthetic large note '+i,'abcde'.repeat(4000));const habit=f.core.getState().addHabit({name:'Quota fixture',elementId:'ar',plannedTimeMinutes:5,plannedPoints:2});f.core.getState().completeHabit(habit.id,5,new Date());
 const snapshot=JSON.parse(JSON.stringify(f.captureProgress('http://127.0.0.1:5173')));snapshot.appVersion='0.1.130';const backup=await f.createProgressBackup(snapshot),journal=await api.prepareRestoreJournal(before,backup,origin);const payload=await api.decodeRestoreJournalPayload(JSON.parse(journal).payload);const old=JSON.stringify({payload,checksum:createHash('sha256').update(payload).digest('hex')});return {f,before,backup,snapshot,journal,old};}
const context=storage=>({origin,storage:()=>storage,otherTabsClosed:true,locks:{request:async(_,o,fn)=>fn({mode:o.mode})}});
function check(storage,snapshot){for(const p of Object.values(snapshot.stores))assert.deepEqual(JSON.parse(storage.getItem(p.key)).state,p.state);assert.equal(storage.getItem(api.RESTORE_JOURNAL_KEY),null);assert.equal(storage.getItem('unrelated'),'untouched');}

test('realistic 5MiB quota reproduces the old failure and accepts the same complete archive with compressed recovery',async()=>{
 const f=await setup();
 // Exercise the byte-identical old journal directly to isolate quota from consent.
 const old=quotaStorage(f.before);await assert.rejects(api.executePreparedRestore(old,f.old,origin),e=>e.name==='QuotaExceededError');assert.ok(old.getItem(api.RESTORE_JOURNAL_KEY));
 const fresh=quotaStorage(f.before),preview=await f.f.prepareWorkspacePreview(f.backup,fresh,origin),prepared=await api.prepareLocalImport(preview,fresh,origin);assert.ok(JSON.parse(prepared.journal).payload.startsWith('gzip-v1:'));
 assert.equal(await api.runExclusiveRestore(context(fresh),{mode:'import-local',...prepared,replacementConfirmed:true}),'local-ready');check(fresh,f.snapshot);assert.ok(fresh.peak<limit);assert.ok(prepared.journal.length<f.old.length/3);
});

test('one resume completes an old quota-interrupted plain journal without reselecting or losing XP',async()=>{
 const f=await setup(),storage=quotaStorage(f.before);await assert.rejects(api.executePreparedRestore(storage,f.old,origin),e=>e.name==='QuotaExceededError');const review=await api.reviewPendingRestore(storage,origin);assert.equal(review.outcome,'rollback');
 assert.equal(await api.runExclusiveRestore(context(storage),{mode:'resume-import-local',expected:review.baseline,recoveryConfirmed:true}),'local-ready');check(storage,f.snapshot);assert.ok(storage.peak<=limit);
 const reloaded=fixture([],storage.memory);assert.equal(reloaded.core.getState().user.xp_air,f.snapshot.stores.core.state.user.xp_air);assert.equal(reloaded.core.getState().drafts.length,35);
});

test('a destination larger than quota fails protected, while conflicts or missing resume consent never overwrite data',async()=>{
 const f=await setup(),small=quotaStorage(f.before,1.5*1024*1024),preview=await f.f.prepareWorkspacePreview(f.backup,small,origin),prepared=await api.prepareLocalImport(preview,small,origin);await assert.rejects(api.runExclusiveRestore(context(small),{mode:'import-local',...prepared,replacementConfirmed:true}),e=>e.name==='QuotaExceededError');assert.ok(small.getItem(api.RESTORE_JOURNAL_KEY));
 const review=await api.reviewPendingRestore(small,origin);assert.equal(await api.runExclusiveRestore(context(small),{mode:'recover',expected:review.baseline,recoveryConfirmed:true}),'rolled-back');for(const [part,value] of Object.entries(f.before))assert.equal(small.getItem(part==='core'?'conselho-elemental-storage':'dominio-do-mago-workout-storage-v1'),value);
 const conflict=quotaStorage(f.before);conflict.setItem(api.RESTORE_JOURNAL_KEY,f.journal);const r=await api.reviewPendingRestore(conflict,origin),before=[...conflict.memory];await assert.rejects(api.runExclusiveRestore(context(conflict),{mode:'resume-import-local',expected:r.baseline,recoveryConfirmed:false}));assert.deepEqual([...conflict.memory],before);
 conflict.setItem('conselho-elemental-storage',JSON.stringify({external:'edit'}));const changed=[...conflict.memory];await assert.rejects(api.runExclusiveRestore(context(conflict),{mode:'resume-import-local',expected:r.baseline,recoveryConfirmed:true}));assert.deepEqual([...conflict.memory],changed);
});

test('each interrupted resume write retains a recoverable journal and retries without duplicating progress',async()=>{
 const f=await setup();
 for(let boundary=1;boundary<=5;boundary++){
  const storage=quotaStorage(f.before);await assert.rejects(api.executePreparedRestore(storage,f.old,origin),e=>e.name==='QuotaExceededError');const review=await api.reviewPendingRestore(storage,origin);let writes=0;
  const interrupted={...storage,setItem(k,v){if(++writes===boundary)throw new Error('interrupted resume');storage.setItem(k,v);},removeItem(k){if(++writes===boundary)throw new Error('interrupted resume');storage.removeItem(k);}};
  await assert.rejects(api.runExclusiveRestore(context(interrupted),{mode:'resume-import-local',expected:review.baseline,recoveryConfirmed:true}),/interrupted resume/);assert.ok(storage.getItem(api.RESTORE_JOURNAL_KEY));
  const next=await api.reviewPendingRestore(storage,origin);assert.equal(await api.runExclusiveRestore(context(storage),{mode:'resume-import-local',expected:next.baseline,recoveryConfirmed:true}),'local-ready');check(storage,f.snapshot);
 }
});
