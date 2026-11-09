import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const load = (file) => {
  const output = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(() => ({}), module, module.exports);
  return module.exports;
};

const v = load('src/lib/recursos/vitalidade.ts');

test('a day with nothing done still starts standing', () => {
  assert.equal(v.hpDoDia({ habitosHoje: 0, ofensiva: 0 }), v.HP_BASE);
});

test('each habit carried through is worth the same, and a streak is worth its own', () => {
  assert.equal(v.hpDoDia({ habitosHoje: 2, ofensiva: 0 }), 80);
  assert.equal(v.hpDoDia({ habitosHoje: 0, ofensiva: 1 }), 80);
  assert.equal(v.hpDoDia({ habitosHoje: 2, ofensiva: 9 }), 90);
  // The streak bonus is for having one at all, not for its length.
  assert.equal(v.hpDoDia({ habitosHoje: 0, ofensiva: 1 }), v.hpDoDia({ habitosHoje: 0, ofensiva: 400 }));
});

test('a very good day stops at full, it does not overflow the bar', () => {
  assert.equal(v.hpDoDia({ habitosHoje: 40, ofensiva: 12 }), v.HP_MAXIMO);
  assert.equal(v.hpDoDia({ habitosHoje: 6, ofensiva: 1 }), v.HP_MAXIMO);
});

test('nonsense never drags the figure below where a day starts', () => {
  for (const dia of [{ habitosHoje: -5, ofensiva: 0 }, { habitosHoje: 0, ofensiva: -3 }]) {
    assert.ok(v.hpDoDia(dia) >= v.HP_BASE, JSON.stringify(dia));
  }
  assert.equal(v.hpDoDia({ habitosHoje: 2.7, ofensiva: 0 }), 80, 'half a habit is not a habit');
});
