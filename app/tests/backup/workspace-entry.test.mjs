import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync('src/main.tsx','utf8').replaceAll('import.meta.env.VITE_SUPABASE_URL',"'https://synthetic.supabase.invalid'"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const entrySource=ts.transpileModule(readFileSync('src/lib/reminders/reminder-entry.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const entryModule={exports:{}};new Function('require','exports',entrySource)(()=>({REMINDER_HANDOFF_KEY:'conselho-elemental-reminder-handoff-v1'}),entryModule.exports);
const recoveryModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-recovery-entry.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(recoveryModule.exports);
const returnModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-return.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(returnModule.exports);
const accessEntryModule={exports:{}};new Function('require','exports',ts.transpileModule(readFileSync('src/lib/backup/access-entry.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(()=>({STORE_KEYS:{core:'conselho-elemental-storage',fitness:'dominio-do-mago-workout-storage-v1'}}),accessEntryModule.exports);
const accessStorageModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-access-storage.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(accessStorageModule.exports);
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function run(search,block,fail=false,handoff=false,sessionRaw=null,sessionDenied=false,historyDenied=false,resumeRaw=null,pathname=undefined,saved=null,origin='https://fixture.test'){
 const calls=[];const root={};
 new Function('require','document','window','navigator','exports',source)(id=>{
  if(id.endsWith('.css'))return {};
  if(id.endsWith('access-entry'))return accessEntryModule.exports;
  if(id.endsWith('mount-entry-welcome')){if(fail)throw Error('chunk unavailable');return {mountEntryWelcome:node=>{assert.equal(node,root);calls.push('welcome');}};}
  if(id.endsWith('account-access-storage'))return accessStorageModule.exports;
  if(id.endsWith('account-resume-entry'))return {ACCOUNT_TAB_ACCESS_KEY:'access'};
  if(id.endsWith('account-tab-access'))return {inspectTabAccess:raw=>{if(raw==='saved')return {};throw Error('invalid access');}};
  if(id.endsWith('mount-account-resume')){if(fail)throw Error('chunk unavailable');return {mountAccountResume:async()=>calls.push('resume')};}
  if(id.endsWith('reminder-entry'))return entryModule.exports;
  if(id.endsWith('account-recovery-entry'))return recoveryModule.exports;
  if(id.endsWith('account-return'))return returnModule.exports;
  if(id.endsWith('mount-account-recovery')){if(fail)throw Error('chunk unavailable');return {mountAccountRecovery:node=>{assert.equal(node,root);calls.push('recovery');}};}
  if(id.endsWith('mount-reminder-workspace')){if(fail)throw Error('chunk unavailable');return {mountReminderWorkspace:node=>{assert.equal(node,root);calls.push('reminders');}};}
  if(id.endsWith('progress-startup'))return {startProgressSession:async options=>{calls.push(options.exclusive?'exclusive':'session');if(block)options.blocked(block);else await options.load();}};
  if(id.endsWith('startup-screen'))return {showProgressStartup:(node,reason)=>{assert.equal(node,root);calls.push(reason??'loading');}};
  if(id.endsWith('mount-account-workspace')){if(fail)throw Error('chunk unavailable');return {mountAccountWorkspace:(node,onStart)=>{assert.equal(node,root);calls.push('account');if(handoff)onStart({dispose(){calls.push('disposed');}});}};}
  if(id.endsWith('mount-restore-workspace')){if(fail)throw Error('chunk unavailable');return {mountRestoreWorkspace:node=>{assert.equal(node,root);calls.push('workspace');}};}
  if(id.endsWith('mount-account-app'))return {mountAccountApp:async node=>{assert.equal(node,root);calls.push('online-app');}};
  if(id.endsWith('bootstrap-app'))return {mountApp:node=>{assert.equal(node,root);calls.push('app');}};
  throw Error('Unexpected eager dependency: '+id);
 },{documentElement:{classList:{add:()=>{}}},getElementById:()=>root},{location:{origin,search,pathname,href:origin+'/'+(pathname??'').replace(/^\//,'')+search,replace:url=>calls.push('redirect:'+url)},history:{replaceState(_state,_unused,url){if(historyDenied)throw Error('history unavailable');assert.doesNotMatch(url,/code=|access_token=/);calls.push('scrubbed');}},localStorage:{getItem:()=>saved},get sessionStorage(){if(sessionDenied)throw Error('unavailable');return {getItem:k=>k==='access'?resumeRaw:sessionRaw};}},{locks:{}},{});
 await flush();return calls;
}

test('recovery scrubs URL before isolated mount and never falls through to App, including scrub or import failure',async()=>{
 const callback='?progresso=recuperar#access_token=synthetic&refresh_token=synthetic&type=recovery';
 assert.deepEqual(await run(callback),['loading','scrubbed','recovery']);
 assert.deepEqual(await run(callback,null,true),['loading','scrubbed','startup-failed']);
 assert.deepEqual(await run(callback,null,false,false,null,false,true),['loading','startup-failed']);
});

test('local recovery form stays local and mounts the isolated recovery workspace',async()=>{
 assert.deepEqual(await run('?progresso=recuperar',null,false,false,null,false,false,null,undefined,null,'http://localhost:5173'),['loading','scrubbed','recovery']);
});

test('root implicit recovery callback uses the isolated recovery workspace',async()=>{
 assert.deepEqual(await run('#access_token=synthetic&refresh_token=synthetic&type=recovery'),['loading','scrubbed','recovery']);
});

test('auth callback at the site fallback URL is scrubbed and isolated instead of loading legacy App',async()=>{
 assert.deepEqual(await run('#access_token=synthetic&refresh_token=synthetic&type=signup'),['loading','scrubbed','account']);
 assert.deepEqual(await run('?code=synthetic'),['loading','scrubbed','account']);
 assert.deepEqual(await run('#error=denied&error_description=private',null,true),['loading','scrubbed','startup-failed']);
});

test('restore URL requires valid tab access and normal protected routes resume the account',async()=>{
 assert.deepEqual(await run('?progresso=restaurar'),['loading','redirect:/auth']);
 assert.deepEqual(await run('?progresso=restaurar&confirmar=true',null,false,false,null,false,false,'saved'),['loading','workspace']);
 assert.deepEqual(await run('',null,false,false,null,false,false,'saved'),['loading','exclusive','resume']);
});
test('a saved access on this device resumes like a tab one, but a v1 copy on the device is never trusted',async()=>{
 assert.deepEqual(await run('',null,false,false,null,false,false,null,undefined,'saved'),['loading','exclusive','resume']);
 assert.deepEqual(await run('',null,false,false,null,false,false,'saved',undefined,'{"version":1}'),['loading','exclusive','resume']);
 assert.deepEqual(await run('',null,false,false,null,false,false,null,undefined,'{"version":1}'),['loading','redirect:/auth']);
 assert.deepEqual(await run('',null,false,false,null,false,false,null,undefined,'{broken'),['loading','redirect:/auth']);
 assert.deepEqual(await run('?progresso=restaurar',null,false,false,null,false,false,null,undefined,'saved'),['loading','workspace']);
});
test('pending journal is routed to workspace while denied storage or lock retains protective screen',async()=>{
 assert.deepEqual(await run('','pending-restore',false,false,null,false,false,'saved'),['loading','exclusive','workspace']);
 for(const reason of ['storage-unavailable','busy','startup-failed'])assert.deepEqual(await run('',reason,false,false,null,false,false,'saved'),['loading','exclusive',reason]);
});
test('workspace load failure never falls through to importing the live app',async()=>{
 assert.deepEqual(await run('?progresso=restaurar',null,true,false,null,false,false,'saved'),['loading','startup-failed']);
});


test('account URL and pending account barrier mount only the isolated account workspace',async()=>{
 assert.deepEqual(await run('?progresso=conta'),['loading','account']);assert.deepEqual(await run('','pending-account',false,false,null,false,false,'saved'),['loading','exclusive','account']);assert.deepEqual(await run('?progresso=conta',null,true),['loading','startup-failed']);
});


test('only the explicit workspace handoff requests the exclusive online entry, without falling through to normal App',async()=>{
 assert.deepEqual(await run('?progresso=conta',null,false,true),['loading','account','loading','exclusive','online-app']);
 assert.deepEqual(await run('?progresso=conta','busy',false,true),['loading','account','loading','exclusive','disposed','busy']);
});


test('explicit reminder entry and pending session plan stop before App import; other workspaces keep priority',async()=>{
 assert.deepEqual(await run('?progresso=lembretes',null,false,false,null,false,false,'saved'),['loading','reminders']);
 assert.deepEqual(await run('',null,false,false,'pending',false,false,'saved'),['loading','reminders']);
 assert.deepEqual(await run('?progresso=restaurar',null,false,false,'pending',false,false,'saved'),['loading','workspace']);
 assert.deepEqual(await run('?progresso=conta',null,false,false,'pending'),['loading','account']);
 assert.deepEqual(await run('?progresso=lembretes',null,true,false,null,false,false,'saved'),['loading','startup-failed']);
 assert.deepEqual(await run('',null,false,false,null,true),['loading','storage-unavailable']);
});

test('saved access requests isolated exclusive review; malformed markers cannot fall through to legacy App',async()=>{
 assert.deepEqual(await run('',null,false,false,null,false,false,'malformed'),['loading','redirect:/auth']);
 assert.deepEqual(await run('','busy',false,false,null,false,false,'saved'),['loading','exclusive','busy']);
 assert.deepEqual(await run('','pending-account',false,false,null,false,false,'saved'),['loading','exclusive','account']);
 assert.deepEqual(await run('?progresso=conta',null,false,false,null,false,false,'saved'),['loading','account']);
 assert.deepEqual(await run('',null,false,false,'pending',false,false,'saved'),['loading','reminders']);
});


test('auth aliases open the isolated access workspace; welcome is read-only and fresh root stays behind startup guards',async()=>{
 for(const path of ['/auth','/entrar','/cadastro'])assert.deepEqual(await run('',null,false,false,null,false,false,null,path),['loading','account']);
 assert.deepEqual(await run('?progresso=inicio'),['loading','welcome']);
 assert.deepEqual(await run('?progresso=restaurar',null,false,false,null,false,false,'saved','/auth'),['loading','workspace']);
 assert.deepEqual(await run('?progresso=conta',null,false,false,null,false,false,null,'/boas-vindas'),['loading','account']);
 assert.deepEqual(await run('',null,false,false,null,false,false,null,'/'),['loading','redirect:/auth']);
 assert.deepEqual(await run('',null,false,false,null,false,false,null,'/','existing progress'),['loading','redirect:/auth']);
 assert.deepEqual(await run('', 'pending-restore',false,false,null,false,false,'saved','/'),['loading','exclusive','workspace']);
 for(const path of ['/auth','/entrar','/cadastro'])assert.deepEqual(await run('?code=synthetic',null,false,false,null,false,false,null,path),['loading','scrubbed','account']);
});
