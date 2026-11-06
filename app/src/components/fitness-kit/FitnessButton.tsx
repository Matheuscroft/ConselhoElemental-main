import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'coral';
type ButtonSize = 'md' | 'lg';

interface FitnessButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'border border-[rgb(var(--el-gold)/0.55)] bg-[rgb(var(--el-gold))] text-[rgb(var(--el-canvas))] hover:brightness-105',
  secondary: 'border border-white/15 bg-fitness-surface text-fitness-text hover:bg-fitness-surface-hover',
  coral: 'bg-fitness-coral text-white hover:brightness-105',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg sm:h-16',
};

/** Ação com o mesmo ouro e cantos do restante do app. `disabled` fica visualmente apagado. */
export const FitnessButton = React.forwardRef<HTMLButtonElement, FitnessButtonProps>(
  ({ variant = 'primary', size = 'lg', className, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium outline-none',
        'transition-[filter,transform,background-color,opacity] duration-200 motion-safe:active:scale-[0.98] motion-reduce:transition-none',
        'focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas',
        'disabled:cursor-not-allowed disabled:bg-fitness-surface disabled:text-fitness-disabled disabled:hover:brightness-100 disabled:active:scale-100',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    />
  )
);
FitnessButton.displayName = 'FitnessButton';
