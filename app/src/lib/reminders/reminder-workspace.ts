import { ACCOUNT_BINDING_KEY } from '@/lib/backup/account-binding';
import { ACCOUNT_INTENT_KEY } from '@/lib/backup/account-intent';
import { ACCOUNT_RESOLUTION_KEY } from '@/lib/backup/account-resolution-key';
import { runExclusiveRestore } from '@/lib/backup/exclusive-restore';
import { LOCAL_PROGRESS_MODE_KEY, validateLocalProgressMode } from '@/lib/backup/progress-mode';
import { inspectProgressBackup, STORE_KEYS } from '@/lib/backup/progress-backup';
import { progressFingerprint } from '@/lib/backup/restore-comparison';
import { assertPendingRestoreReview, createRecoverySafetyCopy, reviewPendingRestore, RESTORE_JOURNAL_KEY } from '@/lib/backup/restore-journal';
import { validateStoredProgress } from '@/lib/backup/stored-progress';
import { cancelReminderHandoff, finishReminderHandoff, REMINDER_HANDOFF_KEY, reviewReminderHandoff } from './reminder-handoff';
import { commitStagedReminder } from './reminder-handoff-commit';
import { REMINDER_WRITES_RELEASED } from './reminder-release';
import { readProfileReminders } from './profile-reminder-codec';

type ReadStorage = Pick<Storage, 'getItem'>;
type Context = Parameters<typeof commitStagedReminder>[0];
const accountKeys = [ACCOUNT_BINDING_KEY, ACCOUNT_INTENT_KEY, ACCOUNT_RESOLUTION_KEY] as const;
export const REMINDER_WATCH_KEYS = [...accountKeys, LOCAL_PROGRESS_MODE_KEY, RESTORE_JOURNAL_KEY, STORE_KEYS.core, STORE_KEYS.fitness];
const accountState = (storage: ReadStorage) => accountKeys.map(key => storage.getItem(key));
function stale(): never { throw new Error('A conferência mudou. Confira novamente antes de confirmar.'); }
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

/** Read-only pre-bootstrap review. Bind BOTH journal snapshots to this exact tab plan. */
export async function reviewReminderWorkspace(session: ReadStorage, storage: ReadStorage, origin: string) {
  const accounts = accountState(storage);
  const handoff = await reviewReminderHandoff(session, storage, origin);
  if (!handoff) {
    return { handoff: null, recovery: null, accounts, localOnly: false, orphanRecovery: storage.getItem(RESTORE_JOURNAL_KEY) !== null, changes: [] };
  }
  const localOnly = validateLocalProgressMode(handoff.baseline.mode, origin);
  const before = validateStoredProgress(handoff.plan.before, origin)!;
  const target = JSON.parse(JSON.stringify(before)) as typeof before;
  (target.stores.core.state.user as Record<string, unknown>).reminderState = handoff.plan.target;
  const recovery = handoff.status === 'pending-recovery' ? await reviewPendingRestore(storage, origin) : null;
  if (handoff.status === 'pending-recovery') {
    if (!recovery) stale();
    for (const [side, expected] of [['before', before], ['target', target]] as const) {
      const text = await createRecoverySafetyCopy(storage, recovery, side, origin);
      const { backup } = await inspectProgressBackup(text);
      if (progressFingerprint(backup) !== progressFingerprint(expected)) throw new Error('A recuperação pendente pertence a outra operação. Abra a conferência de recuperação; seu progresso foi preservado.');
    }
    assertPendingRestoreReview(storage, recovery);
  }
  const fresh = await reviewReminderHandoff(session, storage, origin);
  if (!fresh || fresh.raw !== handoff.raw || !same(fresh.baseline, handoff.baseline) || !same(accounts, accountState(storage))) stale();
  const previous = readProfileReminders((before.stores.core.state.user as Record<string, unknown>).reminderState);
  const lists: Readonly<Record<string, string>> = { task: 'tasks', habit: 'habits', commitment: 'commitments', project: 'projects', quest: 'quests' };
  const changes = handoff.plan.target.items.filter(item => !same(previous.items.find(old => old.key === item.key), item)).map(item => {
    const sourceRows = before.stores.core.state[lists[item.occurrence.sourceType]];
    const rows = Array.isArray(sourceRows) ? sourceRows as Record<string, unknown>[] : [];
    const row = rows.find(row => row.id === item.occurrence.sourceId);
    const label = typeof row?.title === 'string' ? row.title : typeof row?.name === 'string' ? row.name : 'Atividade';
    return { key: item.key, label, day: item.occurrence.day, dueAt: item.dueAt, status: item.status };
  });
  return { handoff, recovery, accounts, localOnly, orphanRecovery: false, changes };
}
export type ReminderWorkspaceReview = Awaited<ReturnType<typeof reviewReminderWorkspace>>;
export type ReminderWorkspaceAction = 'apply' | 'recover' | 'local' | 'finish' | 'cancel';

/** No automatic consent or mode conversion. UI passes the exact review it displayed. */
export async function runReminderWorkspaceAction(input: Context, session: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>, expected: ReminderWorkspaceReview, action: ReminderWorkspaceAction, confirmed: boolean): Promise<'review' | 'exit'> {
  if (confirmed !== true) throw new Error('Confirme esta ação antes de continuar.');
  if (action !== 'cancel' && !REMINDER_WRITES_RELEASED) throw new Error('A gravação de lembretes ainda não foi liberada.');
  const ctx = { ...input }, selected = JSON.parse(JSON.stringify(expected)) as ReminderWorkspaceReview;
  if (!selected.handoff) stale();
  const storage = ctx.storage();
  const current = () => ctx.isCurrent?.() !== false && session.getItem(REMINDER_HANDOFF_KEY) === selected.handoff!.raw
    && same(accountState(storage), selected.accounts) && storage.getItem(LOCAL_PROGRESS_MODE_KEY) === selected.handoff!.baseline.mode;
  if (!current()) stale();
  const fresh = await reviewReminderWorkspace(session, storage, ctx.origin);
  if (!current() || !fresh.handoff || fresh.handoff.raw !== selected.handoff.raw || fresh.handoff.status !== selected.handoff.status
    || !same(fresh.handoff.baseline, selected.handoff.baseline) || !same(fresh.accounts, selected.accounts)
    || !same(fresh.recovery?.baseline, selected.recovery?.baseline)) stale();
  if (action === 'cancel') {
    await cancelReminderHandoff(session, storage, ctx.origin, selected.handoff.raw);
    return 'exit';
  }
  if (fresh.accounts.some(value => value !== null)) throw new Error('Há um vínculo ou uma conferência de conta. Este fluxo de lembretes ainda não atende progresso conectado.');
  if (ctx.otherTabsClosed !== true) throw new Error('Feche as outras abas do app antes de continuar.');
  if (action === 'apply') {
    if (fresh.handoff.status !== 'prepared' || !fresh.localOnly) throw new Error('A gravação exige o mesmo progresso já configurado para uso somente local. Nenhuma preferência foi alterada.');
    await commitStagedReminder({ ...ctx, isCurrent: current }, session, selected.handoff.raw);
  } else if (action === 'recover' || action === 'local') {
    const recovery = fresh.recovery;
    if (!recovery || recovery.outcome !== (action === 'recover' ? 'rollback' : 'keep-target')) stale();
    await runExclusiveRestore({ ...ctx, isCurrent: current }, action === 'recover'
      ? { mode: 'recover', expected: recovery.baseline, recoveryConfirmed: true }
      : { mode: 'local', expected: recovery.baseline, localUseConfirmed: true });
  } else if (action === 'finish') {
    if (!fresh.localOnly || fresh.handoff.status !== 'committed') stale();
    await finishReminderHandoff(session, storage, ctx.origin, selected.handoff.raw, true);
    return 'exit';
  } else stale();
  return 'review';
}
