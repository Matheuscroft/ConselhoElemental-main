import type { ElementId, Habit, Project, Quest, Task } from '@/types';

export interface QuestStep {
  key: string; id: string; title: string; kind: 'task' | 'habit'; element: ElementId;
  completed: boolean; available: boolean; native: boolean; hasChildren: boolean;
  chapter: string; plannedMinutes: number | null;
}
export interface QuestTrail {
  key: string; id: string; kind: 'quest' | 'project'; title: string; description: string;
  element: ElementId; archived: boolean; completed: boolean; reward?: string;
  steps: QuestStep[]; done: number; total: number; next: QuestStep | undefined;
  chapters: { id: string; title: string }[];
}
export type QuestSource = { tasks: Task[]; habits: Habit[]; quests: Quest[]; projects: Project[] };
export const trailHref = (key: string, step?: string) => `/rituais?${new URLSearchParams({ trilha: key, ...(step ? { etapa: step } : {}) })}`;

/** Presentation projection. Never writes aggregate progress, rewards or copied activity state. */
export function buildQuestTrails(source: QuestSource): QuestTrail[] {
  const tasks = new Map(source.tasks.map(task => [task.id, task]));
  const habits = new Map(source.habits.map(habit => [habit.id, habit]));
  const questMap = new Map(source.quests.map(quest => [quest.id, quest]));
  function stepsFor(taskRefs: Task[], habitRefs: Habit[], parentId: string, chapter: string, order: string[] = []): QuestStep[] {
    const taskIds = [...new Set([...taskRefs.map(t => t.id), ...source.tasks.filter(t => t.parentId === parentId).map(t => t.id)])];
    const habitIds = [...new Set([...habitRefs.map(h => h.id), ...source.habits.filter(h => h.parentId === parentId).map(h => h.id)])];
    const steps: QuestStep[] = [];
    taskIds.forEach(id => {
      const task = tasks.get(id);
      const ref = task ?? taskRefs.find(t => t.id === id);
      if (!ref) return;
      steps.push({ key: `task:${id}`, id, title: ref.title, kind: 'task', element: ref.elementId, completed: !!task?.isCompleted,
        available: !!task, native: ref.sourceModule === 'modulo_treino', hasChildren: !!ref.childItems?.length,
        chapter, plannedMinutes: task?.plannedTimeMinutes ?? null });
    });
    habitIds.forEach(id => {
      const habit = habits.get(id);
      const ref = habit ?? habitRefs.find(h => h.id === id);
      if (!ref) return;
      steps.push({ key: `habit:${id}`, id, title: ref.name || ref.title, kind: 'habit', element: ref.elementId,
        completed: false, available: !!habit, native: ref.sourceModule === 'modulo_treino', hasChildren: !!ref.childHabits?.length, chapter, plannedMinutes: null });
    });
    const rank = new Map(order.map((id, index) => [id, index]));
    return steps.sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
  }
  const finish = (trail: Omit<QuestTrail, 'done' | 'total' | 'next'>): QuestTrail => {
    const seen = new Set<string>();
    const steps = trail.steps.filter(step => { if (seen.has(step.key)) return false; seen.add(step.key); return true; });
    const finite = steps.filter(step => step.kind === 'task');
    return { ...trail, steps, done: finite.filter(step => step.completed).length, total: finite.length,
      next: trail.archived || trail.completed ? undefined : finite.find(step => step.available && !step.completed) };
  };
  const journeys = source.quests.map(quest => finish({
    key: `quest:${quest.id}`, id: quest.id, kind: 'quest', title: quest.title, description: quest.description ?? '', element: quest.elementId,
    archived: false, completed: quest.isCompleted || quest.status === 'completed', reward: quest.reward, chapters: [],
    steps: stepsFor(quest.tasks, quest.habits, quest.id, quest.title, quest.itemOrder),
  }));
  const projects = source.projects.map(project => finish({
    key: `project:${project.id}`, id: project.id, kind: 'project', title: project.title, description: project.description ?? '', element: project.elementId,
    archived: project.status === 'archived', completed: project.isCompleted || project.status === 'completed', reward: project.reward,
    chapters: project.missions.map(m => ({ id: m.id, title: m.title })),
    steps: [
      ...stepsFor(project.tasks, project.habits, project.id, project.title),
      ...project.missions.flatMap(mission => stepsFor(mission.tasks, mission.habits, mission.id, mission.title)),
      ...project.quests.flatMap(ref => { const q = questMap.get(ref.id) ?? ref; return stepsFor(q.tasks, q.habits, q.id, q.title, q.itemOrder); }),
    ],
  }));
  return [...journeys, ...projects];
}

export function nextQuestCards(trails: QuestTrail[], limit = 3) {
  const seen = new Set<string>();
  return trails.filter(trail => {
    if (!trail.next || seen.has(trail.next.key)) return false;
    seen.add(trail.next.key);
    return true;
  }).slice(0, limit);
}
