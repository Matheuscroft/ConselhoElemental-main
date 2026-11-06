import type { ElementId, Habit, User } from '@/types';

const keys = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' } as const;

/** Accounting only: old receipts without an explicit award never credit or debit XP. */
function recordedXp(habits: readonly Habit[]) {
  const totals: Record<ElementId, number> = { terra: 0, fogo: 0, agua: 0, ar: 0 };
  const seen = new Set<string>();
  const walk = (items: readonly Habit[]) => items.forEach(habit => {
    habit.completions.forEach(receipt => {
      const { xpAwarded, xpElementId } = receipt;
      if (seen.has(receipt.id)) return;
      seen.add(receipt.id);
      if (xpElementId && Object.hasOwn(keys, xpElementId) && typeof xpAwarded === 'number' && Number.isFinite(xpAwarded) && xpAwarded > 0) totals[xpElementId] += xpAwarded;
    });
    walk(habit.childHabits);
  });
  walk(habits);
  return totals;
}

/** Apply the exact delta in the same Zustand update as the completion/undo. */
export function applyCycleXpDelta(user: User, before: readonly Habit[], after: readonly Habit[]): User {
  const old = recordedXp(before);
  const next = recordedXp(after);
  const updated = { ...user };
  for (const element of Object.keys(keys) as ElementId[]) {
    const key = keys[element];
    updated[key] = Math.max(0, user[key] + next[element] - old[element]);
  }
  return updated;
}
