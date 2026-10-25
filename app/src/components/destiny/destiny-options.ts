import type { ElementId, Habit, Quest, Task } from '@/types';
import { trailHref } from '@/components/quests/quest-path';

export type DestinyKind = 'task' | 'habit' | 'quest';
export interface DestinyOption {
  key: string; id: string; kind: DestinyKind; title: string; description: string;
  element: ElementId; href: string; when: string; minutes: number | null;
}
export const DESTINY_LABELS = { task: 'Tarefa', habit: 'Ciclo', quest: 'Jornada' } as const;
export function localDay(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDestinyDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return localDay(date) === value ? date : null;
}
/** Read-only catalogue. Recurrence and sequence eligibility are supplied by the existing store. */
export function destinyOptions(tasks: Task[], quests: Quest[], getHabitsForDate: (date: Date) => Habit[], today: Date, days: 1 | 7): DestinyOption[] {
  const result: DestinyOption[] = [];
  tasks.filter(task => !task.isCompleted && !['NOTE', 'text'].includes(task.semanticType ?? '')).forEach(task => {
    result.push({ key: `task:${task.id}`, id: task.id, kind: 'task', title: task.title, description: task.description ?? '', element: task.elementId,
      href: `/rituais?${new URLSearchParams({ view: 'lista', atividade: task.id })}`, when: 'Pendente', minutes: task.plannedTimeMinutes });
  });
  const seen = new Set<string>();
  for (let offset = 0; offset < days; offset++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
    for (const habit of getHabitsForDate(date)) {
      if (seen.has(habit.id) || ['NOTE', 'text'].includes(habit.semanticType ?? '') || habit.completions.some(completion => localDay(new Date(completion.completionDate)) === localDay(date))) continue;
      seen.add(habit.id);
      result.push({ key: `habit:${habit.id}`, id: habit.id, kind: 'habit', title: habit.name || habit.title, description: habit.description ?? '', element: habit.elementId,
        href: `/ciclos?${new URLSearchParams({ atividade: habit.id, data: localDay(date) })}`, when: offset === 0 ? 'Hoje' : date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }), minutes: habit.plannedTimeMinutes });
    }
  }
  quests.filter(quest => !quest.isCompleted && quest.status !== 'completed').forEach(quest => {
    result.push({ key: `quest:${quest.id}`, id: quest.id, kind: 'quest', title: quest.title, description: quest.description ?? '', element: quest.elementId,
      href: trailHref(`quest:${quest.id}`), when: 'Em andamento', minutes: null });
  });
  return [...new Map(result.map(item => [item.key, item])).values()];
}
export function filterDestinyOptions(options: DestinyOption[], kind: DestinyKind | 'all', element: ElementId | 'all') {
  return options.filter(option => (kind === 'all' || option.kind === kind) && (element === 'all' || option.element === element));
}
export function chooseDestiny(options: DestinyOption[], random: number): DestinyOption | null {
  if (!options.length || !Number.isFinite(random) || random < 0 || random >= 1) return null;
  return options[Math.floor(random * options.length)];
}
/** The pointer is at twelve o'clock; repeated spins must ignore the previous remainder. */
export function destinyRotation(previous: number, index: number, count: number): number {
  if (count < 1 || index < 0 || index >= count) return previous;
  const target = 360 - (index + .5) * 360 / count;
  return previous + 4 * 360 + ((target - previous % 360 + 360) % 360);
}
