import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { webcrypto } from 'node:crypto';
import { loadComponent } from '../elemental/load-component.mjs';
const { calculateHabitStreak, findHabitScheduleRoot } = loadComponent('src/lib/temporal/habit-streak.ts');
const { habitMatchesDate } = loadComponent('src/lib/temporal/habit-schedule.ts');
const date = (day) => new Date(2026, 9, day, 12);
const schedule = (extra = {}) => ({ id: 'root', createdAt: date(1), recurrenceType: 'WEEKLY', recurrenceConfig: { daysOfWeek: [1, 3, 5] }, childHabits: [], ...extra });
const records = (...days) => days.map(day => ({ completionDate: date(day) }));

test('scheduled occurrences bridge rest days and weekends, but not a missed appointment', () => {
  assert.equal(calculateHabitStreak(records(19, 21, 23, 26), schedule()).streak, 4);
  const missed = calculateHabitStreak(records(19, 21, 26), schedule());
  assert.equal(missed.streak, 1);
  assert.equal(missed.longestStreak, 2);
});

test('one count per eligible local day; out-of-agenda and invalid receipts do not inflate it', () => {
  const input = [...records(19, 19, 20, 21), { completionDate: 'invalid' }];
  const before = JSON.stringify(input);
  assert.equal(calculateHabitStreak(input, schedule()).streak, 2);
  assert.equal(calculateHabitStreak(records(19), schedule({ recurrenceConfig: { daysOfWeek: [] } })).streak, 0);
  assert.equal(JSON.stringify(input), before);
  assert.equal(calculateHabitStreak(records(19, 21), schedule({ startDate: date(21) })).streak, 1);
});

test('monthly day 31 skips nonexistent dates, crosses years, and daily fallback still breaks on gaps', () => {
  const monthly = schedule({ createdAt: new Date(2024, 0, 1), recurrenceType: 'MONTHLY', recurrenceConfig: { daysOfMonth: [31] } });
  const input = [new Date(2025,11,31), new Date(2026,0,31), new Date(2026,2,31)].map(completionDate => ({ completionDate }));
  assert.equal(calculateHabitStreak(input, monthly).streak, 3);
  assert.equal(calculateHabitStreak(records(19,21), schedule({ recurrenceType: 'DAILY', recurrenceConfig: {} })).streak, 1);
  assert.equal(habitMatchesDate(monthly, new Date(2026,1,28)), false);
});

test('root agenda inheritance and explicit unsupported rotation/annual modes', () => {
  const child = schedule({ id: 'child', recurrenceConfig: { daysOfWeek: [0] } });
  const root = schedule({ childHabits: [child] });
  assert.equal(findHabitScheduleRoot([root], 'child'), root);
  assert.equal(calculateHabitStreak(records(19,21), root).streak, 2);
  assert.equal(calculateHabitStreak(records(19,21), root, true).rule, 'legacy-rotation');
  assert.equal(calculateHabitStreak(records(19,21), { ...root, controlledBySequenceId: 'seq' }).streak, 1);
  assert.equal(calculateHabitStreak(records(19), { ...root, recurrenceType: 'YEARLY' }).rule, 'legacy-yearly');
});

// Real Zustand commands, bundled without browser/network. Every instance gets empty in-memory storage.
const bundled = await build({ entryPoints: ['src/stores/appStore.ts'], bundle: true, platform: 'node', format: 'cjs', write: false, alias: { '@': new URL('../../src', import.meta.url).pathname }, logLevel: 'silent' });
function fixture() {
  const memory = new Map();
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) };
  const module = { exports: {} };
  new Function('require', 'module', 'exports', 'window', 'crypto', bundled.outputFiles[0].text)(createRequire(import.meta.url), module, module.exports, { localStorage: storage }, webcrypto);
  return { store: module.exports.useAppStore, memory };
}
function addCycle(store, extra = {}) {
  return store.getState().addHabit({ name: 'Ciclo de teste', ...schedule(), startDate: date(1), plannedPoints: 3, ...extra });
}

test('real completion and undo share scheduled streaks, idempotency and preserved completion receipts', () => {
  const { store } = fixture();
  const habit = addCycle(store);
  for (const day of [19,21,23,26]) store.getState().completeHabit(habit.id, 15, date(day));
  let updated = store.getState().habits.find(item => item.id === habit.id);
  assert.equal(updated.streak, 4);
  assert.equal(updated.completions.length, 4);
  const receipt = JSON.stringify(updated.completions[0]);
  const score = store.getState().user.totalScore;
  store.getState().completeHabit(habit.id, 15, date(26));
  assert.equal(store.getState().habits[0].completions.length, 4);
  assert.equal(store.getState().user.totalScore, score);
  store.getState().uncompleteHabit(habit.id, date(23));
  updated = store.getState().habits[0];
  assert.equal(updated.streak, 1);
  assert.equal(updated.longestStreak, 4);
  assert.equal(JSON.stringify(updated.completions[0]), receipt);
  store.getState().completeHabit(habit.id, 15, date(23));
  assert.equal(store.getState().habits[0].streak, 4);
  assert.equal(store.getState().user.totalScore, score);
});

test('real subitem completion/undo uses the root agenda, not a stale child copy', () => {
  const { store } = fixture();
  const habit = addCycle(store);
  store.getState().addHabitChild(habit.id, { name: 'Etapa', semanticType: 'VALUABLE', plannedPoints: 2 });
  const child = store.getState().habits[0].childHabits[0];
  // A stale daily child agenda must not override its parent.
  store.setState({ habits: store.getState().habits.map(h => ({ ...h, childHabits: h.childHabits.map(c => ({ ...c, recurrenceType: 'DAILY', recurrenceConfig: {} })) })) });
  for (const day of [19,21,23]) store.getState().completeHabitChild(child.id, 10, date(day));
  assert.equal(store.getState().habits[0].childHabits[0].streak, 3);
  assert.equal(store.getState().habits[0].streak, 3);
  store.getState().uncompleteHabitChild(child.id, date(21));
  assert.equal(store.getState().habits[0].childHabits[0].streak, 1);
  assert.equal(store.getState().habits[0].streak, 1);
});

test('native workout completion is idempotent, keeps reward ledger and reverses safely', () => {
  const { store } = fixture();
  const habit = addCycle(store, { sourceModule: 'modulo_treino' });
  const inputs = [19,21,23].map(day => ({ sessionId: webcrypto.randomUUID(), habitId: habit.id, title: 'Treino', baseValue: 2, durationSeconds: 600, completedAt: date(day).toISOString() }));
  const receipts = inputs.map(input => store.getState().completeNativeAction(input));
  assert.equal(store.getState().habits[0].streak, 3);
  assert.equal(store.getState().user.xp_earth, receipts.reduce((total, log) => total + log.executedValue, 0));
  assert.equal(store.getState().user.pranaLevel, 85);
  assert.equal(store.getState().completeNativeAction(inputs[2]).id, receipts[2].id);
  assert.equal(store.getState().executionLogs.length, 3);
  store.getState().undoNativeHabitCompletion(habit.id, receipts[1].id);
  assert.equal(store.getState().habits[0].streak, 1);
  assert.equal(store.getState().user.pranaLevel, 90);
  assert.equal(store.getState().user.xp_earth, receipts[0].executedValue + receipts[2].executedValue);
  assert.deepEqual(store.getState().executionLogs, [receipts[0], receipts[2]]);
  assert.throws(() => store.getState().undoNativeHabitCompletion(habit.id, receipts[1].id));
});

test('isolated persistence reload keeps histories and new rule does not rewrite legacy counters on read', async () => {
  const { store, memory } = fixture();
  const habit = addCycle(store);
  store.getState().completeHabit(habit.id, 10, date(19));
  store.getState().completeHabit(habit.id, 10, date(21));
  const before = JSON.stringify(store.getState().habits);
  await store.persist.rehydrate();
  assert.equal(JSON.stringify(store.getState().habits), before);
  assert.equal(store.getState().habits[0].streak, 2);
  const other = fixture();
  assert.equal(other.store.getState().habits.length, 0);
  const stored = memory.get('conselho-elemental-storage');
  calculateHabitStreak(store.getState().habits[0].completions, habit);
  assert.equal(memory.get('conselho-elemental-storage'), stored);
});

test('local date arithmetic preserves a daily run across DST without 24-hour assumptions', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'America/New_York';
  try {
    const calendar = schedule({ createdAt: new Date(2026,0,1), recurrenceType: 'DAILY', recurrenceConfig: {} });
    for (const [month, day] of [[2,7], [9,31]]) {
      const dates = [0,1,2].map(offset => ({ completionDate: new Date(2026,month,day+offset,12) }));
      assert.equal(calculateHabitStreak(dates, calendar).streak, 3);
    }
  } finally {
    if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous;
  }
});

test('native rotation keeps cursor/receipt rollback and calendar fallback without inventing member schedules', () => {
  const { store } = fixture();
  const first = addCycle(store, { sourceModule: 'modulo_treino' });
  const second = addCycle(store, { sourceModule: 'modulo_treino' });
  store.setState({ cycleSequences: [{ id: 'seq', name: 'A/B', isActive: true, currentPosition: 0, lastCompletedDate: null, createdAt: date(1), recurrenceType: 'WEEKLY', recurrenceConfig: { daysOfWeek: [1,3,5] } }],
    sequenceMemberships: [{ habitId: first.id, sequenceId: 'seq', position: 0 }, { habitId: second.id, sequenceId: 'seq', position: 1 }] });
  const finish = (habitId, day) => store.getState().completeNativeAction({ habitId, sessionId: webcrypto.randomUUID(), title: 'Treino', baseValue: 2, durationSeconds: 600, completedAt: date(day).toISOString() });
  finish(first.id, 19);
  const before = { ...store.getState().cycleSequences[0] };
  const log = finish(second.id, 21);
  assert.equal(store.getState().cycleSequences[0].currentPosition, 1);
  store.getState().undoNativeHabitCompletion(second.id, log.id);
  assert.equal(store.getState().cycleSequences[0].currentPosition, before.currentPosition);
  assert.equal(store.getState().cycleSequences[0].lastCompletedDate.getTime(), before.lastCompletedDate.getTime());
  finish(first.id, 23);
  assert.equal(store.getState().habits.find(h => h.id === first.id).streak, 1);
});
