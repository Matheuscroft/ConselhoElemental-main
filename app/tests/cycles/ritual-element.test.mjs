import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture } from './load-store.mjs';

const fields = { terra: 'xp_earth', fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air' };
const values = state => Object.fromEntries(Object.entries(fields).map(([element, key]) => [element, state.user[key]]));

test('chosen ritual element without category survives creation, completion, reload and exact Undo', async () => {
  for (const elementId of Object.keys(fields)) {
    const { store } = fixture();
    const before = values(store.getState());
    const task = store.getState().addTask({ title: `Ritual ${elementId}`, elementId, areaPrimaryId: null });
    assert.equal(task.elementId, elementId);
    assert.equal(store.getState().actions.find(action => action.id === task.id).elementId, elementId);
    store.getState().completeTask(task.id, 20);
    const current = store.getState().tasks.find(item => item.id === task.id);
    const receipt = current.completionXp;
    assert.ok(receipt.amount > 0);
    assert.equal(receipt.elementId, elementId);
    for (const [element, key] of Object.entries(fields)) assert.equal(store.getState().user[key], before[element] + (element === elementId ? receipt.amount : 0));
    await store.persist.rehydrate();
    assert.equal(store.getState().tasks.find(item => item.id === task.id).elementId, elementId);
    store.getState().completeTask(task.id, 20);
    assert.equal(store.getState().user[fields[elementId]], before[elementId] + receipt.amount);
    store.getState().uncompleteTask(task.id);
    assert.deepEqual(values(store.getState()), before);
  }
});

test('primary area classification aligns root/canonical action, nested item and custom area without rewriting paid history', () => {
  const { store } = fixture();
  const area = store.getState().addCustomArea('Conexões QA', 'agua');
  const task = store.getState().addTask({ title: 'Ritual QA', areaPrimaryId: area.id });
  assert.equal(task.elementId, 'agua');
  store.getState().updateTask(task.id, { areaPrimaryId: null, elementId: 'ar' });
  assert.equal(store.getState().tasks[0].elementId, 'ar');
  store.getState().completeTask(task.id, 15);
  const userBefore = values(store.getState());
  const paid = store.getState().tasks[0].completionXp;
  store.getState().updateTask(task.id, { areaPrimaryId: area.id });
  assert.equal(store.getState().tasks[0].elementId, 'agua');
  assert.equal(store.getState().actions.find(action => action.id === task.id).elementId, 'agua');
  assert.deepEqual(store.getState().tasks[0].completionXp, paid);
  assert.deepEqual(values(store.getState()), userBefore);
  store.getState().uncompleteTask(task.id);
  assert.equal(store.getState().user.xp_air, userBefore.ar - paid.amount);
  assert.equal(store.getState().user.xp_water, userBefore.agua);
  const parent = store.getState().addTask({ title: 'Pai', elementId: 'terra' });
  store.getState().addTaskItem(parent.id, { title: 'Filho', areaPrimaryId: area.id });
  let child = store.getState().tasks.find(item => item.id === parent.id).childItems[0];
  assert.equal(child.elementId, 'agua');
  store.getState().updateTaskItem(parent.id, child.id, { areaPrimaryId: null, elementId: 'ar' });
  store.getState().updateTaskItem(parent.id, child.id, { areaPrimaryId: area.id });
  child = store.getState().tasks.find(item => item.id === parent.id).childItems[0];
  assert.equal(child.elementId, 'agua');
});
