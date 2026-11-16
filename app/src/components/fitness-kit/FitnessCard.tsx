import React from 'react';
import { cn } from '@/lib/utils';

type CardRadius = 'sm' | 'md' | 'lg' | 'xl';

// The app has two radii for surfaces: 12px for small things, 16px for cards.
const RADIUS_CLASSES: Record<CardRadius, string> = {
  sm: 'rounded-xl',
  md: 'rounded-2xl',
  lg: 'rounded-2xl',
  xl: 'rounded-2xl',
};

interface FitnessCardProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: CardRadius;
  /** Aplica hover/active sutis (use junto com role/tabIndex ou dentro de um botão). */
  interactive?: boolean;
  /** Superfície mais escura, usada em itens já concluídos. */
  muted?: boolean;
  /** A luz do dedo passa por esta superfície (precisa estar dentro de uma cena do módulo). */
  luz?: boolean;
}

/** Painel escuro (a receita .ds-pane, sem desfoque) com contorno sutil, integrado à identidade elemental. */
export const FitnessCard = React.forwardRef<HTMLDivElement, FitnessCardProps>(
  ({ radius = 'md', interactive = false, muted = false, luz = false, className, ...props }, ref) => (
    <div
      ref={ref}
      data-muted={muted ? 'true' : undefined}
      data-luz={luz ? '' : undefined}
      className={cn(
        'fitness-elemental-card',
        RADIUS_CLASSES[radius],
        interactive && 'tr-cartao-vivo',
        className
      )}
      {...props}
    />
  )
);
FitnessCard.displayName = 'FitnessCard';
