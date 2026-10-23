import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from '../elemental/load-component.mjs';
const { ResourceMeter } = loadComponent('src/components/grimorio/ResourceMeter.tsx');
const { GrimoireHistory } = loadComponent('src/components/grimorio/GrimoireHistory.tsx');
const { ElementMasteryCard } = loadComponent('src/components/grimorio/ElementMasteryCard.tsx');
const render = (component, props) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(component, props)));
const meter = { label: 'Prana', value: 25.5, maximum: 100, color: '125 207 229', icon: null };

test('resource meter exposes accurate accessible values and proportional fill', () => {
  const html = render(ResourceMeter, meter);
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-label="Prana"/);
  assert.match(html, /aria-valuenow="25.5"/);
  assert.match(html, /aria-valuetext="25,5 de 100"/);
  assert.match(html, /width:25.5%/);
});
test('out-of-range fill is bounded without changing supplied values; invalid values stay unknown', () => {
  const large = render(ResourceMeter, { ...meter, value: 120 });
  assert.match(large, /width:100%/); assert.match(large, /aria-valuenow="100"/); assert.match(large, /120 de 100/);
  const negative = render(ResourceMeter, { ...meter, value: -5 });
  assert.match(negative, /width:0%/); assert.match(negative, /-5 de 100/);
  const invalid = render(ResourceMeter, { ...meter, maximum: 0 });
  assert.doesNotMatch(invalid, /aria-valuenow=/); assert.match(invalid, /Sem valor disponível/);
});
const now = new Date(2026, 9, 22);
test('empty history provides a real next action and hides unnecessary filters', () => {
  const html = render(GrimoireHistory, { entries: [], now });
  assert.match(html, /href="\/rituais"/);
  assert.match(html, /Sua história começa/);
  assert.doesNotMatch(html, /type="search"|<select/);
});
test('history limits initial records, offers more and escapes content with clear missing-value labels', () => {
  const entries = Array.from({ length: 25 }, (_, i) => ({ id: String(i), title: `<script>${i}</script>`, kind: 'ciclo', date: null, minutes: null, points: null, completed: false }));
  const html = render(GrimoireHistory, { entries, now });
  assert.equal((html.match(/<li>/g) ?? []).length, 20);
  assert.match(html, /Mostrar mais registros/);
  assert.match(html, /25 registros encontrados/);
  assert.match(html, /&lt;script&gt;0&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /Data não registrada/); assert.match(html, /Pontuação não registrada/); assert.match(html, /Execução parcial/);
});

test('element showcases expose real mastery and scores through native details and a working route', () => {
  const html = render(ElementMasteryCard, {
    element: { id: 'agua', name: 'Água', domain: 'Conexões & Emoções', description: 'Relacionamentos' },
    mastery: { level: 2, title: 'Iniciado', xpTotal: 130, xpAtLevelStart: 100, xpToNextLevel: 220, progressFraction: 30 / 220 },
    score: { elementId: 'agua', score: 35, percentage: 40 }, hasScores: true,
  });
  assert.match(html, /<details/); assert.match(html, /<summary>/);
  assert.match(html, /Nível 2/); assert.match(html, /130 XP acumulados/);
  assert.match(html, /aria-valuenow="30"/); assert.match(html, /35 pts/); assert.match(html, /40%/);
  assert.match(html, /href="\/santuario\/elementos\/agua"/);
});
test('zero-score elements do not suggest earned balance from the getter default of 25 percent', () => {
  const html = render(ElementMasteryCard, {
    element: { id: 'terra', name: 'Terra', domain: 'Corpo', description: 'Estrutura' },
    mastery: { level: 1, title: 'Iniciado', xpTotal: 0, xpAtLevelStart: 0, xpToNextLevel: 100, progressFraction: 0 },
    score: { elementId: 'terra', score: 0, percentage: 25 }, hasScores: false,
  });
  assert.match(html, /Sem pontuação/); assert.doesNotMatch(html, /25%/);
});
