import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fixture } from '../backup/load-progress.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const bundled=await build({stdin:{contents:`export * from './src/lib/reminders/reminder-handoff';export * from './src/lib/reminders/reminder-write-plan';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':process.cwd()+'/src'},logLevel:'silent'});
const mod={exports:{}};new Function('module','exports',bundled.outputFiles[0].text)(mod,mod.exports);
const m=mod.exports;const {planReminderWrite}=m;
const {RESTORE_JOURNAL_KEY}=loadComponent('src/lib/backup/restore-journal.ts');
const {LOCAL_PROGRESS_MODE_KEY,localProgressMode}=loadComponent('src/lib/backup/progress-mode.ts');
function setup(){
 const f=fixture();const account=f.core.getState().createAccount('Perfil teste',false);
 const item=f.core.getState().addCommitment({title:'Consulta',date:new Date(2026,9,30),recurrence:'ONCE'});
 f.fitness.setState({currentAccountId:account.id});
 const origin='http://synthetic.test', before={core:f.memory.get(f.STORE_KEYS.core),fitness:f.memory.get(f.STORE_KEYS.fitness)};
 const plan=planReminderWrite(before,origin,account.id,f.core.getState().user.id,0,{kind:'configure',sourceType:'commitment',sourceId:item.id,day:'2026-10-30',time:'09:00'});
 const memory=new Map();const session={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const progress={getItem:k=>f.memory.get(k)??null};
 return {f,origin,before,plan,memory,session,progress,commit(){const state=JSON.parse(before.core);state.state.user.reminderState=plan.target;f.memory.set(f.STORE_KEYS.core,JSON.stringify(state));}};
}

test('stage verifies tab-local readback, survives simulated reload and never changes progress',async()=>{
 const a=setup();const before=[...a.f.memory];const raw=await m.stageReminderHandoff(a.session,a.origin,a.plan);
 a.plan.target.items=[];
 const view=await m.reviewReminderHandoff({...a.session},a.progress,a.origin);
 assert.equal(view.raw,raw);assert.equal(view.status,'prepared');assert.equal(view.plan.target.items.length,1);
 assert.deepEqual([...a.f.memory],before);
 await assert.rejects(m.stageReminderHandoff(a.session,a.origin,view.plan),/Já existe/);
 await m.cancelReminderHandoff(a.session,a.progress,a.origin,raw);
 assert.equal(a.session.getItem(m.REMINDER_HANDOFF_KEY),null);assert.deepEqual([...a.f.memory],before);
});

test('cancel retains transport if recovery has started, even if journal is malformed',async()=>{
 const a=setup();const raw=await m.stageReminderHandoff(a.session,a.origin,a.plan);
 a.f.memory.set(RESTORE_JOURNAL_KEY,'pending');
 assert.equal((await m.reviewReminderHandoff(a.session,a.progress,a.origin)).status,'pending-recovery');
 await assert.rejects(m.cancelReminderHandoff(a.session,a.progress,a.origin,raw));
 assert.equal(a.session.getItem(m.REMINDER_HANDOFF_KEY),raw);
});

test('finish requires exact target, no journal, local marker and explicit new consent',async()=>{
 const a=setup();const raw=await m.stageReminderHandoff(a.session,a.origin,a.plan);
 await assert.rejects(m.finishReminderHandoff(a.session,a.progress,a.origin,raw,true));
 a.commit();assert.equal((await m.reviewReminderHandoff(a.session,a.progress,a.origin)).status,'committed');
 await assert.rejects(m.cancelReminderHandoff(a.session,a.progress,a.origin,raw));
 await assert.rejects(m.finishReminderHandoff(a.session,a.progress,a.origin,raw,true));
 a.f.memory.set(LOCAL_PROGRESS_MODE_KEY,localProgressMode(a.origin));
 await assert.rejects(m.finishReminderHandoff(a.session,a.progress,a.origin,raw,false));
 const before=[...a.f.memory];await m.finishReminderHandoff(a.session,a.progress,a.origin,raw,true);
 assert.equal(a.session.getItem(m.REMINDER_HANDOFF_KEY),null);assert.deepEqual([...a.f.memory],before);
});

test('foreign progress edits cannot be mistaken for the confirmed reminder target',async()=>{
 const a=setup();const raw=await m.stageReminderHandoff(a.session,a.origin,a.plan);a.commit();
 const core=JSON.parse(a.f.memory.get(a.f.STORE_KEYS.core));core.state.user.xp_air+=1;a.f.memory.set(a.f.STORE_KEYS.core,JSON.stringify(core));
 assert.equal((await m.reviewReminderHandoff(a.session,a.progress,a.origin)).status,'changed');
 await assert.rejects(m.finishReminderHandoff(a.session,a.progress,a.origin,raw,true));
 await m.cancelReminderHandoff(a.session,a.progress,a.origin,raw);assert.equal(JSON.parse(a.f.memory.get(a.f.STORE_KEYS.core)).state.user.xp_air,1);
});

test('corruption, foreign origin, stale consent and storage quota/readback failures never authorize navigation',async()=>{
 const a=setup();const raw=await m.stageReminderHandoff(a.session,a.origin,a.plan);
 await assert.rejects(m.reviewReminderHandoff(a.session,a.progress,'http://outside.test'));
 await assert.rejects(m.cancelReminderHandoff(a.session,a.progress,a.origin,raw+' '));
 a.memory.set(m.REMINDER_HANDOFF_KEY,raw.replace('Consulta','Alterada'));
 // The plan stores source rows, so changing title changes checksum.
 await assert.rejects(m.reviewReminderHandoff(a.session,a.progress,a.origin));
 for(const type of ['quota','readback']){
  const b=setup();const session={...b.session,setItem(k,v){if(type==='quota')throw Error('quota');b.session.setItem(k,v+' ');}};
  await assert.rejects(m.stageReminderHandoff(session,b.origin,b.plan));
  assert.equal(b.f.memory.get(b.f.STORE_KEYS.core),b.before.core);
 }
});

test('handoff review and cleanup graph never imports domain stores, services or planner',async()=>{
 const out=await build({entryPoints:['src/lib/reminders/reminder-handoff.ts'],bundle:true,platform:'node',format:'cjs',write:false,metafile:true,alias:{'@':process.cwd()+'/src'},logLevel:'silent'});
 assert.ok(Object.keys(out.metafile.inputs).every(p=>!/\/stores\/|\/services\/|reminder-write-plan|profile-reminders\.ts/.test(p)));
});
