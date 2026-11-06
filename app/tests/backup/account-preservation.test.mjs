import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-progress.mjs';

const json = value => JSON.parse(JSON.stringify(value));
const projection = core => core.persist.getOptions().partialize(core.getState());
const content = core => {
  const { accounts, currentAccountId, accountDataById, ...data } = projection(core);
  return json(data);
};
function activity(core) {
  core.getState().addDraft('Ideia preservada', 'Notas');
  const task = core.getState().addTask({ title: 'Estudar', elementId: 'ar', baseValue: 2, plannedTimeMinutes: 5, effortLevel: 2 });
  core.getState().completeTask(task.id, 5);
  const habit = core.getState().addHabit({ name: 'Praticar', elementId: 'agua', plannedPoints: 3, plannedTimeMinutes: 5 });
  core.getState().configureHabitDailyTracking(habit.id, { unit: 'vez', target: 3, step: 1 });
  core.getState().recordHabitQuantity(habit.id, new Date(2026, 9, 27, 12));
}

for (const importCurrentData of [false, true]) test(`creating a profile preserves outgoing activity, XP and character identity (import=${importCurrentData})`, () => {
  const f = fixture();
  const a = f.core.getState().createAccount('Conta A', false);
  activity(f.core);
  const original = content(f.core);
  const b = f.core.getState().createAccount('Conta B', importCurrentData);
  assert.deepEqual(json(f.core.getState().accountDataById[a.id]), original);
  assert.notEqual(f.core.getState().user.id, original.user.id);
  assert.equal(f.core.getState().drafts.length, importCurrentData ? 1 : 0);
  f.core.getState().addDraft('Somente B', '');
  if (importCurrentData) f.core.getState().updateTask(original.tasks[0].id, { title: 'Editado em B' });
  const bData = content(f.core);
  f.core.getState().switchAccount(a.id);
  assert.deepEqual(content(f.core), original);
  f.core.getState().switchAccount(b.id);
  assert.deepEqual(content(f.core), bData);
  // Reload while B is selected, then recover A from its persisted snapshot.
  const reload = fixture([...f.memory]);
  reload.core.getState().switchAccount(a.id);
  assert.deepEqual(content(reload.core), original);
  assert.equal(reload.fitness.getState().currentAccountId, a.id);
});

test('first local import retains existing activity and invalid names do not change data', () => {
  const f = fixture(); activity(f.core);
  const before = content(f.core);
  assert.throws(() => f.core.getState().createAccount('   '));
  assert.deepEqual(content(f.core), before);
  const account = f.core.getState().createAccount('Primeira conta');
  const after = content(f.core);
  for (const key of ['tasks', 'habits', 'drafts', 'executionLogs']) assert.deepEqual(after[key], before[key]);
  for (const key of ['xp_earth', 'xp_fire', 'xp_water', 'xp_air']) assert.equal(after.user[key], before.user[key]);
  assert.equal(f.fitness.getState().currentAccountId, account.id);
});

test('fitness initial hydration completes and explicit reload notifies once with the active projection', async () => {
  const f = fixture();
  assert.equal(f.fitness.persist.hasHydrated(), true);
  const a = f.core.getState().createAccount('A', false);
  const workout = f.fitness.getState().createWorkout({ name: 'Plano A', effortLevel: 1, exercises: [] });
  assert.ok(workout);
  const native = { nativeCatalog: [], templates: [{ id: 'template-a', name: 'Plano nativo' }], sequences: [], nativeCheckins: {}, activeNativeSession: null, nativeHistory: [{ id: 'session-a', status: 'completed' }] };
  f.fitness.setState({ nativeDataById: { [a.id]: native } });
  f.fitness.getState().syncAccountContext(a.id);
  const before = json(f.fitness.persist.getOptions().partialize(f.fitness.getState()));
  const xp = content(f.core).user;
  let finished = 0;
  f.fitness.persist.onFinishHydration(state => { finished++; assert.equal(state.currentAccountId, a.id); assert.deepEqual(json(state.nativeHistory), native.nativeHistory); });
  await f.fitness.persist.rehydrate();
  assert.equal(finished, 1);
  assert.equal(f.fitness.persist.hasHydrated(), true);
  assert.deepEqual(json(f.fitness.persist.getOptions().partialize(f.fitness.getState())), before);
  assert.deepEqual(content(f.core).user, xp);
  const reload = fixture([...f.memory]);
  assert.equal(reload.fitness.persist.hasHydrated(), true);
  assert.equal(reload.fitness.getState().currentAccountId, a.id);
  assert.deepEqual(json(reload.fitness.getState().nativeHistory), native.nativeHistory);
  assert.equal(reload.fitness.getState().getWorkoutById(workout.id)?.name, 'Plano A');
});

test('fitness plans stay in their own account across creation, switching and reload', () => {
  const f = fixture(); const a = f.core.getState().createAccount('A', false);
  const planA = f.fitness.getState().createWorkout({ name: 'A', effortLevel: 1, exercises: [] });
  const b = f.core.getState().createAccount('B', false);
  assert.equal(f.fitness.getState().getWorkoutById(planA.id), undefined);
  const planB = f.fitness.getState().createWorkout({ name: 'B', effortLevel: 1, exercises: [] });
  f.core.getState().switchAccount(a.id);
  assert.ok(f.fitness.getState().getWorkoutById(planA.id));
  assert.equal(f.fitness.getState().getWorkoutById(planB.id), undefined);
  const reload = fixture([...f.memory]); reload.core.getState().switchAccount(b.id);
  assert.ok(reload.fitness.getState().getWorkoutById(planB.id));
  assert.equal(reload.fitness.getState().getWorkoutById(planA.id), undefined);
});

test('backup refuses capture while fitness hydration is pending or failed', async () => {
  const f = fixture(); let resolveRead;
  f.fitness.persist.setOptions({ storage: { getItem: () => new Promise(resolve => { resolveRead = resolve; }), setItem() {}, removeItem() {} } });
  const pending = f.fitness.persist.rehydrate();
  assert.equal(f.fitness.persist.hasHydrated(), false);
  assert.throws(() => f.captureProgress('http://example.test'), /carregamento/);
  resolveRead(null); await pending;
  assert.equal(f.fitness.persist.hasHydrated(), true);
  assert.doesNotThrow(() => f.captureProgress('http://example.test'));
  f.fitness.persist.setOptions({ storage: { getItem() { throw new Error('Read failed'); }, setItem() {}, removeItem() {} } });
  await f.fitness.persist.rehydrate();
  assert.equal(f.fitness.persist.hasHydrated(), false);
  assert.throws(() => f.captureProgress('http://example.test'), /carregamento/);
});
