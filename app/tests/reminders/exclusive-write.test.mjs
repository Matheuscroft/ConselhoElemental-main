import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { fixture } from '../backup/load-progress.mjs';
const root=process.cwd();
const bundler = released => build({ stdin: { contents: `export * from './src/lib/reminders/exclusive-reminder-write';export * from './src/lib/reminders/reminder-handoff';export * from './src/lib/reminders/reminder-handoff-commit';export * from './src/lib/reminders/reminder-write-plan';export * from './src/lib/backup/exclusive-restore';export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/progress-startup';`, resolveDir:root,loader:'ts' },bundle:true,platform:'node',format:'cjs',write:false,alias:{'@':root+'/src'},logLevel:'silent',plugins:[{name:'test-only-release',setup(b){b.onResolve({filter:/reminder-release$/},()=>({path:'test-release',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:`export const REMINDER_WRITES_RELEASED=${released}`,loader:'ts'}));}}]});
const enabled=await bundler(true),closed=await bundler(false);
function moduleFixture(out=enabled){const mod={exports:{}};new Function('require','module','exports','crypto',out.outputFiles[0].text)(createRequire(import.meta.url),mod,mod.exports,webcrypto);return mod.exports;}
function locks(){let held=false;return {get held(){return held;},async request(name,options,fn){assert.equal(name,'conselho-elemental-progress-session-v1');assert.equal(options.mode,'exclusive');assert.equal(options.ifAvailable,true);if(held)return fn(null);held=true;try{return await fn({name,mode:'exclusive'});}finally{held=false;}}};}
function setup(out){
 const m=moduleFixture(out),f=fixture();const account=f.core.getState().createAccount('Teste',false);
 const source=f.core.getState().addCommitment({title:'Consulta',date:new Date(2026,9,30),recurrence:'ONCE'});
 f.fitness.setState({currentAccountId:account.id});
 const before={core:f.memory.get('conselho-elemental-storage'),fitness:f.memory.get('dominio-do-mago-workout-storage-v1')};
 const plan=m.planReminderWrite(before,'http://synthetic.test',account.id,f.core.getState().user.id,0,{kind:'configure',sourceType:'commitment',sourceId:source.id,day:'2026-10-30',time:'09:00'});
 const manager=locks(),memory=new Map(Object.entries(before).map(([part,raw])=>[f.STORE_KEYS[part],raw]));let reads=0,writes=0;
 const storage={getItem(key){assert.equal(manager.held,true);reads++;return memory.get(key)??null;},setItem(key,value){assert.equal(manager.held,true);writes++;memory.set(key,value);},removeItem(key){assert.equal(manager.held,true);writes++;memory.delete(key);}};
 const context={storage:()=>storage,locks:manager,origin:'http://synthetic.test',otherTabsClosed:true,reminderConfirmed:true};
 return {m,f,before,plan,manager,memory,storage,context,counts:()=>({reads,writes})};
}

test('closed release and missing confirmation or lock cannot read or write storage',async()=>{
 for(const mode of ['closed','consent','lock','tabs']){
  const a=setup(mode==='closed'?closed:enabled);
  if(mode==='consent')a.context.reminderConfirmed=false;
  if(mode==='lock')a.context.locks=undefined;
  if(mode==='tabs')a.context.otherTabsClosed=false;
  await assert.rejects(a.m.runExclusiveReminderWrite(a.context,a.plan));assert.deepEqual(a.counts(),{reads:0,writes:0});
 }
});

test('exclusive commit changes only active reminder metadata, preserves Fitness data and leaves startup barrier',async()=>{
 const a=setup();a.before.fitness=JSON.stringify(JSON.parse(a.before.fitness),null,2);a.plan.before.fitness=a.before.fitness;a.memory.set(a.f.STORE_KEYS.fitness,a.before.fitness);
 assert.equal(await a.m.runExclusiveReminderWrite(a.context,a.plan),'applied');
 const actual=JSON.parse(a.memory.get(a.f.STORE_KEYS.core));const previous=JSON.parse(a.before.core);
 assert.deepEqual(actual.state.user.reminderState,a.plan.target);
 delete actual.state.user.reminderState;assert.deepEqual(actual,previous);
 assert.deepEqual(JSON.parse(a.memory.get(a.f.STORE_KEYS.fitness)),JSON.parse(a.before.fitness));
 assert.ok(a.memory.has(a.m.RESTORE_JOURNAL_KEY));
 let loaded=false,blocked;
 await a.m.startProgressSession({storage:()=>({getItem:key=>a.memory.get(key)??null}),load:async()=>{loaded=true;},blocked:value=>{blocked=value;}});
 assert.equal(loaded,false);assert.equal(blocked,'pending-restore');
});

test('changed baseline, wrong identity, account barrier and cancelled callback refuse without domain writes',async()=>{
 for(const mode of ['baseline','identity','revision','account','cancel']){
  const a=setup();
  if(mode==='baseline')a.memory.set(a.f.STORE_KEYS.core,a.before.core+' ');
  if(mode==='identity')a.plan.userId='wrong';
  if(mode==='revision')a.plan.expectedRevision=1;
  if(mode==='account')a.memory.set('conselho-elemental-account-intent-v1','pending');
  if(mode==='cancel')a.context.isCurrent=()=>false;
  const raw=a.memory.get(a.f.STORE_KEYS.core);
  await assert.rejects(a.m.runExclusiveReminderWrite(a.context,a.plan));
  assert.equal(a.memory.get(a.f.STORE_KEYS.core),raw);assert.equal(a.memory.get(a.f.STORE_KEYS.fitness),a.before.fitness);
  assert.equal(a.counts().writes,0);
 }
});

test('competing cooperative tabs cannot commit concurrently',async()=>{
 const a=setup();let release;const hold=new Promise(r=>{release=r;});let entered;const ready=new Promise(r=>{entered=r;});
 const held=a.manager.request('conselho-elemental-progress-session-v1',{mode:'exclusive',ifAvailable:true},async()=>{entered();await hold;});
 await ready;await assert.rejects(a.m.runExclusiveReminderWrite(a.context,a.plan),/outra aba/);assert.equal(a.counts().writes,0);
 release();await held;await a.m.runExclusiveReminderWrite(a.context,a.plan);
});

test('interruption before or after every commit write keeps known bytes and supports explicit recovery',async()=>{
 for(const after of [false,true])for(let boundary=1;boundary<=4;boundary++){
  const a=setup();let count=0;
  a.context.storage=()=>({...a.storage,setItem(key,value){count++;if(count===boundary&&!after)throw new Error('interrupted');a.storage.setItem(key,value);if(count===boundary&&after)throw new Error('interrupted');}});
  await assert.rejects(a.m.runExclusiveReminderWrite(a.context,a.plan),/interrupted/);
  a.context.storage=()=>a.storage;
  if(a.memory.has(a.m.RESTORE_JOURNAL_KEY)){
   const review=await a.m.reviewPendingRestore({getItem:key=>a.memory.get(key)??null},a.context.origin);
   assert.notEqual(review.outcome,'conflict');
   await a.m.runExclusiveRestore(a.context,{mode:'recover',expected:review.baseline,recoveryConfirmed:true});
   const core=JSON.parse(a.memory.get(a.f.STORE_KEYS.core));const previous=JSON.parse(a.before.core);
   if(core.state.user.reminderState)assert.deepEqual(core.state.user.reminderState,a.plan.target);
   delete core.state.user.reminderState;assert.deepEqual(core,previous);
  }else assert.equal(a.memory.get(a.f.STORE_KEYS.core),a.before.core);
  assert.equal(a.memory.get(a.f.STORE_KEYS.fitness),a.before.fitness);
 }
});

test('pre-bootstrap coordinator graph has no stores, services or domain planner at runtime',async()=>{
 const output=await build({entryPoints:['src/lib/reminders/exclusive-reminder-write.ts'],bundle:true,platform:'node',format:'cjs',write:false,metafile:true,alias:{'@':root+'/src'},logLevel:'silent'});
 assert.ok(Object.keys(output.metafile.inputs).every(path=>!/\/stores\/|\/services\/|reminder-write-plan|profile-reminders\.ts/.test(path)));
});


test('already-hydrated document cannot write; plan/consent mutation after dispatch cannot replace target',async()=>{
 const active=setup();
 await active.m.startProgressSession({storage:()=>({getItem:key=>active.memory.get(key)??null}),load:async()=>{},blocked:()=>assert.fail('unexpected block'),lifetime:Promise.resolve()});
 await assert.rejects(active.m.runExclusiveReminderWrite(active.context,active.plan),/já foi iniciado/);
 assert.equal(active.counts().writes,0);
 const a=setup();const expected=JSON.stringify(a.plan.target);
 const pending=a.m.runExclusiveReminderWrite(a.context,a.plan);
 a.plan.target.items=[];a.context.reminderConfirmed=false;
 await pending;
 assert.equal(JSON.stringify(JSON.parse(a.memory.get(a.f.STORE_KEYS.core)).state.user.reminderState),expected);
});


test('tab transport commits, retains recovery barrier, and clears only after explicit local continuation',async()=>{
 const a=setup();const memory=new Map();const session={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const progress={getItem:k=>a.memory.get(k)??null};
 const raw=await a.m.stageReminderHandoff(session,a.context.origin,a.plan);
 await a.m.commitStagedReminder(a.context,session,raw);
 assert.equal((await a.m.reviewReminderHandoff(session,progress,a.context.origin)).status,'pending-recovery');
 await assert.rejects(a.m.cancelReminderHandoff(session,progress,a.context.origin,raw));
 let review=await a.m.reviewPendingRestore(progress,a.context.origin);
 await a.m.runExclusiveRestore(a.context,{mode:'recover',expected:review.baseline,recoveryConfirmed:true});
 review=await a.m.reviewPendingRestore(progress,a.context.origin);
 await a.m.runExclusiveRestore(a.context,{mode:'local',expected:review.baseline,localUseConfirmed:true});
 const coreBefore=a.memory.get(a.f.STORE_KEYS.core);
 await a.m.finishReminderHandoff(session,progress,a.context.origin,raw,true);
 assert.equal(session.getItem(a.m.REMINDER_HANDOFF_KEY),null);assert.equal(a.memory.get(a.f.STORE_KEYS.core),coreBefore);
});

test('transport removed during preparation cancels the coordinator before progress writes',async()=>{
 const a=setup();const memory=new Map();let active=true;
 const session={getItem:k=>active?memory.get(k)??null:null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const raw=await a.m.stageReminderHandoff(session,a.context.origin,a.plan);
 const pending=a.m.commitStagedReminder(a.context,session,raw);active=false;
 await assert.rejects(pending);assert.equal(a.counts().writes,0);assert.equal(a.memory.get(a.f.STORE_KEYS.core),a.before.core);
});
