import { createContext, useContext, useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

export type EntradaAstrolabio = 'plena' | 'breve';

/**
 * Its own flag, on purpose: the Sanctuary, Pillars, Cycles, Rituals, Domínios
 * and the rest each keep theirs, so seeing one of them never takes away the
 * arrival of another.
 */
let astrolabioJaVisto = false;

/** How long the opening sequence takes to land: the wheel igniting, the figures counting. */
export const ABERTURA_ASTROLABIO_MS = DURATION.conjure * 2;

/** `entrada` is fixed for the life of the screen: the whole arrival the first time, a short fade after. */
export function useEntradaAstrolabio(): { entrada: EntradaAstrolabio; abrindo: boolean } {
  const [entrada] = useState<EntradaAstrolabio>(() => (astrolabioJaVisto ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    astrolabioJaVisto = true;
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_ASTROLABIO_MS + DURATION.settle : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [entrada]);

  return { entrada, abrindo };
}

/** What the scene tells the figures below it: counted from zero only in the full arrival. */
export const EntradaDaCena = createContext<EntradaAstrolabio>('breve');
export const useEntradaDaCena = () => useContext(EntradaDaCena);

/**
 * A value that rests at zero until `atraso` ms after mounting, then moves to
 * the real one, so a figure is seen arriving. With `parte` false it is just
 * the value: a return visit never stages anything twice.
 */
export function useDeZero(valor: number, atraso: number, parte: boolean): number {
  const [chegou, setChegou] = useState(false);
  useEffect(() => {
    if (!parte) return;
    const fim = window.setTimeout(() => setChegou(true), atraso);
    return () => window.clearTimeout(fim);
  }, [parte, atraso]);
  return parte && !chegou ? 0 : valor;
}

/** Where a point of a circle sits, in the 0..200 box of the wheel. Angle in degrees, 0 at twelve o'clock, clockwise. */
export function pontoNaRoda(raio: number, graus: number): { x: number; y: number } {
  const radianos = ((graus - 90) * Math.PI) / 180;
  return { x: 100 + raio * Math.cos(radianos), y: 100 + raio * Math.sin(radianos) };
}

/** The slice of the sign ring between two angles, as an SVG path. */
export function fatiaDoAnel(raioInterno: number, raioExterno: number, de: number, ate: number): string {
  const a = pontoNaRoda(raioExterno, de);
  const b = pontoNaRoda(raioExterno, ate);
  const c = pontoNaRoda(raioInterno, ate);
  const d = pontoNaRoda(raioInterno, de);
  const f = (n: number) => n.toFixed(2);
  return `M${f(a.x)} ${f(a.y)} A${raioExterno} ${raioExterno} 0 0 1 ${f(b.x)} ${f(b.y)} L${f(c.x)} ${f(c.y)} A${raioInterno} ${raioInterno} 0 0 0 ${f(d.x)} ${f(d.y)}Z`;
}
