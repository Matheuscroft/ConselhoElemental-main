import type { Commitment, Habit } from '@/types';
import { dateToInput, validateRecurrence } from './recurrence';
import { toValidDate, toDayStamp } from './date';

/** Uses existing entities/commands. No annual copies or independent completion ledger. */
export function createAnnualEntry(commands: {
  addHabit: (input: Partial<Habit>) => Habit;
  addCommitment: (input: { title: string; date: Date; recurrence: Commitment['recurrence']; untilDate?: string; description?: string }) => Commitment;
}, input: { title: string; notes: string; category: 'task' | 'birthday'; date: Date; untilDate?: Date | null }) {
  const title = input.title.trim();
  const date = toValidDate(input.date);
  const until = toValidDate(input.untilDate);
  if (!title || !date || (input.untilDate != null && !until)) throw new Error('Informe o nome e uma data válida.');
  if (until && toDayStamp(until)! < toDayStamp(date)!) throw new Error('A data final deve ser igual ou posterior ao início.');
  const config = { month: date.getMonth() + 1, day: date.getDate(), ...(until ? { until: dateToInput(until) } : {}) };
  validateRecurrence('YEARLY', config);
  if (input.category === 'birthday') {
    return commands.addCommitment({ title: `Aniversário: ${title}`, description: input.notes.trim(), date: new Date(date), recurrence: 'YEARLY', ...(until ? { untilDate: config.until } : {}) });
  }
  return commands.addHabit({ name: title, title, description: input.notes.trim(), areaId: 'sem-categoria',
    startDate: new Date(date), recurrenceType: 'YEARLY', recurrenceConfig: config });
}
