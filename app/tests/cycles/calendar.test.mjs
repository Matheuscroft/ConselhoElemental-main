import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
const { ExpandedDayCard } = loadComponent('src/components/cycles/ExpandedDayCard.tsx');
const date = new Date(2026, 11, 31);
const props = { date, selected: true, today: false, completed: 2, total: 5, onSelect: () => {} };

test('calendar selection preserves the date, invokes supplied action and exposes the full date', () => {
  let calls = 0;
  const stamp = date.getTime();
  const tree = ExpandedDayCard({ ...props, onSelect: () => calls++ });
  assert.equal(tree.type, 'button');
  assert.equal(tree.props.type, 'button');
  assert.equal(tree.props['aria-pressed'], true);
  assert.match(tree.props['aria-label'], /31 de dezembro de 2026/);
  tree.props.onClick();
  assert.equal(calls, 1);
  assert.equal(date.getTime(), stamp);
  const html = renderToStaticMarkup(tree);
  assert.match(html, /2\/5 ciclos/);
});

test('today and selection are independent; collapsed dates never display the selected day totals', () => {
  const tree = ExpandedDayCard({ ...props, selected: false, today: true });
  assert.equal(tree.props['aria-current'], 'date');
  assert.equal(tree.props['aria-pressed'], false);
  assert.match(tree.props['aria-label'], /hoje/);
  const html = renderToStaticMarkup(tree);
  assert.doesNotMatch(html, /2\/5 ciclos/);
  assert.doesNotMatch(html, /Seu dia em foco/);
  const tomorrow = ExpandedDayCard({ ...props, date: new Date(2027, 0, 1) });
  assert.match(tomorrow.props['aria-label'], /1 de janeiro de 2027/);
});

test('empty and completed days present supplied state without invented rewards or percentages', () => {
  const empty = renderToStaticMarkup(React.createElement(ExpandedDayCard, { ...props, total: 0, completed: 0 }));
  assert.match(empty, /Sem ciclos/);
  assert.doesNotMatch(empty, /NaN|Infinity|100%|XP/);
  const done = renderToStaticMarkup(React.createElement(ExpandedDayCard, { ...props, completed: 5 }));
  assert.match(done, /5\/5 ciclos/);
});

test('expanded date exposes the actual routine preview only when selected', () => {
  const preview = ['Ler', 'Caminhar'];
  const tree = ExpandedDayCard({ ...props, preview });
  assert.equal(tree.props['aria-expanded'], true);
  const html = renderToStaticMarkup(tree);
  assert.match(html, /Ler/); assert.match(html, /Caminhar/);
  assert.match(html, new RegExp(`id="${tree.props['aria-controls']}"`));
  const collapsed = renderToStaticMarkup(React.createElement(ExpandedDayCard, { ...props, selected: false, preview }));
  assert.doesNotMatch(collapsed, /Ler|Caminhar/);
});

test('selecting a visible date keeps the window fixed so expansion can occur in place', async () => {
  const { readFile } = await import('node:fs/promises');
  const { default: ts } = await import('typescript');
  const source = await readFile(new URL('../../src/pages/Ciclos.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('Ciclos.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'selectRelativeVisibleDay') initializer = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  assert.ok(initializer);
  const js = ts.transpileModule(`const select = ${initializer};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  const center = new Date(2026, 11, 31); let selected; let recentered = false;
  const select = new Function('visibleDaysCenterDate', 'normalizeDate', 'setSelectedDate', 'setVisibleDaysCenterDate', `${js}; return select;`)(center, d => new Date(d.getFullYear(), d.getMonth(), d.getDate()), d => { selected = d; }, () => { recentered = true; });
  select(1);
  assert.equal(selected.getFullYear(), 2027); assert.equal(selected.getMonth(), 0); assert.equal(selected.getDate(), 1);
  assert.equal(recentered, false); assert.equal(center.getDate(), 31);
});
