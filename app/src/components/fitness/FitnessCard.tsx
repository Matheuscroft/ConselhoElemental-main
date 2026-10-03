/**
 * FitnessCard — base dark surface card for all Fitness UI Kit pages.
 * Solid, deep-blue-grey, large border-radius, optional glow/border variants.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Show a violet border + glow (for selected state) */
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
        'rounded-[24px] p-5',
        alt ? 'bg-fitness-surface-alt' : 'bg-fitness-surface',
        elevated ? 'shadow-fitness-elevated' : 'shadow-fitness-card',
        selected && 'ring-[3px] ring-fitness-primary shadow-fitness-primary',
        'transition-all duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
FitnessCard.displayName = 'FitnessCard';
