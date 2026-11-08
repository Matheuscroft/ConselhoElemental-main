/**
 * Geometry and state for the elemental awakening scene, kept free of React and
 * of the DOM so it can be reasoned about and tested on its own.
 *
 * Every coordinate is a fraction of the base plate: x of its width, y of its
 * height. Radii are fractions of the WIDTH, so distances normalise y by the
 * aspect ratio; otherwise a circle would read as an ellipse. The numbers come
 * from docs/plans/conceito-b/assets/manifesto.json.
 */

export const PLATE_WIDTH = 1024;
export const PLATE_HEIGHT = 1536;
export const PLATE_ASPECT = PLATE_HEIGHT / PLATE_WIDTH;

export type AwakeningElementId = 'terra' | 'fogo' | 'agua' | 'ar';

export interface AwakeningElement {
  readonly id: AwakeningElementId;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  /** Generous enough for a finger; larger than the glow it lights. */
  readonly touchRadius: number;
  readonly glowRadius: number;
  readonly colour: string;
}

export const AWAKENING_ELEMENTS: readonly AwakeningElement[] = [
  { id: 'terra', name: 'Terra', x: 0.313, y: 0.192, touchRadius: 0.135, glowRadius: 0.12, colour: '#a3ce9b' },
  { id: 'fogo', name: 'Fogo', x: 0.252, y: 0.37, touchRadius: 0.107, glowRadius: 0.085, colour: '#f5ad83' },
  { id: 'agua', name: 'Água', x: 0.674, y: 0.199, touchRadius: 0.107, glowRadius: 0.09, colour: '#8bcee3' },
  { id: 'ar', name: 'Ar', x: 0.744, y: 0.372, touchRadius: 0.112, glowRadius: 0.1, colour: '#d2e6df' },
];

export const ALTAR = { x: 0.5, y: 0.573 };
export const CONTROLS_BAND_Y = 0.768;

/** How far each layer drifts, as a fraction of the plate width, at full tilt. */
export const PARALLAX = {
  plate: 0.012,
  sky: 0.006,
  glow: 0.012,
} as const;

export interface ScenePoint {
  readonly x: number;
  readonly y: number;
}

/** Distance in width-fractions, so a radius means the same in both axes. */
export const sceneDistance = (a: ScenePoint, b: ScenePoint): number => {
  return Math.hypot(a.x - b.x, (a.y - b.y) * PLATE_ASPECT);
};

/**
 * Which element a tap belongs to. When two touch areas overlap, the nearer
 * centre wins, so a finger between Fire and Earth never lights the wrong one.
 */
export function hitTestElement(point: ScenePoint): AwakeningElementId | null {
  let closest: AwakeningElementId | null = null;
  let best = Number.POSITIVE_INFINITY;

  for (const element of AWAKENING_ELEMENTS) {
    const distance = sceneDistance(point, element);
    if (distance <= element.touchRadius && distance < best) {
      best = distance;
      closest = element.id;
    }
  }

  return closest;
}

/** Drift of a layer, in plate-width fractions, for a tilt in -1..1 on each axis. */
export function parallaxOffset(tilt: ScenePoint, factor: number): ScenePoint {
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return { x: clamp(tilt.x) * factor, y: clamp(tilt.y) * factor };
}

export type AwakeningState = {
  /** Insertion order, so the scene can tell which element was lit last. */
  readonly lit: readonly AwakeningElementId[];
};

export const createAwakening = (): AwakeningState => ({ lit: [] });

/** Lighting an element is idempotent, and the order is the person's own. */
export function awaken(state: AwakeningState, id: AwakeningElementId): AwakeningState {
  if (state.lit.includes(id)) return state;
  return { lit: [...state.lit, id] };
}

export const isLit = (state: AwakeningState, id: AwakeningElementId): boolean => state.lit.includes(id);

export const isAwakeningComplete = (state: AwakeningState): boolean => {
  return state.lit.length === AWAKENING_ELEMENTS.length;
};

/** Everything lit at once: the reduced-motion and skip paths land here. */
export const completeAwakening = (): AwakeningState => ({
  lit: AWAKENING_ELEMENTS.map((element) => element.id),
});
