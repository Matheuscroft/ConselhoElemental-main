import { useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

/**
 * Its own flag, on purpose: the Sanctuary, Pillars, Cycles, Rituals and the
 * achievements each keep theirs, so seeing one of them never takes away the
 * arrival of another. Training is staged once per opening of the app.
 */
let treinosJaVistos = false;

/** `plena` while the arrival plays, `pronta` once it has landed, `breve` when coming back. */
export type EntradaTreinos = 'plena' | 'pronta' | 'breve';

/**
 * `plena` lasts only while the arrival plays and then hands over to `pronta`,
 * which has no waiting: a later tab switch must not wait for the heading again.
 */
export function useEntradaTreinos(ativa: boolean): EntradaTreinos {
  const [plena] = useState(() => !treinosJaVistos);
  const [entrada, setEntrada] = useState<EntradaTreinos>(plena ? 'plena' : 'breve');
  useEffect(() => {
    if (!ativa) return;
    treinosJaVistos = true;
    if (!plena) return;
    const fim = window.setTimeout(() => setEntrada('pronta'), DURATION.conjure * 3);
    return () => window.clearTimeout(fim);
  }, [ativa, plena]);
  return entrada;
}
