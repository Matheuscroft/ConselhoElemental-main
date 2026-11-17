import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const saida = ts.transpileModule(readFileSync(root + 'src/lib/fitness/corpo-evolucao.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const modulo = { exports: {} };
new Function('module', 'exports', saida)(modulo, modulo.exports);
const { serieDaMedida, variacao, medidasComDados, medidaPadrao } = modulo.exports;

const a = (measuredAt, extra) => ({ id: measuredAt, measuredAt, ...extra });

test('série vazia: sem avaliações ou sem a medida', () => {
  assert.deepEqual(serieDaMedida([], 'weightKg'), []);
  assert.deepEqual(serieDaMedida([a('2026-01-01T10:00:00Z', { armCm: 30 })], 'weightKg'), []);
  assert.deepEqual(variacao([]), { desdeAPrimeira: null, desdeAAnterior: null, pontos: 0 });
});

test('um ponto não tem variação', () => {
  const serie = serieDaMedida([a('2026-01-01T10:00:00Z', { weightKg: 80 })], 'weightKg');
  assert.equal(serie.length, 1);
  assert.deepEqual(variacao(serie), { desdeAPrimeira: null, desdeAAnterior: null, pontos: 1 });
});

test('dois ou mais pontos: deltas assinados, desde a primeira e desde a anterior', () => {
  const historico = [
    a('2026-01-01T10:00:00Z', { weightKg: 80 }),
    a('2026-02-01T10:00:00Z', { weightKg: 78.5 }),
    a('2026-03-01T10:00:00Z', { weightKg: 79 }),
  ];
  assert.deepEqual(variacao(serieDaMedida(historico, 'weightKg')), { desdeAPrimeira: -1, desdeAAnterior: 0.5, pontos: 3 });
  assert.equal(variacao(serieDaMedida([a('2026-01-01T10:00:00Z', { weightKg: 0.1 }), a('2026-01-02T10:00:00Z', { weightKg: 0.3 })], 'weightKg')).desdeAPrimeira, 0.2);
});

test('valores faltando em avaliações intermediárias são ignorados', () => {
  const historico = [
    a('2026-01-01T10:00:00Z', { waistCm: 90, weightKg: 80 }),
    a('2026-02-01T10:00:00Z', { weightKg: 79 }),
    a('2026-03-01T10:00:00Z', { waistCm: 87 }),
  ];
  const serie = serieDaMedida(historico, 'waistCm');
  assert.deepEqual(serie.map((p) => p.value), [90, 87]);
  assert.deepEqual(variacao(serie).desdeAAnterior, -3);
});

test('a ordem é por data, não pela ordem do array', () => {
  const historico = [a('2026-03-01T10:00:00Z', { weightKg: 77 }), a('2026-01-01T10:00:00Z', { weightKg: 80 }), a('2026-02-01T10:00:00Z', { weightKg: 79 })];
  assert.deepEqual(serieDaMedida(historico, 'weightKg').map((p) => p.value), [80, 79, 77]);
  assert.equal(variacao(serieDaMedida(historico, 'weightKg')).desdeAPrimeira, -3);
});

test('medidasComDados segue a ordem dos campos e medidaPadrao prefere o peso', () => {
  const historico = [a('2026-01-01T10:00:00Z', { thighCm: 55, weightKg: 80 }), a('2026-02-01T10:00:00Z', { armCm: 33 })];
  assert.deepEqual(medidasComDados(historico), ['weightKg', 'armCm', 'thighCm']);
  assert.equal(medidaPadrao(['weightKg', 'armCm']), 'weightKg');
  assert.equal(medidaPadrao(['armCm', 'thighCm']), 'armCm');
  assert.equal(medidaPadrao([]), undefined);
  assert.deepEqual(medidasComDados([]), []);
});
