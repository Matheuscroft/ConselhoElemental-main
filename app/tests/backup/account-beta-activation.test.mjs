import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {createAccountDatabase,userQuery} from './load-account-db.mjs';
const activation=readFileSync('supabase/review-candidates/activate_account_beta_140.sql','utf8');
test('reviewed beta activation changes only the owner-controlled release; anonymous and authenticated clients cannot toggle it',async()=>{
 const db=await createAccountDatabase({release:false,producerVersion:140});try{
  const before=(await db.query("select n.nspname,p.proname,p.prosrc,p.proacl::text,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='progress_private' or p.proname like 'progress_account_%' order by n.nspname,p.proname")).rows;
  await db.exec(activation);assert.equal((await db.query('select writes_enabled from progress_private.release_gate')).rows[0].writes_enabled,true);
  assert.deepEqual((await db.query("select n.nspname,p.proname,p.prosrc,p.proacl::text,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='progress_private' or p.proname like 'progress_account_%' order by n.nspname,p.proname")).rows,before);
  for(const role of ['authenticated','anon'])await assert.rejects(userQuery(db,null,'update progress_private.release_gate set writes_enabled=false',[],role));
  assert.equal((await db.query('select count(*) as n from progress_private.account_state')).rows[0].n,0);
 }finally{await db.close();}
});
test('changed validator, direct grants, missing RLS or disabled legacy trigger refuse activation atomically',async()=>{
 for(const change of ["create or replace function progress_private.validate_archive(raw text) returns text language sql immutable as $$select raw$$",'grant select on progress_private.account_state to authenticated','alter table progress_private.account_state disable row level security','alter table public.tasks disable trigger progress_account_write_guard']){
  const db=await createAccountDatabase({release:false,producerVersion:140});try{await db.exec(change);await assert.rejects(db.exec(activation),/progress_beta_/);await db.exec('rollback');assert.equal((await db.query('select writes_enabled from progress_private.release_gate')).rows[0].writes_enabled,false);}finally{await db.close();}
 }
});
