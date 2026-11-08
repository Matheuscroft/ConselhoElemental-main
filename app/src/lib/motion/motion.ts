/**
 * The app's four beats, for the code that animates in JavaScript.
 *
 * `elemental-motion.css` declares exactly the same numbers as custom
 * properties, and `tests/motion/motion-tokens.test.mjs` fails if the two ever
 * disagree. Before this, twenty-six files reached for framer-motion with
 * whatever duration seemed right that day, which is how an app ends up with
 * no sense of time of its own.
 */

export const DURATION = {
  /** The finger is down and the control knows it. */
  press: 120,
  /** The smallest visible answer: a state, a colour, a toggle. */
  feedback: 160,
  /** Something opens, expands or arrives on screen. */
  reveal: 240,
  /** Something lands and finds its place. */
  settle: 420,
  /** Energy arrives: XP, a level, a streak. */
  conjure: 720,
} as const;

export type DurationName = keyof typeof DURATION;

/**
 * `conjure` is the only curve that passes its target and comes back. Earning
 * something has to feel unlike a value changing in a field, and overshoot is
 * what separates the two. It is the same curve the awakening already lights
 * its elements with, so the two read as one hand.
 */
export const EASE = {
  standard: [0.23, 1, 0.32, 1],
  exit: [0.4, 0, 1, 1],
  conjure: [0.22, 1.4, 0.36, 1],
} as const;

export type EaseName = keyof typeof EASE;

/** Seconds, which is what framer-motion counts in. */
export const seconds = (name: DurationName): number => DURATION[name] / 1000;

export interface BeatOptions {
  readonly ease?: EaseName;
  readonly delay?: number;
}

/**
 * One transition for framer-motion, by beat. Asking for a beat by name is the
 * whole point: a number typed inline is how the system comes apart.
 */
export function beat(name: DurationName, options: BeatOptions = {}) {
  return {
    duration: seconds(name),
    ease: [...EASE[options.ease ?? (name === 'conjure' ? 'conjure' : 'standard')]] as number[],
    ...(options.delay ? { delay: options.delay } : {}),
  };
}

/** Nothing moves, and nothing is lost: the end state arrives at once. */
export const STILL = { duration: 0 } as const;

/** The beat, or stillness, by what the person asked their system for. */
export const beatUnless = (reduced: boolean, name: DurationName, options?: BeatOptions) =>
  reduced ? STILL : beat(name, options);
