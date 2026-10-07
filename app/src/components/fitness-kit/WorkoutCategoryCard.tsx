import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutCategoryCardProps {
  label: string;
  icon: LucideIcon;
  selected: boolean;
  description?: string;
  /** Variação de altura para reproduzir o ritmo escalonado do grid da referência. */
  tall?: boolean;
  onSelect: () => void;
}

/** Card de categoria: ícone + rótulo centralizados; selecionado ganha contorno violeta de 3px. */
export const WorkoutCategoryCard: React.FC<WorkoutCategoryCardProps> = ({ label, icon: Icon, selected, description, tall = false, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={cn(
      'flex w-full flex-col items-center justify-center gap-3 rounded-fit border-[3px] bg-fitness-surface px-3 text-center shadow-fitness-card outline-none',
      'transition-[filter,transform,border-color] duration-200 hover:brightness-110 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none',
      'focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas',
      tall ? 'h-[195px]' : 'h-[135px]',
      selected ? 'border-fitness-primary shadow-fitness-primary' : 'border-transparent'
    )}
  >
    <Icon className="h-10 w-10 text-fitness-primary" strokeWidth={1.75} aria-hidden="true" />
    <span className={cn('max-w-full break-words text-[17px] font-medium leading-tight', selected ? 'text-fitness-primary' : 'text-fitness-text')}>{label}</span>
    {description && <span className="text-xs text-fitness-muted">{description}</span>}
  </button>
);

export interface CategoryOption {
  id: string;
  description?: string;
  label: string;
  icon: LucideIcon;
}

interface FitnessCategoryGridProps {
  options: CategoryOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel: string;
}

/** Grid de duas colunas escalonadas (esquerda: curto-curto-alto · direita: alto-curto-curto). */
export const FitnessCategoryGrid: React.FC<FitnessCategoryGridProps> = ({ options, selectedId, onSelect, ariaLabel }) => {
  const columns: Array<Array<{ option: CategoryOption; tall: boolean }>> = [[], []];
  options.forEach((option, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const tall = column === 0 ? row % 3 === 2 : row % 3 === 0;
    columns[column].push({ option, tall });
  });

  return (
    <div role="group" aria-label={ariaLabel} className="grid grid-cols-2 items-start gap-5">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-5">
          {column.map(({ option, tall }) => (
            <WorkoutCategoryCard
              key={option.id}
              label={option.label}
              description={option.description}
              icon={option.icon}
              tall={tall}
              selected={selectedId === option.id}
              onSelect={() => onSelect(option.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
