import { useMemo } from 'react';
import { useAppStore } from '@/stores/appStore';
import { conclusoesDoApp } from '@/lib/momentos/elemento-da-semana';
import { elementosPorDia } from './elementos-dos-dias';

/** The completions of the app, grouped by day and element. Read-only. */
export function useConclusoesDoApp() {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  return useMemo(() => conclusoesDoApp(habits, actions), [habits, actions]);
}

export function useElementosDosDias() {
  const conclusoes = useConclusoesDoApp();
  return useMemo(() => elementosPorDia(conclusoes), [conclusoes]);
}
