import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessMetaPillProps {
  label: string;
  /** Nível de 1 a 3 (quantidade de pontos preenchidos). */
  level: 1 | 2 | 3;
  /** Valor textual real (lido por leitores de tela), ex.: "Intermediário". */
  valueText: string;
}

/** Rótulo + cápsula violeta com 3 pontos (preenchidos conforme o nível). */
export const FitnessMetaPill: React.FC<FitnessMetaPillProps> = ({ label, level, valueText }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="text-base text-fitness-text">{label}</span>
    <span className="flex h-7 items-center gap-1.5 rounded-full bg-fitness-primary px-3" title={valueText}>
      {[1, 2, 3].map((dot) => (
        <span key={dot} aria-hidden="true" className={cn('h-2 w-2 rounded-full bg-white', dot > level && 'opacity-40')} />
      ))}
      <span className="sr-only">{valueText}</span>
    </span>
    <span aria-hidden="true" className="text-sm text-fitness-muted">{valueText}</span>
  </div>
);
