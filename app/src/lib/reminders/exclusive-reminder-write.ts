import { REMINDER_WRITES_RELEASED } from './reminder-release';
import { readProfileReminders } from './profile-reminder-codec';
import type { ReminderWritePlan } from './reminder-write-plan';
import { validateStoredProgress } from '@/lib/backup/stored-progress';
import { createProgressBackup } from '@/lib/backup/progress-backup';
import { prepareRestoreJournal } from '@/lib/backup/restore-journal';
import { runExclusiveRestore } from '@/lib/backup/exclusive-restore';

type Context = Parameters<typeof runExclusiveRestore>[0] & { reminderConfirmed: boolean };

/** Closed pre-bootstrap path, using the existing global lease/journal/readback.
 * It does not mount stores, initialize Auth, or automatically retry/recover.
 */
export async function runExclusiveReminderWrite(context: Context, input: ReminderWritePlan): Promise<'applied'> {
  if (!REMINDER_WRITES_RELEASED) throw new Error('A gravação coordenada de lembretes ainda não foi liberada.');
  // Freeze caller-controlled consent and plan before hashing or acquiring the lease.
  const ctx = { ...context };
  if (ctx.reminderConfirmed !== true) throw new Error('Confirme a alteração do aviso antes de continuar.');
  const plan = JSON.parse(JSON.stringify(input)) as ReminderWritePlan;
  const current = validateStoredProgress(plan.before, ctx.origin);
  if (!current) throw new Error('Progresso de origem ausente.');
  const user = current.stores.core.state.user as Record<string, unknown>;
  const previous = readProfileReminders(user.reminderState);
  const targetMetadata = readProfileReminders(plan.target);
  if (current.stores.core.state.currentAccountId !== plan.accountId || user.id !== plan.userId || previous.revision !== plan.expectedRevision) throw new Error('O perfil ou a revisão do aviso mudou.');
  if (targetMetadata.revision !== previous.revision + 1) throw new Error('O destino precisa ser uma nova revisão de avisos.');
  // Construct the destination internally: caller cannot replace XP, activities, IDs or Fitness.
  const target = JSON.parse(JSON.stringify(current)) as typeof current;
  (target.stores.core.state.user as Record<string, unknown>).reminderState = targetMetadata;
  const previousBackup = await createProgressBackup(current);
  const nextBackup = await createProgressBackup(target);
  const journal = await prepareRestoreJournal(plan.before, nextBackup, ctx.origin);
  await runExclusiveRestore(ctx, { mode: 'apply', journal, previousBackup, replacementConfirmed: true });
  return 'applied';
}
