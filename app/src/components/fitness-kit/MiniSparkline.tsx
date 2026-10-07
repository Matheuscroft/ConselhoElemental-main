import React from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  values: number[];
  color?: string;
  height?: number;
}

/** Linha mínima sem eixos. Com menos de 2 pontos não há o que desenhar. */
export const MiniSparkline: React.FC<MiniSparklineProps> = ({ values, color = '#00C99A', height = 40 }) => {
  if (values.length < 2) return null;
  const data = values.map((value, index) => ({ index, value }));

  return (
    <div style={{ height }} className="w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
