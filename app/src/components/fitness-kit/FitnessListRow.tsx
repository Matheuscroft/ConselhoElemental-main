import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { FitnessCard } from './FitnessCard';
import { FitnessIconBadge } from './FitnessIconBadge';

interface FitnessListRowProps {
  icon: LucideIcon;
  leading?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

/** Linha genérica (badge + título + subtítulo + chevron) para listas de treinos/exercícios. */
export const FitnessListRow: React.FC<FitnessListRowProps> = ({ icon, leading, title, subtitle, trailing, onClick, ariaLabel }) => {
  const content = (
    <>
      {leading ?? <FitnessIconBadge icon={icon} size="sm" />}
      <span className="min-w-0 flex-1 text-left">
        <span title={title} className="fitness-row-title block text-[16px] font-medium leading-snug text-fitness-text">{title}</span>
        {subtitle && <span title={subtitle} className="fitness-row-subtitle mt-1 block text-xs leading-relaxed text-fitness-muted">{subtitle}</span>}
      </span>
      {trailing ?? (onClick && <ChevronRight className="h-5 w-5 shrink-0 text-fitness-muted-dark" aria-hidden="true" />)}
    </>
  );

  if (!onClick) {
    return (
      <FitnessCard radius="md" className="fitness-elemental-row flex min-h-[80px] items-center gap-3 px-4 py-3">
        {content}
      </FitnessCard>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="block w-full rounded-fit text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
    >
      <FitnessCard radius="md" interactive className="fitness-elemental-row flex min-h-[80px] items-center gap-3 px-4 py-3">
        {content}
      </FitnessCard>
    </button>
  );
};
