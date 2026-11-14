import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const sha256 = value => createHash('sha256').update(value).digest('hex');
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function jsonCell(text) {
  const input = text.replace(/^\uFEFF/, '').trim();
  try { return JSON.parse(input); } catch { /* Studio may export one JSON cell as CSV. */ }
  const lineEnd = input.indexOf('\n');
  if (lineEnd < 0 || !/^(snapshot|legacy_snapshot)\r?$/.test(input.slice(0, lineEnd))) {
    throw new Error('Expected a JSON result or a single snapshot column exported as CSV.');
  }
  const cell = input.slice(lineEnd + 1).trim();
  if (!cell.startsWith('"')) throw new Error('Expected a quoted JSON cell in the CSV export.');
  let decoded = '';
  for (let i = 1; i < cell.length; i++) {
    if (cell[i] === '"') {
      if (cell[i + 1] === '"') { decoded += '"'; i++; continue; }
      if (cell.slice(i + 1).trim()) throw new Error('The CSV export contains more than one data row.');
      return JSON.parse(decoded);
    }
    decoded += cell[i];
  }
  throw new Error('The CSV JSON cell is incomplete.');
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (record(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}

function indexed(rows, fromLegacy) {
  if (!Array.isArray(rows)) throw new Error('A compared category is not a list.');
  const result = new Map();
  for (const item of rows) {
    if (!record(item)) throw new Error('A compared row is not an object.');
    const value = fromLegacy ? item.payload : item;
    const id = fromLegacy ? item.local_id : item.id;
    if (typeof id !== 'string' || !id || !record(value) || value.id !== id || result.has(id)) {
      throw new Error('A compared row has a missing, mismatched or repeated ID.');
    }
    result.set(id, value);
  }
  return result;
}

export function readLegacySnapshot(file) {
  const downloaded = jsonCell(readFileSync(file, 'utf8'));
  const row = Array.isArray(downloaded) && downloaded.length === 1 ? downloaded[0] : downloaded;
  const legacy = record(row?.snapshot) ? row.snapshot
    : typeof row?.snapshot === 'string' ? JSON.parse(row.snapshot)
    : row;
  if (!record(legacy)) throw new Error('The legacy snapshot is incomplete.');
  return legacy;
}

export function compareAccountLegacy(localFile, legacyFile) {
  const backup = jsonCell(readFileSync(localFile, 'utf8'));
  if (!record(backup) || !record(backup.checksum) || backup.checksum.algorithm !== 'SHA-256') throw new Error('The local archive has no checksum.');
  const { checksum, ...snapshot } = backup;
  if (sha256(JSON.stringify(snapshot)) !== checksum.value) throw new Error('The local archive checksum differs.');
  const legacy = readLegacySnapshot(legacyFile);
  if (!record(legacy) || !record(snapshot.stores?.core?.state) || !record(snapshot.stores?.fitness?.state)) throw new Error('The archive or legacy snapshot is incomplete.');
  const core = snapshot.stores.core.state, fitness = snapshot.stores.fitness.state;
  if (core.accounts?.length || Object.keys(core.accountDataById ?? {}).length) throw new Error('Multiple local profiles require a profile-by-profile comparison.');
  for (const key of ['profiles','custom_areas','custom_subareas','tasks','habits','projects','quests','drafts','cycle_sequences','sequence_memberships']) {
    if (!Array.isArray(legacy[key])) throw new Error(`The legacy export is missing ${key}.`);
  }
  const output = { archiveVersion: snapshot.appVersion, checksumValid: true, categories: {}, localOnly: {
    actions: core.actions?.length, executionLogs: core.executionLogs?.length,
    commitments: core.commitments?.length,
    xp: ['xp_earth','xp_fire','xp_water','xp_air'].reduce((sum, key) => sum + (Number(core.user?.[key]) || 0), 0),
    workouts: Object.values(fitness.accountDataById ?? {}).reduce((sum, row) => sum + (row?.workouts?.length ?? 0), 0),
    sessions: Object.values(fitness.accountDataById ?? {}).reduce((sum, row) => sum + (row?.sessions?.length ?? 0), 0),
    nativeHistory: Object.values(fitness.nativeDataById ?? {}).reduce((sum, row) => sum + (row?.nativeHistory?.length ?? 0), 0),
  }, legacyCatalog: {
    areas: legacy.custom_areas?.filter(row => ['base-catalog','onboarding-selection'].includes(row?.metadata?.syncSource)).length ?? 0,
    subareas: legacy.custom_subareas?.filter(row => ['base-catalog','onboarding-selection'].includes(row?.metadata?.syncSource)).length ?? 0,
    customAreas: legacy.custom_areas?.filter(row => !['base-catalog','onboarding-selection'].includes(row?.metadata?.syncSource)).length ?? 0,
    customSubareas: legacy.custom_subareas?.filter(row => !['base-catalog','onboarding-selection'].includes(row?.metadata?.syncSource)).length ?? 0,
    localCustomAreas: core.customAreas?.length,
    localCustomSubareas: Object.values(core.customSubareas ?? {}).reduce((sum, entries) => sum + (Array.isArray(entries) ? entries.length : 0), 0),
  } };
  for (const [localKey, remoteKey] of Object.entries({tasks:'tasks',habits:'habits',projects:'projects',quests:'quests',drafts:'drafts',cycleSequences:'cycle_sequences',sequenceMemberships:'sequence_memberships'})) {
    const local = indexed(core[localKey], false), remote = indexed(legacy[remoteKey], true);
    const counts = { identical:0, changed:0, onlyLocal:0, onlyOnline:0 };
    for (const [id, value] of local) {
      if (!remote.has(id)) counts.onlyLocal++;
      else if (canonical(value) === canonical(remote.get(id))) counts.identical++;
      else counts.changed++;
    }
    for (const id of remote.keys()) if (!local.has(id)) counts.onlyOnline++;
    output.categories[localKey] = counts;
  }
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 4) throw new Error('Usage: node compare-account-legacy.mjs LOCAL_ARCHIVE REMOTE_SNAPSHOT');
  console.log(JSON.stringify(compareAccountLegacy(process.argv[2], process.argv[3]), null, 2));
}
