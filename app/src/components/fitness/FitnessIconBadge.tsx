/**
 * FitnessIconBadge — elemental gold badge with an anatomical or activity icon inside.
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
  sm: { outer: 'w-12 h-12', icon: 'w-7 h-7' },
  md: { outer: 'w-14 h-14', icon: 'w-8 h-8' },
  lg: { outer: 'w-16 h-16', icon: 'w-10 h-10' },
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
        'rounded-2xl border border-[rgb(var(--el-gold)/0.25)] flex items-center justify-center shrink-0',
        'bg-[rgb(var(--el-gold)/0.06)]',
        outer,
        className
      )}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <Icon className={cn('text-fitness-primary', icon, iconClassName)} />
    </div>
  );
};
