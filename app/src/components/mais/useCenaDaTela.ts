import { createContext, useContext, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { ACENTO, AURA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';

/** The screens of this pass that are staged once per opening of the app. */
export type TelaDaPassada = 'hub' | 'mapa' | 'lua' | 'estacoes';
export type EntradaDaTela = 'plena' | 'breve';

/**
 * Its own flag, on purpose: the Sanctuary, Pillars, Cycles, Rituals and the
 * achievements each keep theirs, so seeing one of them never takes away the
 * arrival of another. Here every screen has its own entry too.
 */
const telasVistas = new Set<TelaDaPassada>();

/** How long the opening sequence takes to land, in ms: the light, the heading, the glass and then the rest. */
export const ABERTURA_DA_TELA_MS = DURATION.conjure + DURATION.settle;

/** `entrada` is fixed for the life of the screen: the whole arrival the first time, a short fade after. */
export function useEntradaDaTela(tela: TelaDaPassada): { entrada: EntradaDaTela; abrindo: boolean } {
  const [entrada] = useState<EntradaDaTela>(() => (telasVistas.has(tela) ? 'breve' : 'plena'));
  const [abrindo, setAbrindo] = useState(true);

  useEffect(() => {
    telasVistas.add(tela);
    const fim = window.setTimeout(() => setAbrindo(false), entrada === 'plena' ? ABERTURA_DA_TELA_MS : DURATION.reveal);
    return () => window.clearTimeout(fim);
  }, [tela, entrada]);

  return { entrada, abrindo };
}

/** What the scene tells the numbers below it: counted from zero only in the full arrival. */
export const EntradaDaCenaContexto = createContext<EntradaDaTela>('breve');
export const useEntradaDaCena = () => useContext(EntradaDaCenaContexto);

/**
 * A value that rests at zero until `atraso` ms after mounting, then moves to
 * the real one, so a count is seen arriving. With `parte` false it is just the
 * value: a return visit never stages anything twice.
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
 * The colours of the element that leads the person's week, as the two custom
 * properties every scene of this pass reads. Undefined until the week has a
 * leader: the stylesheet falls back to gold. Read-only; nothing here writes
 * or scores anything.
 */
export function useLuzDaSemana(): CSSProperties | undefined {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const [hoje] = useState(() => new Date());
  const semana = useMemo(
    () => elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento,
    [habits, actions, hoje],
  );
  return semana
    ? ({ '--semana-acento': ACENTO[semana], '--semana-aura': AURA[semana] } as CSSProperties)
    : undefined;
}
