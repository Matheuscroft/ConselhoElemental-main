import test from 'node:test';
import assert from 'node:assert/strict';
import {authFixture} from './load-auth-sync.mjs';
const uid='synthetic-remote-a';
const snapshot=()=>({data:{userId:uid,complete:true,kind:'snapshot',revision:'synthetic-revision',archive:'synthetic'},error:null});
const bytes=f=>[f.local.memory.get(f.local.STORE_KEYS.core),f.local.memory.get(f.local.STORE_KEYS.fitness)];

test('integral account is refused by the actual legacy service before partial table reads, writes or hydration',async()=>{
 const f=authFixture({released:true});f.hooks.guardRead=async()=>snapshot();const before=bytes(f);
 await assert.rejects(f.hydrateAppStoreFromCloud(uid),/progresso integral/);await assert.rejects(f.persistAppStoreToCloud(uid),/progresso integral/);
 assert.deepEqual(bytes(f),before);assert.equal(f.calls.some(c=>c.table),false);assert.equal(f.calls.filter(c=>c.operation==='rpc').length,2);await f.close();
});

test('RPC failure, unknown shape and a different validated identity never fall back to legacy loading',async()=>{
 for(const scenario of ['identity','error','shape','user']){
 const f=authFixture({released:true});if(scenario==='identity')f.hooks.guardUser=async()=>({data:{user:{id:'another-user'}},error:null});else f.hooks.guardRead=async()=>scenario==='error'?{data:null,error:{message:'RPC unavailable'}}:{data:scenario==='shape'?{userId:uid,kind:'future'}:{userId:'other',kind:'legacy',complete:false,revision:'legacy'},error:null};
 const before=bytes(f);await assert.rejects(f.hydrateAppStoreFromCloud(uid));await assert.rejects(f.persistAppStoreToCloud(uid));assert.equal(f.calls.some(c=>c.table),false);assert.deepEqual(bytes(f),before);await f.close();
 }
});

test('a migration detected after partial reads prevents applying those legacy rows to local stores',async()=>{
 const f=authFixture({released:true}),before=bytes(f);let checks=0;f.hooks.guardRead=async()=>++checks===1?{data:{userId:uid,complete:false,kind:'legacy',revision:'legacy'},error:null}:snapshot();
 await assert.rejects(f.hydrateAppStoreFromCloud(uid),/progresso integral/);assert.ok(f.calls.some(c=>c.table));assert.deepEqual(bytes(f),before);assert.equal(f.calls.some(c=>c.operation==='upsert'||c.operation==='delete'),false);await f.close();
});

test('confirmed legacy/empty accounts retain the original service and closed release does not contact the new RPC',async()=>{
 for(const kind of ['legacy','empty']){const f=authFixture({released:true});f.hooks.guardRead=async()=>({data:kind==='empty'?{userId:uid,kind,complete:true,revision:'empty',archive:null}:{userId:uid,kind,complete:false,revision:'legacy'},error:null});await f.hydrateAppStoreFromCloud(uid);assert.equal(f.calls.filter(c=>c.operation==='rpc').length,2);assert.ok(f.calls.some(c=>c.table));await f.close();}
 const old=authFixture();await old.hydrateAppStoreFromCloud(uid);assert.equal(old.calls.some(c=>c.operation==='rpc'||c.operation==='getUser'),false);await old.close();
});


test('local edits made during the second identity/format check still invalidate expected-fingerprint hydration',async()=>{
 const f=authFixture({released:true});let checks=0;const fingerprint=f.getCloudSyncFingerprint();f.hooks.guardRead=async()=>{if(++checks===2)f.local.core.getState().addDraft('Edição durante conferência de conta','');return {data:{userId:uid,kind:'legacy',complete:false,revision:'legacy'},error:null};};
 await assert.rejects(f.hydrateAppStoreFromCloud(uid,fingerprint),/alterações locais/);assert.equal(f.local.core.getState().drafts.length,2);assert.equal(f.local.core.getState().user.id.startsWith('user-'),false);await f.close();
});
