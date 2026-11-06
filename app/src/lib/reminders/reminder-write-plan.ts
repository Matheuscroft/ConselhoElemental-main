import type { StoredProgress } from '@/lib/backup/restore-journal';
import { validateStoredProgress } from '@/lib/backup/stored-progress';
import { mutateProfileReminders, type ReminderMutation, type ProfileReminders } from './profile-reminders';
import type { TemporalSnapshot } from '@/lib/temporal/selectors';

export interface ReminderWritePlan {
  before: StoredProgress;
  accountId: string | null;
  userId: string;
  expectedRevision: number;
  target: ProfileReminders;
}
/** Preparation with domain projections, outside the pre-bootstrap coordinator. No I/O. */
export function planReminderWrite(before: StoredProgress, origin: string, accountId: string | null, userId: string, revision: number, mutation: ReminderMutation): ReminderWritePlan {
  const frozen = { ...before };
  const snapshot = validateStoredProgress(frozen, origin);
  if (!snapshot) throw new Error('Não há progresso para preparar o aviso.');
  const state = snapshot.stores.core.state;
  const user = state.user as { id: string; reminderState?: ProfileReminders };
  if (state.currentAccountId !== accountId || user.id !== userId) throw new Error('O perfil mudou. Confira o aviso novamente.');
  const target = mutateProfileReminders(state as unknown as TemporalSnapshot, user.reminderState, revision, mutation);
  return JSON.parse(JSON.stringify({ before: frozen, accountId, userId, expectedRevision: revision, target })) as ReminderWritePlan;
}
