import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto,randomUUID} from 'node:crypto';
import {createAccountDatabase,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';
const bundled=await build({stdin:{contents:`export * from './src/lib/backup/account-live-sync';export * from './src/lib/backup/account-binding';export * from './src/lib/backup/account-intent';export * from './src/lib/backup/account-transport';export * from './src/lib/backup/account-transfer';export * from './src/lib/backup/account-conflict';export * from './src/lib/backup/workspace-preview';export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/progress-mode';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent',plugins:[{name:'release',setup(b){b.onResolve({filter:/account-release$/},()=>({path:'test-release',external:true}));}}]});
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

test('closed release and absent lease/consent refuse construction; a no-change check does not commit',async()=>{
 const f=await setup();assert.throws(()=>realm(false).createLiveAccountSync(f.options),/não foi liberada/);f.exclusive(false);assert.throws(f.live,/exclusiva/);f.exclusive(true);assert.throws(()=>f.api.createLiveAccountSync({...f.options,session:{...f.options.session,allProfilesConfirmed:false}}),/Confirme/);
 const live=f.live();await live.flush();assert.equal(live.getSnapshot().status,'saved');assert.equal(commits(f),0);assert.deepEqual(f.writes,[]);live.stop();live.stop();assert.equal(f.disposed,1);
});

test('a live save keeps exact domain bytes, writes the intent first and confirms receipt before advancing the binding',async()=>{
 const f=await setup(),live=f.live();f.local.core.getState().addDraft('Edição feita na sessão','');f.local.fitness.getState().addBodyMeasurement({weightKg:71});const before=domain(f);
 f.hook(async(when,name)=>{if(when==='before'&&name==='progress_account_commit')assert.ok(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY));});await live.flush();assert.equal(live.getSnapshot().status,'saved');assert.equal(commits(f),1);assert.deepEqual(domain(f),before);assert.equal(f.local.core.getState().user.xp_air,7);assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);
 assert.deepEqual(f.writes,[f.api.ACCOUNT_INTENT_KEY,f.api.LOCAL_PROGRESS_MODE_KEY,f.api.ACCOUNT_BINDING_KEY,f.api.ACCOUNT_INTENT_KEY]);await live.flush();assert.equal(commits(f),1);live.stop();
});

test('edits made during a commit stay local and are sent only in a later full revision',async()=>{
 const f=await setup(),live=f.live();f.local.core.getState().addDraft('Primeiro envio','');let edited=false;f.hook(async(when,name)=>{if(!edited&&when==='after'&&name==='progress_account_commit'){edited=true;f.local.core.getState().addDraft('Edição mais recente','');}});
 await live.flush();assert.equal(live.getSnapshot().status,'idle');assert.equal(commits(f),1);const first=f.calls.find(c=>c.name==='progress_account_commit').args.p_archive;assert.doesNotMatch(first,/Edição mais recente/);await live.flush();assert.equal(live.getSnapshot().status,'saved');assert.equal(commits(f),2);assert.match(f.calls.filter(c=>c.name==='progress_account_commit').at(-1).args.p_archive,/Edição mais recente/);live.stop();
});

test('lost response retains the attempt, blocks automatic resend and recovers through the existing explicit receipt flow',async()=>{
 const f=await setup(),live=f.live();f.local.core.getState().addDraft('Envio sem confirmação','');f.hook(async(when,name)=>{if(when==='after'&&name==='progress_account_commit')throw Error('ack lost');});await live.flush();assert.equal(live.getSnapshot().status,'pending');const raw=f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),count=f.calls.length;await live.flush();assert.equal(f.calls.length,count);live.stop();f.hook(async()=>{});
 const checked=await f.api.reviewAccountTransfer(f.ctx,{raw},f.transport());assert.ok(checked.receipt);assert.equal(commits(f),1);await f.api.finishAccountTransferLocally(f.ctx,{raw,localUseConfirmed:true},f.transport());assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);
});

test('stop/logout while the request is in flight prevents late local acknowledgement and leaves the durable attempt',async()=>{
 const f=await setup(),live=f.live();f.local.core.getState().addDraft('Envio em andamento','');let release,arrived;const waiting=new Promise(r=>release=r),seen=new Promise(r=>arrived=r);f.hook(async(when,name)=>{if(when==='after'&&name==='progress_account_commit'){arrived();await waiting;}});
 const running=live.flush();await seen;live.stop();release();await running;assert.equal(live.getSnapshot().status,'stopped');assert.ok(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY));assert.equal(f.disposed,1);assert.equal(commits(f),1);
});

test('changed remote revision, wrong user, lost lease and foreign binding stop without publishing local data',async()=>{
 for(const mode of ['remote','user','lease','binding']){const f=await setup(),live=f.live();f.local.core.getState().addDraft('Edição protegida','');const before=domain(f);
 if(mode==='remote'){const tx=f.transport(),copy=await f.api.createWorkspaceSafetyCopy(f.storage,f.origin),binding=await f.api.inspectAccountBinding(f.options.session.bindingRaw,f.origin),cmd=await tx.prepare({archive:copy.text,expectedRevision:binding.revision,allProfilesConfirmed:true});await tx.commit(cmd);f.calls.length=0;}
 else if(mode==='user')f.identity(randomUUID());else if(mode==='lease')f.exclusive(false);else f.local.memory.set(f.api.ACCOUNT_BINDING_KEY,'changed');
 await live.flush();assert.equal(live.getSnapshot().status,'blocked');assert.equal(commits(f),0);assert.deepEqual(domain(f),before);live.stop();}
});

test('interruption at each handoff write preserves either a pending barrier or a completed local binding',async()=>{
 for(const key of ['conselho-elemental-account-intent-v1','conselho-elemental-account-binding-v1','conselho-elemental-local-progress-mode-v1'])for(const side of ['before','after']){
 const f=await setup(),live=f.live();f.local.core.getState().addDraft('Edição durável','');let once=false;f.writeHook((when,k)=>{if(!once&&k===key&&when===side){once=true;throw Error('interrupted');}});const before=domain(f);await live.flush();assert.deepEqual(domain(f),before);assert.ok(['pending','blocked'].includes(live.getSnapshot().status));f.writeHook(()=>{});
 const fresh=realm(),events=[];await fresh.startProgressSession({origin:f.origin,storage:()=>f.storage,lifetime:Promise.resolve(),load:async()=>events.push('app'),blocked:r=>events.push(r)});if(events.includes('app'))assert.equal(fresh.isRestoredLocalDocument(),true);else assert.deepEqual(events,['pending-account']);live.stop();}
});

test('the same flush is serialized and a pending attempt blocks before any automatic network request',async()=>{
 const f=await setup(),live=f.live();f.local.core.getState().addDraft('Um envio','');const first=live.flush();assert.equal(live.flush(),first);await first;assert.equal(commits(f),1);live.stop();
 const g=await setup(),next=g.live();g.local.memory.set(g.api.ACCOUNT_INTENT_KEY,'pending');await next.flush();assert.equal(next.getSnapshot().status,'pending');assert.equal(g.calls.length,0);next.stop();
});

test('conflict review returns both exact archives without a write; late local edits invalidate comparison',async()=>{
 const f=await setup();f.local.core.getState().addDraft('Só local','');const before=domain(f),writes=f.writes.length;
 const reviewed=await f.api.reviewAccountVersions({origin:f.origin,storage:f.storage,isCurrent:()=>true,transport:f.transport()});assert.equal(reviewed.localSummary.drafts,2);assert.equal(reviewed.remoteSummary.drafts,1);assert.equal(f.writes.length,writes);assert.equal(commits(f),0);assert.deepEqual(domain(f),before);
 assert.match(reviewed.remoteArchive,/Arquivo original/);assert.doesNotMatch(reviewed.remoteArchive,/Só local/);
 f.hook(async(when,name)=>{if(when==='after'&&name==='progress_account_read')f.local.core.getState().addDraft('Alterado durante leitura','');});await assert.rejects(f.api.reviewAccountVersions({origin:f.origin,storage:f.storage,isCurrent:()=>true,transport:f.transport()}),/versões mudaram/);
 assert.ok(!Object.keys(bundled.metafile.inputs).some(path=>/stores|services|\/supabase\.ts/.test(path)));
});

test('a silently denied intent/binding write or interruption at final clearing never loses local edits or activates legacy startup',async()=>{
 for(const mode of ['intent','binding','clear-before','clear-after']){
 const f=await setup();f.local.core.getState().addDraft('Preservado em falha de storage','');const before=domain(f);
 const storage={...f.storage,setItem:(key,value)=>{if((mode==='intent'&&key===f.api.ACCOUNT_INTENT_KEY)||(mode==='binding'&&key===f.api.ACCOUNT_BINDING_KEY))return;f.storage.setItem(key,value);},removeItem:key=>{if(key===f.api.ACCOUNT_INTENT_KEY&&mode==='clear-before')throw Error('interrupted');f.storage.removeItem(key);if(key===f.api.ACCOUNT_INTENT_KEY&&mode==='clear-after')throw Error('interrupted');}};
 const live=f.api.createLiveAccountSync({...f.options,storage});await live.flush();assert.deepEqual(domain(f),before);assert.ok(['pending','blocked'].includes(live.getSnapshot().status));if(mode==='intent')assert.equal(commits(f),0);
 const fresh=realm(),events=[];await fresh.startProgressSession({origin:f.origin,storage:()=>f.storage,lifetime:Promise.resolve(),load:async()=>events.push('app'),blocked:r=>events.push(r)});if(events.includes('app'))assert.equal(fresh.isRestoredLocalDocument(),true);else assert.deepEqual(events,['pending-account']);live.stop();
 }
});


test('page lifecycle disposal preserves remembered access; explicit forget and identity invalidation remove it separately',async()=>{
 for(const action of ['stop','forgetAccess','invalidate']){const f=await setup();let forgotten=0;f.options.session.forgetResume=()=>{forgotten++;};const live=f.live();live[action]();assert.equal(forgotten,action==='stop'?0:1);assert.equal(f.disposed,1);assert.equal(commits(f),0);}
 const f=await setup();f.options.session.forgetResume=()=>{throw Error('storage denied');};const live=f.live();assert.equal(live.forgetAccess(),false);assert.equal(live.getSnapshot().status,'stopped');assert.equal(f.disposed,1);
});

test('offline use writes no intent or network request; reconnect saves exact edits and exposes the receipt timestamp',async()=>{
 const f=await setup();let online=false;const live=f.api.createLiveAccountSync({...f.options,isOnline:()=>online});f.local.core.getState().addDraft('Edição offline preservada','');const before=domain(f);
 await live.flush();assert.equal(live.getSnapshot().status,'offline');assert.equal(f.calls.length,0);assert.deepEqual(domain(f),before);assert.equal(f.storage.getItem(f.api.ACCOUNT_INTENT_KEY),null);
 online=true;await live.flush();assert.equal(live.getSnapshot().status,'saved');assert.equal(commits(f),1);assert.ok(Number.isFinite(Date.parse(live.getSnapshot().lastSavedAt)));assert.deepEqual(domain(f),before);live.stop();
});
