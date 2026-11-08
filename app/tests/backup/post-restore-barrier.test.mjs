import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {webcrypto} from 'node:crypto';
import {fixture} from './load-progress.mjs';
import {authFixture} from './load-auth-sync.mjs';
const bundle=await build({stdin:{contents:`export * from './src/lib/backup/restore-journal';export * from './src/lib/backup/progress-startup';export * from './src/lib/backup/exclusive-restore';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',write:false,logLevel:'silent'});
function realm(){const m={exports:{}};new Function('module','exports','crypto',bundle.outputFiles[0].text)(m,m.exports,webcrypto);return m.exports;}
const origin='http://fixture.test';
async function setup(){
 const f=fixture();f.core.getState().addDraft('Anterior','');const snapshot=f.captureProgress(origin),previousBackup=await f.createProgressBackup(snapshot);
 const before=Object.fromEntries(Object.entries(snapshot.stores).map(([part,data])=>[part,JSON.stringify({state:data.state,version:data.version})]));
 f.core.getState().addDraft('Importado','');f.core.getState().addElementExperience('ar',7);f.fitness.getState().addBodyMeasurement({weightKg:70});const targetBackup=await f.createProgressBackup(f.captureProgress(origin));
 const m=realm(),journal=await m.prepareRestoreJournal(before,targetBackup,origin),target=JSON.parse(await m.decodeRestoreJournalPayload(JSON.parse(journal).payload)).target;
 const memory=new Map(Object.entries(before).map(([part,value])=>[f.STORE_KEYS[part],value])),writes=[];let hook=()=>{};
 const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>{hook('before',key);memory.set(key,value);writes.push([key,value]);hook('after',key);},removeItem:key=>{hook('before',key);memory.delete(key);writes.push([key,null]);hook('after',key);}};
 const context={origin,otherTabsClosed:true,storage:()=>storage,locks:{request:async(_,options,fn)=>fn({mode:options.mode})}};
 const operation={mode:'apply',journal,previousBackup,replacementConfirmed:true};
 return {f,m,memory,writes,storage,before,target,context,operation,inject(fn){hook=fn;}};
}
async function attemptNormalStartup(storage){
 const m=realm(),blocked=[];let auth;
 await m.startProgressSession({storage:()=>storage,lifetime:Promise.resolve(),blocked:reason=>blocked.push(reason),load:async()=>{auth=authFixture();await auth.useAuthStore.getState().initialize();await auth.close();}});
 return {m,blocked,auth};
}

test('confirmed restore retains its barrier across reload before auth initialization without changing backend behavior',async()=>{
 const f=await setup();assert.equal(await f.m.runExclusiveRestore(f.context,f.operation),'applied');
 const raw=f.storage.getItem(f.m.RESTORE_JOURNAL_KEY);assert.equal(JSON.parse(await f.m.decodeRestoreJournalPayload(JSON.parse(raw).payload)).phase,'committed');
 const before=[...f.memory],count=f.writes.length;
 for(let reload=0;reload<3;reload++){
  const app=await attemptNormalStartup(f.storage);assert.deepEqual(app.blocked,['pending-restore']);assert.equal(app.auth,undefined);assert.equal(app.m.hasProgressAppStarted(),false);
 }
 assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);
});

test('review, protected copies and repeated committed recovery cannot release cloud isolation or roll back confirmed XP',async()=>{
 const f=await setup();await f.m.runExclusiveRestore(f.context,f.operation);const before=[...f.memory],count=f.writes.length;
 for(let i=0;i<2;i++){
  const m=realm(),review=await m.reviewPendingRestore(f.storage,origin);assert.equal(review.outcome,'keep-target');
  for(const side of ['before','target'])await f.f.inspectProgressBackup(await m.createRecoverySafetyCopy(f.storage,review,side,origin));
  assert.equal(await m.runExclusiveRestore(f.context,{mode:'recover',expected:review.baseline,recoveryConfirmed:true}),'committed');
 }
 assert.deepEqual([...f.memory],before);assert.equal(f.writes.length,count);assert.deepEqual(f.writes.map(([key])=>key),[f.m.RESTORE_JOURNAL_KEY,f.f.STORE_KEYS.core,f.f.STORE_KEYS.fitness,f.m.RESTORE_JOURNAL_KEY]);
 assert.equal(JSON.parse(f.storage.getItem(f.f.STORE_KEYS.core)).state.user.xp_air,7);
});

test('failure before and after every application write leaves either untouched old data or a startup barrier',async()=>{
 for(const side of ['before','after'])for(let step=1;step<=4;step++){
  const f=await setup();let n=0;f.inject(when=>{if(when===side&&++n===step)throw Error('interruption');});
  await assert.rejects(f.m.runExclusiveRestore(f.context,f.operation),/interruption/);f.inject(()=>{});
  const journal=f.storage.getItem(f.m.RESTORE_JOURNAL_KEY);
  if(journal===null){assert.equal(side,'before');assert.equal(step,1);assert.equal(f.storage.getItem(f.f.STORE_KEYS.core),f.before.core);assert.equal(f.storage.getItem(f.f.STORE_KEYS.fitness),f.before.fitness);continue;}
  const app=await attemptNormalStartup(f.storage);assert.equal(app.auth,undefined);assert.deepEqual(app.blocked,['pending-restore']);
  const m=realm(),review=await m.reviewPendingRestore(f.storage,origin);
  await m.runExclusiveRestore(f.context,{mode:'recover',expected:review.baseline,recoveryConfirmed:true});
  assert.equal(f.storage.getItem(m.RESTORE_JOURNAL_KEY)!==null,side==='after'&&step===4);
 }
});

test('prepared rollback releases only after exact old bytes are restored; committed conflict stays protected',async()=>{
 const f=await setup();let n=0;f.inject(when=>{if(when==='before'&&++n===4)throw Error('interruption');});
 await assert.rejects(f.m.runExclusiveRestore(f.context,f.operation));f.inject(()=>{});const review=await f.m.reviewPendingRestore(f.storage,origin);
 assert.equal(await f.m.runExclusiveRestore(f.context,{mode:'recover',expected:review.baseline,recoveryConfirmed:true}),'rolled-back');
 assert.equal(f.storage.getItem(f.m.RESTORE_JOURNAL_KEY),null);assert.equal(f.storage.getItem(f.f.STORE_KEYS.core),f.before.core);assert.equal(f.storage.getItem(f.f.STORE_KEYS.fitness),f.before.fitness);
 const g=await setup();await g.m.runExclusiveRestore(g.context,g.operation);g.memory.set(g.f.STORE_KEYS.core,'unexpected edit');const raw=[...g.memory],count=g.writes.length;
 const conflict=await g.m.reviewPendingRestore(g.storage,origin);assert.equal(conflict.outcome,'conflict');
 await assert.rejects(g.m.runExclusiveRestore(g.context,{mode:'recover',expected:conflict.baseline,recoveryConfirmed:true}),/alterado/);
 assert.deepEqual([...g.memory],raw);assert.equal(g.writes.length,count);assert.equal((await attemptNormalStartup(g.storage)).auth,undefined);
});
