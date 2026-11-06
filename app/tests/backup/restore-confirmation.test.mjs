import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
const compiled=await build({stdin:{contents:`export * from './src/lib/backup/restore-confirmation';export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/exclusive-restore';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
const mod={exports:{}};new Function('require','module','exports','crypto',compiled.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);
const api=mod.exports,origin='http://fixture.test',mode='conselho-elemental-local-progress-mode-v1';
async function setup(empty=false){
 const f=fixture();f.core.getState().addDraft('Original','');const safety=await f.createWorkspaceSafetyCopy({getItem:k=>f.memory.get(k)??null},origin);
 const changed=f.captureProgress(origin);changed.stores.core.state.drafts[0].notes='Importado';const text=await f.createProgressBackup(changed);
 const memory=empty?new Map():new Map(f.memory),writes=[];
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{writes.push(k);memory.set(k,v);},removeItem:k=>{writes.push(k);memory.delete(k);}};
 const preview=await f.prepareWorkspacePreview(text,storage,origin);
 return {f,memory,storage,writes,preview,safety};
}

test('saved copy is read back against current data; missing, mismatched, foreign and corrupt files never prepare writes',async()=>{
 const f=await setup();const before=[...f.memory];await api.verifyPreviousSafetyCopy(f.safety.text,f.preview.baseline,f.storage,origin);
 await assert.rejects(api.prepareConfirmedRestore(f.preview,null,f.storage,origin),/arquivo salvo/);
 await assert.rejects(api.verifyPreviousSafetyCopy(f.preview.text,f.preview.baseline,f.storage,origin),/não corresponde/);
 const foreign=f.f.captureProgress('https://other.test');await assert.rejects(api.verifyPreviousSafetyCopy(await f.f.createProgressBackup(foreign),f.preview.baseline,f.storage,origin),/não corresponde/);
 await assert.rejects(api.verifyPreviousSafetyCopy(f.safety.text.replace('Original','Adulterado'),f.preview.baseline,f.storage,origin),/conteúdo mudou/);
 for(const field of ['issues','truncated']){const preview={...f.preview,audit:{...f.preview.audit,[field]:field==='issues'?[{message:'Revisar'}]:true}};await assert.rejects(api.prepareConfirmedRestore(preview,f.safety.text,f.storage,origin),/precisa de revisão/);}
 assert.deepEqual([...f.memory],before);assert.deepEqual(f.writes,[]);
});

test('changes to domain data, journal or local mode invalidate asynchronous preparation and saved-copy readback',async()=>{
 for(const stage of ['copy','prepare'])for(const key of [mode,api.RESTORE_JOURNAL_KEY,'conselho-elemental-storage']){
  const f=await setup();const pending=stage==='copy'?api.verifyPreviousSafetyCopy(f.safety.text,f.preview.baseline,f.storage,origin):api.prepareConfirmedRestore(f.preview,f.safety.text,f.storage,origin);
  f.memory.set(key,'concurrent change');await assert.rejects(pending,/mudou|pendente/);assert.deepEqual(f.writes,[]);
 }
});

test('selected archive and baseline are frozen before asynchronous checks; empty origin needs no previous copy',async()=>{
 const f=await setup(),selected=f.preview.text;const pending=api.prepareConfirmedRestore(f.preview,f.safety.text,f.storage,origin);
 f.preview.text='changed after confirmation';f.preview.baseline.pair.core='changed caller object';
 const prepared=JSON.parse(JSON.parse(await pending).payload);assert.equal(prepared.target.core,JSON.stringify({state:(await f.f.inspectProgressBackup(selected)).backup.stores.core.state,version:(await f.f.inspectProgressBackup(selected)).backup.stores.core.version}));assert.deepEqual(f.writes,[]);
 const empty=await setup(true);await assert.rejects(api.prepareConfirmedRestore(empty.preview,empty.safety.text,empty.storage,origin),/não possuía/);
 const journal=await api.prepareConfirmedRestore(empty.preview,null,empty.storage,origin);assert.equal(JSON.parse(JSON.parse(journal).payload).before.core,null);assert.deepEqual(empty.writes,[]);
});

test('real preview, saved copy, confirmations, application and local handoff preserve the selected data',async()=>{
 const f=await setup();const journal=await api.prepareConfirmedRestore(f.preview,f.safety.text,f.storage,origin);
 const context={origin,storage:()=>f.storage,otherTabsClosed:true,locks:{request:async(_,options,fn)=>fn({mode:options.mode})}};
 assert.equal(await api.runExclusiveRestore(context,{mode:'apply',journal,previousBackup:f.safety.text,replacementConfirmed:true}),'applied');
 const review=await api.reviewPendingRestore(f.storage,origin);assert.equal(review.outcome,'keep-target');
 assert.equal(await api.runExclusiveRestore(context,{mode:'local',expected:review.baseline,localUseConfirmed:true}),'local-ready');
 assert.equal(f.storage.getItem(api.RESTORE_JOURNAL_KEY),null);assert.ok(f.storage.getItem(mode));
 const restored=fixture([],f.memory);assert.equal(restored.core.getState().drafts[0].notes,'Importado');assert.equal(restored.core.getState().user.id,f.f.core.getState().user.id);
});

test('cancellation while waiting for coordination or crypto rejects before the first write',async()=>{
 for(const stage of ['lock','crypto']){
  const f=await setup(),journal=await api.prepareConfirmedRestore(f.preview,f.safety.text,f.storage,origin);let active=true,acquire;
  const context={origin,storage:()=>f.storage,otherTabsClosed:true,isCurrent:()=>active,locks:{request:(_,options,fn)=>stage==='lock'?new Promise(resolve=>{acquire=()=>resolve(fn({mode:options.mode}));}):fn({mode:options.mode})}};
  const pending=api.runExclusiveRestore(context,{mode:'apply',journal,previousBackup:f.safety.text,replacementConfirmed:true});active=false;acquire?.();
  await assert.rejects(pending,/cancelada/);assert.deepEqual(f.writes,[]);
 }
});
