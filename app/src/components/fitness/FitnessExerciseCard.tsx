/**
 * FitnessExerciseCard — exercise row card used in Active Workout.
 * States: pending | active (expandable with video) | completed.
 * Progress bar at bottom is driven by real data from props.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { VideoExercisePlayer } from './VideoExercisePlayer';

export type ExerciseCardState = 'pending' | 'active' | 'completed';

interface FitnessExerciseCardProps {
  name: string;
  durationLabel: string;
  state: ExerciseCardState;
  progressRatio?: number; // 0–1
  expanded?: boolean;
  onToggleExpand?: () => void;
  videoSrc?: string;
  videoPoster?: string;
  children?: React.ReactNode;
  className?: string;
}

export const FitnessExerciseCard: React.FC<FitnessExerciseCardProps> = ({
  name,
  durationLabel,
  state,
  progressRatio = 0,
  expanded = false,
  onToggleExpand,
  videoSrc,
  videoPoster,
  children,
  className,
}) => {
  const isCompleted = state === 'completed';
  const isActive = state === 'active';

  return (
    <div
      className={cn(
        'relative rounded-[22px] overflow-hidden transition-all duration-200',
        isCompleted
          ? 'bg-fitness-surface-muted opacity-70'
          : 'bg-fitness-surface shadow-fitness-card',
        className
      )}
    >
      {/* Main row */}
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        aria-label={`${name}, ${durationLabel}${isCompleted ? ', concluído' : ''}`}
        className="w-full flex items-center gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-inset"
      >
        {/* Status circle */}
        <div
          className={cn(
            'w-10 h-10 rounded-full shrink-0 flex items-center justify-center',
            isCompleted
              ? 'bg-fitness-green/20'
              : isActive
              ? 'bg-fitness-lavender/30'
              : 'bg-fitness-surface-muted'
          )}
          aria-hidden="true"
        >
          {isCompleted ? (
            <Check className="w-4 h-4 text-fitness-green" />
          ) : (
            <div
              className={cn(
                'w-4 h-4 rounded-full',
                isActive ? 'bg-fitness-primary' : 'bg-fitness-muted-dark'
              )}
            />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-[16px] font-semibold leading-tight truncate',
              isCompleted ? 'text-fitness-muted' : 'text-fitness-text'
            )}
          >
            {name}
          </p>
          <p className="text-[13px] text-fitness-muted mt-0.5">{durationLabel}</p>
        </div>

        {/* Chevron */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={cn(
            'shrink-0 text-fitness-muted transition-transform duration-200',
            expanded && 'rotate-180'
          )}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded: video player */}
      <AnimatePresence>
        {expanded && (isActive || isCompleted) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden px-4 pb-4"
          >
            <VideoExercisePlayer
              src={videoSrc}
              poster={videoPoster}
              title={name}
            />
            {children && <div className="mt-3 space-y-2">{children}</div>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar — bottom edge */}
      <div className="h-[5px] w-full bg-fitness-surface-muted">
        <div
          className="h-full bg-fitness-green rounded-full"
          style={{
            width: `${Math.round(Math.min(1, Math.max(0, progressRatio)) * 100)}%`,
            transition: 'width 0.4s ease',
          }}
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso de ${name}`}
        />
      </div>
    </div>
  );
};
