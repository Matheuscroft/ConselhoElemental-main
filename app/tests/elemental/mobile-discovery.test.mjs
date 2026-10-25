import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';
const { PageAtlas, filterAtlasRoutes } = loadComponent('src/components/elemental/PageAtlas.tsx');
const { ElementScoreExplorer } = loadComponent('src/components/elemental/ElementScoreExplorer.tsx');
const { RouteIcon, ArcaneIcon } = loadComponent('src/components/elemental/ArcaneIcon.tsx');
const { APP_ROUTES } = loadComponent('src/lib/app-routes.ts');
const render = (component, props) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(component, props)));

test('atlas search combines category and accent-insensitive words without losing destinations', () => {
  assert.deepEqual(filterAtlasRoutes(APP_ROUTES, '', null), APP_ROUTES);
  const result = filterAtlasRoutes(APP_ROUTES, 'historico', 'Treino');
  assert.ok(result.some(route => route.id === 'treinos-historico'));
  assert.ok(result.every(route => route.group === 'Treino'));
  assert.equal(filterAtlasRoutes(APP_ROUTES, 'historico', 'Núcleo').length, 0);
  assert.equal(filterAtlasRoutes(APP_ROUTES, 'nothing-matches-123', null).length, 0);
  const html = render(PageAtlas, { routes: APP_ROUTES, liveStatus: { ciclos: '3 hábitos hoje' } });
  for (const route of APP_ROUTES) assert.ok(html.includes(`href="${route.path}"`), route.id);
  assert.match(html, /3 hábitos hoje/);
  assert.match(html, /type="search"/);
  assert.equal((html.match(/<details/g) ?? []).length, 4);
});

test('every route has its own symbol; More is distinct from the Grimoire', () => {
  const paths = APP_ROUTES.map(route => render(RouteIcon, { routeId: route.id }).match(/<path d="([^"]+)"/)[1]);
  assert.equal(new Set(paths).size, APP_ROUTES.length);
  assert.notEqual(render(ArcaneIcon, { name: 'explorar' }), render(ArcaneIcon, { name: 'grimorio' }));
});

const area = { id: 'existing-id', elementId: 'ar', name: 'Estudos & prática', mergedSubareas: [{ id: 'child-id', name: 'Leitura' }] };
const props = { scores: ['terra', 'fogo', 'agua', 'ar'].map(elementId => ({ elementId, score: elementId === 'ar' ? 12.5 : 0 })), areas: [area], areaScores: new Map([['existing-id', 12.5]]), subareaScores: new Map([['child-id', 7.25]]), onSelectElement() {}, onSelectArea() {}, selectedElement: null, selectedAreaId: null };

test('score discovery displays existing fractional values and isolates collapsed controls', () => {
  const closed = render(ElementScoreExplorer, props);
  assert.equal((closed.match(/inert=""/g) ?? []).length, 4);
  assert.equal((closed.match(/aria-expanded="true"/g) ?? []).length, 0);
  assert.match(closed, /12,5/);
  assert.match(closed, /além do dia selecionado/);
  const open = render(ElementScoreExplorer, { ...props, selectedElement: 'ar', selectedAreaId: area.id });
  assert.equal((open.match(/inert=""/g) ?? []).length, 3);
  assert.equal((open.match(/aria-expanded="true"/g) ?? []).length, 2);
  assert.match(open, /Estudos &amp; prática/);
  assert.match(open, /7,25/);
  assert.doesNotMatch(open, /NaN|Infinity|100% concluído|fragmentos/);
  const ids = new Set([...open.matchAll(/ id="([^"]+)"/g)].map(match => match[1]));
  for (const match of open.matchAll(/aria-controls="([^"]+)"/g)) assert.ok(ids.has(match[1]), match[1]);
  assert.equal(props.areaScores.get(area.id), 12.5);
  assert.equal(props.subareaScores.get('child-id'), 7.25);
});
