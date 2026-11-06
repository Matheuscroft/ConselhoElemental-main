/**
 * FitnessCard — base dark surface card for all Fitness UI Kit pages.
 * Solid, deep-blue-grey, large border-radius, optional glow/border variants.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show an elemental gold border (for selected state) */
  selected?: boolean;
  /** Lift shadow variant */
  elevated?: boolean;
  /** Use surface-alt background (slightly lighter) */
  alt?: boolean;
}

export const FitnessCard = React.forwardRef<HTMLDivElement, FitnessCardProps>(
  ({ className, selected, elevated, alt, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-[22px] border border-[rgb(var(--el-muted)/0.19)] p-5',
        alt ? 'bg-fitness-surface-alt' : 'bg-fitness-surface',
        elevated ? 'shadow-fitness-elevated' : 'shadow-fitness-card',
        selected && 'ring-1 ring-[rgb(var(--el-gold)/0.6)]',
        'motion-safe:transition-colors motion-safe:duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
FitnessCard.displayName = 'FitnessCard';
