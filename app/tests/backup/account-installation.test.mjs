import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createLegacyDatabase,migration145 as migration,userQuery} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';

// These are the relevant column differences observed in hosted catalog metadata
// on 2026-10-30. This fixture contains no hosted rows, credentials or Auth sessions.
async function hostedShape(db){
 await db.exec(`alter table public.drafts add column notes text;
 alter table public.cycle_sequences drop column is_active;
 alter table public.sequence_memberships rename column sequence_local_id to sequence_id;
 alter table public.sequence_memberships rename column habit_local_id to habit_id;
 alter table public.sequence_memberships alter column sequence_id set not null;
 alter table public.sequence_memberships alter column habit_id set not null;
 alter table public.sequence_memberships drop column position;`);
}
async function legacyState(db){
 return (await db.query(`select jsonb_build_object(
 'columns',(select jsonb_agg(jsonb_build_array(table_name,column_name,data_type,is_nullable,column_default) order by table_name,ordinal_position) from information_schema.columns where table_schema='public'),
 'policies',(select jsonb_agg(jsonb_build_array(tablename,policyname,roles,cmd,qual,with_check) order by tablename,policyname) from pg_policies where schemaname='public'),
 'triggers',(select jsonb_agg(jsonb_build_array(c.relname,t.tgname,pg_get_triggerdef(t.oid)) order by c.relname,t.tgname) from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal and t.tgname<>'progress_account_write_guard')
 ) as value`)).rows[0].value;
}

test('hosted column variant installs closed, preserves legacy rows/schema/policies/triggers, and permits integral opt-in only after release',async()=>{
 const db=await createLegacyDatabase();
 try{
  await hostedShape(db);
  const legacy=randomUUID(),fresh=randomUUID();
  await db.query('insert into auth.users(id) values($1),($2)',[legacy,fresh]);
  await userQuery(db,legacy,'insert into public.drafts(user_id,title,notes,payload) values($1,$2,$3,$4)',[legacy,'Synthetic legacy idea','Untouched notes',{kept:true}]);
  await userQuery(db,legacy,'insert into public.sequence_memberships(user_id,sequence_id,habit_id,payload) values($1,$2,$3,$4)',[legacy,'sequence-fixture','habit-fixture',{kept:true}]);
  const before=await legacyState(db);
  const rows=(await db.query('select to_jsonb(d) as value from public.drafts d')).rows;
  const membership=(await db.query('select to_jsonb(m) as value from public.sequence_memberships m')).rows;
  await db.exec(migration);
  assert.deepEqual(await legacyState(db),before);
  assert.deepEqual((await db.query('select to_jsonb(d) as value from public.drafts d')).rows,rows);
  assert.deepEqual((await db.query('select to_jsonb(m) as value from public.sequence_memberships m')).rows,membership);
  assert.equal((await db.query('select writes_enabled from progress_private.release_gate')).rows[0].writes_enabled,false);
  assert.equal((await db.query("select count(*)::int as n from pg_trigger where tgname='progress_account_write_guard'")).rows[0].n,10);
  assert.equal((await userQuery(db,legacy,'select public.progress_account_read($1) as value',[legacy])).rows[0].value.kind,'legacy');
  const f=fixture(),archive=await f.createProgressBackup(f.captureProgress('http://fixture.test'));
  const commit=()=>userQuery(db,fresh,'select public.progress_account_commit($1,$2,$3,$4,$5) as value',[fresh,'empty',randomUUID(),archive,true]);
  await assert.rejects(commit(),/progress_release_closed/);
  await db.exec('update progress_private.release_gate set writes_enabled=true where singleton'); // synthetic database owner only
  await commit();
  assert.equal((await userQuery(db,fresh,'select public.progress_account_read($1) as value',[fresh])).rows[0].value.archive,archive);
  await userQuery(db,legacy,'update public.drafts set notes=$2 where user_id=$1',[legacy,'Still writable for the legacy owner']);
 }finally{await db.close();}
});

test('incompatible owner dependencies or disabled legacy RLS abort before creating integral objects',async()=>{
 const db=await createLegacyDatabase();
 try{
  for(const [change,restore] of [
   ['alter table public.tasks rename to hidden_tasks','alter table public.hidden_tasks rename to tasks'],
   ['alter table public.tasks rename column user_id to incompatible_owner','alter table public.tasks rename column incompatible_owner to user_id'],
   ['alter table public.tasks alter column user_id drop not null','alter table public.tasks alter column user_id set not null'],
   ['alter table public.tasks disable row level security','alter table public.tasks enable row level security'],
  ]){
   await db.exec(change);
   const before=await legacyState(db);
   await assert.rejects(db.exec(migration),/progress_installation_incompatible: tasks/);
   await db.exec('rollback');
   assert.equal((await db.query("select to_regnamespace('progress_private') as value")).rows[0].value,null);
   assert.deepEqual(await legacyState(db),before);
   await db.exec(restore);
  }
 }finally{await db.close();}
});

test('reinstallation is refused without resetting release, revision or receipts already present',async()=>{
 const db=await createLegacyDatabase();
 try{
  await db.exec(migration);
  await db.exec('update progress_private.release_gate set writes_enabled=true where singleton');
  const user=randomUUID(),revision=randomUUID(),operation=randomUUID();
  await db.query('insert into auth.users(id) values($1)',[user]);
  await db.query("insert into progress_private.account_state(user_id,revision,archive,archive_sha256) values($1,$2,$3,$4)",[user,revision,'synthetic sentinel','a'.repeat(64)]);
  await db.query("insert into progress_private.account_receipts(user_id,operation_id,expected_revision,committed_revision,archive_sha256) values($1,$2,'empty',$3,$4)",[user,operation,revision,'a'.repeat(64)]);
  const before=(await db.query('select to_jsonb(a) as value from progress_private.account_state a')).rows;
  await assert.rejects(db.exec(migration),/progress_installation_exists/);
  await db.exec('rollback');
  assert.deepEqual((await db.query('select to_jsonb(a) as value from progress_private.account_state a')).rows,before);
  assert.equal((await db.query('select writes_enabled from progress_private.release_gate')).rows[0].writes_enabled,true);
  assert.equal((await db.query('select operation_id from progress_private.account_receipts')).rows[0].operation_id,operation);
 }finally{await db.close();}
});

test('missing Auth dependency or conflicting public RPC overload prevents an ambiguous installation',async()=>{
 const db=await createLegacyDatabase();
 try{
  await db.exec('alter function auth.uid() rename to temporarily_missing_uid');
  await assert.rejects(db.exec(migration),/progress_installation_dependencies/);
  await db.exec('rollback');
  assert.equal((await db.query("select to_regnamespace('progress_private') as value")).rows[0].value,null);
  await db.exec('alter function auth.temporarily_missing_uid() rename to uid');
  await db.exec("create function public.progress_account_read(text) returns text language sql as $$select 'existing fixture RPC'::text$$");
  await assert.rejects(db.exec(migration),/progress_installation_exists/);
  await db.exec('rollback');
  assert.equal((await db.query("select to_regnamespace('progress_private') as value")).rows[0].value,null);
  assert.equal((await db.query("select public.progress_account_read('synthetic') as value")).rows[0].value,'existing fixture RPC');
 }finally{await db.close();}
});
