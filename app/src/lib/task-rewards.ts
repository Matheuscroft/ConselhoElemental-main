import type { Action, ElementId, Task, TaskItem, User } from '@/types';
import { EFFORT_MULTIPLIERS } from '@/constants';

const keys = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' } as const;
type Node = Task | TaskItem;

/** Wrap the existing completion updates. Only fresh leaf transitions pay; parents do not pay again. */
export function withTaskXpUpdate<T extends { tasks?: Task[]; user?: User }>(state: { tasks: Task[]; user: User }, update: T): T {
  if (!update.tasks || update.tasks === state.tasks) return update;
  const before = new Map<string, Action>();
  const index = (items: Node[]) => items.forEach(item => { before.set(item.id, item); index(item.childItems ?? []); });
  index(state.tasks);
  const user = { ...(update.user ?? state.user) };
  const walk = <N extends Node>(items: N[], root = true, native = false, inheritedElement: ElementId = 'terra'): N[] => items.map(item => {
    const old = before.get(item.id);
    const isNative = native || item.sourceModule === 'modulo_treino';
    const element = item.elementId ?? inheritedElement;
    let reward = item.completionXp;
    if (!isNative && old) {
      if (item.isCompleted && !old.isCompleted) {
        const semantic = item.semanticType ?? 'VALUABLE';
        const valuable = semantic === 'VALUABLE' || semantic === 'valuable';
        const leaf = !item.childItems?.length;
        // Root score is the original command result. Item score follows its existing fixed effort rule.
        const points = root ? item.completedScore : Math.round((item.baseValue || 1) * EFFORT_MULTIPLIERS[2]);
        const amount = valuable && leaf && Object.hasOwn(keys, element) && typeof points === 'number' && Number.isFinite(points) ? Math.max(0, Math.round(points / 2)) : 0;
        reward = { amount, elementId: element, ruleset: 'ritual-leaf-xp-v1' };
        if (amount > 0) user[keys[element]] += amount;
      } else if (!item.isCompleted && old.isCompleted) {
        // Historical completions lack a paid snapshot: never estimate their debit from today's settings.
        const paid = old.completionXp;
        if (paid && Number.isFinite(paid.amount) && paid.amount > 0 && Object.hasOwn(keys, paid.elementId)) {
          const key = keys[paid.elementId];
          user[key] = Math.max(0, user[key] - paid.amount);
        }
        reward = undefined;
      }
    }
    return { ...item, completionXp: reward, childItems: walk(item.childItems ?? [], false, isNative, element) };
  });
  return { ...update, tasks: walk(update.tasks), user };
}
