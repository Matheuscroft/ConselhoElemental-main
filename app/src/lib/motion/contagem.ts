import { EASE } from '@/lib/motion/motion';

/**
 * A cubic bezier solved for y at a given x, which is what a CSS easing name
 * means. Newton gets close fast, and the few bisection steps after it keep a
 * flat stretch of the curve from stalling the solver.
 */
const bezier = ([x1, y1, x2, y2]: readonly number[]) => {
  const curve = (a: number, b: number, t: number) =>
    3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const error = curve(x1, x2, t) - x;
      if (Math.abs(error) < 1e-5) return curve(y1, y2, t);
      const slope =
        3 * x1 * (1 - t) * (1 - 3 * t) + 3 * x2 * t * (2 - 3 * t) + 3 * t * t;
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }

    let low = 0;
    let high = 1;
    for (let i = 0; i < 24; i += 1) {
      t = (low + high) / 2;
      if (curve(x1, x2, t) < x) low = t;
      else high = t;
    }
    return curve(y1, y2, t);
  };
};

const easeStandard = bezier(EASE.standard);

/**
 * Where a counting number stands at a point in its run. Whole numbers only:
 * XP, a streak and a level are counted things, and a decimal flickering past
 * reads as a glitch rather than as a tally.
 */
export function contagemValor(from: number, to: number, progress: number): number {
  if (progress <= 0) return Math.round(from);
  if (progress >= 1) return Math.round(to);
  return Math.round(from + (to - from) * easeStandard(progress));
}
