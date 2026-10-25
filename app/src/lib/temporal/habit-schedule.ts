import type { Habit } from '@/types';
import { toValidDate, toDayStamp } from './date';

// Same eligibility predicate used by the existing calendar; no new recurrence rules.
export const habitMatchesDate = (habit: Habit, date: Date | string | number): boolean => {
  const targetDate = toValidDate(date);
  if (!targetDate) return false;

  const dayOfWeek = targetDate.getDay();
  const dayOfMonth = targetDate.getDate();
  const targetDay = toDayStamp(targetDate);
  const startDay = toDayStamp(habit.startDate ?? habit.createdAt);

  if (targetDay == null || startDay == null) return false;

  if (targetDay < startDay) return false;

  if (habit.recurrenceType === 'DAILY' || habit.recurrenceType === 'WEEKLY') {
    return habit.recurrenceConfig.daysOfWeek?.includes(dayOfWeek) ?? true;
  }
  if (habit.recurrenceType === 'MONTHLY') {
    return habit.recurrenceConfig.daysOfMonth?.includes(dayOfMonth) ?? true;
  }
  return true;
};
