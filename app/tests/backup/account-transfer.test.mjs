import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto,randomUUID} from 'node:crypto';
import {createAccountDatabase,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';
const output=await build({stdin:{contents:`export * from './src/lib/backup/account-intent';export * from './src/lib/backup/account-binding';export * from './src/lib/backup/account-transfer';export * from './src/lib/backup/account-transport';export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/progress-mode';export * from './src/lib/backup/workspace-preview';export * from './src/lib/backup/exclusive-restore';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent'});
function realm(){const mod={exports:{}};new Function('require','module','exports','crypto',output.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);return mod.exports;}
let db;before(async()=>{db=await createAccountDatabase();});after(async()=>{await db?.close();});
async function setup(){
 const api=realm(),local=fixture(),origin='http://fixture.test',userId=randomUUID();await db.query('insert into auth.users(id) values($1)',[userId]);local.core.getState().addDraft('Progresso protegido','');local.core.getState().addExperience(9,'ar');
 const memory=local.memory,writes=[],calls=[];let active=true,writeHook=()=>{},rpcHook=async()=>{};
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{writeHook('before',k);memory.set(k,v);writes.push(k);writeHook('after',k);},removeItem:k=>{writeHook('before',k);memory.delete(k);writes.push(k);writeHook('after',k);}};
 const locks={request:async(_,options,fn)=>fn({mode:options.mode})};
 const context={origin,storage:()=>storage,locks,otherTabsClosed:true,isCurrent:()=>active};
 const client={auth:{getUser:async()=>({data:{user:{id:userId}},error:null})},rpc(name,args){return (async()=>{
  calls.push({name,args});const params=name==='progress_account_read'?[args.p_expected_user_id]:name==='progress_account_receipt'?[args.p_expected_user_id,args.p_operation_id]:[args.p_expected_user_id,args.p_expected_revision,args.p_operation_id,args.p_archive,args.p_all_profiles_confirmed];
  const sql=`select public.${name}(${params.map((_,i)=>'$'+(i+1)).join(',')}) as value`;
  const hook=await rpcHook('before',name,args);if(hook)return {data:null,error:hook};
  try{const result=await userQuery(db,userId,sql,params);await rpcHook('after',name,args);return {data:result.rows[0].value,error:null};}catch(e){return {data:null,error:{message:e.message}};}
 })();}};
 const transport=()=>api.createAccountTransport(client,{expectedUserId:userId,currentUserId:()=>userId,isCurrent:()=>active});
 const copy=await api.createWorkspaceSafetyCopy(storage,origin),input={baseline:copy.baseline,previousCopy:copy.text,allProfilesConfirmed:true,userId};
 return {api,local,origin,userId,memory,writes,calls,storage,context,input,transport,hook(fn){writeHook=fn;},rpcHook(fn){rpcHook=fn;},active(value){active=value;}};
}
async function start(f){return f.api.beginAccountTransfer(f.context,f.input,f.transport());}
async function boot(f){const api=realm(),events=[];await api.startProgressSession({origin:f.origin,storage:()=>f.storage,lifetime:Promise.resolve(),load:async()=>events.push('app'),blocked:r=>events.push(r)});return {api,events};}
const domain=f=>[f.memory.get(f.local.STORE_KEYS.core),f.memory.get(f.local.STORE_KEYS.fitness)];

test('intent is durable before SQL commit; reload blocks App, and confirmed finish retains local isolation without touching domain bytes',async()=>{
 const f=await setup(),before=domain(f);f.rpcHook(async(when,name)=>{if(when==='before'&&name==='progress_account_commit')assert.ok(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY));});
 const result=await start(f);assert.equal(result.storageConfirmed,true);assert.deepEqual((await boot(f)).events,['pending-account']);assert.deepEqual(domain(f),before);
 await assert.rejects(f.api.finishAccountTransferLocally(f.context,{raw:result.raw,localUseConfirmed:false},f.transport()),/Confirme/);
 await f.api.finishAccountTransferLocally(f.context,{raw:result.raw,localUseConfirmed:true},f.transport());assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);assert.deepEqual(domain(f),before);const fresh=await boot(f);assert.deepEqual(fresh.events,['app']);assert.equal(fresh.api.isRestoredLocalDocument(),true);
});

test('checking after a lost acknowledgement recovers the receipt without another remote write',async()=>{
 const f=await setup();let lost=false;f.rpcHook(async(when,name)=>{if(!lost&&when==='after'&&name==='progress_account_commit'){lost=true;throw Error('ack lost');}});
 await assert.rejects(start(f));const raw=f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),sent=f.calls.filter(c=>c.name==='progress_account_commit').length;
 const result=await f.api.reviewAccountTransfer(f.context,{raw},f.transport());assert.ok(result.receipt);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,sent);assert.equal(f.local.core.getState().user.xp_air,9);
});

test('missing receipt never retries automatically; a separate retry consent reuses the exact operation and archive',async()=>{
 const f=await setup();let fail=true;f.rpcHook(async(when,name)=>when==='before'&&name==='progress_account_commit'&&fail?{message:'offline'}:undefined);await assert.rejects(start(f));const raw=f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),old=f.calls.find(c=>c.name==='progress_account_commit').args;
 const checked=await f.api.reviewAccountTransfer(f.context,{raw},f.transport());assert.equal(checked.receipt,null);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,1);fail=false;
 const retried=await f.api.reviewAccountTransfer(f.context,{raw,retryConfirmed:true},f.transport());assert.ok(retried.receipt);const latest=f.calls.filter(c=>c.name==='progress_account_commit').at(-1).args;assert.equal(latest.p_operation_id,old.p_operation_id);assert.equal(latest.p_archive,old.p_archive);
});

test('pause needs no authentication/network and permits local edits; old-file finish requires explicit preservation of those edits',async()=>{
 const f=await setup(),result=await start(f),calls=f.calls.length;
 const paused=await f.api.pauseAccountTransferLocally(f.context,result.raw,true);assert.equal(f.calls.length,calls);assert.deepEqual((await boot(f)).events,['app']);assert.equal((await f.api.inspectAccountIntent(paused,f.origin)).phase,'paused');
 f.local.core.getState().addDraft('Nova edição depois do envio','');const before=domain(f);
 await assert.rejects(f.api.finishAccountTransferLocally(f.context,{raw:paused,localUseConfirmed:true},f.transport()),/edições locais posteriores/);
 await f.api.finishAccountTransferLocally(f.context,{raw:paused,localUseConfirmed:true,preserveNewerLocalConfirmed:true},f.transport());assert.deepEqual(domain(f),before);assert.equal(f.local.core.getState().drafts.length,2);
});

test('changed local data cannot resend a paused old attempt; receipt inspection remains available',async()=>{
 const f=await setup();f.rpcHook(async(when,name)=>when==='before'&&name==='progress_account_commit'?{message:'offline'}:undefined);await assert.rejects(start(f));const raw=f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),paused=await f.api.pauseAccountTransferLocally(f.context,raw,true);f.local.core.getState().addDraft('Mais recente','');
 const count=f.calls.length;await assert.rejects(f.api.reviewAccountTransfer(f.context,{raw:paused,retryConfirmed:true},f.transport()),/progresso local mudou/);assert.equal(f.calls.slice(count).some(c=>c.name==='progress_account_commit'),false);assert.deepEqual((await boot(f)).events,['app']);
});

test('interruption at every local handoff write leaves an active barrier or a paused local document, never legacy startup',async()=>{
 for(const phase of ['pause','finish'])for(const side of ['before','after'])for(const key of ['conselho-elemental-local-progress-mode-v1','conselho-elemental-account-intent-v1']){
  const f=await setup(),result=await start(f);f.hook((when,k)=>{if(when===side&&k===key)throw Error('interrupted');});
  await assert.rejects(phase==='pause'?f.api.pauseAccountTransferLocally(f.context,result.raw,true):f.api.finishAccountTransferLocally(f.context,{raw:result.raw,localUseConfirmed:true},f.transport()));f.hook(()=>{});
  const fresh=await boot(f);if(fresh.events.includes('app'))assert.equal(fresh.api.isRestoredLocalDocument(),true);else assert.deepEqual(fresh.events,['pending-account']);
 }
});

test('copy mismatch, missing consent, other tab, stale baseline and a restore journal refuse before any upload',async()=>{
 for(const kind of ['copy','consent','lock','baseline','restore','cancel']){
  const f=await setup();if(kind==='copy')f.input.previousCopy=f.input.previousCopy.replace('Progresso protegido','other');else if(kind==='consent')f.input.allProfilesConfirmed=false;else if(kind==='lock')f.context.locks={request:async(_,__,fn)=>fn(null)};else if(kind==='baseline')f.local.core.getState().addDraft('Mudou','');else if(kind==='restore')f.memory.set('conselho-elemental-restore-journal-v1','pending');else f.active(false);
  await assert.rejects(start(f));assert.equal(f.calls.some(c=>c.name==='progress_account_commit'),false);assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);
 }
});

test('intent corruption/foreign origin and paused state without isolation never start App; restore refuses an outstanding transfer',async()=>{
 const f=await setup(),result=await start(f);await assert.rejects(f.api.inspectAccountIntent(result.raw,'https://other.test'));f.memory.set(f.api.ACCOUNT_INTENT_KEY,result.raw.replace('pending','paused'));assert.deepEqual((await boot(f)).events,['pending-account']);
 await assert.rejects(f.api.sealAccountIntent({...await f.api.inspectAccountIntent(result.raw,f.origin),phase:['paused']}));
 const paused=await f.api.sealAccountIntent({...await f.api.inspectAccountIntent(result.raw,f.origin),phase:'paused'});f.memory.set(f.api.ACCOUNT_INTENT_KEY,paused);f.memory.delete(f.api.LOCAL_PROGRESS_MODE_KEY);assert.deepEqual((await boot(f)).events,['pending-account']);
 await assert.rejects(f.api.runExclusiveRestore({...f.context,isCurrent:()=>true},{mode:'apply',journal:'unused',previousBackup:null,replacementConfirmed:true}),/conferência da conta/);
 assert.ok(!Object.keys(output.metafile.inputs).some(path=>/stores|services|\/supabase\.ts/.test(path)));
});


test('binding is explicit and contains receipt metadata only; fresh documents isolate even if the mode marker is absent',async()=>{
 const f=await setup(),result=await start(f),before=domain(f);
 await f.api.finishAccountTransferLocally(f.context,{raw:result.raw,localUseConfirmed:true},f.transport());
 assert.equal(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),null);
 const g=await setup(),sent=await start(g);
 await g.api.finishAccountTransferLocally(g.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},g.transport());
 const raw=g.storage.getItem(g.api.ACCOUNT_BINDING_KEY),binding=await g.api.inspectAccountBinding(raw,g.origin);
 assert.equal(binding.userId,g.userId);assert.equal(binding.revision,sent.receipt.revision);
 assert.deepEqual(Object.keys(binding).sort(),['format','version','origin','userId','operationId','revision','expectedRevision','archiveSha256','createdAt','baselineDigest'].sort());
 g.memory.delete(g.api.LOCAL_PROGRESS_MODE_KEY);const fresh=await boot(g);assert.deepEqual(fresh.events,['app']);assert.equal(fresh.api.isRestoredLocalDocument(),true);
 assert.deepEqual(domain(f),before);await assert.rejects(g.api.inspectAccountBinding(raw,'https://foreign.test'));g.memory.set(g.api.ACCOUNT_BINDING_KEY,raw+'x');assert.deepEqual((await boot(g)).events,['pending-account']);
});

test('a bound account can explicitly save a later full archive with CAS, preserving all local IDs and rewards',async()=>{
 const f=await setup(),sent=await start(f);
 await f.api.finishAccountTransferLocally(f.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport());
 const first=await f.api.reviewAccountBinding(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),f.origin,f.transport(),f.storage);assert.equal(first.localChanged,false);
 f.local.core.getState().addDraft('Edição posterior','');f.local.core.getState().addExperience(3,'terra');
 const before=domain(f),copy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin);f.input={...f.input,baseline:copy.baseline,previousCopy:copy.text};
 const updated=await start(f),intent=await f.api.inspectAccountIntent(updated.raw,f.origin);assert.equal(intent.expectedRevision,sent.receipt.revision);
 await f.api.finishAccountTransferLocally(f.context,{raw:updated.raw,localUseConfirmed:true},f.transport());
 const binding=await f.api.inspectAccountBinding(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),f.origin);assert.equal(binding.revision,updated.receipt.revision);assert.notEqual(binding.revision,sent.receipt.revision);assert.deepEqual(domain(f),before);
 const reviewed=await f.api.reviewAccountBinding(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),f.origin,f.transport(),f.storage);assert.equal(reviewed.localChanged,false);assert.equal(f.local.core.getState().user.xp_earth,3);
});

test('another revision online, another identity or a changed binding refuse a bound upload without overwriting either side',async()=>{
 const f=await setup(),sent=await start(f);await f.api.finishAccountTransferLocally(f.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport());
 const bindingRaw=f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),binding=await f.api.inspectAccountBinding(bindingRaw,f.origin);
 f.local.core.getState().addDraft('Outra versão online','');const copy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin),tx=f.transport(),cmd=await tx.prepare({archive:copy.text,expectedRevision:binding.revision,allProfilesConfirmed:true});await tx.commit(cmd);
 f.local.core.getState().addDraft('Edição apenas local','');const localCopy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin);f.input={...f.input,baseline:localCopy.baseline,previousCopy:localCopy.text};const before=domain(f),count=f.calls.filter(c=>c.name==='progress_account_commit').length;
 await assert.rejects(start(f),/online mudou/);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,count);assert.deepEqual(domain(f),before);assert.equal(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),bindingRaw);
 const other={verifyIdentity:async()=>({userId:randomUUID()})};await assert.rejects(f.api.reviewAccountBinding(bindingRaw,f.origin,other,f.storage),/vínculo/);
});

test('a lost acknowledgement on a bound update recovers the original operation without retrying the file',async()=>{
 const f=await setup(),sent=await start(f);await f.api.finishAccountTransferLocally(f.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport());f.local.core.getState().addDraft('Depois','');const copy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin);f.input={...f.input,baseline:copy.baseline,previousCopy:copy.text};
 let lost=false;f.rpcHook(async(when,name)=>{if(!lost&&when==='after'&&name==='progress_account_commit'){lost=true;throw Error('ack lost');}});await assert.rejects(start(f));const raw=f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),count=f.calls.filter(c=>c.name==='progress_account_commit').length;
 const reviewed=await f.api.reviewAccountTransfer(f.context,{raw},f.transport());assert.ok(reviewed.receipt);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,count);
 await f.api.finishAccountTransferLocally(f.context,{raw,localUseConfirmed:true},f.transport());assert.equal((await f.api.inspectAccountBinding(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY),f.origin)).revision,reviewed.receipt.revision);
});

test('interruption around binding handoff never clears the pending guard before a durable binding',async()=>{
 for(const side of ['before','after']){
 const f=await setup(),sent=await start(f);f.hook((when,key)=>{if(when===side&&key===f.api.ACCOUNT_BINDING_KEY)throw Error('interrupted binding');});
 await assert.rejects(f.api.finishAccountTransferLocally(f.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport()));f.hook(()=>{});assert.ok(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY));assert.deepEqual((await boot(f)).events,['pending-account']);
 await f.api.finishAccountTransferLocally(f.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport());assert.ok(f.storage.getItem(f.api.ACCOUNT_BINDING_KEY));assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);
 }
});

test('binding changes during hashing or remote review invalidate startup and refuse the next write',async()=>{
 const f=await setup(),sent=await start(f);await f.api.finishAccountTransferLocally(f.context,{raw:sent.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport());
 const original=f.storage.getItem(f.api.ACCOUNT_BINDING_KEY);let reads=0;
 const events=[],api=realm();await api.startProgressSession({origin:f.origin,storage:()=>({getItem:key=>{if(key===f.api.ACCOUNT_BINDING_KEY&&++reads===2)return original+'x';return f.storage.getItem(key);}}),load:async()=>events.push('app'),blocked:r=>events.push(r),lifetime:Promise.resolve()});assert.deepEqual(events,['pending-account']);
 const copy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin);f.input={...f.input,baseline:copy.baseline,previousCopy:copy.text};const count=f.calls.filter(c=>c.name==='progress_account_commit').length;
 f.rpcHook(async(when,name)=>{if(when==='after'&&name==='progress_account_read')f.memory.set(f.api.ACCOUNT_BINDING_KEY,original+'x');});await assert.rejects(start(f),/vínculo mudou/);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,count);
});

test('a competing remote update between bound review and commit is rejected by SQL CAS and retains the local attempt',async()=>{
 const f=await setup(),first=await start(f);await f.api.finishAccountTransferLocally(f.context,{raw:first.raw,localUseConfirmed:true,bindAccountConfirmed:true},f.transport());
 f.local.core.getState().addDraft('Arquivo de outro dispositivo sintético','');const remoteCopy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin),other=f.transport(),cmd=await other.prepare({archive:remoteCopy.text,expectedRevision:first.receipt.revision,allProfilesConfirmed:true});
 f.local.core.getState().addDraft('Edição local concorrente','');const localCopy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin);f.input={...f.input,baseline:localCopy.baseline,previousCopy:localCopy.text};const before=domain(f);let raced=false;
 f.rpcHook(async(when,name)=>{if(!raced&&when==='before'&&name==='progress_account_commit'){raced=true;await other.commit(cmd);}});
 await assert.rejects(start(f),/online mudou/);assert.deepEqual(domain(f),before);assert.ok(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY));assert.deepEqual((await boot(f)).events,['pending-account']);
 const reviewed=await f.api.reviewAccountTransfer(f.context,{raw:f.storage.getItem(f.api.ACCOUNT_INTENT_KEY)},f.transport());assert.equal(reviewed.receipt,null);
});
