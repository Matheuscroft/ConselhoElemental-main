import { useAppStore } from '@/stores/appStore';
import type { NativeWorkoutSession, UUIDv4, WorkoutTemplate } from '@/types/workout';
import type { Habit } from '@/types';
import { AREAS } from '@/constants';
import { projectTemplateReward } from './native-reward-preview';

/** Ativa um blueprint como raiz HABIT; não registra execução ou recompensa. */
export function scheduleWorkoutAsHabit(template: WorkoutTemplate, daysOfWeek: number[]): Habit {
  const days = [...new Set(daysOfWeek)].sort((a, b) => a - b);
  if (!days.length || days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) throw new Error('Selecione pelo menos um dia válido.');
  const core = useAppStore.getState();
  const existing = core.habits.find((habit) => habit.sourceModule === 'modulo_treino' && habit.sourceRefId === template.id);
  if (existing) return existing;
  const area = [...core.customAreas, ...AREAS].find((item) => item.elementId === 'terra' && item.name === 'Exercício Físico');
  if (!area) throw new Error('A área Exercício Físico de Terra não foi encontrada.');
  const effortLevel = template.effortLevel ?? 3;
  const { baseValue } = projectTemplateReward({ ...template, effortLevel });
  return core.addHabit({
    title: template.name, name: template.name, lifecycleType: 'HABIT', semanticType: null,
    recurrenceType: 'WEEKLY', recurrenceConfig: { daysOfWeek: days },
    sourceModule: 'modulo_treino', sourceRefId: template.id,
    baseValue, plannedPoints: baseValue, effortLevel,
    plannedTimeMinutes: template.estimatedDurationMinutes,
    areaPrimaryId: area.id, areaId: area.id, elementId: 'terra', parentId: null,
  });
}

/** Traduz a sessão concluída em uma única ocorrência Core; sem fórmulas de recompensa. */
export function completeFitnessSession(session: NativeWorkoutSession, habitId?: string): NativeWorkoutSession {
  if (session.status !== 'completed' || !session.completedAt || session.baseValue == null) throw new Error('A sessão precisa estar consolidada.');
  const log = useAppStore.getState().completeNativeAction({
    sessionId: session.id, coreEntityId: habitId ? undefined : session.coreEntityId, habitId, title: session.nameSnapshot,
    baseValue: session.baseValue, durationSeconds: session.durationSeconds, completedAt: session.completedAt, effortLevel: session.effortLevel,
  });
  return { ...session, coreEntityId: log.subjectId as UUIDv4, coreExecutionLogId: log.id as UUIDv4 };
}
