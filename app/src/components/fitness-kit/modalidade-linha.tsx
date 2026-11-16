import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { LEVEL_LABELS } from '@/lib/workout/workout-labels';
import type { WorkoutExerciseLevel } from '@/types/workout';
import './modalidade-uau.css';

interface ModalidadeLinhaProps {
  icon: LucideIcon;
  title: string;
  /** Main muscle and equipment, already composed by the catalogue. */
  subtitle?: string;
  nivel?: WorkoutExerciseLevel;
  ariaLabel?: string;
  onClick: () => void;
  /** Place in the cascade; kept short so a long list never makes anyone wait. */
  index?: number;
}

/**
 * An exercise as a light rune: sigil, name, main muscle and the level in a seal.
 * The light of the finger crosses it like every other rune of the module. The
 * element comes from the catalogue around it (`data-element` on an ancestor).
 */
export function ModalidadeLinha({ icon: Icon, title, subtitle, nivel, ariaLabel, onClick, index = 0 }: ModalidadeLinhaProps) {
  return <button type="button" onClick={onClick} aria-label={ariaLabel} data-luz="" style={{ '--i': Math.min(index, 8) } as CSSProperties} className="mo-linha ds-pane">
    <span className="mo-luz-brilho" aria-hidden="true" />
    <span className="mo-luz-borda" aria-hidden="true" />
    <span className="mo-linha-icone" aria-hidden="true"><Icon size={26} strokeWidth={1.6} /></span>
    <span className="mo-linha-texto">
      <span title={title} className="mo-linha-nome">{title}</span>
      {(nivel || subtitle) && <span className="mo-linha-meta">
        {nivel && LEVEL_LABELS[nivel] && <span className="mo-selo" data-nivel={nivel}>{LEVEL_LABELS[nivel]}</span>}
        {subtitle && <span title={subtitle} className="mo-linha-sub">{subtitle}</span>}
      </span>}
    </span>
    <ChevronRight className="mo-linha-seta" size={18} aria-hidden="true" />
  </button>;
}
