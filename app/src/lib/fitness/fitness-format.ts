/**
 * fitness-format.ts
 * Centralized visual formatters for the Fitness Health UI Kit.
 * Pure presentation transforms — no domain logic.
 */

/** 65 → "1:05" (m:ss) */
export const formatClockTime = (totalSeconds: number): string => {
  const abs = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** 90 → "1h 30min" */
export const formatDurationFull = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}min`;
  if (h > 0) return `${h}h`;
  return `${m}min`;
};

/** 90 → "1h 30m" (compact) */
export const formatDurationCompact = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

/** Seconds to a readable label like "20min" or "1:00" */
export const formatSecondsLabel = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 1) return `${m}:${String(s).padStart(2, '0')}`;
  return `${s}s`;
};

/** ISO date string → "Monday, October 3" */
export const formatDayLabel = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
};

/** ISO date string → "Sun", "Mon", "Tue" */
export const formatWeekdayShort = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

/** ISO date string → "March 2021" */
export const formatMonthLabel = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

/** ISO date string → "07:30" */
export const formatTimeHHMM = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

/** ISO date string → "07" */
export const formatDayOfMonth = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return String(date.getDate());
};

/** 0.42 → "42%" */
export const formatPercentage = (ratio: number): string =>
  `${Math.round(ratio * 100)}%`;

/** 6240 → "6.24 km" */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
};

/** Generic metric label: value + unit */
export const formatMetric = (value: number | string, unit: string): string =>
  `${value}${unit}`;

/** durationSeconds on a session: 2230 → "37:10" */
export const formatSessionDuration = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};
