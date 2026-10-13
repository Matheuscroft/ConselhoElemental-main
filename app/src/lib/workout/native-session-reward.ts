import type { NativeWorkoutSession } from '@/types/workout';
import type { useAppStore } from '@/stores/appStore';

type AppState = ReturnType<typeof useAppStore.getState>;

export function resolveNativeSessionXp(session: NativeWorkoutSession, state: Pick<AppState, 'executionLogs' | 'actions' | 'tasks' | 'habits'>): number | undefined {
  const log = state.executionLogs.find((item) => (session.coreExecutionLogId && item.id === session.coreExecutionLogId) || (item.sourceModule === 'modulo_treino' && item.sourceRefId === session.id));
  const action = [...state.tasks, ...state.actions].find((item) => item.isCompleted &&
    ((session.coreEntityId && item.id === session.coreEntityId && item.lifecycleType === 'ACTION') ||
      (item.sourceModule === 'modulo_treino' && item.sourceRefId === session.id)));
  const completion = state.habits.find((item) => item.id === session.coreEntityId)?.completions.find((item) =>
    (session.coreExecutionLogId && item.id === session.coreExecutionLogId) ||
    (session.completedAt && new Date(item.completionDate).getTime() === Date.parse(session.completedAt)));
  return [log?.executedValue, session.coreReceipt?.executedValue, session.earnedXp, completion?.executedScore, completion?.scoreEarned, action?.completedScore]
    .find((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0);
}
