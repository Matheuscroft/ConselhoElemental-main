import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { MUSCLE_LABELS } from '@/lib/workout';
import type { ElementoId } from '@/lib/design/palette';
import type { MuscleContribution } from '@/types/workout';

interface MuscleBarsProps {
  distribution: MuscleContribution[];
  emptyMessage: string;
  maxItems?: number;
  /** Cor do elemento da modalidade; sem ele, mantém o dourado do kit. */
  elemento?: ElementoId;
}

/** Vê a lista entrar na tela uma única vez. Sem observador (ou sem janela), já nasce visível. */
function useEntrouNaTela<T extends Element>() {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    const no = ref.current;
    if (!no || visivel || typeof IntersectionObserver === 'undefined') return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (entrada?.isIntersecting) { setVisivel(true); observador.disconnect(); }
    }, { threshold: 0.25 });
    observador.observe(no);
    return () => observador.disconnect();
  }, [visivel]);
  return { ref, visivel };
}

/** Barras horizontais finas com a distribuição muscular real: desenham-se ao entrar na tela e os valores contam. */
export const MuscleBars: React.FC<MuscleBarsProps> = ({ distribution, emptyMessage, maxItems = 6, elemento }) => {
  const sorted = [...distribution].sort((a, b) => b.percentage - a.percentage).slice(0, maxItems);
  const { ref, visivel } = useEntrouNaTela<HTMLUListElement>();
  if (sorted.length === 0) return <p className="py-2 text-sm text-fitness-muted">{emptyMessage}</p>;

  return (
    <ul ref={ref} data-element={elemento} className="mb-lista space-y-4" aria-label="Distribuição muscular">
      {sorted.map((entry, indice) => {
        const alvo = Math.max(0, Math.min(100, entry.percentage));
        return (
          <li key={entry.muscleId} data-lider={indice === 0 ? '' : undefined} style={{ '--i': indice } as CSSProperties}>
            <div className="mb-linha mb-1.5 flex items-center justify-between text-base">
              <span className="mb-nome text-fitness-text-soft">{MUSCLE_LABELS[entry.muscleId]}</span>
              <span className="mb-valor text-fitness-muted tabular-nums"><Contagem valor={visivel ? Math.round(entry.percentage) : 0} beat="settle" formatar={(valor) => `${Math.round(valor)}%`} /></span>
            </div>
            <div className="mb-trilho h-2 w-full overflow-hidden rounded-full bg-fitness-surface-muted">
              <div
                className="mb-barra fitness-motion-bar h-full w-full origin-left rounded-full bg-fitness-primary"
                data-elemento={elemento}
                style={{ transform: `scaleX(${visivel ? alvo / 100 : 0})`, transitionDelay: 'calc(var(--i, 0) * var(--ds-stagger))' }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
};
