import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassCard — superfície padrão do Design System (glassmorphism).
 * A aparência é mantida pela classe global .glass-card para que o
 * componente e os layouts que usam a classe compartilhem os mesmos tokens.
 */
export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('glass-card', className)}
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';
