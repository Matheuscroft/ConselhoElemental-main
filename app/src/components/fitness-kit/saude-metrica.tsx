import React, { useRef, type CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useChegadaSaude } from './saude-chegada';
import { SaudeNumeroVivo, type SaudeNumero } from './saude-painel';

interface SaudeMetricaProps {
  title: string;
  icon: LucideIcon;
  /** O número da semana, contado na chegada. */
  value?: SaudeNumero;
  /** Sem dados: a frase que convida, no lugar do gráfico. */
  emptyText?: string;
  summary?: string;
  arrivalKey: string;
  order?: number;
  children: (arrived: boolean) => React.ReactNode;
}

/**
 * Cartão de métrica da semana: sigilo e número em cima, o nome inteiro embaixo
 * (nunca partido no meio da palavra) e o mini-gráfico que se desenha.
 */
export const SaudeMetrica: React.FC<SaudeMetricaProps> = ({ title, icon: Icon, value, emptyText, summary, arrivalKey, order = 0, children }) => {
  const ref = useRef<HTMLElement>(null);
  const arrived = useChegadaSaude(ref, arrivalKey);

  return (
    <article ref={ref} data-luz="" data-chegou={arrived} className="saude-metrica ds-pane saude-entra" style={{ '--ordem': order } as CSSProperties}>
      <span className="saude-metrica-sigilo" aria-hidden="true"><Icon strokeWidth={1.75} /></span>
      {value && !emptyText && <strong className="saude-metrica-valor"><SaudeNumeroVivo number={value} arrived={arrived} /></strong>}
      <h3 className="saude-metrica-titulo">{title}</h3>
      {emptyText ? (
        <div className="saude-metrica-vazio">
          <span className="saude-metrica-fantasma" aria-hidden="true" />
          <p>{emptyText}</p>
        </div>
      ) : (
        <div role={summary ? 'img' : undefined} aria-label={summary} className="saude-metrica-corpo">
          {children(arrived)}
        </div>
      )}
    </article>
  );
};
