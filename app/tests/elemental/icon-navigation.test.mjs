import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';

const { ArcaneIcon, ElementIcon, RouteIcon } = loadComponent('src/components/elemental/ArcaneIcon.tsx');
const { NavigationGroup, RouteShowcase } = loadComponent('src/components/elemental/NavigationCards.tsx');
const { ExpandedElements } = loadComponent('src/components/elemental/ExpandedElements.tsx');
const { APP_ROUTES } = loadComponent('src/lib/app-routes.ts');
const html = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('element marks preserve distinct meaning, optional names and decorative defaults', () => {
  const paths = new Set();
  for (const element of ['terra', 'fogo', 'agua', 'ar']) {
    const markup = html(ElementIcon, { element, label: element });
    assert.match(markup, /role="img"/);
    assert.ok(markup.includes(`aria-label="${element}"`));
    assert.doesNotMatch(markup, /aria-hidden="true"|\p{Extended_Pictographic}/u);
    paths.add(markup.match(/<path d="([^"]+)"/)[1]);
  }
  assert.equal(paths.size, 4);
  assert.match(html(ArcaneIcon, { name: 'conquista' }), /aria-hidden="true"/);
  assert.match(html(ArcaneIcon, { name: 'ritual', label: '<teste>' }), /aria-label="&lt;teste&gt;"/);
});

test('all registered routes retain a real destination and matching accessible action in showcase', () => {
  for (const route of APP_ROUTES) {
    const markup = renderToStaticMarkup(React.createElement(MemoryRouter, {}, React.createElement(RouteShowcase, { route, status: route.id === 'rituais' ? '3 concluídos hoje' : undefined })));
    assert.ok(markup.includes(`href="${route.path}"`), route.id);
    assert.ok(markup.includes(`aria-label="Abrir ${route.label}"`), route.id);
    assert.equal((markup.match(/<a /g) || []).length, 1);
    assert.ok(markup.includes(route.description));
    assert.doesNotMatch(markup, /undefined|NaN|% concluído/);
    const icon = html(RouteIcon, { routeId: route.id });
    assert.match(icon, /<path d="[^\"]+"/);
    if (route.id !== 'santuario') assert.notEqual(icon, html(RouteIcon, { routeId: 'santuario' }), route.id);
    if (route.id === 'rituais') assert.match(markup, /3 concluídos hoje/);
  }
});

test('search reveals every group, while normal browsing can start with one open group', () => {
  const groups = ['Núcleo', 'Tempo e ciclos', 'Treino', 'Domínios'];
  for (const group of groups) {
    const props = { group, count: APP_ROUTES.filter((route) => route.group === group).length, children: 'Destinos reais' };
    assert.match(html(NavigationGroup, { ...props, reveal: true }), /<details[^>]* open=""/);
    const collapsed = html(NavigationGroup, props);
    assert.doesNotMatch(collapsed, / open=""/);
    assert.match(collapsed, /<summary>/);
    assert.match(collapsed, /Destinos reais/);
  }
});

test('two elemental rails have unique panel references and independently expanded panels', () => {
  const elements = ['terra', 'fogo', 'agua', 'ar'].map(id => ({ id, name: id, description: 'Descrição', scoreLabel: 'Dados existentes' }));
  const markup = renderToStaticMarkup(React.createElement(React.Fragment, {}, ...[1, 2].map(key => React.createElement(ExpandedElements, { key, elements, onExplore() {} }))));
  const ids = [...markup.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
  const controls = [...markup.matchAll(/aria-controls="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 8); assert.equal(new Set(ids).size, 8);
  assert.deepEqual(new Set(controls), new Set(ids));
  assert.equal((markup.match(/aria-expanded="true"/g) || []).length, 2);
});
