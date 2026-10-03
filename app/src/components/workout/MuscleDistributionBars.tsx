import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MUSCLE_LABELS } from '@/lib/workout';
import type { MuscleContribution } from '@/types/workout';

interface MuscleDistributionBarsProps {
  distribution: MuscleContribution[];
  emptyMessage?: string;
  maxItems?: number;
}

export const MuscleDistributionBars: React.FC<MuscleDistributionBarsProps> = ({
  distribution,
  emptyMessage = 'Conclua séries para revelar a distribuição muscular desta sessão.',
  maxItems,
}) => {
  const sorted = useMemo(() => {
    const ordered = [...distribution].sort((a, b) => b.percentage - a.percentage);
    return typeof maxItems === 'number' ? ordered.slice(0, maxItems) : ordered;
  }, [distribution, maxItems]);

  if (sorted.length === 0) {
    return <p className="text-xs text-white/50">{emptyMessage}</p>;
  }

  return (
    <div className="space-y-2.5" role="list" aria-label="Distribuição muscular">
      {sorted.map((entry, index) => (
        <div key={entry.muscleId} role="listitem">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className={index === 0 ? 'text-mystic-gold font-medium' : 'text-white/70'}>
              {MUSCLE_LABELS[entry.muscleId]}
            </span>
            <span className={`font-mono ${index === 0 ? 'text-mystic-gold' : 'text-white/50'}`}>
              {entry.percentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, entry.percentage)}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                index === 0
                  ? 'bg-gradient-to-r from-mystic-gold/70 to-mystic-gold'
                  : 'bg-gradient-to-r from-mystic-arcane/50 to-mystic-arcane/80'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
