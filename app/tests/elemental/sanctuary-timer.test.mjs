import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../../src/components/elemental/sanctuary-timer.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { openRitualTimer, toggleRitualTimer, completeRitualTimer } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
const context = { accountId: 'account-a', taskId: 'task-a' };
// Disposable owner, never the app store, browser storage or user profile.
function fixture() {
  const calls = [];
  const idle = () => ({ entityId: null, entityType: null, isRunning: false, elapsedSeconds: 0 });
  const state = {
    currentAccountId: 'account-a', tasks: [{ id: 'task-a', isCompleted: false }, { id: 'task-b', isCompleted: false }], timer: idle(),
    startTimer(id, type) { calls.push(['start', id, type]); state.timer = { entityId: id, entityType: type, isRunning: true, elapsedSeconds: 0 }; },
    pauseTimer() { calls.push(['pause']); state.timer = { ...state.timer, isRunning: false }; },
    resumeTimer() { calls.push(['resume']); state.timer = { ...state.timer, isRunning: true }; },
    stopTimer() { calls.push(['stop']); const elapsed = state.timer.elapsedSeconds; state.timer = idle(); return elapsed; },
    completeTask(id, minutes) { calls.push(['complete', id, minutes]); state.tasks = state.tasks.map(t => t.id === id ? { ...t, isCompleted: true } : t); return 123; },
  };
  return { state, calls, getState: () => state };
}

test('opening the same running or paused ritual preserves elapsed time and does not restart it', () => {
  const f = fixture();
  assert.equal(openRitualTimer(f.getState, context), 'started');
  f.state.timer.elapsedSeconds = 75;
  assert.equal(openRitualTimer(f.getState, context), 'existing');
  toggleRitualTimer(f.getState, context);
  assert.equal(openRitualTimer(f.getState, context), 'existing');
  assert.equal(f.state.timer.isRunning, false);
  toggleRitualTimer(f.getState, context);
  assert.equal(f.state.timer.elapsedSeconds, 75);
  assert.deepEqual(f.calls, [['start', 'task-a', 'TASK'], ['pause'], ['resume']]);
});

test('another TASK or HABIT blocks replacement even while paused', () => {
  for (const entityType of ['TASK', 'HABIT']) for (const isRunning of [true, false]) {
    const f = fixture();
    f.state.timer = { entityId: 'other', entityType, isRunning, elapsedSeconds: 123 };
    assert.equal(openRitualTimer(f.getState, context), 'busy');
    assert.equal(toggleRitualTimer(f.getState, context), false);
    assert.equal(completeRitualTimer(f.getState, context), false);
    assert.deepEqual(f.calls, []);
    assert.equal(f.state.timer.elapsedSeconds, 123);
  }
});

test('completion delegates exact fractional TASK minutes once and ignores repeated clicks', () => {
  const f = fixture();
  openRitualTimer(f.getState, context);
  f.state.timer.elapsedSeconds = 91;
  assert.equal(completeRitualTimer(f.getState, context), true);
  assert.equal(completeRitualTimer(f.getState, context), false);
  assert.deepEqual(f.calls, [['start', 'task-a', 'TASK'], ['stop'], ['complete', 'task-a', 91 / 60]]);
});

test('stale callbacks cannot touch a new account even when the task ID matches', () => {
  const f = fixture();
  openRitualTimer(f.getState, context);
  f.state.currentAccountId = 'account-b';
  f.calls.length = 0;
  assert.equal(openRitualTimer(f.getState, context), 'unavailable');
  assert.equal(toggleRitualTimer(f.getState, context), false);
  assert.equal(completeRitualTimer(f.getState, context), false);
  assert.deepEqual(f.calls, []);
});

test('deleted or externally completed tasks cannot be started, toggled or completed again', () => {
  for (const tasks of [[], [{ id: 'task-a', isCompleted: true }]]) {
    const f = fixture();
    openRitualTimer(f.getState, context);
    f.state.tasks = tasks;
    f.calls.length = 0;
    assert.equal(openRitualTimer(f.getState, context), 'unavailable');
    assert.equal(toggleRitualTimer(f.getState, context), false);
    assert.equal(completeRitualTimer(f.getState, context), false);
    assert.deepEqual(f.calls, []);
  }
});

test('a store operation that leaves the ritual pending must not produce success feedback', () => {
  const f = fixture();
  openRitualTimer(f.getState, context);
  f.state.completeTask = (id, minutes) => { f.calls.push(['complete', id, minutes]); return 0; };
  assert.equal(completeRitualTimer(f.getState, context), false);
  assert.equal(f.state.tasks[0].isCompleted, false);
});

test('simple timer refuses native workouts and parents with children without touching their owner', () => {
  for (const extra of [{ sourceModule: 'modulo_treino' }, { childItems: [{ id: 'child' }] }]) {
    const f = fixture(); f.state.tasks[0] = { ...f.state.tasks[0], ...extra };
    assert.equal(openRitualTimer(f.getState, context), 'unavailable');
    f.state.timer = { entityId: 'task-a', entityType: 'TASK', isRunning: false, elapsedSeconds: 90 };
    assert.equal(toggleRitualTimer(f.getState, context), false);
    assert.equal(completeRitualTimer(f.getState, context), false);
    assert.deepEqual(f.calls, []); assert.equal(f.state.timer.elapsedSeconds, 90);
  }
});
