import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';
const { DomainElementRail, DomainAreaCard, DomainShowcase, DomainElementPicker } = loadComponent('src/components/domains/DomainPresentation.tsx');
const area = Object.freeze({ id: 'existing-area-id', name: 'Estudo & prática', description: 'Descrição preservada', elementId: 'ar', color: '#abcdef', parentId: null, subareas: [], isCustom: true, isUserSelected: true });
const render = node => renderToStaticMarkup(React.createElement(MemoryRouter, null, node));

test('expanded rail keeps four native controls and exposes only the chosen description', () => {
  const counts = { terra: 8, fogo: 7, agua: 6, ar: 9 };
  for (const selected of [null, 'terra', 'fogo', 'agua', 'ar']) {
    const html = render(React.createElement(DomainElementRail, { selected, counts, onSelect: () => {} }));
    assert.equal((html.match(/<button/g) ?? []).length, 4);
    assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, selected ? 1 : 0);
    assert.equal((html.match(/hidden=""/g) ?? []).length, selected ? 3 : 4);
    assert.equal((html.match(/aria-controls=/g) ?? []).length, 4);
    assert.match(html, /Ar, 9 áreas/);
    assert.doesNotMatch(html, /tabindex="-1"/);
  }
});

test('area navigation and link mutation are separate controls using the original ID', () => {
  const calls = [];
  const props = { area, score: 12.5, taskCount: 3, active: true, onToggle: id => calls.push(id) };
  const html = render(React.createElement(DomainAreaCard, props));
  assert.match(html, /href="\/dominios\/existing-area-id"/);
  assert.match(html, /12,5/);
  assert.match(html, /aria-label="Desvincular Estudo &amp; prática"/);
  assert.ok(html.indexOf('</a>') < html.indexOf('<button'));
  assert.doesNotMatch(html, /role="button"/);
  const tree = DomainAreaCard(props);
  tree.props.children[2].props.children[1].props.onClick();
  assert.deepEqual(calls, [area.id]);
});

test('new area element picker has one native selection and preserves four domain identifiers', () => {
  for (const value of ['terra', 'fogo', 'agua', 'ar']) {
    const html = render(React.createElement(DomainElementPicker, { value, onChange: () => {} }));
    assert.equal((html.match(/type="radio"/g) ?? []).length, 4);
    assert.equal((html.match(/checked=""/g) ?? []).length, 1);
    assert.ok(html.includes(`checked="" value="${value}"`));
    assert.match(html, /<legend>Elemento da área/);
  }
});

test('showcase preserves supplied content and keeps collapsed details out of keyboard navigation', () => {
  const html = render(React.createElement(DomainShowcase, { area, taskCount: 3, habitCount: 2, subareaCount: 7 }));
  assert.match(html, /<h1>Estudo &amp; prática<\/h1>/);
  assert.match(html, /Descrição preservada/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /inert="" aria-hidden="true"/);
  assert.match(html, /<dd>3<\/dd>/);
  assert.match(html, /<dd>2<\/dd>/);
  assert.match(html, /<dd>7<\/dd>/);
  assert.doesNotMatch(html, /fragmentos|XP|100%/);
});
