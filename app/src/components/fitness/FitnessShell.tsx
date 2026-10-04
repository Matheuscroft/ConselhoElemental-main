/**
 * FitnessPageShell — full-screen dark canvas for all Fitness pages.
 * Handles safe areas, prevents horizontal overflow, sets canvas background.
 */
import React from 'react';
import { cn } from '@/lib/utils';

interface FitnessPageShellProps {
  children: React.ReactNode;
  className?: string;
  /** Extra padding-bottom for pages with a sticky bottom CTA */
  ctaOffset?: boolean;
  /** Extra padding-bottom for pages with the floating FitnessBottomNav */
  navOffset?: boolean;
  /** Override: don't add default px-6 */
  noPadX?: boolean;
}

export const FitnessPageShell: React.FC<FitnessPageShellProps> = ({
  children,
  className,
  ctaOffset = false,
  navOffset = false,
  noPadX = false,
}) => (
  <div
    className={cn(
      'min-h-dvh bg-fitness-canvas text-fitness-text font-sans',
      'overflow-x-hidden',
      'pt-[env(safe-area-inset-top)]',
      ctaOffset
        ? 'pb-[calc(6rem+env(safe-area-inset-bottom))]'
        : navOffset
        ? 'pb-[calc(8rem+env(safe-area-inset-bottom))]'
        : 'pb-[env(safe-area-inset-bottom)]',
      !noPadX && 'px-6',
      className
    )}
  >
    {children}
  </div>
);

/**
 * FitnessHeader — top bar row used across all Fitness screens.
 * Renders back arrow, centered title, and optional right action.
 */
interface FitnessHeaderProps {
  onBack?: () => void;
  title: string;
  subtitle?: string;
  subtitleColor?: string;
  rightAction?: React.ReactNode;
  className?: string;
}

export const FitnessHeader: React.FC<FitnessHeaderProps> = ({
  onBack,
  title,
  subtitle,
  subtitleColor = 'text-fitness-primary',
  rightAction,
  className,
}) => (
  <div className={cn('flex items-center justify-between pt-6 pb-2', className)}>
    {/* Back button or spacer */}
    <div className="flex-1 flex justify-start">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-fitness-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
      ) : (
        <div className="w-9" aria-hidden="true" />
      )}
    </div>

    {/* Center text */}
    <div className="flex flex-col items-center">
      <h1 className="text-lg font-semibold font-sans uppercase tracking-wider text-fitness-text leading-tight">{title}</h1>
      {subtitle && (
        <span className={cn('text-sm font-medium font-sans mt-0.5', subtitleColor)}>{subtitle}</span>
      )}
    </div>

    {/* Right action or spacer */}
    <div className="flex-1 flex justify-end">
      {rightAction ?? <div className="w-9" aria-hidden="true" />}
    </div>
  </div>
);

/**
 * SectionHeader — e.g. "Program" or "Insights / Show all"
 */
interface SectionHeaderProps {
  title: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, action, className }) => (
  <div className={cn('flex items-center justify-between mb-3', className)}>
    <h2 className="text-[20px] uppercase tracking-wider font-semibold font-sans text-fitness-text">{title}</h2>
    {action}
  </div>
);
