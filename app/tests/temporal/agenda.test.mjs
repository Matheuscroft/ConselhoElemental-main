import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import ts from 'typescript';
import { loadComponent } from '../elemental/load-component.mjs';
import { fixture } from '../cycles/load-store.mjs';

const { recurrenceMatchesDate, validateRecurrence, dateFromInput, dateToInput } = loadComponent('src/lib/temporal/recurrence.ts');
const { habitMatchesDate } = loadComponent('src/lib/temporal/habit-schedule.ts');
const { buildTemporalCommitments, buildTemporalEvents, buildOwnTemporalCommitments } = loadComponent('src/lib/temporal/selectors.ts');
const { createAnnualEntry } = loadComponent('src/lib/temporal/annual-entry.ts');
const { RecurrenceEditor } = loadComponent('src/components/cycles/RecurrenceEditor.tsx');
const { DayDetailsDialog } = loadComponent('src/components/temporal/DayDetailsDialog.tsx');
const date = (year, month, day) => new Date(year, month - 1, day, 12);
const base = { id: 'annual', name: 'Anual', createdAt: date(2025, 11, 15), recurrenceType: 'YEARLY', recurrenceConfig: {}, childHabits: [], completions: [] };
const snapshot = (extra = {}) => ({ tasks: [], habits: [], cycleSequences: [], projects: [], quests: [], ...extra });

test('annual compatibility, explicit date and sequence use one eligibility rule without rewriting the old record', () => {
  const before = JSON.stringify(base);
  for (const habit of [base, { ...base, recurrenceConfig: { month: 2, day: 29 } }]) {
    const days = [date(2026, 11, 14), date(2026, 11, 15), date(2026, 11, 16), date(2028, 2, 29)];
    for (const day of days) {
      const items = buildTemporalCommitments(snapshot({ habits: [habit] }), day, day);
      assert.equal(items.length > 0, habitMatchesDate(habit, day));
      assert.equal(recurrenceMatchesDate(habit, day), habitMatchesDate(habit, day));
    }
  }
  assert.equal(habitMatchesDate(base, date(2024, 11, 15)), false);
  assert.equal(habitMatchesDate(base, date(2026, 11, 14)), false);
  assert.equal(habitMatchesDate(base, date(2026, 11, 15)), true);
  assert.equal(JSON.stringify(base), before);
});

test('monthly day 31 and annual leap-day skip nonexistent dates without early completion or shifted dates', () => {
  const monthly = { ...base, recurrenceType: 'MONTHLY', recurrenceConfig: { daysOfMonth: [31] } };
  assert.equal(habitMatchesDate(monthly, date(2026, 2, 28)), false);
  assert.equal(habitMatchesDate(monthly, date(2026, 3, 31)), true);
  const annual = { ...base, recurrenceConfig: { month: 2, day: 29 } };
  assert.equal(habitMatchesDate(annual, date(2027, 2, 28)), false);
  assert.equal(habitMatchesDate(annual, date(2027, 3, 1)), false);
  assert.equal(habitMatchesDate(annual, date(2028, 2, 29)), true);
});

test('legacy empty monthly schedule remains readable; new monthly cycles receive an explicit local day', () => {
  const old = { ...base, recurrenceType: 'MONTHLY' };
  assert.equal(habitMatchesDate(old, date(2026, 11, 14)), true);
  const { store } = fixture();
  const habit = store.getState().addHabit({ name: 'Mensal', recurrenceType: 'MONTHLY', recurrenceConfig: {}, startDate: date(2026, 11, 15) });
  assert.deepEqual(habit.recurrenceConfig, { daysOfMonth: [15] });
  assert.equal(habitMatchesDate(habit, date(2026, 11, 16)), false);
  assert.equal(habitMatchesDate(habit, date(2026, 12, 15)), true);
  assert.deepEqual(old.recurrenceConfig, {});
});

test('shared agenda includes own commitments and pending dated rituals exactly once, preserving completed-event history', () => {
  const task = { id: 'task', title: 'Ritual', dueDate: '2026-11-15', isCompleted: false };
  const commitment = { id: 'c', title: 'Consulta', date: date(2026, 11, 15), recurrence: 'ONCE' };
  const data = snapshot({ tasks: [task], commitments: [commitment] });
  const items = buildTemporalCommitments(data, date(2026, 11, 14), date(2026, 11, 16));
  assert.deepEqual(items.map(item => item.sourceType).sort(), ['commitment', 'task']);
  assert.equal(new Set(items.map(item => item.id)).size, 2);
  assert.equal(items.find(item => item.sourceType === 'task').date.getDate(), 15);
  const complete = { ...task, isCompleted: true, completedAt: date(2026, 11, 15), completedScore: 2 };
  assert.equal(buildTemporalCommitments(snapshot({ tasks: [complete] }), date(2026, 11, 15), date(2026, 11, 15)).length, 0);
  assert.equal(buildTemporalEvents(snapshot({ tasks: [complete] }))[0].score, 2);
});

test('substeps and rotation members do not duplicate root commitments, while their completion events remain intact', () => {
  const child = { ...base, id: 'child', recurrenceType: 'DAILY', recurrenceConfig: {}, childHabits: [], completions: [{ id: 'receipt', completionDate: date(2026, 11, 15), executedScore: 2 }] };
  const root = { ...child, id: 'root', childHabits: [child], completions: [] };
  const member = { ...child, id: 'member', controlledBySequenceId: 'rotation', completions: [] };
  const sequence = { ...child, id: 'rotation', name: 'Rotação', isActive: true, recurrenceType: 'DAILY' };
  const data = snapshot({ habits: [root, member], cycleSequences: [sequence] });
  assert.deepEqual(buildTemporalCommitments(data, date(2026, 11, 15), date(2026, 11, 15)).map(item => item.sourceId).sort(), ['root', 'rotation']);
  assert.equal(buildTemporalEvents(data).find(event => event.sourceId === 'child').score, 2);
});

test('date-only planning survives real store persistence without changing IDs, creation date or XP', async () => {
  const { store, memory } = fixture();
  const task = store.getState().addTask({ title: 'Agendada', dueDate: '2026-11-15' });
  const createdAt = task.createdAt.toISOString();
  const user = JSON.stringify(store.getState().user);
  store.getState().updateTask(task.id, { dueDate: '2026-12-16' });
  assert.equal(store.getState().tasks[0].id, task.id);
  assert.equal(store.getState().tasks[0].createdAt.toISOString(), createdAt);
  assert.equal(JSON.stringify(store.getState().user), user);
  assert.equal(store.getState().actions.find(item => item.id === task.id).dueDate, '2026-12-16');
  await store.persist.rehydrate();
  assert.equal(store.getState().tasks[0].dueDate, '2026-12-16');
  const items = buildTemporalCommitments(snapshot({ tasks: store.getState().tasks }), date(2026, 12, 16), date(2026, 12, 16));
  assert.equal(items.length, 1);
  const before = [...memory];
  assert.throws(() => store.getState().updateTask(task.id, { dueDate: '2026-02-30' }), /data válida/);
  assert.throws(() => store.getState().addTask({ title: 'Inválida', dueDate: 'invalid' }), /data válida/);
  assert.deepEqual([...memory], before);
});

test('actual quick-edit handler preserves monthly/annual schedules on name edits and rejects invalid explicit changes', () => {
  const source = readFileSync(new URL('../../src/pages/Ciclos.tsx', import.meta.url), 'utf8');
  const ast = ts.createSourceFile('Ciclos.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let initializer;
  function visit(node) { if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleSaveEdit') initializer = node.initializer.getText(ast); ts.forEachChild(node, visit); }
  visit(ast);
  const output = ts.transpileModule(`const handler = ${initializer};`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
  for (const type of ['MONTHLY', 'YEARLY']) for (const edited of [false, true]) {
    const config = type === 'MONTHLY' ? { daysOfMonth: [15] } : { month: 11, day: 15 };
    const habit = { ...base, recurrenceType: type, recurrenceConfig: config, areaId: 'a', elementId: 'terra', plannedPoints: 1, plannedTimeMinutes: 0 };
    let payload, error;
    const scope = { editingHabitId: 'annual', editName: 'Nome novo', habits: [habit], findHabitById: () => habit,
      editScheduleChanged: edited, editSchedule: { type: 'MONTHLY', config: { daysOfMonth: [] } }, validateRecurrence,
      hasTime: false, editTimeMinutes: 0, editTimeSeconds: 0, editArea: 'none', editSubarea: 'none', editPoints: 1,
      allAreasForEdit: [], getMergedSubareasForArea: () => [], getChildExecutionType: () => 'valuable', editingHabitIsChild: false, updateHabit: (_id, next) => { payload = next; }, updateHabitChild: () => assert.fail('child'),
    };
    for (const name of ['setEditChildType','setShowQuickEdit','setEditingHabitId','setEditingHabitIsChild','setEditName','setEditArea','setEditSubarea','setEditScheduleChanged','setEditPoints','setEditTimeMinutes','setEditTimeSeconds','setHasTime']) scope[name] = () => {};
    scope.setEditScheduleError = value => { error = value; };
    new Function(...Object.keys(scope), `${output}; return handler;`)(...Object.values(scope))();
    if (edited) { assert.equal(payload, undefined); assert.match(error, /dia do mês/); }
    else { assert.equal(payload.recurrenceType, type); assert.deepEqual(payload.recurrenceConfig, config); assert.equal(payload.title, 'Nome novo'); }
  }
});

test('new annual entries reuse Habit/Commitment commands and project to later years, with an inclusive optional end', () => {
  const { store } = fixture();
  const user = JSON.stringify(store.getState().user);
  const annual = createAnnualEntry(store.getState(), { title: 'Renovar assinatura', notes: 'Notas preservadas', category: 'task', date: date(2026, 11, 15), untilDate: date(2028, 11, 15) });
  const birthday = createAnnualEntry(store.getState(), { title: 'Pessoa sintética', notes: 'Lembrete', category: 'birthday', date: date(2026, 11, 16) });
  assert.equal(annual.recurrenceType, 'YEARLY');
  assert.equal(annual.description, 'Notas preservadas');
  assert.equal(birthday.recurrence, 'YEARLY');
  assert.equal(birthday.description, 'Lembrete');
  assert.equal(JSON.stringify(store.getState().user), user);
  assert.equal(store.getState().tasks.length, 0, 'No date encoded in Task.createdAt or generated annual copies');
  assert.equal(buildTemporalCommitments(store.getState(), date(2028, 11, 15), date(2028, 11, 16)).length, 2);
  assert.equal(buildTemporalCommitments(store.getState(), date(2029, 11, 15), date(2029, 11, 16)).length, 1);
  assert.equal(buildOwnTemporalCommitments([birthday], date(2026, 12, 16), date(2026, 12, 16)).length, 0);
  const before = JSON.stringify(store.getState());
  assert.throws(() => createAnnualEntry(store.getState(), { title: 'Inválida', notes: '', category: 'task', date: date(2026, 11, 15), untilDate: date(2025, 11, 15) }), /posterior/);
  assert.equal(JSON.stringify(store.getState()), before);
});

test('explicit agendas reject empty/out-of-range days and impossible annual dates; Feb 29 remains valid', () => {
  for (const type of ['DAILY', 'WEEKLY', 'MONTHLY']) assert.throws(() => validateRecurrence(type, {}));
  for (const config of [{ month: 2, day: 30 }, { month: 13, day: 1 }, { month: 1 }, { month: 1.5, day: 2 }]) assert.throws(() => validateRecurrence('YEARLY', config));
  validateRecurrence('YEARLY', { month: 2, day: 29 });
  assert.throws(() => validateRecurrence('MONTHLY', { daysOfMonth: [15], until: '2026-02-30' }));
  assert.throws(() => validateRecurrence('MONTHLY', { daysOfMonth: [15], until: '2025-01-01' }, date(2026, 1, 1)), /posterior/);
});

test('calendar date inputs and inclusive day iteration are stable in both hemispheres and across DST', () => {
  const loader = new URL('../elemental/load-component.mjs', import.meta.url).href;
  const script = `import assert from 'node:assert/strict'; import {loadComponent} from ${JSON.stringify(loader)};
    const {dateFromInput,dateToInput,operationalDate}=loadComponent('src/lib/temporal/recurrence.ts');
    const {eachDayOfInterval}=loadComponent('src/lib/temporal/date.ts');
    for(const key of ['2026-11-15','2028-02-29','0001-01-01']) {assert.equal(dateToInput(dateFromInput(key)),key);assert.equal(dateToInput(key),key);assert.equal(operationalDate(key).getDate(),Number(key.slice(-2)));}
    const days=eachDayOfInterval(dateFromInput('2026-03-07'),dateFromInput('2026-03-10'));assert.deepEqual(days.map(dateToInput),['2026-03-07','2026-03-08','2026-03-09','2026-03-10']);`;
  for (const TZ of ['America/Recife', 'America/New_York', 'Pacific/Auckland']) execFileSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TZ }, stdio: 'pipe' });
  assert.throws(() => dateFromInput('2026-02-30'));
  assert.equal(dateToInput('invalid'), '');
});

test('recurrence editor renders all frequencies, explicit annual controls and a legacy warning without writes', () => {
  for (const type of ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']) {
    const value = { type, config: {} }, before = JSON.stringify(value);
    const html = renderToStaticMarkup(React.createElement(RecurrenceEditor, { value, referenceDate: date(2026, 11, 15), onChange: () => assert.fail('render must not edit') }));
    for (const label of ['Diário', 'Semanal', 'Mensal', 'Anual', 'Repetir até']) assert.ok(html.includes(label));
    if (type === 'YEARLY') assert.match(html, /data de início/);
    if (type === 'MONTHLY') assert.match(html, /sem dias definidos/);
    assert.equal(JSON.stringify(value), before);
  }
  // Dialog's closed SSR shell is not a browser interaction test.
  assert.doesNotThrow(() => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(DayDetailsDialog, { open: false, onOpenChange: () => {}, date: date(2026, 11, 15), aggregate: null, events: [], commitments: [] }))));
});

test('all four temporal pages feed own commitments into the shared snapshot instead of a calendar-only path', () => {
  for (const name of ['TemporalWeekPage', 'TemporalMonthPage', 'TemporalYearPage', 'TemporalCalendarPage']) {
    const source = readFileSync(new URL(`../../src/pages/temporal/${name}.tsx`, import.meta.url), 'utf8');
    assert.match(source, /const commitments = useAppStore/);
    assert.match(source, /\(\{ tasks, habits, cycleSequences, projects, quests, commitments \}\)/);
    assert.match(source, /buildTemporalCommitments\(snapshot,/);
  }
});
