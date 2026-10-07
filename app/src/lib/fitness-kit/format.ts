/**
 * Formatadores puramente visuais do módulo Fitness.
 * Nenhuma regra de domínio aqui: apenas conversão de números/datas em texto.
 */

const LOCALE = 'pt-BR';

/** 75 → "01:15" */
export const formatClock = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/** 2230 → "0:37:10" (relógio longo, como na tela de resumo) */
export const formatLongClock = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/** 20 → "20min" · 90 → "1h 30m" */
export const formatMinutes = (minutes: number): string => {
  const safe = Math.max(0, Math.round(minutes));
  if (safe < 60) return `${safe}min`;
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
};

/** Segundos → "2h 30m" / "45m" */
export const formatHoursMinutes = (totalSeconds: number): string => formatMinutes(totalSeconds / 60);

export const formatDistance = (kilometers: number): string =>
  `${kilometers.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}km`;

export const formatPercentage = (value: number): string => `${Math.round(value).toLocaleString(LOCALE)}%`;

export interface FormattedMetric {
  value: string;
  unit?: string;
}

export const formatMetric = (value: number, unit?: string, fractionDigits = 0): FormattedMetric => ({
  value: value.toLocaleString(LOCALE, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }),
  unit,
});

const toDate = (value: string | Date): Date | null => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** ISO → "07:30" */
export const formatClockTime = (value: string | Date): string => {
  const date = toDate(value);
  return date ? date.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' }) : '--:--';
};

/** ISO → "segunda-feira" */
export const formatDayLabel = (value: string | Date): string => {
  const date = toDate(value);
  if (!date) return '';
  const label = date.toLocaleDateString(LOCALE, { weekday: 'long' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** ISO → "Seg" */
export const formatShortDayLabel = (value: string | Date): string => {
  const date = toDate(value);
  if (!date) return '';
  const label = date.toLocaleDateString(LOCALE, { weekday: 'short' }).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** ISO → "S" (inicial do dia da semana) */
export const formatDayInitial = (value: string | Date): string => formatShortDayLabel(value).charAt(0);

/** Data → "outubro de 2026" */
export const formatMonthLabel = (value: string | Date = new Date()): string => {
  const date = toDate(value);
  if (!date) return '';
  const label = date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

/** "07:30 - 07:58" */
export const formatTimeRange = (start: string | Date, end?: string | Date): string => {
  const startLabel = formatClockTime(start);
  return end ? `${startLabel} - ${formatClockTime(end)}` : startLabel;
};
