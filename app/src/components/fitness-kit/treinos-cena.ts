import { useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';
import { ELEMENTO_DO_ESFORCO } from './treinos-elementos';
import { useEntradaTreinos, type EntradaTreinos } from './treinos-entrada';

/**
 * The scene of the training module: the light of the element leading the week
 * (the fire of effort until the week has a leader), the arrival staged once
 * per opening of the app, the finger's light on every `[data-luz]` surface and
 * a little depth that follows the hand. It only reads: nothing here writes
 * or scores anything.
 */
export function useCenaTreinos(ativa: boolean): {
  cenaRef: RefObject<HTMLElement | null>;
  entrada: EntradaTreinos;
  luz: CSSProperties;
} {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const reduzido = useMotionPreference();
  const cenaRef = useRef<HTMLElement>(null);

  const [hoje] = useState(() => new Date());
  const elemento = useMemo(
    () => (ativa ? elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento : null) ?? ELEMENTO_DO_ESFORCO,
    [ativa, habits, actions, hoje],
  );
  const luz = { '--semana-acento': ACENTO[elemento], '--semana-aura': AURA[elemento] } as CSSProperties;

  const entrada = useEntradaTreinos(ativa);

  useParalaxe(cenaRef, ativa && !reduzido);
  useLuzDoToque(cenaRef);

  return { cenaRef, entrada, luz };
}
