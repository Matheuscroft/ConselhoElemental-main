import React from 'react';
import { cn } from '@/lib/utils';

interface SummaryMetricProps {
  label: string;
  value: string;
  unit?: string;
}

/** Métrica direto sobre o canvas: rótulo violeta, número branco, unidade menor em caixa-alta. */
export const SummaryMetric: React.FC<SummaryMetricProps> = ({ label, value, unit }) => (
  <div className="min-w-0">
    <dt className="text-lg text-fitness-primary">{label}</dt>
    <dd className="mt-1 truncate text-[34px] font-medium leading-tight text-fitness-text">
      {value}
      {unit && <span className="ml-0.5 text-lg font-medium uppercase">{unit}</span>}
    </dd>
  </div>
);

interface WorkoutStatsGridProps {
  metrics: Array<SummaryMetricProps & { id: string }>;
  className?: string;
}

/** Grade 2 × 2 (ou mais linhas) de métricas reais disponíveis. */
export const WorkoutStatsGrid: React.FC<WorkoutStatsGridProps> = ({ metrics, className }) => (
  <dl className={cn('grid grid-cols-2 gap-x-6 gap-y-9', className)}>
    {metrics.map(({ id, ...metric }) => (
      <SummaryMetric key={id} {...metric} />
    ))}
  </dl>
);
