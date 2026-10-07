import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  variant?: 'default' | 'fitness';
  onRate?: (stars: 1 | 2 | 3 | 4 | 5) => void;
  readOnly?: boolean;
  size?: number;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export const StarRating: React.FC<StarRatingProps> = ({ value, variant = 'default', onRate, readOnly = false, size = 28 }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;

  return (
    <div
      role="radiogroup"
      aria-label="Avaliação de 1 a 5 estrelas"
      className="flex items-center gap-1.5"
      onMouseLeave={() => setHovered(null)}
    >
      {STAR_VALUES.map((star) => {
        const filled = star <= displayValue;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} ${star === 1 ? 'estrela' : 'estrelas'}`}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onFocus={() => !readOnly && setHovered(star)}
            onBlur={() => setHovered(null)}
            tabIndex={star === (value || 1) ? 0 : -1}
            onKeyDown={(event) => {
              const next = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? star % 5 + 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (star + 3) % 5 + 1 : event.key === 'Home' ? 1 : event.key === 'End' ? 5 : null;
              if (!next || readOnly) return;
              event.preventDefault();
              onRate?.(next as 1 | 2 | 3 | 4 | 5);
              (event.currentTarget.parentElement?.children[next - 1] as HTMLButtonElement)?.focus();
            }}
            onClick={() => !readOnly && onRate?.(star)}
            className={cn(
              variant === 'fitness' && 'text-fitness-primary',
              'min-h-11 min-w-11 rounded-full p-1 motion-reduce:transform-none motion-reduce:transition-none transition-transform outline-none focus-visible:ring-2 focus-visible:ring-mystic-gold/70',
              !readOnly && 'hover:scale-110 cursor-pointer',
              readOnly && 'cursor-default'
            )}
          >
            <Star
              style={{ width: size, height: size }}
              className={filled ? (variant === 'fitness' ? 'fill-fitness-primary text-fitness-primary' : 'fill-mystic-gold text-mystic-gold') : 'text-white/40'}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};
