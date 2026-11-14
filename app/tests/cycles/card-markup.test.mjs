import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../../src/pages/Ciclos.tsx', import.meta.url), 'utf8');
const habitCard = source.slice(source.indexOf('const habit = card.habit;'), source.indexOf('Nenhum ciclo corresponde aos filtros'));

test('the routine card carries the element variables and the state attributes', () => {
  for (const attr of ['data-element=', 'data-selando=', 'data-em-andamento=', 'data-drag-over=']) {
    assert.ok(habitCard.includes(attr), `habit card lacks ${attr}`);
    assert.ok(source.split(attr).length > 2, `sequence card lacks ${attr}`);
  }
  assert.match(habitCard, /'--cyc-acento': ACENTO\[element\.id\]/);
  assert.match(habitCard, /'--cycle-accent': 'var\(--cyc-acento\)'/);
  assert.match(habitCard, /DURATION|marcarSelando/);
  assert.match(source, /DURATION\.settle/);
  assert.ok(!source.includes('animationend'), 'the seal flag is cleared by timer, not animationend');
});

test('the card title is no longer struck through and the checkbox keeps its contract', () => {
  assert.ok(!habitCard.includes('line-through'));
  assert.match(habitCard, /role="checkbox" aria-checked=\{completed\}/);
  assert.match(habitCard, /<CycleSigil element=\{element\.id\} size="card" filled=\{completed\}/);
  // sealing only happens when marking done, never on unmarking
  assert.match(habitCard, /if \(completed\) handleQuickUncompleteHabit\(habit\); else \{ handleQuickCompleteHabit\(habit\); marcarSelando\(habit\.id\)/);
});

test('completed cycles are grouped in a collapsed "Selados" group and the toolbar gets the seal trail', () => {
  assert.ok(source.includes('cycle-sealed-group'));
  assert.ok(source.includes('Selados ('));
  assert.match(source, /useState\(false\);/);
  assert.match(source, /selosAbertos/);
  assert.ok(source.includes('selos={'));
  assert.match(source, /groupSealed = cycleFilters\.status === 'all'/);
});

test('guide moved to the footer and the empty states use the sigil diamond', () => {
  assert.ok(source.indexOf('cycle-guide') > source.indexOf('className="cycles-insights"'));
  assert.ok(source.includes('cycle-empty-diamond'));
  assert.ok(source.includes('data-compact="true"'));
  assert.ok(!source.includes('Ciclos concluídos nesta data</span>'));
});
