import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LIMIARES, nivelDeVfx, nivelForcado } from '../../src/lib/momentos/nivel-vfx.ts';

test('sem maestria é o nível 1', () => {
  assert.equal(nivelDeVfx(null), 1);
  assert.equal(nivelDeVfx(undefined), 1);
  assert.equal(nivelDeVfx(0), 1);
  assert.equal(nivelDeVfx(Number.NaN), 1);
});

test('os limiares sobem o nível exatamente na fronteira', () => {
  assert.equal(nivelDeVfx(LIMIARES[0] - 1), 1);
  assert.equal(nivelDeVfx(LIMIARES[0]), 2);
  assert.equal(nivelDeVfx(LIMIARES[1] - 1), 2);
  assert.equal(nivelDeVfx(LIMIARES[1]), 3);
  assert.equal(nivelDeVfx(200), 3);
});

test('o nível forçado só aceita 1, 2 ou 3', () => {
  assert.equal(nivelForcado('?vfx=3'), 3);
  assert.equal(nivelForcado('?data=2026-11-09&vfx=2'), 2);
  assert.equal(nivelForcado('?vfx=4'), null);
  assert.equal(nivelForcado(''), null);
});
