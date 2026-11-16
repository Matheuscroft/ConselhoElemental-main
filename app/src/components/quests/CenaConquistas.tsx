import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';
import { EntradaDaCena, useEntradaConquistas, type TelaDeConquistas } from './entrada-conquistas';
import './quests-uau.css';

/**
 * The scene of Journeys and Great Works: the light of the element leading the
 * week behind the heading, the arrival choreographed once per opening of the
 * app, the finger's light on every `[data-luz]` surface and a little depth
 * that follows the hand. It only reads: nothing here writes or scores.
 */
export function CenaConquistas({ tela, className, children }: { tela: TelaDeConquistas; className?: string; children: ReactNode }) {
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

  const { entrada, abrindo } = useEntradaConquistas(tela);

  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(cenaRef);

  return <EntradaDaCena.Provider value={entrada}>
    <div ref={cenaRef} className={className ? `cq-cena ${className}` : 'cq-cena'} data-entrada={entrada} data-abrindo={abrindo} style={luz}>
      <div className="cq-luz" aria-hidden="true" />
      {children}
    </div>
  </EntradaDaCena.Provider>;
}
