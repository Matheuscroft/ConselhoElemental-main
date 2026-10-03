/**
 * HeartRateChart — bar chart styled for heart rate visualization.
 * Uses primary (#FF4F55) and dark (#74383D) alternating bars.
 * Accepts data via props — never fetches or fabricates values.
 */
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { Heart } from 'lucide-react';
import { ChartWidget } from './ChartWidget';

export interface HeartRatePoint {
  bpm: number;
  /** optional label for tooltip */
  label?: string;
}

interface HeartRateChartProps {
  data: HeartRatePoint[];
  currentBpm?: number;
  minBpm?: number;
  maxBpm?: number;
  className?: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="bg-fitness-surface-alt text-fitness-text text-xs px-2 py-1 rounded-lg">
        {payload[0].value} bpm
      </div>
    );
  }
  return null;
};

export const HeartRateChart: React.FC<HeartRateChartProps> = ({
  data,
  currentBpm,
  minBpm,
  maxBpm,
  className,
}) => {
  const empty = data.length === 0;

  return (
    <ChartWidget
      isEmpty={empty}
      emptyMessage="Dados de frequência cardíaca indisponíveis."
      className={className}
      titleRight={
        maxBpm !== undefined && (
          <span className="text-[11px] text-fitness-muted">{maxBpm}</span>
        )
      }
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-fitness-text">Heart rate</span>
        </div>
        {maxBpm !== undefined && (
          <span className="text-[11px] text-fitness-muted">{maxBpm}</span>
        )}
      </div>

      {currentBpm !== undefined && (
        <div className="flex items-center gap-1.5 mb-3">
          <Heart className="w-4 h-4 text-fitness-red fill-fitness-red" aria-hidden="true" />
          <span className="text-[22px] font-semibold text-fitness-text">{currentBpm}</span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={data} barCategoryGap="20%" margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <XAxis hide />
          <YAxis
            hide
            domain={[minBpm ?? 'auto', maxBpm ?? 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar dataKey="bpm" radius={[3, 3, 3, 3]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i % 3 === 1 ? '#74383D' : '#FF4F55'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {minBpm !== undefined && (
        <div className="flex justify-end mt-1">
          <span className="text-[11px] text-fitness-muted">{minBpm}</span>
        </div>
      )}
    </ChartWidget>
  );
};
