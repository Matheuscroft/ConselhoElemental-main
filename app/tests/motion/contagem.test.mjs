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
    const target = resolve(dirname(path), id);
    return load(['.ts'].map((ext) => target + ext).find(existsSync));
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}

const { contagemValor } = load('src/lib/motion/contagem.ts');

test('a tally starts where it was and lands exactly where it was told', () => {
  assert.equal(contagemValor(40, 120, 0), 40);
  assert.equal(contagemValor(40, 120, 1), 120);
  assert.equal(contagemValor(40, 120, -5), 40, 'a late frame cannot run it backwards');
  assert.equal(contagemValor(40, 120, 9), 120, 'nor past its target');
});

test('a tally only ever moves forward through its run', () => {
  let last = contagemValor(0, 250, 0);
  for (let step = 1; step <= 40; step += 1) {
    const now = contagemValor(0, 250, step / 40);
    assert.ok(now >= last, `step ${step} went backwards: ${last} then ${now}`);
    last = now;
  }
  assert.equal(last, 250);
});

test('the count is whole, because XP and streaks are counted things', () => {
  for (let step = 0; step <= 20; step += 1) {
    const value = contagemValor(7, 93, step / 20);
    assert.equal(value, Math.round(value), 'a decimal flickering past reads as a glitch');
  }
});

test('most of the distance is covered early, the way the curve promises', () => {
  // The standard curve is a strong ease-out, so halfway through the time the
  // number is already well past halfway. That is what makes it feel answered
  // rather than metered out.
  const meio = contagemValor(0, 100, 0.5);
  assert.ok(meio > 70, `halfway through time the tally should be past 70, was ${meio}`);
  assert.ok(meio < 100, 'but not finished');
});

test('a tally can run down, and a tally that is not moving does not move', () => {
  assert.equal(contagemValor(100, 40, 0), 100);
  assert.equal(contagemValor(100, 40, 1), 40);
  assert.ok(contagemValor(100, 40, 0.5) < 100);
  assert.equal(contagemValor(55, 55, 0.5), 55);
});
