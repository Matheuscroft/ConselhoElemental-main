import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { FitnessCard } from './FitnessCard';
import { FitnessIconBadge } from './FitnessIconBadge';

interface WorkoutHistoryCardProps {
  name: string;
  dateLabel: string;
  metricValue: string;
  metricUnit?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

/** Item do histórico: badge à esquerda, texto central com quebra, data à direita. Layout em linha em todos os tamanhos. */
export const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({ name, dateLabel, metricValue, metricUnit, icon, onClick }) => {
  const body = (
    <FitnessCard radius="md" interactive={Boolean(onClick)} className="flex items-center gap-3 px-4 py-4 min-w-0">
      <FitnessIconBadge icon={icon} size="md" className="shrink-0" />
      <div className="min-w-0 flex-1 text-left pr-3">
        <p className="text-sm text-fitness-text-soft break-words">{name}</p>
        <p className="text-lg font-medium leading-tight text-fitness-primary break-words mt-0.5">
          {metricValue}
          {metricUnit && <span className="ml-0.5">{metricUnit}</span>}
        </p>
      </div>
      <p className="shrink-0 text-sm text-fitness-text whitespace-nowrap max-w-[35%] truncate">{dateLabel}</p>
    </FitnessCard>
  );

  if (!onClick) return body;
  return (
    <button type="button" onClick={onClick} className="block w-full rounded-fit outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">
      {body}
    </button>
  );
};
