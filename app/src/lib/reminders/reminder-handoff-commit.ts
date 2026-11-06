import { REMINDER_WRITES_RELEASED } from './reminder-release';
import { runExclusiveReminderWrite } from './exclusive-reminder-write';
import { readStagedReminderPlan, REMINDER_HANDOFF_KEY } from './reminder-handoff';

/** Binds the exact tab transport to the coordinator's repeated freshness checks. */
export async function commitStagedReminder(context: Parameters<typeof runExclusiveReminderWrite>[0], session: Pick<Storage,'getItem'>, expectedRaw: string) {
  if(!REMINDER_WRITES_RELEASED)throw new Error('A gravação coordenada de lembretes ainda não foi liberada.');
  const ctx={...context};
  const plan=await readStagedReminderPlan(session,ctx.origin,expectedRaw);
  return runExclusiveReminderWrite({...ctx,isCurrent:()=>session.getItem(REMINDER_HANDOFF_KEY)===expectedRaw && ctx.isCurrent?.()!==false},plan);
}
