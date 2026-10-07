import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FitnessCard } from './FitnessCard';
import { FitnessEmptyState } from './FitnessEmptyState';

interface ChartWidgetProps {
  title: string;
  /** Texto auxiliar abaixo do título (ex.: valor atual). */
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  /** Quando definido, exibe o estado vazio em vez do gráfico. */
  emptyMessage?: string;
  /** Resumo textual do gráfico para tecnologias assistivas. */
  summary?: string;
  radius?: 'sm' | 'md' | 'lg';
  className?: string;
  bodyClassName?: string;
  children?: React.ReactNode;
}

/** Base visual de todos os widgets de gráfico: card, título, corpo responsivo e estado vazio. */
export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  emptyMessage,
  summary,
  radius = 'md',
  className,
  bodyClassName,
  children,
}) => (
  <FitnessCard radius={radius} className={cn('p-5 sm:p-6', className)}>
    <div className="mb-3 flex items-center gap-2">
      {Icon && <Icon className={cn('h-5 w-5 shrink-0', iconClassName)} aria-hidden="true" />}
      <h3 className="min-w-0 break-words font-sans text-[19px] font-semibold leading-tight text-fitness-text">{title}</h3>
    </div>
    {subtitle && <div className="mb-2 text-lg text-fitness-text-soft">{subtitle}</div>}
    {emptyMessage ? (
      <FitnessEmptyState message={emptyMessage} />
    ) : (
      <div role={summary ? 'img' : undefined} aria-label={summary} className={bodyClassName}>
        {children}
      </div>
    )}
  </FitnessCard>
);
