import type { ElementoId } from '@/lib/design/palette';

/**
 * The contract between the Sanctuary's constellation (which decides where each
 * orb is and which one has the focus) and the WebGL scene that draws them.
 * The scene owns pixels only: it never routes, never reads the store, and the
 * links that people touch stay in the DOM.
 */

/** Where one orb stands this frame, in fractions of the orbit stage (0..1, top-left origin). */
export interface OrbeEstado {
  readonly elemento: ElementoId;
  readonly x: number;
  readonly y: number;
  /** 1 at the resting size; larger when nearer to the viewer. */
  readonly escala: number;
  /** -1 at the back of the orbit, +1 at the front. Back orbs are drawn smaller and dimmer, never hidden. */
  readonly profundidade: number;
  /** 0..1: how much this orb is the one in focus (the one at the front, or the one being touched). */
  readonly foco: number;
  /** 0..1: how much it asks for attention (pending work today). Drives a slow pulse of light. */
  readonly carga: number;
}

export interface CenaOrbesOpcoes {
  readonly elementos: readonly ElementoId[];
  /** Someone asked for less motion: draw still frames, no particles in motion. */
  readonly reduzido: boolean;
  /** Called once if the device cannot hold the frame rate; the page then falls back to the 2D art. */
  readonly aoDegradar?: () => void;
}

export interface CenaOrbes {
  /** Draws one frame. `segundos` is a monotonic clock. Cheap: no allocation. */
  atualizar(estados: readonly OrbeEstado[], segundos: number): void;
  /** The canvas changed size. */
  redimensionar(): void;
  /** Frees every GPU resource and stops. Safe to call twice. */
  parar(): void;
}

/** Returns null when WebGL is unavailable or the context cannot be created. */
export type CriarCenaOrbes = (canvas: HTMLCanvasElement, opcoes: CenaOrbesOpcoes) => CenaOrbes | null;
