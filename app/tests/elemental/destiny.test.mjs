import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';
const { destinyOptions, filterDestinyOptions, chooseDestiny, destinyRotation, localDay, parseDestinyDate } = loadComponent('src/components/destiny/destiny-options.ts');
const { DestinyWheel } = loadComponent('src/components/destiny/DestinyWheel.tsx');
const today = new Date(2026, 9, 24, 12);
const task = (id, extra = {}) => ({ id, title: `Tarefa ${id}`, elementId: 'fogo', plannedTimeMinutes: 15, isCompleted: false, ...extra });
const habit = (id, extra = {}) => ({ ...task(id), name: `Ciclo ${id}`, elementId: 'agua', completions: [], ...extra });

test('destiny contains all eligible real activities, without fake rewards, limits or writes', () => {
  const tasks = Array.from({ length: 20 }, (_, i) => task(String(i)));
  tasks.push(task('done', { isCompleted: true }), task('note', { semanticType: 'NOTE' }), task('text', { semanticType: 'text' }));
  const quests = [task('0', { status: 'active' }), task('closed', { status: 'completed' })];
  const before = JSON.stringify({ tasks, quests });
  const options = destinyOptions(tasks, quests, () => [habit('0')], today, 1);
  assert.equal(options.length, 22);
  assert.equal(new Set(options.map(item => item.key)).size, 22);
  assert.equal(JSON.stringify({ tasks, quests }), before);
  assert.equal(options.filter(item => item.kind === 'task').length, 20);
  assert.ok(options.every(item => !('reward' in item)));
  assert.match(options.find(item => item.kind === 'quest').href, /trilha=quest%3A0/);
});

test('recurrence comes from date selector, excludes completed occurrences and deduplicates the week', () => {
  const called = [];
  const completed = habit('daily', { completions: [{ completionDate: new Date(2026, 9, 24, 9).toISOString() }] });
  const selector = date => {
    called.push(localDay(date));
    return [completed, habit('note', { semanticType: 'text' }), ...(date.getDate() === 26 ? [habit('weekly')] : [])];
  };
  assert.equal(destinyOptions([], [], selector, today, 1).length, 0);
  called.length = 0;
  const options = destinyOptions([], [], selector, today, 7);
  assert.deepEqual(called, ['2026-10-24','2026-10-25','2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30']);
  assert.equal(options.length, 2);
  assert.match(options[0].href, /data=2026-10-25/);
  assert.match(options[1].href, /data=2026-10-26/);
});

test('filters, URL encoding and equal index intervals work with real identities', () => {
  const options = destinyOptions([task('a&b'),task('c', { elementId: 'terra' })], [], () => [habit('h')], today, 1);
  assert.deepEqual(filterDestinyOptions(options, 'task', 'fogo').map(item => item.id), ['a&b']);
  assert.equal(new URL(options[0].href, 'https://example.test').searchParams.get('atividade'), 'a&b');
  for (let i = 0; i < options.length; i++) {
    assert.equal(chooseDestiny(options, (i + .5) / options.length), options[i]);
  }
  assert.equal(chooseDestiny(options, 0), options[0]);
  assert.equal(chooseDestiny(options, .999999), options.at(-1));
  for (const random of [-.1, 1, NaN, Infinity]) assert.equal(chooseDestiny(options, random), null);
  assert.equal(chooseDestiny([], .5), null);
});

test('pointer aligns on the winning sector after repeated spins and changing catalogue sizes', () => {
  let previous = 0;
  for (const count of [8, 12, 3, 1, 7]) {
    for (let index = 0; index < count; index++) {
      const next = destinyRotation(previous, index, count);
      assert.ok(next - previous >= 1440 - 1e-8);
      const remainder = (next + (index + .5) * 360 / count) % 360;
      assert.ok(Math.min(remainder, 360 - remainder) < 1e-7);
      previous = next;
    }
  }
  assert.equal(destinyRotation(previous, 0, 0), previous);
});

test('date links validate calendar dates without converting local day to UTC', () => {
  for (const value of [null, '', '2026-02-30', '2026-13-01', '2026-10-24T12:00:00Z']) assert.equal(parseDestinyDate(value), null);
  for (const value of ['2026-10-24', '2028-02-29']) assert.equal(localDay(parseDestinyDate(value)), value);
  const date = parseDestinyDate('2026-10-24');
  assert.equal(date.getHours(), 0);
});

test('wheel handles zero, single, twelve and large catalogues without false sectors or invalid SVG', () => {
  for (const count of [0, 1, 12, 13]) {
    const options = destinyOptions(Array.from({ length: count }, (_, i) => task(String(i))), [], () => [], today, 1);
    const html = renderToStaticMarkup(React.createElement(DestinyWheel, { options, rotation: 0, spinning: false, reduced: true }));
    assert.doesNotMatch(html, /NaN|Infinity/);
    assert.equal(html.includes('destiny-pointer'), count > 0 && count <= 12);
    assert.equal((html.match(/<text /g) ?? []).length, count > 0 && count <= 12 ? count : 0);
    assert.match(html, /aria-hidden="true"/);
  }
});
