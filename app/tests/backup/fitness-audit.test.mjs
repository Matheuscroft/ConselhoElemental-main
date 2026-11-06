import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const exercise={id:id(1),exerciseId:id(2),exerciseNameSnapshot:'Exercício sintético',order:0,sets:[{id:id(3),setNumber:1,measureMode:'reps',targetReps:10,targetLoadKg:5,completed:false,restSeconds:30}]};
async function seed(){
 const f=fixture();const w=f.fitness;
 const template=w.getState().saveTemplate({name:'Plano sintético',source:'custom',modality:'strength',estimatedDurationMinutes:10,exercises:[exercise]});assert.ok(template);
 const session=w.getState().startSession(template.id);assert.ok(session);
 const e=session.exerciseResults[0];assert.ok(w.getState().logSet(e.id,e.sets[0].id,{completed:true,reps:10,loadKg:5}));
 assert.ok(w.getState().finishSession());
 // Keep another session active to exercise both persisted paths.
 assert.ok(w.getState().startSession(template.id));
 const legacy=w.getState().createWorkout({name:'Plano legado',category:'strength',exercises:[]});assert.ok(legacy);
 const active=w.getState().startWorkout(legacy.id);assert.ok(active);assert.ok(w.getState().finishWorkout(active.id));
 w.getState().addBodyMeasurement({weightKg:70,heightCm:170});
 const {backup}=await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://fixture.test')));
 return {f,backup};
}
const native=b=>b.stores.fitness.state.nativeDataById.local;
const legacy=b=>b.stores.fitness.state.accountDataById.local;

test('expanded remote catalogues roundtrip through the local backup without dropping descriptive profiles or new muscle tags',async()=>{
 const f=fixture();f.fitness.getState().ensureNativeCatalog();
 const captured=f.captureProgress('http://fixture.test');assert.deepEqual(f.auditCriticalProgress(captured),{issues:[],truncated:false});
 const archive=await f.createProgressBackup(captured),{backup}=await f.inspectProgressBackup(archive);
 assert.deepEqual(f.auditCriticalProgress(backup),{issues:[],truncated:false});
 const entries=legacy(backup).exercisesCatalog;
 assert.ok(entries.length>200);assert.equal(new Set(entries.map(e=>e.id)).size,entries.length);
 for(const group of ['obliques','serratus','tibialis'])assert.ok(entries.some(e=>e.primaryMuscles?.includes(group)),group);
 assert.ok(entries.some(e=>e.yogaProfile?.sourceReferences?.length));assert.ok(entries.some(e=>e.strengthProfile?.equipmentIds?.length));
 const nativeCatalog=native(backup).nativeCatalog;assert.ok(nativeCatalog.length>=entries.length);for(const item of entries)assert.ok(nativeCatalog.some(e=>e.legacyId===item.id),item.id);
 const ids=native(backup).nativeCatalog.map(e=>[e.id,e.legacyId]);
 f.fitness.getState().ensureNativeCatalog();await f.fitness.persist.rehydrate();
 assert.deepEqual(f.fitness.getState().nativeCatalog.map(e=>[e.id,e.legacyId]),ids);
 assert.deepEqual(JSON.parse(JSON.stringify(captured.stores.fitness.state)),backup.stores.fitness.state);
 for(const corrupt of [e=>e.primaryMuscles=['unknown'],e=>e.equipment=null,e=>e.source='unknown']){
   const broken=structuredClone(backup);corrupt(legacy(broken).exercisesCatalog[0]);assert.ok(f.auditCriticalProgress(broken).issues.length);
 }
});

test('real native and legacy commands produce accepted snapshots without recalculation or writes',async()=>{
 const {f,backup}=await seed();const baseline=JSON.stringify(backup),memory=[...f.memory];
 assert.deepEqual(f.auditCriticalProgress(backup),{issues:[],truncated:false});
 assert.equal(JSON.stringify(backup),baseline);assert.deepEqual([...f.memory],memory);
});

test('native series validate IDs, quantities, measurement modes, flags and optional RPE',async()=>{
 const {f,backup}=await seed();
 for(const change of [s=>s.reps=-1,s=>s.setNumber=0,s=>s.durationSeconds=30,s=>s.perceivedExertion=11,s=>s.loadFactor=4,s=>s.completed='true',s=>s.skipped=true,s=>s.id='bad']){
  const b=structuredClone(backup);change(native(b).nativeHistory[0].exerciseResults[0].sets[0]);
  assert.ok(f.auditCriticalProgress(b).issues.length>0);
 }
 const old=structuredClone(backup);delete native(old).nativeHistory[0].exerciseResults[0].sets[0].perceivedExertion;
 assert.equal(f.auditCriticalProgress(old).issues.length,0);
});

test('active sessions, check-ins and inactive account maps are audited without requiring deleted templates',async()=>{
 const {f,backup}=await seed();const b=structuredClone(backup);
 native(b).templates=[];assert.equal(f.auditCriticalProgress(b).issues.length,0); // historical snapshot remains valid
 native(b).activeNativeSession.durationSeconds='bad';
 native(b).nativeCheckins[id(10)]={...native(b).nativeHistory[0],earnedXp:-1};
 b.stores.fitness.state.nativeDataById.inactive=structuredClone(native(backup));
 b.stores.fitness.state.nativeDataById.inactive.nativeHistory[0].startedAt='bad';
 const findings=f.auditCriticalProgress(b).issues;
 for(const path of ['activeNativeSession','nativeCheckins','inactive'])assert.ok(findings.some(i=>i.path.includes(path)),path);
});

test('session snapshots and receipt correlations fail without silently correcting rewards',async()=>{
 const {f,backup}=await seed();
 for(const change of [s=>s.earnedXp='2',s=>s.totalER=-1,s=>s.status='unknown',s=>delete s.completedAt,s=>s.exerciseResults=null,s=>s.coreExecutionLogId=id(99)]){
  const b=structuredClone(backup),s=native(b).nativeHistory[0];
  assert.ok(s.coreReceipt);change(s);assert.ok(f.auditCriticalProgress(b).issues.length>0);
 }
 const valid=structuredClone(backup);delete native(valid).nativeHistory[0].earnedXp;delete native(valid).nativeHistory[0].coreReceipt;
 assert.equal(f.auditCriticalProgress(valid).issues.length,0); // optional on old native history
});

test('legacy nested sets, ledger and measurements keep their own schema',async()=>{
 const {f,backup}=await seed(),b=structuredClone(backup),data=legacy(b);
 data.sessions[0].exerciseResults=[{exerciseId:'legacy-exercise',exerciseNameSnapshot:'Legado',order:0,muscleDistribution:[],sets:[{id:'legacy-set',setNumber:1,loadKg:5,reps:10,durationSeconds:0,completed:true,effectiveLoadKg:5,volume:50,formulaVersion:'legacy'}]}];
 assert.equal(f.auditCriticalProgress(b).issues.length,0); // legacy does not use native measureMode
 data.sessions[0].exerciseResults[0].sets[0].volume=-1;
 data.bodyMeasurements[0].measuredAt='bad';
 data.gamificationLedger=[{id:'ledger',sessionId:data.sessions[0].id,formulaVersion:'legacy',appliedAt:'2026-10-28T12:00:00Z',earthPoints:1,xpAwarded:-1,totalScoreDelta:1,staminaCost:0,pranaCost:0,strengthGain:0}];
 const issues=f.auditCriticalProgress(b).issues;
 for(const part of ['sets','bodyMeasurements','gamificationLedger'])assert.ok(issues.some(i=>i.path.includes(part)),part);
});

test('malformed internal lists and duplicate native series are reported, not dropped',async()=>{
 const {f,backup}=await seed();const b=structuredClone(backup),n=native(b);
 n.templates[0].exercises[0].sets.push({...n.templates[0].exercises[0].sets[0]});
 n.sequences=[{id:id(30),name:'Sequência',templateIds:[id(31),id(31)],createdAt:'2026-10-28T12:00:00Z',updatedAt:'2026-10-28T12:00:00Z'}];
 n.activeNativeSession.exerciseResults[0].sets={};
 const before=JSON.stringify(b),issues=f.auditCriticalProgress(b).issues;
 for(const phrase of ['repetida','Sequência','Lista interna'])assert.ok(issues.some(i=>i.message.includes(phrase)),phrase);
 assert.equal(JSON.stringify(b),before);
});

async function metadataSeed() {
 const {f}=await seed();const w=f.fitness;
 w.getState().ensureNativeCatalog();
 assert.ok(w.getState().saveCustomExercise({name:'Mobilidade sintética',modality:'mobility',measureMode:'duration'}));
 const ref=w.getState().saveCustomExercise({name:'Força sintética',modality:'strength',measureMode:'reps'});assert.ok(ref);
 const plan=w.getState().createWorkout({name:'Força sintética',exercises:[{id:'planned',exerciseId:ref.id,order:0,sets:[{id:'planned-set',setNumber:1,targetLoadKg:10,targetReps:8,restSeconds:30}]}]});
 assert.ok(plan);const session=w.getState().startWorkout(plan.id);assert.ok(session);
 assert.ok(w.getState().completePerformedSet(session.id,session.exerciseResults[0].sets[0].id,{loadKg:10,reps:8}));
 assert.ok(w.getState().finishWorkout(session.id));assert.ok(w.getState().rateWorkout(session.id,4));
 assert.ok(w.getState().rateWorkout(w.getState().nativeHistory[0].id,5));
 const {backup}=await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://fixture.test')));
 assert.ok(legacy(backup).strengthRecords.length);assert.equal(legacy(backup).ratings.length,2);
 return {f,backup};
}

test('all generated catalogues, custom exercises, native and legacy ratings and strength records pass unchanged',async()=>{
 const {f,backup}=await metadataSeed(),before=JSON.stringify(backup),memory=[...f.memory];
 assert.ok(native(backup).nativeCatalog.length>1);
 assert.deepEqual(f.auditCriticalProgress(backup),{issues:[],truncated:false});
 assert.equal(JSON.stringify(backup),before);assert.deepEqual([...f.memory],memory);
});

test('catalogue validation handles malformed fields and preserves optional historical metadata',async()=>{
 const {f,backup}=await metadataSeed();
 for(const kind of ['native','legacy']){
  const entries=b=>kind==='native'?native(b).nativeCatalog:legacy(b).exercisesCatalog;
  for(const change of [e=>e.name='',e=>e.id='',e=>e.instructions={},e=>e.benefits=[4],e=>e.defaultLoadKg=-1,e=>e.defaultReps='10',e=>e.source='unknown',e=>e.measureMode='unknown',e=>e.muscleDistribution=[{muscleId:'core',percentage:101}],e=>e.primaryMuscles=[null],e=>e.equipment='none',e=>e.videoUrl={},e=>e[kind==='native'?'modality':'category']='unknown']){
   const b=structuredClone(backup);change(entries(b)[0]);const before=JSON.stringify(b);
   assert.ok(f.auditCriticalProgress(b).issues.length,kind);assert.equal(JSON.stringify(b),before);
  }
  const b=structuredClone(backup);entries(b).push(structuredClone(entries(b)[0]));assert.ok(f.auditCriticalProgress(b).issues.some(i=>i.message.includes('repetida')));
  const old=structuredClone(backup);for(const e of entries(old))for(const key of ['imageUrl','videoUrl','primaryMuscles','secondaryMuscles','legacyId','equipment'])delete e[key];
  assert.equal(f.auditCriticalProgress(old).issues.length,0);
 }
});

test('ratings and strength metadata report corrupt values, duplicate identities and inactive profiles',async()=>{
 const {f,backup}=await metadataSeed();
 for(const change of [d=>d.ratings=null,d=>d.ratings[0].stars=0,d=>d.ratings[0].stars=1.5,d=>d.ratings[0].sessionId='',d=>d.ratings[0].updatedAt='bad',d=>d.ratings.push({...d.ratings[0]}),d=>d.strengthRecords=null,d=>d.strengthRecords[0].gain=-1,d=>d.strengthRecords[0].bestReps=1.5,d=>d.strengthRecords[0].exerciseId='',d=>d.strengthRecords[0].isPersonalRecord='yes',d=>d.strengthRecords[0].recordedAt='bad',d=>d.strengthRecords.push({...d.strengthRecords[0]}),d=>d.strengthProgressPoints=-1,d=>d.strengthStat=0.5]){
  const b=structuredClone(backup);b.stores.fitness.state.accountDataById.inactive=structuredClone(legacy(b));change(b.stores.fitness.state.accountDataById.inactive);
  const before=JSON.stringify(b);assert.ok(f.auditCriticalProgress(b).issues.some(i=>i.path.includes('inactive')));assert.equal(JSON.stringify(b),before);
 }
});

test('historical ratings and strength records survive removed plans and session snapshots',async()=>{
 const {f,backup}=await metadataSeed(),w=f.fitness;
 w.getState().deleteTemplate(native(backup).templates[0].id);
 w.getState().deleteWorkout(legacy(backup).workouts.at(-1).id);
 const {backup:b}=await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://fixture.test')));
 // Model the persisted result of native cleanup: it does not remove legacy ratings.
 native(b).nativeHistory=[];
 assert.equal(native(b).templates.length,0);assert.equal(legacy(b).ratings.length,2);
 const before=JSON.stringify(b);assert.deepEqual(f.auditCriticalProgress(b),{issues:[],truncated:false});assert.equal(JSON.stringify(b),before);
});

async function linkedSessionSeed() {
 const f=fixture(),w=f.fitness;
 const template=w.getState().saveTemplate({name:'Treino diário sintético',source:'custom',modality:'strength',estimatedDurationMinutes:10,exercises:[exercise]});assert.ok(template);
 const habitId=w.getState().scheduleWorkoutAsHabit(template.id,[0,1,2,3,4,5,6]);assert.ok(habitId);
 w.getState().updateHabitCheckin(habitId,0,0,{completed:true,reps:10,loadKg:5});
 const capture=async()=>(await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://fixture.test')))).backup;
 return {f,w,template,habitId,capture};
}

test('real check-in, live execution, receipt, undo and deletion preserve identity without requiring old targets',async()=>{
 const {f,w,template,habitId,capture}=await linkedSessionSeed();
 assert.equal(f.auditCriticalProgress(await capture()).issues.length,0);
 assert.ok(w.getState().beginHabitWorkout(habitId));assert.equal(f.auditCriticalProgress(await capture()).issues.length,0);
 const done=w.getState().finishSession();assert.ok(done?.coreReceipt);
 assert.equal(f.auditCriticalProgress(await capture()).issues.length,0);
 w.getState().undoHabitWorkout(habitId,new Date());
 const undo=await capture();assert.equal(native(undo).nativeCheckins[habitId].status,'in_progress');assert.equal(f.auditCriticalProgress(undo).issues.length,0);
 w.getState().deleteTemplate(template.id);f.core.getState().deleteHabit(habitId);
 const after=await capture(),raw=JSON.stringify(after),memory=[...f.memory];
 assert.ok(native(after).nativeCheckins[habitId]);assert.equal(native(after).templates.length,0);
 assert.deepEqual(f.auditCriticalProgress(after),{issues:[],truncated:false});assert.equal(JSON.stringify(after),raw);assert.deepEqual([...f.memory],memory);
});

test('session identities and check-in keys cannot describe two different live states',async()=>{
 const {f,w,habitId,capture}=await linkedSessionSeed();const checkin=await capture();
 for(const change of [n=>n.nativeCheckins[habitId].coreHabitId=id(90),n=>n.nativeCheckins[habitId].status='completed',n=>n.nativeCheckins.wrong=n.nativeCheckins[habitId],n=>n.activeNativeSession=structuredClone(n.nativeCheckins[habitId])]){
  const b=structuredClone(checkin);change(native(b));const raw=JSON.stringify(b);assert.ok(f.auditCriticalProgress(b).issues.length);assert.equal(JSON.stringify(b),raw);
 }
 w.getState().beginHabitWorkout(habitId);w.getState().finishSession();const finished=await capture();
 for(const change of [n=>n.activeNativeSession={...n.nativeHistory[0],status:'in_progress'},n=>n.activeNativeSession={...n.nativeHistory[0],id:id(90)}]){
  const b=structuredClone(finished);change(native(b));assert.ok(f.auditCriticalProgress(b).issues.length);
 }
 // Identity is scoped to the profile; identical historical IDs in another profile are preserved.
 finished.stores.fitness.state.nativeDataById.inactive=structuredClone(native(finished));
 assert.equal(f.auditCriticalProgress(finished).issues.length,0);
});

test('native receipt links and execution metadata are checked without requiring a historical Core target',async()=>{
 const {f,w,capture}=await linkedSessionSeed();w.getState().beginHabitWorkout(Object.keys(w.getState().nativeCheckins)[0]);w.getState().finishSession();const backup=await capture();
 for(const change of [s=>s.coreReceipt.subjectId=id(91),s=>s.coreReceipt.sourceRefId=id(92),s=>s.coreReceipt.sourceModule='other',s=>s.coreReceipt.subjectType='ACTION',s=>s.coreEntityId=id(93),s=>s.effortLevel=6,s=>s.executionMode='other',s=>s.durationSource='other']){
  const b=structuredClone(backup);b.stores.fitness.state.nativeDataById.inactive=structuredClone(native(b));change(b.stores.fitness.state.nativeDataById.inactive.nativeHistory[0]);const raw=JSON.stringify(b);
  assert.ok(f.auditCriticalProgress(b).issues.some(i=>i.path.includes('inactive')));assert.equal(JSON.stringify(b),raw);
 }
 const old=structuredClone(backup),s=native(old).nativeHistory[0];
 for(const field of ['coreReceipt','executionMode','durationSource','effortLevel'])delete s[field];
 old.stores.core.state.executionLogs=[];
 assert.equal(f.auditCriticalProgress(old).issues.length,0);
});
