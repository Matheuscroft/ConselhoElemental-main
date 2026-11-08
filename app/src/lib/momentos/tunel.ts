/**
 * The geometry of a corridor you fly down: where each day sits in depth once
 * you know how far the camera has travelled.
 *
 * Pure, like the reel's. The flying itself is a native scroller -- the
 * momentum and the keyboard come free -- and this only decides where each
 * photograph hangs and how the distance eats it.
 */

/** Distance in Z between one day and the next. */
export const ESPACAMENTO = 420;
/** Past this the corridor has swallowed everything into the light. */
export const ALCANCE = ESPACAMENTO * 5;
/** A card this close is going through the camera, so it is let go. */
export const PERTO_DEMAIS = -60;
export const DESFOQUE_MAXIMO = 5;
/** How far from the middle the walls stand, as a fraction of the view. */
export const AFASTAMENTO = 0.34;
export const GIRO_PAREDE = 26;

export interface LugarNoTunel {
  readonly z: number;
  readonly x: number;
  readonly giro: number;
  readonly escala: number;
  readonly opacidade: number;
  readonly desfoque: number;
  readonly visivel: boolean;
}

/**
 * Which wall a day hangs on. They alternate, so flying through reads as a
 * corridor rather than as a column of pictures coming at you, and each one
 * is turned to face the middle.
 */
export function parede(indice: number): { x: number; giro: number } {
  const esquerda = indice % 2 === 0;
  return {
    x: esquerda ? -AFASTAMENTO : AFASTAMENTO,
    giro: esquerda ? GIRO_PAREDE : -GIRO_PAREDE,
  };
}

/** How far ahead a day sits, given how far the camera has flown. */
export const profundidade = (voo: number, indice: number): number => indice * ESPACAMENTO - voo;

/**
 * What the distance does to a photograph. Near the camera it is whole; as it
 * goes it shrinks, dims and softens into the light at the end.
 */
export function lugarNoTunel(voo: number, indice: number): LugarNoTunel {
  const z = profundidade(voo, indice);
  const { x, giro } = parede(indice);

  if (z <= PERTO_DEMAIS || z >= ALCANCE) {
    return { z, x, giro, escala: 0, opacidade: 0, desfoque: 0, visivel: false };
  }

  // 0 at the camera, 1 at the vanishing point.
  const ida = Math.max(0, z) / ALCANCE;
  const curva = ida * ida * (3 - 2 * ida);

  return {
    z,
    x,
    giro,
    escala: 1 - curva * 0.72,
    opacidade: 1 - curva,
    desfoque: curva * DESFOQUE_MAXIMO,
    visivel: true,
  };
}

/** The day the camera is on: the nearest one still ahead of it. */
export function diaNoFoco(voo: number, total: number): number {
  if (total <= 0) return 0;
  const bruto = Math.round(voo / ESPACAMENTO);
  return Math.min(total - 1, Math.max(0, bruto));
}

/** How far the camera must fly for every day to have passed. */
export const vooTotal = (total: number): number => Math.max(0, (total - 1) * ESPACAMENTO);
