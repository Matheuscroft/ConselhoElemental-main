import { useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

export type EntradaCassino = 'plena' | 'breve';

/**
 * Its own flag, on purpose: the Sanctuary, Pillars, Cycles, Rituals, Domínios
 * and the rest each keep theirs, so seeing one of them never takes away the
 * arrival of another.
 */
let cassinoJaVisto = false;

/** How long the opening sequence takes to land: the heading, the glass and the wheel waking up. */
export const ABERTURA_CASSINO_MS = DURATION.conjure * 2.5;

/** `entrada` is fixed for the life of the screen: the whole arrival the first time, a short fade after. */
export function useEntradaCassino(): { entrada: EntradaCassino; abrindo: boolean } {
  const [entrada] = useState<EntradaCassino>(() => (cassinoJaVisto ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    cassinoJaVisto = true;
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_CASSINO_MS : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [entrada]);

  return { entrada, abrindo };
}
