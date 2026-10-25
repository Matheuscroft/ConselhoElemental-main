import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';
const { DomainCatalogue } = loadComponent('src/components/domains/DomainCatalogue.tsx');
const { readDomainFilters, domainFilterSearch, domainReturnHref } = loadComponent('src/components/domains/navigation.ts');
const areas = ['terra', 'fogo', 'agua', 'ar'].flatMap(elementId => [1, 2].map(n => ({ id: `${elementId}-${n}`, name: `Área ${elementId} ${n}`, elementId })));
const props = { areas, scores: [{ areaId: 'terra-1', score: 12.5, taskCount: 3 }], activeAreas: new Set(areas.map(a => a.id)), selectedElement: null, expanded: null, searching: false, returnSearch: '', onExpand() {}, onToggle() {} };
const render = extra => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(DomainCatalogue, { ...props, ...extra })));

test('catalogue groups every supplied area without presenting link mutations as navigation', () => {
  const html = render();
  assert.equal((html.match(/aria-expanded="false"/g) ?? []).length, 4);
  assert.equal((html.match(/hidden=""/g) ?? []).length, 4);
  assert.equal((html.match(/<li /g) ?? []).length, areas.length);
  assert.match(html, /Gerenciar vínculos/);
  assert.doesNotMatch(html, /aria-label="Desvincular/);
  for (const area of areas) assert.ok(html.includes(`href="/dominios/${area.id}"`));
  assert.match(html, /12,5 pts · 3 rituais/);
});

test('opening one group leaves others closed; searching or element selection reveals relevant rows', () => {
  const expanded = render({ expanded: 'agua' });
  assert.equal((expanded.match(/aria-expanded="true"/g) ?? []).length, 1);
  assert.equal((expanded.match(/hidden=""/g) ?? []).length, 3);
  const search = render({ searching: true, areas: areas.filter(a => a.name.includes('1')) });
  assert.doesNotMatch(search, /hidden=""/);
  assert.equal((search.match(/<li /g) ?? []).length, 4);
  const filtered = render({ selectedElement: 'ar', areas: areas.filter(a => a.elementId === 'ar') });
  assert.doesNotMatch(filtered, /hidden=""/);
  assert.equal((filtered.match(/<li /g) ?? []).length, 2);
  assert.match(render({ areas: [] }), /Nenhuma área corresponde/);
});

test('the opened group survives a safe catalogue return without accepting arbitrary group values', () => {
  const filters = { element: null, mode: 'active', query: '', expanded: 'fogo' };
  const query = domainFilterSearch(filters);
  assert.deepEqual(readDomainFilters(query), filters);
  assert.equal(domainReturnHref(query), '/dominios?grupo=fogo#domains-areas-heading');
  assert.equal(domainFilterSearch({ ...filters, expanded: null }), '');
  assert.deepEqual(readDomainFilters('grupo=https://example.com'), { element: null, mode: 'active', query: '' });
  assert.equal(domainReturnHref('grupo=https://example.com'), '/dominios#domains-areas-heading');
});
