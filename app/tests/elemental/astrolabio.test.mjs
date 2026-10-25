import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';
const { ElementReading, RecordedDaysTable } = loadComponent('src/components/astrolabio/AstrolabioReadings.tsx');

test('element readings preserve values and use the existing destination for all four elements', () => {
  for (const elementId of ['terra', 'fogo', 'agua', 'ar']) {
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ElementReading, { elementId, score: 12.5, percentage: 25 })));
    assert.match(html, /<details/);
    assert.ok(html.includes('12,5 pontos'));
    assert.ok(html.includes('25% do total elemental'));
    assert.ok(html.includes(`href="/santuario/elementos/${elementId}"`));
    assert.ok(html.includes(`/sanctuary/elements/${elementId}-v1.webp`));
    assert.doesNotMatch(html, /XP|fragmento|streak|Nível/);
  }
});

test('daily values remain available without chart interaction, including zero and negative recorded values', () => {
  const days = Object.freeze([Object.freeze({ stamp: new Date(2026, 9, 22).getTime(), points: 0 }), Object.freeze({ stamp: new Date(2026, 9, 23).getTime(), points: -2.5 })]);
  const html = renderToStaticMarkup(React.createElement(RecordedDaysTable, { days }));
  assert.match(html, /<caption>Pontuação registrada no período selecionado/);
  assert.match(html, /22\/10\/2026/);
  assert.match(html, /23\/10\/2026/);
  assert.match(html, /<td>0<\/td>/);
  assert.match(html, /<td>-2,5<\/td>/);
  assert.equal((html.match(/scope="row"/g) ?? []).length, 2);
  assert.match(html, /tabindex="0"/);
});

test('zero elemental participation does not present an invented target or minimum fill', () => {
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ElementReading, { elementId: 'terra', score: 0, percentage: 0 })));
  assert.match(html, /0 pontos/);
  assert.match(html, /width:0%/);
  assert.doesNotMatch(html, /Meta|50%/);
});
