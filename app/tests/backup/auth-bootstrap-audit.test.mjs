import test from 'node:test';
import assert from 'node:assert/strict';
import {authFixture} from './load-auth-sync.mjs';
const session={user:{id:'synthetic-remote-a'}};
const cloudDraft={id:'database-row',user_id:session.user.id,local_id:'remote-draft',payload:{id:'remote-draft',title:'Ideia remota',notes:'',createdAt:'2026-10-29T12:00:00Z'}};
const writes=f=>f.calls.filter(c=>['upsert','delete'].includes(c.operation));

// The old authStore bootstrap cases (initialize, autosync timers, focus/visibility refresh,
// sign-out races, token refresh) were removed in LOTE 8 with the store itself.
test('cloud fingerprint and payload do not cover standalone XP, execution ledger, Fitness or other local profiles',async()=>{
 const f=authFixture();const before=f.getCloudSyncFingerprint();
 f.local.core.setState(s=>({user:{...s.user,xp_fire:s.user.xp_fire+7}}));f.local.fitness.getState().addBodyMeasurement({weightKg:70});
 assert.equal(f.getCloudSyncFingerprint(),before);
 await f.persistAppStoreToCloud(session.user.id);const changes=writes(f);assert.ok(changes.length);
 assert.ok(changes.every(c=>!['workouts','workout_sessions','execution_logs','accounts'].includes(c.table)));
 const profile=changes.find(c=>c.table==='profiles').rows[0];assert.deepEqual(Object.keys(profile).sort(),['avatar','display_name','id']);
 assert.ok(!changes.some(c=>JSON.stringify(c.rows??[]).includes('xp_fire')));await f.close();
});
