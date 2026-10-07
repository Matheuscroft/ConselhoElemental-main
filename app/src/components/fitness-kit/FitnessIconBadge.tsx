import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<BadgeSize, { box: string; icon: string }> = {
  sm: { box: 'h-11 w-11', icon: 'h-5 w-5' },
  md: { box: 'h-[52px] w-[52px]', icon: 'h-6 w-6' },
  lg: { box: 'h-[76px] w-[76px]', icon: 'h-9 w-9' },
};

interface FitnessIconBadgeProps {
  icon: LucideIcon;
  size?: BadgeSize;
  className?: string;
}

/** Círculo lavanda com ícone violeta (decorativo, `aria-hidden`). */
export const FitnessIconBadge: React.FC<FitnessIconBadgeProps> = ({ icon: Icon, size = 'sm', className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'grid shrink-0 place-items-center rounded-full bg-fitness-lavender text-fitness-primary',
      SIZE_CLASSES[size].box,
      className
    )}
  >
    <Icon className={SIZE_CLASSES[size].icon} strokeWidth={1.75} />
  </span>
);
