import './elemental-timer.css';
import { useState } from 'react';
import { ELEMENTS } from '@/constants';
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
  const [pulse, setPulse] = useState(0);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  return <div className="elemental-timer" style={{ '--timer-accent': `var(--element-${element})` } as CSSProperties}>
    <p className="elemental-timer-status">{running ? 'Em concentração' : 'Tempo pausado'}</p>
    <h3>{title}</h3>
    <div className="elemental-timer-dial" data-running={running} data-element={element} data-effects={effectsEnabled}>
      <TimerElementScene element={element} />
      {pulse > 0 && <span key={pulse} className="timer-element-touch" aria-hidden="true" />}
      <button type="button" className="timer-element-focus" aria-label={`Sentir a energia de ${ELEMENTS[element].name}`} onClick={() => setPulse(pulse + 1)}>
        <img src={`/sanctuary/elements/${element}-v1.webp`} alt="" className="timer-scene-art" width={112} height={112} />
      </button>
      <span className="elemental-timer-time" role="timer" aria-label={`Tempo decorrido: ${time}`}>{time}</span>
      <span className="elemental-timer-caption">Tempo decorrido</span>
    </div>
    <button type="button" className="timer-effects-toggle" onClick={() => setEffectsEnabled(!effectsEnabled)}>{effectsEnabled ? 'Pausar efeitos' : 'Ativar efeitos'}</button>
    <div className="elemental-timer-meta">{plannedLabel && <span>Planejado: {plannedLabel}</span>}{effortLabel && <span>Esforço: {effortLabel}</span>}</div>
    <TimerControls running={running} onToggle={onToggle} onComplete={onComplete} />
    <p className="elemental-timer-note">Pode bloquear a tela ou usar outro app. O tempo é atualizado quando você voltar. Pausar interrompe a contagem.</p>
  </div>;
}

/** Controls dispatch to their existing domain owners; visual effects own no rewards. */
export function TimerControls({ running, onToggle, onComplete }: Pick<ElementalTimerProps, 'running' | 'onToggle' | 'onComplete'>) {
  return (
    <div className="elemental-timer-controls">
      <button type="button" onClick={onToggle}>{running ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{running ? 'Pausar' : 'Retomar'}</button>
      <button type="button" className="elemental-timer-complete" onClick={onComplete}><Check size={18} aria-hidden="true" />Concluir</button>
    </div>
  );
}

/** Material-specific scenery; decorative only, with no time or scoring state. */
export function TimerElementScene({ element }: { element: ElementId }) {
  return <div className="timer-scene" aria-hidden="true" data-material={element}>
    <span className="timer-scene-light" />
    <svg className="timer-scene-svg" viewBox="0 0 280 280" fill="none" focusable="false">
      {element === 'terra' && <>
        <ellipse cx="140" cy="143" rx="43" ry="8" className="timer-earth-shadow" />
        <g className="timer-scene-flow timer-earth-contours" stroke="currentColor" strokeWidth=".8">
          <path d="M28 138C34 114 58 107 83 111C107 115 106 98 136 98C163 98 168 113 195 109C218 105 245 120 251 141C258 163 236 175 206 175C174 175 174 188 144 184C114 180 97 187 74 178C49 169 21 162 28 138Z" />
          <path d="M49 139C57 122 74 124 96 126C115 128 117 112 139 113C159 114 169 127 190 123C211 120 228 130 230 145C232 159 209 162 188 162C167 161 161 174 141 169C120 165 100 175 82 163C69 153 42 156 49 139Z" />
          <path d="M73 140C84 129 100 141 117 132C134 121 150 126 162 135C178 146 202 129 208 145C211 155 187 151 174 154C158 160 148 162 135 157C117 153 112 163 98 153C89 147 65 151 73 140Z" />
        </g>
      </>}
      {element === 'agua' && <g className="timer-water-pool" stroke="currentColor" strokeWidth="1">
        <ellipse className="timer-scene-flow" cx="140" cy="145" rx="72" ry="20" />
        <ellipse className="timer-scene-flow" cx="140" cy="145" rx="72" ry="20" />
        <ellipse className="timer-scene-flow" cx="140" cy="145" rx="72" ry="20" />
      </g>}
      {element === 'ar' && <g stroke="currentColor" strokeLinecap="round">
        <g className="timer-scene-flow timer-air-current"><path d="M45 117C28 72 92 27 162 44C222 58 247 116 218 144" strokeWidth="1.2" /></g>
        <g className="timer-scene-flow timer-air-current"><path d="M67 144C28 115 58 48 123 40C185 32 235 70 239 115" strokeWidth=".7" /></g>
        <g className="timer-scene-flow timer-air-current"><path d="M52 81C82 32 170 38 207 74C228 96 220 129 195 145" strokeWidth=".8" /></g>
      </g>}
      {element === 'fogo' && <g stroke="currentColor" strokeLinecap="round">
        <g className="timer-scene-flow timer-fire-heat" strokeWidth="1"><path d="M87 132C75 117 82 106 78 94C74 82 79 73 88 62" /><path d="M198 128C210 111 198 100 204 88C209 78 204 68 198 62" /></g>
        <circle className="timer-fire-spark" cx="105" cy="62" r="1.4" fill="currentColor" stroke="none" />
        <circle className="timer-fire-spark" cx="178" cy="79" r="1" fill="currentColor" stroke="none" />
      </g>}
    </svg>
  </div>;
}
