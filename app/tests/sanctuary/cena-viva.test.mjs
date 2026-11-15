import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  amortecer, emRepouso, inclinacaoNaCena, limitar, luzNoCartao, ponteiroNaCena, REPOUSO,
} from '../../src/lib/sanctuary/cena-viva.ts';

const cena = { left: 100, top: 50, width: 200, height: 400 };

test('o ponteiro vira -1..1 com zero no centro da cena', () => {
  assert.deepEqual(ponteiroNaCena(200, 250, cena), { x: 0, y: 0 });
  assert.deepEqual(ponteiroNaCena(100, 50, cena), { x: -1, y: -1 });
  assert.deepEqual(ponteiroNaCena(300, 450, cena), { x: 1, y: 1 });
});

test('fora da cena o valor para na borda, nunca passa de 1', () => {
  assert.deepEqual(ponteiroNaCena(9999, -9999, cena), { x: 1, y: -1 });
});

test('uma cena sem tamanho responde repouso, não NaN', () => {
  assert.equal(ponteiroNaCena(10, 10, { left: 0, top: 0, width: 0, height: 0 }), REPOUSO);
  assert.equal(limitar(Number.NaN), 0);
});

test('o celular na mão, inclinado como se segura, é repouso', () => {
  assert.deepEqual(inclinacaoNaCena(45, 0), { x: 0, y: 0 });
  assert.deepEqual(inclinacaoNaCena(63, 18), { x: 1, y: 1 });
  assert.deepEqual(inclinacaoNaCena(-90, -90), { x: -1, y: -1 });
});

test('sem leitura do sensor a cena não se mexe', () => {
  assert.equal(inclinacaoNaCena(null, 3), REPOUSO);
  assert.equal(inclinacaoNaCena(40, null), REPOUSO);
});

test('amortecer anda metade do caminho a cada meia-vida, em qualquer taxa de quadros', () => {
  assert.equal(amortecer(0, 1, 110, 110), 0.5);
  const emDoisPassos = amortecer(amortecer(0, 1, 55, 110), 1, 55, 110);
  assert.ok(Math.abs(emDoisPassos - 0.5) < 1e-9);
});

test('um quadro longo nunca passa do alvo, e um quadro nulo não anda', () => {
  const longo = amortecer(0, 1, 60000, 110);
  assert.ok(longo <= 1 && longo > 0.999);
  assert.equal(amortecer(0.3, 1, 0, 110), 0.3);
});

test('em repouso quando a diferença já não se vê', () => {
  assert.equal(emRepouso({ x: 0.001, y: -0.001 }, REPOUSO), true);
  assert.equal(emRepouso({ x: 0.01, y: 0 }, REPOUSO), false);
});

test('a luz fica em pixels dentro do cartão, com uma sobra além da borda', () => {
  const cartao = { left: 20, top: 300, width: 350, height: 120 };
  assert.deepEqual(luzNoCartao(120, 340, cartao), { x: 100, y: 40 });
  assert.deepEqual(luzNoCartao(-500, 9999, cartao), { x: -24, y: 144 });
});
