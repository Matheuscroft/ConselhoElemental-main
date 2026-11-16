import { useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

/** The Forge is staged once per opening of the app; coming back only fades. */
let forjaJaVista = false;

export type EntradaForja = 'plena' | 'breve' | 'pronta';

/**
 * 'plena' lasts while the arrival plays and then hands over to 'pronta', which
 * has no rules, so a card added later does not wait for the heading again.
 * 'breve' is a screen already seen in this opening: only a fade, then the same hand-over.
 */
export function useEntradaForja(): EntradaForja {
  const [plena] = useState(() => !forjaJaVista);
  const [entrada, setEntrada] = useState<EntradaForja>(plena ? 'plena' : 'breve');
  useEffect(() => {
    forjaJaVista = true;
    // The last card of the cascade lands well inside three conjure beats; a fade, inside one settle.
    const fim = window.setTimeout(() => setEntrada('pronta'), plena ? DURATION.conjure * 3 : DURATION.settle);
    return () => window.clearTimeout(fim);
  }, [plena]);
  return entrada;
}
