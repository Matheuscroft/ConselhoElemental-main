/**
 * FitnessIconBadge — circular lavender badge with a violet icon inside.
 * Used in exercise cards, workout history cards, and summary headers.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface FitnessIconBadgeProps {
  icon: LucideIcon;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconClassName?: string;
  'aria-label'?: string;
}

const sizeMap = {
  sm: { outer: 'w-10 h-10', icon: 'w-4 h-4' },
  md: { outer: 'w-12 h-12', icon: 'w-5 h-5' },
  lg: { outer: 'w-14 h-14', icon: 'w-6 h-6' },
};

export const FitnessIconBadge: React.FC<FitnessIconBadgeProps> = ({
  icon: Icon,
  size = 'md',
  className,
  iconClassName,
  'aria-label': ariaLabel,
}) => {
  const { outer, icon } = sizeMap[size];
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center shrink-0',
        'bg-fitness-lavender/20',
        outer,
        className
      )}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      <Icon className={cn('text-fitness-primary', icon, iconClassName)} />
    </div>
  );
};
