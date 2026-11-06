import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';
const { subitemKind, summarizeSubitems } = loadComponent('src/components/cycles/subitem-semantics.ts');
const { CycleSubitemIdentity } = loadComponent('src/components/cycles/CycleSubitemIdentity.tsx');

test('canonical and legacy semantics map to identical UI execution roles without writing data', () => {
  for (const [semanticType, expected] of [['VALUABLE','valuable'],['VALUELESS','structural'],['NOTE','text'],['valuable','valuable'],['structural','structural'],['text','text'],[null,'valuable']]) {
    const item = Object.freeze({ semanticType });
    assert.equal(subitemKind(item), expected);
  }
  assert.equal(subitemKind({ executionType: 'NOTE' }), 'text');
  assert.equal(subitemKind({ semanticType: 'VALUABLE', executionType: 'NOTE' }), 'valuable');
});

test('notes never count as unfinished actions, while groups/checklists keep their supplied completion state', () => {
  const items = [{ semanticType: 'VALUABLE', done: true }, { semanticType: 'VALUELESS', done: false }, { semanticType: 'NOTE', done: false }, { semanticType: 'text', done: true }];
  const before = JSON.stringify(items);
  assert.deepEqual(summarizeSubitems(items, item => item.done), { actionableCount: 2, completedCount: 1, noteCount: 2 });
  assert.equal(JSON.stringify(items), before);
  assert.deepEqual(summarizeSubitems([], () => { throw Error('unexpected'); }), { actionableCount: 0, completedCount: 0, noteCount: 0 });
});

test('simplified identities retain accessible child disclosure and completion without redundant type labels', () => {
  const render = props => renderToStaticMarkup(React.createElement(CycleSubitemIdentity, { name: 'Garrafa 1 L', completed: false, ...props }));
  for (const kind of ['valuable','structural','text']) assert.doesNotMatch(render({ kind }), /Ação|Checklist|Nota|Etapa|Conclua quando realizar|Posição/);
  assert.match(render({ kind: 'valuable', onToggle() {}, expanded: true }), /aria-expanded="true"/);
  assert.match(render({ kind: 'valuable', onToggle() {} }), /Mostrar subitens de Garrafa 1 L/);
  assert.match(render({ kind: 'valuable', completed: true }), /is-completed|>Feito</);
  assert.doesNotMatch(render({ kind: 'text', completed: true }), /is-completed|>Feito</);
});
