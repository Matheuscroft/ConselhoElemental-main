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

const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const output = ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (id.endsWith('.css')) return {};
    if (id.startsWith('@/')) {
      const base = 'src/' + id.slice(2);
      return load(['.ts', '.tsx'].map((ext) => base + ext).find((c) => existsSync(resolve(root, c))));
    }
    if (!id.startsWith('.')) return require(id);
    const target = resolve(dirname(path), id);
    return load(['.ts', '.tsx'].map((ext) => target + ext).find(existsSync));
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}

const firstRun = load('src/lib/sanctuary/first-run.ts');
const {
  MAX_NAME_LENGTH,
  forgetAwakeningSeen,
  getOpeningName,
  hasSeenAwakening,
  initialFirstRunStep,
  nextFirstRunStep,
  normaliseName,
  rememberAwakeningSeen,
  setOpeningName,
} = firstRun;

const withStorage = (run, { denied = false } = {}) => {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => {
        if (denied) throw new Error('storage denied');
        return store.has(key) ? store.get(key) : null;
      },
      setItem: (key, value) => {
        if (denied) throw new Error('storage denied');
        store.set(key, value);
      },
      removeItem: (key) => {
        if (denied) throw new Error('storage denied');
        store.delete(key);
      },
    },
  };
  try {
    return run(store);
  } finally {
    delete globalThis.window;
  }
};

test('the name is tidied, never trusted raw, and capped', () => {
  assert.equal(normaliseName('  Fábio   Rodrigues  '), 'Fábio Rodrigues');
  assert.equal(normaliseName('\n\t  '), '');
  assert.equal(normaliseName('a'.repeat(120)).length, MAX_NAME_LENGTH);
});

test('the opening remembers the awakening, and settings can make it forget', () => {
  withStorage(() => {
    assert.equal(hasSeenAwakening(), false);
    rememberAwakeningSeen();
    assert.equal(hasSeenAwakening(), true);
    forgetAwakeningSeen();
    assert.equal(hasSeenAwakening(), false);
  });
});

test('an unanswered name is not stored, so nothing empty is kept', () => {
  withStorage((store) => {
    setOpeningName('   ');
    assert.equal(store.has('ce:inicio:nome'), false);
    setOpeningName(' Lia ');
    assert.equal(getOpeningName(), 'Lia');
  });
});

test('a browser with storage denied still opens, it just starts over', () => {
  withStorage(() => {
    assert.doesNotThrow(() => rememberAwakeningSeen());
    assert.doesNotThrow(() => forgetAwakeningSeen());
    assert.doesNotThrow(() => setOpeningName('Lia'));
    assert.equal(hasSeenAwakening(), false);
    assert.equal(getOpeningName(), '');
  }, { denied: true });
});

test('the opening runs awakening, questions, entry — and is skipped once seen', () => {
  assert.equal(initialFirstRunStep(false), 'despertar');
  assert.equal(initialFirstRunStep(true), 'entrada');
  assert.equal(nextFirstRunStep('despertar'), 'pesquisa');
  assert.equal(nextFirstRunStep('pesquisa'), 'entrada');
  assert.equal(nextFirstRunStep('entrada'), 'entrada');
});

test('the two questions can both be answered or both be left for later', () => {
  const { PesquisaInicial } = load('src/components/entry/PesquisaInicial.tsx');
  const markup = renderToStaticMarkup(
    React.createElement(PesquisaInicial, { cidadeInicial: 'recife', onConcluir() {}, onPular() {} }),
  );

  assert.ok(markup.includes('Como quer ser chamado?'));
  assert.ok(markup.includes('De onde você olha o céu?'));
  assert.ok(markup.includes('Recife') && markup.includes('Olinda'), 'both cities must be offered');
  assert.ok(markup.includes('aria-checked="true"'), 'the current city starts selected');
  assert.ok(markup.includes('Responder depois'), 'the survey must be skippable');
  assert.ok(markup.includes('maxLength="40"') || markup.includes('maxlength="40"'), 'the name field is capped');
});
