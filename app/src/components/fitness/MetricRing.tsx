/**
 * MetricRing — a single SVG concentric ring.
 * Used by RingsOverview to compose three stacked activity rings.
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
  color,
  trackColor,
}) => {
  const circumference = 2 * Math.PI * radius;
  const clampedRatio = Math.min(1, Math.max(0, max > 0 ? value / max : 0));
  const dashOffset = circumference * (1 - clampedRatio);
  const center = radius + strokeWidth / 2;

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

// ─── RingsOverview ────────────────────────────────────────────────────────────

interface RingDef {
  value: number;
  max: number;
  color: string;
  trackColor: string;
  label: string;
  valueLabel: string;
}

interface RingsOverviewProps {
  /** Outer ring */
  sleep: RingDef;
  /** Middle ring */
  exercise: RingDef;
  /** Inner ring */
  water: RingDef;
  /** Accessible summary for screen readers */
  summary?: string;
  size?: number;
}

/**
 * RingsOverview — three concentric SVG activity rings (Sleep / Exercise / Water).
 * Layout matches Apple-style health rings: external = sleep (green), middle = exercise (orange), internal = water (blue).
 */
export const RingsOverview: React.FC<RingsOverviewProps> = ({
  sleep,
  exercise,
  water,
  summary,
  size = 140,
}) => {
  const strokeWidth = 14;
  const gap = 6; // gap between rings
  const rOuter = (size / 2) - strokeWidth / 2;
  const rMid = rOuter - strokeWidth - gap;
  const rInner = rMid - strokeWidth - gap;
  const viewBoxSize = size;

  return (
    <div
      role="img"
      aria-label={summary ?? `Anéis de atividade: Sono ${sleep.valueLabel}, Exercício ${exercise.valueLabel}, Água ${water.valueLabel}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={viewBoxSize}
        height={viewBoxSize}
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        aria-hidden="true"
      >
        {/* Outer: Sleep */}
        <MetricRing
          value={sleep.value}
          max={sleep.max}
          radius={rOuter}
          strokeWidth={strokeWidth}
          color={sleep.color}
          trackColor={sleep.trackColor}
        />
        {/* Middle: Exercise */}
        <MetricRing
          value={exercise.value}
          max={exercise.max}
          radius={rMid}
          strokeWidth={strokeWidth}
          color={exercise.color}
          trackColor={exercise.trackColor}
        />
        {/* Inner: Water */}
        <MetricRing
          value={water.value}
          max={water.max}
          radius={rInner}
          strokeWidth={strokeWidth}
          color={water.color}
          trackColor={water.trackColor}
        />
      </svg>
    </div>
  );
};
