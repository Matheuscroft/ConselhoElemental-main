import { buildQuestTrails, type QuestSource } from './quest-trails';

export type AchievementKind = 'quest' | 'project';
export const achievementXpKeys = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' } as const;

/** Current canonical tasks win over the copied references kept in older projects. */
export function achievementPlan(source: QuestSource, kind: AchievementKind, id: string) {
  const entity = kind === 'quest' ? source.quests.find(q => q.id === id) : source.projects.find(p => p.id === id);
  if (!entity) return null;
  const trail = buildQuestTrails(source).find(t => t.kind === kind && t.id === id)!;
  const pending = trail.steps.filter(step => step.kind === 'task' && (!step.available || !step.completed));
  const bonus = entity.completionBonus;
  const amount = trail.completed ? bonus?.amount ?? 0 : entity.xpBonus;
  const element = trail.completed ? bonus?.elementId ?? entity.elementId : entity.elementId;
  const validAmount = Number.isFinite(amount) && amount >= 0 && amount <= Number.MAX_SAFE_INTEGER && Object.hasOwn(achievementXpKeys, element);
  return {
    entity, trail, pending, amount, element,
    canComplete: !trail.archived && !trail.completed && pending.length === 0 && validAmount,
    validAmount,
    signature: JSON.stringify([kind, id, entity.title, trail.completed, trail.archived, amount, element, bonus?.id,
      trail.steps.map(s => [s.key, s.available, s.completed]), pending.map(s => s.key)]),
  };
}
