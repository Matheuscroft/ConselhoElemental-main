import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';
const { subitemKind, summarizeSubitems } = loadComponent('src/components/cycles/subitem-semantics.ts');
const { CycleSubitemIdentity } = loadComponent('src/components/cycles/CycleSubitemIdentity.tsx');
const { shouldCelebrateStreak, recordedCompletionWeek } = loadComponent('src/components/cycles/streak-presentation.ts');
const { CycleStreakBadge } = loadComponent('src/components/cycles/CycleStreakBadge.tsx');
const { CycleSubitemsToggle } = loadComponent('src/components/cycles/CycleSubitemsToggle.tsx');

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

test('identities distinguish action, checklist, group and note, retaining meaningful hierarchy', () => {
  const render = props => renderToStaticMarkup(React.createElement(CycleSubitemIdentity, { name: 'Garrafa 1 L', path: '1.2', childCount: 0, completed: false, ...props }));
  assert.match(render({ kind: 'valuable' }), /Ação/);
  assert.match(render({ kind: 'valuable', childCount: 2 }), /2 subitens nesta etapa/);
  assert.match(render({ kind: 'structural' }), /sem pontuação/);
  assert.match(render({ kind: 'text', completed: true }), /Referência para a execução/);
  assert.doesNotMatch(render({ kind: 'text', completed: true }), /is-completed|>Feito</);
  assert.match(render({ kind: 'valuable' }), /Posição 1.2/);
});

test('notes-only disclosure has no misleading zero-progress track', () => {
  const html = renderToStaticMarkup(React.createElement(CycleSubitemsToggle, { name: 'Ler', total: 0, completed: 0, notes: 2, expanded: false, onToggle() {} }));
  assert.match(html, /2 notas/);
  assert.doesNotMatch(html, /cycle-subitems-track|NaN|Infinity/);
});

test('streak celebration requires a confirmed increase in the same habit/account scope', () => {
  const before = { habitId: 'account-a:habit', value: 3, completionCount: 3 };
  assert.equal(shouldCelebrateStreak(before, { ...before }), false);
  assert.equal(shouldCelebrateStreak(before, { ...before, value: 4, completionCount: 4 }), true);
  assert.equal(shouldCelebrateStreak(before, { ...before, value: 2 }), false);
  assert.equal(shouldCelebrateStreak(before, { ...before, value: 8 }), false); // schedule change is not a completion
  assert.equal(shouldCelebrateStreak(before, { habitId: 'account-b:habit', value: 9, completionCount: 9 }), false);
  assert.equal(shouldCelebrateStreak(before, { ...before, value: NaN }), false);
  assert.equal(shouldCelebrateStreak({ habitId: 'a', value: 0, completionCount: 0 }, { habitId: 'a', value: 1, completionCount: 1 }), true);
});

test('completion week projects unique recorded local dates across month and year boundaries', () => {
  const completions = [{ completionDate: new Date(2025,11,31,23) }, { completionDate: new Date(2025,11,31,10) }, { completionDate: 'invalid' }, { completionDate: new Date(2026,0,2) }];
  const before = JSON.stringify(completions);
  const days = recordedCompletionWeek(new Date(2026,0,1), completions);
  assert.equal(days.length, 7);
  assert.equal(days.at(-1).date.getDate(), 1);
  assert.equal(days.at(-2).date.getDate(), 31);
  assert.equal(days.filter(day => day.completed).length, 1);
  assert.equal(JSON.stringify(completions), before);
  assert.deepEqual(recordedCompletionWeek(new Date('invalid'), completions), []);
});

test('constancy exposes recorded values, scope, source rule and an honest empty history', () => {
  const html = renderToStaticMarkup(React.createElement(CycleStreakBadge, { habitId: 'a', name: 'Ler', value: 2, record: 8, lastCompletedAt: null, referenceDate: new Date(2026,9,25), completions: [] }));
  assert.match(html, /Recorde registrado/);
  assert.match(html, /<dd>8<\/dd>/);
  assert.match(html, /Sem registro/);
  assert.match(html, /dias consecutivos do calendário/);
  assert.equal((html.match(/: sem registro/g) ?? []).length, 7);
  assert.doesNotMatch(html, /animation:|style="transform/);
});


test('scheduled badge projects existing receipts without changing stored values and explains rest days', () => {
  const completions = [19,21,23].map(day => ({ completionDate: new Date(2026,9,day,12) }));
  const props = { habitId: 'a', name: 'Ler', value: 1, record: 1, lastCompletedAt: completions[2].completionDate, referenceDate: new Date(2026,9,25), completions,
    schedule: { createdAt: new Date(2026,9,1), recurrenceType: 'WEEKLY', recurrenceConfig: { daysOfWeek: [1,3,5] } } };
  const before = JSON.stringify(props);
  const html = renderToStaticMarkup(React.createElement(CycleStreakBadge, props));
  assert.match(html, /Constância <strong>3/);
  assert.match(html, /Dias de descanso não quebram/);
  assert.equal(JSON.stringify(props), before);
  const rotation = renderToStaticMarkup(React.createElement(CycleStreakBadge, { ...props, rotates: true }));
  assert.match(rotation, /Constância <strong>1/);
  assert.match(rotation, /histórico de turnos ainda não está disponível/);
});
