import React, { type CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import type { ElementoId } from '@/lib/design/palette';
import { elementoDaModalidade } from './treinos-elementos';

interface WorkoutCategoryCardProps {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  selected: boolean;
  description?: string;
  /** Mantida por compatibilidade: a grade agora é uniforme e a altura não varia mais. */
  tall?: boolean;
  /** Elemento que pinta a runa (sigilo, fio de luz e brilho). Sem ele, o do esforço: Fogo. */
  element?: ElementoId;
  /** Posição na cascata de entrada. */
  index?: number;
  onSelect: () => void;
}

/** Modalidade como runa: o sigilo e a cor do elemento, com a luz que segue o dedo e a mola ao tocar. */
export const WorkoutCategoryCard: React.FC<WorkoutCategoryCardProps> = ({ label, icon: Icon, selected, description, element = 'fogo', index = 0, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    data-element={element}
    data-luz=""
    style={{ '--i': index } as CSSProperties}
    className={cn(
      'ds-runa fitness-elemental-category tr-runa text-center outline-none',
      'focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas',
    )}
  >
    <span className="tr-runa-brilho" aria-hidden="true" />
    <span className="tr-runa-borda" aria-hidden="true" />
    <span className="tr-sigilo" aria-hidden="true"><Icon className="h-8 w-8" strokeWidth={1.55} /></span>
    <span className="tr-runa-nome">{label}</span>
    {description && <span className="tr-runa-descricao">{description}</span>}
  </button>
);

export interface CategoryOption {
  id: string;
  description?: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Elemento que pinta a runa; por padrão vem da modalidade. */
  element?: ElementoId;
}

interface FitnessCategoryGridProps {
  options: CategoryOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
}

/** Grade uniforme de duas colunas: todas as runas com a mesma altura, entrando em cascata. */
export const FitnessCategoryGrid: React.FC<FitnessCategoryGridProps> = ({ options, selectedId, onSelect, ariaLabel }) => (
  <div role="group" aria-label={ariaLabel} className="tr-grade">
    {options.map((option, index) => (
      <WorkoutCategoryCard
        key={option.id}
        label={option.label}
        description={option.description}
        icon={option.icon}
        element={option.element ?? elementoDaModalidade(option.id)}
        index={index}
        selected={selectedId === option.id}
        onSelect={() => onSelect(option.id)}
      />
    ))}
  </div>
);
