import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = new URL('../../', import.meta.url).pathname;

// getSeason lifted out of the constants barrel, so the scene test never pulls
// in leveling, storage or account code.
const constants = readFileSync(resolve(root, 'src/constants/index.ts'), 'utf8');
const ast = ts.createSourceFile('constants.ts', constants, ts.ScriptTarget.Latest, true);
const helpers = ast.statements
  .filter((node) => ts.isFunctionDeclaration(node) && ['getSeason', 'getHemisphereFromLatitude'].includes(node.name?.text))
  .map((node) => node.getText(ast))
  .join('\n');
const legacyModule = { exports: {} };
new Function('exports', ts.transpileModule(helpers, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText)(legacyModule.exports);

const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const source = readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (id.endsWith('.css')) return {};
    if (id === '@/constants') return legacyModule.exports;
    if (id.startsWith('@/')) {
      const base = 'src/' + id.slice(2);
      return load(['.ts', '.tsx'].map((ext) => base + ext).find((candidate) => existsSync(resolve(root, candidate))));
    }
    if (!id.startsWith('.')) return require(id);
    const target = resolve(dirname(path), id);
    return load(['.ts', '.tsx'].map((ext) => target + ext).find(existsSync));
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}

const scene = load('src/lib/sanctuary/awakening-scene.ts');
const {
  AWAKENING_ELEMENTS,
  PLATE_ASPECT,
  awaken,
  completeAwakening,
  createAwakening,
  hitTestElement,
  isAwakeningComplete,
  isLit,
  parallaxOffset,
  sceneDistance,
} = scene;

const withWindow = (matchesReducedMotion, run) => {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
    },
    matchMedia: () => ({ matches: matchesReducedMotion }),
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
    innerWidth: 390,
    innerHeight: 844,
  };
  try {
    return run();
  } finally {
    delete globalThis.window;
  }
};

test('a tap on each element lights that element and nothing else', () => {
  for (const element of AWAKENING_ELEMENTS) {
    assert.equal(hitTestElement({ x: element.x, y: element.y }), element.id);
  }
});

test('a tap on the altar or on empty sky lights nothing', () => {
  assert.equal(hitTestElement({ x: 0.5, y: 0.573 }), null);
  assert.equal(hitTestElement({ x: 0.5, y: 0.02 }), null);
  assert.equal(hitTestElement({ x: 0.5, y: 0.95 }), null);
});

test('between two touch areas the nearer centre wins, so a finger never lights the wrong element', () => {
  const terra = AWAKENING_ELEMENTS.find((element) => element.id === 'terra');
  const fogo = AWAKENING_ELEMENTS.find((element) => element.id === 'fogo');
  const midpoint = { x: (terra.x + fogo.x) / 2, y: (terra.y + fogo.y) / 2 };

  const nearTerra = { x: midpoint.x + (terra.x - midpoint.x) * 0.4, y: midpoint.y + (terra.y - midpoint.y) * 0.4 };
  const nearFogo = { x: midpoint.x + (fogo.x - midpoint.x) * 0.4, y: midpoint.y + (fogo.y - midpoint.y) * 0.4 };

  assert.equal(hitTestElement(nearTerra), 'terra');
  assert.equal(hitTestElement(nearFogo), 'fogo');
});

test('distances normalise the vertical axis, so a touch area is a circle and not an ellipse', () => {
  const horizontal = sceneDistance({ x: 0, y: 0 }, { x: 0.1, y: 0 });
  const vertical = sceneDistance({ x: 0, y: 0 }, { x: 0, y: 0.1 / PLATE_ASPECT });
  assert.ok(Math.abs(horizontal - vertical) < 1e-12);
});

test('every touch area clears the 44px minimum on the narrowest supported screen', () => {
  for (const element of AWAKENING_ELEMENTS) {
    const diameterAt390 = element.touchRadius * 2 * 390;
    assert.ok(diameterAt390 >= 44, `${element.id} was ${diameterAt390.toFixed(1)}px wide`);
  }
});

test('elements can be lit in any order, twice does nothing, and four of them complete the scene', () => {
  let state = createAwakening();
  assert.equal(isAwakeningComplete(state), false);

  for (const id of ['ar', 'agua', 'ar', 'terra', 'fogo']) {
    state = awaken(state, id);
  }

  assert.deepEqual(state.lit, ['ar', 'agua', 'terra', 'fogo']);
  assert.equal(isAwakeningComplete(state), true);
  assert.equal(isLit(state, 'terra'), true);
});

test('skipping lights everything at once without inventing a new order', () => {
  const state = completeAwakening();
  assert.equal(isAwakeningComplete(state), true);
  assert.deepEqual(state.lit, AWAKENING_ELEMENTS.map((element) => element.id));
});

test('parallax is clamped, so a violent tilt cannot throw the scene off screen', () => {
  assert.deepEqual(parallaxOffset({ x: 9, y: -9 }, 0.012), { x: 0.012, y: -0.012 });
  assert.deepEqual(parallaxOffset({ x: 0, y: 0 }, 0.012), { x: 0, y: 0 });
});

test('the scene offers a named target per element, a skip and a described plate', () => {
  const { DespertarCena } = load('src/components/sanctuary/DespertarCena.tsx');
  const markup = withWindow(false, () =>
    renderToStaticMarkup(React.createElement(DespertarCena, { at: new Date('2026-11-08T20:15:00Z') })),
  );

  for (const element of AWAKENING_ELEMENTS) {
    assert.ok(markup.includes(`Despertar ${element.name}`), `missing target for ${element.id}`);
  }
  assert.ok(markup.includes('>Pular<'), 'the skip must always be present');
  assert.ok(markup.includes('aria-pressed="false"'), 'targets start unlit');
  assert.ok(/<img[^>]+alt="Santuário ancestral/.test(markup), 'the plate needs a real description');
  assert.ok(markup.includes('na ordem que quiser'), 'the caption must say the order is free');
});

test('reduced motion opens with the scene already awake instead of asking for four taps', () => {
  const { DespertarCena } = load('src/components/sanctuary/DespertarCena.tsx');
  const markup = withWindow(true, () =>
    renderToStaticMarkup(React.createElement(DespertarCena, { at: new Date('2026-11-08T20:15:00Z') })),
  );

  assert.ok(markup.includes('Os quatro elementos responderam'), 'reduced motion should land complete');
  assert.ok(!markup.includes('aria-pressed="false"'), 'no target should still be waiting');
  assert.ok(markup.includes('>Pular<'), 'skip stays available');
});

test('the scene names the season and the moon phase of the chosen city once it is complete', () => {
  const { DespertarCena } = load('src/components/sanctuary/DespertarCena.tsx');
  const markup = withWindow(true, () =>
    renderToStaticMarkup(
      React.createElement(DespertarCena, { at: new Date('2026-07-15T20:15:00Z'), cityId: 'olinda' }),
    ),
  );

  assert.ok(markup.includes('Inverno em Olinda'), 'southern winter in the chosen city');
});

// --- lua real (lote F) -----------------------------------------------------

const renderAt = (iso, reduced = true) => {
  const { DespertarCena } = load('src/components/sanctuary/DespertarCena.tsx');
  return withWindow(reduced, () =>
    renderToStaticMarkup(React.createElement(DespertarCena, { at: new Date(iso), cityId: 'recife' })),
  );
};

test('at dusk with the Moon up the scene reaches for the real Moon, not the flat sprite', () => {
  const markup = renderAt('2026-11-08T07:47:00Z');
  assert.ok(markup.includes('despertar-lua-3d'), 'the 3D container should be mounted');
});

test('in full daylight the Moon stays a sprite, so three.js is never fetched', () => {
  const markup = renderAt('2026-11-02T14:00:00Z');
  assert.ok(!markup.includes('despertar-lua-3d'), 'no 3D container in daylight');
  assert.ok(markup.includes('sprite-lua.webp'), 'the flat sprite is enough by day');
});

test('a new Moon lights the altar so the scene stays readable; a full one does not', () => {
  assert.ok(renderAt('2026-11-08T07:47:00Z').includes('despertar-realce'), 'new moon needs the highlight');
  assert.ok(!renderAt('2026-11-24T23:00:00Z').includes('despertar-realce'), 'a full moon lights itself');
});
