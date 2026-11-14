import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';

const { CycleSigil } = loadComponent('src/components/cycles/CycleSigil.tsx');
const { CycleRoutineToolbar } = loadComponent('src/components/cycles/CycleRoutineToolbar.tsx');
const render = (type, props) => renderToStaticMarkup(React.createElement(type, props));
const base = { title: 'Ciclos de hoje', filters: { query: '', element: 'all', status: 'all' }, total: 7, completed: 3, shown: 7, order: 'ordered', onChange() {}, onOrder() {} };
const els = ['fogo', 'agua', 'ar', 'terra'];
const selos = n => Array.from({ length: n }, (_, i) => ({ element: els[i % 4], done: i < 3 }));

test('CycleSigil draws four distinct decorative variants and toggles filled', () => {
  const htmls = els.map(element => render(CycleSigil, { element, size: 'card' }));
  assert.equal(new Set(htmls).size, 4);
  for (const h of htmls) assert.match(h, /aria-hidden="true"/);
  assert.match(htmls[0], /data-filled="false"/);
  assert.match(render(CycleSigil, { element: 'fogo', size: 'child', filled: true }), /data-filled="true"/);
  assert.match(render(CycleSigil, { element: 'fogo', size: 'trail' }), /width="10"/);
  assert.match(render(CycleSigil, { element: 'fogo', size: 'child' }), /width="20"/);
  assert.match(htmls[0], /width="26"/);
});

test('toolbar with selos renders the trail and a screen-reader progressbar', () => {
  const html = render(CycleRoutineToolbar, { ...base, selos: selos(7) });
  assert.equal((html.match(/<li /g) ?? []).length, 7);
  assert.match(html, /class="cycle-seal-trail" aria-hidden="true"/);
  assert.match(html, /class="sr-only" role="progressbar"[^>]*aria-valuemax="7" aria-valuenow="3"/);
  assert.doesNotMatch(html, /cycle-day-progress/);
  assert.match(html, /<span class="cycle-day-fraction" aria-hidden="true">3\/7<\/span>/);
});

test('toolbar with more than 14 selos renders the thread', () => {
  const html = render(CycleRoutineToolbar, { ...base, total: 15, completed: 3, selos: selos(15) });
  assert.match(html, /class="cycle-seal-thread"/);
  assert.match(html, /--cyc-feito:20%/);
  assert.doesNotMatch(html, /cycle-seal-trail/);
});

test('toolbar without selos keeps the progress bar', () => {
  const html = render(CycleRoutineToolbar, base);
  assert.match(html, /class="cycle-day-progress" role="progressbar"[^>]*aria-valuemax="7" aria-valuenow="3"/);
  assert.doesNotMatch(html, /cycle-seal/);
  assert.match(html, /3 de 7 itens concluídos/);
});
