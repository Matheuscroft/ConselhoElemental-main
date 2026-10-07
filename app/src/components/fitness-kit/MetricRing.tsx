import React from 'react';

export interface RingMetric {
  id: string;
  label: string;
  /** Valor atual (mesma unidade de `max`). */
  value: number;
  max: number;
  /** Texto exibido na legenda (ex.: "7h 30m"). */
  display: string;
  color: string;
  trackColor: string;
}

interface MetricRingProps {
  value: number;
  max: number;
  radius: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  center: number;
}

/** Um anel SVG (trilha + progresso arredondado começando no topo). */
export const MetricRing: React.FC<MetricRingProps> = ({ value, max, radius, strokeWidth, color, trackColor, center }) => {
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const offset = circumference * (1 - ratio);

  return (
    <g>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {ratio > 0 && (
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
        />
      )}
    </g>
  );
};
