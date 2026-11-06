import type { ElementId, Habit } from '@/types';
import { dailyDateKey } from '@/lib/cycles/daily-tracking';
export interface CycleCompletionEvent { id: string; name: string; points: number; xp: number; elementId?: ElementId }
export function cycleCompletionEvents(before: readonly Habit[], after: readonly Habit[], date: Date): CycleCompletionEvent[] {
  const old = new Map<string, Habit>();
  const visit = (habits: readonly Habit[]) => habits.forEach(habit => { old.set(habit.id, habit); visit(habit.childHabits); });
  visit(before);
  const key = dailyDateKey(date);
  const events: CycleCompletionEvent[] = [];
  const find = (habits: readonly Habit[]) => {
    for (const habit of habits) {
      const previous = old.get(habit.id);
      if (previous && habit.semanticType !== 'NOTE' && habit.semanticType !== 'text') {
        const oldIds = new Set(previous.completions.map(item => item.id));
        for (const item of habit.completions) {
          const day = new Date(item.completionDate);
          if (!oldIds.has(item.id) && !Number.isNaN(day.getTime()) && dailyDateKey(day) === key) {
            events.push({ id: item.id, name: habit.name, points: Number.isFinite(item.scoreEarned) ? item.scoreEarned : 0, xp: typeof item.xpAwarded === 'number' && Number.isFinite(item.xpAwarded) ? Math.max(0, item.xpAwarded) : 0, elementId: item.xpElementId });
          }
        }
      }
      find(habit.childHabits);
    }
  };
  find(after);
  return events;
}

/** Existing single-result reader retained for callers; no writes or rewards. */
export function newCycleCompletion(before: readonly Habit[], after: readonly Habit[], date: Date): CycleCompletionEvent | null {
  const events = cycleCompletionEvents(before, after, date);
  return events.length ? { ...events[0], points: events.reduce((sum, event) => sum + event.points, 0), xp: events.reduce((sum, event) => sum + event.xp, 0) } : null;
}

/** Presentation-only burst; drop reversed receipts and deduplicate repeated notifications. */
export function reconcileCompletionBurst(pending: readonly CycleCompletionEvent[], incoming: readonly CycleCompletionEvent[], habits: readonly Habit[], date: Date): CycleCompletionEvent[] {
  const valid = new Set<string>();
  const key = dailyDateKey(date);
  const visit = (items: readonly Habit[]) => items.forEach(habit => {
    habit.completions.forEach(receipt => {
      const day = new Date(receipt.completionDate);
      if (!Number.isNaN(day.getTime()) && dailyDateKey(day) === key) valid.add(receipt.id);
    });
    visit(habit.childHabits);
  });
  visit(habits);
  return [...new Map([...pending, ...incoming].filter(event => valid.has(event.id)).map(event => [event.id, event])).values()];
}
