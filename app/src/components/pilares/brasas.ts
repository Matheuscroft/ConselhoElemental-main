/**
 * The motes that drift through the stage of one element: embers, wisps,
 * bubbles or spores. A fixed table instead of Math.random, so the markup is the
 * same on every render and a test can read it. The stylesheet turns each number
 * into a position, a size and a clock; nothing here knows how it moves.
 */
export interface Brasa {
  /** Where it starts, in percent of the stage width. */
  readonly x: number;
  /** Size in tenths of the base size, 5..14. */
  readonly tamanho: number;
  /** Sideways drift over the trip, in px (negative goes left). */
  readonly deriva: number;
  /** Length of one trip, in beats of the conjure token. */
  readonly ciclo: number;
  /** Head start, as a fraction of the trip, so they never rise in a row. */
  readonly avanco: number;
}

const BASE: readonly Brasa[] = [
  { x: 14, tamanho: 8, deriva: -18, ciclo: 7.5, avanco: 0.1 },
  { x: 24, tamanho: 12, deriva: 14, ciclo: 9, avanco: 0.55 },
  { x: 33, tamanho: 6, deriva: -10, ciclo: 6.5, avanco: 0.8 },
  { x: 42, tamanho: 10, deriva: 22, ciclo: 8.5, avanco: 0.3 },
  { x: 50, tamanho: 7, deriva: -24, ciclo: 7, avanco: 0.95 },
  { x: 58, tamanho: 13, deriva: 12, ciclo: 10, avanco: 0.45 },
  { x: 66, tamanho: 6, deriva: -16, ciclo: 6, avanco: 0.2 },
  { x: 75, tamanho: 11, deriva: 20, ciclo: 8, avanco: 0.7 },
  { x: 84, tamanho: 8, deriva: -12, ciclo: 9.5, avanco: 0.05 },
  { x: 91, tamanho: 9, deriva: 16, ciclo: 7.5, avanco: 0.6 },
];

/** Ten motes. The same table for all four elements; the stylesheet gives each its own motion. */
export const BRASAS: readonly Brasa[] = BASE;
