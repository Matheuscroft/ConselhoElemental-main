import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
const { describeQuestMilestone } = loadComponent('src/components/quests/quest-milestone.ts');
const { QuestCompletionBody } = loadComponent('src/components/quests/QuestCompletionBody.tsx');
const { Dialog } = loadComponent('src/components/ui/dialog.tsx');
const step = { id: 'a', key: 'task:a', kind: 'task', available: true, completed: false };
const before = { key: 'quest:q', title: 'Aprender desenho', done: 0, total: 1, steps: [step, { id: 'habit', kind: 'habit' }] };
const after = { ...before, done: 1, steps: [{ ...step, completed: true }, { id: 'habit', kind: 'habit' }] };
const receipt = { title: 'Praticar desenho', xp: 2, points: 1, minutes: 3, milestone: describeQuestMilestone(before, after, 'a', 1, 2) };

test('milestone presents actual task completion and level delta without completing recurring cycles', () => {
  assert.deepEqual(receipt.milestone, { trail: { key: 'quest:q', title: 'Aprender desenho', done: 1, total: 1, allRitualsDone: true, recurring: 1 }, level: { from: 1, to: 2 } });
  assert.equal(before.done, 0);
  assert.equal(before.steps[0].completed, false);
  assert.equal(after.steps[1].completed, undefined);
});

test('revisits, stale trails, missing tasks and empty or changed totals cannot manufacture a final milestone', () => {
  for (const [initial, final, id] of [[after, after, 'a'], [before, { ...after, key: 'quest:other' }, 'a'], [before, after, 'other'], [undefined, after, 'a']]) {
    assert.equal(describeQuestMilestone(initial, final, id, 2, 2).trail, null);
  }
  assert.equal(describeQuestMilestone({ ...before, total: 2 }, after, 'a', 1, 1).trail.allRitualsDone, false);
  assert.equal(describeQuestMilestone(before, { ...after, total: 0, done: 0 }, 'a', 1, 1).trail.allRitualsDone, false);
  const intermediate = describeQuestMilestone({ ...before, total: 3 }, { ...after, total: 3 }, 'a', 1, 1);
  assert.equal(intermediate.trail.allRitualsDone, false);
  assert.equal(intermediate.trail.done, 1);
});

test('level announcement uses the supplied level result, never guesses from points or time', () => {
  for (const [from, to] of [[2, 2], [2, 1], [0, 1], [NaN, 3], [2, Infinity], [1, 2.4]]) {
    assert.equal(describeQuestMilestone(undefined, undefined, 'a', from, to).level, null);
  }
  assert.deepEqual(describeQuestMilestone(before, after, 'a', 1, 4).level, { from: 1, to: 4 });
});

function markup(value, nextTitle) {
  return renderToStaticMarkup(React.createElement(Dialog, { open: true }, React.createElement(QuestCompletionBody, {
    receipt: value, nextTitle, onContinue: () => assert.fail('SSR must not navigate'), onDismiss: () => assert.fail('SSR must not dismiss'),
  })));
}
test('final receipt names the real scope, preserves metric values and keeps both actions available', () => {
  const html = markup(receipt);
  for (const text of ['Todos os rituais realizados', 'Praticar desenho', 'Aprender desenho', '1 de 1 rituais concluídos', 'Os ciclos vinculados continuam', 'Você avançou de nível', 'XP registrado', 'Pontos registrados', '3 min', 'Voltar à trilha', 'Fechar resultado']) assert.ok(html.includes(text), text);
  assert.doesNotMatch(html, /fragmento|Jornada concluída|Grande Obra concluída|disabled=/);
});

test('intermediate receipt suggests next action without implying final or level rewards', () => {
  const value = { ...receipt, milestone: { trail: { ...receipt.milestone.trail, done: 1, total: 2, allRitualsDone: false }, level: null } };
  const html = markup(value, 'Praticar amanhã');
  assert.match(html, /Mais um passo realizado/);
  assert.match(html, /Praticar amanhã/);
  assert.match(html, /Ver próxima etapa/);
  assert.doesNotMatch(html, /Você avançou|Todos os rituais realizados/);
});
