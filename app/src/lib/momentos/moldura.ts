import type { ElementoDoDia } from './elemento-do-dia.ts';

/**
 * The frame of the open card in the Reel. Pure data and one pure rule; the
 * canvas and the SVG only read from here.
 *
 * The colour is the day's leading element (see elemento-do-dia.ts), not the
 * sign. A day with no leading element is gold and lights no triangle.
 */

/** Gold, for a day that has no leading element. */
export const NEUTRO = '#d6b66f';

/** The glow ring around the card, in CSS px, and the room the canvas adds. */
export const MARGEM_PX = 24;

/** Particles allocated; a finished day draws all of them, otherwise PARTICULAS. */
export const PARTICULAS = 64;
export const PARTICULAS_DIA_COMPLETO = 96;

/** The four alchemical triangles, in the order they light up. */
export const TRIANGULOS: readonly ElementoDoDia[] = ['fogo', 'agua', 'ar', 'terra'];

export interface ConfigElemento {
  /** Orbit speed, in turns per second. */
  readonly velocidade: number;
  /** How far outside the border a particle orbits, in px: [min, max]. */
  readonly afastamento: readonly [number, number];
  /** Drift away from the card in px/s (negative falls back in). */
  readonly subida: number;
  /** Sprite size in px at DPR 1. */
  readonly tamanho: number;
  /** 0..1, how much each particle flickers. */
  readonly cintilar: number;
}

/**
 * Fire spirals up in embers, water drifts slow, earth orbits low and small,
 * air is quick and flickers. The speed multiplier of the sign's modality is
 * gone with the sign: it is 1 for every element.
 */
export const CONFIG: Record<ElementoDoDia, ConfigElemento> = {
  fogo: { velocidade: 0.07, afastamento: [3, 22], subida: 9, tamanho: 3.2, cintilar: 0.55 },
  agua: { velocidade: 0.04, afastamento: [6, 24], subida: -3, tamanho: 4.2, cintilar: 0.2 },
  terra: { velocidade: 0.05, afastamento: [2, 9], subida: 0, tamanho: 2.6, cintilar: 0.3 },
  ar: { velocidade: 0.16, afastamento: [8, 26], subida: 2, tamanho: 2.4, cintilar: 0.85 },
};

/** The orbit of a day without a leading element: calm, gold. */
export const CONFIG_NEUTRO: ConfigElemento = {
  velocidade: 0.05,
  afastamento: [4, 18],
  subida: 0,
  tamanho: 2.8,
  cintilar: 0.3,
};

export const configDoElemento = (elemento: ElementoDoDia | null): ConfigElemento =>
  elemento ? CONFIG[elemento] : CONFIG_NEUTRO;

/** The colour of the frame: the element's own aura, or gold. */
export const corDaMoldura = (
  elemento: ElementoDoDia | null,
  aura: Readonly<Record<ElementoDoDia, string>>,
): string => (elemento ? aura[elemento] : NEUTRO);

/** Which triangles are lit: the day's element; all four once the day is done. */
export function triangulosAcesos(elemento: ElementoDoDia | null, completo: boolean): readonly ElementoDoDia[] {
  if (!elemento) return [];
  return completo ? TRIANGULOS : [elemento];
}

export interface EstadoDoDia {
  readonly dia: string;
  readonly feitos: number;
  readonly total: number;
}

/**
 * True only when the last cycle of the open day was just completed here:
 * same day, at least one cycle, and done went from total - 1 to total. Opening
 * an already finished day, a jump from 0 to the total, or changing day never
 * counts.
 */
export function diaConquistado(anterior: EstadoDoDia | null, atual: EstadoDoDia | null): boolean {
  if (!anterior || !atual) return false;
  if (anterior.dia !== atual.dia) return false;
  if (atual.total <= 0) return false;
  return anterior.feitos === atual.total - 1 && atual.feitos === atual.total;
}
