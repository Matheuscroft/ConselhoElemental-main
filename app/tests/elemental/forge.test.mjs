import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

const { ForgeDraftCard } = loadComponent('src/components/forge/ForgeDraftCard.tsx');
const draft = Object.freeze({ id: 'draft-existing-id', title: 'Uma ideia <especial>', notes: 'Primeiro passo\nSegundo passo', createdAt: '2026-10-24T12:00:00Z' });
const noop = () => {};

test('forge card keeps complete notes in a native disclosure and exposes mobile actions', () => {
  const html = renderToStaticMarkup(React.createElement(ForgeDraftCard, { draft, onClassify: noop, onEdit: noop, onDelete: noop }));
  assert.match(html, /<details><summary>/);
  assert.ok(html.includes('Primeiro passo\nSegundo passo'));
  assert.match(html, /aria-label="Classificar Uma ideia &lt;especial&gt;"/);
  assert.match(html, /aria-label="Opções de Uma ideia &lt;especial&gt;"/);
  assert.ok(html.indexOf('forge-draft-actions') > html.indexOf('</details>'));
  assert.doesNotMatch(html, /opacity-0|group-hover/);
});

test('forge actions delegate the original draft identity without modifying the record', () => {
  const calls = [];
  const tree = ForgeDraftCard({ draft, onClassify: id => calls.push(['classify', id]), onEdit: id => calls.push(['edit', id]), onDelete: id => calls.push(['delete', id]) });
  const actions = tree.props.children[1].props.children;
  actions[0].props.onClick();
  const menuItems = actions[1].props.children[1].props.children;
  menuItems[0].props.onSelect();
  menuItems[1].props.onSelect();
  assert.deepEqual(calls, [['classify', draft.id], ['edit', draft.id], ['delete', draft.id]]);
  assert.equal(draft.notes, 'Primeiro passo\nSegundo passo');
});

test('forge handles missing notes and an invalid date without inventing content', () => {
  const html = renderToStaticMarkup(React.createElement(ForgeDraftCard, { draft: { ...draft, notes: '', createdAt: 'invalid' }, onClassify: noop, onEdit: noop, onDelete: noop }));
  assert.match(html, /Data não informada/);
  assert.match(html, /Sem anotações/);
  assert.match(html, /acrescentar detalhes em Editar ideia/);
  assert.doesNotMatch(html, /Invalid Date/);
});
