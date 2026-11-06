import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
const require = createRequire(import.meta.url);
const navigation = loadComponent('src/components/temporal/temporal-navigation.ts');
const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === 'object' ? [node, ...flatten(node.props?.children)] : [];
const text = node => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : String(node ?? '');

function renderLayout(location) {
  const mod = { exports: {} };
  const js = ts.transpileModule(readFileSync('src/pages/temporal/TemporalLayout.tsx', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const stub = new Proxy({}, { get: (_, key) => String(key) });
  new Function('require', 'module', 'exports', js)(id => {
    if (id === 'react') return { useState: () => [new Date(2026, 9, 30)] };
    if (id === 'react/jsx-runtime') return require(id);
    if (id === 'react-router-dom') return { Link: 'Link', NavLink: 'NavLink', useLocation: () => location };
    if (id.includes('temporal-navigation')) return navigation;
    return stub;
  }, mod, mod.exports);
  return flatten(mod.exports.TemporalLayout({ title: 'Temporal', subtitle: 'Teste', children: 'Agenda' }));
}

test('selected local day passes between calendar/month/week tabs, including year rollover', () => {
  for (const [pathname, search, day] of [
    ['/temporal/calendario', '?mes=2027-01&dia=2027-01-20', '2027-01-20'],
    ['/temporal/mes', '?mes=2026-12&dia=2026-12-31', '2026-12-31'],
    ['/temporal/semana', '?data=2026-12-28&dia=2027-01-02', '2027-01-02'],
  ]) {
    const nodes = renderLayout({ pathname, search });
    const get = label => nodes.find(n => n.type === 'NavLink' && text(n) === label).props.to;
    const week = new URL(get('Semana'), 'https://test.invalid');
    assert.equal(week.searchParams.get('data'), day);
    assert.equal(week.searchParams.get('dia'), day);
    for (const label of ['Mês', 'Calendário']) {
      const url = new URL(get(label), 'https://test.invalid');
      assert.equal(url.searchParams.get('mes'), day.slice(0, 7));
      assert.equal(url.searchParams.get('dia'), day);
    }
    assert.equal(new URL(get('Ano'), 'https://test.invalid').searchParams.get('ano'), day.slice(0, 4));
  }
});

test('without a selected day, tabs use the chosen period and never invent a selected occurrence', () => {
  for (const [pathname, search, expected] of [['/temporal/ano', '?ano=2032', '2032-01-01'], ['/temporal/mes', '?mes=2032-06&dia=invalid', '2032-06-01']]) {
    const nodes = renderLayout({ pathname, search, state: { temporalReturn: 'https://external.test' } });
    const week = nodes.find(n => n.type === 'NavLink' && text(n) === 'Semana').props.to;
    assert.equal(new URL(week, 'https://test.invalid').searchParams.get('data'), expected);
    assert.equal(new URL(week, 'https://test.invalid').searchParams.has('dia'), false);
    assert.equal(nodes.some(n => text(n) === 'Voltar à visão anterior'), false);
  }
});
