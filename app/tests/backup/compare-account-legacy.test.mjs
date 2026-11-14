import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { compareAccountLegacy } from '../../scripts/compare-account-legacy.mjs';

test('legacy comparison is read-only and distinguishes matching IDs from changed payloads', () => {
  const dir=mkdtempSync(join(tmpdir(),'account-legacy-'));
  try {
    const core={tasks:[{id:'task-a',title:'same'},{id:'task-b',title:'local'}],habits:[],projects:[],quests:[],drafts:[],cycleSequences:[],sequenceMemberships:[],actions:[{}],executionLogs:[{}]};
    const snapshot={appVersion:'0.1.145',stores:{core:{state:core},fitness:{state:{accountDataById:{local:{workouts:[{}],sessions:[{}]}},nativeDataById:{local:{nativeHistory:[{}]}}}}}};
    const backup={...snapshot,checksum:{algorithm:'SHA-256',value:createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')}};
    const legacy={profiles:[],custom_areas:[],custom_subareas:[],tasks:[{local_id:'task-a',payload:{title:'same',id:'task-a'}},{local_id:'task-b',payload:{id:'task-b',title:'online'}}],habits:[],projects:[],quests:[],drafts:[],cycle_sequences:[],sequence_memberships:[]};
    const localFile=join(dir,'local.json'),remoteFile=join(dir,'remote.csv');
    writeFileSync(localFile,JSON.stringify(backup));writeFileSync(remoteFile,'snapshot\n"'+JSON.stringify(legacy).replaceAll('"','""')+'"\n');
    const result=compareAccountLegacy(localFile,remoteFile);
    assert.deepEqual(result.categories.tasks,{identical:1,changed:1,onlyLocal:0,onlyOnline:0});
    assert.deepEqual(result.localOnly,{actions:1,executionLogs:1,commitments:undefined,xp:0,workouts:1,sessions:1,nativeHistory:1});
    writeFileSync(localFile,JSON.stringify({...backup,appVersion:'changed'}));
    assert.throws(()=>compareAccountLegacy(localFile,remoteFile),/checksum differs/);
  } finally { rmSync(dir,{recursive:true,force:true}); }
});
