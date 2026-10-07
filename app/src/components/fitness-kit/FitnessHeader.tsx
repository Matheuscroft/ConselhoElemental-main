import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FitnessHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  /** Ação à direita (ex.: botão de compartilhar). Mantém o título centralizado. */
  action?: React.ReactNode;
  /** Sobre imagem/hero: sem espaçamento extra inferior. */
  className?: string;
}

/** Cabeçalho centralizado das telas de fluxo (seta de voltar + título + subtítulo violeta). */
export const FitnessHeader: React.FC<FitnessHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  action,
  className,
}) => (
  <header className={cn('grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2', className)}>
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="grid h-11 w-11 place-items-center rounded-full text-fitness-text outline-none transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-fitness-primary"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </button>
    ) : (
      <span aria-hidden="true" />
    )}
    <div className="min-w-0 text-center">
      <h1 className="break-words font-sans text-[28px] font-semibold leading-tight text-fitness-text">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm font-medium text-fitness-primary">{subtitle}</p>}
    </div>
    <div className="flex justify-end">{action}</div>
  </header>
);
