import React, { useRef, type CSSProperties } from 'react';
import { Plus } from 'lucide-react';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import type { MetricItem } from '@/lib/fitness-kit/adapters';
import { cn } from '@/lib/utils';
import { BodySilhouette } from './BodySilhouette';
import { FitnessButton } from './FitnessButton';
import { useChegadaSaude } from './saude-chegada';

interface BodyMetricsCardProps {
  metrics: MetricItem[];
  measuredAt?: string;
  onRecord?: () => void;
  /** Link para o histórico corporal completo. */
  onViewAll?: () => void;
  /** Medidas registradas além das quatro mostradas (ids), que também acendem a silhueta. */
  extraIds?: readonly string[];
  /** A única superfície de vidro real da aba; sem isto o cartão é uma placa sem desfoque. */
  glass?: boolean;
}

/** Silhueta com luz própria e pontos que acendem, uma lista de medidas reais e a ação principal da aba. */
export const BodyMetricsCard: React.FC<BodyMetricsCardProps> = ({ metrics, measuredAt, onRecord, onViewAll, extraIds = [], glass = false }) => {
  const ref = useRef<HTMLElement>(null);
  const arrived = useChegadaSaude(ref, 'corpo-silhueta');
  const lit = [...metrics.map((metric) => metric.id), ...extraIds];

  return (
    <section
      ref={ref}
      data-luz=""
      data-chegou={arrived}
      aria-label={FITNESS_COPY.yourBody}
      className={cn('saude-corpo saude-entra', glass ? 'saude-vidro ds-glass-float' : 'ds-pane')}
      style={{ '--ordem': 1 } as CSSProperties}
    >
      <div className="saude-corpo-cabeca">
        <div>
          <h2>{FITNESS_COPY.yourBody}</h2>
          {measuredAt && <p>Última avaliação: <time dateTime={measuredAt}>{new Date(measuredAt).toLocaleDateString('pt-BR')}</time></p>}
        </div>
        {onViewAll && <button type="button" onClick={onViewAll} className="saude-link">Detalhes</button>}
      </div>

      <div className="saude-corpo-palco">
        <BodySilhouette lit={lit} arrived={arrived} />
        {metrics.length === 0 ? (
          <div className="saude-corpo-convite">
            <p>Suas medidas aparecem aqui, cada uma acendendo um ponto do corpo, depois da primeira avaliação.</p>
          </div>
        ) : (
          <dl className="saude-medidas">
            {metrics.map((metric) => (
              <div key={metric.id} className="saude-medida">
                <dt>{metric.label}</dt>
                <dd>{metric.value}{metric.unit && <span>{metric.unit}</span>}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {onRecord && (
        <FitnessButton size="lg" className="saude-corpo-acao w-full" onClick={onRecord}>
          <Plus className="h-5 w-5" aria-hidden="true" />
          {metrics.length === 0 ? 'Registrar avaliação' : 'Registrar nova avaliação'}
        </FitnessButton>
      )}
    </section>
  );
};
