import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';
async function setup(){
 const f=fixture();f.core.getState().addDraft('Plano atual','');const snapshot=f.captureProgress('http://fixture.test');
 const incoming=structuredClone(snapshot);incoming.stores.core.state.user.xp_fire=10;incoming.stores.core.state.drafts[0].notes='Outra nota';
 const text=await f.createProgressBackup(incoming);const reads=[];
 const storage={getItem:key=>{reads.push(key);return f.memory.get(key)??null;}};
 return {f,storage,reads,text};
}

test('isolated preview compares the two real persisted projections without importing live stores into its API',async()=>{
 const {f,storage,reads,text}=await setup();const baseline=[...f.memory];
 const result=await f.prepareWorkspacePreview(text,storage,'http://fixture.test');
 assert.equal(result.summary.tasks,0);assert.equal(result.comparison.accounts[0].xp.find(x=>x.label==='Fogo').after,10);
 assert.ok(result.comparison.accounts[0].rows.some(r=>r.changed>0));assert.equal(result.audit.issues.length,0);
 assert.deepEqual([...f.memory],baseline);
 assert.ok(reads.every(key=>[f.STORE_KEYS.core,f.STORE_KEYS.fitness,'conselho-elemental-account-resolution-v1','conselho-elemental-restore-journal-v1','conselho-elemental-local-progress-mode-v1','conselho-elemental-account-intent-v1'].includes(key)));
});

test('pending journal stops before reading either domain store or presenting a mixed snapshot',async()=>{
 const {f,storage,reads,text}=await setup();f.memory.set('conselho-elemental-restore-journal-v1','');const baseline=[...f.memory];
 await assert.rejects(f.prepareWorkspacePreview(text,storage,'http://fixture.test'),/recuperação pendente/);
 assert.deepEqual(reads,['conselho-elemental-account-resolution-v1','conselho-elemental-restore-journal-v1']);assert.deepEqual([...f.memory],baseline);
});

test('preview detects changes during hashing, including a new journal, without writes',async()=>{
 for(const part of ['core','fitness','journal']){
  const {f,storage,text}=await setup();const pending=f.prepareWorkspacePreview(text,storage,'http://fixture.test');
  f.memory.set(part==='journal'?'conselho-elemental-restore-journal-v1':f.STORE_KEYS[part],'concurrent write');
  const baseline=[...f.memory];await assert.rejects(pending,/progresso mudou/);assert.deepEqual([...f.memory],baseline);
 }
});

test('safety copy is checksum-valid and current; changes invalidate pending download preparation',async()=>{
 const {f,storage}=await setup();f.memory.set('sb-private-session','fixture-secret');
 const before=[...f.memory];const copy=await f.createWorkspaceSafetyCopy(storage,'http://fixture.test');
 assert.equal((await f.inspectProgressBackup(copy.text)).summary.drafts,1);assert.doesNotMatch(copy.text,/fixture-secret/);assert.deepEqual([...f.memory],before);
 const pending=f.createWorkspaceSafetyCopy(storage,'http://fixture.test');f.memory.set(f.STORE_KEYS.core,'changed');
 await assert.rejects(pending,/progresso mudou/);
});

test('empty origin, denied read, malformed baseline and tampered archive remain distinct and read-only',async()=>{
 const {f,text}=await setup();
 const empty={getItem:()=>null};const result=await f.prepareWorkspacePreview(text,empty,'http://fixture.test');assert.equal(result.comparison,null);assert.equal(result.baseline.snapshot,null);
 await assert.rejects(f.createWorkspaceSafetyCopy(empty,'http://fixture.test'),/Não há progresso/);
 await assert.rejects(f.prepareWorkspacePreview(text,{getItem:()=>{throw Error('denied');}},'http://fixture.test'),/denied/);
 await assert.rejects(f.prepareWorkspacePreview(text,{getItem:key=>key===f.STORE_KEYS.core?'{}':null},'http://fixture.test'),/ausente/);
 await assert.rejects(f.prepareWorkspacePreview(text.replace('Outra nota','adulterado'),empty,'http://fixture.test'),/conteúdo mudou/);
 const malformed={getItem:key=>key==='conselho-elemental-account-resolution-v1'||key==='conselho-elemental-restore-journal-v1'||key==='conselho-elemental-local-progress-mode-v1'||key==='conselho-elemental-account-intent-v1'?null:key===f.STORE_KEYS.core?'private broken contents':'{}'};
 await assert.rejects(f.prepareWorkspacePreview(text,malformed,'http://fixture.test'),error=>/Não foi possível ler/.test(error.message)&&!error.message.includes('private broken'));
});


test('an account transfer blocks restore comparison and safety preparation before reading domain data',async()=>{
 const {f,storage,reads,text}=await setup();f.memory.set('conselho-elemental-account-intent-v1','pending');await assert.rejects(f.prepareWorkspacePreview(text,storage,'http://fixture.test'),/conferência de conta pendente/);assert.deepEqual(reads,['conselho-elemental-account-resolution-v1','conselho-elemental-restore-journal-v1','conselho-elemental-account-intent-v1']);
});
