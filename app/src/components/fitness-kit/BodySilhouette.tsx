import React, { type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * Where each measurement is read on the mannequin, in percent of the figure.
 * Decorative: a light on the body for each measurement that exists, never a
 * simulation of the person's body or of the values.
 */
const POINTS: ReadonlyArray<{ id: string; x: number; y: number }> = [
  { id: 'heightCm', x: 50, y: 5 },
  { id: 'waterPercent', x: 50, y: 16 },
  { id: 'chestCm', x: 41, y: 25 },
  { id: 'weightKg', x: 50, y: 31 },
  { id: 'muscleMassKg', x: 27, y: 33 },
  { id: 'armCm', x: 73, y: 33 },
  { id: 'bodyFatPercent', x: 50, y: 39 },
  { id: 'waistCm', x: 62, y: 40 },
  { id: 'thighCm', x: 40, y: 57 },
];

interface BodySilhouetteProps {
  className?: string;
  /** Ids of the measurements that were recorded: their points light up. */
  lit?: readonly string[];
  /** False keeps the points unlit; the card turns it on when the figure arrives. */
  arrived?: boolean;
}

/** Manequim do kit Fitness, com a luz da semana atrás e um ponto aceso por medida registrada. */
export const BodySilhouette: React.FC<BodySilhouetteProps> = ({ className, lit = [], arrived = true }) => {
  const invitation = lit.length === 0;
  return (
    <div className={cn('saude-silhueta', className)} data-chegou={arrived} data-convite={invitation || undefined} aria-hidden="true">
      <span className="saude-silhueta-luz" />
      <img
        data-body-figure
        src="/fitness/body/mannequin-front-v1.png"
        width={912}
        height={1724}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      {POINTS.filter((point) => invitation ? ['heightCm', 'chestCm', 'weightKg', 'waistCm'].includes(point.id) : lit.includes(point.id)).map((point, index) => (
        <i key={point.id} className="saude-ponto" style={{ insetInlineStart: `${point.x}%`, insetBlockStart: `${point.y}%`, '--ordem': index } as CSSProperties} />
      ))}
    </div>
  );
};
