import type { NativeWorkoutSession, WorkoutSession } from '@/types/workout';
import { activityMetrics } from '@/lib/workout/activity-metrics';

export type FitnessSession = WorkoutSession | NativeWorkoutSession;
export const isNativeSession = (session: FitnessSession): session is NativeWorkoutSession => 'nameSnapshot' in session;

/** Read-only presentation; never converts records or recalculates rewards. */
export function sessionActivity(session: FitnessSession) {
  if (!isNativeSession(session)) {
    const observed = activityMetrics(session);
    return { seconds: observed.observations ? observed.seconds : session.durationSeconds,
      load: observed.load, observed: observed.observations > 0,
      series: session.exerciseResults.flatMap(exercise => exercise.sets).filter(set => set.completed && !set.skipped).map(set => set.activityLoad ?? 0) };
  }
  const sets = session.exerciseResults.flatMap(exercise => exercise.sets).filter(set => set.completed && !set.skipped);
  const seconds = (set: typeof sets[number]) => set.measureMode === 'reps' ? (set.reps ?? 0) * 4 : set.durationSeconds ?? 0;
  // Missing RPE is not a measurement. Only explicitly recorded effort enters load.
  const observed = sets.filter(set => set.perceivedExertion != null && seconds(set) > 0);
  const series = observed.map(set => seconds(set) / 60 * set.perceivedExertion!);
  return { seconds: sets.reduce((sum, set) => sum + seconds(set), 0),
    load: series.reduce((sum, value) => sum + value, 0), observed: observed.length > 0, series };
}

export function mergeFitnessHistory(legacy: WorkoutSession[], native: NativeWorkoutSession[]): FitnessSession[] {
  // IDs are shared with summaries. Prefer the native record if an ID occurs twice.
  return [...new Map<string, FitnessSession>([...legacy, ...native].map(session => [session.id, session])).values()]
    .filter(session => session.status === 'completed')
    .sort((a, b) => (b.completedAt ?? b.startedAt).localeCompare(a.completedAt ?? a.startedAt));
}
