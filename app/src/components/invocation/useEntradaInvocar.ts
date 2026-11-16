import { useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

/** The invocation room is staged once per opening of the app; coming back only fades. */
let invocarJaVisto = false;

export type EntradaInvocar = 'plena' | 'breve' | 'pronta';

/**
 * 'plena' lasts while the arrival plays and then hands over to 'pronta', which
 * has no rules, so going back to the first step later does not wait for the
 * heading again. 'breve' is a screen already seen in this opening: only a
 * fade, then the same hand-over.
 */
export function useEntradaInvocar(): EntradaInvocar {
  const [plena] = useState(() => !invocarJaVisto);
  const [entrada, setEntrada] = useState<EntradaInvocar>(plena ? 'plena' : 'breve');
  useEffect(() => {
    invocarJaVisto = true;
    const fim = window.setTimeout(() => setEntrada('pronta'), plena ? DURATION.conjure * 3 : DURATION.settle);
    return () => window.clearTimeout(fim);
  }, [plena]);
  return entrada;
}
