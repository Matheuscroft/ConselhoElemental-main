import React, { useId, type CSSProperties } from 'react';

interface MiniSparklineProps {
  values: number[];
  color?: string;
  height?: number;
  /** Falso mantém a linha por desenhar; o dono do gráfico liga quando ele chega à tela. */
  arrived?: boolean;
}

const TOP = 8;
const BOTTOM = 92;

/** A smooth line through the points: each step eases flat at both ends, so it never overshoots a value. */
const smoothPath = (points: ReadonlyArray<{ x: number; y: number }>) => points.map((point, index) => {
  if (index === 0) return `M ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  const previous = points[index - 1];
  const middle = ((previous.x + point.x) / 2).toFixed(2);
  return `C ${middle} ${previous.y.toFixed(2)}, ${middle} ${point.y.toFixed(2)}, ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}).join(' ');

/** Linha mínima sem eixos que se desenha da esquerda. Com menos de 2 pontos não há o que desenhar. */
export const MiniSparkline: React.FC<MiniSparklineProps> = ({ values, color = '#00C99A', height = 40, arrived = true }) => {
  const gradientId = `saude-spark-${useId().replace(/:/g, '')}`;
  if (values.length < 2) return null;

  const low = Math.min(...values);
  const high = Math.max(...values);
  const range = high - low || 1;
  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * 100,
    y: high === low ? 50 : BOTTOM - ((value - low) / range) * (BOTTOM - TOP),
  }));
  const line = smoothPath(points);
  const last = points[points.length - 1];

  return (
    <div className="saude-spark" data-chegou={arrived} style={{ height, '--cor': color } as CSSProperties} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".32" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className="saude-spark-area" d={`${line} L 100 100 L 0 100 Z`} fill={`url(#${gradientId})`} />
        <path className="saude-spark-linha" d={line} pathLength={1} stroke={color} />
      </svg>
      <i className="saude-spark-ponta" style={{ insetInlineStart: `${last.x}%`, insetBlockStart: `${last.y}%` }} />
    </div>
  );
};
