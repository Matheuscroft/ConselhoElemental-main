import React, { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, type TooltipProps } from 'recharts';

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  height?: number;
  color?: string;
  unit?: string;
}

const TICK_STYLE = { fill: '#9A9AA4', fontSize: 12 };

const TrendTooltip: React.FC<TooltipProps<number, string> & { unit?: string }> = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-full bg-fitness-canvas px-3 py-1.5 text-xs text-fitness-text shadow-fitness-card">
      {label}: <span className="font-semibold">{Math.round(Number(payload[0].value)).toLocaleString('pt-BR')}</span>
      {unit && <span className="text-fitness-muted"> {unit}</span>}
    </div>
  );
};

/** Curva suave violeta com preenchimento em gradiente (opaco no topo → transparente no fundo). */
export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({ data, height = 220, color = '#8582F2', unit }) => {
  const gradientId = `fitness-trend-${useId().replace(/:/g, '')}`;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={TICK_STYLE} interval={0} tickMargin={10} />
          <Tooltip content={<TrendTooltip unit={unit} />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 6, fill: '#252B3A', stroke: color, strokeWidth: 3 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
