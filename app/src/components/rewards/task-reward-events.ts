import type { ElementId, Task, TaskItem } from '@/types';
export interface TaskRewardEvent { id: string; name: string; xp: number; element: ElementId }

function leaves(tasks: readonly (Task | TaskItem)[], result = new Map<string, Task | TaskItem>()) {
  for (const task of tasks) {
    if (task.sourceModule === 'modulo_treino') continue;
    if (task.childItems?.length) leaves(task.childItems, result);
    else if (task.semanticType !== 'NOTE' && task.semanticType !== 'text') result.set(task.id, task);
  }
  return result;
}
export function taskRewardEvents(before: readonly Task[], after: readonly Task[]): TaskRewardEvent[] {
  const old = leaves(before);
  return [...leaves(after).values()].flatMap(task => {
    const previous = old.get(task.id);
    const paid = task.completionXp;
    return previous && !previous.isCompleted && task.isCompleted && paid && Number.isFinite(paid.amount) && paid.amount >= 0
      ? [{ id: task.id, name: task.title, xp: paid.amount, element: paid.elementId }] : [];
  });
}
export function reconcileTaskRewards(pending: readonly TaskRewardEvent[], incoming: readonly TaskRewardEvent[], tasks: readonly Task[]): TaskRewardEvent[] {
  const current = leaves(tasks);
  return [...new Map([...pending, ...incoming].filter(event => {
    const task = current.get(event.id);
    return task?.isCompleted && task.completionXp?.amount === event.xp && task.completionXp?.elementId === event.element;
  }).map(event => [event.id, event])).values()];
}
