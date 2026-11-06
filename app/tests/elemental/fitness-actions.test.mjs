import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadComponent } from './load-component.mjs';
const require = createRequire(import.meta.url);
const { wasSetRecorded } = loadComponent('src/components/fitness-kit/set-command-result.ts');
const pending = { id: 's', setNumber: 1, completed: false, skipped: false, loadKg: 12, reps: 8, durationSeconds: 60, perceivedExertion: 5, distanceMeters: 0, activityNotes: 'Nota' };
const session = set => ({ status: 'in_progress', exerciseResults: [{ sets: [set] }] });

test('command result must contain the exact recorded set in an active session', () => {
  for (const result of [undefined, session(pending), { ...session({ ...pending, completed: true }), status: 'completed' }, session({ ...pending, id: 'other', completed: true })]) {
    assert.equal(wasSetRecorded(result, 's', 'complete'), false);
  }
  assert.equal(wasSetRecorded(session({ ...pending, completed: true }), 's', 'complete'), true);
  assert.equal(wasSetRecorded(session({ ...pending, skipped: true }), 's', 'skip'), true);
  assert.equal(wasSetRecorded(session({ ...pending, skipped: true, completed: true }), 's', 'skip'), false);
});

function fixture(initial = pending) {
  const states = [], refs = [], calls = [], focus = [];
  let si = 0, ri = 0, effect, nextEffect, tree, mode = 'ok', result;
  const props = { set: initial, measureMode: 'reps', loadMode: 'weighted', restSeconds: 60,
    onComplete(values) { calls.push(['complete', values]); return respond('complete'); },
    onSkip() { calls.push(['skip']); return respond('skip'); },
  };
  function respond(action) {
    if (mode === 'throw') throw Error('rejected');
    result = mode === 'silent' ? session(props.set) : session({ ...props.set, completed: action === 'complete', skipped: action === 'skip' });
    return result;
  }
  const react = {
    useState(initial) { const i = si++; if (!(i in states)) states[i] = initial; return [states[i], next => { states[i] = next; }]; },
    useRef(initial) { return refs[ri++] ??= { current: initial }; },
    useLayoutEffect(fn, deps) { nextEffect = { fn, deps }; },
  };
  const output = ts.transpileModule(readFileSync('src/components/fitness-kit/ExerciseSetRow.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', output)(name => name === 'react' ? react : name.startsWith('./') ? loadComponent(`src/components/fitness-kit/${name.slice(2)}.tsx`.replace('set-command-result.tsx','set-command-result.ts')) : name === '@/lib/utils' ? loadComponent('src/lib/utils.ts') : require(name), mod, mod.exports);
  function flatten(node) { if (!node || typeof node !== 'object') return []; if (Array.isArray(node)) return node.flatMap(flatten); return [node, ...flatten(node.props?.children)]; }
  function render() {
    si = 0; ri = 0; tree = mod.exports.ExerciseSetRow(props);
    tree.props.ref.current = { focus(options) { focus.push([tree.props['aria-label'], options]); } };
    if (!effect || nextEffect.deps.some((dep, i) => dep !== effect.deps[i])) { effect = nextEffect; effect.fn(); }
  }
  render();
  return { calls, focus, props, render, mode(value) { mode = value; },
    commit() { props.set = result.exerciseResults[0].sets[0]; render(); },
    find(predicate) { return flatten(tree).find(predicate)?.props; },
    action(label) { const button = flatten(tree).find(node => node.props?.children === label); assert.ok(button); return button.props.onClick; },
  };
}

test('completion sends unchanged values once and focuses only after confirmed props replace the form', () => {
  const f = fixture(); const click = f.action('Concluir série'); click(); click();
  assert.deepEqual(f.calls, [['complete', { loadKg: 12, reps: 8, durationSeconds: 60, perceivedExertion: 5, distanceMeters: 0, activityNotes: 'Nota' }]]);
  assert.deepEqual(f.focus, []); f.commit();
  assert.deepEqual(f.focus, [['Resultado da série 1', { preventScroll: true }]]);
  f.render(); assert.equal(f.focus.length, 1);
});

test('silent rejection and thrown errors keep inputs, show feedback and permit retry', () => {
  for (const mode of ['silent', 'throw']) {
    const f = fixture(); f.mode(mode); f.action('Concluir série')(); f.render();
    assert.match(f.find(node => node.props?.role === 'alert').children, /Não foi possível registrar/);
    assert.ok(f.find(node => node.props?.ariaLabel === 'Carga da série 1'));
    assert.deepEqual(f.focus, []);
    f.mode('ok'); f.action('Concluir série')(); f.commit();
    assert.equal(f.calls.length, 2);
    assert.equal(f.focus.length, 1);
    assert.equal(f.find(node => node.props?.role === 'alert'), undefined);
  }
});

test('skip confirms its own result; mounting a historical receipt never steals focus', () => {
  const f = fixture(); f.action('Pular')(); f.commit();
  assert.deepEqual(f.calls, [['skip']]);
  assert.deepEqual(f.focus, [['Resultado da série 1', { preventScroll: true }]]);
  const history = fixture({ ...pending, completed: true });
  assert.deepEqual(history.focus, []); assert.deepEqual(history.calls, []);
  const failed = fixture(); failed.mode('silent'); failed.action('Pular')(); failed.render();
  assert.match(failed.find(node => node.props?.role === 'alert').children, /Não foi possível pular/);
  assert.deepEqual(failed.focus, []);
});
