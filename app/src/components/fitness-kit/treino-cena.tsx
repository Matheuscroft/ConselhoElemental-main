import { useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';
import './treino-uau.css';

/**
 * The room of the training flow: the light of the element leading the week
 * behind the content, and a short arrival for whatever carries `.treino-entra`.
 * It only reads. No parallax and no pointer light on purpose: someone training
 * has the phone in a moving hand and wants a still, readable screen.
 */
export function TreinoCena({ children, className }: { children: ReactNode; className?: string }) {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const [hoje] = useState(() => new Date());
  const semana = useMemo(
    () => elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento,
    [habits, actions, hoje],
  );
  const luz = semana
    ? ({ '--semana-acento': ACENTO[semana], '--semana-aura': AURA[semana] } as CSSProperties)
    : undefined;
  return <div className={className ? `treino-cena ${className}` : 'treino-cena'} style={luz}>
    <div className="treino-luz" aria-hidden="true" />
    {children}
  </div>;
}
