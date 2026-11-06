import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,createHash} from 'node:crypto';
import {createAccountDatabase,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';
let db;before(async()=>{db=await createAccountDatabase();});after(async()=>{await db?.close();});
async function setup(){const userId=randomUUID();await db.query('insert into auth.users(id) values($1)',[userId]);const f=fixture();f.core.getState().addDraft('Registro íntegro','acentos, água, símbolos ✨, aspas " e linha\n');f.core.getState().addExperience(11,'agua');f.fitness.getState().addBodyMeasurement({weightKg:70});const archive=await f.createProgressBackup(f.captureProgress('http://fixture.test'));
 return {userId,f,archive,read:async()=> (await userQuery(db,userId,'select public.progress_account_read($1) as value',[userId])).rows[0].value,
 commit:async({expected='empty',operation=randomUUID(),text=archive,confirmed=true,target=userId}={})=>(await userQuery(db,userId,'select public.progress_account_commit($1,$2,$3,$4,$5) as value',[target,expected,operation,text,confirmed])).rows[0].value};}

test('actual SQL migration preserves all archive bytes and fields, and receipt matches authenticated owner and hash',async()=>{
 const f=await setup(),empty=await f.read();assert.equal(empty.kind,'empty');assert.equal(empty.archive,null);assert.equal(empty.complete,true);
 const receipt=await f.commit(),current=await f.read();assert.equal(receipt.userId,f.userId);assert.equal(current.archive,f.archive);assert.equal(current.revision,receipt.revision);assert.equal(current.coverage.core.length,18);assert.equal(current.coverage.fitness.length,3);
 const verified=await f.f.inspectProgressBackup(current.archive);assert.equal(verified.backup.stores.core.state.user.xp_water,11);assert.ok(Object.keys(verified.backup.stores.fitness.state.accountDataById).length);
});

test('same operation is exactly idempotent, mismatched reuse and stale revision cannot overwrite a newer commit',async()=>{
 const f=await setup(),operation=randomUUID(),first=await f.commit({operation});assert.deepEqual(await f.commit({operation}),first);
 f.f.core.getState().addDraft('Segundo estado','');const text=await f.f.createProgressBackup(f.f.captureProgress('http://fixture.test'));
 await assert.rejects(f.commit({operation,text}),/progress_operation_reused/);
 const second=await f.commit({expected:first.revision,text});assert.notEqual(second.revision,first.revision);
 await assert.rejects(f.commit({expected:first.revision}),/progress_revision_conflict/);
 assert.deepEqual(await f.commit({operation}),first);assert.equal((await f.read()).archive,text);
});

test('different auth owner, anonymous access and direct-table writes are denied; receipt cannot be read across users',async()=>{
 const a=await setup(),b=await setup(),receipt=await a.commit();
 await assert.rejects(userQuery(db,b.userId,'select public.progress_account_read($1)',[a.userId]),/progress_auth_required/);
 await assert.rejects(b.commit({target:a.userId}),/progress_auth_required/);
 await assert.rejects(userQuery(db,null,'select public.progress_account_read($1)',[a.userId],'anon'),/permission denied/);
 await assert.rejects(userQuery(db,a.userId,'select * from progress_private.account_state'),/permission denied/);
 await assert.rejects(userQuery(db,a.userId,'delete from progress_private.account_receipts'),/permission denied/);
 const own=await userQuery(db,a.userId,'select public.progress_account_receipt($1,$2) as value',[a.userId,receipt.operationId]);assert.deepEqual(own.rows[0].value,receipt);
 const foreign=await userQuery(db,b.userId,'select public.progress_account_receipt($1,$2) as value',[b.userId,receipt.operationId]);assert.equal(foreign.rows[0].value,null);
});

test('archive corruption, unsupported version, unsafe/duplicate keys, wrong store alignment and missing consent never write',async()=>{
 const f=await setup();for(const text of [f.archive.replace('Registro íntegro','Corrompido'),'{',f.archive.replace('"format":','"format":"duplicate","format":')])await assert.rejects(f.commit({text}),/progress_invalid_archive/);
 await assert.rejects(f.commit({confirmed:false}),/progress_consent_required/);
 for(const mutate of [s=>s.appVersion='99.0.0',s=>s.stores.core.state.extra=[],s=>s.source.accountId='different',s=>s.appVersion=null]){const snapshot=structuredClone(f.f.captureProgress('http://fixture.test'));mutate(snapshot);const text=JSON.stringify({...snapshot,checksum:{algorithm:'SHA-256',value:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')}});await assert.rejects(f.commit({text}),/progress_invalid_archive/);}
 assert.equal((await f.read()).kind,'empty');assert.equal((await db.query('select count(*)::int as n from progress_private.account_receipts where user_id=$1',[f.userId])).rows[0].n,0);
});

test('failure between state and receipt rolls back both, and retry can safely use the original operation',async()=>{
 const f=await setup(),operation=randomUUID();await db.exec(`create function progress_private.test_receipt_failure() returns trigger language plpgsql as $$begin raise exception 'synthetic failure';end$$;
 create trigger test_receipt_failure before insert on progress_private.account_receipts for each row execute function progress_private.test_receipt_failure();`);
 try{await assert.rejects(f.commit({operation}),/synthetic failure/);}finally{await db.exec('drop trigger test_receipt_failure on progress_private.account_receipts;drop function progress_private.test_receipt_failure();');}
 assert.equal((await f.read()).kind,'empty');await f.commit({operation});assert.equal((await f.read()).archive,f.archive);
});

test('legacy data is never silently treated as empty or overwritten, and unassociated accounts retain the old service behavior',async()=>{
 const f=await setup();await userQuery(db,f.userId,'insert into public.drafts(user_id,title,payload) values($1,$2,$3)',[f.userId,'Legado preservado','{}']);
 const result=await f.read();assert.equal(result.kind,'legacy');assert.equal(result.complete,false);await assert.rejects(f.commit(),/progress_legacy_requires_review/);
 assert.equal((await userQuery(db,f.userId,'select title from public.drafts where user_id=$1',[f.userId])).rows[0].title,'Legado preservado');
});

test('associated accounts block old partial writes without modifying existing rows; independent accounts are unaffected',async()=>{
 const f=await setup();await userQuery(db,f.userId,'insert into public.profiles(id,display_name) values($1,$2)',[f.userId,'Nome anterior']);await f.commit();
 await assert.rejects(userQuery(db,f.userId,'insert into public.drafts(user_id,title) values($1,$2)',[f.userId,'Sync antigo']),/progress_legacy_write_blocked/);
 await assert.rejects(userQuery(db,f.userId,'update public.profiles set display_name=$2 where id=$1',[f.userId,'Substituição antiga']),/progress_legacy_write_blocked/);
 assert.equal((await userQuery(db,f.userId,'select display_name from public.profiles where id=$1',[f.userId])).rows[0].display_name,'Nome anterior');
 const other=await setup();await userQuery(db,other.userId,'insert into public.drafts(user_id,title) values($1,$2)',[other.userId,'Permitido']);assert.equal((await other.read()).kind,'legacy');
});

test('migration exposes only invoker wrappers and owner-bound private entrypoints, with no client table grants',async()=>{
 const rows=(await db.query("select n.nspname,p.proname,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname like 'progress_account_%' or n.nspname='progress_private'")).rows;
 assert.ok(rows.filter(r=>r.nspname==='public').every(r=>r.prosecdef===false));assert.ok(rows.filter(r=>r.prosecdef).every(r=>r.nspname==='progress_private'&&r.proconfig.some(c=>c.startsWith('search_path='))));
 const rights=(await db.query("select has_table_privilege('authenticated','progress_private.account_state','INSERT') as writes,has_function_privilege('anon','public.progress_account_read(uuid)','EXECUTE') as anonymous")).rows[0];assert.equal(rights.writes,false);assert.equal(rights.anonymous,false);
});

test('production migration keeps the server write release closed and authenticated callers cannot open it',async()=>{
 await db.exec('update progress_private.release_gate set writes_enabled=false where singleton');
 try{
  const f=await setup();await assert.rejects(f.commit(),/progress_release_closed/);assert.equal((await f.read()).kind,'empty');
  await assert.rejects(userQuery(db,f.userId,'update progress_private.release_gate set writes_enabled=true'),/permission denied/);
 }finally{await db.exec('update progress_private.release_gate set writes_enabled=true where singleton');}
});

test('full archives keep inactive profiles, daily counters, receipts and character IDs without recalculation',async()=>{
 const f=await setup(),s=()=>f.f.core.getState(),a=s().createAccount('Conta A',false);s().addExperience(17,'ar');
 const h=s().addHabit({name:'Prática',elementId:'agua',plannedPoints:2,plannedTimeMinutes:5});s().configureHabitDailyTracking(h.id,{unit:'vez',target:3,step:0.5});s().recordHabitQuantity(h.id,new Date(2026,9,29,12));s().completeHabit(h.id,5,new Date(2026,9,29,12));
 const b=s().createAccount('Conta B',false);s().addDraft('Somente B','');s().switchAccount(a.id);
 const snapshot=f.f.captureProgress('http://fixture.test'),archive=await f.f.createProgressBackup(snapshot);await f.commit({text:archive});const current=await f.read();assert.equal(current.archive,archive);
 const {backup}=await f.f.inspectProgressBackup(current.archive);assert.equal(backup.stores.core.state.user.id,snapshot.stores.core.state.user.id);assert.equal(backup.stores.core.state.accountDataById[b.id].drafts[0].title,'Somente B');assert.equal(backup.stores.core.state.habits[0].dailyEntries[0].quantity,0.5);assert.deepEqual(backup.stores.core.state.habits[0].completions,JSON.parse(JSON.stringify(snapshot.stores.core.state.habits[0].completions)));
});

test('competing CAS intents accept one revision only (PGlite serial connection, not a multi-session lock proof)',async()=>{
 const f=await setup(),results=await Promise.allSettled([f.commit(),f.commit()]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(results.filter(r=>r.status==='rejected').length,1);
 const count=(await db.query('select count(*)::int as n from progress_private.account_receipts where user_id=$1',[f.userId])).rows[0].n;assert.equal(count,1);
});
