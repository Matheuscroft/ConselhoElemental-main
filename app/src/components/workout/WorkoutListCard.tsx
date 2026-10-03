import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Gem, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatDuration,
  formatVolume,
  formatWorkoutDateTime,
} from '@/lib/workout';
import type { Workout, WorkoutRating, WorkoutSession } from '@/types/workout';

interface WorkoutListCardProps {
  workout: Workout;
  session?: WorkoutSession;
  rating?: WorkoutRating;
  onAction: () => void;
  className?: string;
}

export const WorkoutListCard: React.FC<WorkoutListCardProps> = ({ workout, session, rating, onAction, className }) => {
  const Icon = CATEGORY_ICONS[workout.category] ?? CATEGORY_ICONS.mixed;
  const dateLabel = formatWorkoutDateTime(
    workout.status === 'completed' ? session?.completedAt ?? workout.scheduledAt : workout.scheduledAt
  );

  return (
    <motion.button
      type="button"
      onClick={onAction}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      aria-label={`${workout.name}, ${STATUS_LABELS[workout.status]}`}
      className={cn(
        'w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left',
        'transition-colors hover:border-mystic-arcane/40 hover:bg-white/5',
        className
      )}
    >
      <div className="w-11 h-11 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-mystic-arcane" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-white truncate">{workout.name}</p>
          <Badge variant="outline" className={cn('text-[10px] shrink-0', STATUS_BADGE_CLASSES[workout.status])}>
            {STATUS_LABELS[workout.status]}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-white/50">
          <span>{CATEGORY_LABELS[workout.category]}</span>
          <span aria-hidden="true">·</span>
          <span>{dateLabel}</span>
          <span aria-hidden="true">·</span>
          <span>{formatDuration(workout.estimatedDurationMinutes)}</span>
          <span aria-hidden="true">·</span>
          <span>{workout.exercises.length} {workout.exercises.length === 1 ? 'exercício' : 'exercícios'}</span>
        </div>

        {(session || rating) && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
            {session && session.status === 'completed' && (
              <span className="flex items-center gap-1 text-mystic-gold font-mono">
                <Gem className="w-3 h-3" aria-hidden="true" />
                {Math.round(session.earthPoints)} Terra · {formatVolume(session.totalVolume)}
              </span>
            )}
            {rating && (
              <span className="flex items-center gap-1 text-white/60">
                <Star className="w-3 h-3 fill-mystic-gold text-mystic-gold" aria-hidden="true" />
                {rating.stars}/5
              </span>
            )}
          </div>
        )}
      </div>

      <ChevronRight className="w-4 h-4 text-white/30 shrink-0" aria-hidden="true" />
    </motion.button>
  );
};
