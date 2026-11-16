import { useEffect, useState } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { DURATION } from '@/lib/motion/motion';

/** The Grimoire is staged once per opening of the app; coming back only fades. */
let grimorioJaVisto = false;

export type EntradaGrimorio = 'plena' | 'breve';

/**
 * `entrada` is fixed for the life of the screen: the whole sequence the first
 * time in an opening of the app, a short fade when coming back.
 *
 * `acesa` is what the numbers wait for. It stays false while the sheet is
 * still arriving, so the bars fill and the counters run in front of the
 * person, and it is true from the first render on a return visit or when the
 * person asked for less motion: nothing is counted twice.
 */
export function useEntradaGrimorio(): { entrada: EntradaGrimorio; acesa: boolean } {
  const reduzido = useMotionPreference();
  const [entrada] = useState<EntradaGrimorio>(() => (grimorioJaVisto ? 'breve' : 'plena'));
  const [liberada, setLiberada] = useState(false);

  useEffect(() => {
    grimorioJaVisto = true;
    if (entrada !== 'plena') return;
    const fim = window.setTimeout(() => setLiberada(true), DURATION.conjure);
    return () => window.clearTimeout(fim);
  }, [entrada]);

  return { entrada, acesa: reduzido || entrada === 'breve' || liberada };
}
