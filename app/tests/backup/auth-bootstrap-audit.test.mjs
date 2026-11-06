import test from 'node:test';
import assert from 'node:assert/strict';
import {authFixture,authGraph,settle,gate} from './load-auth-sync.mjs';
const session={user:{id:'synthetic-remote-a'}};
const cloudDraft={id:'database-row',user_id:session.user.id,local_id:'remote-draft',payload:{id:'remote-draft',title:'Ideia remota',notes:'',createdAt:'2026-10-29T12:00:00Z'}};
const writes=f=>f.calls.filter(c=>['upsert','delete'].includes(c.operation));

// Characterization of CURRENT behavior, not acceptance criteria for safe restore.
// All requests go to a synthetic in-memory client; actual auth/service source is used.
test('disabled auth performs no client calls; an absent session performs no domain query',async()=>{
 for(const options of [{enabled:false},{session:null}]){
  const f=authFixture(options),before=[...f.local.memory];await f.useAuthStore.getState().initialize();assert.equal(f.useAuthStore.getState().isInitialized,true);
  assert.equal(f.calls.filter(c=>c.table).length,0);assert.equal(f.calls.filter(c=>c.operation==='getSession').length,options.enabled===false?0:1);assert.deepEqual([...f.local.memory],before);assert.equal(f.timers.size,0);
 }
 assert.ok(!authGraph.some(p=>p.endsWith('/lib/supabase.ts')));assert.ok(authGraph.some(p=>p.endsWith('/stores/authStore.ts')));assert.ok(authGraph.some(p=>p.endsWith('/services/supabaseCloudSync.ts')));
});

test('saved session immediately hydrates existing cloud data over local content without replacement consent',async()=>{
 const f=authFixture();f.db.set('drafts',[cloudDraft]);const id=f.local.core.getState().drafts[0].id;
 await f.useAuthStore.getState().initialize();assert.ok(f.calls.some(c=>c.table==='drafts'&&c.operation==='select'));
 assert.equal(f.local.core.getState().drafts[0].id,'remote-draft');assert.ok(!f.local.core.getState().drafts.some(d=>d.id===id));assert.equal(writes(f).length,0);
 await f.close();
});

test('new cloud user with no profile/data resets local activity; existing cloud identity preserves it',async()=>{
 for(const sameIdentity of [false,true]){
  const f=authFixture({profile:false});if(sameIdentity)f.local.core.setState(s=>({user:{...s.user,id:'user-'+session.user.id}}));
  const draftId=f.local.core.getState().drafts[0].id;await f.useAuthStore.getState().initialize();
  assert.equal(f.local.core.getState().drafts.some(d=>d.id===draftId),sameIdentity);assert.equal(f.local.core.getState().user.id,'user-'+session.user.id);await f.close();
 }
});

test('local changes after initialization schedule writes; focus and visibility can refresh domain data',async()=>{
 const f=authFixture();await f.useAuthStore.getState().initialize();f.local.core.getState().addDraft('Alteração local','');
 assert.ok([...f.timers.values()].some(timer=>timer.delay===900));await f.runTimers();assert.ok(writes(f).some(c=>c.table==='drafts'));
 f.db.set('drafts',[cloudDraft]);await f.focus();assert.equal(f.local.core.getState().drafts[0].id,'remote-draft');
 f.db.set('drafts',[{...cloudDraft,local_id:'second-cloud',payload:{...cloudDraft.payload,id:'second-cloud'}}]);await f.visibility('visible');assert.equal(f.local.core.getState().drafts[0].id,'second-cloud');await f.close();
});

test('in-flight cloud refresh can finish changing local data after successful sign-out',async()=>{
 const f=authFixture();await f.useAuthStore.getState().initialize();f.db.set('drafts',[cloudDraft]);
 const pending=gate();let reached=false;f.hooks.beforeQuery=async q=>{if(q.table==='profiles'&&q.operation==='select'){reached=true;await pending.promise;}};
 const refresh=f.focus();await settle();assert.equal(reached,true);await f.useAuthStore.getState().signOut();assert.equal(f.useAuthStore.getState().user,null);
 pending.resolve();await refresh;await settle();assert.equal(f.useAuthStore.getState().user,null);assert.equal(f.local.core.getState().drafts[0].id,'remote-draft');
});

test('failed initial cloud read still installs autosync that can later publish local content',async()=>{
 const f=authFixture();let fail=true;f.hooks.beforeQuery=async q=>{if(fail&&q.table==='profiles'&&q.operation==='select'){fail=false;return {message:'synthetic read failure'};}};
 await f.useAuthStore.getState().initialize();assert.match(f.useAuthStore.getState().errorMessage,/synthetic read failure/);
 f.local.core.getState().addDraft('Após falha de leitura','');await f.runTimers();assert.ok(writes(f).some(c=>c.table==='drafts'));await f.close();
});

test('cloud fingerprint and payload do not cover standalone XP, execution ledger, Fitness or other local profiles',async()=>{
 const f=authFixture();await f.useAuthStore.getState().initialize();const before=f.getCloudSyncFingerprint();
 f.local.core.setState(s=>({user:{...s.user,xp_fire:s.user.xp_fire+7}}));f.local.fitness.getState().addBodyMeasurement({weightKg:70});
 assert.equal(f.getCloudSyncFingerprint(),before);assert.equal(f.timers.size,0);
 await f.persistAppStoreToCloud(session.user.id);const changes=writes(f);assert.ok(changes.length);
 assert.ok(changes.every(c=>!['workouts','workout_sessions','execution_logs','accounts'].includes(c.table)));
 const profile=changes.find(c=>c.table==='profiles').rows[0];assert.deepEqual(Object.keys(profile).sort(),['avatar','display_name','id']);
 assert.ok(!changes.some(c=>JSON.stringify(c.rows??[]).includes('xp_fire')));await f.close();
});

test('switching local profile can schedule its content for the same authenticated remote user',async()=>{
 const f=authFixture();const first=f.local.core.getState().createAccount('Perfil local A',true);
 await f.useAuthStore.getState().initialize();const second=f.local.core.getState().createAccount('Perfil local B',false);
 f.local.core.getState().addDraft('Ideia exclusiva do perfil B','');await f.runTimers();
 assert.notEqual(first.id,second.id);assert.equal(f.local.core.getState().currentAccountId,second.id);
 const rows=writes(f).filter(c=>c.table==='drafts').flatMap(c=>c.rows);
 assert.ok(rows.some(row=>row.payload.title==='Ideia exclusiva do perfil B'&&row.user_id===session.user.id));
 assert.ok(f.local.core.getState().accountDataById[first.id].drafts.some(d=>d.title==='Ideia local preservada'));await f.close();
});

test('token refresh avoids immediate pull but reattaches focus sync; concurrent initialize can duplicate bootstrap reads',async()=>{
 const f=authFixture();await f.useAuthStore.getState().initialize();let before=f.calls.length;
 await f.emit('TOKEN_REFRESHED',session);assert.equal(f.calls.length,before);await f.focus();assert.ok(f.calls.length>before);await f.close();
 const g=authFixture(),pending=gate();g.hooks.beforeSession=()=>pending.promise;
 const a=g.useAuthStore.getState().initialize(),b=g.useAuthStore.getState().initialize();assert.equal(g.calls.filter(c=>c.operation==='getSession').length,2);
 pending.resolve();await Promise.all([a,b]);assert.equal(g.calls.filter(c=>c.table==='profiles'&&c.operation==='select').length,2);await g.close();
});
