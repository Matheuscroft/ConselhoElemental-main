import React, { useRef } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { cn } from '@/lib/utils';
import { MetricRing, type RingMetric } from './MetricRing';
import { useChegadaSaude } from './saude-chegada';

interface RingsOverviewProps {
  /** Do anel externo para o interno (máx. 3). */
  metrics: RingMetric[];
  ariaLabel: string;
  /**
   * `heroi`: a peça da tela, com a única superfície de vidro real da aba, o número no centro
   * e um brilho que percorre os anéis. `painel`: a versão discreta, sem vidro.
   */
  variant?: 'heroi' | 'painel';
  /** Número no centro do herói (ex.: treinos da semana contra a meta). */
  center?: { value: number; max: number };
  /** Identifica a chegada: cada tela desenha seus anéis uma vez por abertura do app. */
  arrivalKey?: string;
}

const VIEWBOX = 200;
const CENTER = VIEWBOX / 2;
const STROKE = 11;
const GAP = 8;
const OUTER_RADIUS = 92;
const formatNumber = (value: number) => String(Math.round(value));

/** Até 3 anéis concêntricos que se desenham na chegada, com a legenda ao lado. */
export const RingsOverview: React.FC<RingsOverviewProps> = ({ metrics, ariaLabel, variant = 'heroi', center, arrivalKey = 'aneis' }) => {
  const rings = metrics.slice(0, 3);
  const summary = rings.map((ring) => `${ring.label}: ${ring.display}`).join('; ');
  const ref = useRef<HTMLDivElement>(null);
  const arrived = useChegadaSaude(ref, arrivalKey);
  const hero = variant === 'heroi';

  return (
    <div
      ref={ref}
      data-luz=""
      data-chegou={arrived}
      className={cn('saude-aneis saude-entra', hero ? 'saude-vidro ds-glass-float saude-heroi' : 'ds-pane saude-aneis-painel')}
      style={{ '--ordem': 1 } as React.CSSProperties}
    >
      <div className="saude-aneis-palco">
        {hero && <span className="saude-varredura" aria-hidden="true" />}
        <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} role="img" aria-label={`${ariaLabel}. ${summary}`} focusable="false">
          {rings.map((ring, index) => (
            <MetricRing
              key={ring.id}
              value={ring.value}
              max={ring.max}
              radius={OUTER_RADIUS - index * (STROKE + GAP)}
              strokeWidth={STROKE}
              color={ring.color}
              trackColor={ring.trackColor}
              center={CENTER}
              order={index}
              arrived={arrived}
            />
          ))}
        </svg>
        {hero && center && (
          <span className="saude-aneis-centro" aria-hidden="true">
            <strong><Contagem valor={arrived ? center.value : 0} formatar={formatNumber} /></strong>
            <small>/{center.max}</small>
          </span>
        )}
      </div>

      <ul className="saude-legenda">
        {rings.map((ring) => (
          <li key={ring.id} style={{ '--cor': ring.color } as React.CSSProperties}>
            <span aria-hidden="true" className="saude-legenda-sigilo" />
            <div className="saude-legenda-texto">
              <p>{ring.label}</p>
              <strong>
                {ring.count
                  ? <Contagem valor={arrived ? ring.count.value : 0} formatar={ring.count.format} />
                  : ring.display}
              </strong>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
