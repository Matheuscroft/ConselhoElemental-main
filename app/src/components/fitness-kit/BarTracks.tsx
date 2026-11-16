import React, { type CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export interface BarDatum {
  label: string;
  value: number;
  /** Texto lido por leitores de tela, ex.: "Segunda: 25min". */
  caption: string;
  /** O dia de hoje: barra com brilho, rótulo e marca em destaque. */
  isToday?: boolean;
}

interface BarTracksProps {
  data: BarDatum[];
  max: number;
  ariaLabel: string;
  size: 'sm' | 'md';
  showLabels: boolean;
  /** Rótulo do limite exibido no canto superior direito (ex.: "60min"). */
  limitLabel?: string;
  /** Falso mantém as barras recolhidas; o dono do gráfico liga quando ele chega à tela. */
  arrived?: boolean;
  className?: string;
}

/** Barras verticais finas: trilha escura + preenchimento na luz da semana, pontas arredondadas; hoje em destaque. */
const BarTracks: React.FC<BarTracksProps> = ({ data, max, ariaLabel, size, showLabels, limitLabel, arrived = true, className }) => {
  const safeMax = max > 0 ? max : 1;
  const summary = data.map((item) => item.caption).join('; ');

  return (
    <div className={cn('saude-barras', className)} data-tamanho={size} data-chegou={arrived}>
      {limitLabel && <p className="saude-barras-limite" aria-hidden="true">{limitLabel}</p>}
      <div role="img" aria-label={`${ariaLabel}. ${summary}`} className="saude-barras-grade">
        {data.map((item, index) => {
          const ratio = Math.min(1, Math.max(0, item.value / safeMax));
          return (
            <div key={`${item.label}-${index}`} className="saude-barra" data-hoje={item.isToday || undefined} data-vazia={ratio === 0} style={{ '--parte': ratio, '--ordem': index } as CSSProperties}>
              <div className="saude-barra-trilha"><span className="saude-barra-preenche" /></div>
              {showLabels && <span className="saude-barra-rotulo">{item.label}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

type PublicProps = Omit<BarTracksProps, 'size' | 'showLabels'>;

/** Gráfico semanal (7 colunas com rótulos). */
export const WeeklyBars: React.FC<PublicProps> = (props) => <BarTracks {...props} size="md" showLabels />;

/** Versão compacta para widgets: trilhas finas e a inicial do dia. */
export const MiniBars: React.FC<PublicProps> = (props) => <BarTracks {...props} size="sm" showLabels />;
