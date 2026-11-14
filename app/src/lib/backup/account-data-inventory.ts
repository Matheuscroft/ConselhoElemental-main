import type { SupabaseClient } from '@supabase/supabase-js';
import { inspectProgressBackup, STORE_KEYS, type ProgressSnapshot } from './progress-backup';
import { validateStoredProgress } from './stored-progress';

type Row = Record<string, unknown>;
export type InventoryKind = 'empty' | 'legacy' | 'snapshot';
export interface InventoryComparison { identical: number; changed: number; onlyLocal: number; onlyOnline: number; ambiguous: boolean }
export interface InventoryGroup { label: string; local: string[]; online: string[] | null; comparison?: InventoryComparison }
export interface AccountDataInventory {
  kind: InventoryKind;
  groups: InventoryGroup[];
  localXp: number;
  onlineXp: number | null;
  legacyCatalogAreas: number;
  legacyCatalogSubareas: number;
}

const record = (value: unknown): value is Row => !!value && typeof value === 'object' && !Array.isArray(value);
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const label = (value: unknown) => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (!record(value)) return 'Registro sem nome';
  for (const key of ['title', 'name', 'label', 'workoutName', 'taskTitle', 'description']) {
    const text = value[key];
    if (typeof text === 'string' && text.trim()) return text.trim();
  }
  return 'Registro sem nome';
};
const names = (value: unknown) => list(value).map(label);
const xp = (user: unknown) => record(user)
  ? ['xp_earth', 'xp_fire', 'xp_water', 'xp_air'].reduce((sum, key) => {
      const amount = user[key];
      return sum + (typeof amount === 'number' && Number.isFinite(amount) ? amount : 0);
    }, 0)
  : 0;

function snapshotNames(snapshot: ProgressSnapshot | null) {
  if (!snapshot) return { groups: new Map<string, string[]>(), rows: new Map<string, Row[]>(), xp: 0 };
  const core = snapshot.stores.core.state, fitness = snapshot.stores.fitness.state;
  const profiles = new Map<string, Row>();
  if (record(core.accountDataById)) for (const [id, data] of Object.entries(core.accountDataById)) {
    if (record(data)) profiles.set(id, data);
  }
  profiles.set(typeof core.currentAccountId === 'string' ? core.currentAccountId : 'local', core);
  const values = [...profiles.values()];
  const coreNames = (key: string) => values.flatMap(profile => names(profile[key]));
  const coreRows = (key: string) => values.flatMap(profile => list(profile[key]).filter(record));
  const subareas = values.flatMap(profile => record(profile.customSubareas)
    ? Object.values(profile.customSubareas).flatMap(names) : []);
  const workoutAccounts = record(fitness.accountDataById) ? Object.values(fitness.accountDataById).filter(record) : [];
  const nativeAccounts = record(fitness.nativeDataById) ? Object.values(fitness.nativeDataById).filter(record) : [];
  const groups = new Map<string, string[]>([
    ['tasks', coreNames('tasks')], ['habits', coreNames('habits')],
    ['actions', coreNames('actions')], ['executionLogs', coreNames('executionLogs')],
    ['projects', coreNames('projects')], ['quests', coreNames('quests')],
    ['drafts', coreNames('drafts')], ['cycleSequences', coreNames('cycleSequences')],
    ['customAreas', coreNames('customAreas')], ['customSubareas', subareas],
    ['workouts', workoutAccounts.flatMap(profile => names(profile.workouts))],
    ['sessions', workoutAccounts.flatMap(profile => names(profile.sessions))],
    ['nativeHistory', nativeAccounts.flatMap(profile => names(profile.nativeHistory))],
  ]);
  const rows = new Map(['tasks','habits','cycleSequences'].map(key => [key,coreRows(key)] as const));
  return { groups, rows, xp: values.reduce((sum, profile) => sum + xp(profile.user), 0) };
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (record(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
function compareRows(local: Row[], online: Row[], remoteId: string, remoteValue: string): InventoryComparison {
  const localById = new Map<string,Row>(), onlineById = new Map<string,Row>();
  let ambiguous = false;
  for (const row of local) {
    if (typeof row.id !== 'string' || localById.has(row.id)) ambiguous = true;
    else localById.set(row.id,row);
  }
  for (const row of online) {
    const id = row[remoteId];
    if (typeof id !== 'string' || onlineById.has(id)) ambiguous = true;
    else onlineById.set(id,row);
  }
  let identical = 0, changed = 0, onlyLocal = 0, onlyOnline = 0;
  for (const [id,row] of localById) {
    const remote = onlineById.get(id);
    if (!remote) { onlyLocal++; continue; }
    if (canonical(row) === canonical(remoteValue === 'self' ? remote : remote[remoteValue])) identical++;
    else changed++;
  }
  for (const id of onlineById.keys()) if (!localById.has(id)) onlyOnline++;
  return { identical, changed, onlyLocal, onlyOnline, ambiguous };
}

const categories = [
  { key: 'tasks', label: 'Rituais', table: 'tasks', column: 'title,local_id,payload' },
  { key: 'habits', label: 'Ciclos', table: 'habits', column: 'name,local_id,payload' },
  { key: 'actions', label: 'Ações', table: null, column: null },
  { key: 'executionLogs', label: 'Histórico de execução', table: null, column: null },
  { key: 'projects', label: 'Projetos', table: 'projects', column: 'title' },
  { key: 'quests', label: 'Jornadas', table: 'quests', column: 'title' },
  { key: 'drafts', label: 'Rascunhos', table: 'drafts', column: 'title' },
  { key: 'cycleSequences', label: 'Sequências', table: 'cycle_sequences', column: 'name,local_id,payload' },
  { key: 'customAreas', label: 'Áreas personalizadas', table: 'custom_areas', column: 'name,metadata' },
  { key: 'customSubareas', label: 'Subáreas personalizadas', table: 'custom_subareas', column: 'name,metadata' },
  { key: 'workouts', label: 'Treinos salvos', table: null, column: null },
  { key: 'sessions', label: 'Sessões de treino', table: null, column: null },
  { key: 'nativeHistory', label: 'Histórico de treino', table: null, column: null },
] as const;

/** Explicit, authenticated, read-only preview. A failed or truncated table is never shown as empty. */
export async function inspectAccountDataInventory(input: {
  client: SupabaseClient;
  userId: string;
  origin: string;
  storage: Pick<Storage, 'getItem'>;
  isCurrent: () => boolean;
  readProgress: (userId: string) => Promise<unknown>;
}): Promise<AccountDataInventory> {
  const { client, userId, origin, storage, isCurrent, readProgress } = input;
  const localRaw = [storage.getItem(STORE_KEYS.core), storage.getItem(STORE_KEYS.fitness)] as const;
  const check = () => {
    if (!isCurrent() || storage.getItem(STORE_KEYS.core) !== localRaw[0]
      || storage.getItem(STORE_KEYS.fitness) !== localRaw[1]) throw new Error('Os dados deste aparelho mudaram. Refaça a leitura.');
  };
  check();
  const identity = await client.auth.getUser(); check();
  if (identity.error || identity.data.user?.id !== userId) throw new Error('Entre novamente na conta antes de ver os registros online.');
  const remote = await readProgress(userId); check();
  if (!record(remote) || remote.userId !== userId
    || (remote.kind !== 'empty' && remote.kind !== 'legacy' && remote.kind !== 'snapshot')) {
    throw new Error('O formato da conta mudou. Refaça a conferência.');
  }
  const kind = remote.kind as InventoryKind;
  const local = snapshotNames(validateStoredProgress({ core: localRaw[0], fitness: localRaw[1] }, origin));
  let online = snapshotNames(null);
  const comparisons = new Map<string,InventoryComparison>();
  let legacyCatalogAreas = 0, legacyCatalogSubareas = 0;
  if (kind === 'snapshot') {
    if (typeof remote.archive !== 'string') throw new Error('O arquivo online está incompleto.');
    online = snapshotNames((await inspectProgressBackup(remote.archive)).backup); check();
    for (const key of ['tasks','habits','cycleSequences']) comparisons.set(key,
      compareRows(local.rows.get(key) ?? [],online.rows.get(key) ?? [],'id','self'));
  } else if (kind === 'legacy') {
    for (const category of categories) {
      if (!category.table || !category.column) continue;
      const { data, count, error } = await client.from(category.table)
        .select(category.column, { count: 'exact' }).eq('user_id', userId).range(0, 999);
      check();
      if (error || !Array.isArray(data) || count === null || count !== data.length) {
        throw new Error(`Não foi possível conferir toda a lista online de ${category.label.toLowerCase()}. Nenhum dado foi alterado.`);
      }
      if (category.key === 'customAreas' || category.key === 'customSubareas') {
        const standard = data.filter(row => record(row) && record(row.metadata)
          && (row.metadata.syncSource === 'base-catalog' || row.metadata.syncSource === 'onboarding-selection'));
        if (category.key === 'customAreas') legacyCatalogAreas = standard.length;
        else legacyCatalogSubareas = standard.length;
        online.groups.set(category.key, data.filter(row => !standard.includes(row)).map(label));
      } else {
        online.groups.set(category.key, data.map(label));
        if (['tasks','habits','cycleSequences'].includes(category.key)) comparisons.set(category.key,
          compareRows(local.rows.get(category.key) ?? [],(data as unknown[]).filter(record),'local_id','payload'));
      }
    }
  }
  const again = await client.auth.getUser(); check();
  if (again.error || again.data.user?.id !== userId) throw new Error('A conta mudou durante a leitura. Entre novamente.');
  return {
    kind,
    groups: categories.map(category => ({
      label: category.label,
      local: local.groups.get(category.key) ?? [],
      online: kind === 'legacy' && !category.table ? null : online.groups.get(category.key) ?? [],
      comparison: comparisons.get(category.key),
    })),
    localXp: local.xp,
    onlineXp: kind === 'legacy' ? null : online.xp,
    legacyCatalogAreas,
    legacyCatalogSubareas,
  };
}
