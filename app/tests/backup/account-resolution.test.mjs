import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto,randomUUID} from 'node:crypto';
import {createAccountDatabase,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';
const bundled=await build({stdin:{contents:`export * from './src/lib/backup/account-live-sync';export * from './src/lib/backup/account-resolution';export * from './src/lib/backup/account-resolution-key';export * from './src/lib/backup/progress-backup';export * from './src/lib/backup/account-binding';export * from './src/lib/backup/account-intent';export * from './src/lib/backup/account-transport';export * from './src/lib/backup/account-transfer';export * from './src/lib/backup/account-conflict';export * from './src/lib/backup/workspace-preview';export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/progress-mode';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent',plugins:[{name:'release',setup(b){b.onResolve({filter:/account-release$/},()=>({path:'test-release',external:true}));}}]});
function realm(released=true){const mod={exports:{}};new Function('require','module','exports','crypto',bundled.outputFiles[0].text)(name=>name==='test-release'?{ACCOUNT_TRANSFER_WRITES_RELEASED:released}:createRequire(import.meta.url)(name),mod,mod.exports,webcrypto);return mod.exports;}
let db;before(async()=>{db=await createAccountDatabase();});after(async()=>{await db?.close();});
async function setup(){
 const api=realm(),local=fixture(),origin='http://fixture.test',uid=randomUUID();await db.query('insert into auth.users(id) values($1)',[uid]);local.core.getState().addDraft('Arquivo original','');local.core.getState().addExperience(7,'ar');
 const calls=[],writes=[];let identity=uid,exclusive=true,disposed=0,hook=async()=>{},writeHook=()=>{};
 const storage={getItem:k=>local.memory.get(k)??null,setItem:(k,v)=>{writeHook('before',k);local.memory.set(k,v);writes.push(k);writeHook('after',k);},removeItem:k=>{writeHook('before',k);local.memory.delete(k);writes.push(k);writeHook('after',k);}};
 const client={auth:{getUser:async()=>({data:{user:identity?{id:identity}:null},error:null})},rpc(name,args){return(async()=>{calls.push({name,args});const params=name==='progress_account_read'?[args.p_expected_user_id]:name==='progress_account_receipt'?[args.p_expected_user_id,args.p_operation_id]:[args.p_expected_user_id,args.p_expected_revision,args.p_operation_id,args.p_archive,args.p_all_profiles_confirmed];
 try{await hook('before',name,args);const result=await userQuery(db,identity,`select public.${name}(${params.map((_,i)=>'$'+(i+1)).join(',')}) as value`,params);await hook('after',name,args);return {data:result.rows[0].value,error:null};}catch(e){return {data:null,error:{message:e.message}};}})();}};
 const transport=()=>api.createAccountTransport(client,{expectedUserId:uid,currentUserId:()=>identity,isCurrent:()=>true});
 const ctx={origin,storage:()=>storage,locks:{request:async(_,__,fn)=>fn({})},otherTabsClosed:true,isCurrent:()=>true};
 const copy=await api.createWorkspaceSafetyCopy(storage,origin),sent=await api.beginAccountTransfer(ctx,{baseline:copy.baseline,previousCopy:copy.text,allProfilesConfirmed:true,userId:uid},transport());await api.finishAccountTransferLocally(ctx,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},transport());
 calls.length=0;writes.length=0;
 const options={origin,storage,isExclusive:()=>exclusive,session:{client,userId:uid,bindingRaw:storage.getItem(api.ACCOUNT_BINDING_KEY),allProfilesConfirmed:true,dispose(){disposed++;}}};
 return {api,local,origin,uid,storage,calls,writes,options,ctx,transport,live:()=>api.createLiveAccountSync(options),hook(fn){hook=fn;},writeHook(fn){writeHook=fn;},identity(v){identity=v;},exclusive(v){exclusive=v;},get disposed(){return disposed;}};
}
const domain=f=>[f.storage.getItem(f.local.STORE_KEYS.core),f.storage.getItem(f.local.STORE_KEYS.fitness)];
const commits=f=>f.calls.filter(c=>c.name==='progress_account_commit').length;


const review=f=>f.api.reviewAccountVersions({origin:f.origin,storage:f.storage,isCurrent:()=>true,transport:f.transport()});
const copies=v=>({local:v.localArchive,online:v.remoteArchive,pending:v.pendingArchive});
const choose=(f,v,direction='online')=>f.api.resolveAccountVersions(f.ctx,{review:v,direction,copies:copies(v),allProfilesConfirmed:true,replacementConfirmed:true},f.transport());
const resume=(f,raw,retry=false)=>f.api.resumeAccountResolution(f.ctx,{raw,recoveryConfirmed:true,retryConfirmed:retry},f.transport());
async function boot(f){const fresh=realm(),events=[];await fresh.startProgressSession({origin:f.origin,storage:()=>f.storage,lifetime:Promise.resolve(),load:async()=>events.push('app'),blocked:r=>events.push(r)});return {fresh,events};}

test('local choice fences the old revision and preserves exact local bytes without replaying XP',async()=>{
 const f=await setup();f.local.core.getState().addDraft('Escolha local','');f.local.core.getState().addExperience(3,'terra');const before=domain(f),v=await review(f);let durable=false;
 f.hook(async(when,name)=>{if(when==='before'&&name==='progress_account_commit')durable=!!f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY);});const result=await choose(f,v,'local');assert.equal(result.outcome,'resolved');assert.equal(durable,true);assert.deepEqual(domain(f),before);assert.equal(f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY),null);assert.equal(commits(f),1);
 const online=await f.transport().readProgress(f.uid);assert.equal(online.archive,v.localArchive);assert.notEqual(online.revision,v.revision);assert.equal((await f.api.inspectAccountBinding(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),f.origin)).revision,result.receipt.revision);
 const entered=await boot(f);assert.deepEqual(entered.events,['app']);assert.equal(entered.fresh.isRestoredLocalDocument(),true);
});

test('receiving replaces both persist projections with the reviewed online states, preserving IDs and exact historical XP',async()=>{
 const f=await setup();f.local.core.getState().addDraft('Anterior local','');f.local.core.getState().addExperience(12,'fogo');f.local.fitness.getState().addBodyMeasurement({weightKg:73});const v=await review(f),online=(await f.api.inspectProgressBackup(v.remoteArchive)).backup;
 const result=await choose(f,v);assert.equal(result.outcome,'resolved');for(const k of ['core','fitness'])assert.deepEqual(JSON.parse(f.storage.getItem(f.local.STORE_KEYS[k])).state,online.stores[k].state);assert.equal(JSON.parse(f.storage.getItem(f.local.STORE_KEYS.core)).state.user.xp_air,7);assert.equal(JSON.parse(f.storage.getItem(f.local.STORE_KEYS.core)).state.user.xp_fire,0);
 assert.equal((await f.transport().readProgress(f.uid)).archive,v.remoteArchive);assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);
});

test('fresh device can receive an authenticated existing account across origins without any local archive',async()=>{
 const source=await setup(),memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},origin='https://other-device.test';
 const v=await source.api.reviewAccountVersions({origin,expectedUserId:source.uid,storage,isCurrent:()=>true,transport:source.transport()});assert.equal(v.localArchive,null);assert.equal(v.localSummary,null);
 const ctx={...source.ctx,origin,storage:()=>storage};const result=await source.api.resolveAccountVersions(ctx,{review:v,direction:'online',copies:copies(v),allProfilesConfirmed:true,replacementConfirmed:true},source.transport());assert.equal(result.outcome,'resolved');assert.ok(storage.getItem(source.local.STORE_KEYS.core));
 const bound=await source.api.reviewAccountBinding(storage.getItem(source.api.ACCOUNT_BINDING_KEY),origin,source.transport(),storage);assert.equal(bound.localChanged,false);assert.equal(bound.binding.origin,origin);assert.equal((await source.api.inspectProgressBackup(v.remoteArchive)).backup.source.origin,source.origin);
});

test('copy/readback, both consents, review identity, local freshness and lock are mandatory before any resolution write',async()=>{
 for(const mode of ['copies','consent','scope','forged','local','lock','cancel']){const f=await setup(),v=await review(f),input={review:v,direction:'online',copies:copies(v),allProfilesConfirmed:true,replacementConfirmed:true};
 if(mode==='copies')input.copies.online+='wrong';else if(mode==='consent')input.replacementConfirmed=false;else if(mode==='scope')input.allProfilesConfirmed=false;else if(mode==='forged')input.review={...v};else if(mode==='local')f.local.core.getState().addDraft('Mudou','');else if(mode==='lock')f.ctx.locks={request:async(_,__,fn)=>fn(null)};else f.ctx.isCurrent=()=>false;
 const before=domain(f);await assert.rejects(f.api.resolveAccountVersions(f.ctx,input,f.transport()));assert.equal(commits(f),0);assert.deepEqual(domain(f),before);assert.equal(f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY),null);}
});

test('a previously unconfirmed request cannot replace the selected version after the successful CAS fence',async()=>{
 for(const alreadyCommitted of [false,true]){const f=await setup(),bound=await f.api.inspectAccountBinding(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),f.origin);f.local.core.getState().addDraft('Pedido antigo','');const copy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin),oldTransport=f.transport(),old=await oldTransport.prepare({archive:copy.text,expectedRevision:bound.revision,allProfilesConfirmed:true});
 const raw=await f.api.sealAccountIntent({format:'conselho-elemental-account-intent',version:1,phase:'pending',origin:f.origin,userId:f.uid,operationId:old.operationId,expectedRevision:old.expectedRevision,archive:old.archive,archiveSha256:old.archiveSha256,baselineDigest:await f.api.accountBaselineDigest(f.storage),localMode:f.storage.getItem(f.api.LOCAL_PROGRESS_MODE_KEY)});f.local.memory.set(f.api.ACCOUNT_INTENT_KEY,raw);if(alreadyCommitted)await oldTransport.commit(old);
 f.local.core.getState().addDraft('Escolha mais recente','');const v=await review(f),result=await choose(f,v,'local');assert.equal(result.outcome,'resolved');if(alreadyCommitted)await oldTransport.commit(old);else await assert.rejects(oldTransport.commit(old),/online mudou/);
 const current=await f.transport().readProgress(f.uid);assert.equal(current.revision,result.receipt.revision);assert.equal(current.archive,v.localArchive);assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);}
});

test('lost acknowledgement does not touch local domain; receipt recovery completes without another commit',async()=>{
 const f=await setup();f.local.core.getState().addDraft('Versão local anterior','');const v=await review(f),before=domain(f);f.hook(async(when,name)=>{if(when==='after'&&name==='progress_account_commit')throw Error('ack lost');});await assert.rejects(choose(f,v));assert.deepEqual(domain(f),before);const raw=f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY);assert.ok(raw);assert.deepEqual((await boot(f)).events,['pending-account']);f.hook(async()=>{});const count=commits(f);assert.equal((await resume(f,raw)).outcome,'resolved');assert.equal(commits(f),count);
});

test('missing receipt does not retry without separate consent; retry uses exactly the stored operation',async()=>{
 const f=await setup(),v=await review(f);f.hook(async(when,name)=>{if(when==='before'&&name==='progress_account_commit')throw Error('offline');});await assert.rejects(choose(f,v));const raw=f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY),old=f.calls.find(c=>c.name==='progress_account_commit').args,count=commits(f);assert.equal((await resume(f,raw)).outcome,'awaiting-receipt');assert.equal(commits(f),count);f.hook(async()=>{});assert.equal((await resume(f,raw,true)).outcome,'resolved');const latest=f.calls.filter(c=>c.name==='progress_account_commit').at(-1).args;assert.equal(latest.p_operation_id,old.p_operation_id);assert.equal(latest.p_archive,old.p_archive);
});

test('interruption before/after every local handoff write stays guarded and resumes the same selected archive',async()=>{
 const keys=['conselho-elemental-local-progress-mode-v1','conselho-elemental-storage','dominio-do-mago-workout-storage-v1','conselho-elemental-account-binding-v1','conselho-elemental-account-intent-v1','conselho-elemental-account-resolution-v1'];
 for(const key of keys)for(const side of ['before','after']){const f=await setup();f.local.core.getState().addDraft('Anterior a receber','');f.local.fitness.getState().addBodyMeasurement({weightKg:74});const v=await review(f);let hits=0;f.writeHook((when,k)=>{if(k===key&&when===side&&(key!==f.api.ACCOUNT_RESOLUTION_KEY||++hits===2))throw Error('interrupted');});await assert.rejects(choose(f,v));f.writeHook(()=>{});const raw=f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY),entered=await boot(f);
 if(raw){assert.deepEqual(entered.events,['pending-account']);assert.equal((await resume(f,raw)).outcome,'resolved');}else{assert.deepEqual(entered.events,['app']);assert.equal(entered.fresh.isRestoredLocalDocument(),true);}
 const expected=(await f.api.inspectProgressBackup(v.remoteArchive)).backup;for(const part of ['core','fitness'])assert.deepEqual(JSON.parse(f.storage.getItem(f.local.STORE_KEYS[part])).state,expected.stores[part].state);
 }
});

test('a competing revision after review preserves the journal; an explicit safe local continuation allows re-evaluation',async()=>{
 const f=await setup();f.local.core.getState().addDraft('Manter local','');const v=await review(f),before=domain(f),other=f.transport(),cmd=await other.prepare({archive:v.localArchive,expectedRevision:v.revision,allProfilesConfirmed:true});let raced=false;
 f.hook(async(when,name)=>{if(!raced&&when==='before'&&name==='progress_account_commit'){raced=true;await other.commit(cmd);}});await assert.rejects(choose(f,v),/online mudou/);f.hook(async()=>{});const raw=f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY);assert.equal((await resume(f,raw)).outcome,'awaiting-receipt');assert.deepEqual(domain(f),before);
 assert.equal(await f.api.keepLocalAfterResolution(f.ctx,{raw,localUseConfirmed:true},f.transport()),'review-ready');assert.deepEqual(domain(f),before);assert.equal(f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY),null);assert.equal((await f.transport().readProgress(f.uid)).archive,v.localArchive);assert.equal((await boot(f)).fresh.isRestoredLocalDocument(),true);
});

test('unsafe cancellation, altered local data, wrong identity and malformed recovery metadata cannot apply or discard a choice',async()=>{
 for(const mode of ['unfenced','changed','user','corrupt','origin']){const f=await setup(),v=await review(f);f.hook(async(when,name)=>{if(when==='before'&&name==='progress_account_commit')throw Error('offline');});await assert.rejects(choose(f,v));f.hook(async()=>{});const raw=f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY);
 if(mode==='unfenced')await assert.rejects(f.api.keepLocalAfterResolution(f.ctx,{raw,localUseConfirmed:true},f.transport()),/Ainda não é seguro/);
 else if(mode==='changed'){f.local.core.getState().addDraft('Alteração externa','');await assert.rejects(resume(f,raw,true));}
 else if(mode==='user'){f.identity(randomUUID());await assert.rejects(resume(f,raw,true));}
 else if(mode==='corrupt'){f.local.memory.set(f.api.ACCOUNT_RESOLUTION_KEY,raw+'x');await assert.rejects(resume(f,raw+'x'));}
 else await assert.rejects(f.api.inspectAccountResolution(raw,'https://foreign.test'));
 assert.ok(f.storage.getItem(f.api.ACCOUNT_RESOLUTION_KEY));assert.deepEqual((await boot(f)).events,['pending-account']);}
});
