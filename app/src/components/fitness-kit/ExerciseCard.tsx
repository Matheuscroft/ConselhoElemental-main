import React, { useId } from 'react';
import { Activity, Check, ChevronDown, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RevealPanel } from '@/components/motion/RevealPanel';
import './treino-uau.css';

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

/** Card do exercício na sessão ativa: o exercício da vez é o protagonista (luz do elemento, título grande, "Agora"). */
export const ExerciseCard: React.FC<ExerciseCardProps> = ({ title, subtitle, state, progress, expanded, onToggle, children }) => {
  const panelId = useId();
  const completed = state === 'completed';
  const skipped = state === 'skipped';
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div
      data-state={state}
      className={cn(
        'treino-exercicio fitness-elemental-card relative overflow-hidden rounded-fit-sm motion-safe:transition-colors motion-safe:duration-200',
        completed ? 'bg-fitness-canvas' : 'bg-fitness-surface'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="treino-exercicio-cabeca"
      >
        <span aria-hidden="true" className="treino-exercicio-selo">
          {skipped && <SkipForward className="h-6 w-6" strokeWidth={2} />}
          {!completed && !skipped && <Activity className="h-6 w-6" />}
          {completed && <Check className="h-6 w-6" strokeWidth={2.5} />}
        </span>
        <span className="treino-exercicio-texto">
          {state === 'active' && <span className="treino-exercicio-agora">Agora</span>}
          <span className="treino-exercicio-titulo">{title}</span>
          <span className="treino-exercicio-sub">{subtitle}</span>
        </span>
        <ChevronDown aria-hidden="true" className="treino-exercicio-seta" data-aberto={expanded} strokeWidth={1.75} />
      </button>

      <RevealPanel id={panelId} open={expanded}>
        <div role="region" aria-label={`Detalhes: ${title}`} className="treino-exercicio-corpo">{children}</div>
      </RevealPanel>

      <div className="treino-exercicio-barra" aria-hidden="true">
        <div
          className="fitness-motion-bar"
          style={{ transform: `scaleX(${(completed ? 100 : clamped) / 100})` }}
        />
      </div>
    </div>
  );
};
