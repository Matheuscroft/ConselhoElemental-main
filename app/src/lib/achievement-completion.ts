import { buildQuestTrails, type QuestSource } from './quest-trails';

export type AchievementKind = 'quest' | 'project';
export const achievementXpKeys = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' } as const;

/**
 * The bonus for finishing a whole trail: what the person set on it, or a substantial default that grows with the
 * trail (50 XP plus 25 per ritual, up to 500) so finishing something long is felt in the element's mastery.
 */
export const defaultTrailBonus = (steps: number): number => Math.min(500, 50 + 25 * Math.max(0, steps));

/** Current canonical tasks win over the copied references kept in older projects. */
export function achievementPlan(source: QuestSource, kind: AchievementKind, id: string) {
  const entity = kind === 'quest' ? source.quests.find(q => q.id === id) : source.projects.find(p => p.id === id);
  if (!entity) return null;
  const trail = buildQuestTrails(source).find(t => t.kind === kind && t.id === id)!;
  const pending = trail.steps.filter(step => step.kind === 'task' && (!step.available || !step.completed));
  const bonus = entity.completionBonus;
  const amount = trail.completed ? bonus?.amount ?? 0 : (entity.bonusAutomatico ?? true) && entity.xpBonus === 0 ? defaultTrailBonus(trail.total) : entity.xpBonus;
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
