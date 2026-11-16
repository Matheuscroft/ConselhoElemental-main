import { createContext, useContext, useEffect, useState } from 'react';
import { DURATION } from '@/lib/motion/motion';

/** The two screens of Domínios, each staged once per opening of the app. */
export type TelaDeDominios = 'lista' | 'detalhe';
export type EntradaDominios = 'plena' | 'breve';

/**
 * Its own flag, on purpose: the Sanctuary, Pillars, Cycles, Rituals, Journeys
 * and the rest each keep theirs, so seeing one of them never takes away the
 * arrival of another. The list and the detail here are separate too.
 */
const telasVistas = new Set<TelaDeDominios>();

/** How long the opening sequence takes to land: the light, the heading, the summary and then the cards. */
export const ABERTURA_DOMINIOS_MS = DURATION.conjure + DURATION.settle;

/** `entrada` is fixed for the life of the screen: the whole arrival the first time, a short fade after. */
export function useEntradaDominios(tela: TelaDeDominios): { entrada: EntradaDominios; abrindo: boolean } {
  const [entrada] = useState<EntradaDominios>(() => (telasVistas.has(tela) ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    telasVistas.add(tela);
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_DOMINIOS_MS : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [tela, entrada]);

  return { entrada, abrindo };
}

/** What the scene tells the figures below it: counted from zero only in the full arrival. */
export const EntradaDaCena = createContext<EntradaDominios>('breve');
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

/**
 * A sigil that belongs to a name: the same name always draws the same ticks,
 * so every subarea has a mark of its own without anyone choosing it. Twelve
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
