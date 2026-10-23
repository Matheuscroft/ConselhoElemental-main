import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
const { matchesCycleFilters, hasCycleFilters } = loadComponent('src/components/cycles/cycle-discovery.ts');
const { CycleFilters } = loadComponent('src/components/cycles/CycleFilters.tsx');
const { CycleSequenceShowcase } = loadComponent('src/components/cycles/CycleSequenceShowcase.tsx');
const all = Object.freeze({ query: '', status: 'all', element: 'all' });
const entries = Object.freeze([
  Object.freeze({ id: 'routine-a', text: 'Meditação Respiração Conexões', element: 'agua', completed: false }),
  Object.freeze({ id: 'routine-b', text: 'Leitura Estudo da manhã', element: 'ar', completed: true }),
  Object.freeze({ id: 'sequence-a', text: 'Treino A Sequência Força Saúde', element: 'terra', completed: false }),
  Object.freeze({ id: 'sequence-empty', text: 'Sequência sem ciclo atual', completed: false }),
]);
const select = filters => entries.filter(entry => matchesCycleFilters(entry, filters));
const nodes = (tree, tag) => React.isValidElement(tree) ? [...(tree.type === tag ? [tree] : []), ...React.Children.toArray(tree.props.children).flatMap(child => nodes(child, tag))] : [];

test('accent-insensitive search accepts reordered terms and searches supplied sequence context', () => {
  assert.deepEqual(select({ ...all, query: '  CONEXOES medita  ' }).map(item => item.id), ['routine-a']);
  assert.deepEqual(select({ ...all, query: 'saude sequencia' }).map(item => item.id), ['sequence-a']);
  assert.equal(select({ ...all, query: '<script>' }).length, 0);
});
test('status and element filters combine without changing order, completion or source objects', () => {
  assert.deepEqual(select({ ...all, status: 'pending' }).map(item => item.id), ['routine-a', 'sequence-a', 'sequence-empty']);
  assert.deepEqual(select({ ...all, status: 'completed' }).map(item => item.id), ['routine-b']);
  assert.deepEqual(select({ ...all, element: 'terra', status: 'pending' }).map(item => item.id), ['sequence-a']);
  assert.equal(select({ ...all, element: 'terra', status: 'completed' }).length, 0);
  assert.deepEqual(select(all), entries);
  select(all).forEach((item, index) => assert.equal(item, entries[index]));
});
test('empty query permits an unclassified sequence, explicit element selection does not infer its type', () => {
  const empty = entries[3];
  assert.equal(matchesCycleFilters(empty, all), true);
  assert.equal(matchesCycleFilters(empty, { ...all, element: 'ar' }), false);
  assert.equal(hasCycleFilters({ ...all, query: '   ' }), false);
  assert.equal(hasCycleFilters({ ...all, status: 'pending' }), true);
});
test('filter controls update only their field and clear restores the complete view', () => {
  const changes = [];
  const filters = Object.freeze({ query: 'teste', element: 'agua', status: 'completed' });
  const tree = CycleFilters({ filters, shown: 2, total: 9, onChange: value => changes.push(value) });
  nodes(tree, 'input')[0].props.onChange({ target: { value: 'novo' } });
  assert.deepEqual(changes.pop(), { ...filters, query: 'novo' });
  nodes(tree, 'select')[0].props.onChange({ target: { value: 'pending' } });
  assert.deepEqual(changes.pop(), { ...filters, status: 'pending' });
  const buttons = nodes(tree, 'button');
  buttons[1].props.onClick();
  assert.deepEqual(changes.pop(), { ...filters, element: 'terra' });
  buttons.at(-1).props.onClick();
  assert.deepEqual(changes.pop(), all);
  const markup = renderToStaticMarkup(tree);
  assert.match(markup, /2 de 9 itens do dia/);
  assert.equal((markup.match(/aria-pressed="true"/g) || []).length, 1);
});
test('sequence showcase preserves the supplied order, current member, paused state and explicit detail action', () => {
  let opened = 0;
  const props = { name: 'Estudo <semanal>', description: 'Descrição real', active: false, members: [{ id: 'b', name: 'Revisão' }, { id: 'a', name: 'Prática', current: true }], onOpen: () => opened++ };
  const tree = CycleSequenceShowcase(props);
  const markup = renderToStaticMarkup(tree);
  assert.match(markup, /Sequência pausada/); assert.match(markup, /Estudo &lt;semanal&gt;/);
  assert.match(markup, /aria-current="step"/); assert.match(markup, /Na vez: Prática/);
  const items = nodes(tree, 'li');
  assert.match(renderToStaticMarkup(items[0]), /Revisão/); assert.match(renderToStaticMarkup(items[1]), /Prática/);
  assert.equal(opened, 0); nodes(tree, 'button')[0].props.onClick(); assert.equal(opened, 1);
});
test('empty sequence gives guidance without fabricating progress or an action when none is supplied', () => {
  const markup = renderToStaticMarkup(React.createElement(CycleSequenceShowcase, { name: 'Sem membros', active: true, members: [] }));
  assert.match(markup, /Adicione ciclos/); assert.match(markup, /Sem ciclo atual/);
  assert.doesNotMatch(markup, /<button|NaN|undefined|%|aria-current/);
});
