import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
const { CycleCreationForm, CycleWeekdays } = loadComponent('src/components/cycles/CycleCreationForm.tsx');
const nodes = (tree, tag) => React.isValidElement(tree) ? [...(tree.type === tag ? [tree] : []), ...React.Children.toArray(tree.props.children).flatMap(child => nodes(child, tag))] : [];
const base = { kind: 'cycle', name: 'Leitura', days: [1, 3, 5], startLabel: '22/10/2026', onNameChange() {}, onToggleDay() {}, onSubmit() {}, onCancel() {} };

test('composer submits through the existing callback once and does not submit whitespace', () => {
  let submitted = 0, prevented = 0;
  const submit = () => submitted++;
  CycleCreationForm({ ...base, onSubmit: submit }).props.onSubmit({ preventDefault: () => prevented++ });
  CycleCreationForm({ ...base, name: '  ', onSubmit: submit }).props.onSubmit({ preventDefault: () => prevented++ });
  assert.equal(submitted, 1); assert.equal(prevented, 2);
});
test('typing and cancel dispatch independent operations without saving', () => {
  const values = []; let cancelled = 0;
  const tree = CycleCreationForm({ ...base, onNameChange: value => values.push(value), onCancel: () => cancelled++ });
  nodes(tree, 'input')[0].props.onChange({ target: { value: 'Meditação' } });
  nodes(tree, 'button').find(node => node.props.type === 'button').props.onClick();
  assert.deepEqual(values, ['Meditação']); assert.equal(cancelled, 1);
  assert.equal(base.name, 'Leitura');
});
test('weekdays expose selected state, protect the last day and dispatch exact weekday', () => {
  const changes = [];
  const days = Object.freeze([2]);
  const tree = CycleWeekdays({ days, onToggle: day => changes.push(day) });
  const buttons = nodes(tree, 'button');
  assert.equal(buttons.length, 7);
  assert.equal(buttons[2].props.disabled, true);
  assert.equal(buttons[2].props['aria-pressed'], true);
  buttons[5].props.onClick();
  assert.deepEqual(changes, [5]); assert.deepEqual(days, [2]);
});
test('sequence composer renders its restriction control, real name and start date', () => {
  const html = renderToStaticMarkup(React.createElement(CycleCreationForm, { ...base, kind: 'sequence', name: 'Manhã <calma>' }, React.createElement('select', { 'aria-label': 'Tipo' }, React.createElement('option', null, 'Geral'))));
  assert.match(html, /Manhã &lt;calma&gt;/);
  assert.match(html, /22\/10\/2026/);
  assert.match(html, /aria-label="Tipo"/);
  assert.match(html, /Criar sequência/);
  assert.doesNotMatch(html, /XP|Prana|100%/);
});
