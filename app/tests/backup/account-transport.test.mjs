import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
import {createAccountDatabase,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';
const output=await build({stdin:{contents:`export * from './src/lib/backup/account-transport';export * from './src/lib/backup/association-review';`,loader:'ts',resolveDir:process.cwd()},bundle:true,platform:'node',format:'cjs',write:false,metafile:true,logLevel:'silent'});
const mod={exports:{}};new Function('require','module','exports','crypto',output.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);const api=mod.exports;
let db;before(async()=>{db=await createAccountDatabase();});after(async()=>{await db?.close();});
async function setup(){
 const userId=randomUUID();await db.query('insert into auth.users(id) values($1)',[userId]);const local=fixture();local.core.getState().addDraft('Local protegido','');local.core.getState().addExperience(23,'ar');
 const archive=await local.createProgressBackup(local.captureProgress('http://fixture.test'));let current=userId,session=userId,active=true;
 const calls=[],hooks={beforeRpc:async()=>{},afterRpc:async()=>{}};
 const client={auth:{getUser:async()=>({data:{user:session?{id:session}:null},error:null})},rpc(name,args){const request=(async()=>{
  const call={name,args:{...args}};calls.push(call);const failure=await hooks.beforeRpc(call);if(failure)return {data:null,error:failure};
  const mapping={progress_account_read:['select public.progress_account_read($1) as value',[args.p_expected_user_id]],progress_account_commit:['select public.progress_account_commit($1,$2,$3,$4,$5) as value',[args.p_expected_user_id,args.p_expected_revision,args.p_operation_id,args.p_archive,args.p_all_profiles_confirmed]],progress_account_adopt_legacy:['select public.progress_account_adopt_legacy($1,$2,$3,$4,$5,$6) as value',[args.p_expected_user_id,args.p_expected_revision,args.p_operation_id,args.p_archive,args.p_all_profiles_confirmed,args.p_legacy_replacement_confirmed]],progress_account_receipt:['select public.progress_account_receipt($1,$2) as value',[args.p_expected_user_id,args.p_operation_id]]};
  assert.ok(mapping[name],name);const [sql,params]=mapping[name];let result;try{result={data:(await userQuery(db,session,sql,params)).rows[0].value,error:null};}catch(e){result={data:null,error:{message:e.message,code:e.code}};}
  await hooks.afterRpc(call,result);return result;
 })();return request;}};
 const guard={expectedUserId:userId,currentUserId:()=>current,isCurrent:()=>active};const transport=api.createAccountTransport(client,guard);
 return {userId,local,archive,guard,transport,calls,hooks,client,user(value){current=value;},session(value){session=value;},active(value){active=value;},prepare:()=>transport.prepare({archive,expectedRevision:'empty',allProfilesConfirmed:true})};
}

test('real SQL and transport complete prepare/commit/receipt/readback without touching local data or authorizing association',async()=>{
 const f=await setup(),before=[...f.local.memory],command=await f.prepare();assert.equal(f.calls.length,0);assert.ok(Object.isFrozen(command));
 const receipt=await f.transport.commit(command),confirmed=await f.transport.confirm(command);assert.equal(receipt.userId,f.userId);assert.equal(confirmed.storageConfirmed,true);assert.equal(confirmed.associationAllowed,false);assert.equal(confirmed.receipt.operationId,command.operationId);assert.deepEqual([...f.local.memory],before);
 assert.ok(f.calls.every(c=>c.args.p_expected_user_id===f.userId));assert.ok(!Object.keys(output.metafile.inputs).some(path=>/stores|services|\/supabase\.ts/.test(path)));
});

test('new reader satisfies the existing guarded comparison contract using actual SQL responses',async()=>{
 const f=await setup(),context={origin:'http://fixture.test',readLocal:()=>f.local.captureProgress('http://fixture.test'),isCurrent:()=>true,expectedUserId:f.userId,currentUserId:()=>f.userId};
 const local=await api.prepareLocalAssociationReview(context),empty=await api.prepareRemoteAssociationReview(local,context,f.transport);assert.equal(empty.remoteSummary,null);
 const command=await f.prepare();await f.transport.commit(command);const result=await api.prepareRemoteAssociationReview(local,context,f.transport);assert.equal(result.remoteSummary.drafts,1);assert.equal(result.associationAllowed,false);assert.ok(result.comparison.accounts.every(account=>account.xp.every(xp=>xp.before===xp.after)));
});

test('consent, fabricated command, cancelled preview and different user block before a write request',async()=>{
 const f=await setup();await assert.rejects(f.transport.prepare({archive:f.archive,expectedRevision:'empty',allProfilesConfirmed:false}),/Confirme/);
 const command=await f.prepare();await assert.rejects(f.transport.commit({...command}),/Prepare novamente/);f.active(false);await assert.rejects(f.transport.commit(command),/mudou/);f.active(true);f.user(null);await assert.rejects(f.transport.commit(command),/mudou/);assert.equal(f.calls.length,0);
});

test('server binds expected identity even when the SDK session changes between identity validation and RPC execution',async()=>{
 const f=await setup(),other=randomUUID();await db.query('insert into auth.users(id) values($1)',[other]);const command=await f.prepare();
 f.hooks.beforeRpc=async call=>{if(call.name==='progress_account_commit')f.session(other);};await assert.rejects(f.transport.commit(command),/servidor não confirmou/);
 for(const uid of [f.userId,other])assert.equal((await userQuery(db,uid,'select public.progress_account_read($1) as value',[uid])).rows[0].value.kind,'empty');
});

test('lost acknowledgement can be recovered by exact receipt and readback without republishing or crediting XP',async()=>{
 const f=await setup(),command=await f.prepare();let lost=false;f.hooks.afterRpc=async call=>{if(!lost&&call.name==='progress_account_commit'){lost=true;throw Error('synthetic timeout after server commit');}};
 await assert.rejects(f.transport.commit(command),/Confira o recibo/);const count=f.calls.filter(c=>c.name==='progress_account_commit').length;
 const recovered=await f.transport.confirm(command);assert.equal(recovered.storageConfirmed,true);assert.equal(f.calls.filter(c=>c.name==='progress_account_commit').length,count);assert.equal(f.local.core.getState().user.xp_air,23);
 assert.deepEqual(await f.transport.commit(command),recovered.receipt);
});

test('a later revision invalidates old confirmation and stale CAS cannot erase the new archive',async()=>{
 const f=await setup(),first=await f.prepare(),receipt=await f.transport.commit(first);f.local.core.getState().addDraft('Outra edição','');
 const archive=await f.local.createProgressBackup(f.local.captureProgress('http://fixture.test')),second=await f.transport.prepare({archive,expectedRevision:receipt.revision,allProfilesConfirmed:true});await f.transport.commit(second);
 await assert.rejects(f.transport.confirm(first),/não corresponde mais/);const stale=await f.prepare();await assert.rejects(f.transport.commit(stale),/online mudou/);assert.equal((await f.transport.readProgress(f.userId)).archive,archive);
});

test('legacy content is explicit, preserved by adoption and never treated as a new empty account',async()=>{
 const f=await setup();await userQuery(db,f.userId,'insert into public.drafts(user_id,title) values($1,$2)',[f.userId,'Legado']);const legacy=await f.transport.readProgress(f.userId);assert.deepEqual({kind:legacy.kind,revision:legacy.revision,complete:legacy.complete},{kind:'legacy',revision:'legacy',complete:false});
 const emptyCommand=await f.prepare();await assert.rejects(f.transport.commit(emptyCommand),/dados no formato anterior/);
 const command=await f.transport.prepare({archive:f.archive,expectedRevision:'legacy',allProfilesConfirmed:true});const receipt=await f.transport.commit(command);assert.equal(receipt.expectedRevision,'legacy');assert.equal((await f.transport.readProgress(f.userId)).archive,f.archive);
 const snapshot=await db.query('select legacy_snapshot from progress_private.legacy_adoptions where user_id=$1',[f.userId]);assert.equal(snapshot.rows[0].legacy_snapshot.drafts[0].title,'Legado');assert.equal((await userQuery(db,f.userId,'select title from public.drafts where user_id=$1',[f.userId])).rows[0].title,'Legado');
 f.hooks.beforeRpc=async()=>({message:'function is not available'});await assert.rejects(f.transport.readProgress(f.userId),/servidor não confirmou/);
});

test('abort and late user/generation changes reject results; a server receipt remains available for deliberate recovery',async()=>{
 for(const mode of ['abort','generation','user']){
  const f=await setup(),command=await f.prepare(),controller=new AbortController();f.hooks.afterRpc=async call=>{if(call.name==='progress_account_commit'){if(mode==='abort')controller.abort();else if(mode==='generation')f.active(false);else f.user(null);}};
  await assert.rejects(f.transport.commit(command,controller.signal),/mudou/);f.active(true);f.user(f.userId);f.hooks.afterRpc=async()=>{};assert.ok(await f.transport.getReceipt(command));
 }
});
