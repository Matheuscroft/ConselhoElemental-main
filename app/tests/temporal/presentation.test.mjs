import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import React from 'react';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import ts from 'typescript';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = new URL('../../', import.meta.url).pathname;
const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const source = readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (id === 'three') return THREE;
    if (!id.startsWith('.')) return require(id);
    const target = resolve(dirname(path), id);
    const local = ['.ts', '.tsx'].map(ext => target + ext).find(existsSync);
    return load(local);
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}
const dir = 'src/components/temporal/celestial/';
const { lunarSnapshot, nextLunarQuarters, lunarLightDirection, lunarDiscPath } = load(dir + 'lunar-presentation.ts');
const { monthFromSearch, monthHref } = load(dir + 'month-navigation.ts');
const { seasonCycle } = load(dir + 'season-presentation.ts');
const { subscribeLiveClock } = load(dir + 'live-clock.ts');
const { SeasonExplorer } = load(dir + 'SeasonExplorer.tsx');
const { MonthShowcase } = load('src/components/temporal/MonthShowcase.tsx');
const { default: MoonScene } = load(dir + 'MoonScene.tsx');

// Execute the actual existing helpers, extracted without importing app storage or secrets.
const constants = readFileSync(resolve(root, 'src/constants/index.ts'), 'utf8');
const ast = ts.createSourceFile('constants.ts', constants, ts.ScriptTarget.Latest, true);
const helpers = ast.statements.filter(node => ts.isFunctionDeclaration(node) && ['getSeason', 'getHemisphereFromLatitude'].includes(node.name?.text)).map(node => node.getText(ast)).join('\n');
const legacy = ts.transpileModule(helpers, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const legacyModule = { exports: {} }; new Function('exports', legacy)(legacyModule.exports);
const { getSeason } = legacyModule.exports;

test('lunar primary phase times agree with USNO April/May 2024 to within two minutes', () => {
  // https://aa.usno.navy.mil/calculated/moon/phases?date=2024-4-08&format=p&nump=5&submit=Get+Data
  const expected = ['2024-04-08T18:21:00Z', '2024-04-15T19:13:00Z', '2024-04-23T23:49:00Z', '2024-05-01T11:27:00Z'];
  const events = nextLunarQuarters(new Date('2024-04-08T00:00:00Z'));
  events.forEach((event, i) => {
    assert.equal(event.quarter, i);
    assert.ok(Math.abs(event.at.getTime() - new Date(expected[i]).getTime()) < 120_000, event.at.toISOString());
  });
});

test('new, quarter and full snapshots have plausible light, distance and stable names', () => {
  const dates = ['2024-04-08T18:21:00Z', '2024-04-15T19:13:00Z', '2024-04-23T23:49:00Z', '2024-05-01T11:27:00Z'];
  const fractions = [0, .5, 1, .5];
  const names = ['Lua Nova', 'Quarto Crescente', 'Lua Cheia', 'Quarto Minguante'];
  dates.forEach((date, index) => {
    const snapshot = lunarSnapshot(new Date(date));
    assert.equal(snapshot.name, names[index]);
    assert.ok(Math.abs(snapshot.illuminated - fractions[index]) < .015);
    assert.ok(snapshot.distanceKm > 350_000 && snapshot.distanceKm < 410_000);
  });
  const a = lunarSnapshot(new Date('2026-10-22T12:00:00Z'));
  const b = lunarSnapshot(new Date('2026-10-22T13:00:00Z'));
  assert.notEqual(a.longitude, b.longitude);
  assert.deepEqual(a, lunarSnapshot(new Date('2026-10-22T12:00:00Z')));
});

test('render light illuminates the expected projected fraction and reverses sides while waning', () => {
  for (const angle of [0, 30, 60, 90, 120, 150, 180]) {
    const light = lunarLightDirection(angle, true);
    const waning = lunarLightDirection(angle, false);
    assert.ok(Math.abs(Math.hypot(...light) - 1) < 1e-12);
    assert.equal(light[0], -waning[0]); assert.equal(light[2], waning[2]);
    let illuminated = 0; let total = 0;
    for (let ix = 0; ix < 240; ix++) for (let iy = 0; iy < 240; iy++) {
      const x = (ix + .5) / 120 - 1; const y = (iy + .5) / 120 - 1;
      const radius = x*x + y*y; if (radius >= 1) continue;
      const z = Math.sqrt(1-radius); total++;
      if (x*light[0] + z*light[2] > 0) illuminated++;
    }
    assert.ok(Math.abs(illuminated/total - (1+Math.cos(angle*Math.PI/180))/2) < .003);
    assert.doesNotMatch(lunarDiscPath(angle), /NaN|Infinity/);
  }
});

test('the season cycle follows unchanged app boundaries in both hemispheres across year rollover', () => {
  for (const hemisphere of ['south', 'north']) for (const date of [new Date(2024, 1, 29, 23, 59), new Date(2024, 2, 20), new Date(2026, 11, 31, 23, 59)]) {
    const read = day => getSeason(day, { hemisphere });
    const windows = seasonCycle(date, read);
    assert.equal(windows.length, 4);
    assert.equal(new Set(windows.map(w => w.name)).size, 4);
    assert.equal(windows[0].name, read(date).name);
    assert.ok(windows[0].start <= date && date < windows[0].end);
    for (const window of windows) {
      assert.equal(read(window.start).name, window.name);
      assert.equal(read(new Date(window.end.getTime()-1)).name, window.name);
      assert.notEqual(read(window.end).name, window.name);
    }
  }
});

test('month deep links retain local months, leap years and invalid-input fallback', () => {
  const fallback = new Date(2026, 9, 22);
  for (const value of ['', '?mes=2024-00', '?mes=2024-13', '?mes=24-02', '?mes=0000-01', '?mes=2024-02-01']) assert.equal(monthFromSearch(value, fallback), fallback);
  const leap = monthFromSearch('?mes=2024-02', fallback);
  assert.equal(leap.getFullYear(), 2024); assert.equal(leap.getMonth(), 1); assert.equal(leap.getDate(), 1);
  assert.equal(monthHref(leap), '/temporal/mes?mes=2024-02');
  assert.equal(monthHref(new Date(2024, 12, 1)), '/temporal/mes?mes=2025-01');
});

test('live clock refreshes per minute and on return, skips hidden work and removes all subscriptions', () => {
  const doc = new EventTarget(); doc.hidden = false;
  const host = new EventTarget(); let interval; let cleared = 0; let count = 0;
  host.setInterval = (callback, delay) => { assert.equal(delay, 60_000); interval = callback; return 7; };
  host.clearInterval = (id) => { assert.equal(id, 7); cleared++; };
  const unsubscribe = subscribeLiveClock(() => count++, doc, host);
  interval(); assert.equal(count, 1);
  doc.hidden = true; interval(); host.dispatchEvent(new Event('focus')); assert.equal(count, 1);
  doc.hidden = false; doc.dispatchEvent(new Event('visibilitychange')); host.dispatchEvent(new Event('focus')); assert.equal(count, 3);
  unsubscribe(); assert.equal(cleared, 1);
  doc.dispatchEvent(new Event('visibilitychange')); host.dispatchEvent(new Event('focus')); assert.equal(count, 3);
});

const html = element => renderToStaticMarkup(React.createElement(MemoryRouter, null, element));
test('season cards expose four buttons, current chapter and only one expanded panel', () => {
  const seasons = seasonCycle(new Date(2026, 9, 22), date => getSeason(date, { hemisphere: 'south' }));
  const markup = html(React.createElement(SeasonExplorer, { seasons }));
  assert.equal((markup.match(/aria-expanded="true"/g) || []).length, 1);
  assert.equal((markup.match(/aria-controls=/g) || []).length, 4);
  assert.equal((markup.match(/ hidden=""/g) || []).length, 3);
  assert.match(markup, /Primavera/); assert.match(markup, /Agora/); assert.match(markup, /href="\/jornadas"/);
});

test('month showcase retains supplied metrics and exact destination without inventing completion percentage', () => {
  const markup = html(React.createElement(MonthShowcase, { date: new Date(2024, 1, 1), completed: 9, commitments: 12, score: 37.5, current: true }));
  for (const value of ['fevereiro', '9 concluídos', '37,5 pontos', '12 compromissos', 'Mês atual', '/temporal/mes?mes=2024-02']) assert.ok(markup.includes(value), value);
  assert.match(markup, /<details/); assert.match(markup, /<summary/);
  assert.doesNotMatch(markup, /% concluído|<progress|Recompensa/);
});

test('moon initial server markup has an explicit simplified fallback and accessible live data stays outside WebGL', () => {
  const markup = renderToStaticMarkup(React.createElement(MoonScene, { moon: lunarSnapshot(new Date('2026-10-22T12:00:00Z')), south: true }));
  assert.match(markup, /data-mode="simple"/); assert.match(markup, /Visualização simplificada/);
  assert.match(markup, /<svg/); assert.match(markup, /aria-hidden="true"/);
});
