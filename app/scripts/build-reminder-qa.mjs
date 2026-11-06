#!/usr/bin/env node
/** Build only. Never starts a server/browser, reads .env or edits production gates. */
import { build } from 'esbuild';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
if (process.argv.includes('--help')) {
 console.log('node scripts/build-reminder-qa.mjs\nCompila fixture sintética em diretório temporário; não abre servidor/navegador. Não é aceite visual.');process.exit(0);
}
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
const {fixture}=await import('../tests/backup/load-progress.mjs');
const f=fixture(),account=f.core.getState().createAccount('QA descartável',false);
const source=f.core.getState().addTask({title:'Ritual QA',dueDate:'2026-10-30'});
f.fitness.setState({currentAccountId:account.id});
const seed={entries:[...f.memory].filter(([key])=>[f.STORE_KEYS.core,f.STORE_KEYS.fitness].includes(key)),identity:{sourceType:'task',sourceId:source.id,day:'2026-10-30'}};
const output=await mkdtemp(join(tmpdir(),'conselho-reminder-qa-'));
const result=await build({entryPoints:['tests/fixtures/reminder-qa.tsx'],absWorkingDir:root,bundle:true,jsx:'automatic',platform:'browser',format:'esm',outdir:output,metafile:true,alias:{'@':root+'/src'},logLevel:'silent',plugins:[{name:'disposable-qa-only',setup(b){
 b.onResolve({filter:/^qa-seed$/},()=>({path:'seed',namespace:'qa'}));
 b.onLoad({filter:/.*/,namespace:'qa'},()=>({contents:'export default '+JSON.stringify(seed),loader:'js'}));
 b.onResolve({filter:/reminder-release$/},()=>({path:'release',namespace:'qa-release'}));
 b.onLoad({filter:/.*/,namespace:'qa-release'},()=>({contents:'export const REMINDER_WRITES_RELEASED=true;',loader:'js'}));
 // Use fixture projections; the real adapter/store/Auth graph must never enter this bundle.
 b.onResolve({filter:/activity-reminder-adapter$/},()=>({path:resolve(root,'tests/fixtures/reminder-qa.tsx')}));
}}]});
const inputs=Object.keys(result.metafile.inputs);
if(!inputs.some(p=>p.endsWith('react/jsx-runtime.js')))throw Error('QA JSX runtime missing');
if(inputs.some(p=>/src\/stores\/|src\/services\/(?!leveling-calculator\.ts$)|src\/lib\/supabase\.ts|src\/bootstrap-app/.test(p)))throw Error('QA isolation failed: '+inputs.filter(p=>/src\/stores\/|src\/services\/(?!leveling-calculator\.ts$)|src\/lib\/supabase\.ts|src\/bootstrap-app/.test(p)).join(', '));
await writeFile(join(output,'index.html'),'<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>QA descartável</title><link rel="stylesheet" href="/reminder-qa.css"><style>body{margin:0;background:#0c111a;color:#eceae3;font:16px system-ui}*{box-sizing:border-box}</style><div id="root"></div><script type="module" src="/reminder-qa.js"></script></html>');
const gate=await readFile(join(root,'src/lib/reminders/reminder-release.ts'),'utf8');
if(!gate.includes('REMINDER_WRITES_RELEASED = false'))throw Error('Production gate unexpectedly changed');
await writeFile(join(output,'qa-build.json'),JSON.stringify({synthetic:true,serverStarted:false,browserValidated:false,productionGate:false,excludedStoresAndAuth:true,inputs},null,2));
console.log(JSON.stringify({output,synthetic:true,serverStarted:false,browserValidated:false,productionGate:false},null,2));
