export function shouldCelebrateStreak(before: { habitId: string; value: number; completionCount: number }, after: { habitId: string; value: number; completionCount: number }) {
  return before.habitId === after.habitId && Number.isFinite(after.value) && after.value > before.value && after.completionCount > before.completionCount;
}

/** A view of recorded dates, not a schedule or a second streak calculator. */
export function recordedCompletionWeek(reference: Date, completions: readonly { completionDate: Date | string }[]) {
  if (Number.isNaN(reference.getTime())) return [];
  const days = new Set(completions.flatMap(item => {
    const date = new Date(item.completionDate);
    return Number.isNaN(date.getTime()) ? [] : [date.toDateString()];
  }));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(reference);
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - 6 + index);
    return { date, completed: days.has(date.toDateString()) };
  });
}
