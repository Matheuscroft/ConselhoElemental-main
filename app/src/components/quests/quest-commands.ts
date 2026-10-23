import type { useAppStore } from '@/stores/appStore';
import type { ElementId } from '@/types';
import { completeRitualTimer } from '@/components/elemental/sanctuary-timer';

type State = ReturnType<typeof useAppStore.getState>;
type ComposerState = Pick<State, 'currentAccountId' | 'quests' | 'projects' | 'tasks' | 'addQuest' | 'addProject' | 'addMissionToProject' | 'addTaskToMission' | 'addTaskToQuest'>;
export interface QuestPlan { kind: 'quest' | 'project'; title: string; element: ElementId; steps: string[]; chapter: string }
export function validateQuestPlan(plan: QuestPlan) {
  if (plan.kind !== 'quest' && plan.kind !== 'project') return 'Escolha Jornada ou Grande Obra.';
  if (!plan.title.trim()) return 'Dê um nome à sua conquista.';
  if (!['terra', 'fogo', 'agua', 'ar'].includes(plan.element)) return 'Escolha um elemento.';
  if (!plan.steps.length || plan.steps.some(step => !step.trim())) return 'Dê um nome a cada etapa.';
  if (plan.kind === 'project' && !plan.chapter.trim()) return 'Dê um nome ao primeiro capítulo.';
  return null;
}

/** Orchestration of existing UI commands. IDs/defaults/persistence belong to the store. */
export function createQuestPlan(getState: () => ComposerState, accountId: string | null, plan: QuestPlan) {
  if (getState().currentAccountId !== accountId) throw new Error('A conta mudou. Abra a criação novamente.');
  const error = validateQuestPlan(plan);
  if (error) throw new Error(error);
  const initial = getState();
  const data = { title: plan.title.trim(), elementId: plan.element, areaId: 'area-sem-categoria' };
  if (plan.kind === 'quest') {
    const quest = initial.addQuest(data);
    plan.steps.forEach(title => getState().addTaskToQuest(quest.id, { title: title.trim(), elementId: plan.element }));
    return `quest:${quest.id}`;
  }
  const project = initial.addProject(data);
  getState().addMissionToProject(project.id, { title: plan.chapter.trim(), elementId: plan.element, areaId: 'area-sem-categoria' });
  const mission = getState().projects.find(item => item.id === project.id)?.missions[0];
  if (!mission) throw new Error('A obra foi criada. Abra Grandes Obras para revisar seu primeiro capítulo.');
  plan.steps.forEach(title => getState().addTaskToMission(project.id, mission.id, { title: title.trim(), elementId: plan.element }));
  return `project:${project.id}`;
}

export function appendQuestStep(getState: () => ComposerState, accountId: string | null, trailKey: string, title: string, chapterId: string) {
  const state = getState();
  if (state.currentAccountId !== accountId) throw new Error('A conta mudou. Abra a trilha novamente.');
  if (!title.trim()) throw new Error('Dê um nome à etapa.');
  const quest = state.quests.find(q => `quest:${q.id}` === trailKey && !q.isCompleted && q.status !== 'completed');
  if (quest) { state.addTaskToQuest(quest.id, { title: title.trim(), elementId: quest.elementId }); return; }
  const project = state.projects.find(p => `project:${p.id}` === trailKey && !p.isCompleted && p.status === 'active');
  if (!project) throw new Error('Esta trilha não está disponível para novas etapas.');
  const mission = project.missions.find(m => m.id === chapterId);
  if (!mission) throw new Error('Escolha um capítulo em Grandes Obras antes de adicionar etapas.');
  state.addTaskToMission(project.id, mission.id, { title: title.trim(), elementId: mission.elementId });
}

type FinishState = Pick<State, 'currentAccountId' | 'tasks' | 'timer' | 'startTimer' | 'pauseTimer' | 'resumeTimer' | 'stopTimer' | 'completeTask' | 'getLevelProgress'>;
export function finishQuestStep(getState: () => FinishState, accountId: string | null, taskId: string) {
  const before = getState();
  const task = before.tasks.find(t => t.id === taskId);
  if (!task || task.sourceModule === 'modulo_treino' || task.childItems.length) return null;
  const xpBefore = before.getLevelProgress().xpTotal;
  if (!completeRitualTimer(getState, { accountId, taskId })) return null;
  const after = getState();
  const completed = after.tasks.find(t => t.id === taskId)!;
  return { title: completed.title, points: completed.completedScore ?? null, xp: after.getLevelProgress().xpTotal - xpBefore, minutes: completed.actualTimeMinutes };
}
