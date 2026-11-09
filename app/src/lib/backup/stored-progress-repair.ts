import { ACCOUNT_INTENT_KEY } from './account-intent';
import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { PROGRESS_SESSION_LOCK, hasProgressAppStarted } from './progress-startup';
import { RESTORE_JOURNAL_KEY, type RestoreStorage, type StoredProgress } from './restore-journal';
import { STORE_KEYS } from './progress-backup';
import { StoredProgressAuditError, validateStoredProgress } from './stored-progress';

export const STORED_PROGRESS_REPAIR_KEY = 'conselho-elemental-progress-repair-v1';
const hierarchyKeys = ['actions', 'tasks', 'habits', 'projects', 'quests', 'missions', 'childItems', 'childHabits'] as const;
const xpKeys = ['xp_fire', 'xp_earth', 'xp_water', 'xp_air'] as const;
type Data = Record<string, unknown>;

export interface StoredProgressRepairSummary {
  xpFields: number;
  legacyExperienceMoved: boolean;
  orphanActions: { path: string; title: string; kind: 'ritual' | 'ciclo' }[];
}

export interface StoredProgressRepairPlan {
  readonly before: StoredProgress;
  readonly target: StoredProgress;
  readonly summary: StoredProgressRepairSummary;
}

interface Journal {
  format: 'conselho-elemental-progress-repair';
  version: 1;
  origin: string;
  before: StoredProgress;
  target: StoredProgress;
}

const object = (value: unknown): value is Data => !!value && typeof value === 'object' && !Array.isArray(value);
const validXp = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0;
const readPair = (storage: Pick<Storage, 'getItem'>): StoredProgress => ({
  core: storage.getItem(STORE_KEYS.core),
  fitness: storage.getItem(STORE_KEYS.fitness),
});
const samePair = (left: StoredProgress, right: StoredProgress) => left.core === right.core && left.fitness === right.fitness;

function fail(message: string): never { throw new Error(message); }
function write(storage: RestoreStorage, key: string, value: string | null) {
  if (value === null) storage.removeItem(key); else storage.setItem(key, value);
  if (storage.getItem(key) !== value) fail('O navegador não confirmou a gravação. A cópia original foi preservada.');
}
async function digest(text: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function seal(value: Journal) {
  const payload = JSON.stringify(value);
  return JSON.stringify({ payload, checksum: await digest(payload) });
}
async function inspectJournal(raw: string, origin: string): Promise<Journal> {
  let envelope: unknown;
  try { envelope = JSON.parse(raw); } catch { return fail('A cópia de segurança da correção não pôde ser lida. Preserve os dados deste navegador.'); }
  if (!object(envelope) || typeof envelope.payload !== 'string' || typeof envelope.checksum !== 'string'
    || await digest(envelope.payload) !== envelope.checksum) fail('A cópia de segurança da correção perdeu a integridade. Preserve os dados deste navegador.');
  let journal: unknown;
  try { journal = JSON.parse(envelope.payload); } catch { return fail('A cópia de segurança da correção é incompatível.'); }
  if (!object(journal) || journal.format !== 'conselho-elemental-progress-repair' || journal.version !== 1
    || journal.origin !== origin || !object(journal.before) || !object(journal.target)
    || !['core', 'fitness'].every(key => journal.before[key] === null || typeof journal.before[key] === 'string')
    || !['core', 'fitness'].every(key => typeof journal.target[key] === 'string')) fail('A cópia de segurança da correção pertence a outra origem ou é incompatível.');
  return journal as unknown as Journal;
}

/** Finishes cleanup after a reload at either safe boundary. It never chooses
 * between divergent bytes and never changes domain data on its own. */
export async function settleStoredProgressRepair(storage: RestoreStorage, origin: string): Promise<void> {
  const raw = storage.getItem(STORED_PROGRESS_REPAIR_KEY);
  if (raw === null) return;
  const journal = await inspectJournal(raw, origin);
  const current = readPair(storage);
  if (samePair(current, journal.target)) validateStoredProgress(current, origin);
  else if (!samePair(current, journal.before)) fail('A correção local foi interrompida depois que o progresso mudou. Preserve este navegador para revisão.');
  write(storage, STORED_PROGRESS_REPAIR_KEY, null);
}

function repairUser(user: Data, path: string, summary: StoredProgressRepairSummary) {
  for (const key of xpKeys) {
    const value = user[key];
    if (validXp(value)) continue;
    if (!Object.hasOwn(user, key)) {
      user[key] = 0;
      summary.xpFields += 1;
      continue;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const numeric = Number(value);
      if (validXp(numeric) && String(numeric) === value.trim()) {
        user[key] = numeric;
        summary.xpFields += 1;
        continue;
      }
    }
    fail(`${path}.${key} não pode ser corrigido sem escolher um novo valor de XP.`);
  }
  if (typeof user.experience === 'number' && Number.isFinite(user.experience) && user.experience > 0
    && xpKeys.every(key => user[key] === 0)) {
    user.xp_earth = user.experience;
    summary.legacyExperienceMoved = true;
  }
}

function repairOrphans(profile: Data, path: string, summary: StoredProgressRepairSummary) {
  const entries: { value: Data; path: string; key: string; direct: boolean }[] = [];
  const collect = (container: Data, parentPath: string) => {
    for (const key of hierarchyKeys) if (Array.isArray(container[key])) {
      (container[key] as unknown[]).forEach((item, index) => {
        if (!object(item)) return;
        const itemPath = `${parentPath}.${key}[${index}]`;
        entries.push({ value: item, path: itemPath, key, direct: container === profile });
        collect(item, itemPath);
      });
    }
  };
  collect(profile, path);
  const ids = new Set(entries.map(entry => entry.value.id).filter((id): id is string => typeof id === 'string'));
  const repairedIds = new Set<string>();
  for (const entry of entries) {
    const item = entry.value;
    if (typeof item.id !== 'string' || typeof item.parentId !== 'string' || ids.has(item.parentId) || repairedIds.has(item.id)) continue;
    const representations = entries.filter(candidate => candidate.value.id === item.id && candidate.value.parentId === item.parentId);
    if (!entry.direct || entry.key !== 'actions' || representations.some(candidate => !candidate.direct || candidate.key !== 'actions')
      || !['TASK', 'HABIT'].includes(String(item.type))) {
      fail(`${entry.path} precisa de uma escolha manual de vínculo. A atividade continua preservada.`);
    }
    const kind = item.type === 'HABIT' ? 'ciclo' : 'ritual';
    for (const representation of representations) {
      representation.value.parentId = null;
      representation.value.lifecycleType = item.type === 'HABIT' ? 'HABIT' : 'ACTION';
      representation.value.semanticType = null;
    }
    summary.orphanActions.push({ path: entry.path, title: typeof item.title === 'string' && item.title.trim() ? item.title.trim() : 'Atividade sem título', kind });
    repairedIds.add(item.id);
  }
}

/** Builds a deterministic target from exact stored bytes. Supported changes are
 * lossless numeric conversion, absent legacy XP=0, legacy total XP→earth, and
 * promotion of an otherwise unreachable direct action to a visible root item. */
export function planStoredProgressRepair(storage: Pick<Storage, 'getItem'>, origin: string): StoredProgressRepairPlan {
  const before = readPair(storage);
  let auditError: StoredProgressAuditError | null = null;
  try { validateStoredProgress(before, origin); }
  catch (reason) {
    if (reason instanceof StoredProgressAuditError) auditError = reason;
    else throw reason;
  }
  if (!auditError || before.core === null || before.fitness === null) fail('O progresso não precisa desta correção de compatibilidade.');
  const envelope = JSON.parse(before.core) as { state: Data; version: number };
  const cloned = JSON.parse(JSON.stringify(envelope)) as { state: Data; version: number };
  const summary: StoredProgressRepairSummary = { xpFields: 0, legacyExperienceMoved: false, orphanActions: [] };
  const profiles: [Data, string][] = [[cloned.state, 'core']];
  if (object(cloned.state.accountDataById)) for (const [id, value] of Object.entries(cloned.state.accountDataById)) {
    if (object(value)) profiles.push([value, `core.accountDataById[${JSON.stringify(id)}]`]);
  }
  for (const [profile, path] of profiles) {
    if (object(profile.user)) repairUser(profile.user, `${path}.user`, summary);
    repairOrphans(profile, path, summary);
  }
  if (summary.xpFields === 0 && !summary.legacyExperienceMoved && summary.orphanActions.length === 0) fail('Os campos encontrados exigem revisão manual. Nenhum dado foi alterado.');
  const target = { core: JSON.stringify(cloned), fitness: before.fitness };
  validateStoredProgress(target, origin);
  return { before: { ...before }, target, summary };
}

interface ApplyContext {
  storage: () => RestoreStorage;
  locks?: Pick<LockManager, 'request'>;
  origin: string;
  otherTabsClosed: boolean;
  isCurrent?: () => boolean;
}

export async function applyStoredProgressRepair(context: ApplyContext, plan: StoredProgressRepairPlan): Promise<void> {
  if (!context.origin || context.otherTabsClosed !== true) fail('Feche as outras abas do app e confirme antes de corrigir.');
  if (!context.locks) fail('Este navegador não oferece a coordenação necessária para corrigir com segurança.');
  if (hasProgressAppStarted()) fail('O app já foi iniciado nesta página. Reabra Minha conta antes de corrigir.');
  return context.locks.request(PROGRESS_SESSION_LOCK, { mode: 'exclusive', ifAvailable: true }, async lock => {
    if (!lock) fail('O progresso está em uso em outra aba. Nenhum dado foi alterado.');
    const storage = context.storage();
    const current = () => {
      if (context.isCurrent?.() === false) fail('A conferência mudou. Nenhum dado foi alterado.');
      if (!samePair(readPair(storage), plan.before)) fail('O progresso mudou. Recarregue a conferência antes de corrigir.');
      if ([RESTORE_JOURNAL_KEY, ACCOUNT_INTENT_KEY, ACCOUNT_RESOLUTION_KEY].some(key => storage.getItem(key) !== null)) fail('Conclua a operação pendente antes de corrigir os dados locais.');
    };
    current();
    validateStoredProgress(plan.target, context.origin);
    const journal = await seal({ format: 'conselho-elemental-progress-repair', version: 1, origin: context.origin, before: { ...plan.before }, target: { ...plan.target } });
    current();
    if (storage.getItem(STORED_PROGRESS_REPAIR_KEY) !== null) fail('Já existe uma correção local pendente de revisão.');
    write(storage, STORED_PROGRESS_REPAIR_KEY, journal);
    try {
      current();
      write(storage, STORE_KEYS.core, plan.target.core);
      validateStoredProgress(readPair(storage), context.origin);
      write(storage, STORED_PROGRESS_REPAIR_KEY, null);
    } catch (reason) {
      if (storage.getItem(STORE_KEYS.core) === plan.target.core) write(storage, STORE_KEYS.core, plan.before.core);
      if (samePair(readPair(storage), plan.before)) write(storage, STORED_PROGRESS_REPAIR_KEY, null);
      throw reason;
    }
  });
}
