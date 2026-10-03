import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onRate?: (stars: 1 | 2 | 3 | 4 | 5) => void;
  readOnly?: boolean;
  size?: number;
}

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export const StarRating: React.FC<StarRatingProps> = ({ value, onRate, readOnly = false, size = 28 }) => {
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
            onClick={() => !readOnly && onRate?.(star)}
            className={cn(
              'rounded-full p-1 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-mystic-gold/70',
              !readOnly && 'hover:scale-110 cursor-pointer',
              readOnly && 'cursor-default'
            )}
          >
            <Star
              style={{ width: size, height: size }}
              className={filled ? 'fill-mystic-gold text-mystic-gold' : 'text-white/20'}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
};
