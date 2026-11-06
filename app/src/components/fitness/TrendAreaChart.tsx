/**
 * TrendAreaChart — smooth area chart for the "Trending" section.
 * Violet gradient fill, monotone curve, no visible grid.
 */
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  height?: number;
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({ data, height = 160 }) => {
  if (data.length === 0) {
    return (
      <p className="text-sm text-fitness-muted py-6 text-center">
        Ainda não há dados suficientes para mostrar uma tendência.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d5b66f" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#d5b66f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fill: '#9A9AA4', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: '#292F3E',
            border: 'none',
            borderRadius: 12,
            color: '#F5F5F7',
            fontSize: 12,
          }}
          itemStyle={{ color: '#F5F5F7' }}
          cursor={{ stroke: '#d5b66f', strokeWidth: 1, strokeDasharray: '4 2' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="#d5b66f"
          strokeWidth={3}
          fill="url(#trendGradient)"
          dot={false}
          activeDot={{ r: 5, fill: '#d5b66f', stroke: '#F5F5F7', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
