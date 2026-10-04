/**
 * Presentation-only aggregations over existing workout sessions.
 * No domain rules (XP, Terra, stamina) live here.
 */
import type { WorkoutSession } from '@/types/workout';

export interface DayBucket {
  /** yyyy-mm-dd in local time */
  key: string;
  date: Date;
  /** Single-letter weekday label */
  initial: string;
  /** Full weekday name */
  weekday: string;
  minutes: number;
  volume: number;
  workouts: number;
}

const WEEKDAY_INITIALS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const toLocalDayKey = (value: Date | string): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

export const isCompletedSession = (session: WorkoutSession): boolean => session.status === 'completed';

/** Last `days` calendar days ending today, oldest first. */
export const buildDayBuckets = (sessions: WorkoutSession[], days = 7, today = new Date()): DayBucket[] => {
  const buckets: DayBucket[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
    buckets.push({
      key: toLocalDayKey(date),
      date,
      initial: WEEKDAY_INITIALS[date.getDay()],
      weekday: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
      minutes: 0,
      volume: 0,
      workouts: 0,
    });
  }

  const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  sessions.filter(isCompletedSession).forEach((session) => {
    const bucket = byKey.get(toLocalDayKey(session.completedAt ?? session.startedAt));
    if (!bucket) return;
    bucket.minutes += session.durationSeconds / 60;
    bucket.volume += session.totalVolume;
    bucket.workouts += 1;
  });

  return buckets.map((bucket) => ({
    ...bucket,
    minutes: Math.round(bucket.minutes),
    volume: Math.round(bucket.volume),
  }));
};

export interface MonthGroup {
  key: string;
  label: string;
  sessions: WorkoutSession[];
}

/** Groups sessions by calendar month, most recent month first. */
export const groupSessionsByMonth = (sessions: WorkoutSession[]): MonthGroup[] => {
  const groups = new Map<string, MonthGroup>();
  [...sessions]
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    .forEach((session) => {
      const date = new Date(session.startedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = groups.get(key);
      if (existing) {
        existing.sessions.push(session);
        return;
      }
      groups.set(key, {
        key,
        label: date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        sessions: [session],
      });
    });
  return Array.from(groups.values());
};
