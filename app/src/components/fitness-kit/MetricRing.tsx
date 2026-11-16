import React, { type CSSProperties } from 'react';

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
  /** Quando informado, a legenda conta até o valor em vez de mostrar `display`. */
  count?: { value: number; format: (value: number) => string };
}

interface MetricRingProps {
  value: number;
  max: number;
  radius: number;
  strokeWidth: number;
  color: string;
  trackColor: string;
  center: number;
  /** Posição do anel (do externo para o interno): cada um acende um passo depois do anterior. */
  order?: number;
  /** Falso mantém o arco recolhido; o `RingsOverview` o liga quando o anel chega à tela. */
  arrived?: boolean;
}

/** Um anel SVG: trilha + halo + arco arredondado começando no topo, que se desenha quando `arrived`. */
export const MetricRing: React.FC<MetricRingProps> = ({ value, max, radius, strokeWidth, color, trackColor, center, order = 0, arrived = true }) => {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const common = { cx: center, cy: center, r: radius, fill: 'none', pathLength: 100, transform: `rotate(-90 ${center} ${center})` } as const;

  return (
    <g className="saude-anel" data-chegou={arrived} style={{ '--arco': ratio * 100, '--ordem': order } as CSSProperties}>
      <circle cx={center} cy={center} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      {ratio > 0 && (
        <>
          <circle {...common} className="saude-anel-halo" stroke={color} strokeWidth={strokeWidth + 7} strokeLinecap="round" />
          <circle {...common} className="saude-anel-arco" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};
