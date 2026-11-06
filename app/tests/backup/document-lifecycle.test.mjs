import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';

// Each evaluation is a new document realm. Live stores are evaluated only by load().
// This models protocol integration; it does not model browser Web Locks or BFCache.
const output=await build({stdin:{contents:`export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/exclusive-restore';export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/stored-progress';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,format:'cjs',platform:'node',write:false,metafile:true,logLevel:'silent'});
function realm(){const mod={exports:{}};new Function('module','exports','crypto',output.outputFiles[0].text)(mod,mod.exports,webcrypto);return mod.exports;}
const deferred=()=>{let resolve;return {promise:new Promise(r=>{resolve=r;}),resolve:()=>resolve()};};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const json=value=>JSON.parse(JSON.stringify(value));
const origin='http://fixture.test';
function lockManager(){
 let readers=0,writer=false;
 return {get readers(){return readers;},get writer(){return writer;},async request(name,options,callback){
  assert.equal(name,'conselho-elemental-progress-session-v1');assert.equal(options.ifAvailable,true);
  if(writer||(options.mode==='exclusive'&&readers))return callback(null);
  if(options.mode==='shared')readers++;else writer=true;
  try{return await callback({name,mode:options.mode});}finally{if(options.mode==='shared')readers--;else writer=false;}
 }};
}
async function setup(){
 const producer=fixture(),core=producer.core,w=producer.fitness;
 const first=core.getState().createAccount('Perfil sintético A',false);
 const habit=core.getState().addHabit({name:'Atividade diária',elementId:'ar',plannedPoints:2,plannedTimeMinutes:5});
 core.getState().configureHabitDailyTracking(habit.id,{unit:'vez',target:3,step:1});
 core.getState().recordHabitQuantity(habit.id,new Date(2026,9,29,12));
 core.getState().completeHabit(habit.id,5,new Date(2026,9,29,12));
 const exercise=w.getState().saveCustomExercise({name:'Exercício sintético',modality:'strength',measureMode:'reps'});
 assert.ok(w.getState().startSession(undefined,3));const block=w.getState().addExerciseToSession(exercise);assert.ok(block);
 assert.ok(w.getState().logSet(block.id,block.sets[0].id,{completed:true,reps:10,loadKg:5}));assert.ok(w.getState().finishSession());
 const second=core.getState().createAccount('Perfil sintético B',false);core.getState().addDraft('Ideia do segundo perfil','Notas preservadas');core.getState().switchAccount(first.id);
 const original=producer.captureProgress(origin),previousBackup=await producer.createProgressBackup(original);
 const before=Object.fromEntries(Object.entries(original.stores).map(([part,data])=>[part,JSON.stringify({state:data.state,version:data.version})]));
 const task=core.getState().addTask({title:'Nova atividade',elementId:'fogo',baseValue:2,plannedTimeMinutes:5,effortLevel:2});core.getState().completeTask(task.id,5);
 core.getState().addDraft('Ideia adicionada pela cópia','');
 w.getState().addBodyMeasurement({weightKg:70}); // Change both envelopes so rollback has two actual writes.
 const target=producer.captureProgress(origin),backup=await producer.createProgressBackup(target),m=realm();
 const journal=await m.prepareRestoreJournal(before,backup,origin),destination=JSON.parse(JSON.parse(journal).payload).target;
 const memory=new Map(Object.entries(before).map(([part,value])=>[producer.STORE_KEYS[part],value]));memory.set('unrelated-preference','preserved');
 const manager=lockManager(),writes=[];let boundary=0,stopAt=0;
 const readOnly={getItem:key=>memory.get(key)??null};
 const storage={...readOnly,setItem:(key,value)=>{assert.equal(manager.writer,true);if(++boundary===stopAt)throw Error('simulated interruption');writes.push([key,value]);memory.set(key,value);},removeItem:key=>{assert.equal(manager.writer,true);if(++boundary===stopAt)throw Error('simulated interruption');writes.push([key,null]);memory.delete(key);}};
 function context(){return {origin,locks:manager,otherTabsClosed:true,storage:()=>storage};}
 function normalDocument(){
  const m=realm(),life=deferred(),blocked=[];let running,store,loads=0;
  return {m,blocked,get loads(){return loads;},get store(){return store;},async enter(){
   running=m.startProgressSession({storage:()=>readOnly,locks:manager,lifetime:life.promise,blocked:reason=>blocked.push(reason),load:async()=>{assert.ok(manager.readers>0);loads++;store=fixture([],memory);}});
   await tick();
  },async close(){life.resolve();await running;}};
 }
 const operation={mode:'apply',journal,previousBackup,replacementConfirmed:true};
 const pair=()=>Object.fromEntries(Object.entries(producer.STORE_KEYS).map(([part,key])=>[part,memory.get(key)??null]));
 function assertHydrated(document,expected){
  assert.equal(document.loads,1);const f=document.store;
  assert.equal(f.core.persist.hasHydrated(),true);assert.equal(f.fitness.persist.hasHydrated(),true);
  const c=JSON.parse(expected.core).state,n=JSON.parse(expected.fitness).state;
  const current=f.core.getState();assert.equal(current.user.id,c.user.id);assert.equal(current.currentAccountId,first.id);
  for(const key of ['xp_fire','xp_earth','xp_water','xp_air'])assert.equal(current.user[key],c.user[key],key);
  for(const key of ['tasks','habits','drafts','executionLogs'])assert.deepEqual(json(current[key]),c[key],key);
  assert.equal(current.accountDataById[second.id].drafts[0].title,'Ideia do segundo perfil');
  assert.deepEqual(json(f.fitness.getState().nativeDataById),n.nativeDataById);
  assert.deepEqual(json(f.fitness.getState().nativeHistory),n.nativeDataById[first.id].nativeHistory);
  for(const [id,data] of Object.entries(n.accountDataById))for(const key of ['sessions','workouts','bodyMeasurements','ratings','strengthRecords','gamificationLedger','strengthProgressPoints','strengthStat'])assert.deepEqual(json(f.fitness.getState().accountDataById[id][key]),data[key],`${id}.${key}`);
  assert.equal(memory.get('unrelated-preference'),'preserved');
 }
 return {m,producer,memory,manager,writes,readOnly,storage,context,operation,targetBackup:backup,before,destination,pair,normalDocument,assertHydrated,interruptAt(step){boundary=0;stopAt=step;},resume(){stopAt=0;}};
}

test('two hydrated realms block replacement until both leases end; committed import blocks fresh normal startup',async()=>{
 const f=await setup(),a=f.normalDocument(),b=f.normalDocument();await a.enter();await b.enter();assert.equal(f.manager.readers,2);
 assert.ok(a.store.core!==b.store.core);assert.equal(a.m.hasProgressAppStarted(),true);assert.equal(b.m.hasProgressAppStarted(),true);
 for(const stillOpen of [2,1]){
  const before=[...f.memory];await assert.rejects(realm().runExclusiveRestore(f.context(),f.operation),/outra aba/);
  assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,0);assert.equal(f.manager.readers,stillOpen);
  if(stillOpen===2)await a.close();
 }
 await b.close();assert.equal(f.manager.readers,0);
 // Renew the baseline after ordinary hydration, with a new verified safety copy.
 const raw=f.pair(),writer=realm(),previousBackup=await f.producer.createProgressBackup(writer.validateStoredProgress(raw,origin));
 const journal=await writer.prepareRestoreJournal(raw,f.targetBackup,origin);
 assert.equal(await writer.runExclusiveRestore(f.context(),{...f.operation,journal,previousBackup}),'applied');assert.deepEqual(f.pair(),f.destination);
 for(let reload=0;reload<2;reload++){const document=f.normalDocument(),before=[...f.memory];await document.enter();assert.equal(document.loads,0);assert.deepEqual(document.blocked,['pending-restore']);assert.deepEqual([...f.memory],before);await document.close();}
});

test('write interruptions block mixed hydration; rollback permits old data while committed import remains isolated',async()=>{
 for(let step=1;step<=5;step++){
  const f=await setup();f.interruptAt(step);if(step===5)await f.m.runExclusiveRestore(f.context(),f.operation);else await assert.rejects(f.m.runExclusiveRestore(f.context(),f.operation),/simulated interruption/);f.resume();
  const writesBefore=f.writes.length,document=f.normalDocument();await document.enter();
  if(step===1){assert.equal(document.loads,1);f.assertHydrated(document,f.before);await document.close();continue;}
  assert.equal(document.loads,0);assert.deepEqual(document.blocked,['pending-restore']);assert.equal(f.writes.length,writesBefore);assert.equal(f.manager.readers,0);await document.close();
  const recovery=realm(),review=await recovery.reviewPendingRestore(f.readOnly,origin);
  assert.equal(recovery.hasProgressAppStarted(),false);assert.equal(review.outcome,step===5?'keep-target':'rollback');
  assert.equal(await recovery.runExclusiveRestore(f.context(),{mode:'recover',expected:review.baseline,recoveryConfirmed:true}),step===5?'committed':'rolled-back');
  const expected=step===5?f.destination:f.before;assert.deepEqual(f.pair(),expected);assert.equal(f.memory.has(recovery.RESTORE_JOURNAL_KEY),step===5);
  for(let reload=0;reload<2;reload++){const next=f.normalDocument();await next.enter();if(step===5){assert.equal(next.loads,0);assert.deepEqual(next.blocked,['pending-restore']);}else f.assertHydrated(next,expected);await next.close();}
 }
});

test('normal import is denied during replacement and the committed handoff remains protected after the writer releases',async()=>{
 const f=await setup(),pending=f.m.runExclusiveRestore(f.context(),f.operation),blocked=f.normalDocument();
 await blocked.enter();assert.equal(blocked.loads,0);assert.deepEqual(blocked.blocked,['busy']);await blocked.close();assert.equal(await pending,'applied');
 const fresh=f.normalDocument();await fresh.enter();assert.equal(fresh.loads,0);assert.deepEqual(fresh.blocked,['pending-restore']);assert.deepEqual(f.pair(),f.destination);await fresh.close();
});

test('interruption during rollback retains startup protection and requires a new review after partial recovery',async()=>{
 for(let step=1;step<=3;step++){
  const f=await setup();f.interruptAt(4);await assert.rejects(f.m.runExclusiveRestore(f.context(),f.operation),/simulated interruption/);f.resume();
  const recovery=realm(),review=await recovery.reviewPendingRestore(f.readOnly,origin),operation={mode:'recover',expected:review.baseline,recoveryConfirmed:true};
  f.interruptAt(step);await assert.rejects(recovery.runExclusiveRestore(f.context(),operation),/simulated interruption/);f.resume();
  const document=f.normalDocument(),count=f.writes.length;await document.enter();assert.equal(document.loads,0);assert.deepEqual(document.blocked,['pending-restore']);assert.equal(f.writes.length,count);await document.close();
  if(step>1){const before=[...f.memory];await assert.rejects(realm().runExclusiveRestore(f.context(),operation),/mudou/);assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);}
  const fresh=realm(),updated=await fresh.reviewPendingRestore(f.readOnly,origin);
  assert.equal(await fresh.runExclusiveRestore(f.context(),{mode:'recover',expected:updated.baseline,recoveryConfirmed:true}),'rolled-back');assert.deepEqual(f.pair(),f.before);
  const next=f.normalDocument();await next.enter();f.assertHydrated(next,f.before);await next.close();
 }
});

test('a document that already hydrated cannot become a recovery writer even after its simulated lease ends',async()=>{
 const f=await setup(),document=f.normalDocument();await document.enter();await document.close();const before=[...f.memory];
 await assert.rejects(document.m.runExclusiveRestore(f.context(),f.operation),/já foi iniciado/);assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,0);
});

test('lifecycle coordinator graph has no eager stores, auth, network services or UI imports',()=>{
 const files=Object.keys(output.metafile.inputs);assert.ok(files.some(name=>name.endsWith('progress-startup.ts')));
 assert.ok(files.every(name=>!name.includes('/stores/')&&!name.includes('/services/')&&!name.includes('/components/')));
});
