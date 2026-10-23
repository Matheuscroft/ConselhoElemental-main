import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';
const { recordedHistorySeries } = loadComponent('src/components/grimorio/recorded-history-series.ts');
test('chart includes only recorded, dated values in local period and leaves the source intact', () => {
  const now = new Date(2026, 9, 23, 18);
  const entries = [{ date: new Date(2026, 9, 23, 10), points: 2.5 }, { date: new Date(2026, 9, 23, 11), points: 0.5 }, { date: new Date(2026, 9, 22, 10), points: 0 }, { date: null, points: 50 }, { date: now, points: null }, { date: new Date(2026, 9, 24), points: 20 }, { date: new Date(2026, 8, 1), points: 12 }];
  const before = JSON.stringify(entries);
  const result = recordedHistorySeries(entries, 7, now);
  assert.equal(result.recordedCount, 3); assert.equal(result.days.length, 7);
  assert.equal(result.days.at(-1).points, 3); assert.equal(result.days.reduce((sum, d) => sum + d.points, 0), 3);
  assert.equal(JSON.stringify(entries), before);
});
test('empty history stays empty; leap-day/year boundaries use calendar dates', () => {
  const result = recordedHistorySeries([], 7, new Date(2024, 2, 1, 12));
  assert.equal(result.recordedCount, 0); assert.equal(result.days.at(-2).stamp, new Date(2024, 1, 29).getTime());
  assert.ok(result.days.every(day => day.points === 0));
  const year = recordedHistorySeries([], 7, new Date(2026, 0, 1));
  assert.equal(year.days.at(-2).stamp, new Date(2025, 11, 31).getTime());
});
