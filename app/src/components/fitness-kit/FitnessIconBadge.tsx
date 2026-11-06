import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type BadgeSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<BadgeSize, { box: string; icon: string }> = {
  sm: { box: 'h-12 w-12', icon: 'h-7 w-7' },
  md: { box: 'h-14 w-14', icon: 'h-8 w-8' },
  lg: { box: 'h-[76px] w-[76px]', icon: 'h-10 w-10' },
};

interface FitnessIconBadgeProps {
  icon: LucideIcon;
  size?: BadgeSize;
  className?: string;
}

/** Selo de treino com traço dourado; decorativo quando acompanha um rótulo. */
export const FitnessIconBadge: React.FC<FitnessIconBadgeProps> = ({ icon: Icon, size = 'sm', className }) => (
  <span
    aria-hidden="true"
    className={cn(
      'fitness-elemental-badge grid shrink-0 place-items-center rounded-2xl text-[rgb(var(--el-gold))]',
      SIZE_CLASSES[size].box,
      className
    )}
  >
    <Icon className={SIZE_CLASSES[size].icon} strokeWidth={1.75} />
  </span>
);
