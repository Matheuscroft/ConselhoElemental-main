import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { ACCOUNT_INTENT_KEY } from './account-intent';
import { inspectProgressBackup, STORE_KEYS } from './progress-backup';
import { continueRestoreLocally, completePendingRestoreLocally, copyRecoveryBaseline, executePreparedRestore, recoverRestoreJournal, reviewPendingRestore, type RecoveryBaseline, type RestoreStorage, type StoredProgress } from './restore-journal';
import { validateStoredProgress } from './stored-progress';
import { progressFingerprint } from './restore-comparison';
import { hasProgressAppStarted, PROGRESS_SESSION_LOCK } from './progress-startup';

interface RestoreContext {
  storage: () => RestoreStorage;
  locks?: Pick<LockManager, 'request'>;
  origin: string;
  /** Confirmed close-tabs precondition, included in the single local-import
   * action's notice. Neither a checkbox nor this flag proves legacy tabs absent. */
  otherTabsClosed: boolean;
  isCurrent?: () => boolean;
}
type Operation = { mode: 'apply' | 'import-local'; journal: string; previousBackup: string | null; replacementConfirmed: boolean }
  | { mode: 'recover'; expected: RecoveryBaseline; recoveryConfirmed: boolean }
  | { mode: 'resume-import-local'; expected: RecoveryBaseline; recoveryConfirmed: boolean }
  | { mode: 'local'; expected: RecoveryBaseline; localUseConfirmed: boolean };

/** Isolated pre-bootstrap coordinator. UI caller remains behind a static release gate.
 * The app must not have been imported in this document. Cooperative leases block
 * upgraded live tabs; old tabs still require the explicit close-tabs precondition.
 * On completion the caller must reload before normal app startup.
 */
export async function runExclusiveRestore(inputContext: RestoreContext, inputOperation: Operation): Promise<'applied' | 'rolled-back' | 'committed' | 'none' | 'local-ready'> {
  // Bind consent, origin and the exact selected bytes before any asynchronous work.
  const context = { ...inputContext }, operation = { ...inputOperation };
  let leaseStorage: RestoreStorage | undefined;
  const preflight = () => {
    if (hasProgressAppStarted()) throw new Error('O app já foi iniciado nesta página. Recarregue em modo de recuperação antes de restaurar.');
    if (context.otherTabsClosed !== true) throw new Error('Feche as outras abas do app antes de continuar.');
    if (!context.origin) throw new Error('Origem ausente.');
    if (leaseStorage && leaseStorage.getItem(ACCOUNT_RESOLUTION_KEY) !== null) throw new Error('Conclua a resolução da conta antes de restaurar.');
    if (leaseStorage && leaseStorage.getItem(ACCOUNT_INTENT_KEY) !== null) throw new Error('Conclua a conferência da conta antes de restaurar outro arquivo.');
    if (context.isCurrent?.() === false) throw new Error('Operação cancelada ou desatualizada. Nenhuma gravação foi iniciada.');
  };
  preflight();
  if (operation.mode === 'recover' || operation.mode === 'resume-import-local') {
    if (operation.recoveryConfirmed !== true) throw new Error('Confirme a recuperação da versão conferida antes de continuar.');
    operation.expected = copyRecoveryBaseline(operation.expected);
  }
  if (operation.mode === 'local') {
    if (operation.localUseConfirmed !== true) throw new Error('Confirme o uso somente local desta cópia.');
    operation.expected = copyRecoveryBaseline(operation.expected);
  }
  if (!context.locks) throw new Error('Este navegador não oferece a coordenação necessária para restaurar com segurança.');
  return context.locks.request(PROGRESS_SESSION_LOCK, { mode: 'exclusive', ifAvailable: true }, async lock => {
    if (!lock) throw new Error('O progresso está em uso em outra aba. Nenhum dado foi alterado.');
    leaseStorage = context.storage();
    preflight();
    const storage = leaseStorage;
    if (operation.mode === 'recover') return recoverRestoreJournal(storage, context.origin, operation.expected, preflight);
    if (operation.mode === 'resume-import-local') {
      await completePendingRestoreLocally(storage, context.origin, operation.expected, preflight);
      return 'local-ready';
    }
    if (operation.mode === 'local') {
      await continueRestoreLocally(storage, context.origin, operation.expected, preflight);
      return 'local-ready';
    }
    if (operation.replacementConfirmed !== true) throw new Error('Confirme a substituição do progresso antes de continuar.');
    const baseline: StoredProgress = { core: storage.getItem(STORE_KEYS.core), fitness: storage.getItem(STORE_KEYS.fitness) };
    const current = validateStoredProgress(baseline, context.origin);
    if (current) {
      if (!operation.previousBackup) throw new Error('Confira uma cópia do progresso anterior antes de restaurar.');
      const { backup } = await inspectProgressBackup(operation.previousBackup);
      if (backup.source.origin !== context.origin || progressFingerprint(backup) !== progressFingerprint(current)) {
        throw new Error('A cópia de segurança anterior não corresponde ao progresso atual. Confira uma nova cópia.');
      }
    } else if (operation.previousBackup !== null) throw new Error('A cópia anterior não corresponde a esta origem vazia.');
    preflight();
    // executePreparedRestore revalidates journal and compares bytes after the await above.
    // Never import stores, dispatch completion commands, or initialize auth here.
    await executePreparedRestore(storage, operation.journal, context.origin, preflight);
    if (operation.mode === 'import-local') {
      // The single import action explicitly includes local use. Keep the same
      // exclusive lease through readback and the local marker handoff. Any
      // interruption retains the existing journal for reviewed recovery.
      const review = await reviewPendingRestore(storage, context.origin);
      if (!review || review.outcome !== 'keep-target') throw new Error('Confira a recuperação da importação antes de abrir o app.');
      preflight();
      await continueRestoreLocally(storage, context.origin, review.baseline, preflight);
      return 'local-ready';
    }
    return 'applied';
  });
}
