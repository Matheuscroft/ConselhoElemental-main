import { projectNativeLeafReward } from '@/lib/core/native-action-completion';
import type { WorkoutTemplate } from '@/types/workout';
import { calculateEstimatedDuration } from './workout-duration';
import { WORKOUT_ER_BASE_VALUE } from './workout-balance';

export function projectTemplateReward(template: Pick<WorkoutTemplate, 'exercises' | 'estimatedDurationMinutes' | 'effortLevel' | 'durationEstimateMode'>) {
  const totalER = template.exercises.reduce((total, exercise) => total + exercise.sets.reduce((sum, series) => {
    const amount = series.measureMode === 'reps' ? series.targetReps ?? 0 : (series.targetDurationSeconds ?? 0) / 2;
    return sum + amount * (series.loadFactor ?? 1);
  }, 0), 0);
  const baseValue = Number((totalER * WORKOUT_ER_BASE_VALUE).toFixed(10));
  const manual = template.durationEstimateMode === 'manual' || (template.durationEstimateMode == null && template.estimatedDurationMinutes > 0);
  const estimatedDurationMinutes = manual ? template.estimatedDurationMinutes : calculateEstimatedDuration(template.exercises);
  const effortLevel = template.effortLevel ?? 1;
  const reward = projectNativeLeafReward(baseValue, estimatedDurationMinutes * 60, effortLevel, true);
  return { totalER, baseValue, estimatedDurationMinutes, effortLevel,
    earthXp: reward.executedValue, presenceMultiplier: reward.presenceMultiplier, effortMultiplier: reward.effortMultiplier,
    timeMultiplier: reward.timeMultiplier, effortCap: reward.effortCap };
}

export const formatEarthXp = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
