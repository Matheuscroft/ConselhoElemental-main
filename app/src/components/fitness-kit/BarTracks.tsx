import React from 'react';
import { cn } from '@/lib/utils';

export interface BarDatum {
  label: string;
  value: number;
  /** Texto lido por leitores de tela, ex.: "Segunda: 25min". */
  caption: string;
}

interface BarTracksProps {
  data: BarDatum[];
  max: number;
  ariaLabel: string;
  size: 'sm' | 'md';
  showLabels: boolean;
  /** Rótulo do limite exibido no canto superior direito (ex.: "60min"). */
  limitLabel?: string;
  className?: string;
}

const SIZE = {
  sm: { track: 'h-24 w-2', gap: 'gap-2.5' },
  md: { track: 'h-44 w-3', gap: 'gap-0' },
} as const;

/** Barras verticais finas: trilha verde-escura + preenchimento verde, pontas arredondadas. */
const BarTracks: React.FC<BarTracksProps> = ({ data, max, ariaLabel, size, showLabels, limitLabel, className }) => {
  const safeMax = max > 0 ? max : 1;
  const summary = data.map((item) => item.caption).join('; ');

  return (
    <div className={cn('relative', className)}>
      {limitLabel && <p className="mb-1 text-right text-xs text-fitness-muted" aria-hidden="true">{limitLabel}</p>}
      <div role="img" aria-label={`${ariaLabel}. ${summary}`} className={cn('flex items-end justify-between', SIZE[size].gap)}>
        {data.map((item, index) => {
          const ratio = Math.min(1, Math.max(0, item.value / safeMax));
          return (
            <div key={`${item.label}-${index}`} className="flex flex-col items-center gap-3">
              <div className={cn('relative overflow-hidden rounded-full bg-fitness-green-dim/60', SIZE[size].track)}>
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full bg-fitness-green motion-safe:transition-[height] motion-safe:duration-500"
                  style={{ height: `${ratio * 100}%` }}
                />
              </div>
              {showLabels && <span className="text-sm text-fitness-text-soft">{item.label}</span>}
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

/** Versão compacta para widgets (sem rótulos). */
export const MiniBars: React.FC<PublicProps> = (props) => <BarTracks {...props} size="sm" showLabels={false} />;
