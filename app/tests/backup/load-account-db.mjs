import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
export const installedMigration=readFileSync('supabase/migrations/20261030202517_progress_account_atomic.sql','utf8');
export const archiveVersionMigration=readFileSync('supabase/migrations/20261030204257_account_archive_version_121.sql','utf8');
export const accessVersionMigration=readFileSync('supabase/migrations/20261030211424_account_archive_version_122.sql','utf8');
export const mergeVersionMigration=readFileSync('supabase/migrations/20261106022901_account_archive_version_123.sql','utf8');
export const fitnessIdentityVersionMigration=readFileSync('supabase/migrations/20261106031901_account_archive_version_124.sql','utf8');
export const intuitiveIconsVersionMigration=readFileSync('supabase/migrations/20261106033034_account_archive_version_125.sql','utf8');
export const catalogueVersionMigration=readFileSync('supabase/migrations/20261106033906_account_archive_version_126.sql','utf8');
export const handoffVersionMigration=readFileSync('supabase/migrations/20261106034829_account_archive_version_127.sql','utf8');
// Integration fixtures exercise the complete LOCAL candidate, not hosted state.
export const migration=installedMigration+'\n'+archiveVersionMigration+'\n'+accessVersionMigration+'\n'+mergeVersionMigration+'\n'+fitnessIdentityVersionMigration+'\n'+intuitiveIconsVersionMigration+'\n'+catalogueVersionMigration+'\n'+handoffVersionMigration;
export async function createLegacyDatabase(){
 const db=new PGlite();
 // Isolated in-memory PostgreSQL. No network, server connection, env or real Auth.
 await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema public,auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;`);
 // gen_random_uuid is built-in; the original optional pgcrypto extension is not
 // needed by these tests or the additive migration. Other original SQL is real.
 await db.exec(readFileSync('supabase/migrations/20260319_init_auth_and_user_data.sql','utf8').replace('create extension if not exists pgcrypto;',''));
 await db.exec(`grant select,insert,update,delete on all tables in schema public to authenticated;`);
 return db;
}
export async function createAccountDatabase({release=true}={}){
 const db=await createLegacyDatabase();
 try{
  await db.exec(migration);
  if(release)await db.exec('update progress_private.release_gate set writes_enabled=true where singleton'); // test-only postgres owner
  return db;
 }catch(error){await db.close();throw error;}
}
export async function userQuery(db,userId,sql,args=[],role='authenticated'){
 return db.transaction(async tx=>{
  // Role is a test-controlled enum; user values always use bound parameters.
  if(!['authenticated','anon'].includes(role))throw Error('Invalid test role');
  await tx.exec('set local role '+role);
  await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[userId??'']);
  return tx.query(sql,args);
 });
}
