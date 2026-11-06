import test from 'node:test';
import assert from 'node:assert/strict';
import { authFixture } from './load-auth-sync.mjs';
import { fixture } from './load-progress.mjs';

test('real legacy adapter writes the existing due_date column and retains the date-only key in payload', async () => {
  const f = authFixture();
  const task = f.local.core.getState().addTask({ title: 'Agendada', dueDate: '2026-11-15' });
  await f.persistAppStoreToCloud('synthetic-remote-a');
  const row = f.calls.filter(call => call.table === 'tasks' && call.operation === 'upsert').flatMap(call => call.rows).find(row => row.local_id === task.id);
  assert.equal(row.due_date, new Date(2026, 10, 15, 12).toISOString());
  assert.equal(row.payload.dueDate, '2026-11-15');
  assert.equal(row.payload.createdAt, task.createdAt.toISOString());
  await f.close();
});

test('adapter reads an older column-only date without overriding an explicit payload date', async () => {
  const f = authFixture();
  const root = f.local.core.getState().addTask({ title: 'Base' });
  const payload = JSON.parse(JSON.stringify(root)); delete payload.dueDate;
  f.db.set('tasks', [
    { user_id: 'synthetic-remote-a', local_id: 'old', due_date: new Date(2026, 10, 15, 12).toISOString(), payload: { ...payload, id: 'old' } },
    { user_id: 'synthetic-remote-a', local_id: 'explicit', due_date: new Date(2026, 10, 15, 12).toISOString(), payload: { ...payload, id: 'explicit', dueDate: '2026-12-16' } },
  ]);
  await f.hydrateAppStoreFromCloud('synthetic-remote-a');
  assert.equal(f.local.core.getState().tasks.find(task => task.id === 'old').dueDate, '2026-11-15');
  assert.equal(f.local.core.getState().tasks.find(task => task.id === 'explicit').dueDate, '2026-12-16');
  await f.close();
});

test('complete archive preserves annual config and rejects impossible schedule dates without repairing records', async () => {
  const f = fixture();
  f.core.getState().addHabit({ name: 'Anual', recurrenceType: 'YEARLY', recurrenceConfig: { month: 2, day: 29, until: '2032-02-29' } });
  f.core.getState().addTask({ title: 'Planejada', dueDate: '2026-11-15' });
  const { backup } = await f.inspectProgressBackup(await f.createProgressBackup(f.captureProgress('http://synthetic.test')));
  assert.deepEqual(f.auditCriticalProgress(backup).issues, []);
  const habit = backup.stores.core.state.habits[0];
  habit.recurrenceConfig.day = 30;
  const before = JSON.stringify(backup);
  assert.ok(f.auditCriticalProgress(backup).issues.some(item => /anual inválida/.test(item.message)));
  assert.equal(JSON.stringify(backup), before);
  habit.recurrenceConfig.day = 29; habit.recurrenceConfig.until = '2032-02-30';
  assert.ok(f.auditCriticalProgress(backup).issues.some(item => /final de recorrência/.test(item.message)));
});
