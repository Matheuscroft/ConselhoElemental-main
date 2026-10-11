import { useAppStore } from '@/stores/appStore';
import type { NativeWorkoutSession, UUIDv4 } from '@/types/workout';

/** Traduz a sessão concluída em uma única ocorrência Core; sem fórmulas de recompensa. */
export function completeFitnessSession(session: NativeWorkoutSession): NativeWorkoutSession {
  if (session.status !== 'completed' || !session.completedAt || session.baseValue == null) throw new Error('A sessão precisa estar consolidada.');
  const log = useAppStore.getState().completeNativeAction({
    sessionId: session.id, coreEntityId: session.coreEntityId, title: session.nameSnapshot,
    baseValue: session.baseValue, durationSeconds: session.durationSeconds, completedAt: session.completedAt, effortLevel: session.effortLevel,
  });
  return { ...session, coreEntityId: log.subjectId as UUIDv4, coreExecutionLogId: log.id as UUIDv4 };
}
