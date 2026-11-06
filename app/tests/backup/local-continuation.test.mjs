import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
const origin='http://fixture.test',M='conselho-elemental-local-progress-mode-v1';
const bundle=await build({stdin:{contents:`export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/exclusive-restore';export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/progress-mode';export * from './src/lib/backup/account-intent';export * from './src/lib/backup/account-binding';export async function loadClient(){return import('./src/lib/supabase');}export async function loadAuth(){return import('./src/stores/authStore');}`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent',define:{'import.meta.env.VITE_SUPABASE_URL':'"https://synthetic.invalid"','import.meta.env.VITE_SUPABASE_ANON_KEY':'"synthetic-public-key"','import.meta.env.VITE_ENABLE_SUPABASE_AUTH':'"true"','import.meta.env.VITE_FORCE_BOOTSTRAP_CLOUD_SYNC':'"false"'},plugins:[{name:'isolated-boundaries',setup(b){
 b.onResolve({filter:/^@supabase\/supabase-js$/},()=>({path:'mock-sdk',external:true}));
 b.onResolve({filter:/^@\/stores\/appStore$/},()=>({path:'mock-core',external:true}));
 b.onResolve({filter:/^@\//},args=>{const base=resolve('src',args.path.slice(2));return {path:[base,base+'.ts',base+'.tsx',resolve(base,'index.ts')].find(p=>existsSync(p)&&statSync(p).isFile())};});
}}]});
function realm(memory){
 const mod={exports:{}},calls=[];let core;
 new Function('require','module','exports','crypto','window','document',bundle.outputFiles[0].text)(name=>{
  if(name==='mock-sdk')return {createClient:(...args)=>{calls.push(['createClient',...args]);return {auth:{getSession:()=>{calls.push(['getSession']);throw Error('Unexpected auth session read');}},from:()=>{throw Error('Unexpected remote query');}};}};
  if(name==='mock-core')return {useAppStore:core.core};
  throw Error('Unexpected dependency '+name);
 },mod,mod.exports,webcrypto,{},{visibilityState:'visible'});
 return {...mod.exports,calls,setCore(){core=fixture([],memory);return core;}};
}
async function setup(local=false){
 const producer=fixture();producer.core.getState().addDraft('Anterior','');const initial=producer.captureProgress(origin),previousBackup=await producer.createProgressBackup(initial);
 const before=Object.fromEntries(Object.entries(initial.stores).map(([p,v])=>[p,JSON.stringify({state:v.state,version:v.version})]));
 producer.core.getState().addDraft('Importado','');producer.core.getState().addElementExperience('ar',7);
 const targetBackup=await producer.createProgressBackup(producer.captureProgress(origin));
 const memory=new Map(Object.entries(before).map(([p,v])=>[producer.STORE_KEYS[p],v]));
 const r=realm(memory);if(local)memory.set(M,r.localProgressMode(origin));
 const writes=[];let hook=()=>{};const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>{hook('before',key);memory.set(key,value);writes.push([key,value]);hook('after',key);},removeItem:key=>{hook('before',key);memory.delete(key);writes.push([key,null]);hook('after',key);}};
 const context={origin,storage:()=>storage,otherTabsClosed:true,locks:{request:async(_,options,fn)=>fn({mode:options.mode})}};
 const journal=await r.prepareRestoreJournal(before,targetBackup,origin);
 return {r,producer,memory,storage,writes,context,before,journal,targetBackup,previousBackup,inject(fn){hook=fn;}};
}
async function apply(f){assert.equal(await f.r.runExclusiveRestore(f.context,{mode:'apply',journal:f.journal,previousBackup:f.previousBackup,replacementConfirmed:true}),'applied');return f.r.reviewPendingRestore(f.storage,origin);}
async function enterLocal(f){
 const r=realm(f.memory),blocked=[];let state,client,auth;
 await r.startProgressSession({storage:()=>f.storage,origin,lifetime:Promise.resolve(),blocked:v=>blocked.push(v),load:async()=>{state=r.setCore();client=await r.loadClient();auth=await r.loadAuth();await auth.useAuthStore.getState().initialize();}});
 return {r,blocked,state,client,auth};
}

test('explicit continuation persists local mode before clearing the journal, and real client/auth stay disabled on reload',async()=>{
 const f=await setup(),review=await apply(f);f.writes.length=0;
 assert.equal(await f.r.runExclusiveRestore(f.context,{mode:'local',expected:review.baseline,localUseConfirmed:true}),'local-ready');
 assert.deepEqual(f.writes.map(([k])=>k),[M,f.r.RESTORE_JOURNAL_KEY]);assert.equal(f.storage.getItem(f.r.RESTORE_JOURNAL_KEY),null);
 f.memory.set('sb-synthetic-session','untouched synthetic session');
 for(let reload=0;reload<2;reload++){
  const local=await enterLocal(f);assert.deepEqual(local.blocked,[]);assert.ok(local.r.isRestoredLocalDocument());
  assert.equal(local.client.supabase,null);assert.equal(local.client.isSupabaseAuthEnabled,false);assert.equal(local.client.isSupabaseConfigured,false);assert.deepEqual(local.r.calls,[]);
  assert.equal(local.auth.useAuthStore.getState().isInitialized,true);assert.equal(local.auth.useAuthStore.getState().user,null);
  assert.equal(local.state.core.getState().user.xp_air,7);assert.equal(local.state.core.getState().drafts.length,2);
 }
 assert.equal(f.memory.get('sb-synthetic-session'),'untouched synthetic session');
});

test('local edits, quantities and character identity survive fresh documents without creating the client',async()=>{
 const f=await setup(),review=await apply(f);await f.r.runExclusiveRestore(f.context,{mode:'local',expected:review.baseline,localUseConfirmed:true});
 const first=await enterLocal(f),core=first.state.core,id=core.getState().user.id;
 core.getState().addDraft('Depois da restauração','');const habit=core.getState().addHabit({name:'Prática local',elementId:'ar',plannedPoints:2,plannedTimeMinutes:5});
 core.getState().configureHabitDailyTracking(habit.id,{unit:'vez',target:3,step:1});core.getState().recordHabitQuantity(habit.id,new Date(2026,9,29,12));
 const second=await enterLocal(f);assert.equal(second.state.core.getState().user.id,id);assert.equal(second.state.core.getState().drafts.length,3);
 assert.equal(second.state.core.getState().habits[0].dailyEntries.length,1);assert.deepEqual(second.r.calls,[]);
});

test('normal documents retain configured client behavior; corrupt or foreign local metadata blocks before any client construction',async()=>{
 const normal=await setup();const fresh=realm(normal.memory);let client;
 await fresh.startProgressSession({storage:()=>normal.storage,origin,lifetime:Promise.resolve(),blocked:()=>assert.fail('unexpected block'),load:async()=>{client=await fresh.loadClient();}});
 assert.equal(client.isSupabaseAuthEnabled,true);assert.equal(fresh.calls.filter(c=>c[0]==='createClient').length,1);
 for(const raw of ['', '{',JSON.stringify({format:'conselho-elemental-local-progress',version:2,origin}),fresh.localProgressMode('https://other.test'),' '.repeat(4097)]){
  const f=await setup();f.memory.set(M,raw);const result=await enterLocal(f);assert.deepEqual(result.blocked,['storage-unavailable']);assert.deepEqual(result.r.calls,[]);assert.equal(result.state,undefined);
 }
});

test('interruption before/after each handoff write leaves a journal barrier or durable local isolation',async()=>{
 for(const side of ['before','after'])for(const key of [M,'conselho-elemental-restore-journal-v1']){
  const f=await setup(),review=await apply(f);f.inject((when,k)=>{if(when===side&&k===key)throw Error('interruption');});
  await assert.rejects(f.r.runExclusiveRestore(f.context,{mode:'local',expected:review.baseline,localUseConfirmed:true}),/interruption/);f.inject(()=>{});
  const result=await enterLocal(f);
  if(f.storage.getItem(f.r.RESTORE_JOURNAL_KEY)!==null){assert.equal(result.state,undefined);assert.deepEqual(result.blocked,['pending-restore']);
   const renewed=await f.r.reviewPendingRestore(f.storage,origin);await f.r.runExclusiveRestore(f.context,{mode:'local',expected:renewed.baseline,localUseConfirmed:true});
  }else{assert.equal(result.client.supabase,null);assert.ok(f.storage.getItem(M));}
  assert.deepEqual((await enterLocal(f)).r.calls,[]);
 }
});

test('local continuation refuses stale views, unconfirmed consent, pre-commit state and cancellation without writes',async()=>{
 for(const variant of ['consent','stale','prepared','cancelled']){
  const f=await setup();let review;
  if(variant==='prepared'){f.memory.set(f.r.RESTORE_JOURNAL_KEY,f.journal);review=await f.r.reviewPendingRestore(f.storage,origin);}else review=await apply(f);
  const count=f.writes.length;if(variant==='stale')f.memory.set(M,f.r.localProgressMode(origin));
  if(variant==='cancelled')f.context.isCurrent=()=>false;
  const before=[...f.memory];await assert.rejects(f.r.runExclusiveRestore(f.context,{mode:'local',expected:review.baseline,localUseConfirmed:variant==='consent'?false:true}));
  assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);
 }
});

test('a second restoration and rollback preserve the existing local mode and remain usable',async()=>{
 const f=await setup(true),marker=f.memory.get(M),review=await apply(f);
 await f.r.runExclusiveRestore(f.context,{mode:'local',expected:review.baseline,localUseConfirmed:true});
 const local=await enterLocal(f),snapshot=local.state.captureProgress(origin),safety=await local.state.createProgressBackup(snapshot);
 const pair=Object.fromEntries(Object.entries(snapshot.stores).map(([p,v])=>[p,JSON.stringify({state:v.state,version:v.version})]));
 const target=structuredClone(snapshot);target.stores.core.state.drafts=[];const journal=await f.r.prepareRestoreJournal(pair,await local.state.createProgressBackup(target),origin);
 let n=0;f.inject((when,key)=>{if(when==='before'&&key===f.r.RESTORE_JOURNAL_KEY&&++n===2)throw Error('interruption before commit');});
 await assert.rejects(f.r.runExclusiveRestore(f.context,{mode:'apply',journal,previousBackup:safety,replacementConfirmed:true}));f.inject(()=>{});
 const pending=await f.r.reviewPendingRestore(f.storage,origin);assert.equal(await f.r.runExclusiveRestore(f.context,{mode:'recover',expected:pending.baseline,recoveryConfirmed:true}),'rolled-back');
 assert.equal(f.memory.get(M),marker);const reloaded=await enterLocal(f);assert.equal(reloaded.state.core.getState().drafts.length,2);assert.deepEqual(reloaded.r.calls,[]);
});

test('silently denied handoff writes preserve the journal barrier and require a new review',async()=>{
 for(const denied of [M,'conselho-elemental-restore-journal-v1']){
  const f=await setup(),review=await apply(f);const storage={...f.storage,setItem:(k,v)=>{if(k!==denied)f.storage.setItem(k,v);},removeItem:k=>{if(k!==denied)f.storage.removeItem(k);}};
  await assert.rejects(f.r.runExclusiveRestore({...f.context,storage:()=>storage},{mode:'local',expected:review.baseline,localUseConfirmed:true}));
  assert.notEqual(f.storage.getItem(f.r.RESTORE_JOURNAL_KEY),null);const blocked=await enterLocal(f);assert.deepEqual(blocked.blocked,['pending-restore']);assert.equal(blocked.state,undefined);
  const retry=await f.r.reviewPendingRestore(f.storage,origin);await f.r.runExclusiveRestore(f.context,{mode:'local',expected:retry.baseline,localUseConfirmed:true});assert.deepEqual((await enterLocal(f)).r.calls,[]);
 }
});


test('recovery and local handoff recheck cancellation after asynchronous journal validation',async()=>{
 for(const operation of ['local','recover']){
  const f=await setup();let review;if(operation==='local')review=await apply(f);else{f.memory.set(f.r.RESTORE_JOURNAL_KEY,f.journal);review=await f.r.reviewPendingRestore(f.storage,origin);}
  let active=true;const before=[...f.memory],count=f.writes.length;
  const pending=f.r.runExclusiveRestore({...f.context,isCurrent:()=>active},operation==='local'?{mode:'local',expected:review.baseline,localUseConfirmed:true}:{mode:'recover',expected:review.baseline,recoveryConfirmed:true});active=false;
  await assert.rejects(pending,/cancelada/);assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);
 }
});


test('a paused account attempt still loads the actual client/auth in isolated local mode after a fresh document',async()=>{
 const f=await setup(),archive=f.previousBackup;
 const intent=await f.r.sealAccountIntent({format:'conselho-elemental-account-intent',version:1,phase:'paused',origin,userId:'11111111-1111-4111-8111-111111111111',operationId:'22222222-2222-4222-8222-222222222222',expectedRevision:'empty',archive,archiveSha256:await f.r.accountDigest(archive),baselineDigest:await f.r.accountBaselineDigest(f.storage),localMode:null});
 f.memory.set(f.r.ACCOUNT_INTENT_KEY,intent);f.memory.set(M,f.r.localProgressMode(origin));const local=await enterLocal(f);assert.deepEqual(local.blocked,[]);assert.equal(local.client.supabase,null);assert.equal(local.auth.useAuthStore.getState().isInitialized,true);assert.deepEqual(local.r.calls,[]);
 f.memory.delete(M);const blocked=await enterLocal(f);assert.deepEqual(blocked.blocked,['pending-account']);assert.equal(blocked.state,undefined);
});


test('a durable receipt binding disables the actual legacy SDK and auth on a new document without trusting it as login',async()=>{
 const f=await setup();const id='11111111-1111-4111-8111-111111111111';
 const raw=await f.r.sealAccountBinding({format:'conselho-elemental-account-binding',version:1,origin,userId:id,operationId:id,revision:id,expectedRevision:'empty',archiveSha256:'a'.repeat(64),baselineDigest:'b'.repeat(64),createdAt:'2026-10-29T12:00:00Z'});
 f.memory.set(f.r.ACCOUNT_BINDING_KEY,raw);f.memory.delete(M);
 const entered=await enterLocal(f);assert.deepEqual(entered.blocked,[]);assert.equal(entered.client.supabase,null);assert.equal(entered.auth.useAuthStore.getState().user,null);assert.deepEqual(entered.r.calls,[]);
 f.memory.set(f.r.ACCOUNT_BINDING_KEY,raw+'x');const invalid=await enterLocal(f);assert.deepEqual(invalid.blocked,['pending-account']);assert.deepEqual(invalid.r.calls,[]);
});
