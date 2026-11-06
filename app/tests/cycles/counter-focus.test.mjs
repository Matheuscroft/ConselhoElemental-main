import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
const require = createRequire(import.meta.url);
const { dailyQuantity } = loadComponent('src/lib/cycles/daily-tracking.ts');

/** Executes real handlers and layout effect with isolated hooks/refs; no browser. */
function fixture(configured = false) {
  const values = [], refs = [], focuses = [], calls = [];
  let stateIndex = 0, refIndex = 0, effects = [], tree, fail = false;
  const config = { unit: 'páginas', target: 3, step: 1 };
  const props = { habit: { id: 'a', name: 'Ler', dailyEntries: [], ...(configured ? { dailyTracking: config } : {}) }, date: new Date(2026, 9, 26, 12),
    onConfigure(value) { if (fail) throw Error('Falha de gravação'); calls.push(['configure', value]); props.habit = { ...props.habit, dailyTracking: value }; },
    onRecord() { if (fail) throw Error('Falha de gravação'); calls.push(['record']); },
    onRemove(id) { if (fail) throw Error('Falha de gravação'); calls.push(['remove', id]); props.habit = { ...props.habit, dailyEntries: [] }; },
  };
  const hooks = {
    useId: () => 'counter',
    useState(initial) { const i = stateIndex++; if (!(i in values)) values[i] = initial; return [values[i], value => { values[i] = typeof value === 'function' ? value(values[i]) : value; }]; },
    useRef(initial) { return refs[refIndex++] ??= { current: initial }; },
    useLayoutEffect(fn) { effects.push(fn); },
  };
  const source = ts.transpileModule(readFileSync('src/components/cycles/CycleDailyCounter.tsx', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const mod = { exports: {} };
  new Function('require', 'module', 'exports', source)(name => name === 'react' ? hooks : name.includes('daily-tracking') ? { dailyQuantity } : require(name), mod, mod.exports);
  function flatten(node) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(flatten);
    return [node, ...flatten(node.props?.children)];
  }
  function render() {
    stateIndex = 0; refIndex = 0; effects = [];
    tree = mod.exports.CycleDailyCounter(props);
    // React replaces host refs before running layout effects. Preserve pendingFocus ref.
    refs.slice(0, 2).forEach(ref => { ref.current = null; });
    for (const node of flatten(tree)) if (node.props?.ref) node.props.ref.current = { focus(options) { focuses.push([node.props['aria-label'] ?? node.props.className, options]); } };
    effects.forEach(fn => fn());
  }
  render();
  return { props, calls, focuses, render, fail: () => { fail = true; },
    find(predicate) { const node = flatten(tree).find(predicate); assert.ok(node, 'expected UI control'); return node.props; },
  };
}
const enable = f => f.find(n => n.props?.className === 'cycle-counter-enable');
const form = f => f.find(n => n.type === 'form');
const submit = f => form(f).onSubmit({ preventDefault() {} });

test('saving configuration focuses the newly mounted record button, without extra commands or scroll', () => {
  const f = fixture(); enable(f).onClick(); f.render(); submit(f); f.render();
  assert.equal(f.calls.length, 1);
  assert.equal(f.calls[0][0], 'configure');
  assert.deepEqual(f.focuses, [['Somar 1 repetições a Ler', { preventScroll: true }]]);
  f.render(); assert.equal(f.focuses.length, 1, 'ordinary renders must not steal focus');
});

test('cancel returns to the configuration trigger, for both new and existing counters', () => {
  for (const configured of [false, true]) {
    const f = fixture(configured);
    (configured ? f.find(n => n.props?.['aria-label'] === 'Ajustar meta de Ler') : enable(f)).onClick(); f.render();
    f.find(n => n.type === 'button' && n.props?.children === 'Cancelar').onClick(); f.render();
    assert.equal(f.focuses[0][0], configured ? 'Ajustar meta de Ler' : 'cycle-counter-enable');
    assert.deepEqual(f.calls, []);
  }
});

test('undo of last quantity returns focus to recording after the history disappears', () => {
  const f = fixture(true);
  f.props.habit.dailyEntries = [{ id: 'entry', dateKey: '2026-10-26', recordedAt: '2026-10-26T12:00:00', quantity: 1, unit: 'páginas' }]; f.render();
  f.find(n => n.props?.['aria-label'] === 'Desfazer registro 1 de Ler').onClick(); f.render();
  assert.deepEqual(f.calls, [['remove', 'entry']]);
  assert.deepEqual(f.focuses, [['Somar 1 páginas a Ler', { preventScroll: true }]]);
});

test('failed save keeps the form and does not move focus or announce success', () => {
  const f = fixture(); enable(f).onClick(); f.render(); f.fail(); submit(f); f.render();
  assert.ok(form(f)); assert.deepEqual(f.focuses, []); assert.deepEqual(f.calls, []);
  assert.equal(f.find(n => n.props?.role === 'alert').children, 'Falha de gravação');
});
