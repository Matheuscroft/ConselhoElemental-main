/**
 * WorkoutHistoryCard — card for the Workout History list.
 * Shows icon badge, name, metric (violet, large), and date label.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { FitnessIconBadge } from './FitnessIconBadge';
import { Dumbbell } from 'lucide-react';

interface WorkoutHistoryCardProps {
  name: string;
  dateLabel: string;
  metricValue?: string | number;
  metricUnit?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({
  name,
  dateLabel,
  metricValue,
  metricUnit,
  icon = Dumbbell,
  onClick,
  className,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-4 rounded-[22px] bg-fitness-surface px-5 py-4',
      'shadow-fitness-card transition-all duration-150',
      'hover:bg-fitness-surface-hover active:scale-[0.98]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
      className
    )}
  >
    <FitnessIconBadge icon={icon} size="lg" aria-label={name} />

    <div className="flex-1 min-w-0 text-left">
      <p className="text-[16px] font-semibold text-fitness-text truncate">{name}</p>
      {metricValue !== undefined && (
        <p className="text-[15px] font-semibold text-fitness-primary mt-0.5">
          {metricValue}
          {metricUnit && (
            <span className="text-[12px] font-normal text-fitness-muted ml-0.5">
              {metricUnit}
            </span>
          )}
        </p>
      )}
    </div>

    <span className="text-[13px] text-fitness-text shrink-0">{dateLabel}</span>
  </button>
);

// ─── SummaryMetric ─────────────────────────────────────────────────────────────

interface SummaryMetricProps {
  label: string;
  value: string | number;
  unit?: string;
  className?: string;
}

/**
 * SummaryMetric — displayed directly on canvas (no card wrapper).
 * Label in violet, value in large white, unit smaller.
 */
export const SummaryMetric: React.FC<SummaryMetricProps> = ({
  label,
  value,
  unit,
  className,
}) => (
  <div className={cn('flex flex-col gap-0.5', className)}>
    <span className="text-[13px] font-medium text-fitness-primary">{label}</span>
    <p className="text-[28px] font-semibold text-fitness-text leading-tight">
      {value}
      {unit && (
        <span className="text-[16px] font-medium text-fitness-muted ml-1">{unit}</span>
      )}
    </p>
  </div>
);
