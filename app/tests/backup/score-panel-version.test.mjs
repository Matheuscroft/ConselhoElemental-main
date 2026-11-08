import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createAccountDatabase,scorePanelVersionMigration as migration} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
const catalogue=`select n.nspname,p.proname,p.prosrc,p.proacl::text,p.prosecdef,p.proconfig,p.proowner,p.provolatile from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='progress_private' or p.proname like 'progress_account_%' order by n.nspname,p.proname`;

test('additive producer141 compatibility keeps active/closed gate, stored bytes and every protocol/grant unchanged',async()=>{
 for(const release of [false,true]){
  const db=await createAccountDatabase({release,producerVersion:140});
  try{
   const f=fixture(),snapshot=f.captureProgress('http://fixture.test'),previous=await f.createProgressBackup({...snapshot,appVersion:'0.1.140'}),next=await f.createProgressBackup({...snapshot,appVersion:'0.1.141'}),future=await f.createProgressBackup({...snapshot,appVersion:'0.1.142'}),uid=randomUUID();
   await db.query('insert into auth.users(id)values($1)',[uid]);
   await db.query('insert into progress_private.account_state(user_id,revision,archive,archive_sha256)values($1,$2,$3,$4)',[uid,randomUUID(),previous,hash(previous)]);
   const records=(await db.query('select * from progress_private.account_state')).rows,gate=(await db.query('select * from progress_private.release_gate')).rows,before=(await db.query(catalogue)).rows;
   await assert.rejects(db.query('select progress_private.validate_archive($1)',[next]),/progress_invalid_archive/);
   await db.exec(migration);
   for(const raw of [previous,next])assert.equal((await db.query('select progress_private.validate_archive($1)as value',[raw])).rows[0].value,hash(raw));
   await assert.rejects(db.query('select progress_private.validate_archive($1)',[future]),/progress_invalid_archive/);
   assert.deepEqual((await db.query('select * from progress_private.account_state')).rows,records);
   assert.deepEqual((await db.query('select * from progress_private.release_gate')).rows,gate);
   assert.equal((await db.query('select count(*)as n from progress_private.account_receipts')).rows[0].n,0);
   const after=(await db.query(catalogue)).rows;
   for(const row of after)if(row.proname==='validate_archive')row.prosrc=row.prosrc.replace('|139|140|141)$','|139|140)$');
   assert.deepEqual(after,before);
  }finally{await db.close();}
 }
});

test('producer141 refuses an unreviewed validator without changing the gate',async()=>{
 const db=await createAccountDatabase({release:true,producerVersion:140});try{
  await db.exec("create or replace function progress_private.validate_archive(raw text)returns text language sql immutable as $$select raw$$");
  await assert.rejects(db.exec(migration),/progress_validator_revision_changed/);await db.exec('rollback');
  assert.equal((await db.query('select writes_enabled from progress_private.release_gate')).rows[0].writes_enabled,true);
 }finally{await db.close();}
});
