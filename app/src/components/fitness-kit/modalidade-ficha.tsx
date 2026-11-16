import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { MUSCLE_TARGETS } from '@/constants/muscle-regions';
import type { MuscleGroupId, WorkoutExerciseCategory } from '@/types/workout';
import { FitnessGlyph } from './FitnessGlyph';
import { elementoDaModalidade } from './treinos-elementos';
import './modalidade-uau.css';

/** The element a sheet is painted in; presentation only, it never touches what an exercise is worth. */
export const elementoDaFicha = elementoDaModalidade;

const FOCO_MUSCULAR = new Set<string>(['strength', 'hypertrophy', 'calisthenics']);

/**
 * The sigil in the head of the sheet. Where the exercise is about a muscle the
 * body is drawn with that region lit; a sport or a posture keeps its own mark.
 */
export function FichaSigilo({ icon: Icon, category, muscle }: { icon: LucideIcon; category: WorkoutExerciseCategory | string; muscle?: MuscleGroupId }) {
  const alvo = muscle && FOCO_MUSCULAR.has(category) ? MUSCLE_TARGETS.find((target) => target.id === muscle) : undefined;
  return <span className="mo-ficha-sigilo" aria-hidden="true">
    <svg className="mo-ficha-anel" viewBox="0 0 100 100" focusable="false">
      <circle className="mo-ficha-trilho" cx="50" cy="50" r="47" />
      <circle className="mo-ficha-arco" cx="50" cy="50" r="47" pathLength="100" />
    </svg>
    {alvo ? <FitnessGlyph name={alvo.icon} size={44} /> : <Icon size={34} strokeWidth={1.55} />}
  </span>;
}

/**
 * The execution as numbered steps with a thread of progress. The marks are a
 * reading aid for this opening of the sheet only: nothing is saved, nothing is scored.
 */
export function FichaPassos({ titulo, icone, passos }: { titulo: string; icone: ReactNode; passos: string[] }) {
  const [lidos, setLidos] = useState(0);
  const total = passos.length;
  return <section className="fitness-exercise-instructions mo-passos" data-completo={lidos === total ? '' : undefined}>
    <div className="mo-passos-cab">
      <h3>{icone}{titulo}</h3>
      <span className="mo-passos-contagem" aria-live="polite">{lidos} de {total}</span>
    </div>
    <div className="mo-passos-barra" role="progressbar" aria-label="Passos lidos" aria-valuemin={0} aria-valuemax={total} aria-valuenow={lidos}>
      <span style={{ transform: `scaleX(${total ? lidos / total : 0})` }} />
    </div>
    <ol>
      {passos.map((passo, indice) => {
        const feito = indice < lidos;
        return <li key={`${indice}-${passo}`} data-estado={feito ? 'feito' : indice === lidos ? 'atual' : 'espera'}>
          <button type="button" aria-pressed={feito} onClick={() => setLidos(indice + 1 === lidos ? indice : indice + 1)}>
            <span className="mo-passo-num" aria-hidden="true">{feito ? <Check size={15} strokeWidth={2.6} /> : indice + 1}</span>
            <span className="mo-passo-texto">{passo}</span>
          </button>
        </li>;
      })}
    </ol>
    <p className="mo-passos-dica">Toque num passo para marcá-lo como lido.</p>
  </section>;
}
