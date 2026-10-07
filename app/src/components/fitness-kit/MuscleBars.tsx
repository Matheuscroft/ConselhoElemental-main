import React from 'react';
import { MUSCLE_LABELS } from '@/lib/workout';
import type { MuscleContribution } from '@/types/workout';

interface MuscleBarsProps {
  distribution: MuscleContribution[];
  emptyMessage: string;
  maxItems?: number;
}

/** Barras horizontais finas (violeta sobre surface-muted) com a distribuição muscular real. */
export const MuscleBars: React.FC<MuscleBarsProps> = ({ distribution, emptyMessage, maxItems = 6 }) => {
  const sorted = [...distribution].sort((a, b) => b.percentage - a.percentage).slice(0, maxItems);
  if (sorted.length === 0) return <p className="py-2 text-sm text-fitness-muted">{emptyMessage}</p>;

  return (
    <ul className="space-y-4" aria-label="Distribuição muscular">
      {sorted.map((entry) => (
        <li key={entry.muscleId}>
          <div className="mb-1.5 flex items-center justify-between text-base">
            <span className="text-fitness-text-soft">{MUSCLE_LABELS[entry.muscleId]}</span>
            <span className="text-fitness-muted">{Math.round(entry.percentage)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-fitness-surface-muted">
            <div
              className="h-full rounded-full bg-fitness-primary motion-safe:transition-[width] motion-safe:duration-500"
              style={{ width: `${Math.min(100, entry.percentage)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};
