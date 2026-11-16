import { DURATION } from '@/lib/motion/motion';

/**
 * The clock of the wheel. A roulette keeps its own curve (it is a scene, named
 * in tests/motion/motion-uso.test.mjs), but its length is still built from the
 * system's beats instead of a number typed by hand: three and a half
 * celebrations of spin, and the reveal a breath after it stops.
 */
export const GIRO_MS = DURATION.conjure * 3.6;
export const GIRO_S = GIRO_MS / 1000;
export const REVELACAO_MS = DURATION.conjure * 3.75;

/**
 * Fast out of the hand, long deceleration, and a control point just past 1 at
 * the end: the wheel overshoots by a few degrees and settles back on its
 * spring, like a pointer finding its peg.
 */
export const GIRO_EASE: [number, number, number, number] = [0.14, 0.72, 0.2, 1.08];
