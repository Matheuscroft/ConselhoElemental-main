import type { TemporalCommitment } from '@/lib/temporal/selectors';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';

export type ReminderSource = Exclude<TemporalCommitment['sourceType'], 'google'>;
export type ReminderOccurrence = { sourceType: ReminderSource; sourceId: string; day: string };
export type ReminderAction = 'one-hour' | 'tomorrow-nine' | 'tomorrow-same-time' | 'dismiss';
export type ReminderCommand = { id: string; expectedRevision: number; action: ReminderAction; at: string };
export type OccurrenceReminder = {
  schema: 1;
  key: string;
  occurrence: ReminderOccurrence;
  /** Frozen instant; editing an alert never edits the activity's date or recurrence. */
  dueAt: string;
  status: 'scheduled' | 'dismissed';
  revision: number;
  lastCommand?: ReminderCommand;
};

function validId(value: string) {
  if (typeof value !== 'string' || !value.trim() || value.length > 256) throw new Error('Identificador de lembrete inválido.');
}
function instant(value: string): Date {
  const date = new Date(value);
  if (typeof value !== 'string' || !Number.isFinite(date.getTime()) || date.toISOString() !== value) throw new Error('Use um instante ISO válido em UTC.');
  return date;
}
function localTime(day: string, time: string): Date {
  const date = dateFromInput(day);
  if (!date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Escolha data e horário válidos.');
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  // Reject spring-forward gaps instead of silently moving the user's chosen time.
  if (dateToInput(date) !== day || date.getHours() !== hours || date.getMinutes() !== minutes) throw new Error('Esse horário não existe nesta data no fuso do dispositivo.');
  return date;
}
function validateOccurrence(occurrence: ReminderOccurrence) {
  if (!['task', 'habit', 'sequence', 'project', 'quest', 'mission', 'commitment'].includes(occurrence.sourceType)) throw new Error('Origem não suportada para lembrete local.');
  validId(occurrence.sourceId);
  if (!dateFromInput(occurrence.day)) throw new Error('Escolha a data da ocorrência.');
}
export function reminderKey(occurrence: ReminderOccurrence): string {
  validateOccurrence(occurrence);
  return JSON.stringify([occurrence.sourceType, occurrence.sourceId, occurrence.day]);
}

/** Consumes an existing projected occurrence. Does not generate a second recurrence model. */
export function createOccurrenceReminder(item: Pick<TemporalCommitment, 'sourceType' | 'sourceId' | 'date'>, time: string): OccurrenceReminder {
  if (item.sourceType === 'google') throw new Error('Eventos externos não recebem lembretes locais automaticamente.');
  const occurrence = { sourceType: item.sourceType, sourceId: item.sourceId, day: dateToInput(item.date) };
  return { schema: 1, key: reminderKey(occurrence), occurrence, dueAt: localTime(occurrence.day, time).toISOString(), status: 'scheduled', revision: 0 };
}

function validateReminder(reminder: OccurrenceReminder) {
  if (reminder.schema !== 1 || reminder.key !== reminderKey(reminder.occurrence) || !Number.isSafeInteger(reminder.revision) || reminder.revision < 0
    || !['scheduled', 'dismissed'].includes(reminder.status)) throw new Error('Estado de lembrete inválido.');
  instant(reminder.dueAt);
}

/** Pure transition with caller-supplied time/revision. No timer, storage or reward side effects. */
export function applyReminderCommand(reminder: OccurrenceReminder, command: ReminderCommand): OccurrenceReminder {
  validateReminder(reminder); validId(command.id);
  if (!Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 0) throw new Error('Revisão de lembrete inválida.');
  const now = instant(command.at);
  if (!['one-hour', 'tomorrow-nine', 'tomorrow-same-time', 'dismiss'].includes(command.action)) throw new Error('Ação de lembrete inválida.');
  if (reminder.lastCommand?.id === command.id) {
    if (reminder.lastCommand.action !== command.action || reminder.lastCommand.at !== command.at || reminder.lastCommand.expectedRevision !== command.expectedRevision) throw new Error('Comando repetido com conteúdo diferente.');
    return reminder;
  }
  if (command.expectedRevision !== reminder.revision) throw new Error('O lembrete mudou. Atualize antes de tentar novamente.');
  if (reminder.status !== 'scheduled') throw new Error('Este aviso já foi dispensado.');
  if (reminder.lastCommand && now < instant(reminder.lastCommand.at)) throw new Error('Comando anterior à última alteração do aviso.');
  if (reminder.revision === Number.MAX_SAFE_INTEGER) throw new Error('Limite de revisões do aviso atingido.');
  let dueAt = reminder.dueAt;
  if (command.action === 'one-hour') dueAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  else if (command.action !== 'dismiss') {
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const previous = instant(reminder.dueAt);
    const time = command.action === 'tomorrow-nine' ? '09:00' : `${String(previous.getHours()).padStart(2, '0')}:${String(previous.getMinutes()).padStart(2, '0')}`;
    dueAt = localTime(dateToInput(tomorrow), time).toISOString();
  }
  return { ...reminder, dueAt, status: command.action === 'dismiss' ? 'dismissed' : 'scheduled', revision: reminder.revision + 1, lastCommand: { ...command } };
}

/** Caller must supply whether the real activity is completed, deleted or disabled. */
export function isReminderDue(reminder: OccurrenceReminder, now: string, sourceAvailable: boolean, occurrenceCompleted: boolean): boolean {
  validateReminder(reminder);
  return reminder.status === 'scheduled' && sourceAvailable && !occurrenceCompleted && instant(reminder.dueAt) <= instant(now);
}
