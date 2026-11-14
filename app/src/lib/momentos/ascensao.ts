import type { ElementoDoDia } from './elemento-do-dia.ts';
import type { NivelVfx } from './nivel-vfx.ts';
import { DURATION } from '../motion/motion.ts';

/**
 * The ascension ceremony of the frame: when an element rises to level 2
 * (Fluxo) or level 3 (Domínio) the Reel shows it. Pure rules only; the canvases
 * and the page read from here, so the timing can be tested without a GPU.
 */

export type NivelDeAscensao = 2 | 3;

/** What the Reel plays: `n` grows with each ascension, so the same one never replays. */
export interface AscensaoDoReel {
  readonly n: number;
  readonly elemento: ElementoDoDia;
  readonly nivel: NivelDeAscensao;
}

/** How long the element overflows on the frame, in ms: level 3 is the grand one. */
export const DURACAO_TRANSBORDO_MS: Readonly<Record<NivelDeAscensao, number>> = { 2: 1800, 3: 3000 };

/** How high the overflow climbs (1 is the full level-3 peak). */
export const PICO_TRANSBORDO: Readonly<Record<NivelDeAscensao, number>> = { 2: 0.65, 3: 1 };

/** The reduced-motion highlight: a still glow, brief, never animated. */
export const REALCE_REDUZIDO_MS = DURATION.conjure * 2;

/** The leap across the screen: longer than a day change (1.4 s), by level. */
export const DURACAO_DOBRA_ASCENSAO_S: Readonly<Record<NivelDeAscensao, number>> = { 2: 2, 3: 2.6 };

/** Leap particles of an ascension: 1.5x the day-change leap (240) at 2, 1.5x the conquest (480) at 3. */
export const PARTICULAS_DOBRA_ASCENSAO: Readonly<Record<NivelDeAscensao, number>> = { 2: 360, 3: 720 };

/** The window never waits longer than this for the page to scroll to the Reel. */
export const ESPERA_ROLAGEM_MAX_MS = 1200;

/** A frame of the overflow envelope: rises fast, holds, then settles back to nothing. */
export function envelopeTransbordo(tMs: number, nivel: NivelDeAscensao): number {
  const total = DURACAO_TRANSBORDO_MS[nivel];
  if (!(tMs > 0) || tMs >= total) return 0;
  const pico = PICO_TRANSBORDO[nivel];
  const subida = DURATION.conjure;
  const descida = DURATION.settle;
  if (tMs < subida) return pico * (1 - (1 - tMs / subida) ** 3);
  if (tMs <= total - descida) return pico;
  const k = (total - tMs) / descida;
  return pico * (k * k * (3 - 2 * k));
}

/** Total time the ceremony owns the frame, and the gap before the next one may start. */
export const duracaoDaCerimonia = (nivel: NivelDeAscensao, reduzido: boolean): number =>
  reduzido ? REALCE_REDUZIDO_MS : DURACAO_TRANSBORDO_MS[nivel];

export const intervaloEntreCerimonias = (nivel: NivelDeAscensao, reduzido: boolean): number =>
  duracaoDaCerimonia(nivel, reduzido) + DURATION.settle;

export interface PlanoDaCerimonia {
  readonly modo: 'animada' | 'estatica';
  /** The scroll that brings the Reel into view: never animated with reduced motion. */
  readonly rolagem: 'smooth' | 'auto';
  /** The full-screen canvas: only an animated ceremony schedules it. */
  readonly dobra: boolean;
  readonly duracaoMs: number;
}

export function planoDaCerimonia(nivel: NivelDeAscensao, reduzido: boolean): PlanoDaCerimonia {
  return {
    modo: reduzido ? 'estatica' : 'animada',
    rolagem: reduzido ? 'auto' : 'smooth',
    dobra: !reduzido,
    duracaoMs: duracaoDaCerimonia(nivel, reduzido),
  };
}

/** During the ceremony the frame wears the element that rose; after it, the week's leader. */
export function elementoDaMoldura(
  lider: ElementoDoDia | null,
  ascensao: Pick<AscensaoDoReel, 'elemento'> | null,
): ElementoDoDia | null {
  return ascensao ? ascensao.elemento : lider;
}

/** During the ceremony the frame shows the new level; after it, the card's own. */
export function nivelDaMoldura(nivelDoCartao: NivelVfx, ascensao: Pick<AscensaoDoReel, 'nivel'> | null): NivelVfx {
  return ascensao ? ascensao.nivel : nivelDoCartao;
}

/** The Reel needs scrolling to when its block is not fully inside the window. */
export function precisaRolarAteOReel(topo: number, base: number, alturaDaJanela: number): boolean {
  return topo < 0 || base > alturaDaJanela;
}

/** True once the block has reached the middle of the window or stopped moving (a page that ends first). */
export function reelAssentou(centro: number, alturaDaJanela: number, quadrosParado: number): boolean {
  return Math.abs(centro - alturaDaJanela / 2) <= 2 || quadrosParado >= 4;
}

/** First in, first out: ascensions are played one at a time, in the order they came. */
export class FilaDeAscensoes<T> {
  private itens: T[] = [];

  empurrar(item: T): void {
    this.itens.push(item);
  }

  proxima(): T | undefined {
    return this.itens.shift();
  }

  get tamanho(): number {
    return this.itens.length;
  }

  esvaziar(): T[] {
    const resto = this.itens;
    this.itens = [];
    return resto;
  }
}
