/**
 * The awakening's only progression engine. It owns nothing but the phase: no
 * timers, no audio, no storage, so the scene and the audio can be driven from
 * it and reasoned about on their own. Scoring lives elsewhere and is untouched.
 */

export type AwakeningPhase = 'idle' | 'loading' | 'running' | 'paused' | 'done' | 'skipped';

export type AwakeningSignal =
  | 'load'
  | 'ready'
  | 'start'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'skip'
  | 'teardown';

/**
 * Only the listed moves happen. Anything else is ignored rather than thrown,
 * because a stray visibility event or a double tap must never break the scene.
 */
const TRANSITIONS: Record<AwakeningPhase, Partial<Record<AwakeningSignal, AwakeningPhase>>> = {
  idle: { load: 'loading', start: 'running', skip: 'skipped' },
  loading: { ready: 'running', skip: 'skipped' },
  running: { pause: 'paused', complete: 'done', skip: 'skipped' },
  paused: { resume: 'running', complete: 'done', skip: 'skipped' },
  done: {},
  skipped: {},
};

export const INITIAL_PHASE: AwakeningPhase = 'idle';

export function advance(phase: AwakeningPhase, signal: AwakeningSignal): AwakeningPhase {
  if (signal === 'teardown') return 'idle';
  return TRANSITIONS[phase][signal] ?? phase;
}

/** Nothing further will happen on its own: the person finished or skipped. */
export const isSettled = (phase: AwakeningPhase): boolean => phase === 'done' || phase === 'skipped';

/** Sound and animation only run while the scene is actually playing. */
export const isPlaying = (phase: AwakeningPhase): boolean => phase === 'running';

/**
 * Leaving the app pauses; coming back resumes, but only if it was playing when
 * it left. A scene already finished or skipped is not restarted by a tab switch.
 */
export function onVisibility(phase: AwakeningPhase, hidden: boolean): AwakeningPhase {
  return advance(phase, hidden ? 'pause' : 'resume');
}
