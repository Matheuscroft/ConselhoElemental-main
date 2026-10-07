import React from 'react';
import { FitnessCard } from './FitnessCard';
import { MetricRing, type RingMetric } from './MetricRing';

interface RingsOverviewProps {
  /** Do anel externo para o interno (máx. 3). */
  metrics: RingMetric[];
  ariaLabel: string;
}

const VIEWBOX = 200;
const CENTER = VIEWBOX / 2;
const STROKE = 11;
const GAP = 8;
const OUTER_RADIUS = 92;

/** Card com até 3 anéis concêntricos (≈45%) e legenda (≈55%). */
export const RingsOverview: React.FC<RingsOverviewProps> = ({ metrics, ariaLabel }) => {
  const rings = metrics.slice(0, 3);
  const summary = rings.map((ring) => `${ring.label}: ${ring.display}`).join('; ');

  return (
    <FitnessCard radius="lg" className="grid grid-cols-[minmax(0,45fr)_minmax(0,55fr)] items-center gap-4 p-5 sm:p-6">
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} role="img" aria-label={`${ariaLabel}. ${summary}`} className="h-auto w-full">
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
          />
        ))}
      </svg>

      <ul className="space-y-4">
        {rings.map((ring) => (
          <li key={ring.id} className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: ring.color }} />
            <div className="min-w-0">
              <p className="break-words text-lg font-medium leading-tight text-fitness-text">{ring.label}</p>
              <p className="text-sm text-fitness-muted">{ring.display}</p>
            </div>
          </li>
        ))}
      </ul>
    </FitnessCard>
  );
};
