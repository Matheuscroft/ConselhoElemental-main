import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { NativeWorkoutSession, UUIDv4, WorkoutTemplate } from '@/types/workout';
import type { Habit, CycleSequence } from '@/types';
import { AREAS } from '@/constants';
import { projectTemplateReward } from './native-reward-preview';

export function workoutHabitData(template: WorkoutTemplate, daysOfWeek: number[]): Partial<Habit> {
  const core = useAppStore.getState();
  const area = [...core.customAreas, ...AREAS].find((item) => item.elementId === 'terra' && item.name === 'Exercício Físico');
  if (!area) throw new Error('A área Exercício Físico de Terra não foi encontrada.');
  const effortLevel = template.effortLevel ?? 3;
  const reward = projectTemplateReward({ ...template, effortLevel });
  return { title: template.name, name: template.name, lifecycleType: 'HABIT', semanticType: null,
    recurrenceType: 'WEEKLY', recurrenceConfig: { daysOfWeek }, sourceModule: 'modulo_treino', sourceRefId: template.id,
    baseValue: reward.baseValue, plannedPoints: reward.baseValue, effortLevel, plannedTimeMinutes: reward.estimatedDurationMinutes,
    areaPrimaryId: area.id, areaId: area.id, elementId: 'terra', parentId: null };
}

/** Biblioteca permanece local até ativação; Core grava rotação e membros atomicamente. */
export function scheduleSequenceAsRotation(sequenceId: string, daysOfWeek: number[]): CycleSequence {
  const library = useWorkoutStore.getState();
  const core = useAppStore.getState();
  if ((library.currentAccountId ?? 'local') !== (core.currentAccountId ?? 'local')) throw new Error('A conta mudou. Reabra a biblioteca.');
  const sequence = core.cycleSequences.find((item) => item.id === sequenceId && item.memberRestriction === 'WORKOUT');
  const templateIds = sequence?.templateIds ?? [];
  if (!sequence || templateIds.length < 2 || new Set(templateIds).size !== templateIds.length) throw new Error('A sequência precisa de ao menos dois treinos diferentes.');
  const members = templateIds.map((id) => {
    const template = library.templates.find((item) => item.id === id);
    if (!template) throw new Error('Um treino desta sequência não está mais na biblioteca.');
    return workoutHabitData(template, daysOfWeek);
  });
  return core.createRotationWithMembers({ name: sequence.name, description: sequence.description, sourceRefId: sequence.id, daysOfWeek }, members);
}

/** Ativa um blueprint como raiz HABIT; não registra execução ou recompensa. */
export function scheduleWorkoutAsHabit(template: WorkoutTemplate, daysOfWeek: number[]): Habit {
  const days = [...new Set(daysOfWeek)].sort((a, b) => a - b);
  if (!days.length || days.some((day) => !Number.isInteger(day) || day < 0 || day > 6)) throw new Error('Selecione pelo menos um dia válido.');
  const core = useAppStore.getState();
  const existing = core.habits.find((habit) => habit.sourceModule === 'modulo_treino' && habit.sourceRefId === template.id && !habit.controlledBySequenceId);
  if (existing) return existing;
  return core.addHabit(workoutHabitData(template, days));
}

/** Traduz a sessão concluída em uma única ocorrência Core; sem fórmulas de recompensa. */
export function completeFitnessSession(session: NativeWorkoutSession, habitId?: string): NativeWorkoutSession {
  if (session.status !== 'completed' || !session.completedAt || session.baseValue == null) throw new Error('A sessão precisa estar consolidada.');
  const log = useAppStore.getState().completeNativeAction({
    sessionId: session.id, coreEntityId: habitId ? undefined : session.coreEntityId, habitId, title: session.nameSnapshot,
    baseValue: session.baseValue, durationSeconds: session.durationSeconds, completedAt: session.completedAt, effortLevel: session.effortLevel,
    declaredPlannedExecution: session.executionMode === 'CHECKIN',
    fullCompletion: session.exerciseResults.every((exercise) => exercise.sets.every((series) => series.completed && !series.skipped)),
  });
  return { ...session, coreEntityId: log.subjectId as UUIDv4, coreExecutionLogId: log.id as UUIDv4, earnedXp: log.executedValue, coreReceipt: structuredClone(log) };
}
