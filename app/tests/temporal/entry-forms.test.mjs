import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
import { fixture } from '../cycles/load-store.mjs';

const require = createRequire(import.meta.url);
const recurrence = loadComponent('src/lib/temporal/recurrence.ts');
const { createAnnualEntry } = loadComponent('src/lib/temporal/annual-entry.ts');
const navigation = loadComponent('src/components/temporal/temporal-navigation.ts');
const flatten = node => Array.isArray(node) ? node.flatMap(flatten) : node && typeof node === 'object' ? [node, ...flatten(node.props?.children)] : [];
const text = node => Array.isArray(node) ? node.map(text).join('') : node && typeof node === 'object' ? text(node.props?.children) : String(node ?? '');

function formHarness(name, props) {
  const slots = []; let index = 0, tree;
  const mod = { exports: {} };
  const source = readFileSync('src/components/temporal/TemporalEntryForms.tsx', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  new Function('require', 'module', 'exports', js)(id => {
    if (id === 'react') return { useId: () => 'test', useState(initial) { const i = index++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = value; }]; } };
    if (id.includes('recurrence')) return recurrence;
    return require(id);
  }, mod, mod.exports);
  const render = () => { index = 0; tree = mod.exports[name](props); };
  const find = predicate => flatten(tree).find(predicate);
  render();
  return {
    set(name, value) { const field = find(node => node.props?.name === name); assert.ok(field, name); field.props.onChange({ target: { value } }); render(); },
    check() { find(node => node.props?.type === 'checkbox').props.onChange({ target: { checked: true } }); render(); },
    category(value) { find(node => node.props?.type === 'radio' && node.props.value === value).props.onChange(); render(); },
    cancel() { find(node => node.type === 'button' && text(node) === 'Cancelar').props.onClick(); render(); },
    submit() { tree.props.onSubmit({ preventDefault() {} }); render(); },
    value(name) { return find(node => node.props?.name === name)?.props.value; },
    error() { return text(find(node => node.props?.role === 'alert')); },
  };
}

test('annual form creates one real yearly habit with notes and a final date in another year, without rewarding it', () => {
  const { store } = fixture(); let closed = false;
  const before = JSON.stringify(store.getState().user);
  const h = formHarness('AnnualEntryForm', { initialDate: new Date(2028, 1, 29), onCancel() {}, onSave(input) { createAnnualEntry(store.getState(), input); closed = true; } });
  h.set('title', '  Revisar objetivos  '); h.set('notes', 'Notas pessoais'); h.check(); h.set('until', '2032-02-29'); h.submit();
  const habits = store.getState().habits;
  assert.equal(closed, true); assert.equal(habits.length, 1);
  assert.equal(habits[0].name, 'Revisar objetivos'); assert.equal(habits[0].description, 'Notas pessoais');
  assert.deepEqual(habits[0].recurrenceConfig, { month: 2, day: 29, until: '2032-02-29' });
  assert.equal(JSON.stringify(store.getState().user), before);
});

test('birthday uses the existing commitment command, never a habit or automatic reward', () => {
  const { store } = fixture();
  const h = formHarness('AnnualEntryForm', { initialDate: new Date(2027, 4, 10), onCancel() {}, onSave(input) { createAnnualEntry(store.getState(), input); } });
  h.category('birthday'); h.set('title', 'Pessoa teste'); h.submit();
  assert.equal(store.getState().habits.length, 0);
  assert.equal(store.getState().commitments.length, 1);
  assert.equal(store.getState().commitments[0].title, 'Aniversário: Pessoa teste');
  assert.equal(store.getState().commitments[0].recurrence, 'YEARLY');
});

test('annual invalid end/date and failed saving preserve the complete draft and do not close', () => {
  let calls = 0;
  const h = formHarness('AnnualEntryForm', { initialDate: new Date(2027, 5, 20), onCancel() {}, onSave() { calls++; throw new Error('Falha de gravação isolada'); } });
  h.set('title', 'Guardar'); h.set('notes', 'Não perder'); h.check(); h.set('until', '2026-01-01'); h.submit();
  assert.equal(calls, 0); assert.match(h.error(), /posterior/); assert.equal(h.value('until'), '2026-01-01');
  h.set('until', '2030-06-20'); h.set('date', '2027-02-30'); h.submit(); assert.equal(calls, 0);
  h.set('date', '2027-06-20'); h.submit(); assert.equal(calls, 1); assert.match(h.error(), /Falha de gravação/);
  assert.equal(h.value('notes'), 'Não perder'); assert.equal(h.value('title'), 'Guardar');
});

test('commitment editing preserves its recurrence and supports removing a final limit', () => {
  const { store } = fixture();
  const saved = store.getState().addCommitment({ title: 'Revisão', date: new Date(2027, 0, 9), recurrence: 'MONTHLY', untilDate: '2028-01-09' });
  const h = formHarness('CommitmentForm', { initial: saved, initialDate: new Date(), onCancel() {}, onSave(input) { store.getState().updateCommitment(saved.id, input); } });
  h.set('title', 'Revisão atualizada'); h.set('until', ''); h.submit();
  const result = store.getState().commitments[0];
  assert.equal(result.id, saved.id); assert.equal(result.recurrence, 'MONTHLY'); assert.equal(result.untilDate, undefined);
  assert.equal(result.title, 'Revisão atualizada'); assert.equal(recurrence.dateToInput(result.date), '2027-01-09');
});

test('commitment once clears inactive recurrence limit and failure keeps entered fields', () => {
  let saved;
  const h = formHarness('CommitmentForm', { initialDate: new Date(2027, 0, 9), onCancel() {}, onSave(input) { saved = input; throw new Error('Não salvo'); } });
  h.set('title', 'Consulta'); h.set('recurrence', 'WEEKLY'); h.set('until', '2026-01-01'); h.submit();
  assert.equal(saved, undefined); assert.match(h.error(), /posterior/);
  h.set('recurrence', 'ONCE'); h.submit(); assert.equal(saved.untilDate, undefined); assert.match(h.error(), /Não salvo/);
  assert.equal(h.value('title'), 'Consulta'); assert.equal(h.value('date'), '2027-01-09');
});

test('year URL survives reload, rejects invalid years, and switches periods without stale year parameters', () => {
  const fallback = new Date(2026, 9, 30);
  const href = navigation.temporalViewHref('/temporal/ano', new Date(2032, 5, 20), null, '?custom=keep&mes=2026-10&dia=2026-10-31');
  assert.equal(href, '/temporal/ano?custom=keep&ano=2032');
  assert.equal(navigation.readTemporalView(href.split('?')[1], fallback, 'year').anchorDate.getFullYear(), 2032);
  for (const value of ['bad', '0', '0999', '2032junk']) assert.equal(navigation.readTemporalView(`?ano=${value}`, fallback, 'year').anchorDate.getFullYear(), 2026);
  assert.equal(navigation.temporalViewHref('/temporal/mes', new Date(2032, 0, 1), null, '?ano=2032'), '/temporal/mes?mes=2032-01');
  assert.equal(navigation.safeTemporalReturn({ temporalReturn: href }), href);
});

test('forms expose visible labels, native dates, submit semantics and recurrence explanation', () => {
  const forms = loadComponent('src/components/temporal/TemporalEntryForms.tsx');
  for (const name of ['AnnualEntryForm', 'CommitmentForm']) {
    const output = renderToStaticMarkup(React.createElement(forms[name], { initialDate: new Date(2028, 1, 29), onSave() {}, onCancel() {} }));
    assert.match(output, /<form/); assert.match(output, /type="submit"/); assert.match(output, /type="date"/); assert.match(output, /<label for=/);
    assert.doesNotMatch(output, /onPointer|touch-action/);
  }
});

test('calendar groups a daily commitment once for management and deletes only after explicit confirmation', () => {
  const { store } = fixture();
  const saved = store.getState().addCommitment({ title: 'Lembrete recorrente', date: new Date(2027, 0, 1), recurrence: 'DAILY' });
  const beforeUser = JSON.stringify(store.getState().user);
  const temporal = loadComponent('src/lib/temporal/index.ts');
  const slots = []; let index = 0, tree;
  const mod = { exports: {} };
  const source = readFileSync('src/pages/temporal/TemporalCalendarPage.tsx', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const stub = new Proxy({}, { get: (_, key) => String(key) });
  new Function('require', 'module', 'exports', js)(id => {
    if (id === 'react') return { useMemo: fn => fn(), useEffect() {}, useState(initial) { const i = index++; if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial; return [slots[i], value => { slots[i] = value; }]; } };
    if (id === 'react/jsx-runtime') return require(id);
    if (id === '@/stores/appStore') return { useAppStore: selector => selector(store.getState()) };
    if (id === '@/lib/temporal/recurrence') return recurrence;
    if (id === '@/lib/temporal') return { ...temporal, useWeekStartsOnPreference: () => ({ weekStartsOn: 1 }) };
    if (id.includes('useTemporalView')) return { useTemporalView: () => ({ anchorDate: new Date(2027, 0, 1), selectedDayStamp: null, returnTo: '/temporal/calendario?mes=2027-01', setAnchorDate() {}, setSelectedDayStamp() {} }) };
    if (id === '@/constants') return { WEEKDAYS_SHORT: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'], getMoonPhase: () => ({ name: 'Lua', icon: '' }), getMeteorShowerPeak: () => null, getZodiacIngress: () => null, getZodiacIngresses: () => [], getZodiacSign: () => ({ name: 'Signo' }) };
    return stub;
  }, mod, mod.exports);
  const render = () => { index = 0; tree = mod.exports.TemporalCalendarPage(); };
  const click = label => { const button = flatten(tree).find(node => node.type === 'button' && text(node) === label); assert.ok(button, label); button.props.onClick(); render(); };
  render();
  const buttons = flatten(tree).filter(node => node.type === 'button');
  assert.equal(buttons.filter(node => text(node) === 'Editar').length, 1, text(tree));
  assert.match(text(tree), /31 ocorrências neste mês/);
  assert.match(text(tree), /A partir de 01\/01\/2027/);
  const weekdays = flatten(tree).filter(node => node.type === 'p' && ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].includes(text(node))).map(text);
  assert.deepEqual(weekdays, ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']);
  click('Excluir'); assert.equal(store.getState().commitments.length, 1);
  click('Manter compromisso'); assert.equal(store.getState().commitments.length, 1);
  click('Excluir'); click('Confirmar exclusão');
  assert.equal(store.getState().commitments.find(item => item.id === saved.id), undefined);
  assert.equal(JSON.stringify(store.getState().user), beforeUser);
});

test('temporal tabs retain the browsed year and month; month showcase carries a safe return to the selected year', () => {
  const { MonthShowcase } = loadComponent('src/components/temporal/MonthShowcase.tsx');
  const card = MonthShowcase({ date: new Date(2032, 5, 1), completed: 0, commitments: 0, score: 0, current: false, returnTo: '/temporal/ano?ano=2032' });
  const monthLink = flatten(card).find(node => node.props?.to);
  assert.equal(monthLink.props.to, '/temporal/mes?mes=2032-06');
  assert.deepEqual(monthLink.props.state, { temporalReturn: '/temporal/ano?ano=2032' });
  const mod = { exports: {} };
  const js = ts.transpileModule(readFileSync('src/pages/temporal/TemporalLayout.tsx', 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const stub = new Proxy({}, { get: (_, key) => String(key) });
  new Function('require', 'module', 'exports', js)(id => {
    if (id === 'react') return { useState: fn => [fn()] };
    if (id === 'react/jsx-runtime') return require(id);
    if (id === 'react-router-dom') return { Link: 'Link', NavLink: 'NavLink', useLocation: () => ({ pathname: '/temporal/mes', search: '?mes=2032-06', state: { temporalReturn: '/temporal/ano?ano=2032' } }) };
    if (id.includes('temporal-navigation')) return navigation;
    return stub;
  }, mod, mod.exports);
  const tree = mod.exports.TemporalLayout({ title: 'Temporal - Mês', subtitle: 'Teste', children: 'Agenda' });
  const links = flatten(tree).filter(node => node.type === 'NavLink');
  assert.equal(links.find(node => text(node) === 'Ano').props.to, '/temporal/ano?ano=2032');
  assert.equal(links.find(node => text(node) === 'Calendário').props.to, '/temporal/calendario?mes=2032-06');
  assert.equal(flatten(tree).find(node => text(node) === 'Voltar à visão anterior')?.props.to, '/temporal/ano?ano=2032');
});


test('cancelling either temporal form invokes only cancel and writes nothing', () => {
  const { store } = fixture();
  const before = JSON.stringify({ habits: store.getState().habits, commitments: store.getState().commitments, user: store.getState().user });
  for (const name of ['AnnualEntryForm', 'CommitmentForm']) {
    let cancelled = 0, saved = 0;
    const h = formHarness(name, { initialDate: new Date(2032, 5, 20), onCancel() { cancelled++; }, onSave() { saved++; } });
    h.set('title', 'Rascunho cancelado'); h.cancel();
    assert.equal(cancelled, 1); assert.equal(saved, 0);
  }
  assert.equal(JSON.stringify({ habits: store.getState().habits, commitments: store.getState().commitments, user: store.getState().user }), before);
});

test('retry after a pre-write failure creates exactly one commitment and retains the chosen date', () => {
  const { store } = fixture(); let unavailable = true;
  const h = formHarness('CommitmentForm', { initialDate: new Date(2032, 5, 20), onCancel() {}, onSave(input) {
    if (unavailable) throw new Error('Indisponível antes da gravação');
    store.getState().addCommitment(input);
  } });
  h.set('title', 'Revisar agenda'); h.set('recurrence', 'WEEKLY'); h.submit();
  assert.equal(store.getState().commitments.length, 0); assert.match(h.error(), /Indisponível/);
  unavailable = false; h.submit();
  assert.equal(store.getState().commitments.length, 1);
  assert.equal(recurrence.dateToInput(store.getState().commitments[0].date), '2032-06-20');
  assert.equal(store.getState().commitments[0].recurrence, 'WEEKLY');
});
