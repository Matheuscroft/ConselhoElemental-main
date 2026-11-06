/**
 * FitnessButton — pill-shaped button following the Health UI Kit.
 * Variants: primary (elemental gold), secondary (surface), coral (finish/danger).
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
    'border border-[rgb(var(--el-gold)/0.5)] bg-[rgb(var(--el-gold))] text-[rgb(var(--el-canvas))] hover:brightness-105',
  secondary:
    'bg-fitness-surface hover:bg-fitness-surface-hover text-fitness-text',
  coral:
    'bg-fitness-coral hover:bg-fitness-coral/90 text-white',
  ghost:
    'bg-transparent hover:bg-fitness-surface text-fitness-text',
};

const sizeClasses: Record<FitnessButtonSize, string> = {
  sm: 'h-11 px-5 text-sm',
  md: 'h-14 px-7 text-base',
  lg: 'h-16 px-10 text-base font-semibold',
};

export const FitnessButton = React.forwardRef<HTMLButtonElement, FitnessButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium',
        'transition-all duration-150 ease-out',
        'motion-safe:active:scale-[0.98] motion-reduce:transition-none',
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
