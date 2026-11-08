import { version } from '../../../package.json';
import { createInitialUser, createInitialOnboarding } from '../initial-character';
import { ACCOUNT_TRANSFER_WRITES_RELEASED } from './account-release';
import { ACCOUNT_BINDING_KEY } from './account-binding';
import { ACCOUNT_INTENT_KEY } from './account-intent';
import { ACCOUNT_RESOLUTION_KEY } from './account-resolution-key';
import { accountConfirmationRedirect } from './account-access';
import { createProgressBackup, BACKUP_FORMAT, STORE_KEYS, type ProgressSnapshot } from './progress-backup';
import { readWorkspaceBaseline, assertWorkspaceBaseline } from './workspace-preview';
import { prepareLocalAssociationReview, prepareRemoteAssociationReview } from './association-review';
import { prepareRestoreJournal, reviewPendingRestore, type RestoreStorage } from './restore-journal';
import { runExclusiveRestore } from './exclusive-restore';
import { beginAccountTransfer, finishAccountTransferLocally } from './account-transfer';
import type { createAccountTransport } from './account-transport';

/** Persist's existing empty projections, using the same character defaults as appStore.
 * Fitness catalogs remain the responsibility of its existing hydration path. */
export function createNewProgressSnapshot(origin: string): ProgressSnapshot {
  accountConfirmationRedirect(origin);
  return {
    format: BACKUP_FORMAT, schemaVersion: 1, appVersion: version, createdAt: new Date().toISOString(),
    source: { origin, accountId: null },
    stores: {
      core: { key: STORE_KEYS.core, version: 0, state: {
        executionLogs: [], accounts: [], currentAccountId: null, accountDataById: {},
        user: createInitialUser(), onboarding: createInitialOnboarding(),
        customAreas: [], customSubareas: {}, linkedSubareasByAreaId: {},
        actions: [], tasks: [], habits: [], cycleSequences: [], sequenceMemberships: [],
        commitments: [], projects: [], quests: [], drafts: [],
      } },
      fitness: { key: STORE_KEYS.fitness, version: 0, state: {
        currentAccountId: 'local', accountDataById: {}, nativeDataById: {},
      } },
    },
  };
}

/** For a genuinely new account AND empty browser only. Never clears existing progress.
 * Initial local state uses the existing restore journal. Remote creation uses the
 * existing durable intent, empty-revision CAS and full-archive receipt/readback.
 * If interrupted, those same recovery workspaces retain ownership of the operation. */
export async function startNewAccountProgress(input: {
  origin: string; storage: () => RestoreStorage; locks?: Pick<LockManager, 'request'>;
  isCurrent: () => boolean; otherTabsClosed: boolean; startConfirmed: boolean; userId: string;
}, transport: ReturnType<typeof createAccountTransport>) {
  const context = { ...input }, storage = context.storage();
  if (!ACCOUNT_TRANSFER_WRITES_RELEASED || !context.startConfirmed || !context.otherTabsClosed || !context.isCurrent()) {
    throw new Error('Confirme o início da jornada e feche as outras abas antes de continuar.');
  }
  const baseline = readWorkspaceBaseline(storage, context.origin);
  if (baseline.snapshot || storage.getItem(ACCOUNT_BINDING_KEY) !== null) {
    throw new Error('Este aparelho já tem progresso ou vínculo. Guarde e confira sua jornada; não é seguro começar do zero aqui.');
  }
  const check = () => {
    if (!context.isCurrent()) throw new Error('O acesso mudou. Confira sua conta antes de continuar.');
    assertWorkspaceBaseline(storage, baseline);
    if (storage.getItem(ACCOUNT_BINDING_KEY) !== null) throw new Error('O vínculo da conta mudou durante a conferência.');
  };
  const snapshot = createNewProgressSnapshot(context.origin);
  const reviewContext = { origin: context.origin, readLocal: () => snapshot, isCurrent: () => { check(); return true; },
    expectedUserId: context.userId, currentUserId: () => context.isCurrent() ? context.userId : null };
  const local = await prepareLocalAssociationReview(reviewContext);
  const online = await prepareRemoteAssociationReview(local, reviewContext, transport);
  if (online.remoteSummary !== null || online.revision !== 'empty') {
    throw new Error('Esta conta já tem uma jornada. Receba o progresso salvo em vez de começar do zero.');
  }
  check();
  const archive = await createProgressBackup(snapshot);
  const journal = await prepareRestoreJournal(baseline.pair, archive, context.origin);
  check();
  await runExclusiveRestore(context, { mode: 'apply', journal, previousBackup: null, replacementConfirmed: true });
  const applied = await reviewPendingRestore(storage, context.origin);
  if (!applied || applied.outcome !== 'keep-target' || (['core', 'fitness'] as const).some(part =>
    applied.baseline.pair[part] !== JSON.stringify({ state: snapshot.stores[part].state, version: snapshot.stores[part].version })
  )) throw new Error('Confira a criação interrompida antes de continuar.');
  await runExclusiveRestore(context, { mode: 'local', expected: applied.baseline, localUseConfirmed: true });
  const initial = readWorkspaceBaseline(storage, context.origin);
  // There was no previous progress to export. Only this newly created empty
  // projection is eligible; all later sends keep their saved-copy requirement.
  const sent = await beginAccountTransfer(context, {
    baseline: initial, previousCopy: archive, allProfilesConfirmed: true, userId: context.userId,
  }, transport);
  await finishAccountTransferLocally(context, {
    raw: sent.raw, localUseConfirmed: true, bindAccountConfirmed: true,
  }, transport);
  if (!context.isCurrent() || storage.getItem(ACCOUNT_INTENT_KEY) !== null || storage.getItem(ACCOUNT_RESOLUTION_KEY) !== null) {
    throw new Error('Confira o início da jornada antes de abrir o app.');
  }
  const bindingRaw = storage.getItem(ACCOUNT_BINDING_KEY);
  if (!bindingRaw) throw new Error('Confira o vínculo antes de abrir sua jornada.');
  return { receipt: sent.receipt, bindingRaw };
}
