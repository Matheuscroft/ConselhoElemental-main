import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';
const { createQuestPlan, appendQuestStep, finishQuestStep } = loadComponent('src/components/quests/quest-commands.ts');
const { openRitualTimer } = loadComponent('src/components/elemental/sanctuary-timer.ts');
const plan = { kind: 'quest', title: ' Aprender desenho ', element: 'ar', chapter: ' Primeiros traços ', steps: [' Escolher material ', ' Praticar '] };
function fixture() {
  const calls = [];
  const state = { currentAccountId: 'a', quests: [], projects: [], tasks: [], xp: 10,
    timer: { entityId: null, entityType: null, isRunning: false, elapsedSeconds: 0 },
    addQuest(data) { calls.push(['quest', data]); const q = { id: 'existing-store-quest-id', ...data, tasks: [], isCompleted: false }; state.quests.push(q); return q; },
    addProject(data) { calls.push(['project', data]); const p = { id: 'existing-store-project-id', ...data, status: 'active', missions: [] }; state.projects.push(p); return p; },
    addMissionToProject(id, data) { calls.push(['mission', id, data]); state.projects.find(p => p.id === id).missions.push({ id: 'existing-store-mission-id', ...data }); },
    addTaskToQuest(id, data) { calls.push(['task-quest', id, data]); },
    addTaskToMission(id, mid, data) { calls.push(['task-mission', id, mid, data]); },
    startTimer(id, type) { calls.push(['start', id, type]); state.timer = { entityId: id, entityType: type, isRunning: true, elapsedSeconds: 0 }; },
    stopTimer() { calls.push(['stop']); const seconds = state.timer.elapsedSeconds; state.timer = { entityId: null, entityType: null, isRunning: false, elapsedSeconds: 0 }; return seconds; },
    pauseTimer() {}, resumeTimer() {},
    completeTask(id, minutes) { calls.push(['complete', id, minutes]); state.tasks = state.tasks.map(t => t.id === id ? { ...t, isCompleted: true, completedScore: 7, actualTimeMinutes: minutes } : t); state.xp += 3; },
    getLevelProgress() { return { xpTotal: state.xp }; },
  };
  return { state, calls, getState: () => state };
}
const leaf = { id: 't', title: 'Praticar', childItems: [], isCompleted: false };

test('new quest delegates existing store IDs and trimmed names without changing scoring defaults', () => {
  const f = fixture(); assert.equal(createQuestPlan(f.getState, 'a', plan), 'quest:existing-store-quest-id');
  assert.deepEqual(f.calls, [['quest', { title: 'Aprender desenho', elementId: 'ar', areaId: 'area-sem-categoria' }], ['task-quest', 'existing-store-quest-id', { title: 'Escolher material', elementId: 'ar' }], ['task-quest', 'existing-store-quest-id', { title: 'Praticar', elementId: 'ar' }]]);
});

test('new project creates its chapter then adds steps to the real mission ID', () => {
  const f = fixture(); assert.equal(createQuestPlan(f.getState, 'a', { ...plan, kind: 'project' }), 'project:existing-store-project-id');
  assert.equal(f.calls[1][0], 'mission'); assert.equal(f.calls[1][2].title, 'Primeiros traços');
  assert.equal(f.calls[2][2], 'existing-store-mission-id'); assert.equal(f.calls[3][0], 'task-mission');
});

test('validation and account mismatch abort before any writes', () => {
  for (const bad of [{ ...plan, title: ' ' }, { ...plan, steps: [''] }, { ...plan, steps: [] }, { ...plan, kind: 'project', chapter: '' }, { ...plan, element: 'invalid' }]) {
    const f = fixture(); assert.throws(() => createQuestPlan(f.getState, 'a', bad)); assert.deepEqual(f.calls, []);
  }
  const f = fixture(); assert.throws(() => createQuestPlan(f.getState, 'other', plan)); assert.deepEqual(f.calls, []);
});

test('append reuses the selected mission and rejects missing or archived destinations', () => {
  const f = fixture(); createQuestPlan(f.getState, 'a', { ...plan, kind: 'project' }); f.calls.length = 0;
  assert.throws(() => appendQuestStep(f.getState, 'a', 'project:existing-store-project-id', 'Novo', 'missing')); assert.deepEqual(f.calls, []);
  appendQuestStep(f.getState, 'a', 'project:existing-store-project-id', ' Novo ', 'existing-store-mission-id');
  assert.deepEqual(f.calls, [['task-mission', 'existing-store-project-id', 'existing-store-mission-id', { title: 'Novo', elementId: 'ar' }]]);
  f.calls.length = 0; f.state.projects[0].status = 'archived';
  assert.throws(() => appendQuestStep(f.getState, 'a', 'project:existing-store-project-id', 'Novo', 'existing-store-mission-id')); assert.deepEqual(f.calls, []);
});

test('completion reports recorded values and delegates exact fractional minutes only once', () => {
  const f = fixture(); f.state.tasks = [{ ...leaf }]; openRitualTimer(f.getState, { accountId: 'a', taskId: 't' }); f.state.timer.elapsedSeconds = 91;
  assert.deepEqual(finishQuestStep(f.getState, 'a', 't'), { title: 'Praticar', points: 7, xp: 3, minutes: 91 / 60 });
  assert.equal(finishQuestStep(f.getState, 'a', 't'), null);
  assert.equal(f.calls.filter(c => c[0] === 'complete').length, 1); assert.deepEqual(f.calls.at(-1), ['complete', 't', 91 / 60]);
});

test('native workouts and aggregators are never completed through the simple quest timer', () => {
  for (const extra of [{ sourceModule: 'modulo_treino' }, { childItems: [{ id: 'sub' }] }]) {
    const f = fixture(); f.state.tasks = [{ ...leaf, ...extra }]; f.state.timer = { entityId: 't', entityType: 'TASK', elapsedSeconds: 60, isRunning: true };
    assert.equal(finishQuestStep(f.getState, 'a', 't'), null); assert.deepEqual(f.calls, []);
  }
});

test('stale account, other timer, and failed completion never produce a receipt', () => {
  for (const mutate of [f => { f.state.currentAccountId = 'b'; }, f => { f.state.timer.entityId = 'other'; }, f => { f.state.completeTask = () => {}; }]) {
    const f = fixture(); f.state.tasks = [{ ...leaf }]; openRitualTimer(f.getState, { accountId: 'a', taskId: 't' }); mutate(f);
    assert.equal(finishQuestStep(f.getState, 'a', 't'), null);
  }
});
