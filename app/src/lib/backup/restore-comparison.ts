import { createProgressBackup, inspectProgressBackup, type ProgressSnapshot } from './progress-backup';
import { auditCriticalProgress, type CriticalProgressAudit } from './critical-progress';

type Data = Record<string, unknown>;
export interface ComparisonRow {
  label: string; before: number; after: number; added: number; removed: number; changed: number;
}
export interface AccountComparison {
  id: string; name: string; status: 'existing' | 'added' | 'removed';
  rows: ComparisonRow[];
  xp: { label: string; before: number | null; after: number | null }[];
}
export interface RestoreComparison {
  audit: CriticalProgressAudit;
  baseline: string; fileCreatedAt: string; fileVersion: string;
  sameOrigin: boolean; sameVersion: boolean; sameActiveAccount: boolean;
  currentAccount: string; incomingAccount: string;
  accounts: AccountComparison[];
}
const sections = [
  ['tasks', 'Rituais principais'], ['habits', 'Ciclos principais'], ['quests', 'Jornadas'],
  ['projects', 'Grandes obras'], ['drafts', 'Rascunhos'], ['actions', 'Ações'],
  ['executionLogs', 'Registros de execução'], ['cycleSequences', 'Sequências de ciclos'],
  ['sequenceMemberships', 'Vínculos nas sequências'], ['commitments', 'Compromissos'],
  ['customAreas', 'Áreas personalizadas'],
] as const;
const xpKeys = [['xp_earth', 'Terra'], ['xp_fire', 'Fogo'], ['xp_water', 'Água'], ['xp_air', 'Ar']] as const;
function record(value: unknown): value is Data { return !!value && typeof value === 'object' && !Array.isArray(value); }
function invalid(): never { throw new Error('Não foi possível comparar a estrutura detalhada desta cópia. Nenhum dado foi alterado.'); }
/** Key ordering is immaterial; array ordering and all nested data remain meaningful. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (record(value)) return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  return JSON.stringify(value) ?? 'null';
}
export function progressFingerprint(snapshot: ProgressSnapshot): string {
  // Capture includes Dates; normalize exactly as the archive does before comparing.
  return canonical(JSON.parse(JSON.stringify(snapshot.stores)));
}
function index(value: unknown): Map<string, Data> {
  if (!Array.isArray(value)) invalid();
  const result = new Map<string, Data>();
  for (const item of value) {
    if (!record(item) || typeof item.id !== 'string' || !item.id || result.has(item.id)) invalid();
    result.set(item.id, item);
  }
  return result;
}
function row(label: string, before: unknown = [], after: unknown = []): ComparisonRow {
  const a = index(before), b = index(after);
  return { label, before: a.size, after: b.size,
    added: [...b.keys()].filter(id => !a.has(id)).length,
    removed: [...a.keys()].filter(id => !b.has(id)).length,
    changed: [...b].filter(([id, item]) => a.has(id) && canonical(a.get(id)) !== canonical(item)).length };
}
interface Profile { name: string; registration?: Data; core?: Data; legacy?: Data; native?: Data }
function profiles(snapshot: ProgressSnapshot): Map<string, Profile> {
  const core = snapshot.stores.core.state, fitness = snapshot.stores.fitness.state;
  const result = new Map<string, Profile>();
  for (const [id, profile] of index(core.accounts)) {
    if (id === 'local' || typeof profile.name !== 'string') invalid();
    result.set(id, { name: profile.name, registration: profile });
  }
  const ensure = (id: string) => {
    if (!result.has(id)) result.set(id, { name: id === 'local' ? 'Progresso sem perfil' : 'Perfil sem cadastro' });
    return result.get(id)!;
  };
  for (const [id, data] of Object.entries(core.accountDataById as Data)) {
    if (!record(data)) invalid();
    ensure(id).core = data;
  }
  // The live root is newer than the cached active-account snapshot.
  ensure(snapshot.source.accountId ?? 'local').core = core;
  for (const [id, data] of Object.entries(fitness.accountDataById as Data)) {
    if (!record(data)) invalid();
    ensure(id).legacy = data;
  }
  for (const [id, data] of Object.entries(fitness.nativeDataById as Data)) {
    if (!record(data)) invalid();
    ensure(id).native = data;
  }
  for (const profile of result.values()) {
    if (profile.core && (!record(profile.core.user) || sections.some(([key]) => !Array.isArray(profile.core![key])))) invalid();
  }
  return result;
}
function xp(data: Data | undefined, key: string): number | null {
  if (!data) return null;
  if (!record(data.user)) invalid();
  const value = data.user[key];
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}
function accountRows(a: Profile | undefined, b: Profile | undefined): ComparisonRow[] {
  const rows = sections.map(([key, label]) => row(label, a?.core?.[key] ?? [], b?.core?.[key] ?? []));
  rows.push(row('Planos de treino legados', a?.legacy?.workouts ?? [], b?.legacy?.workouts ?? []));
  rows.push(row('Histórico de treino legado', a?.legacy?.sessions ?? [], b?.legacy?.sessions ?? []));
  rows.push(row('Planos de treino nativos', a?.native?.templates ?? [], b?.native?.templates ?? []));
  rows.push(row('Histórico de treino nativo', a?.native?.nativeHistory ?? [], b?.native?.nativeHistory ?? []));
  // All other fields (subareas, character, onboarding, catalogs, measurements,
  // active sessions, etc.) are compared too; nothing is silently called equal.
  const remainder = (p: Profile | undefined) => {
    if (!p) return [];
    const c = { ...p.core }, l = { ...p.legacy }, n = { ...p.native };
    for (const [key] of sections) delete c[key];
    // These are global bookkeeping, not this profile's content.
    for (const key of ['accounts', 'currentAccountId', 'accountDataById']) delete c[key];
    delete l.workouts; delete l.sessions; delete n.templates; delete n.nativeHistory;
    return [{ id: 'other', registration: p.registration, core: c, legacy: l, native: n }];
  };
  rows.push(row('Demais dados do perfil', remainder(a), remainder(b)));
  return rows;
}
export async function compareProgressBackup(text: string, current: ProgressSnapshot): Promise<RestoreComparison> {
  // Freeze the current snapshot before any await and validate both envelopes.
  const frozen = JSON.parse(JSON.stringify(current)) as ProgressSnapshot;
  const [incoming, local] = await Promise.all([
    inspectProgressBackup(text),
    createProgressBackup(frozen).then(inspectProgressBackup),
  ]);
  const a = profiles(local.backup), b = profiles(incoming.backup);
  const currentId = frozen.source.accountId ?? 'local', incomingId = incoming.backup.source.accountId ?? 'local';
  return { audit: auditCriticalProgress(incoming.backup), baseline: progressFingerprint(frozen), fileCreatedAt: incoming.backup.createdAt,
    fileVersion: incoming.backup.appVersion,
    sameOrigin: frozen.source.origin === incoming.backup.source.origin,
    sameVersion: frozen.appVersion === incoming.backup.appVersion,
    sameActiveAccount: currentId === incomingId,
    currentAccount: a.get(currentId)?.name ?? 'Perfil sem cadastro',
    incomingAccount: b.get(incomingId)?.name ?? 'Perfil sem cadastro',
    accounts: [...new Set([...a.keys(), ...b.keys()])].map(id => ({
      id, name: b.get(id)?.name ?? a.get(id)!.name,
      status: !a.has(id) ? 'added' : !b.has(id) ? 'removed' : 'existing',
      rows: accountRows(a.get(id), b.get(id)),
      xp: xpKeys.map(([key, label]) => ({ label, before: xp(a.get(id)?.core, key), after: xp(b.get(id)?.core, key) })),
    })),
  };
}
