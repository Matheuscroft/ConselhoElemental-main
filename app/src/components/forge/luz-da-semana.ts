import { useMemo, useState, type CSSProperties } from 'react';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';
import { useAppStore } from '@/stores/appStore';

/**
 * The element leading this week, read from what was finished. Only reads:
 * nothing here writes or scores anything. Null until the week has a leader.
 */
export function useElementoDaSemana(): ElementoDoDia | null {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const [hoje] = useState(() => new Date());
  return useMemo(
    () => elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento,
    [habits, actions, hoje],
  );
}

/** The two colours a scene reads, as custom properties; the stylesheet has gold as its rest. */
export function luzDoElemento(elemento: ElementoDoDia | null): CSSProperties | undefined {
  return elemento
    ? ({ '--semana-acento': ACENTO[elemento], '--semana-aura': AURA[elemento] } as CSSProperties)
    : undefined;
}
