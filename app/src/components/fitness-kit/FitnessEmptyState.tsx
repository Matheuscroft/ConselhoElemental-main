import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessEmptyStateProps {
  message: string;
  action?: React.ReactNode;
  className?: string;
}

/** Estado vazio sóbrio: texto curto, sem gráficos fictícios. */
export const FitnessEmptyState: React.FC<FitnessEmptyStateProps> = ({ message, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center gap-4 px-4 py-8 text-center', className)}>
    <p className="max-w-xs text-sm text-fitness-muted">{message}</p>
    {action}
  </div>
);
