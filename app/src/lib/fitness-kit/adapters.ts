import { activityMetrics } from '@/lib/workout/activity-metrics';
/**
 * Adapters de APRESENTAÇÃO do módulo Fitness.
 *
 * Transformam dados que JÁ existem no workoutStore em view-models para os
 * componentes visuais. Não concedem XP, não calculam Terra/Força/Prana/Stamina,
 * não alteram sessões. Métricas inexistentes (frequência cardíaca, calorias,
 * sono, distância, GPS) simplesmente não aparecem nos view-models.
 */
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import type { BodyMeasurement, WorkoutExerciseCategory, WorkoutSession } from '@/types/workout';
import {
  formatDayInitial,
  formatDayLabel,
  formatLongClock,
  formatMetric,
  formatShortDayLabel,
  type FormattedMetric,
} from './format';

export interface MetricItem extends FormattedMetric {
  id: string;
  label: string;
}

const isCompleted = (session: WorkoutSession): boolean => session.status === 'completed';

/* -------------------------------------------------------------------------- */
/* Resumo de uma sessão                                                        */
/* -------------------------------------------------------------------------- */

export const mapSessionToSummaryMetrics = (session: WorkoutSession): MetricItem[] => {
  const metrics: MetricItem[] = [
    { id: 'time', label: 'Tempo total', value: formatLongClock(session.durationSeconds) },
  ];

  if (session.totalVolume > 0) {
    metrics.push({ id: 'volume', label: 'Volume total', ...formatMetric(session.totalVolume, 'índice') });
  }
  metrics.push({ id: 'earth', label: 'Terra conquistado', ...formatMetric(session.earthPoints) });
  metrics.push({ id: 'strength', label: 'Força ganha', value: `+${Math.round(session.strengthGain)}` });
  metrics.push({ id: 'stamina', label: 'Stamina consumida', ...formatMetric(session.staminaCost) });
  metrics.push({ id: 'prana', label: 'Prana consumido', ...formatMetric(session.pranaCost) });

  return metrics;
};

/* -------------------------------------------------------------------------- */
/* Semana                                                                      */
/* -------------------------------------------------------------------------- */

export interface DayBucket {
  key: string;
  date: Date;
  initial: string;
  shortLabel: string;
  fullLabel: string;
  isToday: boolean;
  minutes: number;
  volume: number;
  sessionCount: number;
  activityLoad: number;
  observedSessions: number;
  /** Volume de cada série concluída, na ordem em que foi feita (para sparkline). */
  setVolumes: number[];
}

const sessionDate = (session: WorkoutSession): Date => new Date(session.completedAt ?? session.startedAt);

export const buildWeekBuckets = (
  sessions: WorkoutSession[],
  weekStartsOn: 0 | 1,
  reference: Date = new Date()
): DayBucket[] => {
  const start = startOfWeek(reference, { weekStartsOn });
  const completed = sessions.filter(isCompleted);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const daySessions = completed
      .filter((session) => isSameDay(sessionDate(session), date))
      .sort((left, right) => sessionDate(left).getTime() - sessionDate(right).getTime());

    const setVolumes = daySessions.flatMap((session) =>
      session.exerciseResults.flatMap((result) => result.sets.filter((set) => set.completed).map((set) => set.volume))
    );

    return {
      key: format(date, 'yyyy-MM-dd'),
      date,
      initial: formatDayInitial(date),
      shortLabel: formatShortDayLabel(date),
      fullLabel: formatDayLabel(date),
      isToday: isSameDay(date, reference),
      minutes: daySessions.reduce((sum, session) => {const actual=activityMetrics(session);return sum + (actual.observations ? actual.seconds : session.durationSeconds);}, 0) / 60,
      activityLoad: daySessions.reduce((sum,session)=>sum+activityMetrics(session).load,0),
      observedSessions: daySessions.filter((session)=>activityMetrics(session).observations>0).length,
      volume: daySessions.reduce((sum, session) => sum + session.totalVolume, 0),
      sessionCount: daySessions.length,
      setVolumes,
    };
  });
};

/** Minutos de exercício concluídos hoje (soma de sessões concluídas). */
export const getTodayExerciseMinutes = (sessions: WorkoutSession[], reference: Date = new Date()): number =>
  sessions
    .filter(isCompleted)
    .filter((session) => isSameDay(sessionDate(session), reference))
    .reduce((sum, session) => {const actual=activityMetrics(session);return sum+(actual.observations ? actual.seconds : session.durationSeconds);}, 0) / 60;

/* -------------------------------------------------------------------------- */
/* Histórico                                                                   */
/* -------------------------------------------------------------------------- */

export interface HistoryItem {
  id: string;
  name: string;
  dateLabel: string;
  metricValue: string;
  metricUnit?: string;
  category: WorkoutExerciseCategory;
}

export const mapSessionsToHistoryItems = (
  sessions: WorkoutSession[],
  getCategory: (workoutId: string) => WorkoutExerciseCategory | undefined
): HistoryItem[] =>
  sessions.filter(isCompleted).map((session) => {
    const metric = session.totalVolume > 0 ? formatMetric(session.totalVolume, 'índice') : formatMetric(session.durationSeconds / 60, 'min');
    return {
      id: session.id,
      name: session.workoutNameSnapshot,
      dateLabel: formatDayLabel(session.completedAt ?? session.startedAt),
      metricValue: metric.value,
      metricUnit: metric.unit,
      category: getCategory(session.workoutId) ?? 'mixed',
    };
  });

/* -------------------------------------------------------------------------- */
/* Corpo                                                                       */
/* -------------------------------------------------------------------------- */

const BODY_FIELD_ORDER: Array<{ key: keyof BodyMeasurement; label: string; unit: string }> = [
  { key: 'heightCm', label: 'Altura', unit: 'cm' },
  { key: 'weightKg', label: 'Peso', unit: 'kg' },
  { key: 'waterPercent', label: 'Água', unit: '%' },
  { key: 'bodyFatPercent', label: 'Gordura', unit: '%' },
  { key: 'muscleMassKg', label: 'Massa muscular', unit: 'kg' },
];

/** Até 4 medidas realmente registradas na última avaliação. */
export const mapMeasurementToMetrics = (measurement: BodyMeasurement | undefined): MetricItem[] => {
  if (!measurement) return [];
  return BODY_FIELD_ORDER.flatMap((field) => {
    const raw = measurement[field.key];
    if (typeof raw !== 'number') return [];
    return [{ id: String(field.key), label: field.label, ...formatMetric(raw, field.unit, Number.isInteger(raw) ? 0 : 1) }];
  }).slice(0, 4);
};
