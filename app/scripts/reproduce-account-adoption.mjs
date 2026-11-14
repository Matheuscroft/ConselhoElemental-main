import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { readLegacySnapshot } from './compare-account-legacy.mjs';
import { createAccountDatabase, userQuery } from '../tests/backup/load-account-db.mjs';

if (process.argv.length !== 4) throw new Error('Usage: node reproduce-account-adoption.mjs LOCAL_ARCHIVE REMOTE_SNAPSHOT');
const archive=readFileSync(process.argv[2],'utf8'),legacy=readLegacySnapshot(process.argv[3]);
const owner=legacy.profiles?.[0]?.id ?? legacy.tasks?.[0]?.user_id;
if (typeof owner !== 'string' || !/^[a-f0-9-]{36}$/i.test(owner)) throw new Error('Cannot identify a single owner in the export.');
const tables=['profiles','custom_areas','custom_subareas','tasks','habits','projects','quests','drafts','cycle_sequences','sequence_memberships'];
for (const table of tables) {
  if (!Array.isArray(legacy[table])) throw new Error(`The export is missing ${table}.`);
  if (legacy[table].some(row => (table==='profiles' ? row.id : row.user_id) !== owner)) throw new Error('The export contains another owner.');
}
const db=await createAccountDatabase({producerVersion:145});
try {
  const compactHash=(await db.query("select encode(sha256(convert_to(prosrc,'UTF8')),'hex') as hash from pg_proc where oid='progress_private.compact_json(json,integer)'::regprocedure")).rows[0].hash;
  await db.query('insert into auth.users(id) values($1)',[owner]);
  for (const table of tables) {
    const available=await db.query('select column_name from information_schema.columns where table_schema=$1 and table_name=$2',['public',table]);
    const columns=new Set(available.rows.map(item=>item.column_name));
    for (const row of legacy[table]) {
    const keys=Object.keys(row).filter(key=>columns.has(key));
    if (!keys.length || keys.some(key=>!/^[a-z_]+$/.test(key))) throw new Error('The export contains an unsafe column.');
    const params=keys.map(key=>record(row[key]) || Array.isArray(row[key]) ? JSON.stringify(row[key]) : row[key]);
    const slots=keys.map((_,index)=>`$${index+1}`).join(',');
    await db.query(`insert into public.${table}(${keys.join(',')}) values(${slots})`,params);
    }
  }
  const operationId=randomUUID();
  const started=performance.now();
  const result=await userQuery(db,owner,'select public.progress_account_adopt_legacy($1,$2,$3,$4,$5,$6) as value',[owner,'legacy',operationId,archive,true,true]);
  const adoptionMs=Math.round(performance.now()-started);
  const stored=await db.query('select count(*)::int as n from progress_private.account_state where user_id=$1',[owner]);
  const preserved=await db.query('select count(*)::int as n from progress_private.legacy_adoptions where user_id=$1',[owner]);
  console.log(JSON.stringify({result:'accepted',receipt:!!result.rows[0]?.value,accountState:stored.rows[0].n,legacySnapshot:preserved.rows[0].n,adoptionMs,compactHash}));
} catch (error) {
  const message=String(error?.message ?? '');
  console.log(JSON.stringify({result:'rejected',code:/^[A-Z0-9]{5}$/.test(error?.code??'')?error.code:null,message:/^progress_[a-z_]+$/.test(message)?message:'internal_sql_error'}));
} finally { await db.close(); }

function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
