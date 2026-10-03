/**
 * MiniSparkline — tiny Recharts LineChart used inside daily list cards.
 * Accepts simple number[] as data, renders minimal green line with no axes.
 */
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  color = '#00C99A',
  height = 32,
  width = 64,
}) => {
  if (data.length < 2) return null;
  const chartData = data.map((value) => ({ value }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// ─── WeeklyBarChart ───────────────────────────────────────────────────────────

export interface WeeklyBarPoint {
  day: string;
  value: number;
  max: number;
}

interface WeeklyBarChartProps {
  data: WeeklyBarPoint[];
  /** Label shown in top-right corner of card (e.g. "7h") */
  limitLabel?: string;
}

/**
 * WeeklyBarChart — 7 vertical bars with thin track + green fill.
 * Uses CSS for pixel-perfect thin bars matching the UI Kit reference.
 */
export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ data, limitLabel }) => (
  <div>
    {limitLabel && (
      <div className="flex justify-end mb-2">
        <span className="text-[13px] text-fitness-muted">{limitLabel}</span>
      </div>
    )}
    <div className="flex items-end justify-between gap-2 h-28" aria-label="Gráfico semanal de atividade">
      {data.map(({ day, value, max }) => {
        const pct = max > 0 ? Math.min(1, value / max) : 0;
        return (
          <div key={day} className="flex flex-col items-center gap-1.5 flex-1">
            <div className="relative flex-1 w-3 rounded-full bg-fitness-green-dim overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 rounded-full bg-fitness-green"
                style={{ height: `${Math.round(pct * 100)}%`, transition: 'height 0.5s ease' }}
                aria-label={`${day}: ${value}`}
              />
            </div>
            <span className="text-[11px] text-fitness-muted">{day}</span>
          </div>
        );
      })}
    </div>
  </div>
);
