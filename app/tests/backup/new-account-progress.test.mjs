import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto,randomUUID} from 'node:crypto';
import {createAccountDatabase,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';

const outputs=await Promise.all([true,false].map(released=>build({stdin:{contents:`export * from './src/lib/backup/new-account-progress';export * from './src/lib/backup/account-transport';export * from './src/lib/backup/account-transfer';export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/progress-mode';export * from './src/lib/backup/account-live-sync';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,alias:{'@':process.cwd()+'/src'},logLevel:'silent',plugins:[{name:'isolated-release',setup(b){b.onLoad({filter:/account-release\.ts$/},()=>({contents:'export const ACCOUNT_TRANSFER_WRITES_RELEASED='+released+';',loader:'ts'}));}}]})));
function realm(released=true){const mod={exports:{}};new Function('require','module','exports','crypto',outputs[released?0:1].outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);return mod.exports;}
let db;before(async()=>{db=await createAccountDatabase();});after(async()=>{await db?.close();});
async function setup(released=true){
 const api=realm(released),origin='https://fixture.test',userId=randomUUID(),memory=new Map(),writes=[],calls=[];let active=true,writeHook=()=>{},rpcHook=async()=>{};
 await db.query('insert into auth.users(id) values($1)',[userId]);
 const storage={getItem:k=>memory.get(k)??null,setItem(k,v){writeHook('before',k);memory.set(k,v);writes.push(k);writeHook('after',k);},removeItem(k){writeHook('before',k);memory.delete(k);writes.push(k);writeHook('after',k);}};
 const client={auth:{getUser:async()=>({data:{user:{id:userId}},error:null})},rpc:async(name,args)=>{
   calls.push({name,args});const failure=await rpcHook('before',name,args);if(failure)return {data:null,error:failure};
   const values=name==='progress_account_read'?[args.p_expected_user_id]:name==='progress_account_receipt'?[args.p_expected_user_id,args.p_operation_id]:[args.p_expected_user_id,args.p_expected_revision,args.p_operation_id,args.p_archive,args.p_all_profiles_confirmed];
   try{const result=await userQuery(db,userId,`select public.${name}(${values.map((_,i)=>'$'+(i+1)).join(',')}) as value`,values);await rpcHook('after',name,args);return {data:result.rows[0].value,error:null};}catch(e){return {data:null,error:{message:e.message}};}
 }};
 const transport=api.createAccountTransport(client,{expectedUserId:userId,currentUserId:()=>userId,isCurrent:()=>active});
 const input={origin,userId,storage:()=>storage,isCurrent:()=>active,otherTabsClosed:true,startConfirmed:true,locks:{request:async(_,options,fn)=>fn({mode:options.mode})}};
 return {api,origin,userId,memory,writes,calls,storage,input,transport,client,active:v=>active=v,writeHook:fn=>writeHook=fn,rpcHook:fn=>rpcHook=fn,start:()=>api.startNewAccountProgress(input,transport)};
}
const core='conselho-elemental-storage',fitness='dominio-do-mago-workout-storage-v1',intent='conselho-elemental-account-intent-v1',journal='conselho-elemental-restore-journal-v1',binding='conselho-elemental-account-binding-v1';

test('new-account entry imports no stores/Auth and matches existing initial projections without sharing objects',()=>{
 for(const file of Object.keys(outputs[0].metafile.inputs))assert.ok(!/src\/(stores|services\/supabase)|supabase-js/.test(file),file);
 const api=realm(),a=api.createNewProgressSnapshot('https://fixture.test'),b=api.createNewProgressSnapshot('https://fixture.test'),f=fixture();
 assert.equal(f.auditCriticalProgress(JSON.parse(JSON.stringify(a))).issues.length,0);
 const initial=f.core.persist.getOptions().partialize(f.core.getInitialState());
 const normalize=v=>{v=JSON.parse(JSON.stringify(v));delete v.user.id;delete v.user.joinedAt;return v;};
 assert.deepEqual(normalize(a.stores.core.state),normalize(initial));
 assert.deepEqual(a.stores.fitness.state,f.fitness.persist.getOptions().partialize(f.fitness.getInitialState()));
 assert.notEqual(a.stores.core.state.user.id,b.stores.core.state.user.id);a.stores.core.state.onboarding.selectedAreas.push('synthetic');assert.deepEqual(b.stores.core.state.onboarding.selectedAreas,[]);
});

test('new journey uses real journal, SQL CAS, durable intent and readback, keeps zero XP and distinct owners',async()=>{
 const a=await setup(),b=await setup();
 for(const f of [a,b]){
  f.rpcHook(async(when,name)=>{if(when==='before'&&name==='progress_account_commit')assert.ok(f.memory.get(intent));});
  const result=await f.start();assert.equal(result.receipt.userId,f.userId);assert.equal(f.memory.get(journal),undefined);assert.equal(f.memory.get(intent),undefined);assert.equal(f.memory.get(binding),result.bindingRaw);
  const remote=await f.transport.readProgress(f.userId),snapshot=JSON.parse(remote.archive);assert.equal(snapshot.stores.core.state.user.xp_air,0);assert.equal(snapshot.stores.core.state.user.pranaLevel,100);
  assert.deepEqual(JSON.parse(f.memory.get(core)).state,snapshot.stores.core.state);assert.deepEqual(JSON.parse(f.memory.get(fitness)).state,snapshot.stores.fitness.state);
  const reloaded=fixture([],f.memory);assert.equal(reloaded.core.getState().user.id,snapshot.stores.core.state.user.id);assert.equal(reloaded.core.getState().tasks.length,0);
 }
 assert.notEqual(JSON.parse(a.memory.get(core)).state.user.id,JSON.parse(b.memory.get(core)).state.user.id);
 assert.equal(a.calls.filter(c=>c.name==='progress_account_commit').length,1);
});

test('closed release, missing consent, unavailable lease and any existing local progress cannot create a journey',async()=>{
 for(const variation of ['release','consent','tabs','lock','core','binding','intent','restore']){
  const f=await setup(variation!=='release');
  if(variation==='consent')f.input.startConfirmed=false;
  if(variation==='tabs')f.input.otherTabsClosed=false;
  if(variation==='lock')f.input.locks={request:async(_,options,fn)=>fn(null)};
  if(variation==='core')f.memory.set(core,'existing personal bytes');
  if(variation==='binding')f.memory.set(binding,'existing binding');
  if(variation==='intent')f.memory.set(intent,'existing intent');
  if(variation==='restore')f.memory.set(journal,'existing recovery');
  const before=[...f.memory];await assert.rejects(f.start());assert.deepEqual([...f.memory],before);assert.deepEqual(f.writes,[]);
  assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,0);
 }
});

test('remote progress, legacy data, network failure or identity change are never treated as an empty account',async()=>{
 for(const variation of ['snapshot','legacy','offline','identity']){
  const f=await setup();
  if(variation==='snapshot')await f.start();
  if(variation==='snapshot'){f.memory.clear();f.writes.length=0;}
  if(variation==='legacy')await userQuery(db,f.userId,'insert into public.drafts(user_id,title) values($1,$2)',[f.userId,'Synthetic legacy']);
  if(variation==='offline')f.rpcHook(async(when)=>when==='before'?{message:'offline'}:undefined);
  if(variation==='identity')f.rpcHook(async(when,name)=>{if(when==='after'&&name==='progress_account_read')f.active(false);});
  await assert.rejects(f.start());assert.equal(f.memory.size,0);assert.deepEqual(f.writes,[]);
 }
});

test('concurrent local activity before creation preserves its exact bytes and sends nothing',async()=>{
 const f=await setup();f.rpcHook(async(when,name)=>{if(when==='after'&&name==='progress_account_read')f.memory.set(core,'concurrent bytes');});
 await assert.rejects(f.start());assert.equal(f.memory.get(core),'concurrent bytes');assert.deepEqual(f.writes,[]);assert.equal(f.calls.some(c=>c.name==='progress_account_commit'),false);
});

test('interrupted local initialization leaves the existing restore journal and blocks normal bootstrap',async()=>{
 const f=await setup();f.writeHook((when,key)=>{if(when==='before'&&key===fitness)throw Error('synthetic interruption');});
 await assert.rejects(f.start());assert.ok(f.memory.get(journal));assert.equal(f.calls.some(c=>c.name==='progress_account_commit'),false);
 const fresh=realm(),events=[];await fresh.startProgressSession({origin:f.origin,storage:()=>f.storage,lifetime:Promise.resolve(),load:async()=>events.push('app'),blocked:r=>events.push(r)});assert.deepEqual(events,['pending-restore']);
 const review=await fresh.reviewPendingRestore(f.storage,f.origin);assert.equal(review.outcome,'rollback');
});

test('lost remote acknowledgement retains the same intent and receipt for deliberate recovery without duplicate commit',async()=>{
 const f=await setup();let lost=false;f.rpcHook(async(when,name)=>{if(when==='after'&&name==='progress_account_commit'&&!lost){lost=true;throw Error('lost acknowledgement');}});
 await assert.rejects(f.start());const raw=f.memory.get(intent);assert.ok(raw);assert.ok(f.memory.get(core));
 const commits=f.calls.filter(c=>c.name==='progress_account_commit').length;
 const reviewed=await f.api.reviewAccountTransfer(f.input,{raw},f.transport);assert.ok(reviewed.receipt);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,commits);
 await f.api.finishAccountTransferLocally(f.input,{raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport);assert.ok(f.memory.get(binding));assert.equal(f.memory.get(intent),undefined);
});


test('a newly bound account saves subsequent real-store edits through the existing live coordinator',async()=>{
 const f=await setup(),started=await f.start(),events=[];
 await f.api.startProgressSession({origin:f.origin,storage:()=>f.storage,locks:f.input.locks,exclusive:true,lifetime:Promise.resolve(),blocked:r=>events.push(r),load:async()=>{
   const sync=f.api.createLiveAccountSync({origin:f.origin,storage:f.storage,isExclusive:f.api.hasExclusiveProgressSession,session:{client:f.client,userId:f.userId,bindingRaw:started.bindingRaw,allProfilesConfirmed:true,dispose(){}}});
   const local=fixture([],f.memory);local.core.getState().addDraft('Primeira ideia','Synthetic content');
   await sync.flush();assert.equal(sync.getSnapshot().status,'saved');
   const remote=await f.transport.readProgress(f.userId);assert.equal(JSON.parse(remote.archive).stores.core.state.drafts[0].title,'Primeira ideia');assert.equal(JSON.parse(remote.archive).stores.core.state.user.xp_air,0);
   sync.stop();events.push('saved');
 }});
 assert.deepEqual(events,['saved']);
});
