import type { Action, ExecutionLog, Habit, Task } from '@/types';

export type HistoryKind = 'ritual' | 'ciclo' | 'treino' | 'atividade';
export interface GrimoireEntry {
  id: string;
  title: string;
  kind: HistoryKind;
  date: Date | null;
  points: number | null;
  minutes: number | null;
  completed: boolean;
}

const dateOf = (value: unknown): Date | null => {
  if (!(value instanceof Date) && typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};
const recordedNumber = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const kindOf = (item?: { sourceModule?: string; lifecycleType?: string | null }): HistoryKind => {
  if (item?.sourceModule === 'modulo_treino') return 'treino';
  if (item?.lifecycleType === 'HABIT') return 'ciclo';
  if (item?.lifecycleType === 'ACTION') return 'ritual';
  return 'atividade';
};

/** Read-only projection of recorded events. No estimated dates, scores or persistence. */
export function buildGrimoireHistory({ actions, tasks, habits, logs }: {
  actions: Action[]; tasks: Task[]; habits: Habit[]; logs: ExecutionLog[];
}): GrimoireEntry[] {
  const subjects = new Map(actions.map(action => [action.id, action]));
  const allHabits = new Map<string, Action>();
  const allTasks = new Map<string, Action>();
  const walkTasks = (items: Action[]) => items.forEach(item => {
    if (allTasks.has(item.id)) return;
    allTasks.set(item.id, item);
    subjects.set(item.id, item);
    walkTasks(item.childItems ?? []);
  });
  const walkHabits = (items: Habit[]) => items.forEach(item => {
    if (allHabits.has(item.id)) return;
    allHabits.set(item.id, item);
    subjects.set(item.id, item);
    walkHabits(item.childHabits ?? []);
  });
  walkTasks(tasks);
  walkHabits(habits);
  // Some native actions have no legacy root; include their stored completions as well.
  actions.forEach(action => {
    if (action.lifecycleType === 'ACTION' && !allTasks.has(action.id)) allTasks.set(action.id, action);
    if (action.lifecycleType === 'HABIT' && !allHabits.has(action.id)) allHabits.set(action.id, action);
  });

  const entries = new Map<string, GrimoireEntry>();
  const loggedCompletions = new Set<string>();
  const completedSubjects = new Set<string>();
  const loggedIds = new Set<string>();
  for (const log of logs) {
    const date = dateOf(log.timestamp);
    const subject = subjects.get(log.subjectId);
    loggedIds.add(log.id);
    // A partially completed parent may still have fully completed children.
    const completedIds = log.fullCompletion ? [log.subjectId, ...log.completedItemIds] : log.completedItemIds;
    completedIds.forEach(id => {
      completedSubjects.add(id);
      if (date) loggedCompletions.add(`${id}:${dayKey(date)}`);
    });
    entries.set(`log:${log.id}`, {
      id: `log:${log.id}`,
      title: subject?.name || subject?.title || 'Atividade registrada',
      kind: log.sourceModule === 'modulo_treino' ? 'treino' : kindOf(subject ?? { lifecycleType: log.subjectType }),
      date,
      points: recordedNumber(log.executedValue),
      minutes: recordedNumber(log.actualTimeMinutes),
      completed: log.fullCompletion,
    });
  }
  for (const task of allTasks.values()) {
    if (!task.isCompleted || completedSubjects.has(task.id)) continue;
    entries.set(`task:${task.id}`, {
      id: `task:${task.id}`, title: task.title, kind: kindOf(task),
      date: dateOf(task.completedAt), points: recordedNumber(task.completedScore),
      minutes: recordedNumber(task.actualTimeMinutes), completed: true,
    });
  }
  for (const habit of allHabits.values()) {
    for (const completion of habit.completions ?? []) {
      const date = dateOf(completion.completionDate);
      if (loggedIds.has(completion.id) || (date && loggedCompletions.has(`${habit.id}:${dayKey(date)}`))) continue;
      entries.set(`habit:${habit.id}:${completion.id}`, {
        id: `habit:${habit.id}:${completion.id}`, title: habit.name || habit.title, kind: kindOf(habit), date,
        points: recordedNumber(completion.executedScore ?? completion.scoreEarned),
        minutes: recordedNumber(completion.timeSpentMinutes), completed: true,
      });
    }
  }
  return [...entries.values()].sort((a, b) =>
    (b.date?.getTime() ?? -Infinity) - (a.date?.getTime() ?? -Infinity) || a.id.localeCompare(b.id));
}

export function filterGrimoireHistory(entries: GrimoireEntry[], query: string, kind: 'all' | HistoryKind, period: 'all' | '7' | '30', now = new Date()) {
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period !== 'all') start.setDate(start.getDate() - (Number(period) - 1));
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return entries.filter(entry => (kind === 'all' || entry.kind === kind)
    && terms.every(term => normalize(entry.title).includes(term))
    && (period === 'all' || (entry.date != null && entry.date >= start && entry.date < end)));
}
