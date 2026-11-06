import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { loadComponent } from './load-component.mjs';

const { preserveDiscoveryScroll, DISCOVERY_NAVIGATION_OPTIONS } = loadComponent('src/components/layout/discovery-scroll.ts');

test('only marked in-page discovery changes preserve scroll; entry and real navigation reset it', () => {
  for (const path of ['/dominios', '/mapa']) {
    assert.equal(preserveDiscoveryScroll(path, path, DISCOVERY_NAVIGATION_OPTIONS.state), true);
    for (const state of [null, undefined, {}, { discoveryFilter: false }]) assert.equal(preserveDiscoveryScroll(path, path, state), false);
    assert.equal(preserveDiscoveryScroll(undefined, path, DISCOVERY_NAVIGATION_OPTIONS.state), false);
    assert.equal(preserveDiscoveryScroll('/santuario', path, DISCOVERY_NAVIGATION_OPTIONS.state), false);
  }
  assert.equal(preserveDiscoveryScroll('/dominios', '/dominios/agua', DISCOVERY_NAVIGATION_OPTIONS.state), false);
  assert.equal(preserveDiscoveryScroll('/ciclos', '/ciclos', DISCOVERY_NAVIGATION_OPTIONS.state), false);
});

test('ScrollToTop effect does not issue a top reset when opening or changing a domain group', () => {
  // Execute the actual component effect with isolated hook/window doubles; this is not a browser test.
  const refs = [], effects = [], calls = [];
  let refIndex = 0, effectIndex = 0, location;
  const react = {
    useRef(value) { const i = refIndex++; return refs[i] ??= { current: value }; },
    useLayoutEffect(fn, deps) {
      const i = effectIndex++, previous = effects[i];
      if (!previous || deps.some((value, index) => value !== previous.deps[index])) {
        previous?.cleanup?.(); effects[i] = { deps, cleanup: fn() };
      }
    },
  };
  const source = readFileSync('src/components/layout/ScrollToTop.tsx', 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const module = { exports: {} };
  const require = name => name === 'react' ? react : name === 'react-router-dom' ? { useLocation: () => location } : loadComponent(name.startsWith('@/') ? `src/${name.slice(2)}.ts` : 'src/components/layout/discovery-scroll.ts');
  new Function('require', 'module', 'exports', output)(require, module, module.exports);
  const originalWindow = globalThis.window;
  globalThis.window = { history: { scrollRestoration: 'auto' }, scrollTo: value => calls.push(value) };
  const render = next => { location = next; refIndex = 0; effectIndex = 0; module.exports.ScrollToTop(); };
  try {
    render({ key: 'entry', pathname: '/dominios', search: '', state: null });
    assert.equal(calls.length, 1);
    for (const group of ['fogo', 'agua', '']) render({ key: group, pathname: '/dominios', search: `?grupo=${group}`, state: DISCOVERY_NAVIGATION_OPTIONS.state });
    assert.equal(calls.length, 1, 'expansion must not call scrollTo(top:0)');
    render({ key: 'detail', pathname: '/dominios/estudos', search: '', state: null });
    assert.equal(calls.length, 2, 'a real page change still resets scroll');
  } finally {
    for (const effect of effects) effect.cleanup?.();
    assert.equal(globalThis.window.history.scrollRestoration, 'auto');
    if (originalWindow === undefined) delete globalThis.window; else globalThis.window = originalWindow;
  }
});
