import { DURATION } from '@/lib/motion/motion';
import type { ElementoId } from '@/lib/design/palette';

/**
 * The ceremony that marks finishing something.
 *
 * It is a short sequence of whole screens, not a notice, because that is
 * what makes finishing feel finished: each beat does one thing and shows one
 * number. A single toast reading "+40 XP, 25 days, new piece" says the same
 * words and lands nowhere.
 *
 * It is also deliberately rare. Three full screens every time a habit is
 * ticked is a punishment by the second day; this is for the moments that
 * earn it, and the everyday tick keeps the small `Conjurar` pop instead.
 */

export type Beat = 'chegada' | 'numero' | 'destrave' | 'fim';

export interface NumeroDaCerimonia {
  readonly rotulo: string;
  readonly de: number;
  readonly para: number;
}

export interface Premio {
  /** Which element answers. Its colour and material carry the first beat. */
  readonly elemento?: ElementoId;
  readonly titulo: string;
  readonly numero?: NumeroDaCerimonia;
  readonly destrave?: { readonly titulo: string; readonly detalhe: string };
}

/**
 * How long each beat holds before the next. `chegada` runs on the conjure
 * beat, the only curve in the system that overshoots; the others settle.
 */
export const ESPERA: Record<Exclude<Beat, 'fim'>, number> = {
  chegada: DURATION.conjure + 420,
  numero: DURATION.conjure + 540,
  destrave: DURATION.settle + 700,
};

/**
 * Nobody should wait this long to get back to what they were doing. The test
 * holds the whole ceremony under it, so a beat cannot be lengthened without
 * someone noticing the total.
 */
export const TETO_TOTAL = 4000;

/** The beats this prize actually has: the empty ones are not shown. */
export function beatsDe(premio: Premio): Beat[] {
  const beats: Beat[] = ['chegada'];
  if (premio.numero) beats.push('numero');
  if (premio.destrave) beats.push('destrave');
  beats.push('fim');
  return beats;
}

export function proximoBeat(premio: Premio, atual: Beat): Beat {
  const beats = beatsDe(premio);
  const indice = beats.indexOf(atual);
  if (indice < 0 || indice >= beats.length - 1) return 'fim';
  return beats[indice + 1];
}

export const duracaoTotal = (premio: Premio): number =>
  beatsDe(premio)
    .filter((beat): beat is Exclude<Beat, 'fim'> => beat !== 'fim')
    .reduce((soma, beat) => soma + ESPERA[beat], 0);

/** A prize with nothing in it is not a ceremony, and must not open one. */
export const vaiCelebrar = (premio: Premio | null): premio is Premio =>
  premio !== null && premio.titulo.trim().length > 0;
