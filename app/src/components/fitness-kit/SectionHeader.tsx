import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** `page`: título grande de tela (Insights, Resumo). `section`: título de seção (Programa). */
  level?: 'page' | 'section';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onAction,
  level = 'section',
  className,
}) => (
  <div className={cn('flex items-start justify-between gap-4', className)}>
    <div className="min-w-0">
      {level === 'page' ? (
        <h1 className="font-sans text-[32px] font-semibold leading-[1.1] text-fitness-text">{title}</h1>
      ) : (
        <h2 className="font-sans text-2xl font-semibold leading-tight text-fitness-text">{title}</h2>
      )}
      {subtitle && <p className="mt-1 text-base text-fitness-muted">{subtitle}</p>}
    </div>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="-mr-2 mt-1 min-h-11 shrink-0 rounded-full px-2 text-base font-medium text-fitness-primary outline-none transition-colors hover:text-fitness-primary-hover focus-visible:ring-2 focus-visible:ring-fitness-primary"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
