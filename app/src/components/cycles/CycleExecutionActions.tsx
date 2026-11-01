import { Play } from 'lucide-react';

interface Props {
  name: string;
  completed: boolean;
  startLabel?: string;
  onStart: () => void;
}

/** Only dispatches an explicit action. Completion and timing stay in the page commands. */
export function CycleExecutionActions({ name, completed, startLabel = 'Iniciar', onStart }: Props) {
  return (
    <div className="cycle-execution-actions" data-completed={completed}>
      {!completed && (
        <button type="button" className="cycle-start-action" aria-label={`${startLabel} ${name}`} onClick={event => { event.stopPropagation(); onStart(); }}>
          <Play size={17} aria-hidden="true" />{startLabel}
        </button>
      )}
    </div>
  );
}
