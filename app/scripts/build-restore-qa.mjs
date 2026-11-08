#!/usr/bin/env node
/** Separate synthetic site only. Never changes a product gate or reads a personal profile/.env. */
import {build} from 'esbuild';
import {mkdtemp,writeFile,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
if(process.argv.includes('--help')){console.log('node scripts/build-restore-qa.mjs — builds an isolated synthetic restore site in a temporary directory.');process.exit(0);}
const root=process.cwd(),{fixture}=await import('../tests/backup/load-progress.mjs');
const f=fixture();const account=f.core.getState().createAccount('Ensaio descartável',false);f.fitness.setState({currentAccountId:account.id});
f.core.getState().addDraft('Ideia anterior de QA','Dado sintético');
const entries=[...f.memory].filter(([key])=>Object.values(f.STORE_KEYS).includes(key));
f.core.getState().addDraft('Ideia importada de QA','Dado sintético');
const target=await f.createProgressBackup(f.captureProgress('https://fixture.test'));
const output=await mkdtemp(join(tmpdir(),'conselho-restore-qa-'));
const result=await build({entryPoints:['tests/fixtures/restore-qa.tsx'],bundle:true,jsx:'automatic',platform:'browser',format:'esm',outdir:output,metafile:true,alias:{'@':root+'/src'},logLevel:'silent',plugins:[{name:'qa-only',setup(b){
 b.onResolve({filter:/^qa-seed$/},()=>({path:'seed',namespace:'qa-seed'}));
 b.onLoad({filter:/.*/,namespace:'qa-seed'},()=>({contents:'export default '+JSON.stringify({entries,target}),loader:'js'}));
 b.onResolve({filter:/restore-release$/},()=>({path:'release',namespace:'qa-release'}));
 b.onLoad({filter:/.*/,namespace:'qa-release'},()=>({contents:'export const RESTORE_WRITES_RELEASED=true;',loader:'js'}));
 b.onResolve({filter:/^qa-real-preview$/},()=>({path:resolve(root,'src/lib/backup/workspace-preview.ts')}));
 b.onResolve({filter:/workspace-preview$/},()=>({path:'guard',namespace:'qa-guard'}));
 b.onLoad({filter:/.*/,namespace:'qa-guard'},()=>({contents:`export * from 'qa-real-preview';import {prepareWorkspacePreview as real} from 'qa-real-preview';import seed from 'qa-seed';export function prepareWorkspacePreview(text,...args){if(text!==seed.target)throw Error('Neste ensaio, escolha somente fixture-progresso.json. Não use seu arquivo pessoal.');return real(text,...args);}`,loader:'js'}));
}}]});
const inputs=Object.keys(result.metafile.inputs);
if(inputs.some(p=>/src\/stores\/|src\/lib\/supabase|src\/bootstrap-app|src\/services\/(?!leveling-calculator\.ts$)/.test(p)))throw Error('QA isolation failed');
const gate=await readFile('src/lib/backup/restore-release.ts','utf8');if(!/RESTORE_WRITES_RELEASED = (true|false);/.test(gate))throw Error('Unexpected product gate');const productGate=gate.includes('RESTORE_WRITES_RELEASED = true');
await writeFile(join(output,'fixture-progresso.json'),target);
await writeFile(join(output,'index.html'),'<!doctype html><html lang="pt-BR"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ensaio de transferência</title><link rel="stylesheet" href="/restore-qa.css"><style>body{margin:0;background:#0c111a;color:#eceae3;font:16px system-ui}*{box-sizing:border-box}a{color:#d9b968}button{min-height:44px}</style><div id="root"></div><script type="module" src="/restore-qa.js"></script></html>');
await writeFile(join(output,'vercel.json'),JSON.stringify({version:2,rewrites:[{source:'/:path*',destination:'/index.html'}],buildCommand:null,outputDirectory:'.',framework:null}));
await writeFile(join(output,'qa-build.json'),JSON.stringify({synthetic:true,personalImportsRejected:true,productGate,inputs},null,2));
console.log(JSON.stringify({output,synthetic:true,personalImportsRejected:true,productGate}));
