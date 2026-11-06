import { REMINDER_HANDOFF_KEY } from './reminder-handoff-key';

/** Explicit account/restore routes keep priority. Presence of a tab plan never authorizes writes. */
export function needsReminderWorkspace(search: string, session: () => Pick<Storage, 'getItem'>): boolean {
  const selected = new URLSearchParams(search).get('progresso');
  if (selected === 'conta' || selected === 'restaurar') return false;
  return selected === 'lembretes' || session().getItem(REMINDER_HANDOFF_KEY) !== null;
}
