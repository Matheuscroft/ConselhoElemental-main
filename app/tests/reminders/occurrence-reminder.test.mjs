import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { loadComponent } from '../elemental/load-component.mjs';
const { createOccurrenceReminder: create, applyReminderCommand: apply, isReminderDue: due, reminderKey } = loadComponent('src/lib/reminders/occurrence-reminder.ts');
const source = () => ({ sourceType: 'habit', sourceId: 'real-local-id', date: new Date(2026, 9, 30) });
const command = (action, revision = 0, id = 'command-1', at = new Date(2026, 9, 30, 12).toISOString()) => ({ action, expectedRevision: revision, id, at });

test('existing occurrence keeps its source identity and local day, with no generated activity', () => {
  for (const sourceType of ['habit', 'task', 'sequence', 'project', 'quest', 'mission', 'commitment']) {
    const item = { ...source(), sourceType }; const before = JSON.stringify(item);
    const reminder = create(item, '19:30');
    assert.equal(reminder.occurrence.sourceId, item.sourceId); assert.equal(reminder.occurrence.day, '2026-10-30');
    assert.equal(reminder.revision, 0); assert.equal(new Date(reminder.dueAt).getHours(), 19);
    assert.equal(reminder.key, reminderKey(reminder.occurrence)); assert.equal(JSON.stringify(item), before);
    assert.notEqual(reminder.key, create({ ...item, date: new Date(2026, 9, 31) }, '19:30').key);
  }
  assert.notEqual(reminderKey({ sourceType: 'habit', sourceId: 'a:b', day: '2026-10-30' }), reminderKey({ sourceType: 'task', sourceId: 'a:b', day: '2026-10-30' }));
});

test('no implicit schedule or external import: invalid dates, clocks and IDs are rejected', () => {
  for (const time of ['', '24:00', '12:60', '9:00', '12:30:00']) assert.throws(() => create(source(), time));
  assert.throws(() => create({ ...source(), date: new Date('bad') }, '09:00'));
  assert.throws(() => create({ ...source(), sourceType: 'google' }, '09:00'));
  assert.throws(() => create({ ...source(), sourceId: ' ' }, '09:00'));
  assert.throws(() => reminderKey({ sourceType: 'habit', sourceId: 'id', day: '2027-02-29' }));
});

test('one hour uses command time and preserves the original occurrence even after midnight', () => {
  const initial = create(source(), '19:00'); const before = JSON.stringify(initial);
  const at = new Date(2026, 9, 30, 23, 30).toISOString(); const next = apply(initial, command('one-hour', 0, 'later', at));
  assert.equal(new Date(next.dueAt).getTime(), new Date(at).getTime() + 3600000);
  assert.equal(next.occurrence.day, '2026-10-30'); assert.equal(next.key, initial.key);
  assert.equal(JSON.stringify(initial), before); assert.equal(next.revision, 1);
});

test('tomorrow at nine and same time cross month/year without editing recurrence or activity', () => {
  const reminder = create({ ...source(), date: new Date(2026, 11, 31) }, '19:45');
  for (const [action, hours, minutes] of [['tomorrow-nine', 9, 0], ['tomorrow-same-time', 19, 45]]) {
    const next = apply(reminder, command(action, 0, action, new Date(2026, 11, 31, 23).toISOString()));
    const date = new Date(next.dueAt);
    assert.equal(date.getFullYear(), 2027); assert.equal(date.getMonth(), 0); assert.equal(date.getDate(), 1);
    assert.equal(date.getHours(), hours); assert.equal(date.getMinutes(), minutes);
    assert.equal(next.occurrence.day, '2026-12-31');
  }
});

test('commands are revision checked, repeatable only with identical payload, and never replay older changes', () => {
  const reminder = create(source(), '19:00'); const first = command('one-hour');
  const next = apply(reminder, first); assert.equal(apply(next, { ...first }), next);
  for (const patch of [{ action: 'dismiss' }, { at: new Date(2026, 9, 30, 13).toISOString() }, { expectedRevision: 1 }]) assert.throws(() => apply(next, { ...first, ...patch }), /conteúdo diferente/);
  assert.throws(() => apply(next, command('dismiss', 0, 'stale')), /mudou/);
  const second = apply(next, command('tomorrow-nine', 1, 'second'));
  assert.throws(() => apply(second, first), /mudou/);
  assert.throws(() => apply(next, command('dismiss', 1, 'old-clock', new Date(2026, 9, 30, 11).toISOString())), /anterior/);
});

test('dismiss affects just the alert; availability/completion gates prevent stale reminders', () => {
  const reminder = create(source(), '09:00'); const now = new Date(2026, 9, 30, 12).toISOString();
  assert.equal(due(reminder, now, true, false), true);
  assert.equal(due(reminder, now, false, false), false); assert.equal(due(reminder, now, true, true), false);
  assert.equal(due(reminder, new Date(2026, 9, 30, 8).toISOString(), true, false), false);
  const dismissed = apply(reminder, command('dismiss'));
  assert.equal(due(dismissed, now, true, false), false); assert.equal(dismissed.dueAt, reminder.dueAt);
  assert.throws(() => apply(dismissed, command('one-hour', 1, 'new')), /dispensado/);
});

test('invalid commands/state and non-UTC inputs cannot silently become reminders', () => {
  const reminder = create(source(), '09:00');
  for (const patch of [{ action: 'complete' }, { at: '2026-10-30T12:00:00' }, { expectedRevision: NaN }, { expectedRevision: -1 }, { id: '' }]) assert.throws(() => apply(reminder, { ...command('one-hour'), ...patch }));
  assert.throws(() => apply({ ...reminder, key: 'tampered' }, command('dismiss')));
  assert.throws(() => apply({ ...reminder, revision: Number.MAX_SAFE_INTEGER }, command('dismiss', Number.MAX_SAFE_INTEGER)), /Limite/);
});

test('local tomorrow preserves nine oclock across DST, rejects nonexistent clocks and freezes UTC instants', () => {
  const code = `import assert from 'node:assert/strict'; import { loadComponent } from './tests/elemental/load-component.mjs';
    const {createOccurrenceReminder:create,applyReminderCommand:apply}=loadComponent('src/lib/reminders/occurrence-reminder.ts');
    const item={sourceType:'task',sourceId:'dst-test',date:new Date(2026,2,7)};
    const r=create(item,'09:00');
    const next=apply(r,{id:'dst',expectedRevision:0,action:'tomorrow-nine',at:new Date(2026,2,7,9).toISOString()});
    assert.equal(new Date(next.dueAt).getHours(),9); assert.equal(new Date(next.dueAt).getDate(),8);
    assert.equal(new Date(next.dueAt)-new Date(r.dueAt),23*3600000);
    assert.throws(()=>create({...item,date:new Date(2026,2,8)},'02:30'),/não existe/);
    const autumn=create({...item,date:new Date(2026,10,1)},'01:30'); assert.equal(autumn.dueAt,'2026-11-01T05:30:00.000Z');`;
  execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: process.cwd(), env: { ...process.env, TZ: 'America/New_York' }, stdio: 'pipe' });
});
