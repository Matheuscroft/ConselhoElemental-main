import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { NumeroQueConta } from './treino-numero';
import './treino-uau.css';

export interface TreinoEstatistica { id: string; label: string; value: string; unit?: string }

/** The numbers of a session: a pane each, plain figures count up, clocks stay as written. */
export function TreinoEstatisticas({ metrics, className, denso = false }: { metrics: readonly TreinoEstatistica[]; className?: string; denso?: boolean }) {
  return <dl className={cn('treino-stats', className)} data-denso={denso}>
    {metrics.map(({ id, label, value, unit }, indice) => <div key={id} className="treino-stat ds-pane treino-entra" style={{ '--i': indice + 2 } as CSSProperties}>
      <dt>{label}</dt>
      <dd><NumeroQueConta texto={value} atraso={indice * 60} />{unit && <span>{unit}</span>}</dd>
    </div>)}
  </dl>;
}
