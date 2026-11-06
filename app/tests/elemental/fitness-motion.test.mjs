import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

const { isNewSetCompletion } = loadComponent('src/components/fitness-kit/set-receipt.ts');
const { ExerciseSetRow } = loadComponent('src/components/fitness-kit/ExerciseSetRow.tsx');
const { ExerciseCard } = loadComponent('src/components/fitness-kit/ExerciseCard.tsx');
const pending = { id: 'set-a', setNumber: 1, completed: false, skipped: false, reps: 8, loadKg: 10, durationSeconds: 120 };
const recorded = { ...pending, completed: true, perceivedExertion: 6 };
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('receipt reacts only to a newly completed same set, not skip, history or another ID', () => {
  assert.equal(isNewSetCompletion(pending, recorded), true);
  assert.equal(isNewSetCompletion(recorded, recorded), false);
  assert.equal(isNewSetCompletion(pending, { ...recorded, id: 'set-b' }), false);
  assert.equal(isNewSetCompletion(pending, { ...pending, skipped: true }), false);
  assert.equal(isNewSetCompletion({ ...pending, skipped: true }, recorded), false);
  assert.equal(isNewSetCompletion(recorded, pending), false);
});

test('receipt displays actual values and preserves an empty announcement region before completion', () => {
  const props = { set: pending, measureMode: 'reps', loadMode: 'weighted', restSeconds: 60, onComplete: () => assert.fail('SSR must never record a set'), onSkip: () => assert.fail('SSR must never skip') };
  const initial = render(ExerciseSetRow, props);
  assert.match(initial, /role="status" aria-live="polite" aria-atomic="true"><\/div>/);
  assert.match(initial, /Concluir série/);
  const done = render(ExerciseSetRow, { ...props, set: recorded });
  for (const text of ['Registrado', '8 repetições', '10 kg', '2 min', 'esforço 6/10']) assert.ok(done.includes(text));
  assert.doesNotMatch(done, /<input|<button|<textarea/);
  const skipped = render(ExerciseSetRow, { ...props, set: { ...pending, skipped: true } });
  assert.match(skipped, /Pulado/);
  assert.doesNotMatch(skipped, /Registrado|8 repetições/);
});

test('exercise disclosure keeps fields mounted but inert while closed and shows real progress', () => {
  const props = { title: 'Exercício', subtitle: '1 de 4 séries', state: 'active', progress: 25, onToggle: () => {}, children: React.createElement('input', { 'aria-label': 'Repetições' }) };
  for (const expanded of [false, true]) {
    const html = render(ExerciseCard, { ...props, expanded });
    assert.match(html, /aria-label="Repetições"/);
    assert.equal(html.includes('inert=""'), !expanded);
    assert.equal(html.includes('aria-hidden="true"><div class="elemental-reveal-inner"'), !expanded);
    assert.match(html, /transform:scaleX\(0.25\)/);
    const id = html.match(/aria-controls="([^"]+)"/)[1];
    assert.ok(html.includes(`id="${id}"`));
  }
});

test('receipt effect cancels animation on reduced motion or unmount and does not replay history', async () => {
  // Actual effect with isolated hooks/animation doubles, not rendered-browser evidence.
  const { readFileSync } = await import('node:fs');
  const { default: ts } = await import('typescript');
  const { createRequire } = await import('node:module');
  const nodeRequire = createRequire(import.meta.url);
  const refs = [];
  let cursor = 0, effect, nextEffect, reduced = false, starts = 0, cancels = 0;
  const hooks = {
    useRef(value) { return refs[cursor++] ??= { current: value }; },
    useEffect(fn, deps) { nextEffect = { fn, deps }; },
  };
  const output = ts.transpileModule(readFileSync('src/components/fitness-kit/WorkoutSetReceipt.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', output)(name => {
    if (name === 'react') return hooks;
    if (name.includes('useMotionPreference')) return { useMotionPreference: () => reduced };
    if (name === './set-receipt') return { isNewSetCompletion };
    return nodeRequire(name);
  }, mod, mod.exports);
  const renderEffect = set => {
    cursor = 0;
    mod.exports.WorkoutSetReceipt({ set });
    refs[1].current = { animate() { starts++; return { cancel() { cancels++; } }; } };
    if (!effect || nextEffect.deps.some((value, i) => !Object.is(value, effect.deps[i]))) {
      effect?.cleanup?.();
      effect = { deps: nextEffect.deps, cleanup: nextEffect.fn() };
    }
  };
  renderEffect(recorded);
  assert.equal(starts, 0, 'initial history must not celebrate');
  renderEffect(pending);
  renderEffect(recorded);
  assert.equal(starts, 1);
  renderEffect(recorded);
  assert.equal(starts, 1, 'unrelated re-render must not replay');
  reduced = true;
  renderEffect(recorded);
  assert.equal(cancels, 1, 'OS preference change cancels running motion');
  renderEffect(pending);
  renderEffect(recorded);
  assert.equal(starts, 1, 'reduced motion still displays receipt without animation');
  reduced = false;
  renderEffect(recorded);
  renderEffect(pending);
  renderEffect(recorded);
  effect?.cleanup?.();
  assert.equal(starts, 2);
  assert.equal(cancels, 2, 'unmount cancels running motion');
});
