import type { Habit } from '@/types';
import { recurrenceMatchesDate } from './recurrence';

// Same eligibility predicate used by the existing calendar; no new recurrence rules.
export const habitMatchesDate = (habit: Habit, date: Date | string | number): boolean => {
  return recurrenceMatchesDate(habit, date);
};
