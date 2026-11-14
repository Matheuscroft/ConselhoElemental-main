import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import React from 'react';
import type { ElementId } from '@/types';
import { ELEMENTS } from '@/constants';

interface ElementCardProps {
  elementId: ElementId;
  score: number;
  percentage: number;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const ElementCard: React.FC<ElementCardProps> = ({
  elementId,
  score,
  percentage,
  onClick,
  size = 'md',
}) => {
  const element = ELEMENTS[elementId];
  
  const interactive = onClick ? {
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } },
  } : {};

  return (
    <div onClick={onClick} {...interactive} className="ds-runa" data-element={elementId} data-tamanho={size}>
      <div className="ds-runa-cabeca">
        <ElementIcon element={element.id} size={size === 'lg' ? 36 : size === 'md' ? 30 : 24} />
        <div className="min-w-0 flex-1">
          <h3 className="ds-runa-titulo">{element.name}</h3>
          <p className="ds-nota">{element.domain}</p>
        </div>
        <span className="ds-cifra">{score.toLocaleString()}<small>pts</small></span>
      </div>
      <span
        className="ds-medidor"
        data-forma="fio"
        role="img"
        aria-label={`${percentage}%`}
        style={{ '--medidor-valor': Math.min(Math.max(percentage / 100, 0), 1) } as React.CSSProperties}
      />
      <p className="ds-meta">{percentage}%</p>
    </div>
  );
};
