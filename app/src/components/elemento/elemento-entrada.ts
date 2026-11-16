import { createContext, useContext, useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

export type EntradaElemento = 'plena' | 'breve';

/**
 * Its own flag, on purpose: the Sanctuary, Pillars, Domínios and the rest each
 * keep theirs, so seeing one of them never takes away the arrival of another.
 * The page of an element is staged once per opening of the app; coming back to
 * it only fades in, and switching from one element to another is not an
 * arrival at all, only a change of light.
 */
let elementoJaVisto = false;

/**
 * How long the opening sequence takes to land: light, art, glass, numbers, then
 * the portals and the areas down to the ninth rune. It has to outlast the last
 * of them, or the delays that wait for the arrival would be dropped mid-flight.
 */
export const ABERTURA_ELEMENTO_MS = DURATION.conjure * 4;

/** `entrada` is fixed for the life of the page; `abrindo` is true only while the full arrival plays. */
export function useEntradaElemento(): { entrada: EntradaElemento; abrindo: boolean } {
  const [entrada] = useState<EntradaElemento>(() => (elementoJaVisto ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    elementoJaVisto = true;
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_ELEMENTO_MS : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [entrada]);

  return { entrada, abrindo };
}

/** What the scene tells the figures below it: counted from zero only in the full arrival. */
export const EntradaDoElemento = createContext<EntradaElemento>('breve');
export const useEntradaDaCenaDoElemento = () => useContext(EntradaDoElemento);

/**
 * A value that rests at zero until `atraso` ms after mounting, then moves to
 * the real one, so a ring or a count is seen arriving. With `parte` false it
 * is just the value: a return visit never stages anything twice.
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

/**
 * A sigil that belongs to a name: the same name always draws the same ticks,
 * so every area has a mark of its own without anyone choosing it. Twelve
 * positions on a ring, each short or long.
 */
export function marcasDoSigilo(nome: string): readonly boolean[] {
  let hash = 2166136261;
  for (const letra of nome.toLocaleLowerCase('pt-BR')) {
    hash ^= letra.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return Array.from({ length: 12 }, (_, indice) => ((hash >>> indice) & 1) === 1);
}

/**
 * Points are counted in tenths so a tally can run over whole numbers and still
 * land on a value like 12,5; the reader sees the tenths put back.
 */
export const emDecimos = (pontos: number) => Math.round(pontos * 10);
export const deDecimos = (decimos: number) => (decimos / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
