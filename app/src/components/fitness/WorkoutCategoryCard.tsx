/**
 * WorkoutCategoryCard — category selection card for "Select Workout" screen.
 * Selected state: elemental gold border.
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
      'hover:bg-fitness-surface-hover motion-safe:active:scale-[0.97] motion-reduce:transition-none',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
      tall ? 'h-44' : 'h-36',
      selected
        ? 'ring-1 ring-[rgb(var(--el-gold)/0.6)]'
        : 'shadow-fitness-card'
    )}
  >
    <div className={cn(
      'w-14 h-14 rounded-2xl border border-[rgb(var(--el-gold)/0.25)] flex items-center justify-center',
      'bg-[rgb(var(--el-gold)/0.06)]',
    )}>
      <Icon
        className={cn(
          'w-8 h-8',
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
