import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elementoDominante } from '../../src/lib/momentos/elemento-do-dia.ts';

const c = (elementId, feito = false) => ({ elementId, feito });

test('dia vazio não tem elemento', () => {
  assert.equal(elementoDominante([]), null);
});

test('o elemento com mais ciclos lidera', () => {
  assert.equal(elementoDominante([c('agua'), c('fogo'), c('agua')]), 'agua');
});

test('empate em ciclos é decidido pelos feitos', () => {
  assert.equal(elementoDominante([c('terra', true), c('ar')]), 'terra');
  assert.equal(elementoDominante([c('terra'), c('ar', true)]), 'ar');
});

test('empate total devolve neutro', () => {
  assert.equal(elementoDominante([c('terra'), c('ar')]), null);
  assert.equal(elementoDominante([c('fogo', true), c('agua', true)]), null);
});

test('um empate perdido mais adiante não apaga o líder', () => {
  assert.equal(elementoDominante([c('fogo'), c('agua'), c('ar'), c('ar')]), 'ar');
});
