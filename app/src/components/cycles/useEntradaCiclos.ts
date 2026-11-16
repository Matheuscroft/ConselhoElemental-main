import { useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

/** The screen is staged once per opening of the app; coming back only fades. */
let ciclosJaVistos = false;

export type EntradaCiclos = 'plena' | 'breve';

/**
 * How long the opening sequence takes to land, in ms: the light, the header,
 * the panel, the days and then the list. The list delays its cards by this
 * much only while the sequence is still running, so a later change of day
 * cascades at once instead of waiting for an arrival that already happened.
 */
export const ABERTURA_MS = DURATION.conjure + DURATION.settle;

/**
 * `entrada` is fixed for the life of the screen. `abrindo` is true only while
 * the arrival is still playing: the whole sequence the first time in an opening
 * of the app, a short fade when coming back.
 */
export function useEntradaCiclos(): { entrada: EntradaCiclos; abrindo: boolean } {
  const [entrada] = useState<EntradaCiclos>(() => (ciclosJaVistos ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    ciclosJaVistos = true;
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_MS : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [entrada]);

  return { entrada, abrindo };
}
