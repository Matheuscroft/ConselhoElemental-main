import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';
import { FitnessCard } from './FitnessCard';
import { FitnessIconBadge } from './FitnessIconBadge';

interface FitnessListRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

/** Linha genérica (badge + título + subtítulo + chevron) para listas de treinos/exercícios. */
export const FitnessListRow: React.FC<FitnessListRowProps> = ({ icon, title, subtitle, trailing, onClick, ariaLabel }) => {
  const content = (
    <>
      <FitnessIconBadge icon={icon} size="sm" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-[17px] font-medium text-fitness-text">{title}</span>
        {subtitle && <span className="block truncate text-sm text-fitness-muted">{subtitle}</span>}
      </span>
      {trailing ?? (onClick && <ChevronRight className="h-5 w-5 shrink-0 text-fitness-muted-dark" aria-hidden="true" />)}
    </>
  );

  if (!onClick) {
    return (
      <FitnessCard radius="md" className="flex min-h-[76px] items-center gap-4 px-5 py-4">
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
      <FitnessCard radius="md" interactive className="flex min-h-[76px] items-center gap-4 px-5 py-4">
        {content}
      </FitnessCard>
    </button>
  );
};
