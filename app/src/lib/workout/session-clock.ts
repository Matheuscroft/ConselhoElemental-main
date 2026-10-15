import type { NativeWorkoutSession } from '@/types/workout';

/** Total workout time, including rests; only explicit pauses are deducted. */
export function sessionClockSeconds(session: Pick<NativeWorkoutSession, 'startedAt' | 'pausedAt' | 'pausedSeconds'>, now = Date.now()): number {
  const until = session.pausedAt ? Date.parse(session.pausedAt) : now;
  return Math.max(0, Math.floor((until - Date.parse(session.startedAt)) / 1000 - (session.pausedSeconds ?? 0)));
}
