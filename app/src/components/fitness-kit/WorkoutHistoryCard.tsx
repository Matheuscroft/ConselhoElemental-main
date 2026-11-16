import React, { type CSSProperties } from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ElementId } from '@/types';

interface WorkoutHistoryCardProps {
  name: string;
  dateLabel: string;
  metricValue: string;
  metricUnit?: string;
  metricNode?: React.ReactNode;
  icon: LucideIcon;
  onClick?: () => void;
  /** Elemento da modalidade: dá à runa a cor e o fio de luz dele. Sem isto ela fica dourada. */
  element?: ElementId;
  /** Nome da modalidade, dito junto da data. */
  modalityLabel?: string;
  /** Posição na lista: cada runa entra um passo depois da anterior. */
  order?: number;
}

/** Sessão como runa: sigilo na cor da modalidade, nome, quando e qual, e a recompensa que ela rendeu. */
export const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({ name, dateLabel, metricValue, metricUnit, metricNode, icon: Icon, onClick, element, modalityLabel, order = 0 }) => {
  const content = (
    <>
      <span className="saude-runa-sigilo" aria-hidden="true"><Icon strokeWidth={1.75} /></span>
      <span className="saude-runa-texto">
        <span className="saude-runa-nome">{name}</span>
        <span className="saude-runa-meta">{dateLabel}{modalityLabel && <> · {modalityLabel}</>}</span>
        <span className="saude-runa-metrica">{metricNode ?? <>{metricValue}{metricUnit && <span> {metricUnit}</span>}</>}</span>
      </span>
      {onClick && <ChevronRight className="saude-runa-seta" aria-hidden="true" />}
    </>
  );
  const shared = {
    className: 'saude-runa saude-entra',
    'data-element': element,
    'data-luz': '',
    style: { '--ordem': order } as CSSProperties,
  };

  return onClick
    ? <button type="button" onClick={onClick} {...shared}>{content}</button>
    : <div {...shared}>{content}</div>;
};
