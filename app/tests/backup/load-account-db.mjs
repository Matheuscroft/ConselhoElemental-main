import {PGlite} from '@electric-sql/pglite';
import {readFileSync} from 'node:fs';
export const installedMigration=readFileSync('supabase/migrations/20261030202517_progress_account_atomic.sql','utf8');
export const archiveVersionMigration=readFileSync('supabase/migrations/20261030204257_account_archive_version_121.sql','utf8');
export const accessVersionMigration=readFileSync('supabase/migrations/20261030211424_account_archive_version_122.sql','utf8');
export const mergeVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106022901_account_archive_version_123.sql','utf8');
export const fitnessIdentityVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106031901_account_archive_version_124.sql','utf8');
export const intuitiveIconsVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106033034_account_archive_version_125.sql','utf8');
export const catalogueVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106033906_account_archive_version_126.sql','utf8');
export const handoffVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106034829_account_archive_version_127.sql','utf8');
export const auxiliaryUiVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106041510_account_archive_version_128.sql','utf8');
export const colouredRewardsVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106172724_account_archive_version_129.sql','utf8');
export const savedLibraryVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106180121_account_archive_version_130.sql','utf8');
export const localRestoreVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106190306_account_archive_version_131.sql','utf8');
export const guidedTransferVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106191318_account_archive_version_132.sql','utf8');
export const appIconVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261106192643_account_archive_version_133.sql','utf8');
export const mobileImportVersionMigration=readFileSync('supabase/review-candidates/producer-versions/20261107024439_account_archive_version_134.sql','utf8');
export const newJourneyVersionMigration=readFileSync('supabase/migrations/20261107042615_account_archive_version_135.sql','utf8');
export const authOnlyVersionMigration=readFileSync('supabase/migrations/20261107045407_account_archive_version_136.sql','utf8');
export const restoreHelpVersionMigration=readFileSync('supabase/migrations/20261107180106_account_archive_version_137.sql','utf8');
export const simpleImportVersionMigration=readFileSync('supabase/migrations/20261107181632_account_archive_version_138.sql','utf8');
export const quotaVersionMigration=readFileSync('supabase/migrations/20261107183833_account_archive_version_139.sql','utf8');
export const connectionVersionMigration=readFileSync('supabase/migrations/20261107192045_account_archive_version_140.sql','utf8');
export const scorePanelVersionMigration=readFileSync('supabase/migrations/20261107213207_account_archive_version_141.sql','utf8');
export const mobileTimerVersionMigration=readFileSync('supabase/migrations/20261107215418_account_archive_version_142.sql','utf8');
export const refinedTimerVersionMigration=readFileSync('supabase/migrations/20261108003620_account_archive_version_143.sql','utf8');
export const accessOnboardingVersionMigration=readFileSync('supabase/migrations/20261108014325_access_onboarding_version_144.sql','utf8');
export const accountArchiveVersion145Migration=readFileSync('supabase/migrations/20261108060000_account_archive_version_145.sql','utf8');
// Integration fixtures exercise the complete LOCAL candidate, not hosted state.
const migration140=installedMigration+'\n'+archiveVersionMigration+'\n'+accessVersionMigration+'\n'+newJourneyVersionMigration+'\n'+authOnlyVersionMigration+'\n'+restoreHelpVersionMigration+'\n'+simpleImportVersionMigration+'\n'+quotaVersionMigration+'\n'+connectionVersionMigration;
const migration141=migration140+'\n'+scorePanelVersionMigration;
const migration142=migration141+'\n'+mobileTimerVersionMigration;
const migration143=migration142+'\n'+refinedTimerVersionMigration;
export const migration=migration143+'\n'+accessOnboardingVersionMigration;
export const migration145=migration+'\n'+accountArchiveVersion145Migration;
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
export async function createAccountDatabase({release=true,producerVersion=144}={}){
 const db=await createLegacyDatabase();
 try{
  await db.exec(producerVersion>=145?migration145:producerVersion>=144?migration:producerVersion>=143?migration143:producerVersion>=142?migration142:producerVersion>=141?migration141:migration140);
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
