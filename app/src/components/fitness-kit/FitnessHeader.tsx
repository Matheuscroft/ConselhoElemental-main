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

/**
 * Cabeçalho centralizado das telas do módulo: o mesmo corpo do resto do app
 * (título com a luz do elemento da semana, subtítulo discreto e um fio de luz),
 * com a seta de voltar de 44px. Sem props novas; a aparência vem de treinos-uau.css.
 */
export const FitnessHeader: React.FC<FitnessHeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Voltar',
  action,
  className,
}) => (
  <header className={cn('fitness-elemental-header tr-cabecalho grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2', className)}>
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label={backLabel}
        className="tr-voltar grid h-11 w-11 place-items-center outline-none"
      >
        <ArrowLeft className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
      </button>
    ) : (
      <span aria-hidden="true" />
    )}
    <div className="tr-cabecalho-texto min-w-0 text-center">
      <h1 className="tr-titulo">{title}</h1>
      {subtitle && <p className="tr-subtitulo">{subtitle}</p>}
    </div>
    <div className="flex justify-end">{action}</div>
  </header>
);
