import type { Task } from '@/types';
import type { useAppStore } from '@/stores/appStore';

type State = ReturnType<typeof useAppStore.getState>;
type TimerOwner = Pick<State, 'currentAccountId' | 'tasks' | 'timer' | 'startTimer' | 'pauseTimer' | 'resumeTimer' | 'stopTimer' | 'completeTask'>;
export interface RitualContext { accountId: string | null; taskId: string }

export function canUseSimpleRitualTimer(task: Pick<Task, 'sourceModule' | 'childItems'> | undefined) {
  return !!task && task.sourceModule !== 'modulo_treino' && !task.childItems?.length;
}

export const ritualListHref = '/rituais?view=lista';

// UI guards only. Time, persistence and rewards remain in the existing store.
function taskFor(state: TimerOwner, context: RitualContext) {
  return state.currentAccountId === context.accountId
    ? state.tasks.find((task) => task.id === context.taskId && !task.isCompleted && canUseSimpleRitualTimer(task))
    : undefined;
}

export function ownsRitualTimer(state: TimerOwner, context: RitualContext) {
  return !!taskFor(state, context) && state.timer.entityId === context.taskId && state.timer.entityType === 'TASK';
}

export function openRitualTimer(getState: () => TimerOwner, context: RitualContext) {
  const state = getState();
  if (!taskFor(state, context)) return 'unavailable';
  if (ownsRitualTimer(state, context)) return 'existing';
  if (state.timer.entityId !== null || state.timer.isRunning) return 'busy';
  state.startTimer(context.taskId, 'TASK');
  return 'started';
}

export function toggleRitualTimer(getState: () => TimerOwner, context: RitualContext) {
  const state = getState();
  if (!ownsRitualTimer(state, context)) return false;
  if (state.timer.isRunning) state.pauseTimer();
  else state.resumeTimer();
  return true;
}

export function completeRitualTimer(getState: () => TimerOwner, context: RitualContext) {
  const state = getState();
  if (!ownsRitualTimer(state, context)) return false;
  const elapsedSeconds = state.stopTimer();
  // Same TASK conversion used in Rituais; no rounding or new scoring rule.
  state.completeTask(context.taskId, elapsedSeconds / 60);
  const updated = getState();
  return updated.currentAccountId === context.accountId
    && updated.tasks.some((task) => task.id === context.taskId && task.isCompleted);
}
