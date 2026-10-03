/**
 * ChartWidget — base wrapper for all Fitness charts.
 * Provides dark surface card, title, padding, empty state.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { FitnessCard } from './FitnessCard';

interface ChartWidgetProps {
  title?: string;
  titleRight?: React.ReactNode;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  titleRight,
  emptyMessage,
  isEmpty,
  children,
  className,
  contentClassName,
}) => (
  <FitnessCard className={cn('p-5', className)}>
    {(title || titleRight) && (
      <div className="flex items-start justify-between mb-3">
        {title && (
          <h3 className="text-[17px] font-semibold text-fitness-text">{title}</h3>
        )}
        {titleRight}
      </div>
    )}
    {isEmpty ? (
      <p className="text-sm text-fitness-muted py-6 text-center">
        {emptyMessage ?? 'Dados indisponíveis.'}
      </p>
    ) : (
      <div className={contentClassName}>{children}</div>
    )}
  </FitnessCard>
);
