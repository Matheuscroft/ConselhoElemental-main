import type { ElementId, Habit } from '@/types';

export interface CycleXpRecoveryEntry { receiptId: string; habitId: string; amount: number; element: ElementId }
export interface CycleXpRecoveryPlan {
  entries: CycleXpRecoveryEntry[];
  total: number;
  byElement: Record<ElementId, number>;
  unresolved: number;
  signature: string;
}
const elements = ['terra', 'fogo', 'agua', 'ar'];

/** Recover recorded amounts only. Do not estimate old effort, time or today's planned points. */
export function planCycleXpRecovery(habits: readonly Habit[]): CycleXpRecoveryPlan {
  const entries: CycleXpRecoveryEntry[] = [];
  const byElement = { terra: 0, fogo: 0, agua: 0, ar: 0 };
  const counts = new Map<string, number>();
  const count = (items: readonly Habit[]) => items.forEach(habit => {
    habit.completions.forEach(r => counts.set(r.id, (counts.get(r.id) ?? 0) + 1));
    count(habit.childHabits);
  });
  count(habits);
  let unresolved = 0;
  const walk = (items: readonly Habit[], native = false) => items.forEach(habit => {
    const isNative = native || habit.sourceModule === 'modulo_treino';
    for (const r of habit.completions) {
      // Native adapters have their own paid ledger; never pay their receipts a second time.
      if (isNative || r.xpAwarded !== undefined || r.xpRuleset !== undefined) continue;
      const amount = r.executedScore ?? r.scoreEarned;
      const valid = r.id && counts.get(r.id) === 1 && r.habitId === habit.id &&
        r.formulaVersion === 'habit-v1' && Number.isFinite(new Date(r.completionDate).getTime()) &&
        elements.includes(habit.elementId) && typeof amount === 'number' && Number.isFinite(amount) && amount > 0 &&
        (r.executedScore === undefined || r.scoreEarned === r.executedScore);
      if (!valid) { unresolved++; continue; }
      entries.push({ receiptId: r.id, habitId: habit.id, amount, element: habit.elementId });
      byElement[habit.elementId] += amount;
    }
    walk(habit.childHabits, isNative);
  });
  walk(habits);
  entries.sort((a,b) => a.receiptId.localeCompare(b.receiptId));
  return { entries, byElement, total: entries.reduce((sum,e)=>sum+e.amount,0), unresolved, signature: JSON.stringify(entries) };
}

export function recoverCycleReceipts(habits: Habit[], plan: CycleXpRecoveryPlan): Habit[] {
  const entries = new Map(plan.entries.map(entry => [entry.receiptId, entry]));
  const walk = (items: Habit[]): Habit[] => items.map(habit => ({
    ...habit,
    completions: habit.completions.map(receipt => {
      const entry = entries.get(receipt.id);
      return entry && entry.habitId === habit.id ? { ...receipt, xpAwarded: entry.amount, xpElementId: entry.element, xpRuleset: 'cycle-xp-recovery-v1' as const } : receipt;
    }),
    childHabits: walk(habit.childHabits),
  }));
  return walk(habits);
}
