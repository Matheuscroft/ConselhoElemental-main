import { forwardRef, useEffect, useState, type ComponentType, type CSSProperties, type SVGProps } from 'react';
import { Plus } from 'lucide-react';
import { Contagem } from '@/components/motion/Contagem';
import { DURATION } from '@/lib/motion/motion';
import type { ElementoId } from '@/lib/design/palette';
import { CATEGORY_DESCRIPTIONS } from '@/lib/workout/workout-labels';
import type { WorkoutExerciseCategory } from '@/types/workout';
import { FitnessButton } from './FitnessButton';
import { elementoDaModalidade } from './treinos-elementos';
import './modalidade-uau.css';

const CAMINHO: Record<ElementoId, string> = {
  terra: 'Caminho da Terra',
  fogo: 'Caminho do Fogo',
  agua: 'Caminho da Água',
  ar: 'Caminho do Ar',
};

const DESCRICAO: Partial<Record<string, string>> = {
  running: 'Ritmo, fôlego e distância, um passo de cada vez.',
  cycling: 'Pedal, cadência e resistência sobre duas rodas.',
  swimming: 'Braçadas, respiração e fôlego dentro da água.',
  yoga: 'Posturas, respiração e mobilidade consciente.',
  martial_arts: 'Golpes, guardas e disciplina em movimento.',
  strength: 'Carga, controle e músculo, do peito às pernas.',
  calisthenics: 'Controle do corpo usando o próprio peso.',
};

/** The numbers rest at zero for a beat after the hero lands, then count up to the real ones. */
function useChegada(valor: number): number {
  const [chegou, setChegou] = useState(false);
  useEffect(() => {
    const fim = window.setTimeout(() => setChegou(true), DURATION.settle);
    return () => window.clearTimeout(fim);
  }, []);
  return chegou ? valor : 0;
}

interface ModalidadeHeroiProps {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  exercicios: number;
  treinos: number;
  onCriar: () => void;
}

/**
 * The head of a modality: its sigil in the colour of its element, what the path
 * is about, two living numbers and the one action that matters. Presentation
 * only: the element colours a rune and never touches what a workout is worth.
 */
export const ModalidadeHeroi = forwardRef<HTMLButtonElement, ModalidadeHeroiProps>(({ id, label, icon: Icon, exercicios, treinos, onCriar }, ref) => {
  const elemento = elementoDaModalidade(id);
  const descricao = DESCRICAO[id] ?? CATEGORY_DESCRIPTIONS[id as WorkoutExerciseCategory] ?? 'Exercícios, treinos e sequências.';
  const nExercicios = useChegada(exercicios);
  const nTreinos = useChegada(treinos);
  return <section aria-label={`Modalidade ${label}`} className="mo-heroi ds-pane" data-element={elemento} data-luz="" style={{ '--i': 0 } as CSSProperties}>
    <span className="mo-luz-brilho" aria-hidden="true" />
    <span className="mo-luz-borda" aria-hidden="true" />
    <div className="mo-heroi-topo">
      <span className="mo-heroi-sigilo" aria-hidden="true">
        <svg className="mo-heroi-anel" viewBox="0 0 100 100" focusable="false">
          <circle className="mo-heroi-trilho" cx="50" cy="50" r="47" />
          <circle className="mo-heroi-arco" cx="50" cy="50" r="47" pathLength="100" />
        </svg>
        <Icon className="mo-heroi-icone" strokeWidth={1.55} />
      </span>
      <div className="mo-heroi-texto">
        <p className="mo-heroi-caminho">{CAMINHO[elemento]}</p>
        <p className="mo-heroi-descricao">{descricao}</p>
      </div>
    </div>
    <dl className="mo-heroi-numeros">
      <div>
        <dt>{exercicios === 1 ? 'exercício' : 'exercícios'}</dt>
        <dd><Contagem valor={nExercicios} beat="settle" /></dd>
      </div>
      <div>
        <dt>{treinos === 1 ? 'treino seu' : 'treinos seus'}</dt>
        <dd><Contagem valor={nTreinos} beat="settle" /></dd>
      </div>
    </dl>
    <FitnessButton ref={ref} size="md" className="mo-heroi-acao w-full" onClick={onCriar}><Plus size={19} aria-hidden="true" />Montar treino</FitnessButton>
  </section>;
});
ModalidadeHeroi.displayName = 'ModalidadeHeroi';
