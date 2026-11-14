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

const { DURATION, EASE, beat, beatUnless, seconds, STILL, STAGGER, stagger } = load('src/lib/motion/motion.ts');
const css = readFileSync(resolve(root, 'src/styles/elemental-motion.css'), 'utf8');
const rootBlock = css.slice(css.indexOf(':root {'), css.indexOf('}', css.indexOf(':root {')));

const cssDurations = Object.fromEntries(
  [...rootBlock.matchAll(/--ds-duration-([a-z]+):\s*(\d+)ms/g)].map(([, name, ms]) => [name, Number(ms)]),
);
const cssEases = Object.fromEntries(
  [...rootBlock.matchAll(/--ds-ease(?:-([a-z]+))?:\s*cubic-bezier\(([^)]+)\)/g)].map(([, name, points]) => [
    name ?? 'standard',
    points.split(',').map((value) => Number(value.trim())),
  ]),
);

// The guarantee the whole system rests on. CSS animates most of the app and
// framer-motion animates the rest; if the two drift the app stops having one
// sense of time, and nothing else here would notice.
test('every beat in the stylesheet is the same beat in TypeScript', () => {
  assert.deepEqual(cssDurations, { ...DURATION }, 'durations must match exactly, in both directions');
});

test('every curve in the stylesheet is the same curve in TypeScript', () => {
  assert.deepEqual(cssEases, Object.fromEntries(Object.entries(EASE).map(([k, v]) => [k, [...v]])));
});

test('the beats run from a press to a celebration, in order', () => {
  const order = ['press', 'feedback', 'reveal', 'settle', 'conjure'];
  assert.deepEqual(Object.keys(DURATION), order, 'the names carry the scale, so the order is part of it');
  for (let i = 1; i < order.length; i += 1) {
    assert.ok(DURATION[order[i]] > DURATION[order[i - 1]], `${order[i]} must be longer than ${order[i - 1]}`);
  }
});

test('only the celebration overshoots', () => {
  // A curve passes its target when a control point rises above 1. That is what
  // makes earning something feel unlike a number quietly changing.
  const overshoots = (points) => points[1] > 1 || points[3] > 1;
  assert.ok(overshoots(EASE.conjure), 'conjure has to overshoot');
  assert.ok(!overshoots(EASE.standard), 'the everyday curve must not');
  assert.ok(!overshoots(EASE.exit), 'leaving must not bounce');
});

test('a beat asked for by name carries its own curve', () => {
  assert.deepEqual(beat('reveal'), { duration: 0.24, ease: [0.23, 1, 0.32, 1] });
  assert.deepEqual(beat('conjure'), { duration: 0.72, ease: [0.22, 1.4, 0.36, 1] },
    'conjure brings the overshoot without being asked');
  assert.deepEqual(beat('settle', { ease: 'exit' }), { duration: 0.42, ease: [0.4, 0, 1, 1] });
  assert.equal(beat('feedback', { delay: 0.1 }).delay, 0.1);
  assert.equal('delay' in beat('feedback'), false, 'no delay unless one was asked for');
});

test('reduced motion arrives at the end state instead of losing it', () => {
  assert.deepEqual(beatUnless(true, 'conjure'), STILL);
  assert.equal(STILL.duration, 0, 'still means instant, never absent');
  assert.deepEqual(beatUnless(false, 'conjure'), beat('conjure'));
});

test('seconds are what framer-motion counts in', () => {
  assert.equal(seconds('press'), 0.12);
  assert.equal(seconds('conjure'), 0.72);
});

test('the stagger step is one number, shared by the stylesheet', () => {
  const css = readFileSync(resolve(root, 'src/styles/elemental-motion.css'), 'utf8');
  const declared = /--ds-stagger:\s*(\d+)ms/.exec(css);
  assert.ok(declared, 'the stylesheet must declare the step too');
  assert.equal(Number(declared[1]), STAGGER);
  assert.equal(stagger(0), 0);
  assert.equal(stagger(3), 0.18, 'the third item waits three steps');
});

// Only two of the five beats were covered by reduced motion, and only inside
// one class: settle and conjure had no rule and nine stylesheets use them.
// The collapse lives at the token, so this is what stops a sixth beat from
// being added without it.
test('every beat collapses under reduced motion, so no screen has to remember', () => {
  const reduzido = /@media \(prefers-reduced-motion: reduce\) \{\s*:root \{([^}]*)\}/.exec(css);
  assert.ok(reduzido, 'the stylesheet must collapse the tokens inside a reduced-motion block at the root');

  const colapsadas = Object.fromEntries(
    [...reduzido[1].matchAll(/--ds-duration-([a-z]+):\s*([\d.]+)ms/g)].map(([, nome, ms]) => [nome, Number(ms)]),
  );

  for (const nome of Object.keys(DURATION)) {
    assert.ok(nome in colapsadas, `${nome} has no reduced-motion value: a screen using it keeps moving`);
    // Not zero on purpose: a zero-length transition never fires transitionend.
    assert.ok(colapsadas[nome] > 0 && colapsadas[nome] <= 1, `${nome} must collapse to under 1ms, not stay at ${colapsadas[nome]}ms`);
  }
  assert.deepEqual(Object.keys(colapsadas).sort(), Object.keys(DURATION).sort(), 'and nothing unknown may sit beside them');

  const passo = /--ds-stagger:\s*(\d+)ms/.exec(reduzido[1]);
  assert.ok(passo && Number(passo[1]) === 0, 'staggered delays must not wait either');
});
