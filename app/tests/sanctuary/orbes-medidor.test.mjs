import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const saida = ts.transpileModule(readFileSync(root + 'src/components/sanctuary/orbes-medidor.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const modulo = { exports: {} };
new Function('module', 'exports', saida)(modulo, modulo.exports);
const m = modulo.exports;

function rodar(passoMs, duracaoS) {
  const medidor = m.criarMedidor();
  let disparos = 0;
  let primeiro = -1;
  for (let t = 0; t <= duracaoS; t += passoMs / 1000) {
    if (medidor.amostrar(t)) {
      disparos += 1;
      if (primeiro < 0) primeiro = t;
    }
  }
  return { disparos, primeiro };
}

test('60 fps nunca degrada', () => {
  assert.equal(rodar(16.7, 30).disparos, 0);
});

test('30 fps degrada uma única vez, só depois do aquecimento e de duas janelas', () => {
  const { disparos, primeiro } = rodar(33.3, 30);
  assert.equal(disparos, 1);
  assert.ok(primeiro >= m.AQUECIMENTO_S + m.JANELA_S * 2, `disparou cedo demais: ${primeiro}`);
});

test('quadros lentos dentro do aquecimento não contam', () => {
  assert.equal(rodar(80, m.AQUECIMENTO_S - 0.1).disparos, 0);
});

test('uma janela lenta isolada não basta', () => {
  const medidor = m.criarMedidor();
  let t = 0;
  let disparos = 0;
  const passo = (ms, ate) => {
    while (t < ate) {
      t += ms / 1000;
      if (medidor.amostrar(t)) disparos += 1;
    }
  };
  passo(16.7, 3);
  passo(50, 4.8);
  passo(16.7, 20);
  assert.equal(disparos, 0);
});

test('uma pausa longa (aba oculta) não é lentidão e reinicia o aquecimento', () => {
  const medidor = m.criarMedidor();
  let t = 0;
  let disparos = 0;
  for (; t < 5; t += 0.0167) if (medidor.amostrar(t)) disparos += 1;
  t += 30;
  for (let fim = t + 5; t < fim; t += 0.0167) if (medidor.amostrar(t)) disparos += 1;
  assert.equal(disparos, 0);
});

test('as de trás são desenhadas primeiro, sem alocar', () => {
  const ordem = new Int8Array([0, 1, 2, 3]);
  m.ordenarPorProfundidade(ordem, [0.5, -1, 1, -0.2], 4);
  assert.deepEqual(Array.from(ordem), [1, 3, 0, 2]);
});

test('pixel ratio: no máximo 2, e 1,5 em tela estreita', () => {
  assert.equal(m.pixelRatioDasOrbes(390, 3), 1.5);
  assert.equal(m.pixelRatioDasOrbes(1024, 3), 2);
  assert.equal(m.pixelRatioDasOrbes(390, 1), 1);
});

test('o foco aumenta a escala em até 8%', () => {
  assert.equal(m.escalaVisual(1, 0), 1);
  assert.ok(Math.abs(m.escalaVisual(1, 1) - 1.08) < 1e-9);
  assert.ok(Math.abs(m.escalaVisual(1, 9) - 1.08) < 1e-9);
});
