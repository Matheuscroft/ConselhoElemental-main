import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { fixture } from '../backup/load-progress.mjs';
const root=process.cwd();
async function bundle(released){return build({stdin:{contents:`export * from './src/lib/reminders/reminder-preparation';export * from './src/lib/reminders/reminder-handoff';export * from './src/lib/reminders/reminder-return';export * from './src/lib/backup/progress-mode';`,resolveDir:root,loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':root+'/src'},logLevel:'silent',plugins:[{name:'test-only-release',setup(b){b.onResolve({filter:/reminder-release$/},()=>({path:'release',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const REMINDER_WRITES_RELEASED=${released}`,loader:'ts'}));}}]});}
const [enabled,closed]=await Promise.all([bundle(true),bundle(false)]);
function setup(out=enabled,kind='commitment'){
 const mod={exports:{}};new Function('require','module','exports','crypto',out.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);const m=mod.exports;
 const f=fixture(),state=f.core.getState(),account=state.createAccount('Teste',false);
 const source=kind==='task'?f.core.getState().addTask({title:'Leitura',dueDate:'2026-10-30'}):kind==='habit'?f.core.getState().addHabit({name:'Estudo',daysOfWeek:[0,1,2,3,4,5,6],startDate:new Date(2026,9,1,12)}):f.core.getState().addCommitment({title:'Consulta',date:new Date(2026,9,30),recurrence:'ONCE'});
 f.fitness.setState({currentAccountId:account.id});
 const origin='http://synthetic.test',memory=new Map();f.memory.set(m.LOCAL_PROGRESS_MODE_KEY,m.localProgressMode(origin));
 let reads=0,writes=0;const storage={getItem:k=>{reads++;return f.memory.get(k)??null;}};
 const session={getItem:k=>memory.get(k)??null,setItem:(k,v)=>{writes++;memory.set(k,v);},removeItem:k=>{writes++;memory.delete(k);}};
 const ctx={storage,session,origin,localDocument:true,liveAccountDocument:false,readProgress:()=>f.captureProgress(origin)};
 const identity={sourceType:kind,sourceId:source.id,day:'2026-10-30'};
 return {m,f,memory,source,ctx,identity,session,counts:()=>({reads,writes}),review:()=>m.reviewActivityReminder(ctx,identity),prepare:(r,draft={kind:'configure',time:'09:00'},confirmed=true)=>m.prepareActivityReminder(ctx,r,draft,'/temporal/mes?mes=2026-10&dia=2026-10-30',confirmed)};
}

test('release and explicit navigation consent block preparation before storage access',async()=>{
 const a=setup(closed);assert.throws(()=>a.review(),/não foi liberada/);assert.deepEqual(a.counts(),{reads:0,writes:0});
 const b=setup();const r=b.review(),before=b.counts();await assert.rejects(b.prepare(r,undefined,false),/Confirme/);assert.deepEqual(b.counts(),before);assert.equal(b.memory.size,0);
});

test('all supported source types prepare only tab transport, with safe day/period return and unchanged real projections',async()=>{
 for(const kind of ['task','habit','commitment']){
  const a=setup(enabled,kind),before=[...a.f.memory],r=a.review();assert.equal(r.identity.sourceId,a.source.id);assert.equal(a.counts().writes,0);
  const href=await a.prepare(r);const url=new URL(href,a.ctx.origin);assert.equal(url.searchParams.get('progresso'),'lembretes');assert.equal(a.m.reminderReturnFromSearch(url.search),'/temporal/mes?dia=2026-10-30&mes=2026-10');
  const staged=await a.m.reviewReminderHandoff(a.session,a.ctx.storage,a.ctx.origin);assert.equal(staged.plan.target.items[0].occurrence.sourceType,kind);assert.equal(staged.status,'prepared');assert.deepEqual([...a.f.memory],before);
 }
});

test('configure and all command options reuse the existing revision rules without completing or rewarding activities',async()=>{
 for(const action of ['one-hour','tomorrow-nine','tomorrow-same-time','dismiss']){
  const a=setup();const s=a.f.core.getState();s.mutateOccurrenceReminder(s.currentAccountId,s.user.id,0,{kind:'configure',...a.identity,time:'09:00'});
  const r=a.review(),before=[...a.f.memory];assert.ok(r.existing);await assert.rejects(a.prepare(r),/estado do aviso/);
  await a.prepare(r,{kind:'command',action});const staged=await a.m.reviewReminderHandoff(a.session,a.ctx.storage,a.ctx.origin),item=staged.plan.target.items[0];assert.equal(item.lastCommand.action,action);assert.equal(item.revision,1);assert.equal(staged.plan.target.revision,2);assert.equal(item.status,action==='dismiss'?'dismissed':'scheduled');assert.deepEqual([...a.f.memory],before);
 }
});

test('binding, pending account/recovery, missing local mode, wrong document and mismatched live snapshot cannot stage',()=>{
 for(const reason of ['binding','intent','resolution','journal','mode','local-document','online-document','live-snapshot','pending','unsupported','identity']){
  const a=setup();
  if(['binding','intent','resolution'].includes(reason))a.f.memory.set(`conselho-elemental-account-${reason}-v1`,'retained');
  if(reason==='journal')a.f.memory.set('conselho-elemental-restore-journal-v1','pending');
  if(reason==='mode')a.f.memory.delete(a.m.LOCAL_PROGRESS_MODE_KEY);
  if(reason==='local-document')a.ctx.localDocument=false;
  if(reason==='online-document')a.ctx.liveAccountDocument=true;
  if(reason==='live-snapshot'){const original=a.ctx.readProgress;a.ctx.readProgress=()=>{const next=structuredClone(original());next.stores.core.state.user.xp_air+=1;return next;};}
  if(reason==='pending')a.memory.set(a.m.REMINDER_HANDOFF_KEY,'existing');
  if(reason==='unsupported')a.identity.sourceType='sequence';
  if(reason==='identity')a.identity.sourceId='missing';
  assert.throws(()=>a.review(),reason);assert.equal(a.counts().writes,0);
 }
});

test('stale or completed source fails and leaves the caller draft and all existing progress intact',async()=>{
 for(const reason of ['deleted','date','profile','done','time']){
  const a=setup(enabled,reason==='done'?'task':'commitment'),r=a.review(),draft={kind:'configure',time:reason==='time'?'invalid':'09:00'};
  if(reason==='deleted')a.f.core.getState().deleteCommitment(a.source.id);
  if(reason==='date')a.f.core.getState().updateCommitment(a.source.id,{date:new Date(2026,10,1)});
  if(reason==='profile')a.f.core.getState().createAccount('Outro',false);
  if(reason==='done')a.f.core.getState().completeTask(a.source.id);
  const baseline=[...a.f.memory];await assert.rejects(a.prepare(r,draft));assert.equal(draft.time,reason==='time'?'invalid':'09:00');assert.equal(a.memory.size,0);assert.deepEqual([...a.f.memory],baseline);
 }
});

test('progress changes or unmount during transport hashing discard only own plan and never authorize departure',async()=>{
 for(const reason of ['mode','progress','unmount']){
  const a=setup(),r=a.review();let current=true;a.ctx.isCurrent=()=>current;
  const pending=a.prepare(r);
  if(reason==='mode')a.f.memory.delete(a.m.LOCAL_PROGRESS_MODE_KEY);
  if(reason==='progress')a.f.core.getState().addDraft({title:'Outro pensamento'});
  if(reason==='unmount')current=false;
  const baseline=[...a.f.memory];await assert.rejects(pending);assert.equal(a.memory.size,0);assert.deepEqual([...a.f.memory],baseline);
 }
});

test('quota or failed readback does not navigate; an unconfirmed transport stays available for explicit review',async()=>{
 for(const reason of ['quota','readback']){
  const a=setup(),r=a.review(),baseline=[...a.f.memory];const setter=a.session.setItem;
  a.session.setItem=(k,v)=>{if(reason==='quota')throw Error('quota');setter(k,v+' ');};await assert.rejects(a.prepare(r),/preenchimento foi preservado/);assert.deepEqual([...a.f.memory],baseline);assert.equal(a.memory.size,reason==='quota'?0:1);
 }
});

test('return destinations cannot select another workspace, account action or external location',()=>{
 const {m}=setup();
 for(const value of ['https://outside.test/temporal/mes','//outside.test','javascript:alert(1)','/temporal/../auth','/temporal/unknown','/ciclos','/temporal/mes\\x'])assert.equal(m.safeReminderReturn(value),'/santuario');
 assert.equal(m.safeReminderReturn('/temporal/semana?data=2026-10-30&dia=2026-10-30&progresso=conta&voltar=https://outside.test#raw'),'/temporal/semana?data=2026-10-30&dia=2026-10-30');
 assert.equal(m.reminderReturnFromSearch('?voltar='+encodeURIComponent('/temporal/ano?ano=2026')),'/temporal/ano?ano=2026');
 assert.equal(m.reminderReturnFromSearch(''),'/santuario');
});


test('two simultaneous preparations cannot replace each other or stage two plans',async()=>{
 const a=setup(),r=a.review(),baseline=[...a.f.memory];const results=await Promise.allSettled([a.prepare(r),a.prepare(r,{kind:'configure',time:'10:00'})]);assert.equal(results.filter(r=>r.status==='fulfilled').length,1);assert.equal(a.memory.size,1);assert.deepEqual([...a.f.memory],baseline);
});


test('a recovery barrier appearing during staging retains the plan instead of clearing recovery state',async()=>{
 const a=setup(),r=a.review();const pending=a.prepare(r);a.f.memory.set('conselho-elemental-restore-journal-v1','foreign pending journal');const baseline=[...a.f.memory];await assert.rejects(pending,/permanece pendente/);assert.equal(a.memory.size,1);assert.deepEqual([...a.f.memory],baseline);
});
