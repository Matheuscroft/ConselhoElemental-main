import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

const { InvocationChoices, InvocationProgress, INVOCATION_TYPES } = loadComponent('src/components/invocation/InvocationChoices.tsx');

test('invocation choices preserve all five entity identities with a single native selection', () => {
  assert.deepEqual(INVOCATION_TYPES.map(type => type.id), ['ACTION', 'HABIT', 'QUEST', 'PROJECT', 'DRAFT']);
  for (const choice of INVOCATION_TYPES) {
    const html = renderToStaticMarkup(React.createElement(InvocationChoices, { value: choice.id, onChange: () => {} }));
    assert.equal((html.match(/type="radio"/g) ?? []).length, 5);
    assert.equal((html.match(/checked=""/g) ?? []).length, 1);
    assert.match(html, new RegExp(`checked="" value="${choice.id}"`));
    assert.match(html, /<legend[^>]*>O que deseja invocar\?/);
    assert.doesNotMatch(html, /\+1.2 pts|\+5 pts|📜|🔄|🗺️|🏗️|📝/);
  }
});

test('selecting an invocation delegates only the selected type and does not create an entity', () => {
  const selected = [];
  const tree = InvocationChoices({ value: 'ACTION', onChange: value => selected.push(value) });
  const labels = tree.props.children[1];
  for (const label of labels) label.props.children[0].props.onChange();
  assert.deepEqual(selected, ['ACTION', 'HABIT', 'QUEST', 'PROJECT', 'DRAFT']);
});

test('invocation progress identifies the current step without inaccessible fake navigation', () => {
  for (const step of [1, 2, 3]) {
    const html = renderToStaticMarkup(React.createElement(InvocationProgress, { step }));
    assert.equal((html.match(/aria-current="step"/g) ?? []).length, 1);
    assert.equal((html.match(/data-complete="true"/g) ?? []).length, step - 1);
    for (const label of ['Escolher', 'Dar forma', 'Revisar']) assert.ok(html.includes(label));
    assert.doesNotMatch(html, /<button|<a /);
  }
});
