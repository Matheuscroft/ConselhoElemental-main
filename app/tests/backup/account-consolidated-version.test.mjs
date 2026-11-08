import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createLegacyDatabase,installedMigration,archiveVersionMigration,accessVersionMigration,newJourneyVersionMigration} from './load-account-db.mjs';
import {fixture} from './load-progress.mjs';

const catalog=`select n.nspname,p.proname,p.prosecdef,p.proconfig,p.proacl::text,p.proowner,
 encode(sha256(convert_to(p.prosrc,'UTF8')),'hex') as body_sha256 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='progress_private' or (n.nspname='public' and p.proname like 'progress_account_%') order by n.nspname,p.proname`;
const oldHash='a1673918e5294ced9b1f5e17f2cac08e0bddf681f3a6ba8fed2cc9bf565216cb';
const newHash='16bbb83d98310d34e9713aebfb0ba0ef6fe4c1706fdeab59ee89d111b66150d3';
async function setup(){const db=await createLegacyDatabase();await db.exec(installedMigration);await db.exec(archiveVersionMigration);await db.exec(accessVersionMigration);return db;}
async function hash(db){return (await db.query("select encode(sha256(convert_to(prosrc,'UTF8')),'hex') as value from pg_proc where oid='progress_private.validate_archive(text)'::regprocedure")).rows[0].value;}

test('consolidated 122-to-135 patch changes only validator body and retains bytes, permissions and closed gate',async()=>{
 const db=await setup();try{
  assert.equal(await hash(db),oldHash);const before=(await db.query(catalog)).rows;
  const f=fixture(),current={...f.captureProgress('https://fixture.test'),appVersion:'0.1.135'},legacy=await f.createProgressBackup({...current,appVersion:'0.1.120'}),target=await f.createProgressBackup(current),owner=randomUUID();
  await db.query('insert into auth.users(id) values($1)',[owner]);
  await db.query('insert into progress_private.account_state(user_id,revision,archive,archive_sha256) values($1,$2,$3,$4)',[owner,randomUUID(),legacy,createHash('sha256').update(legacy).digest('hex')]);
  await assert.rejects(db.query('select progress_private.validate_archive($1)',[target]),/progress_invalid_archive/);
  await db.exec(newJourneyVersionMigration);assert.equal(await hash(db),newHash);
  const after=(await db.query(catalog)).rows;assert.equal(after.length,before.length);
  for(let i=0;i<before.length;i++)assert.deepEqual(after[i],before[i].proname==='validate_archive'?{...before[i],body_sha256:newHash}:before[i]);
  for(const archive of [legacy,target])assert.equal((await db.query('select progress_private.validate_archive($1) as value',[archive])).rows[0].value,createHash('sha256').update(archive).digest('hex'));
  assert.equal((await db.query('select archive from progress_private.account_state where user_id=$1',[owner])).rows[0].archive,legacy);
  assert.deepEqual((await db.query('select writes_enabled from progress_private.release_gate')).rows,[{writes_enabled:false}]);
  const future=await f.createProgressBackup({...current,appVersion:'0.1.136'});await assert.rejects(db.query('select progress_private.validate_archive($1)',[future]),/progress_invalid_archive/);
 }finally{await db.close();}
});

test('open gate or changed grants/security cannot pass the reviewed patch',async()=>{
 for(const [change,error] of [
  ['update progress_private.release_gate set writes_enabled=true',/release_must_remain_closed/],
  ['grant select on progress_private.account_state to authenticated',/private_access_changed/],
  ['alter table progress_private.account_state disable row level security',/private_access_changed/],
  ['alter function progress_private.read_account(uuid) security invoker',/protocol_revision_changed/],
  ['alter function progress_private.validate_archive(text) security definer',/validator_revision_changed/],
  ['drop trigger progress_account_write_guard on public.tasks',/legacy_guards_changed/],
 ]){
  const db=await setup();try{await db.exec(change);const before=(await db.query(catalog)).rows;await assert.rejects(db.exec(newJourneyVersionMigration),error);await db.exec('rollback');assert.deepEqual((await db.query(catalog)).rows,before);assert.equal(await hash(db),oldHash);}finally{await db.close();}
 }
});

test('protocol source drift is rejected even with unchanged routine signature and privileges',async()=>{
 const db=await setup();try{
  const def=(await db.query("select pg_get_functiondef('progress_private.read_account(uuid)'::regprocedure) as value")).rows[0].value;
  assert.match(def,/\$function\$/);await db.exec(def.replace(/\$function\$\s*;?\s*$/,'\n-- synthetic protocol drift\n$function$;'));
  await assert.rejects(db.exec(newJourneyVersionMigration),/protocol_revision_changed/);await db.exec('rollback');assert.equal(await hash(db),oldHash);
 }finally{await db.close();}
});

test('a rollback of the local rehearsal restores the exact previous validator and gate',async()=>{
 const db=await setup();try{
  const body=newJourneyVersionMigration.replace(/^([\s\S]*?)\bbegin;/,'$1').replace(/commit;\s*$/,'');
  await db.exec('begin;'+body);assert.equal(await hash(db),newHash);await db.exec('rollback');assert.equal(await hash(db),oldHash);
  assert.deepEqual((await db.query('select writes_enabled from progress_private.release_gate')).rows,[{writes_enabled:false}]);
 }finally{await db.close();}
});
