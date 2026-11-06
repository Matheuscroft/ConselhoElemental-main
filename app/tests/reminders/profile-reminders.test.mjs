import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from '../backup/load-progress.mjs';
import { loadComponent } from '../elemental/load-component.mjs';
const { readProfileReminders, dueProfileReminders } = loadComponent('src/lib/reminders/profile-reminders.ts');
const date = new Date(2026, 9, 30);
const now = new Date(2026, 9, 30, 12).toISOString();
function seed(f) {
  const s = f.core.getState(); const account = s.createAccount('Perfil sintético', false);
  const source = f.core.getState().addCommitment({ title: 'Consulta teste', date, recurrence: 'ONCE' });
  return { account, source };
}
function configure(f, source) {
  const s = f.core.getState();
  return s.mutateOccurrenceReminder(s.currentAccountId, s.user.id, s.user.reminderState?.revision ?? 0, { kind: 'configure', sourceType: 'commitment', sourceId: source.id, day: '2026-10-30', time: '09:00' });
}

test('existing persist storage reloads alerts without a new storage key, identity or XP change', () => {
  const f = fixture(); const { source } = seed(f); const before = { ...f.core.getState().user };
  configure(f, source);
  assert.deepEqual(Object.keys(f.core.getState().user).filter(k => k !== 'reminderState').sort(), Object.keys(before).sort());
  assert.deepEqual({ ...f.core.getState().user, reminderState: undefined }, { ...before, reminderState: undefined });
  assert.ok(f.memory.has('conselho-elemental-storage'));
  assert.equal([...f.memory.keys()].some(k => /reminder/.test(k)), false);
  const reloaded = fixture([...f.memory]);
  assert.deepEqual(reloaded.core.getState().user.reminderState, f.core.getState().user.reminderState);
  assert.equal(dueProfileReminders(reloaded.core.getState(), reloaded.core.getState().user.reminderState, now).length, 1);
});

test('switching profiles isolates alerts and rejects callbacks from the previous account', () => {
  const f = fixture(); const { account, source } = seed(f); const userId = f.core.getState().user.id;
  configure(f, source);
  const second = f.core.getState().createAccount('Sem importação', false);
  assert.equal(f.core.getState().user.reminderState, undefined);
  assert.throws(() => f.core.getState().mutateOccurrenceReminder(account.id, userId, 1, { kind: 'configure', sourceType: 'commitment', sourceId: source.id, day: '2026-10-30', time: '12:00' }), /perfil mudou/);
  f.core.getState().switchAccount(account.id); assert.equal(f.core.getState().user.reminderState.items.length, 1);
  f.core.getState().switchAccount(second.id); assert.equal(dueProfileReminders(f.core.getState(), undefined, now).length, 0);
});

test('collection and entry revisions reject stale commands, repeated configure and changed source dates', () => {
  const f = fixture(); const { source } = seed(f); const saved = configure(f, source); const s = f.core.getState();
  assert.throws(() => configure(f, source), /Já existe/);
  const mutation = { kind: 'command', key: saved.items[0].key, command: { id: 'snooze', expectedRevision: 0, action: 'one-hour', at: now } };
  assert.throws(() => s.mutateOccurrenceReminder(s.currentAccountId, s.user.id, 0, mutation), /mudaram/);
  s.mutateOccurrenceReminder(s.currentAccountId, s.user.id, 1, mutation);
  const current = f.core.getState();
  assert.equal(current.mutateOccurrenceReminder(current.currentAccountId, current.user.id, 2, mutation).revision, 2);
  current.updateCommitment(source.id, { date: new Date(2026, 10, 1) });
  assert.equal(dueProfileReminders(f.core.getState(), f.core.getState().user.reminderState, now).length, 0);
  assert.throws(() => current.mutateOccurrenceReminder(current.currentAccountId, current.user.id, 2, { ...mutation, command: { ...mutation.command, id: 'new', expectedRevision: 1 } }), /não está disponível/);
  const latest = f.core.getState(); latest.mutateOccurrenceReminder(latest.currentAccountId, latest.user.id, 2, { ...mutation, command: { id: 'dismiss', expectedRevision: 1, action: 'dismiss', at: now } });
  assert.equal(f.core.getState().user.reminderState.items[0].status, 'dismissed');
});

test('completion and deletion suppress reminders; undo restores visibility without changing alert metadata', () => {
  const f = fixture(); const { source } = seed(f); const s = f.core.getState();
  const task = s.addTask({ title: 'Ritual teste', dueDate: '2026-10-30' });
  s.mutateOccurrenceReminder(s.currentAccountId, s.user.id, 0, { kind: 'configure', sourceType: 'task', sourceId: task.id, day: '2026-10-30', time: '09:00' });
  const saved = JSON.stringify(f.core.getState().user.reminderState);
  // Existing edit command simulates a completed stored task without executing/rewarding a real user action.
  f.core.setState(state => ({ tasks: state.tasks.map(t => t.id === task.id ? { ...t, isCompleted: true } : t) }));
  assert.equal(dueProfileReminders(f.core.getState(), f.core.getState().user.reminderState, now).length, 0);
  f.core.setState(state => ({ tasks: state.tasks.map(t => ({ ...t, isCompleted: false })) }));
  assert.equal(dueProfileReminders(f.core.getState(), f.core.getState().user.reminderState, now).length, 1);
  assert.equal(JSON.stringify(f.core.getState().user.reminderState), saved);
  configure(f, source); f.core.getState().deleteCommitment(source.id);
  assert.equal(dueProfileReminders(f.core.getState(), f.core.getState().user.reminderState, now).length, 1);
});

test('full backup retains active/inactive profile metadata; old archives remain valid without invented alerts', async () => {
  const f = fixture(); const { account, source } = seed(f); configure(f, source);
  f.core.getState().createAccount('Segundo teste', false);
  f.fitness.setState({ currentAccountId: f.core.getState().currentAccountId });
  const snapshot = f.captureProgress('http://synthetic.test');
  const text = await f.createProgressBackup(snapshot); const { backup } = await f.inspectProgressBackup(text);
  assert.equal(backup.stores.core.state.accountDataById[account.id].user.reminderState.items.length, 1);
  assert.equal(f.auditCriticalProgress(backup).issues.length, 0);
  const older = JSON.parse(JSON.stringify(snapshot));
  for (const data of [older.stores.core.state, ...Object.values(older.stores.core.state.accountDataById)]) delete data.user.reminderState;
  assert.equal(f.auditCriticalProgress(older).issues.length, 0);
  const roundtrip = await f.inspectProgressBackup(await f.createProgressBackup(older));
  assert.equal(roundtrip.backup.stores.core.state.user.reminderState, undefined);
});

test('malformed nested metadata fails backup audit without silently removing it', () => {
  const f = fixture(); const { source } = seed(f); configure(f, source);
  f.fitness.setState({ currentAccountId: f.core.getState().currentAccountId });
  const snapshot = f.captureProgress('http://synthetic.test');
  for (const change of [state => state.schema = 2, state => state.items.push(state.items[0]), state => state.items[0].dueAt = 'bad', state => state.items[0].revision = 1, state => state.revision = -1]) {
    const bad = JSON.parse(JSON.stringify(snapshot)); change(bad.stores.core.state.user.reminderState);
    assert.ok(f.auditCriticalProgress(bad).issues.some(i => i.path.includes('reminderState')));
  }
  assert.deepEqual(readProfileReminders(undefined), { schema: 1, revision: 0, items: [] });
  assert.throws(() => readProfileReminders(null));
});
