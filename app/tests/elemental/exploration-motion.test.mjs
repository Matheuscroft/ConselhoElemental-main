import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, createMemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';

const { RevealPanel } = loadComponent('src/components/motion/RevealPanel.tsx');
const { NavigationGroup } = loadComponent('src/components/elemental/NavigationCards.tsx');
const { PageAtlas } = loadComponent('src/components/elemental/PageAtlas.tsx');
const { APP_ROUTES } = loadComponent('src/lib/app-routes.ts');
const { readAtlasFilters, updateAtlasFilters } = loadComponent('src/components/elemental/atlas-navigation.ts');
const render = (node, location = '/mapa') => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [location] }, node));

test('disclosure preserves content and excludes closed controls from focus and assistive navigation', () => {
  for (const open of [false, true]) {
    const markup = render(React.createElement(RevealPanel, { id: 'existing-panel', open }, React.createElement('button', null, 'Ação existente')));
    assert.match(markup, /id="existing-panel"/);
    assert.match(markup, /Ação existente/);
    assert.equal(markup.includes('inert=""'), !open);
    assert.equal(markup.includes('aria-hidden="true"'), !open);
  }
});

test('navigation groups reveal searchable results without a nonfunctional collapse control', () => {
  const props = { group: 'Treino', count: 2, children: React.createElement('a', { href: '/treinos' }, 'Treinos') };
  const closed = render(React.createElement(NavigationGroup, props));
  assert.match(closed, /<button[^>]*aria-expanded="false"/);
  const id = closed.match(/aria-controls="([^"]+)"/)[1];
  assert.ok(closed.includes(`id="${id}"`));
  const search = render(React.createElement(NavigationGroup, { ...props, reveal: true }));
  assert.match(search, /<h3 class="elemental-nav-trigger"/);
  assert.doesNotMatch(search, /aria-expanded|inert=""|<button/);
  assert.match(search, /href="\/treinos"/);
  const opened = render(React.createElement(NavigationGroup, { ...props, initiallyOpen: true }));
  assert.match(opened, /aria-expanded="true"/);
  assert.doesNotMatch(opened, /inert=""/);
});

test('atlas filters round trip accents and spaces, discard invalid categories and retain unrelated params', () => {
  const search = updateAtlasFilters('?origem=menu', { query: 'Saúde e rotina ', group: 'Tempo e ciclos' });
  assert.deepEqual(readAtlasFilters(search.toString()), { query: 'Saúde e rotina ', group: 'Tempo e ciclos' });
  assert.equal(search.get('origem'), 'menu');
  assert.equal(updateAtlasFilters(search.toString(), { query: '', group: null }).toString(), 'origem=menu');
  assert.deepEqual(readAtlasFilters('?categoria=https://example.com&busca=água'), { group: null, query: 'água' });
});

test('atlas restores filtered destinations from a history return', async () => {
  const location = '/mapa?categoria=Treino&busca=historico';
  const router = createMemoryRouter([{ path: '*' }], { initialEntries: [location] });
  try {
    await router.navigate('/treinos');
    await router.navigate(-1);
    const returned = router.state.location.pathname + router.state.location.search;
    assert.equal(returned, location);
    const markup = render(React.createElement(PageAtlas, { routes: APP_ROUTES, liveStatus: {} }), returned);
    assert.match(markup, /value="historico"/);
    assert.ok(markup.includes('href="/treinos/historico"'));
    assert.doesNotMatch(markup, /href="\/santuario"|inert=""/);
  } finally { router.dispose(); }
});
