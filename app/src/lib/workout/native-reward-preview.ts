import { buildNativeWorkoutRewardBlocks, calculateNativeWorkoutReward } from '@/lib/core/native-workout-reward';
import type { WorkoutTemplate } from '@/types/workout';
import { calculateEstimatedDuration } from './workout-duration';
import { WORKOUT_ER_BASE_VALUE } from './workout-balance';

export function projectTemplateReward(template: Pick<WorkoutTemplate, 'exercises' | 'estimatedDurationMinutes' | 'effortLevel' | 'durationEstimateMode'>) {
  const metrics = buildNativeWorkoutRewardBlocks(template.exercises.map((exercise) => ({ sets: exercise.sets.map((series) => ({
    ...series, completed: true, skipped: false, reps: series.targetReps, durationSeconds: series.targetDurationSeconds,
  })) })), template.effortLevel ?? 1, WORKOUT_ER_BASE_VALUE);
  const { totalER, baseValue, activeDurationSeconds } = metrics;
  const manual = template.durationEstimateMode === 'manual' || (template.durationEstimateMode == null && template.estimatedDurationMinutes > 0);
  const estimatedDurationMinutes = manual ? template.estimatedDurationMinutes : calculateEstimatedDuration(template.exercises);
  const effortLevel = template.effortLevel ?? 1;
  const reward = calculateNativeWorkoutReward(metrics.blocks, activeDurationSeconds, effortLevel, true);
  return { totalER, baseValue, estimatedDurationMinutes, activeDurationSeconds, effortLevel,
    earthXp: reward.executedValue, presenceMultiplier: reward.presenceMultiplier, effortMultiplier: reward.effortMultiplier,
    timeMultiplier: reward.timeMultiplier, effortCap: reward.effortCap };
}

export const formatEarthXp = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
