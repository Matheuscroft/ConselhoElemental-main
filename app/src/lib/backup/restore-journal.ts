import { createProgressBackup, inspectProgressBackup, MAX_BACKUP_BYTES, STORE_KEYS, summarizeProgress, type BackupSummary } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';
import { validateStoredProgress } from './stored-progress';
import { LOCAL_PROGRESS_MODE_KEY, localProgressMode, validateLocalProgressMode } from './progress-mode';

/** Experimental writing protocol, with UI writes behind a static release gate.
 * Review/export remain read-only; continuation requires explicit confirmation.
 * Caller must hold exclusive access across ALL writers (tabs, hydration and sync).
 * Comparisons below detect stale data; they are not a cross-tab lock.
 */
export const RESTORE_JOURNAL_KEY = 'conselho-elemental-restore-journal-v1';
const MAX_JOURNAL_BYTES = 100 * 1024 * 1024;
const modules = ['core', 'fitness'] as const;
export type StoredProgress = Record<typeof modules[number], string | null>;
export interface RecoveryBaseline { journal: string; pair: StoredProgress; localMode?: string | null }
export type RestoreStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
interface Journal {
  format: 'conselho-elemental-restore';
  version: 1;
  origin: string;
  phase: 'prepared' | 'committed';
  before: StoredProgress;
  target: StoredProgress;
}
function fail(message: string): never { throw new Error(message); }
function checkSize(text: string, limit: number) {
  if (new TextEncoder().encode(text).byteLength > limit) fail('Diário excede o limite permitido.');
}
function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function keys(value: Record<string, unknown>, expected: string[]) {
  if (Object.keys(value).length !== expected.length || expected.some(key => !Object.hasOwn(value, key))) fail('Diário incompatível.');
}
function checkPair(value: unknown): asserts value is StoredProgress {
  if (!object(value)) fail('Partes do diário ausentes.');
  keys(value, [...modules]);
  for (const part of modules) {
    const raw = value[part];
    if (raw !== null && typeof raw !== 'string') fail('Parte do diário inválida.');
    if (raw !== null) checkSize(raw, MAX_BACKUP_BYTES);
  }
}
/** Bind a reviewed operation before awaits; later form mutations cannot change it. */
export function copyRecoveryBaseline(value: RecoveryBaseline): RecoveryBaseline {
  if (!object(value) || typeof value.journal !== 'string') fail('Confira a recuperação pendente antes de confirmar.');
  checkPair(value.pair);
  if (value.localMode != null && typeof value.localMode !== 'string') fail('Modo local conferido incompatível.');
  return { journal: value.journal, pair: { ...value.pair }, localMode: value.localMode ?? null };
}
function parseJournal(text: string): unknown {
  try { return JSON.parse(text); }
  catch { return fail('Não foi possível ler o diário de recuperação. Preserve os dados do navegador e solicite uma revisão.'); }
}
async function digest(text: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function seal(journal: Journal) {
  const payload = JSON.stringify(journal);
  const result = JSON.stringify({ payload, checksum: await digest(payload) });
  checkSize(result, MAX_JOURNAL_BYTES);
  return result;
}
async function inspect(text: string, origin: string): Promise<Journal> {
  checkSize(text, MAX_JOURNAL_BYTES);
  const envelope = parseJournal(text);
  if (!object(envelope)) fail('Diário inválido.');
  keys(envelope, ['payload', 'checksum']);
  if (typeof envelope.payload !== 'string' || typeof envelope.checksum !== 'string'
    || await digest(envelope.payload) !== envelope.checksum) fail('Integridade do diário inválida.');
  const value = parseJournal(envelope.payload);
  if (!object(value)) fail('Diário inválido.');
  keys(value, ['format', 'version', 'origin', 'phase', 'before', 'target']);
  if (value.format !== 'conselho-elemental-restore' || value.version !== 1
    || value.origin !== origin || !origin
    || (value.phase !== 'prepared' && value.phase !== 'committed')) fail('Diário incompatível com esta origem.');
  const target = value.target;
  checkPair(value.before); checkPair(target);
  if (modules.some(part => target[part] === null)) fail('Destino incompleto.');
  // A recomputed checksum is not authority to write arbitrary or incompatible bytes.
  validateStoredProgress(value.before as StoredProgress, origin);
  validateStoredProgress(target, origin);
  return value as unknown as Journal;
}

/** Keeps original storage bytes, including absent keys, for lossless rollback.
 * SHA-256 detects corruption, not authenticity or full domain compatibility.
 */
export async function prepareRestoreJournal(before: StoredProgress, targetBackup: string, origin: string): Promise<string> {
  checkPair(before);
  const frozen = { ...before };
  if (!origin) fail('Origem ausente.');
  const { backup } = await inspectProgressBackup(targetBackup);
  if (auditCriticalProgress(backup).issues.length) fail('A cópia contém dados que precisam de revisão. Nenhuma restauração foi preparada.');
  validateStoredProgress(frozen, origin);
  const target = Object.fromEntries(modules.map(part => [part, JSON.stringify({
    state: backup.stores[part].state, version: backup.stores[part].version,
  })])) as StoredProgress;
  checkPair(target);
  return seal({ format: 'conselho-elemental-restore', version: 1, origin, phase: 'prepared', before: frozen, target });
}
function readPair(storage: Pick<Storage, 'getItem'>): StoredProgress {
  return { core: storage.getItem(STORE_KEYS.core), fitness: storage.getItem(STORE_KEYS.fitness) };
}
function same(left: StoredProgress, right: StoredProgress) {
  return modules.every(part => left[part] === right[part]);
}
function assertJournal(storage: RestoreStorage, expected: string | null) {
  if (storage.getItem(RESTORE_JOURNAL_KEY) !== expected) fail('Diário mudou durante a operação. Recuperação necessária.');
}
function write(storage: RestoreStorage, key: string, value: string | null) {
  if (value === null) storage.removeItem(key); else storage.setItem(key, value);
  if (storage.getItem(key) !== value) fail('Gravação não confirmada. Diário preservado para recuperação.');
}

export interface PendingRestoreReview {
  phase: Journal['phase'];
  outcome: 'rollback' | 'keep-target' | 'conflict';
  before: BackupSummary | null;
  target: BackupSummary;
  /** Exact bytes for freshness checks; never render their contents. */
  baseline: RecoveryBaseline;
}

export function assertRecoveryBaseline(storage: Pick<Storage, 'getItem'>, expected: RecoveryBaseline): void {
  if (storage.getItem(RESTORE_JOURNAL_KEY) !== expected.journal
    || !same(readPair(storage), expected.pair)
    || storage.getItem(LOCAL_PROGRESS_MODE_KEY) !== (expected.localMode ?? null)) fail('A recuperação mudou durante a conferência. Confira novamente.');
}
export function assertPendingRestoreReview(storage: Pick<Storage, 'getItem'>, review: PendingRestoreReview): void {
  assertRecoveryBaseline(storage, review.baseline);
}

/** Read-only recovery preview, safe before stores/auth. Never hydrate a mixed pair:
 * summaries come ONLY from the two validated journal snapshots, not current keys.
 * This is not an exclusive lease, confirmation or permission to perform recovery.
 */
export async function reviewPendingRestore(storage: Pick<Storage, 'getItem'>, origin: string): Promise<PendingRestoreReview | null> {
  const text = storage.getItem(RESTORE_JOURNAL_KEY);
  if (text === null) return null;
  const pair = readPair(storage);
  const localMode = storage.getItem(LOCAL_PROGRESS_MODE_KEY);
  validateLocalProgressMode(localMode, origin);
  const journal = await inspect(text, origin);
  const before = validateStoredProgress(journal.before, origin);
  const target = validateStoredProgress(journal.target, origin)!;
  const conflict = journal.phase === 'committed' ? !same(pair, journal.target)
    : modules.some(part => pair[part] !== journal.before[part] && pair[part] !== journal.target[part]);
  const review: PendingRestoreReview = {
    phase: journal.phase,
    outcome: conflict ? 'conflict' : journal.phase === 'prepared' ? 'rollback' : 'keep-target',
    before: before ? summarizeProgress(before) : null,
    target: summarizeProgress(target),
    baseline: { journal: text, pair, localMode },
  };
  assertPendingRestoreReview(storage, review);
  return review;
}

/** Export one protected version, never the possibly mixed live pair. Read-only. */
export async function createRecoverySafetyCopy(storage: Pick<Storage, 'getItem'>, review: PendingRestoreReview, side: 'before' | 'target', origin: string): Promise<string> {
  if (side !== 'before' && side !== 'target') fail('Escolha uma das versões protegidas.');
  const expected = copyRecoveryBaseline(review.baseline);
  assertRecoveryBaseline(storage, expected);
  const journal = await inspect(expected.journal, origin);
  const snapshot = validateStoredProgress(journal[side], origin);
  if (!snapshot) fail('Não havia progresso salvo antes desta operação.');
  const text = await createProgressBackup(snapshot);
  await inspectProgressBackup(text);
  assertRecoveryBaseline(storage, expected);
  return text;
}

/** No automatic retry on failure. Leave the journal for explicit recovery before hydration. */
export async function executePreparedRestore(storage: RestoreStorage, text: string, origin: string, assertCurrent: () => void = () => {}): Promise<void> {
  const journal = await inspect(text, origin);
  if (journal.phase !== 'prepared') fail('Operação já confirmada.');
  const committed = await seal({ ...journal, phase: 'committed' });
  assertCurrent();
  // All awaits precede writes. This still requires an external exclusive lock.
  assertJournal(storage, null);
  if (!same(readPair(storage), journal.before)) fail('Progresso mudou desde a preparação. Compare novamente.');
  write(storage, RESTORE_JOURNAL_KEY, text);
  for (const part of modules) {
    assertJournal(storage, text);
    if (storage.getItem(STORE_KEYS[part]) !== journal.before[part]) fail('Progresso alterado durante a gravação.');
    write(storage, STORE_KEYS[part], journal.target[part]);
  }
  if (!same(readPair(storage), journal.target)) fail('Destino não confirmado.');
  assertJournal(storage, text);
  write(storage, RESTORE_JOURNAL_KEY, committed);
  // Keep the durable commit as the handoff barrier. Removing it here would let
  // the next document import App/auth and apply cloud-first data without consent.
  // Local-use handoff is a separate explicitly confirmed operation below.
  assertJournal(storage, committed);
  if (!same(readPair(storage), journal.target)) fail('Destino confirmado foi alterado. Recuperação manual necessária.');
}

/** Must run with exclusive access BEFORE importing any live stores, once integrated.
 * Unknown/corrupt journals and unexpected data fail closed, retaining evidence.
 */
export async function recoverRestoreJournal(storage: RestoreStorage, origin: string, reviewed?: RecoveryBaseline, assertCurrent: () => void = () => {}): Promise<'none' | 'rolled-back' | 'committed'> {
  const expected = reviewed ? copyRecoveryBaseline(reviewed) : undefined;
  if (expected) assertRecoveryBaseline(storage, expected);
  const text = storage.getItem(RESTORE_JOURNAL_KEY);
  if (text === null) return 'none';
  const journal = await inspect(text, origin);
  if (expected) assertRecoveryBaseline(storage, expected);
  assertCurrent();
  assertJournal(storage, text);
  const current = readPair(storage);
  if (journal.phase === 'committed') {
    if (!same(current, journal.target)) fail('Destino confirmado foi alterado. Recuperação manual necessária.');
  } else {
    // Check BOTH keys before any rollback; never overwrite a detected unrelated edit.
    if (modules.some(part => current[part] !== journal.before[part] && current[part] !== journal.target[part])) {
      fail('Há alterações externas ao diário. Recuperação manual necessária.');
    }
    for (const part of modules) {
      assertJournal(storage, text);
      if (storage.getItem(STORE_KEYS[part]) !== current[part]) fail('Progresso mudou durante a recuperação.');
      if (current[part] !== journal.before[part]) write(storage, STORE_KEYS[part], journal.before[part]);
    }
    if (!same(readPair(storage), journal.before)) fail('Recuperação não confirmada.');
    assertJournal(storage, text);
    write(storage, RESTORE_JOURNAL_KEY, null);
  }
  // A committed destination stays isolated across reloads. Reviewing or
  // recovering it never authorizes cloud association or clears this barrier.
  if (journal.phase === 'committed') assertJournal(storage, text);
  return journal.phase === 'committed' ? 'committed' : 'rolled-back';
}

/** Explicit handoff, under exclusivity, before any App/client import. Mode is
 * durable BEFORE clearing the committed journal, so every interruption fails local.
 * No API here can remove local mode or associate a remote identity.
 */
export async function continueRestoreLocally(storage: RestoreStorage, origin: string, reviewed: RecoveryBaseline, assertCurrent: () => void = () => {}): Promise<void> {
  const expected = copyRecoveryBaseline(reviewed);
  assertRecoveryBaseline(storage, expected);
  validateLocalProgressMode(expected.localMode ?? null, origin);
  const journal = await inspect(expected.journal, origin);
  if (journal.phase !== 'committed') fail('Conclua a recuperação antes de continuar localmente.');
  assertRecoveryBaseline(storage, expected);
  if (!same(expected.pair, journal.target)) fail('A cópia confirmada mudou. Confira a recuperação antes de continuar.');
  assertCurrent();
  const marker = expected.localMode ?? localProgressMode(origin);
  if (expected.localMode === null) write(storage, LOCAL_PROGRESS_MODE_KEY, marker);
  assertJournal(storage, expected.journal);
  if (!same(readPair(storage), journal.target) || storage.getItem(LOCAL_PROGRESS_MODE_KEY) !== marker) fail('O progresso mudou durante a continuação local.');
  write(storage, RESTORE_JOURNAL_KEY, null);
}
