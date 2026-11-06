import type { WorkoutSession } from '@/types/workout';

/** Inspect the existing command result; never infer success from a click. */
export function wasSetRecorded(session: WorkoutSession | undefined, setId: string, action: 'complete' | 'skip'): boolean {
  if (!session || session.status !== 'in_progress') return false;
  const set = session.exerciseResults.flatMap(result => result.sets).find(item => item.id === setId);
  return Boolean(set && (action === 'complete' ? set.completed && !set.skipped : set.skipped && !set.completed));
}
