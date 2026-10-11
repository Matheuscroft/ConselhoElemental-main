import type { NativeWorkoutSession } from '@/types/workout';
import { calculateEstimatedDuration } from './workout-duration';
import { WORKOUT_ER_BASE_VALUE } from './workout-balance';
import { projectNativeLeafReward } from '@/lib/core/native-action-completion';

/** Consolidated reward of checked sets. Exercise shares split the one Core cap. */
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
  const baseValue = Number((totalER * WORKOUT_ER_BASE_VALUE).toFixed(10));
  const earthXp = projectNativeLeafReward(baseValue, durationSeconds, effortLevel, measuredSeconds === undefined && durationSeconds > 0).executedValue;
  return { totalER, baseValue, durationSeconds, earthXp,
    exerciseXp: exerciseER.map((volume) => totalER > 0 ? earthXp * volume / totalER : 0), exerciseER };
}
