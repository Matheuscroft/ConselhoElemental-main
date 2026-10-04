/**
 * MetricRing — a single SVG concentric ring.
 * RingsOverview stacks up to three of them around a shared center.
 */
import React from 'react';

interface MetricRingProps {
  /** Current value */
  value: number;
  /** Maximum value (denominator for progress) */
  max: number;
  /** SVG radius of the circle (center of stroke) */
  radius: number;
  /** Stroke width in px */
  strokeWidth: number;
  /** Shared center of the concentric rings */
  center: number;
  /** Progress arc stroke color */
  color: string;
  /** Background track color */
  trackColor: string;
}

export const MetricRing: React.FC<MetricRingProps> = ({
  value,
  max,
  radius,
  strokeWidth,
  center,
  color,
  trackColor,
}) => {
  const circumference = 2 * Math.PI * radius;
  const clampedRatio = Math.min(1, Math.max(0, max > 0 ? value / max : 0));
  const dashOffset = circumference * (1 - clampedRatio);

  return (
    <g>
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </g>
  );
};

// ─── RingsOverview ─────────────────────────────────────────────────────────────────────

export interface RingDef {
  value: number;
  max: number;
  color: string;
  trackColor: string;
  label: string;
  valueLabel: string;
}

interface RingsOverviewProps {
  /** Ordered from the outer ring to the inner ring (up to 3) */
  rings: RingDef[];
  /** Accessible summary for screen readers */
  summary?: string;
  size?: number;
}

const RING_STROKE_WIDTH = 14;
const RING_GAP = 6;

/** Concentric SVG rings; each entry is one ring, outermost first. */
export const RingsOverview: React.FC<RingsOverviewProps> = ({ rings, summary, size = 140 }) => {
  const center = size / 2;
  const outerRadius = center - RING_STROKE_WIDTH / 2;

  return (
    <div
      role="img"
      aria-label={summary ?? `Anéis: ${rings.map((ring) => `${ring.label} ${ring.valueLabel}`).join(', ')}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        {rings.slice(0, 3).map((ring, index) => (
          <MetricRing
            key={ring.label}
            value={ring.value}
            max={ring.max}
            radius={outerRadius - index * (RING_STROKE_WIDTH + RING_GAP)}
            strokeWidth={RING_STROKE_WIDTH}
            center={center}
            color={ring.color}
            trackColor={ring.trackColor}
          />
        ))}
      </svg>
    </div>
  );
};
