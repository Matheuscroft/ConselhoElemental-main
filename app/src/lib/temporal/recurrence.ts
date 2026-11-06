import type { RecurrenceConfig, RecurrenceType } from '@/types';
import { toDayStamp, toValidDate } from './date';

export interface RecurrenceSchedule {
  recurrenceType: RecurrenceType;
  recurrenceConfig: RecurrenceConfig;
  createdAt: Date | string;
  startDate?: Date | string;
}

/** Read-only projection; never rewrites legacy configurations or completion receipts. */
export function recurrenceMatchesDate(schedule: RecurrenceSchedule, value: Date | string | number): boolean {
  const date = toValidDate(value);
  const start = toValidDate(schedule.startDate ?? schedule.createdAt);
  if (!date || !start || toDayStamp(date)! < toDayStamp(start)!) return false;
  const config = schedule.recurrenceConfig;
  if (config.until) {
    try {
      const until = dateFromInput(config.until);
      if (!until || toDayStamp(date)! > toDayStamp(until)!) return false;
    } catch { return false; }
  }
  switch (schedule.recurrenceType) {
    case 'DAILY':
    case 'WEEKLY':
      return config.daysOfWeek?.includes(date.getDay()) ?? true;
    case 'MONTHLY':
      // Preserve older empty schedules. New forms must supply explicit days.
      return config.daysOfMonth?.includes(date.getDate()) ?? true;
    case 'YEARLY': {
      // Compatibility with the pre-existing Temporal annual projection, without migration.
      const month = config.month ?? start.getMonth() + 1;
      const day = config.day ?? start.getDate();
      return date.getMonth() + 1 === month && date.getDate() === day;
    }
    default:
      return false;
  }
}

export function defaultRecurrenceConfig(type: RecurrenceType, anchor: Date): RecurrenceConfig {
  if (type === 'YEARLY') return { month: anchor.getMonth() + 1, day: anchor.getDate() };
  if (type === 'MONTHLY') return { daysOfMonth: [anchor.getDate()] };
  return { daysOfWeek: type === 'WEEKLY' ? [anchor.getDay()] : [0, 1, 2, 3, 4, 5, 6] };
}

/** Validation applies to explicit agenda edits, not passive reads of old records. */
export function validateRecurrence(type: RecurrenceType, config: RecurrenceConfig, startDate?: Date | string): void {
  if (config.until !== undefined) {
    const until = dateFromInput(config.until);
    if (!until) throw new Error('Escolha a data final da recorrência.');
    if (startDate && toDayStamp(until)! < toDayStamp(startDate)!) throw new Error('A data final deve ser igual ou posterior ao início.');
  }
  if (type === 'DAILY' || type === 'WEEKLY' || type === 'MONTHLY') {
    const days = type === 'MONTHLY' ? config.daysOfMonth : config.daysOfWeek;
    const min = type === 'MONTHLY' ? 1 : 0;
    const max = type === 'MONTHLY' ? 31 : 6;
    if (!days?.length || days.some(day => !Number.isInteger(day) || day < min || day > max)) {
      throw new Error(type === 'MONTHLY' ? 'Escolha pelo menos um dia do mês.' : 'Escolha pelo menos um dia da semana.');
    }
    return;
  }
  if (type !== 'YEARLY' || !Number.isInteger(config.month) || !Number.isInteger(config.day)
    || config.month! < 1 || config.month! > 12 || config.day! < 1
    || config.day! > new Date(2000, config.month!, 0).getDate()) {
    throw new Error('Escolha um mês e um dia válidos para a recorrência anual.');
  }
}

/** HTML date controls represent a local calendar date, never UTC midnight. */
export function dateFromInput(value: string): Date | null {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Escolha uma data válida.');
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  if (year < 1 || date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) throw new Error('Escolha uma data válida.');
  return date;
}

export function dateToInput(value: Date | string | null | undefined): string {
  const date = operationalDate(value);
  return date ? `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '';
}

/** Read calendar keys locally; retain compatibility with older ISO timestamps. */
export function operationalDate(value: Date | string | null | undefined): Date | null {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    try { return dateFromInput(value); } catch { return null; }
  }
  return toValidDate(value);
}

export function operationalDateKey(value: Date | string | null | undefined): string | null {
  if (value == null || value === '') return null;
  const key = dateToInput(value);
  if (!key) throw new Error('Escolha uma data válida.');
  return key;
}
