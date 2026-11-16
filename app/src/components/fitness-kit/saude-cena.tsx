import React, { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useLuzDoToque } from '@/components/sanctuary/useCenaViva';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { useAppStore } from '@/stores/appStore';
import { LUZ_PADRAO, SaudeLuzContext, type SaudeLuz } from './saude-luz';

/** Which Health views were already staged, per opening of the app. */
const vistas = new Set<string>();

interface SaudeCenaProps {
  /** One entry per view per opening of the app: coming back only rests. */
  chave: string;
  children: React.ReactNode;
}

/**
 * The scene of a Health view: the light of the element leading the week behind
 * the content, the arrival staged once per opening of the app (the pieces come
 * in one after another, by CSS) and the finger's light on every `[data-luz]`
 * surface. It only reads: nothing here writes or scores anything.
 */
export const SaudeCena: React.FC<SaudeCenaProps> = ({ chave, children }) => {
  const habits = useAppStore((state) => state.habits);
  const actions = useAppStore((state) => state.actions);
  const cenaRef = useRef<HTMLDivElement>(null);
  const [hoje] = useState(() => new Date());
  /** Fixed for the life of the view: the whole arrival the first time, nothing staged after. */
  const [entrada] = useState<'plena' | 'breve'>(() => (vistas.has(chave) ? 'breve' : 'plena'));

  const luz = useMemo<SaudeLuz>(() => {
    const semana = elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento;
    return semana ? { acento: ACENTO[semana], aura: AURA[semana], elemento: semana } : LUZ_PADRAO;
  }, [habits, actions, hoje]);

  useEffect(() => { vistas.add(chave); }, [chave]);

  useLuzDoToque(cenaRef);

  const estilo = { '--saude-acento': luz.acento, '--saude-aura': luz.aura } as CSSProperties;

  return (
    <SaudeLuzContext.Provider value={luz}>
      <div ref={cenaRef} className="saude-cena" data-entrada={entrada} style={estilo}>
        <div className="saude-aura" aria-hidden="true" />
        {children}
      </div>
    </SaudeLuzContext.Provider>
  );
};
