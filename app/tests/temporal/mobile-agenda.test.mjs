import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
import { fixture } from '../cycles/load-store.mjs';

const { readTemporalView, temporalViewHref, safeTemporalReturn, preserveTemporalScroll } = loadComponent('src/components/temporal/temporal-navigation.ts');
const { dateToInput, validateRecurrence } = loadComponent('src/lib/temporal/recurrence.ts');
const { TemporalDayAgenda, temporalActivityHref } = loadComponent('src/components/temporal/TemporalDayAgenda.tsx');
const { TemporalReturnLink } = loadComponent('src/components/temporal/TemporalReturnLink.tsx');
const { CycleCreationForm } = loadComponent('src/components/cycles/CycleCreationForm.tsx');
const { CycleRoutineToolbar } = loadComponent('src/components/cycles/CycleRoutineToolbar.tsx');
const { TemporalMonthPicker } = loadComponent('src/components/temporal/TemporalMonthPicker.tsx');
const date = new Date(2026, 11, 31, 12);
const html = (element, location = '/temporal/semana') => renderToStaticMarkup(React.createElement(MemoryRouter, { initialEntries: [location] }, element));

test('week and month URLs survive year rollover and preserve the exact selected local day', () => {
  const fallback = new Date(2026, 9, 29);
  for (const [path, kind] of [['/temporal/semana', 'week'], ['/temporal/mes', 'month'], ['/temporal/calendario', 'calendar']]) {
    const selected = new Date(2027, 0, 2);
    const href = temporalViewHref(path, selected, selected, '?custom=kept');
    const parsed = readTemporalView(new URL(href, 'https://test.invalid').search, fallback, kind);
    assert.equal(dateToInput(parsed.anchorDate), kind === 'week' ? '2027-01-02' : '2027-01-01');
    assert.equal(dateToInput(new Date(parsed.selectedDayStamp)), '2027-01-02');
    assert.ok(href.includes('custom=kept'));
    const closed = temporalViewHref(path, parsed.anchorDate, null, href.split('?')[1]);
    assert.equal(new URL(closed, 'https://test.invalid').searchParams.has('dia'), false);
  }
});

test('malformed dates use safe view defaults and return links accept only local temporal pages', () => {
  for (const query of ['?data=2026-02-30', '?data=bad', '?mes=2026-13&dia=invalid']) {
    assert.equal(readTemporalView(query, date, 'week').anchorDate, date);
    assert.equal(readTemporalView(query, date, 'month').anchorDate, date);
  }
  assert.equal(safeTemporalReturn({ temporalReturn: '/temporal/mes?mes=2027-01&dia=2027-01-02' }), '/temporal/mes?mes=2027-01&dia=2027-01-02');
  for (const value of [null, {}, { temporalReturn: 'https://external.test/temporal/semana' }, { temporalReturn: '//external.test' }, { temporalReturn: 'javascript:alert(1)' }, { temporalReturn: '/temporal/../auth' }, { temporalReturn: '/temporal/unknown' }]) assert.equal(safeTemporalReturn(value), null);
  assert.equal(preserveTemporalScroll('/temporal/semana', '/temporal/semana', { temporalViewSelection: true }), true);
  assert.equal(preserveTemporalScroll('/rituais', '/temporal/semana', { temporalViewSelection: true }), false);
  assert.equal(preserveTemporalScroll('/temporal/semana', '/temporal/mes', { temporalViewSelection: true }), false);
  assert.equal(preserveTemporalScroll('/ciclos', '/ciclos', { temporalViewSelection: true }), false);
  assert.equal(preserveTemporalScroll('/temporal/semana', '/temporal/semana', {}), false);
  assert.equal(dateToInput(readTemporalView('?data=2026-12-31&dia=2027-01-20', date, 'week').anchorDate), '2027-01-20');
});

test('actual view hook replaces only URL presentation state; choosing a day then returning restores it', () => {
  const require = createRequire(import.meta.url);
  const source = readFileSync(new URL('../../src/components/temporal/useTemporalView.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  let location = { pathname: '/temporal/semana', search: '?data=2026-12-31' };
  const calls = [], mod = { exports: {} };
  const slots = []; let stateIndex = 0;
  new Function('require', 'module', 'exports', js)(name => {
    if (name === 'react') return { useState: initial => {
      const index = stateIndex++;
      if (!(index in slots)) slots[index] = index === 0 ? date.getTime() : typeof initial === 'function' ? initial() : initial;
      return [slots[index], next => { slots[index] = next; }];
    } };
    if (name === 'react-router-dom') return { useLocation: () => location, useNavigate: () => (href, options) => {
      calls.push({ href, options }); const url = new URL(href, 'https://test.invalid'); location = { pathname: url.pathname, search: url.search, state: options.state };
    } };
    if (name.includes('temporal-navigation')) return { readTemporalView, temporalViewHref, safeTemporalReturn };
    if (name.includes('temporal/recurrence')) return loadComponent('src/lib/temporal/recurrence.ts');
    if (name.includes('temporal/date')) return loadComponent('src/lib/temporal/date.ts');
    return require(name);
  }, mod, mod.exports);
  const render = (...args) => { stateIndex = 0; return mod.exports.useTemporalView(...args); };
  let view = render('week', true);
  assert.equal(view.anchorDate, render('week', true).anchorDate, 'unrelated renders must not invalidate grids or calendar request dependencies');
  view.setSelectedDayStamp(new Date(2027, 0, 2).getTime());
  view = render('week', true);
  assert.equal(dateToInput(new Date(view.selectedDayStamp)), '2027-01-02');
  assert.equal(safeTemporalReturn({ temporalReturn: view.returnTo }), view.returnTo);
  assert.equal(calls[0].options.replace, true);
  assert.equal(preserveTemporalScroll(location.pathname, location.pathname, calls[0].options.state), true);
  view.setAnchorDate(current => new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7));
  assert.equal(new URL(calls[1].href, 'https://test.invalid').searchParams.has('dia'), false);
  location = { pathname: '/temporal/calendario', search: '?mes=2027-01' };
  view = render('calendar');
  const monthAnchor = view.anchorDate;
  view.setSelectedDayStamp(new Date(2027, 0, 20).getTime());
  assert.equal(render('calendar').anchorDate, monthAnchor, 'changing a day in the same month must not refetch the calendar month');
  location = { pathname: '/temporal/mes', search: '?mes=2032-06', state: { temporalReturn: '/temporal/ano?ano=2032', unrelated: 'drop' } };
  view = render('month');
  view.setSelectedDayStamp(new Date(2032, 5, 20).getTime());
  assert.equal(location.state.temporalReturn, '/temporal/ano?ano=2032', 'selecting a day must keep the safe year return');
  assert.equal(location.state.unrelated, undefined);
  view = render('month'); view.setSelectedDayStamp(null);
  assert.equal(location.state.temporalReturn, '/temporal/ano?ano=2032', 'closing the day must retain the year return');
  assert.equal(new URL(calls.at(-1).href, 'https://test.invalid').searchParams.has('dia'), false);
  view = render('month'); view.setAnchorDate(new Date(2032, 6, 1));
  assert.equal(location.state.temporalReturn, '/temporal/ano?ano=2032', 'changing month must retain the year return');
  location = { pathname: '/temporal/mes', search: '?mes=2032-06', state: { temporalReturn: 'https://outside.test', unrelated: 'drop' } };
  view = render('month'); view.setSelectedDayStamp(new Date(2032, 5, 20).getTime());
  assert.deepEqual(location.state, { temporalViewSelection: true }, 'invalid origins and unrelated state must not propagate');

});

test('day agenda links exact activity IDs and date with a return context; scheduled completions are not duplicated', () => {
  const events = [{ id: 'event', sourceType: 'habit', sourceId: 'done', title: 'Feito', occurredAt: date, dayStamp: date.getTime(), score: 0 }];
  const commitments = [
    { id: 'h1', sourceType: 'habit', sourceId: 'live', title: 'Atividade <real>', date, kind: 'recurring' },
    { id: 'h2', sourceType: 'habit', sourceId: 'done', title: 'Feito', date, kind: 'recurring' },
    { id: 't', sourceType: 'task', sourceId: 'task-id', title: 'Ritual', date, kind: 'due' },
    { id: 'c', sourceType: 'commitment', sourceId: 'c', title: 'Lembrete', date, kind: 'due' },
  ];
  const before = JSON.stringify({ events, commitments });
  const output = html(React.createElement(TemporalDayAgenda, { date, events, commitments, returnTo: '/temporal/semana?data=2026-12-31&dia=2026-12-31' }));
  assert.match(output, /3 itens/);
  assert.match(output, /Atividade &lt;real&gt;/);
  assert.match(output, /atividade=live&amp;data=2026-12-31/);
  assert.match(output, /view=lista&amp;atividade=task-id/);
  assert.equal((output.match(/<strong>Feito<\/strong>/g) ?? []).length, 1);
  assert.match(output, /0 pontos registrados/);
  assert.match(output, /compromisso sem conclusão automática/);
  assert.equal(JSON.stringify({ events, commitments }), before);
  assert.equal(temporalActivityHref({ sourceType: 'google', sourceId: 'g', date }), null);
});

test('empty day offers a routine destination with no invented percentage or XP; closed history is optional', () => {
  const output = html(React.createElement(TemporalDayAgenda, { date, events: [], commitments: [], returnTo: '/temporal/semana?data=2026-12-31' }));
  assert.match(output, /Sem itens pendentes/); assert.match(output, /Abrir rotina deste dia/);
  assert.doesNotMatch(output, /<details|%|XP|<progress/);
});

test('return notice is visible only with a safe source and keeps the selected day in its actual href', () => {
  const path = '/temporal/mes?mes=2026-12&dia=2026-12-31';
  const output = html(React.createElement(TemporalReturnLink), { pathname: '/rituais', state: { temporalReturn: path } });
  assert.match(output, /Voltar à agenda selecionada/); assert.match(output, /dia=2026-12-31/);
  assert.equal(html(React.createElement(TemporalReturnLink), '/rituais'), '');
  assert.equal(html(React.createElement(TemporalReturnLink), { pathname: '/temporal/mes', state: { temporalReturn: path } }), '');
});

test('quick cycle uses explicit monthly/yearly input, retains form on error and preserves ordinary scoring defaults', () => {
  const source = readFileSync(new URL('../../src/pages/Ciclos.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('Ciclos.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleQuickCreateCycle') initializer = node.initializer.getText(ast); ts.forEachChild(node, visit); }
  visit(ast);
  const js = ts.transpileModule(`const handler = ${initializer};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const [type, config, valid] of [['MONTHLY', {}, false], ['MONTHLY', { daysOfMonth: [31] }, true], ['YEARLY', { month: 2, day: 29 }, true]]) {
    const f = fixture(), previousUser = JSON.stringify(f.store.getState().user);
    let closed = false, cleared = false, error;
    const scope = { quickCreateCycleName: 'Minha atividade', quickCreateCycleSchedule: { type, config }, selectedDate: date, validateRecurrence,
      addHabit: f.store.getState().addHabit, setQuickCreateCycleName: () => { cleared = true; }, setQuickCreateCycleSchedule: () => {},
      setQuickCreateCycleError: value => { error = value; }, setShowQuickCreateCycle: value => { closed = !value; },
    };
    const result = new Function(...Object.keys(scope), `${js}; return handler;`)(...Object.values(scope))();
    assert.equal(result, valid); assert.equal(closed, valid); assert.equal(cleared, valid);
    assert.equal(f.store.getState().habits.length, valid ? 1 : 0);
    assert.equal(JSON.stringify(f.store.getState().user), previousUser);
    if (valid) {
      const habit = f.store.getState().habits[0];
      assert.equal(habit.recurrenceType, type); assert.deepEqual(habit.recurrenceConfig, config);
      assert.equal(habit.plannedPoints, 1); assert.equal(habit.plannedTimeMinutes, 0);
    } else assert.match(error, /dia do mês/);
  }
});

test('Ciclos accepts a date-only entry without choosing or completing an activity', () => {
  const { parseDestinyDate } = loadComponent('src/components/destiny/destiny-options.ts');
  const source = readFileSync(new URL('../../src/pages/Ciclos.tsx', import.meta.url), 'utf8');
  const fragment = source.slice(source.indexOf('  const destinyHabitId ='), source.indexOf('  const dayShortcuts ='));
  const js = ts.transpileModule(fragment, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const query of ['data=2027-01-02', 'data=2027-01-02&atividade=known', 'data=2027-01-02&atividade=missing']) {
    let selected, filters;
    const habit = { id: 'known', name: 'Atividade', title: 'Atividade' };
    const scope = { destinyParams: new URLSearchParams(query), destinyAccountId: 'local', appliedDestinyIntent: null,
      location: { state: null }, isCycleDateSelection: loadComponent('src/components/cycles/cycle-date-navigation.ts').isCycleDateSelection,
      habits: [habit], findHabitById: (_habits, id) => id === habit.id ? habit : undefined, parseDestinyDate,
      setAppliedDestinyIntent: () => {}, setSelectedDate: value => { selected = value; }, setVisibleDaysCenterDate: () => {},
      setWorkspaceView: () => {}, setCycleFilters: value => { filters = value; },
    };
    new Function(...Object.keys(scope), js)(...Object.values(scope));
    if (query.includes('missing')) assert.equal(selected, undefined);
    else {
      assert.equal(dateToInput(selected), '2027-01-02');
      assert.equal(filters.query, query.includes('known') ? 'Atividade' : '');
    }
  }
});

test('cycle composer accepts an agenda slot and routine toolbar links the real selected week', () => {
  const output = html(React.createElement(CycleCreationForm, { kind: 'cycle', name: 'Custom', agenda: React.createElement('p', null, 'Agenda escolhida'), startLabel: '31/12/2026', onNameChange() {}, onSubmit() {}, onCancel() {} }));
  assert.match(output, /Agenda escolhida/); assert.doesNotMatch(output, /Quando faz parte da sua rotina/);
  const toolbar = html(React.createElement(CycleRoutineToolbar, { title: 'Ciclos', filters: { query: '', element: 'all', status: 'all' }, onChange() {}, total: 3, completed: 1, shown: 3, order: 'ordered', onOrder() {}, agendaHref: '/temporal/semana?data=2026-12-31' }));
  assert.match(toolbar, /1 de 3 itens concluídos/); assert.match(toolbar, /Planejar esta semana/); assert.match(toolbar, /data=2026-12-31/);
});

test('compact month preserves leap-year dates, weekday alignment and exact day-selection callbacks', () => {
  const { getMonthMetrics } = loadComponent('src/lib/temporal/metrics.ts');
  const days = getMonthMetrics([], [], new Date(2028, 1, 1)).days;
  const nodes = (node, type) => React.isValidElement(node) ? [...(node.type === type ? [node] : []), ...React.Children.toArray(node.props.children).flatMap(child => nodes(child, type))] : [];
  for (const weekStartsOn of [0, 1]) {
    let selected;
    const tree = TemporalMonthPicker({ days, weekStartsOn, selectedDayStamp: days[28].dayStamp, onSelect: stamp => { selected = stamp; } });
    const buttons = nodes(tree, 'button');
    assert.equal(buttons.length, 29);
    assert.equal(buttons[28].props['aria-pressed'], true);
    assert.match(buttons[28].props['aria-label'], /29 de fevereiro de 2028/);
    assert.equal(nodes(tree, 'span').filter(node => String(node.props['aria-hidden']) === 'true').length, weekStartsOn === 0 ? 2 : 1);
    buttons[28].props.onClick(); assert.equal(selected, days[28].dayStamp);
  }
});
