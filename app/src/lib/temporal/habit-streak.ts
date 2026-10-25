import type { Habit } from '@/types';
import { addDays, toDayStamp, toValidDate } from './date';
import { habitMatchesDate } from './habit-schedule';

export type HabitStreakRule = 'scheduled' | 'legacy-rotation' | 'legacy-yearly';

export function habitStreakRule(schedule: Habit, rotates = false): HabitStreakRule {
  if (rotates || schedule.controlledBySequenceId) return 'legacy-rotation';
  // YEARLY currently has no annual configuration in the calendar contract.
  return schedule.recurrenceType === 'YEARLY' ? 'legacy-yearly' : 'scheduled';
}

/** Children use the root's agenda, never their creation-time copy of it. */
export function findHabitScheduleRoot(habits: readonly Habit[], id: string): Habit | undefined {
  const contains = (habit: Habit): boolean => habit.id === id || habit.childHabits.some(contains);
  return habits.find(contains);
}

/**
 * Recorded run ending at the last eligible completion, not a live overdue counter.
 * Uses the calendar's current schedule (there is no versioned schedule history).
 * Off-schedule receipts stay intact but do not earn an extra scheduled occurrence.
 * Rotations/annual schedules retain calendar-day behavior until their history exists.
 */
export function calculateHabitStreak(
  completions: readonly { completionDate: Date | string }[],
  schedule: Habit,
  rotates = false,
) {
  const rule = habitStreakRule(schedule, rotates);
  const validDates = completions.map(item => toValidDate(item.completionDate)).filter((date): date is Date => date !== null);
  const lastCompletedAt = validDates.length ? new Date(validDates.reduce((latest, date) => Math.max(latest, date.getTime()), -Infinity)) : null;
  const isScheduled = (date: Date) => rule !== 'scheduled' || habitMatchesDate(schedule, date);
  const dates = [...new Set(validDates.filter(isScheduled).map(date => toDayStamp(date)!))].sort((a, b) => a - b);
  let streak = 0;
  let longestStreak = 0;
  for (let index = 0; index < dates.length; index++) {
    let missed = index === 0;
    if (index > 0) {
      // Calendar arithmetic survives DST; no division by 24-hour durations.
      for (let day = addDays(new Date(dates[index - 1]), 1); day.getTime() < dates[index]; day = addDays(day, 1)) {
        if (isScheduled(day)) { missed = true; break; }
      }
    }
    streak = missed ? 1 : streak + 1;
    longestStreak = Math.max(longestStreak, streak);
  }
  return { streak, longestStreak, lastCompletedAt, rule };
}
