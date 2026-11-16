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
        <h1 className="tr-secao-titulo" data-nivel="page">{title}</h1>
      ) : (
        <h2 className="tr-secao-titulo">{title}</h2>
      )}
      {subtitle && <p className="tr-secao-subtitulo">{subtitle}</p>}
    </div>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="tr-secao-acao -mr-2 mt-1 min-h-11 shrink-0 px-3 outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
