import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FitnessEmptyStateProps {
  message: string;
  action?: React.ReactNode;
  className?: string;
  /** Título curto que convida, acima da mensagem. */
  title?: string;
  /** Sigilo no topo; por padrão, uma centelha dentro de um anel de luz. */
  icon?: React.ReactNode;
  /** Versão baixa, para listas secundárias dentro de uma tela. */
  compact?: boolean;
}

/** Estado vazio que convida: um sigilo, um título curto e a mensagem, sem gráficos fictícios. */
export const FitnessEmptyState: React.FC<FitnessEmptyStateProps> = ({ message, action, className, title, icon, compact = false }) => (
  <div role={title ? 'group' : undefined} aria-label={title} data-compacto={compact ? 'true' : undefined} className={cn('tr-vazio', className)}>
    <span className="tr-vazio-sigilo" aria-hidden="true">{icon ?? <Sparkles size={compact ? 20 : 26} strokeWidth={1.5} />}</span>
    {title && <h3 className="tr-vazio-titulo">{title}</h3>}
    <p className="tr-vazio-texto">{message}</p>
    {action}
  </div>
);
