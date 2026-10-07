import React from 'react';
import { Heart } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, YAxis } from 'recharts';
import { ChartWidget } from './ChartWidget';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';

export interface HeartRatePoint {
  /** Faixa principal (bpm). */
  min: number;
  max: number;
  /** Faixa secundária opcional, desenhada em vermelho escuro atrás da principal. */
  dimMin?: number;
  dimMax?: number;
}

interface HeartRateChartProps {
  /** Séries reais de frequência cardíaca. Sem dados → estado vazio. */
  data?: HeartRatePoint[];
  current?: number;
  domain?: [number, number];
  height?: number;
}

const RED = '#FF4F55';
const RED_DIM = '#74383D';
const TICK_STYLE = { fill: '#72727D', fontSize: 12 };

/** Barras verticais de intervalo (mín–máx) em vermelho. Nunca fabrica valores. */
export const HeartRateChart: React.FC<HeartRateChartProps> = ({ data, current, domain = [40, 180], height = 200 }) => {
  const hasData = Boolean(data && data.length > 0);
  const rows = (data ?? []).map((point, index) => ({
    index,
    range: [point.min, point.max] as [number, number],
    dim: [point.dimMin ?? point.min, point.dimMax ?? point.max] as [number, number],
  }));

  return (
    <ChartWidget
      title="Frequência cardíaca"
      icon={Heart}
      iconClassName="fill-fitness-red text-fitness-red"
      subtitle={current != null ? <span>{Math.round(current)}</span> : undefined}
      emptyMessage={hasData ? undefined : FITNESS_COPY.empty.heartRate}
      summary={hasData ? `Frequência cardíaca entre ${domain[0]} e ${domain[1]} bpm${current != null ? `, atual ${Math.round(current)} bpm` : ''}` : undefined}
    >
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} barGap={-8} margin={{ top: 8, right: 0, bottom: 8, left: 0 }}>
            <YAxis orientation="right" domain={domain} ticks={domain} axisLine={false} tickLine={false} tick={TICK_STYLE} width={32} />
            <Bar dataKey="dim" fill={RED_DIM} barSize={8} radius={4} isAnimationActive={false} />
            <Bar dataKey="range" fill={RED} barSize={8} radius={4} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartWidget>
  );
};
