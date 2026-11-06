import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
const source=ts.transpileModule(readFileSync('src/main.tsx','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const entrySource=ts.transpileModule(readFileSync('src/lib/reminders/reminder-entry.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const entryModule={exports:{}};new Function('require','exports',entrySource)(()=>({REMINDER_HANDOFF_KEY:'conselho-elemental-reminder-handoff-v1'}),entryModule.exports);
const recoveryModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-recovery-entry.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(recoveryModule.exports);
const returnModule={exports:{}};new Function('exports',ts.transpileModule(readFileSync('src/lib/backup/account-return.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.Latest,module:ts.ModuleKind.CommonJS}}).outputText)(returnModule.exports);
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function run(search,block,fail=false,handoff=false,sessionRaw=null,sessionDenied=false,historyDenied=false,resumeRaw=null){
 const calls=[];const root={};
 new Function('require','document','window','navigator','exports',source)(id=>{
  if(id.endsWith('.css'))return {};
  if(id.endsWith('account-resume-entry'))return {hasAccountTabAccess:storage=>storage.getItem('access')!==null};
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
 },{documentElement:{classList:{add:()=>{}}},getElementById:()=>root},{location:{search,href:'https://fixture.test/'+search},history:{replaceState(_state,_unused,url){if(historyDenied)throw Error('history unavailable');assert.doesNotMatch(url,/code=|access_token=/);calls.push('scrubbed');}},localStorage:{},get sessionStorage(){if(sessionDenied)throw Error('unavailable');return {getItem:k=>k==='access'?resumeRaw:sessionRaw};}},{locks:{}},{});
 await flush();return calls;
}

test('recovery scrubs URL before isolated mount and never falls through to App, including scrub or import failure',async()=>{
 assert.deepEqual(await run('?progresso=recuperar&code=synthetic'),['loading','scrubbed','recovery']);
 assert.deepEqual(await run('?progresso=recuperar&code=synthetic',null,true),['loading','scrubbed','startup-failed']);
 assert.deepEqual(await run('?progresso=recuperar&code=synthetic',null,false,false,null,false,true),['loading','startup-failed']);
});

test('auth callback at the site fallback URL is scrubbed and isolated instead of loading legacy App',async()=>{
 assert.deepEqual(await run('#access_token=synthetic&refresh_token=synthetic&type=signup'),['loading','scrubbed','account']);
 assert.deepEqual(await run('?code=synthetic'),['loading','scrubbed','account']);
 assert.deepEqual(await run('#error=denied&error_description=private',null,true),['loading','scrubbed','startup-failed']);
});

test('restore URL mounts isolated workspace directly, normal URL starts the existing app',async()=>{
 assert.deepEqual(await run('?progresso=restaurar'),['loading','workspace']);
 assert.deepEqual(await run('?progresso=restaurar&confirmar=true'),['loading','workspace']);
 assert.deepEqual(await run(''),['loading','session','app']);
});
test('pending journal is routed to workspace while denied storage or lock retains protective screen',async()=>{
 assert.deepEqual(await run('','pending-restore'),['loading','session','workspace']);
 for(const reason of ['storage-unavailable','busy','startup-failed'])assert.deepEqual(await run('',reason),['loading','session',reason]);
});
test('workspace load failure never falls through to importing the live app',async()=>{
 assert.deepEqual(await run('?progresso=restaurar',null,true),['loading','startup-failed']);
});


test('account URL and pending account barrier mount only the isolated account workspace',async()=>{
 assert.deepEqual(await run('?progresso=conta'),['loading','account']);assert.deepEqual(await run('','pending-account'),['loading','session','account']);assert.deepEqual(await run('?progresso=conta',null,true),['loading','startup-failed']);
});


test('only the explicit workspace handoff requests the exclusive online entry, without falling through to normal App',async()=>{
 assert.deepEqual(await run('?progresso=conta',null,false,true),['loading','account','loading','exclusive','online-app']);
 assert.deepEqual(await run('?progresso=conta','busy',false,true),['loading','account','loading','exclusive','disposed','busy']);
});


test('explicit reminder entry and pending session plan stop before App import; other workspaces keep priority',async()=>{
 assert.deepEqual(await run('?progresso=lembretes'),['loading','reminders']);
 assert.deepEqual(await run('',null,false,false,'pending'),['loading','reminders']);
 assert.deepEqual(await run('?progresso=restaurar',null,false,false,'pending'),['loading','workspace']);
 assert.deepEqual(await run('?progresso=conta',null,false,false,'pending'),['loading','account']);
 assert.deepEqual(await run('?progresso=lembretes',null,true),['loading','startup-failed']);
 assert.deepEqual(await run('',null,false,false,null,true),['loading','storage-unavailable']);
});

test('saved access requests isolated exclusive review; malformed markers cannot fall through to legacy App',async()=>{
 assert.deepEqual(await run('',null,false,false,null,false,false,'malformed'),['loading','exclusive','resume']);
 assert.deepEqual(await run('','busy',false,false,null,false,false,'saved'),['loading','exclusive','busy']);
 assert.deepEqual(await run('','pending-account',false,false,null,false,false,'saved'),['loading','exclusive','account']);
 assert.deepEqual(await run('?progresso=conta',null,false,false,null,false,false,'saved'),['loading','account']);
 assert.deepEqual(await run('',null,false,false,'pending',false,false,'saved'),['loading','reminders']);
});
