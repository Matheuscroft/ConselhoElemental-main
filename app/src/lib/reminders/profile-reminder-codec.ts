import { applyReminderCommand, isReminderDue, type OccurrenceReminder, type ReminderCommand } from './occurrence-reminder';

export type ProfileReminders = { schema: 1; revision: number; items: OccurrenceReminder[] };
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const keys = (v: Record<string, unknown>, required: string[], optional: string[] = []) => required.every(k => Object.hasOwn(v, k)) && Object.keys(v).every(k => [...required, ...optional].includes(k));

/** Optional on old profiles. Reject malformed metadata without dropping any saved records. */
export function readProfileReminders(value: unknown): ProfileReminders {
  if (value === undefined) return { schema: 1, revision: 0, items: [] };
  if (!record(value) || !keys(value, ['schema', 'revision', 'items']) || value.schema !== 1 || !Number.isSafeInteger(value.revision) || (value.revision as number) < 0 || !Array.isArray(value.items) || value.items.length > 1000) throw new Error('Metadados de lembretes incompatíveis. Preserve a cópia para revisão.');
  const seen = new Set<string>();
  for (const item of value.items) {
    if (!record(item) || !keys(item, ['schema', 'key', 'occurrence', 'dueAt', 'status', 'revision'], ['lastCommand']) || !record(item.occurrence) || !keys(item.occurrence, ['sourceType', 'sourceId', 'day'])) throw new Error('Registro de lembrete incompleto.');
    const reminder = item as unknown as OccurrenceReminder;
    // Also validates instant, identity, revision and status, without reading storage.
    isReminderDue(reminder, '2000-01-01T00:00:00.000Z', true, false);
    if (seen.has(reminder.key)) throw new Error('Ocorrência de lembrete duplicada.');
    seen.add(reminder.key);
    if (reminder.revision === 0) {
      if (reminder.lastCommand !== undefined || reminder.status !== 'scheduled') throw new Error('Estado inicial do lembrete incompatível.');
    } else {
      const cmd = item.lastCommand;
      if (!record(cmd) || !keys(cmd, ['id', 'expectedRevision', 'action', 'at']) || cmd.expectedRevision !== reminder.revision - 1
        || (reminder.status === 'dismissed') !== (cmd.action === 'dismiss')) throw new Error('Histórico do comando de lembrete incompatível.');
      applyReminderCommand(reminder, cmd as unknown as ReminderCommand);
    }
  }
  return value as unknown as ProfileReminders;
}
