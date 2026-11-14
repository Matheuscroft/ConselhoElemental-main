import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elementoDaSemana, inicioDaSemana } from '../../src/lib/momentos/elemento-da-semana.ts';

const dia = (ano, mes, d, h = 12) => new Date(ano, mes - 1, d, h);
// 2026-11-09 is a Monday; 2026-11-14 is a Saturday.
const feito = (data, elemento) => ({ data, elemento });

test('a semana começa na segunda às 00:00, inclusive num domingo', () => {
  assert.equal(inicioDaSemana(dia(2026, 11, 14)).getTime(), dia(2026, 11, 9, 0).getTime());
  assert.equal(inicioDaSemana(dia(2026, 11, 15, 23)).getTime(), dia(2026, 11, 9, 0).getTime());
  assert.equal(inicioDaSemana(dia(2026, 11, 9, 0)).getTime(), dia(2026, 11, 9, 0).getTime());
});

test('sem conclusões na semana não há elemento: a moldura fica dourada', () => {
  const r = elementoDaSemana([], dia(2026, 11, 14));
  assert.equal(r.elemento, null);
  assert.equal(r.total, 0);
});

test('o elemento com mais conclusões lidera a semana', () => {
  const r = elementoDaSemana([
    feito(dia(2026, 11, 9), 'fogo'), feito(dia(2026, 11, 10), 'fogo'), feito(dia(2026, 11, 11), 'agua'),
  ], dia(2026, 11, 14));
  assert.equal(r.elemento, 'fogo');
  assert.deepEqual(r.contagem, { fogo: 2, agua: 1, ar: 0, terra: 0 });
});

test('no meio da semana a cor troca quando outro elemento passa o líder', () => {
  const base = [feito(dia(2026, 11, 9), 'fogo'), feito(dia(2026, 11, 10), 'fogo')];
  assert.equal(elementoDaSemana(base, dia(2026, 11, 12)).elemento, 'fogo');
  const depois = [...base, feito(dia(2026, 11, 11), 'agua'), feito(dia(2026, 11, 11, 15), 'agua'), feito(dia(2026, 11, 12), 'agua')];
  assert.equal(elementoDaSemana(depois, dia(2026, 11, 12)).elemento, 'agua');
});

test('empate vai para o elemento concluído mais recentemente', () => {
  const r = elementoDaSemana([
    feito(dia(2026, 11, 9), 'fogo'), feito(dia(2026, 11, 12), 'ar'),
  ], dia(2026, 11, 14));
  assert.equal(r.elemento, 'ar');
});

test('a segunda-feira zera: conclusões da semana anterior não contam', () => {
  const antigas = [feito(dia(2026, 11, 8, 23), 'terra'), feito(dia(2026, 11, 7), 'terra')];
  assert.equal(elementoDaSemana(antigas, dia(2026, 11, 9, 8)).elemento, null);
  assert.equal(elementoDaSemana(antigas, dia(2026, 11, 8, 23)).elemento, 'terra');
});

test('datas inválidas são ignoradas', () => {
  const r = elementoDaSemana([feito(new Date('x'), 'fogo'), feito(dia(2026, 11, 10), 'ar')], dia(2026, 11, 14));
  assert.equal(r.elemento, 'ar');
});
