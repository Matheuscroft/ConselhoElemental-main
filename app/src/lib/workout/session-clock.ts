import type { NativeWorkoutSession } from '@/types/workout';

/** Pause time affects the session clock only, never declared active work or XP. */
export function sessionClockSeconds(session: Pick<NativeWorkoutSession, 'startedAt' | 'pausedAt' | 'pausedSeconds'>, now = Date.now()): number {
  const until = session.pausedAt ? Date.parse(session.pausedAt) : now;
  return Math.max(0, Math.floor((until - Date.parse(session.startedAt)) / 1000 - (session.pausedSeconds ?? 0)));
}
