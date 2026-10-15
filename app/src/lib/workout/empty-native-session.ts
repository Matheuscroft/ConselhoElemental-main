import type { NativeWorkoutSession } from '@/types/workout';

/** Conservative cleanup: exact zero reward, under a minute, and no performed work. */
export function isEmptyShortNativeSession(session: NativeWorkoutSession, earnedXp: number | undefined): boolean {
  return session.status === 'completed' && earnedXp === 0 && session.durationSeconds >= 0 && session.durationSeconds < 60 &&
    !session.exerciseResults.some((exercise) => exercise.sets.some((series) => series.completed && !series.skipped &&
      (series.measureMode === 'reps' ? (series.reps ?? 0) > 0 : (series.durationSeconds ?? 0) > 0)));
}
