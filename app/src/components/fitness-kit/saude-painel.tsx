import React, { useRef, type CSSProperties } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { cn } from '@/lib/utils';
import { useChegadaSaude } from './saude-chegada';

/** Cabeçalho de uma vista de Saúde: título do tamanho da tela, subtítulo e, se houver, o atalho à direita. */
export const SaudeCabeca: React.FC<{
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** `page` quando a vista é a própria página (h1); dentro das abas do módulo é `section`. */
  level?: 'page' | 'section';
}> = ({ title, subtitle, actionLabel, onAction, level = 'section' }) => (
  <header className="saude-cabeca saude-entra" style={{ '--ordem': 0 } as CSSProperties}>
    <div>
      {level === 'page' ? <h1>{title}</h1> : <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
    </div>
    {actionLabel && onAction && <button type="button" onClick={onAction} className="saude-link">{actionLabel}</button>}
  </header>
);

export interface SaudeNumero {
  value: number;
  format?: (value: number) => string;
  unit?: string;
}

/** Um número que conta até o valor quando a peça chega à tela. */
export const SaudeNumeroVivo: React.FC<{ number: SaudeNumero; arrived: boolean }> = ({ number, arrived }) => (
  <>
    <Contagem valor={arrived ? number.value : 0} formatar={number.format} />
    {number.unit && <span>{number.unit}</span>}
  </>
);

interface SaudePainelProps {
  title: string;
  subtitle?: string;
  /** O número que resume o gráfico, contado na chegada. */
  highlight?: SaudeNumero;
  /** Marca a única peça de vidro real da aba; as demais são placas sem desfoque. */
  glass?: boolean;
  /** Resumo textual do gráfico para tecnologias assistivas. */
  summary?: string;
  /** Quando existe, ocupa o lugar do gráfico: o convite do estado vazio. */
  empty?: React.ReactNode;
  /** Identifica a chegada do gráfico: ele se desenha uma vez por abertura do app. */
  arrivalKey: string;
  order?: number;
  className?: string;
  children: (arrived: boolean) => React.ReactNode;
}

/** Painel de gráfico: título, número que conta e o desenho, que só começa quando o painel é visto. */
export const SaudePainel: React.FC<SaudePainelProps> = ({ title, subtitle, highlight, glass = false, summary, empty, arrivalKey, order = 1, className, children }) => {
  const ref = useRef<HTMLElement>(null);
  const arrived = useChegadaSaude(ref, arrivalKey);

  return (
    <section
      ref={ref}
      data-luz=""
      data-chegou={arrived}
      className={cn('saude-painel saude-entra', glass ? 'saude-vidro ds-glass-float' : 'ds-pane', className)}
      style={{ '--ordem': order } as CSSProperties}
    >
      <header className="saude-painel-cabeca">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {highlight && !empty && <strong className="saude-painel-destaque"><SaudeNumeroVivo number={highlight} arrived={arrived} /></strong>}
      </header>
      {empty ?? (
        <div role={summary ? 'img' : undefined} aria-label={summary} className="saude-painel-corpo">
          {children(arrived)}
        </div>
      )}
    </section>
  );
};
