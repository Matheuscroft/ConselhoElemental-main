import type { PerformedSet } from '@/types/workout';

type SetState = Pick<PerformedSet, 'id' | 'completed' | 'skipped'>;

/** A presentation event, never a command or a source of rewards. */
export function isNewSetCompletion(previous: SetState, current: SetState): boolean {
  return previous.id === current.id && !previous.completed && !previous.skipped
    && current.completed && !current.skipped;
}
