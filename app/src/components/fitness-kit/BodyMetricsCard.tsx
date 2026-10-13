import React from 'react';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import type { MetricItem } from '@/lib/fitness-kit/adapters';
import { BodySilhouette } from './BodySilhouette';
import { FitnessButton } from './FitnessButton';
import { FitnessCard } from './FitnessCard';

interface BodyMetricsCardProps {
  metrics: MetricItem[];
  measuredAt?: string;
  onRecord?: () => void;
  /** Link para o histórico corporal completo. */
  onViewAll?: () => void;
}

/** Silhueta (~35%) + grade 2 × 2 de medidas reais (~65%). */
export const BodyMetricsCard: React.FC<BodyMetricsCardProps> = ({ metrics, measuredAt, onRecord, onViewAll }) => (
  <FitnessCard radius="lg" className="p-5 sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <h2 className="font-sans text-xl font-semibold leading-tight text-fitness-text">{FITNESS_COPY.yourBody}</h2>
      {onViewAll && (
        <button
          type="button"
          onClick={onViewAll}
          className="-mr-2 min-h-11 shrink-0 rounded-full px-2 text-base font-medium text-fitness-primary outline-none transition-colors hover:text-fitness-primary-hover focus-visible:ring-2 focus-visible:ring-fitness-primary"
        >
          Detalhes
        </button>
      )}
    </div>
    {measuredAt && <p className="mt-1 text-xs text-fitness-muted">Última avaliação: <time dateTime={measuredAt}>{new Date(measuredAt).toLocaleDateString('pt-BR')}</time></p>}
    <div className="mt-5 grid grid-cols-[minmax(0,36fr)_minmax(0,64fr)] items-center gap-3">
      <BodySilhouette className="mx-auto h-44 w-full max-w-28 sm:h-48" />
      {metrics.length === 0 ? (
        <div className="min-w-0">
          <p className="text-base leading-relaxed text-fitness-muted">Suas medidas aparecem aqui após a primeira avaliação.</p>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-x-2 gap-y-5">
          {metrics.map((metric) => (
            <div key={metric.id} className="min-w-0">
              <dd className="break-words text-lg sm:text-xl font-medium text-fitness-text">
                {metric.value}
                {metric.unit && <span className="ml-1 text-xs sm:text-sm">{metric.unit}</span>}
              </dd>
              <dt className="break-words text-xs sm:text-sm text-fitness-muted">{metric.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </div>
    {metrics.length === 0 && onRecord && (
      <FitnessButton size="md" className="mt-4 w-full" onClick={onRecord}>Registrar avaliação</FitnessButton>
    )}
    {metrics.length > 0 && onRecord && (
      <FitnessButton size="md" variant="secondary" className="mt-4 w-full" onClick={onRecord}>Registrar nova avaliação</FitnessButton>
    )}
  </FitnessCard>
);
