import { createContext, useContext, useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

/** The two screens of achievements, each staged once per opening of the app. */
export type TelaDeConquistas = 'jornadas' | 'obras';
export type EntradaConquistas = 'plena' | 'breve';

/**
 * Its own flag, on purpose: Sanctuary, Pillars, Cycles and Rituals each keep
 * theirs, so seeing one of them never takes away the arrival of another. The
 * two screens here are separate too, one entry per screen per opening.
 */
const telasVistas = new Set<TelaDeConquistas>();

/**
 * How long the opening sequence takes to land, in ms: the light, the heading,
 * the summary and then the cards. Cards wait for it only while it still runs.
 */
export const ABERTURA_CONQUISTAS_MS = DURATION.conjure + DURATION.settle;

/** `entrada` is fixed for the life of the screen: the whole arrival the first time, a short fade after. */
export function useEntradaConquistas(tela: TelaDeConquistas): { entrada: EntradaConquistas; abrindo: boolean } {
  const [entrada] = useState<EntradaConquistas>(() => (telasVistas.has(tela) ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    telasVistas.add(tela);
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_CONQUISTAS_MS : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [tela, entrada]);

  return { entrada, abrindo };
}

/** What the scene tells the numbers below it: counted from zero only in the full arrival. */
export const EntradaDaCena = createContext<EntradaConquistas>('breve');
export const useEntradaDaCena = () => useContext(EntradaDaCena);

/**
 * A value that rests at zero until `atraso` ms after mounting, then moves to
 * the real one, so a meter or a count is seen arriving. With `parte` false it
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
