import React, { useId } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from 'recharts';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { DURATION } from '@/lib/motion/motion';

export interface TrendPoint {
  label: string;
  value: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  height?: number;
  color?: string;
  unit?: string;
  /** Casas decimais do valor lido no toque (padrão 0). */
  decimals?: number;
  /** Desenha a curva da esquerda para a direita ao montar (respeita movimento reduzido). */
  animate?: boolean;
  /** Com `animate`, o gráfico só é montado (e desenhado) quando isto vira verdadeiro. */
  arrived?: boolean;
  /** Índice destacado, por exemplo o dia da semana de hoje: marcador no ponto e rótulo em destaque. */
  highlight?: number;
  /** Ajusta a escala à faixa dos dados em vez de partir do zero (para o peso, que varia pouco). */
  fitRange?: boolean;
}

const TICK_STYLE = { fill: '#aab4c4', fontSize: 12 };

const TrendTooltip: React.FC<TooltipProps<number, string> & { unit?: string; decimals: number }> = ({ active, payload, label, unit, decimals }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-full bg-fitness-canvas px-3 py-1.5 text-xs text-fitness-text shadow-fitness-card">
      {label}: <span className="font-semibold">{Number(payload[0].value).toLocaleString('pt-BR', { maximumFractionDigits: decimals })}</span>
      {unit && <span className="text-fitness-muted"> {unit}</span>}
    </div>
  );
};

interface TickProps { x?: number; y?: number; payload?: { value: string; index: number } }

/** Curva suave com preenchimento em gradiente (opaco no topo → transparente no fundo). */
export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({
  data, height = 220, color = '#d5b66f', unit, decimals = 0, animate = false, arrived = true, highlight, fitRange = false,
}) => {
  const gradientId = `fitness-trend-${useId().replace(/:/g, '')}`;
  const reduced = useMotionPreference();
  const values = data.map((point) => point.value);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const pad = Math.max((high - low) * 0.45, Math.abs(high) * 0.01, 0.5);

  const renderTick = ({ x = 0, y = 0, payload }: TickProps) => {
    const today = payload !== undefined && payload.index === highlight;
    return (
      <g>
        <text x={x} y={y + 12} textAnchor="middle" fill={today ? color : TICK_STYLE.fill} fontSize={TICK_STYLE.fontSize} fontWeight={today ? 700 : 400}>{payload?.value}</text>
        {today && <circle cx={x} cy={y + 24} r={2.5} fill={color} />}
      </g>
    );
  };

  const renderDot = ({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) => (
    index === highlight && cx !== undefined && cy !== undefined
      ? <circle key={`ponto-${index}`} cx={cx} cy={cy} r={5} fill="rgb(var(--el-surface))" stroke={color} strokeWidth={3} />
      : <g key={`ponto-${index}`} />
  );

  return (
    <div style={{ height }} className="w-full">
      {arrived && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, bottom: highlight === undefined ? 0 : 12, left: 8 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={highlight === undefined ? TICK_STYLE : renderTick} interval={0} tickMargin={10} />
            {fitRange && <YAxis hide domain={[low - pad, high + pad]} />}
            <Tooltip content={<TrendTooltip unit={unit} decimals={decimals} />} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3.5}
              strokeLinecap="round"
              fill={`url(#${gradientId})`}
              dot={highlight === undefined ? false : renderDot}
              activeDot={{ r: 6, fill: 'rgb(var(--el-surface))', stroke: color, strokeWidth: 3 }}
              isAnimationActive={animate && !reduced}
              animationBegin={DURATION.reveal}
              animationDuration={DURATION.conjure * 2}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
