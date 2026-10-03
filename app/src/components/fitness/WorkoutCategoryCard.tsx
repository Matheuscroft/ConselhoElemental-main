/**
 * WorkoutCategoryCard — category selection card for "Select Workout" screen.
 * Selected state: thick violet border + glow.
 * Unselected: dark surface, icon centered.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface WorkoutCategoryCardProps {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
  onClick: () => void;
  /** Vary height for masonry-like visual rhythm */
  tall?: boolean;
}

export const WorkoutCategoryCard: React.FC<WorkoutCategoryCardProps> = ({
  icon: Icon,
  label,
  selected,
  onClick,
  tall,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={cn(
      'relative flex flex-col items-center justify-center gap-3 w-full rounded-[22px] p-5',
      'bg-fitness-surface transition-all duration-150',
      'hover:bg-fitness-surface-hover active:scale-[0.97]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
      tall ? 'h-44' : 'h-36',
      selected
        ? 'ring-[3px] ring-fitness-primary shadow-fitness-primary'
        : 'shadow-fitness-card'
    )}
  >
    <div className={cn(
      'w-12 h-12 rounded-full flex items-center justify-center',
      'bg-fitness-lavender/15',
    )}>
      <Icon
        className={cn(
          'w-6 h-6',
          selected ? 'text-fitness-primary' : 'text-fitness-primary'
        )}
        aria-hidden="true"
      />
    </div>
    <span
      className={cn(
        'text-[15px] font-medium leading-tight text-center',
        selected ? 'text-fitness-primary' : 'text-fitness-text'
      )}
    >
      {label}
    </span>
  </button>
);
