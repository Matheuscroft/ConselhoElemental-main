import { Check, Play, Undo2 } from 'lucide-react';

interface Props {
  name: string;
  completed: boolean;
  startLabel?: string;
  onStart: () => void;
  onComplete: () => void;
  onUndo: () => void;
}

/** Only dispatches an explicit action. Completion and timing stay in the page commands. */
export function CycleExecutionActions({ name, completed, startLabel = 'Iniciar', onStart, onComplete, onUndo }: Props) {
  return (
    <div className="cycle-execution-actions" data-completed={completed}>
      {completed ? (
        <span className="cycle-completed-label"><Check size={18} aria-hidden="true" />Concluído</span>
      ) : (
        <button type="button" className="cycle-start-action" aria-label={`${startLabel} ${name}`} onClick={event => { event.stopPropagation(); onStart(); }}>
          <Play size={17} aria-hidden="true" />{startLabel}
        </button>
      )}
      <button
        type="button"
        className={completed ? 'cycle-undo-action' : 'cycle-complete-action'}
        aria-label={`${completed ? 'Desfazer conclusão de' : 'Concluir'} ${name}`}
        onClick={event => { event.stopPropagation(); if (completed) onUndo(); else onComplete(); }}
      >
        {completed ? <Undo2 size={17} aria-hidden="true" /> : <Check size={18} aria-hidden="true" />}
        {completed ? 'Desfazer' : 'Concluir'}
      </button>
    </div>
  );
}
