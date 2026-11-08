import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { ACCOUNT_INTENT_KEY } from './account-intent';
import { createProgressBackup, inspectProgressBackup, STORE_KEYS, type ProgressSnapshot } from './progress-backup';
import { auditCriticalProgress } from './critical-progress';
import { compareProgressBackup } from './restore-comparison';
import { validateStoredProgress } from './stored-progress';
import { RESTORE_JOURNAL_KEY, type StoredProgress } from './restore-journal';
import { LOCAL_PROGRESS_MODE_KEY, validateLocalProgressMode } from './progress-mode';

export type PreviewStorage = Pick<Storage, 'getItem'>;
export interface WorkspaceBaseline { pair: StoredProgress; snapshot: ProgressSnapshot | null; localMode: string | null }
export function readWorkspaceBaseline(storage: PreviewStorage, origin: string): WorkspaceBaseline {
  if (storage.getItem(ACCOUNT_RESOLUTION_KEY) !== null) throw new Error('Conclua a resolução da conta antes de restaurar ou enviar outro arquivo.');
  if (storage.getItem(RESTORE_JOURNAL_KEY) !== null) throw new Error('Há uma recuperação pendente. A comparação está pausada para preservar as duas versões do progresso. Não limpe os dados do navegador.');
  if (storage.getItem(ACCOUNT_INTENT_KEY) !== null) throw new Error('Há uma conferência de conta pendente. Abra a conferência da conta antes de restaurar outro arquivo.');
  const pair = { core: storage.getItem(STORE_KEYS.core), fitness: storage.getItem(STORE_KEYS.fitness) };
  const localMode = storage.getItem(LOCAL_PROGRESS_MODE_KEY);
  validateLocalProgressMode(localMode, origin);
  return { pair, snapshot: validateStoredProgress(pair, origin), localMode };
}
export function assertWorkspaceBaseline(storage: PreviewStorage, expected: WorkspaceBaseline): void {
  if (storage.getItem(RESTORE_JOURNAL_KEY) !== null
    || storage.getItem(ACCOUNT_RESOLUTION_KEY) !== null
    || storage.getItem(ACCOUNT_INTENT_KEY) !== null
    || storage.getItem(STORE_KEYS.core) !== expected.pair.core
    || storage.getItem(STORE_KEYS.fitness) !== expected.pair.fitness) throw new Error('O progresso mudou durante a conferência. Compare novamente antes de continuar.');
  if (storage.getItem(LOCAL_PROGRESS_MODE_KEY) !== expected.localMode) throw new Error('O modo de uso mudou. Confira o progresso novamente.');
}
/** No stores/auth/commands or writes. Any future writer must revalidate under an exclusive lease. */
export async function prepareWorkspacePreview(text: string, storage: PreviewStorage, origin: string) {
  const baseline = readWorkspaceBaseline(storage, origin);
  const incoming = await inspectProgressBackup(text);
  const comparison = baseline.snapshot ? await compareProgressBackup(text, baseline.snapshot) : null;
  const audit = comparison?.audit ?? auditCriticalProgress(incoming.backup);
  assertWorkspaceBaseline(storage, baseline);
  const user = incoming.backup.stores.core.state.user as Record<string, unknown>;
  const xp = ([['xp_earth', 'Terra'], ['xp_fire', 'Fogo'], ['xp_water', 'Água'], ['xp_air', 'Ar']] as const)
    .map(([key, label]) => ({ label, value: typeof user[key] === 'number' ? user[key] as number : null }));
  return { baseline, summary: incoming.summary, comparison, audit, text, xp };
}
export async function createWorkspaceSafetyCopy(storage: PreviewStorage, origin: string) {
  const baseline = readWorkspaceBaseline(storage, origin);
  if (!baseline.snapshot) throw new Error('Não há progresso salvo nesta origem para copiar.');
  const text = await createProgressBackup(baseline.snapshot);
  await inspectProgressBackup(text);
  assertWorkspaceBaseline(storage, baseline);
  return { text, baseline };
}
