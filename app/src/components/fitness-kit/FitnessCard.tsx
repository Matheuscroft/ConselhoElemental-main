import React from 'react';
import { cn } from '@/lib/utils';

type CardRadius = 'sm' | 'md' | 'lg' | 'xl';

const RADIUS_CLASSES: Record<CardRadius, string> = {
  sm: 'rounded-fit-sm',
  md: 'rounded-fit',
  lg: 'rounded-fit-lg',
  xl: 'rounded-fit-xl',
};

interface FitnessCardProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: CardRadius;
  /** Aplica hover/active sutis (use junto com role/tabIndex ou dentro de um botão). */
  interactive?: boolean;
  /** Superfície mais escura, usada em itens já concluídos. */
  muted?: boolean;
}

/** Superfície azul-acinzentada sólida, sem borda, com sombra larga e suave. */
export const FitnessCard = React.forwardRef<HTMLDivElement, FitnessCardProps>(
  ({ radius = 'md', interactive = false, muted = false, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'shadow-fitness-card',
        muted ? 'bg-fitness-canvas' : 'bg-fitness-surface',
        RADIUS_CLASSES[radius],
        interactive && 'transition-[filter,transform] duration-200 hover:brightness-110 active:scale-[0.99]',
        className
      )}
      {...props}
    />
  )
);
FitnessCard.displayName = 'FitnessCard';
