import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { fixture } from '../backup/load-progress.mjs';
const root=process.cwd();
async function bundle(released){return build({stdin:{contents:`export * from './src/lib/reminders/reminder-workspace';export * from './src/lib/reminders/reminder-write-plan';export * from './src/lib/reminders/reminder-handoff';export * from './src/lib/backup/progress-mode';export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/progress-backup';export * from './src/lib/backup/stored-progress';`,resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':root+'/src'},logLevel:'silent',plugins:[{name:'test-only-release',setup(b){b.onResolve({filter:/reminder-release$/},()=>({path:'test-release',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const REMINDER_WRITES_RELEASED=${released}`,loader:'ts'}));}}]});}
const [enabled,closed]=await Promise.all([bundle(true),bundle(false)]);
function setup(out=enabled,{local=true}={}){
 const mod={exports:{}};new Function('require','module','exports','crypto',out.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);const m=mod.exports;
 const f=fixture(),account=f.core.getState().createAccount('Teste',false);
 const source=f.core.getState().addCommitment({title:'Consulta',date:new Date(2026,9,30),recurrence:'ONCE'});f.fitness.setState({currentAccountId:account.id});
 const before={core:f.memory.get(f.STORE_KEYS.core),fitness:f.memory.get(f.STORE_KEYS.fitness)},origin='http://synthetic.test';
 const plan=m.planReminderWrite(before,origin,account.id,f.core.getState().user.id,0,{kind:'configure',sourceType:'commitment',sourceId:source.id,day:'2026-10-30',time:'09:00'});
 if(local)f.memory.set(m.LOCAL_PROGRESS_MODE_KEY,m.localProgressMode(origin));
 const memory=new Map(),session={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 let held=false,writes=0;
 const manager={async request(name,opt,fn){assert.equal(name,'conselho-elemental-progress-session-v1');assert.equal(opt.mode,'exclusive');assert.equal(opt.ifAvailable,true);if(held)return fn(null);held=true;try{return await fn({name});}finally{held=false;}}};
 const storage={getItem:k=>f.memory.get(k)??null,setItem(k,v){assert.equal(held,true);writes++;f.memory.set(k,v);},removeItem(k){assert.equal(held,true);writes++;f.memory.delete(k);}};
 const ctx={storage:()=>storage,locks:manager,origin,otherTabsClosed:true,reminderConfirmed:true};
 const review=()=>m.reviewReminderWorkspace(session,storage,origin);
 const act=(r,a,confirmed=true)=>m.runReminderWorkspaceAction(ctx,session,r,a,confirmed);
 return {m,f,before,origin,plan,source,memory,session,storage,ctx,review,act,writes:()=>writes,stage:()=>m.stageReminderHandoff(session,origin,plan)};
}

test('workspace review is read-only, describes the changed activity and tolerates empty/lost transport',async()=>{
 const a=setup();const baseline=[...a.f.memory];assert.equal((await a.review()).handoff,null);
 await a.stage();const review=await a.review();assert.equal(review.handoff.status,'prepared');assert.equal(review.localOnly,true);assert.deepEqual(review.changes.map(c=>[c.label,c.day]),[['Consulta','2026-10-30']]);assert.equal(a.writes(),0);assert.deepEqual([...a.f.memory],baseline);
 a.memory.clear();a.f.memory.set(a.m.RESTORE_JOURNAL_KEY,'unreadable');const orphan=await a.review();assert.equal(orphan.orphanRecovery,true);assert.equal(orphan.handoff,null);assert.equal(a.f.memory.get(a.m.RESTORE_JOURNAL_KEY),'unreadable');
});

test('closed gate cannot write or finish, but explicit cancellation removes only tab transport',async()=>{
 const a=setup(closed);await a.stage();const r=await a.review(),baseline=[...a.f.memory];
 for(const action of ['apply','recover','local','finish'])await assert.rejects(a.act(r,action),/não foi liberada/);
 await assert.rejects(a.act(r,'cancel',false));assert.equal(await a.act(r,'cancel'),'exit');assert.deepEqual([...a.f.memory],baseline);assert.equal(a.writes(),0);assert.equal(a.session.getItem(a.m.REMINDER_HANDOFF_KEY),null);
});

test('apply requires new consent, closed tabs, Web Locks and an already-local unbound progress',async()=>{
 for(const reason of ['consent','tabs','locks','not-local','binding','intent','resolution']){
  const a=setup(enabled,{local:reason!=='not-local'});await a.stage();
  if(reason==='tabs')a.ctx.otherTabsClosed=false;
  if(reason==='locks')a.ctx.locks=undefined;
  if(['binding','intent','resolution'].includes(reason))a.f.memory.set(`conselho-elemental-account-${reason}-v1`,'retained account metadata');
  const baseline=[...a.f.memory],r=await a.review();await assert.rejects(a.act(r,'apply',reason!=='consent'));assert.equal(a.writes(),0);assert.deepEqual([...a.f.memory],baseline);
 }
});

test('full workspace journey preserves domain data, requires separate confirmations and finishes only transport',async()=>{
 const a=setup();await a.stage();const prepared=await a.review();assert.equal(await a.act(prepared,'apply'),'review');
 const committed=await a.review();assert.equal(committed.recovery.outcome,'keep-target');assert.equal(committed.handoff.status,'pending-recovery');
 await assert.rejects(a.act(committed,'cancel'));await assert.rejects(a.act(committed,'local',false));await assert.rejects(a.act(prepared,'apply'));
 await a.act(committed,'local');const finished=await a.review();assert.equal(finished.handoff.status,'committed');
 const writes=a.writes();await assert.rejects(a.act(finished,'finish',false));assert.equal(await a.act(finished,'finish'),'exit');assert.equal(a.writes(),writes);assert.equal(a.memory.size,0);
 const actual=JSON.parse(a.f.memory.get(a.f.STORE_KEYS.core));delete actual.state.user.reminderState;assert.deepEqual(actual,JSON.parse(a.before.core));assert.deepEqual(JSON.parse(a.f.memory.get(a.f.STORE_KEYS.fitness)),JSON.parse(a.before.fitness));
});

test('changes to domain, session, mode or account revoke the exact review before writing',async()=>{
 for(const reason of ['domain','session','mode','account']){
  const a=setup();await a.stage();const r=await a.review();
  const pending=a.act(r,'apply');
  if(reason==='domain')a.f.memory.set(a.f.STORE_KEYS.core,a.before.core+' ');
  if(reason==='session')a.memory.clear();
  if(reason==='mode')a.f.memory.delete(a.m.LOCAL_PROGRESS_MODE_KEY);
  if(reason==='account')a.f.memory.set('conselho-elemental-account-binding-v1','changed');
  await assert.rejects(pending);assert.equal(a.writes(),0);
 }
});

test('stale generation callback and conflicting recovery cannot be executed',async()=>{
 const a=setup();await a.stage();const r=await a.review();let current=true;a.ctx.isCurrent=()=>current;const pending=a.act(r,'apply');current=false;await assert.rejects(pending);assert.equal(a.writes(),0);
 const b=setup();await b.stage();await b.act(await b.review(),'apply');const raw=JSON.parse(b.f.memory.get(b.f.STORE_KEYS.core));raw.state.user.xp_air+=1;b.f.memory.set(b.f.STORE_KEYS.core,JSON.stringify(raw));const conflict=await b.review();assert.equal(conflict.recovery.outcome,'conflict');await assert.rejects(b.act(conflict,'local'));await assert.rejects(b.act(conflict,'recover'));assert.ok(b.f.memory.has(b.m.RESTORE_JOURNAL_KEY));
});

test('foreign journal target is refused even when it changes only another reminder on the same profile',async()=>{
 const a=setup();await a.stage();const original=[...a.f.memory];
 const alternate=a.m.planReminderWrite(a.before,a.origin,a.plan.accountId,a.plan.userId,0,{kind:'configure',sourceType:'commitment',sourceId:a.source.id,day:'2026-10-30',time:'11:00'});
 const target=a.m.validateStoredProgress(a.before,a.origin);target.stores.core.state.user.reminderState=alternate.target;
 const backup=await a.m.createProgressBackup(target);const journal=await a.m.prepareRestoreJournal(a.before,backup,a.origin);a.f.memory.set(a.m.RESTORE_JOURNAL_KEY,journal);
 await assert.rejects(a.review(),/outra operação/);assert.equal(a.writes(),0);assert.equal(a.f.memory.get(a.m.RESTORE_JOURNAL_KEY),journal);assert.deepEqual([...a.f.memory].filter(([k])=>k!==a.m.RESTORE_JOURNAL_KEY),original);
});

test('partial reminder write binds recovery, rolls back and allows a freshly confirmed retry',async()=>{
 const a=setup();await a.stage();let n=0;const original=a.storage.setItem;a.storage.setItem=(k,v)=>{original(k,v);if(++n===2)throw Error('interrupted');};
 await assert.rejects(a.act(await a.review(),'apply'),/interrupted/);a.storage.setItem=original;
 const pending=await a.review();assert.equal(pending.recovery.outcome,'rollback');await a.act(pending,'recover');const restored=await a.review();assert.equal(restored.handoff.status,'prepared');assert.equal(a.f.memory.get(a.f.STORE_KEYS.core),a.before.core);
 await a.act(restored,'apply');assert.equal((await a.review()).recovery.outcome,'keep-target');
});

test('reminder workspace graph excludes domain/auth and normal entry stays limited to its key and selector',async()=>{
 for(const entry of ['src/mount-reminder-workspace.tsx','src/lib/reminders/reminder-entry.ts']){
  const out=await build({entryPoints:[entry],bundle:true,platform:'node',format:'cjs',write:false,metafile:true,alias:{'@':root+'/src'},loader:{'.css':'empty'},logLevel:'silent'});
  const files=Object.keys(out.metafile.inputs);assert.ok(files.every(p=>!/\/stores\/|\/services\/|reminder-write-plan|profile-reminders\.ts|supabase\.ts|bootstrap-app/.test(p)));
  if(entry.includes('reminder-entry'))assert.deepEqual(files.sort(),['src/lib/reminders/reminder-entry.ts','src/lib/reminders/reminder-handoff-key.ts']);
 }
});
