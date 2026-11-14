import assert from 'node:assert/strict';
import test from 'node:test';
import { loadComponent } from '../elemental/load-component.mjs';

const { lerRecentes, registrarRecente, recentesParaMostrar, CHAVE_RECENTES } = loadComponent('src/components/mais/trilha.ts');
const falso = (inicial) => {
  const dados = new Map(inicial === undefined ? [] : [[CHAVE_RECENTES, inicial]]);
  return { getItem: (k) => dados.get(k) ?? null, setItem: (k, v) => { dados.set(k, v); }, dados };
};

test('a chave segue o briefing', () => assert.equal(CHAVE_RECENTES, 'conselho-elemental:mais:recentes'));

test('sem armazenamento nada quebra', () => {
  assert.deepEqual(lerRecentes(null), []);
  assert.doesNotThrow(() => registrarRecente('lua', null));
  assert.deepEqual(recentesParaMostrar('lua', null), []);
  assert.deepEqual(lerRecentes(), []); // Node não tem localStorage
});

test('JSON inválido ou de outro formato vira lista vazia', () => {
  assert.deepEqual(lerRecentes(falso('{quebrado')), []);
  assert.deepEqual(lerRecentes(falso('{"a":1}')), []);
  const quebra = { getItem: () => { throw new Error('negado'); }, setItem: () => { throw new Error('negado'); } };
  assert.deepEqual(lerRecentes(quebra), []);
  assert.doesNotThrow(() => registrarRecente('lua', quebra));
});

test('ids desconhecidos e duplicatas são descartados ao ler e ao gravar', () => {
  const a = falso(JSON.stringify(['lua', 'xpto', 'lua', 42, 'mapa']));
  assert.deepEqual(lerRecentes(a), ['lua', 'mapa']);
  registrarRecente('xpto', a);
  assert.deepEqual(lerRecentes(a), ['lua', 'mapa']);
  registrarRecente('mapa', a);
  assert.deepEqual(lerRecentes(a), ['mapa', 'lua']);
});

test('guarda no máximo 5, o mais recente primeiro', () => {
  const a = falso();
  ['lua', 'mapa', 'forja', 'pilares', 'ciclos', 'rituais'].forEach((id) => registrarRecente(id, a));
  assert.deepEqual(lerRecentes(a), ['rituais', 'ciclos', 'pilares', 'forja', 'mapa']);
  assert.equal(JSON.parse(a.dados.get(CHAVE_RECENTES)).length, 5);
});

test('registrar o mesmo id em sequência é idempotente', () => {
  const a = falso();
  registrarRecente('lua', a); registrarRecente('lua', a);
  assert.deepEqual(lerRecentes(a), ['lua']);
});

test('recentesParaMostrar exclui a atual e entrega até 3', () => {
  const a = falso();
  ['lua', 'mapa', 'forja', 'pilares', 'ciclos'].forEach((id) => registrarRecente(id, a));
  assert.deepEqual(recentesParaMostrar('ciclos', a), ['pilares', 'forja', 'mapa']);
  assert.deepEqual(recentesParaMostrar(undefined, a), ['ciclos', 'pilares', 'forja']);
  assert.deepEqual(recentesParaMostrar('lua', a), ['ciclos', 'pilares', 'forja']);
});
