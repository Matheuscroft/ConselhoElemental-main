import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';
import type { EntradaGrimorio } from './useEntradaGrimorio';

/**
 * The scene of the Grimoire: the light of the element leading the week behind
 * the heading and the sheet, the arrival choreographed once per opening of
 * the app, the finger's light on every `[data-luz]` surface and a little depth
 * that follows the hand. It only reads: nothing here writes or scores anything.
 */
export function CenaGrimorio({ entrada, children }: { entrada: EntradaGrimorio; children: ReactNode }) {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);

  const [hoje] = useState(() => new Date());
  const semana = useMemo(
    () => elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento,
    [habits, actions, hoje],
  );
  const luz = semana
    ? ({ '--semana-acento': ACENTO[semana], '--semana-aura': AURA[semana] } as CSSProperties)
    : undefined;

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return <div ref={cenaRef} className="grimoire-workspace gr-cena" data-entrada={entrada} style={luz}>
    <div className="gr-luz" aria-hidden="true" />
    {children}
  </div>;
}
