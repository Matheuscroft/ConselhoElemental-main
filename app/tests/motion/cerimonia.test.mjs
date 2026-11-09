import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts');
    const alvo = resolve(dirname(path), id);
    return load(['.ts'].map((ext) => alvo + ext).find(existsSync));
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}

const c = load('src/lib/cerimonia/cerimonia.ts');

const completo = {
  elemento: 'agua',
  titulo: 'Jornada concluída',
  numero: { rotulo: 'XP', de: 120, para: 160 },
  destrave: { titulo: 'Peça encontrada', detalhe: '1 de 9' },
};

test('a ceremony only shows the beats the prize actually has', () => {
  assert.deepEqual(c.beatsDe(completo), ['chegada', 'numero', 'destrave', 'fim']);
  assert.deepEqual(c.beatsDe({ titulo: 'Pronto' }), ['chegada', 'fim'], 'no number, no number screen');
  assert.deepEqual(
    c.beatsDe({ titulo: 'Pronto', numero: { rotulo: 'XP', de: 0, para: 10 } }),
    ['chegada', 'numero', 'fim'],
  );
  assert.deepEqual(
    c.beatsDe({ titulo: 'Pronto', destrave: { titulo: 'A', detalhe: 'B' } }),
    ['chegada', 'destrave', 'fim'],
  );
});

test('the beats run in order and end, never looping', () => {
  let beat = 'chegada';
  const vistos = [beat];
  for (let passo = 0; passo < 10 && beat !== 'fim'; passo += 1) {
    beat = c.proximoBeat(completo, beat);
    vistos.push(beat);
  }
  assert.deepEqual(vistos, ['chegada', 'numero', 'destrave', 'fim']);
  assert.equal(c.proximoBeat(completo, 'fim'), 'fim', 'the end stays the end');
  assert.equal(c.proximoBeat(completo, 'inexistente'), 'fim', 'a stray beat lands on the end');
});

test('nobody waits more than four seconds to get back to what they were doing', () => {
  // The ceremony earns its place by being short. If a beat is lengthened,
  // this is what notices.
  assert.ok(
    c.duracaoTotal(completo) <= c.TETO_TOTAL,
    `the full ceremony runs ${c.duracaoTotal(completo)}ms, over the ${c.TETO_TOTAL}ms ceiling`,
  );
  assert.ok(c.duracaoTotal({ titulo: 'Pronto' }) < c.duracaoTotal(completo), 'a smaller prize is shorter');
});

test('the first beat overshoots and the rest do not', () => {
  // Arriving is the celebration; the screens after it are reading.
  assert.ok(c.ESPERA.chegada > 0 && c.ESPERA.numero > 0 && c.ESPERA.destrave > 0);
  for (const espera of Object.values(c.ESPERA)) {
    assert.ok(espera >= 600, 'a beat shorter than this cannot be read');
    assert.ok(espera <= 1600, 'and one longer than this is a wait, not a beat');
  }
});

test('an empty prize never opens a ceremony', () => {
  assert.equal(c.vaiCelebrar(null), false);
  assert.equal(c.vaiCelebrar({ titulo: '' }), false);
  assert.equal(c.vaiCelebrar({ titulo: '   ' }), false, 'nor one made of spaces');
  assert.equal(c.vaiCelebrar(completo), true);
});
