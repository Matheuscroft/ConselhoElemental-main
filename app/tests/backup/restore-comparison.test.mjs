import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';
const snapshot = f => f.captureProgress('http://fixture.test');
const archive = (f, value) => f.createProgressBackup(value);
const row = (plan, label, accountId = 'local') => plan.accounts.find(a => a.id === accountId).rows.find(r => r.label === label);

test('comparison catches replacement with identical counts and changed nested content, without writes', async () => {
  const f=fixture(); f.core.getState().addDraft('Antes','');
  const current=snapshot(f), incoming=structuredClone(current);
  incoming.stores.core.state.drafts=[{...incoming.stores.core.state.drafts[0],id:'replacement',title:'Depois'}];
  const memory=[...f.memory];const core=f.core.getState(),fitness=f.fitness.getState();
  const plan=await f.compareProgressBackup(await archive(f,incoming),current);
  assert.deepEqual(row(plan,'Rascunhos'),{label:'Rascunhos',before:1,after:1,added:1,removed:1,changed:0});
  incoming.stores.core.state.drafts=structuredClone(current.stores.core.state.drafts);
  incoming.stores.core.state.drafts[0].notes='Outro conteúdo';
  const edited=await f.compareProgressBackup(await archive(f,incoming),current);
  assert.equal(row(edited,'Rascunhos').changed,1);
  assert.deepEqual([...f.memory],memory);assert.equal(f.core.getState(),core);assert.equal(f.fitness.getState(),fitness);
});

test('per-profile comparison uses the active root, includes removed and orphan fitness profiles, and reports XP exactly',async()=>{
  const f=fixture();const a=f.core.getState().createAccount('A',false);
  const b=f.core.getState().createAccount('B',false);
  f.core.getState().switchAccount(a.id);f.core.getState().addDraft('Atual','');
  const current=snapshot(f), incoming=structuredClone(current);
  incoming.stores.core.state.accounts=incoming.stores.core.state.accounts.filter(p=>p.id!==b.id);
  delete incoming.stores.core.state.accountDataById[b.id];delete incoming.stores.fitness.state.accountDataById[b.id];
  incoming.stores.core.state.drafts=[];incoming.stores.core.state.user.xp_fire=12;
  incoming.stores.fitness.state.nativeDataById.extra={templates:[],nativeHistory:[{id:'session-x',status:'completed'}]};
  const result=await f.compareProgressBackup(await archive(f,incoming),current);
  assert.equal(row(result,'Rascunhos',a.id).removed,1);
  assert.equal(result.accounts.find(p=>p.id===b.id).status,'removed');
  assert.equal(row(result,'Histórico de treino nativo','extra').added,1);
  assert.equal(result.accounts.find(p=>p.id==='extra').name,'Perfil sem cadastro');
  assert.deepEqual(result.accounts.find(p=>p.id===a.id).xp.find(x=>x.label==='Fogo'),{label:'Fogo',before:0,after:12});
});

test('metadata differences are explicit and comparisons freeze the current state before hashing',async()=>{
  const f=fixture();const current=snapshot(f),incoming=structuredClone(current);
  incoming.appVersion='0.0.1';incoming.source.origin='https://other.test';
  const text=await archive(f,incoming);const before=f.progressFingerprint(current);
  const pending=f.compareProgressBackup(text,current);current.stores.core.state.user.xp_fire=999;
  const result=await pending;assert.equal(result.baseline,before);assert.equal(result.sameOrigin,false);assert.equal(result.sameVersion,false);
  assert.notEqual(f.progressFingerprint(current),result.baseline);
});

test('fingerprints ignore object key order and export timestamp but retain array order and all content',()=>{
  const f=fixture();const a=snapshot(f),b=structuredClone(a);
  b.createdAt='2000-01-01';b.stores.core.state.user=Object.fromEntries(Object.entries(b.stores.core.state.user).reverse());
  assert.equal(f.progressFingerprint(a),f.progressFingerprint(b));
  b.stores.core.state.user.xp_water=7;assert.notEqual(f.progressFingerprint(a),f.progressFingerprint(b));
});

test('duplicate or missing IDs, malformed account snapshots and tampering reject comparison',async()=>{
  const f=fixture();f.core.getState().addDraft('A','');const original=snapshot(f);
  for(const change of [s=>s.stores.core.state.drafts.push(s.stores.core.state.drafts[0]),s=>delete s.stores.core.state.drafts[0].id,s=>s.stores.core.state.accountDataById.broken={user:{}}]){
    const bad=structuredClone(original);change(bad);
    await assert.rejects(f.compareProgressBackup(await archive(f,bad),original),/estrutura detalhada/);
  }
  const text=await archive(f,original);await assert.rejects(f.compareProgressBackup(text.replace('"xp_fire": 0','"xp_fire": 4'),original),/conteúdo mudou/);
});

test('remaining data includes character, measurements and profile registration changes',async()=>{
  const f=fixture();const a=f.core.getState().createAccount('A',false);const current=snapshot(f),incoming=structuredClone(current);
  incoming.stores.core.state.accounts[0].name='Novo nome';
  incoming.stores.fitness.state.accountDataById[a.id].bodyMeasurements=[{id:'measure',weight:70}];
  const result=await f.compareProgressBackup(await archive(f,incoming),current);
  assert.equal(row(result,'Demais dados do perfil',a.id).changed,1);
  assert.equal(result.accounts.find(p=>p.id===a.id).name,'Novo nome');
});
