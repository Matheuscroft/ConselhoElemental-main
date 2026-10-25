import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';
const { readDomainFilters, domainFilterSearch, domainReturnHref, focusDomainSection } = loadComponent('src/components/domains/navigation.ts');
const { DomainAreaNavigator } = loadComponent('src/components/domains/DomainNavigation.tsx');
const { DomainAreaCard } = loadComponent('src/components/domains/DomainPresentation.tsx');

test('domain filters round trip accents and preserve link status with safe defaults', () => {
  const filters = { element: 'agua', mode: 'inactive', query: 'Relações & família' };
  assert.deepEqual(readDomainFilters(domainFilterSearch(filters)), filters);
  assert.deepEqual(readDomainFilters('?elemento=unknown&vinculo=unknown'), { element: null, mode: 'active', query: '' });
  assert.equal(domainFilterSearch({ element: null, mode: 'active', query: '' }), '');
  assert.equal(domainReturnHref(domainFilterSearch(filters)), `/dominios?${domainFilterSearch(filters)}#domains-areas-heading`);
});

test('domain return destination always stays inside the catalogue and discards unknown fields', () => {
  for (const candidate of [undefined, {}, 'https://example.com', '?returnTo=https://example.com&elemento=ar', '//example.com']) {
    const path = domainReturnHref(candidate);
    assert.ok(path.startsWith('/dominios'));
    assert.ok(path.endsWith('#domains-areas-heading'));
    assert.ok(!path.includes('example.com'));
  }
});

const areas = [{ id: 'a', name: 'Primeira', elementId: 'terra' }, { id: 'b', name: 'Segunda', elementId: 'terra' }, { id: 'c', name: 'Outra', elementId: 'ar' }];
test('area switch includes all areas while previous and next stay in the current element', () => {
  for (const current of areas) {
    const tree = DomainAreaNavigator({ areas, current, returnSearch: 'q=estudo', onSelect: () => {} });
    const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, tree));
    assert.equal((html.match(/<option /g) ?? []).length, 3);
    assert.equal((html.match(/selected=""/g) ?? []).length, 1);
    if (current.id === 'a') { assert.match(html, /href="\/dominios\/b"/); assert.doesNotMatch(html, /href="\/dominios\/c"/); }
    if (current.id === 'c') assert.doesNotMatch(html, /href=/);
  }
  const selected = [];
  const tree = DomainAreaNavigator({ areas, current: areas[0], returnSearch: '', onSelect: id => selected.push(id) });
  tree.props.children[1].props.onChange({ target: { value: 'c' } });
  assert.deepEqual(selected, ['c']);
});

test('area card passes the exact catalogue context into router state', () => {
  const tree = DomainAreaCard({ area: { ...areas[0], isCustom: false }, score: 0, taskCount: 0, active: true, onToggle: () => {}, returnSearch: 'elemento=terra&vinculo=inactive&q=sono' });
  assert.deepEqual(tree.props.children[0].props.state, { domainsReturnSearch: 'elemento=terra&vinculo=inactive&q=sono' });
});

test('section shortcuts transfer focus and respect reduced motion; absent targets are harmless', () => {
  const priorDocument = globalThis.document, priorWindow = globalThis.window;
  const calls = [];
  try {
    globalThis.document = { getElementById: id => id === 'missing' ? null : { focus: options => calls.push(['focus', options]), scrollIntoView: options => calls.push(['scroll', options]) } };
    globalThis.window = { matchMedia: () => ({ matches: true }) };
    focusDomainSection('target');
    assert.deepEqual(calls, [['focus', { preventScroll: true }], ['scroll', { block: 'start', behavior: 'instant' }]]);
    focusDomainSection('missing'); assert.equal(calls.length, 2);
    globalThis.window.matchMedia = () => ({ matches: false });
    focusDomainSection('target'); assert.equal(calls[3][1].behavior, 'smooth');
  } finally {
    if (priorDocument === undefined) delete globalThis.document; else globalThis.document = priorDocument;
    if (priorWindow === undefined) delete globalThis.window; else globalThis.window = priorWindow;
  }
});
