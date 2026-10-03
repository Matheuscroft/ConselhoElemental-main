import React from 'react';
import { cn } from '@/lib/utils';

/**
 * GlassCard — superfície padrão do Design System (glassmorphism).
<<<<<<< HEAD
 * A aparência é mantida pela classe global .glass-card para que o
 * componente e os layouts que usam a classe compartilhem os mesmos tokens.
=======
 * bg-black/40 + backdrop-blur-md + borda branca 10% + rounded-3xl.
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
 */
export const GlassCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
<<<<<<< HEAD
      className={cn('glass-card', className)}
=======
      className={cn(
        'rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-glass',
        className
      )}
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
      {...props}
    />
  )
);
GlassCard.displayName = 'GlassCard';
