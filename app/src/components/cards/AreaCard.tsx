import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import React from 'react';
import type { Area } from '@/types';
import { ELEMENTS } from '@/constants';

interface AreaCardProps {
  area: Area;
  score?: number;
  taskCount?: number;
  onClick?: () => void;
  compact?: boolean;
}

export const AreaCard: React.FC<AreaCardProps> = ({
  area,
  score = 0,
  taskCount = 0,
  onClick,
  compact = false,
}) => {
  const element = ELEMENTS[area.elementId];
  const interactive = onClick ? {
    role: 'button' as const,
    tabIndex: 0,
    onKeyDown: (event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); } },
  } : {};

  if (compact) {
    return (
      <div onClick={onClick} {...interactive} className="ds-linha" data-element={area.elementId}>
        <ElementIcon element={element.id} size={28} />
        <div className="min-w-0">
          <p className="truncate">{area.name}</p>
          <p className="ds-nota">{element.name}</p>
        </div>
        <span className="ds-linha-valor">{score}<small className="ds-nota"> pts</small></span>
      </div>
    );
  }

  return (
    <div onClick={onClick} {...interactive} className="ds-runa" data-element={area.elementId}>
      <div className="ds-runa-cabeca">
        <ElementIcon element={element.id} size={28} />
        <div className="min-w-0 flex-1">
          <h3 className="ds-runa-titulo">{area.name}</h3>
          <p className="ds-nota">{element.name}</p>
        </div>
      </div>
      <div className="ds-cifras">
        <div className="ds-cifra">{score}<small>pontos</small></div>
        <div className="ds-cifra">{taskCount}<small>rituais</small></div>
      </div>
    </div>
  );
};
