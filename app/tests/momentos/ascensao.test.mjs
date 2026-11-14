import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  DURACAO_TRANSBORDO_MS,
  FilaDeAscensoes,
  PICO_TRANSBORDO,
  elementoDaMoldura,
  envelopeTransbordo,
  nivelDaMoldura,
  planoDaCerimonia,
  precisaRolarAteOReel,
  reelAssentou,
} from '../../src/lib/momentos/ascensao.ts';
import { DURATION } from '../../src/lib/motion/motion.ts';

const amostras = (nivel) => {
  const total = DURACAO_TRANSBORDO_MS[nivel];
  return Array.from({ length: total + 1 }, (_, t) => envelopeTransbordo(t, nivel));
};

test('o envelope sobe, sustenta o pico e decai a zero', () => {
  for (const nivel of [2, 3]) {
    const total = DURACAO_TRANSBORDO_MS[nivel];
    const v = amostras(nivel);
    assert.equal(v[0], 0);
    assert.equal(v[total], 0);
    assert.equal(envelopeTransbordo(-5, nivel), 0);
    assert.equal(envelopeTransbordo(total + 500, nivel), 0);
    assert.ok(v[Math.floor(DURATION.conjure / 2)] > 0, 'sobe');
    assert.ok(v[200] < v[DURATION.conjure - 1], 'sobe monotonicamente');
    const meio = v[Math.floor(total / 2)];
    assert.equal(meio, PICO_TRANSBORDO[nivel], 'sustenta o pico');
    assert.ok(Math.max(...v) <= PICO_TRANSBORDO[nivel] + 1e-9);
    assert.ok(v[total - DURATION.settle + 1] > v[total - 20], 'decai');
  }
});

test('a descida dura o degrau settle', () => {
  const total = DURACAO_TRANSBORDO_MS[3];
  assert.equal(envelopeTransbordo(total - DURATION.settle, 3), PICO_TRANSBORDO[3]);
  assert.ok(envelopeTransbordo(total - DURATION.settle + 1, 3) < PICO_TRANSBORDO[3]);
});

test('o nível 3 dura mais e vai mais alto que o nível 2', () => {
  assert.ok(DURACAO_TRANSBORDO_MS[3] > DURACAO_TRANSBORDO_MS[2]);
  assert.ok(PICO_TRANSBORDO[3] > PICO_TRANSBORDO[2]);
  assert.ok(DURACAO_TRANSBORDO_MS[3] >= 2500 && DURACAO_TRANSBORDO_MS[3] <= 3500);
  assert.ok(DURACAO_TRANSBORDO_MS[2] >= 1500 && DURACAO_TRANSBORDO_MS[2] <= 2000);
});

test('a fila é FIFO e esvaziar devolve o resto na ordem', () => {
  const fila = new FilaDeAscensoes();
  fila.empurrar('a');
  fila.empurrar('b');
  fila.empurrar('c');
  assert.equal(fila.tamanho, 3);
  assert.equal(fila.proxima(), 'a');
  assert.deepEqual(fila.esvaziar(), ['b', 'c']);
  assert.equal(fila.tamanho, 0);
  assert.equal(fila.proxima(), undefined);
});

test('movimento reduzido não agenda cerimônia animada, nem rolagem animada, nem dobra', () => {
  for (const nivel of [2, 3]) {
    const plano = planoDaCerimonia(nivel, true);
    assert.equal(plano.modo, 'estatica');
    assert.equal(plano.rolagem, 'auto');
    assert.equal(plano.dobra, false);
    assert.ok(plano.duracaoMs < DURACAO_TRANSBORDO_MS[3]);
    const animada = planoDaCerimonia(nivel, false);
    assert.equal(animada.modo, 'animada');
    assert.equal(animada.rolagem, 'smooth');
    assert.equal(animada.dobra, true);
    assert.equal(animada.duracaoMs, DURACAO_TRANSBORDO_MS[nivel]);
  }
});

test('durante a cerimônia a moldura veste o elemento que subiu; depois, o líder e o nível do cartão', () => {
  const asc = { elemento: 'agua', nivel: 3 };
  assert.equal(elementoDaMoldura('fogo', asc), 'agua');
  assert.equal(elementoDaMoldura(null, asc), 'agua');
  assert.equal(elementoDaMoldura('fogo', null), 'fogo');
  assert.equal(nivelDaMoldura(1, asc), 3);
  assert.equal(nivelDaMoldura(2, null), 2);
});

test('só rola até o Reel quando ele não está inteiro na janela', () => {
  assert.equal(precisaRolarAteOReel(100, 500, 800), false);
  assert.equal(precisaRolarAteOReel(-20, 400, 800), true);
  assert.equal(precisaRolarAteOReel(600, 1000, 800), true);
  assert.equal(reelAssentou(400, 800, 0), true);
  assert.equal(reelAssentou(100, 800, 0), false);
  assert.equal(reelAssentou(100, 800, 4), true);
});

test('a página de Ciclos assina as ascensões e não monta mais o aviso por dia', () => {
  const fonte = readFileSync('src/pages/Ciclos.tsx', 'utf8');
  assert.match(fonte, /assinarAscensoes\(/);
  assert.match(fonte, /ascensao=\{ascensaoDoReel\}/);
  assert.doesNotMatch(fonte, /<CycleCompletionFeedback/);
});
