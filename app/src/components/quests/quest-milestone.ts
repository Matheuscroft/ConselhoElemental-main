import type { QuestTrail } from './quest-path';

export interface QuestMilestone {
  trail: { key: string; title: string; done: number; total: number; allRitualsDone: boolean; recurring: number } | null;
  level: { from: number; to: number } | null;
}

/** Read-only context for a successful command receipt. No aggregate or reward writes. */
export function describeQuestMilestone(before: QuestTrail | undefined, after: QuestTrail | undefined, taskId: string, levelBefore: number, levelAfter: number): QuestMilestone {
  const sameTrail = before && after && before.key === after.key;
  const newlyDone = sameTrail && before.steps.some(step => step.kind === 'task' && step.id === taskId && step.available && !step.completed)
    && after.steps.some(step => step.kind === 'task' && step.id === taskId && step.available && step.completed);
  return {
    trail: newlyDone ? {
      key: after.key, title: after.title, done: after.done, total: after.total,
      allRitualsDone: after.total > 0 && before.total === after.total && before.done < before.total && after.done === after.total,
      recurring: after.steps.filter(step => step.kind === 'habit').length,
    } : null,
    level: Number.isInteger(levelBefore) && Number.isInteger(levelAfter) && levelBefore > 0 && levelAfter > levelBefore ? { from: levelBefore, to: levelAfter } : null,
  };
}
