import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';
const { CycleRoutineToolbar } = loadComponent('src/components/cycles/CycleRoutineToolbar.tsx');
const { CycleSubitemComposer } = loadComponent('src/components/cycles/CycleSubitemComposer.tsx');
const { CycleFilters } = loadComponent('src/components/cycles/CycleFilters.tsx');
const nodes = (element, type) => !React.isValidElement(element) ? [] : [...(element.type === type ? [element] : []), ...React.Children.toArray(element.props.children).flatMap(child => nodes(child, type))];
const props = { title: 'Ciclos de hoje', filters: { query: 'Água', element: 'terra', status: 'all' }, total: 13, completed: 4, shown: 1, order: 'ordered', onChange: () => {}, onOrder: () => {} };

test('routine status actions preserve the search and element, and never reorder or execute items', () => {
  const changes = [], orders = [];
  const tree = CycleRoutineToolbar({ ...props, onChange: value => changes.push(value), onOrder: value => orders.push(value) });
  const buttons = nodes(tree, 'button');
  assert.equal(buttons.length, 3);
  buttons[1].props.onClick(); buttons[2].props.onClick(); buttons[0].props.onClick();
  assert.deepEqual(changes, ['pending','completed','all'].map(status => ({ ...props.filters, status })));
  assert.deepEqual(orders, []);
  nodes(tree, 'select')[0].props.onChange({ target: { value: 'pending-first' } });
  assert.deepEqual(orders, ['pending-first']);
});

test('routine progress uses supplied day counts, independently of a narrower search', () => {
  const html = renderToStaticMarkup(React.createElement(CycleRoutineToolbar, props));
  assert.match(html, /4 de 13 itens concluídos/);
  assert.match(html, /aria-valuemax="13" aria-valuenow="4"/);
  assert.match(html, /Pendentes<span>9<\/span>/);
  assert.match(html, /1 de 13/);
  assert.equal((html.match(/<select/g) ?? []).length, 1); // no duplicate status picker
  const empty = renderToStaticMarkup(React.createElement(CycleRoutineToolbar, { ...props, total: 0, completed: 0, shown: 0 }));
  assert.doesNotMatch(empty, /NaN|Infinity/);
});

test('element and clear controls keep explicit filtering contracts', () => {
  const changes = [];
  const tree = CycleFilters({ filters: { ...props.filters, status: 'pending' }, onChange: next => changes.push(next), shown: 1, total: 13, showStatus: false });
  nodes(tree, 'button').find(item => item.props['aria-label'] === 'Filtrar por ar').props.onClick();
  assert.deepEqual(changes[0], { query: 'Água', element: 'ar', status: 'pending' });
  nodes(tree, 'button').at(-1).props.onClick();
  assert.deepEqual(changes[1], { query: '', element: 'all', status: 'all' });
});

test('subitem composer exposes labelled controls, explicit cancel and no writes on render', () => {
  let writes = 0;
  const composerProps = { name: '', points: 1, minutes: '', onName: () => writes++, onPoints: () => writes++, onMinutes: () => writes++, onAdd: () => writes++, onCancel: () => writes++ };
  const html = renderToStaticMarkup(React.createElement('div', null, React.createElement(CycleSubitemComposer, composerProps), React.createElement(CycleSubitemComposer, { ...composerProps, name: 'Ler' })));
  assert.equal(writes, 0);
  const ids = [...html.matchAll(/<input id="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, 6); assert.equal(new Set(ids).size, 6);
  for (const id of ids) assert.ok(html.includes(`for="${id}"`));
  assert.equal((html.match(/aria-label="Cancelar novo subitem"/g) ?? []).length, 2);
  assert.equal((html.match(/type="submit" disabled=""/g) ?? []).length, 1);
  assert.match(html, /Pontos previstos/); assert.match(html, /Minutos previstos/);
});

const { CycleExecutionActions } = loadComponent('src/components/cycles/CycleExecutionActions.tsx');
const { CycleSubitemsToggle } = loadComponent('src/components/cycles/CycleSubitemsToggle.tsx');

test('execution actions call only the explicitly selected command and stop propagation', () => {
  const calls = [];
  let stopped = 0;
  const commands = { name: 'Ler', completed: false, onStart: () => calls.push('start'), onComplete: () => calls.push('complete'), onUndo: () => calls.push('undo') };
  const pending = CycleExecutionActions(commands);
  assert.deepEqual(calls, []);
  const buttons = nodes(pending, 'button');
  assert.equal(buttons[0].props['aria-label'], 'Iniciar Ler');
  assert.equal(buttons[1].props['aria-label'], 'Concluir Ler');
  buttons[0].props.onClick({ stopPropagation: () => stopped++ });
  assert.deepEqual(calls, ['start']);
  buttons[1].props.onClick({ stopPropagation: () => stopped++ });
  assert.deepEqual(calls, ['start', 'complete']);
  const done = CycleExecutionActions({ ...commands, completed: true });
  const undo = nodes(done, 'button');
  assert.equal(undo.length, 1);
  assert.equal(undo[0].props['aria-label'], 'Desfazer conclusão de Ler');
  undo[0].props.onClick({ stopPropagation: () => stopped++ });
  assert.deepEqual(calls, ['start', 'complete', 'undo']);
  assert.equal(stopped, 3);
});

test('subitem disclosure describes supplied state and only toggles on request', () => {
  let toggles = 0;
  const config = { name: 'Água', expanded: false, completed: 1, total: 3, onToggle: () => toggles++ };
  const closed = CycleSubitemsToggle(config);
  assert.equal(toggles, 0);
  assert.equal(closed.props['aria-expanded'], false);
  assert.equal(closed.props['aria-label'], 'Mostrar subitens de Água, 1 de 3 concluídos');
  closed.props.onClick();
  assert.equal(toggles, 1);
  const html = renderToStaticMarkup(React.createElement(CycleSubitemsToggle, { ...config, expanded: true }));
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /Recolher subitens/);
  assert.doesNotMatch(renderToStaticMarkup(React.createElement(CycleSubitemsToggle, { ...config, completed: 0, total: 0 })), /NaN|Infinity/);
});

test('ordering lives inside the native disclosure without an extra status picker', () => {
  const html = renderToStaticMarkup(React.createElement(CycleRoutineToolbar, props));
  const details = html.slice(html.indexOf('<details'), html.indexOf('</details>'));
  assert.match(details, /Filtrar por elemento e organizar rotina/);
  assert.match(details, /<select/);
  assert.doesNotMatch(details, /<details[^>]* open/);
  assert.equal((html.match(/<select/g) ?? []).length, 1);
});
