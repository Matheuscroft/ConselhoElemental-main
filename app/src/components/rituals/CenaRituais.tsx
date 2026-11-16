import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { DURATION } from '@/lib/motion/motion';
import { useAppStore } from '@/stores/appStore';

/** The stage is staged once per opening of the app; coming back only fades. */
let cenaJaVista = false;

type Entrada = 'plena' | 'breve' | 'pronta';

/**
 * The scene of the ritual list: the light of the element leading the week
 * behind the heading, the arrival choreographed once per opening of the app,
 * the finger's light on every `[data-luz]` surface and a little depth that
 * follows the hand. It only reads: nothing here writes or scores anything.
 */
export function CenaRituais({ children }: { children: ReactNode }) {
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

  // 'plena' lasts while the arrival plays, then hands over to 'pronta', which
  // has no rules: a later tab switch must not wait for the heading again.
  const [plena] = useState(() => !cenaJaVista);
  const [entrada, setEntrada] = useState<Entrada>(plena ? 'plena' : 'breve');
  useEffect(() => {
    cenaJaVista = true;
    if (!plena) return;
    const fim = window.setTimeout(() => setEntrada('pronta'), DURATION.conjure * 3);
    return () => window.clearTimeout(fim);
  }, [plena]);

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return <div ref={cenaRef} className="rit-cena" data-entrada={entrada} style={luz}>
    <div className="rit-luz" aria-hidden="true" />
    {children}
  </div>;
}
