import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NEUTRO,
  TRIANGULOS,
  configDoElemento,
  corDaMoldura,
  diaConquistado,
  triangulosAcesos,
} from '../../src/lib/momentos/moldura.ts';

const d = (dia, feitos, total) => ({ dia, feitos, total });
const aura = { fogo: '#ff8a4d', agua: '#5cc8f5', ar: '#b8f0e4', terra: '#86e07a' };

test('completar o último ciclo do dia aberto conquista o dia', () => {
  assert.equal(diaConquistado(d('2026-11-09', 2, 3), d('2026-11-09', 3, 3)), true);
  assert.equal(diaConquistado(d('2026-11-09', 0, 1), d('2026-11-09', 1, 1)), true);
});

test('um salto de 0 ao total não conta', () => {
  assert.equal(diaConquistado(d('2026-11-09', 0, 3), d('2026-11-09', 3, 3)), false);
});

test('trocar de dia, mesmo para um dia completo, não conta', () => {
  assert.equal(diaConquistado(d('2026-11-08', 2, 3), d('2026-11-09', 3, 3)), false);
  assert.equal(diaConquistado(null, d('2026-11-09', 3, 3)), false);
  assert.equal(diaConquistado(d('2026-11-09', 2, 3), null), false);
});

test('dia sem ciclos nunca conta', () => {
  assert.equal(diaConquistado(d('2026-11-09', 0, 0), d('2026-11-09', 0, 0)), false);
  assert.equal(diaConquistado(d('2026-11-09', -1, 0), d('2026-11-09', 0, 0)), false);
});

test('desmarcar ou repetir o estado não conta', () => {
  assert.equal(diaConquistado(d('2026-11-09', 3, 3), d('2026-11-09', 2, 3)), false);
  assert.equal(diaConquistado(d('2026-11-09', 3, 3), d('2026-11-09', 3, 3)), false);
});

test('sem elemento dominante a moldura é ouro neutro e nenhum triângulo acende', () => {
  assert.equal(corDaMoldura(null, aura), NEUTRO);
  assert.equal(NEUTRO, '#d6b66f');
  assert.deepEqual(triangulosAcesos(null, false), []);
  assert.deepEqual(triangulosAcesos(null, true), []);
  assert.ok(configDoElemento(null).velocidade > 0);
});

test('com elemento, a cor é a aura dele e só o triângulo dele acende, até o dia fechar', () => {
  assert.equal(corDaMoldura('agua', aura), aura.agua);
  assert.deepEqual(triangulosAcesos('ar', false), ['ar']);
  assert.deepEqual(triangulosAcesos('ar', true), [...TRIANGULOS]);
});
