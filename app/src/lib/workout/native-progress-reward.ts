import type { NativeWorkoutSession } from '@/types/workout';
import { calculateEstimatedDuration } from './workout-duration';
import { WORKOUT_ER_BASE_VALUE } from './workout-balance';
import { buildNativeWorkoutRewardBlocks, calculateNativeWorkoutReward } from '@/lib/core/native-workout-reward';

/** Same completed-block projection as fullscreen execution; planning only describes session time. */
export function projectWorkoutProgress(exercises: NativeWorkoutSession['exerciseResults'], plannedMinutes: number,
  effortLevel: number, measuredSeconds?: number) {
  const exerciseER = exercises.map((exercise) => exercise.sets.reduce((sum, series) => sum +
    (series.completed && !series.skipped ? (series.measureMode === 'reps' ? series.reps ?? 0 : (series.durationSeconds ?? 0) / 2) * (series.loadFactor ?? 1) : 0), 0));
  const totalER = exerciseER.reduce((sum, value) => sum + value, 0);
  const durationOf = (onlyCompleted: boolean) => calculateEstimatedDuration(exercises.map((exercise) => ({
    sets: exercise.sets.filter((series) => !onlyCompleted || (series.completed && !series.skipped)).map((series) => ({ ...series,
      targetReps: onlyCompleted && series.measureMode === 'reps' ? series.reps : series.targetReps,
      targetDurationSeconds: onlyCompleted && series.measureMode === 'duration' ? series.durationSeconds : series.targetDurationSeconds }))
  })).filter((exercise) => exercise.sets.length));
  const durationSeconds = measuredSeconds ?? Math.round(plannedMinutes * durationOf(true) / Math.max(1, durationOf(false)) * 60);
  const metrics = buildNativeWorkoutRewardBlocks(exercises, effortLevel, WORKOUT_ER_BASE_VALUE);
  const reward = calculateNativeWorkoutReward(metrics.blocks, metrics.activeDurationSeconds, effortLevel, measuredSeconds === undefined);
  const exerciseXp = exercises.map((exercise) => {
    const blocks = buildNativeWorkoutRewardBlocks([exercise], effortLevel, WORKOUT_ER_BASE_VALUE).blocks;
    return calculateNativeWorkoutReward(blocks, metrics.activeDurationSeconds, effortLevel, measuredSeconds === undefined).executedValue;
  });
  return { totalER, baseValue: metrics.baseValue, durationSeconds, earthXp: reward.executedValue, exerciseXp, exerciseER };
}
