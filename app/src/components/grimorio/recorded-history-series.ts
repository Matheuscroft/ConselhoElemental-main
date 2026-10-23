import type { GrimoireEntry } from './history';

/** Read-only chart: recorded points by local day; never estimates historical elemental splits. */
export function recordedHistorySeries(entries: GrimoireEntry[], count: number, now: Date) {
  const days = Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - count + index + 1);
    return { stamp: date.getTime(), date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }), points: 0 };
  });
  const byDay = new Map(days.map(day => [day.stamp, day]));
  let recordedCount = 0;
  for (const entry of entries) {
    if (!entry.date || entry.points === null || !Number.isFinite(entry.points)) continue;
    const date = entry.date;
    const bucket = byDay.get(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime());
    if (!bucket || date > now) continue;
    bucket.points += entry.points;
    recordedCount++;
  }
  return { days, recordedCount };
}
