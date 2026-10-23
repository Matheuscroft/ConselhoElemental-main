import { ElementIcon } from './ArcaneIcon';
import { Check, Pause, Play } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { ElementId } from '@/types';

interface ElementalTimerProps {
  title: string;
  element: ElementId;
  time: string;
  running: boolean;
  plannedLabel?: string;
  effortLabel?: string;
  onToggle: () => void;
  onComplete: () => void;
}

/** Presentation only: time, completion and reward stay with the existing owner. */
export function ElementalTimer({ title, element, time, running, plannedLabel, effortLabel, onToggle, onComplete }: ElementalTimerProps) {
  return <div className="elemental-timer" style={{ '--timer-accent': `var(--element-${element})` } as CSSProperties}>
    <p className="elemental-timer-status">{running ? 'Em concentração' : 'Tempo pausado'}</p>
    <h3>{title}</h3>
    <div className="elemental-timer-dial" data-running={running}>
      <span className="elemental-timer-orbit" aria-hidden="true" />
      <span className="elemental-timer-symbol" aria-hidden="true"><ElementIcon element={element} size={28} /></span>
      <span className="elemental-timer-time" role="timer" aria-label={`Tempo decorrido: ${time}`}>{time}</span>
      <span className="elemental-timer-caption">Tempo dedicado</span>
    </div>
    <div className="elemental-timer-meta">{plannedLabel && <span>Planejado: {plannedLabel}</span>}{effortLabel && <span>Esforço: {effortLabel}</span>}</div>
    <div className="elemental-timer-controls">
      <button type="button" onClick={onToggle}>{running ? <Pause size={18} /> : <Play size={18} />}{running ? 'Pausar' : 'Retomar'}</button>
      <button type="button" className="elemental-timer-complete" onClick={onComplete}><Check size={18} />Concluir</button>
    </div>
    <p className="elemental-timer-note">Conclua quando terminar sua atividade.</p>
  </div>;
}
