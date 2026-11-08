import type { TimerState } from '@/types';

/** The browser may suspend callbacks while locked. The anchor keeps elapsed
 * time independent of how many callbacks run. Pauses rebase this anchor. */
export function elapsedTimerSeconds(timer: TimerState, now = Date.now()): number {
  if (!timer.isRunning || !timer.startedAt) return timer.elapsedSeconds;
  const anchor = new Date(timer.startedAt).getTime();
  if (!Number.isFinite(anchor) || !Number.isFinite(now)) return timer.elapsedSeconds;
  return Math.max(timer.elapsedSeconds, Math.floor((now - anchor) / 1000), 0);
}
