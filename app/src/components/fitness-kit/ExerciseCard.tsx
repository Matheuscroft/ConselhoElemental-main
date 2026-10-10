import React, { useId } from 'react';
import { Activity, Check, ChevronDown, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ExerciseCardState = 'pending' | 'active' | 'completed' | 'skipped';

interface ExerciseCardProps {
  title: string;
  subtitle: string;
  state: ExerciseCardState;
  /** Progresso REAL (0–100) calculado a partir das séries da sessão. */
  progress: number;
  expanded: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

/** Card do exercício na sessão ativa: círculo de status, título, chevron, barra de progresso colada na base. */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({ title, subtitle, state, progress, expanded, onToggle, children }) => {
  const panelId = useId();
  const completed = state === 'completed';
  const skipped = state === 'skipped';
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      data-state={state}
      className={cn(
        'relative overflow-hidden rounded-fit-sm shadow-fitness-card motion-safe:transition-colors motion-safe:duration-200',
        completed ? 'bg-fitness-canvas' : 'bg-fitness-surface'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="flex min-h-[92px] w-full items-center gap-4 px-5 pb-4 pt-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fitness-primary"
      >
        <span
          aria-hidden="true"
          className={cn(
            'grid h-11 w-11 shrink-0 place-items-center rounded-full',
            completed ? 'bg-fitness-surface-muted text-fitness-muted-dark' : 'bg-fitness-lavender text-fitness-primary'
          )}
        >
          {skipped && <SkipForward className="h-5 w-5" strokeWidth={2} />}
          {!completed && !skipped && <Activity className="h-5 w-5" />}
          {completed && <Check className="h-5 w-5" strokeWidth={2} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn('block break-words text-xl font-medium', completed ? 'text-fitness-muted' : 'text-fitness-text')}>{title}</span>
          <span className="block break-words text-base text-fitness-muted">{subtitle}</span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('h-7 w-7 shrink-0 text-fitness-text motion-safe:transition-transform motion-safe:duration-200', expanded && 'rotate-180', completed && 'text-fitness-muted')}
          strokeWidth={1.5}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`Detalhes: ${title}`}
        className={cn('grid motion-safe:transition-[grid-template-rows] motion-safe:duration-200', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
      >
        <div className="overflow-hidden">
          <div className={cn('space-y-3 px-4 pb-6', !expanded && 'invisible')}>{children}</div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1.5" aria-hidden="true">
        <div
          className={cn('h-full rounded-r-full motion-safe:transition-[width] motion-safe:duration-500', completed || skipped ? 'bg-fitness-muted-dark' : 'bg-fitness-green')}
          style={{ width: `${completed ? 100 : clamped}%` }}
        />
      </div>
    </div>
  );
};
