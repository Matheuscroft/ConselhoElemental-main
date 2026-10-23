import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../../src/components/elemental/material-effects.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { createMaterialEffect } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

// Numerical/API contract checks only. This is not a browser or pixel-rendering test.
function harness() {
  let depth = 0;
  const commands = [];
  const record = (name, values) => {
    for (const value of values) if (typeof value === 'number') assert.ok(Number.isFinite(value), `${name}: non-finite coordinate`);
    commands.push([name, ...values.filter((value) => typeof value === 'number' || typeof value === 'string')]);
  };
  const ctx = new Proxy({}, {
    get(_, key) {
      if (key === 'save') return () => { depth++; };
      if (key === 'restore') return () => { assert.ok(depth > 0); depth--; };
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return (...values) => {
        record(key, values);
        if (key === 'createRadialGradient') assert.ok(values[2] >= 0 && values[5] >= 0);
        return { addColorStop(offset, color) { assert.ok(offset >= 0 && offset <= 1); record('colorStop', [offset, color]); } };
      };
      return (...values) => {
        if (key === 'arc') assert.ok(values[2] >= 0);
        if (key === 'ellipse') assert.ok(values[2] >= 0 && values[3] >= 0);
        record(key, values);
      };
    },
    set(_, key, value) {
      if (key === 'globalAlpha') assert.ok(value >= 0 && value <= 1);
      record(key, [value]);
      return true;
    },
  });
  const canvas = { width: 0, height: 0, getContext: () => ctx, getBoundingClientRect: () => ({ width: 96 }) };
  return { canvas, commands, assertBalanced: () => assert.equal(depth, 0) };
}

test('all materials keep valid geometry, opacity and drawing state over multiple cycles', () => {
  const previous = globalThis.window;
  globalThis.window = { devicePixelRatio: 3 };
  try {
    for (const id of ['agua', 'fogo', 'terra', 'ar']) {
      const h = harness();
      const texture = { complete: true, naturalWidth: 1254, naturalHeight: 1254 };
      const effect = createMaterialEffect(h.canvas, id, texture);
      assert.equal(h.canvas.width, 192, 'DPR capped at two');
      for (let frame = 0; frame <= 480; frame++) {
        effect.paint(frame / 10);
        h.assertBalanced();
        h.commands.length = 0;
      }
    }
  } finally { globalThis.window = previous; }
});

test('a preserved timestamp reproduces the same effect after pausing', () => {
  const previous = globalThis.window;
  globalThis.window = { devicePixelRatio: 1 };
  try {
    for (const id of ['agua', 'fogo', 'terra', 'ar']) {
      const h = harness();
      const effect = createMaterialEffect(h.canvas, id, null);
      effect.paint(3.75);
      const before = [...h.commands];
      h.commands.length = 0;
      effect.paint(3.75);
      assert.deepEqual(h.commands, before, id);
      h.commands.length = 0;
      effect.paint(4.75);
      assert.notDeepEqual(h.commands, before, `${id} must evolve with time`);
    }
  } finally { globalThis.window = previous; }
});

test('missing canvas support keeps the static artwork fallback available', () => {
  assert.equal(createMaterialEffect({ getContext: () => null }, 'agua', null), null);
});
