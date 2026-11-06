import { applyReminderCommand, createOccurrenceReminder, isReminderDue, reminderKey, type OccurrenceReminder, type ReminderCommand } from './occurrence-reminder';
import { buildTemporalCommitments, buildTemporalEvents, type TemporalSnapshot } from '@/lib/temporal/selectors';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';

import { readProfileReminders, type ProfileReminders } from './profile-reminder-codec';
export { readProfileReminders, type ProfileReminders } from './profile-reminder-codec';
export type ReminderMutation = { kind: 'configure'; sourceType: 'task' | 'habit' | 'commitment'; sourceId: string; day: string; time: string }
  | { kind: 'command'; key: string; command: ReminderCommand };

function occurrence(snapshot: TemporalSnapshot, reminder: OccurrenceReminder) {
  const { sourceType, sourceId, day } = reminder.occurrence;
  // First integration deliberately supports sources with existing daily completion contracts.
  if (!['habit', 'task', 'commitment'].includes(sourceType)) return null;
  const date = dateFromInput(day)!;
  const completed = buildTemporalEvents(snapshot).some(event => event.sourceType === sourceType && event.sourceId === sourceId && dateToInput(event.occurredAt) === day);
  return completed ? null : buildTemporalCommitments(snapshot, date, date).find(item => item.sourceType === sourceType && item.sourceId === sourceId) ?? null;
}

/** CAS inside one store instance. Durable/multitab coordination is a separate activation gate. */
export function mutateProfileReminders(snapshot: TemporalSnapshot, value: unknown, expectedRevision: number, mutation: ReminderMutation): ProfileReminders {
  const current = readProfileReminders(value);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision !== current.revision) throw new Error('Os lembretes mudaram. Atualize antes de gravar.');
  if (current.revision === Number.MAX_SAFE_INTEGER) throw new Error('Limite de revisões dos lembretes.');
  let next: OccurrenceReminder;
  if (mutation.kind === 'configure') {
    const key = reminderKey({ sourceType: mutation.sourceType, sourceId: mutation.sourceId, day: mutation.day });
    if (current.items.some(item => item.key === key)) throw new Error('Já existe aviso para esta ocorrência. Use suas ações para adiar ou dispensar.');
    const stub = { occurrence: { sourceType: mutation.sourceType, sourceId: mutation.sourceId, day: mutation.day } } as OccurrenceReminder;
    const source = occurrence(snapshot, stub);
    if (!source) throw new Error('A ocorrência não está disponível ou já foi concluída.');
    if (current.items.length >= 1000) throw new Error('Limite de avisos atingido. Revise os registros antes de adicionar.');
    next = createOccurrenceReminder(source, mutation.time);
  } else {
    const existing = current.items.find(item => item.key === mutation.key);
    if (!existing) throw new Error('Aviso não encontrado neste perfil.');
    if (mutation.command.action !== 'dismiss' && !occurrence(snapshot, existing)) throw new Error('A ocorrência não está disponível ou já foi concluída.');
    next = applyReminderCommand(existing, mutation.command);
    if (next === existing) return current;
  }
  // Return owned JSON data so consumers cannot mutate the persisted profile through aliases.
  return JSON.parse(JSON.stringify({ schema: 1, revision: current.revision + 1, items: [...current.items.filter(item => item.key !== next.key), next] })) as ProfileReminders;
}

export function dueProfileReminders(snapshot: TemporalSnapshot, value: unknown, now: string): OccurrenceReminder[] {
  return readProfileReminders(value).items.filter(item => isReminderDue(item, now, !!occurrence(snapshot, item), false));
}
