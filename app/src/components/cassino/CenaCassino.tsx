import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';
import type { ElementId } from '@/types';
import { useEntradaCassino } from './entrada-cassino';

/**
 * The scene of the Cassino Arcano: the light of the element leading the week
 * behind the heading, the arrival choreographed once per opening of the app,
 * the finger's light on every `[data-luz]` surface and a little depth that
 * follows the hand. When the wheel names an activity the whole room takes the
 * colour of its element. It only reads: nothing here writes or scores anything.
 */
export function CenaCassino({ sorteado, children }: { sorteado: ElementId | null; children: ReactNode }) {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLDivElement>(null);

  const [hoje] = useState(() => new Date());
  const semana = useMemo(
    () => elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento,
    [habits, actions, hoje],
  );
  const luzElemento = sorteado ?? semana;
  const luz = luzElemento
    ? ({ '--semana-acento': ACENTO[luzElemento], '--semana-aura': AURA[luzElemento] } as CSSProperties)
    : undefined;

  const { entrada, abrindo } = useEntradaCassino();

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return <div ref={cenaRef} className="elemental-system destiny-workspace cas-cena" data-entrada={entrada} data-abrindo={abrindo} data-sorteado={sorteado ?? undefined} style={luz}>
    <div className="cas-luz" aria-hidden="true" />
    {children}
  </div>;
}
