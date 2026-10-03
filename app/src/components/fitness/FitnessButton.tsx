/**
 * FitnessButton — pill-shaped button following the Health UI Kit.
 * Variants: primary (violet), secondary (surface), coral (finish/danger).
 */
import React from 'react';
import { cn } from '@/lib/utils';

type FitnessButtonVariant = 'primary' | 'secondary' | 'coral' | 'ghost';
type FitnessButtonSize = 'sm' | 'md' | 'lg';

interface FitnessButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: FitnessButtonVariant;
  size?: FitnessButtonSize;
}

const variantClasses: Record<FitnessButtonVariant, string> = {
  primary:
    'bg-fitness-primary hover:bg-fitness-primary-hover text-white shadow-fitness-primary',
  secondary:
    'bg-fitness-surface hover:bg-fitness-surface-hover text-fitness-text',
  coral:
    'bg-fitness-coral hover:bg-fitness-coral/90 text-white',
  ghost:
    'bg-transparent hover:bg-fitness-surface text-fitness-text',
};

const sizeClasses: Record<FitnessButtonSize, string> = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-14 px-7 text-base',
  lg: 'h-16 px-10 text-base font-semibold',
};

export const FitnessButton = React.forwardRef<HTMLButtonElement, FitnessButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        'transition-all duration-150 ease-out',
        'active:scale-[0.98]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas',
        disabled && 'opacity-40 cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
FitnessButton.displayName = 'FitnessButton';
