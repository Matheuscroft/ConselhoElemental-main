import assert from 'node:assert/strict';
import test from 'node:test';
import { loadComponent } from '../elemental/load-component.mjs';
const { buildGrimoireHistory: build, filterGrimoireHistory: filter } = loadComponent('src/components/grimorio/history.ts');
const day = new Date(2026, 9, 22, 12);
const action = (id, overrides = {}) => ({ id, title: `Ritual ${id}`, lifecycleType: 'ACTION', isCompleted: true, completedAt: day, completedScore: 7, actualTimeMinutes: 12, childItems: [], ...overrides });
const completion = (id, overrides = {}) => ({ id, completionDate: day, scoreEarned: 4, timeSpentMinutes: 10, ...overrides });
const habit = (id, overrides = {}) => ({ id, name: `Ciclo ${id}`, title: `Ciclo ${id}`, lifecycleType: 'HABIT', completions: [completion(`completion-${id}`)], childHabits: [], ...overrides });
const log = (id, subjectId, overrides = {}) => ({ id, subjectId, subjectType: 'ACTION', timestamp: day, executedValue: 9.25, actualTimeMinutes: 14.5, completedItemIds: [], fullCompletion: true, ...overrides });
const source = (overrides = {}) => ({ actions: [], tasks: [], habits: [], logs: [], ...overrides });
const freeze = object => { Object.freeze(object); for (const value of Object.values(object)) if (value && typeof value === 'object' && !Object.isFrozen(value)) freeze(value); return object; };

test('a workout recorded as action, task and execution appears once with executed values', () => {
  const task = action('workout', { sourceModule: 'modulo_treino', completedScore: 99 });
  const result = build(source({ actions: [task], tasks: [task], logs: [log('session', task.id, { sourceModule: 'modulo_treino' })] }));
  assert.equal(result.length, 1);
  assert.deepEqual(result[0], { id: 'log:session', title: task.title, kind: 'treino', date: day, points: 9.25, minutes: 14.5, completed: true });
});

test('habit completion shares an ID with its native log; another day remains visible', () => {
  const h = habit('training', { sourceModule: 'modulo_treino', completions: [completion('session'), completion('previous', { completionDate: new Date(2026, 9, 21) })] });
  const result = build(source({ habits: [h], logs: [log('session', h.id, { subjectType: 'HABIT', sourceModule: 'modulo_treino' })] }));
  assert.deepEqual(result.map(item => item.id), ['log:session', 'habit:training:previous']);
});

test('a full log suppresses a legacy completion for the same habit on its local date', () => {
  const h = habit('walk');
  const result = build(source({ habits: [h], logs: [log('older-log', h.id, { subjectType: 'HABIT', timestamp: new Date(2026, 9, 22, 23, 59) })] }));
  assert.equal(result.length, 1);
});

test('a partial execution stays separate from the later completed occurrence', () => {
  const h = habit('read');
  const result = build(source({ habits: [h], logs: [log('partial', h.id, { subjectType: 'HABIT', fullCompletion: false })] }));
  assert.equal(result.length, 2);
  assert.equal(result.find(item => item.id === 'log:partial').completed, false);
  assert.equal(result.find(item => item.id.startsWith('habit:')).completed, true);
});

test('completed children covered by a partial parent log are not repeated', () => {
  const child = action('child');
  const parent = action('parent', { isCompleted: false, childItems: [child] });
  const result = build(source({ tasks: [parent], logs: [log('partial', parent.id, { fullCompletion: false, completedItemIds: [child.id] })] }));
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'log:partial');
});

test('unknown values stay unknown: no planned scores or updated dates are substituted', () => {
  const task = action('legacy', { completedAt: 'invalid', completedScore: null, actualTimeMinutes: null, baseValue: 200, updatedAt: day });
  const result = build(source({ tasks: [task] }))[0];
  assert.equal(result.date, null); assert.equal(result.points, null); assert.equal(result.minutes, null);
  const invalid = build(source({ logs: [log('invalid', 'gone', { executedValue: NaN, timestamp: null, actualTimeMinutes: Infinity })] }))[0];
  assert.equal(invalid.date, null); assert.equal(invalid.points, null); assert.equal(invalid.minutes, null);
  assert.equal(invalid.title, 'Atividade registrada');
});

test('nested and flat records are read without mutation; incomplete tasks are absent', () => {
  const child = action('child');
  const root = action('root', { isCompleted: false, childItems: [child] });
  const standalone = action('flat-only');
  const h = habit('root-habit', { childHabits: [habit('child-habit')] });
  const data = freeze(source({ tasks: [root], actions: [child, standalone], habits: [h] }));
  const before = JSON.stringify(data);
  const result = build(data);
  assert.equal(result.length, 4);
  assert.equal(result.filter(entry => entry.id === 'task:child').length, 1);
  assert.equal(result.some(entry => entry.id === 'task:root'), false);
  assert.equal(JSON.stringify(data), before);
  assert.notEqual(result[0].date, day);
});

test('execution score takes precedence over legacy earned score, including zero', () => {
  const h = habit('h', { completions: [completion('a', { executedScore: 0, scoreEarned: 90 }), completion('b', { scoreEarned: 12.75 })] });
  const result = build(source({ habits: [h] }));
  assert.equal(result.find(entry => entry.id.endsWith(':a')).points, 0);
  assert.equal(result.find(entry => entry.id.endsWith(':b')).points, 12.75);
});

test('history is newest first, undated last, with duplicate log IDs collapsed', () => {
  const logs = [log('old', 'a', { timestamp: new Date(2026, 0, 1) }), log('new', 'b', { timestamp: day }), log('undated', 'c', { timestamp: 'bad' })];
  assert.deepEqual(build(source({ logs: [...logs, logs[0]] })).map(entry => entry.id), ['log:new', 'log:old', 'log:undated']);
});

const entry = (id, date, overrides = {}) => ({ id, date, title: 'Meditação de manhã', kind: 'ciclo', points: 1, minutes: 5, completed: true, ...overrides });
test('filters combine accent-insensitive terms, type and date without reordering inputs', () => {
  const data = freeze([entry('yes', day), entry('other-type', day, { kind: 'ritual' }), entry('name', day, { title: 'Corrida' })]);
  const result = filter(data, '  MANHA meditacao ', 'ciclo', '7', day);
  assert.deepEqual(result.map(item => item.id), ['yes']);
  assert.equal(result[0], data[0]);
});

test('seven-day period includes whole local days across the year and excludes future/undated', () => {
  const now = new Date(2027, 0, 2, 0, 5);
  const data = [entry('start', new Date(2026, 11, 27)), entry('before', new Date(2026, 11, 26, 23, 59)), entry('today', new Date(2027, 0, 2, 23, 59)), entry('future', new Date(2027, 0, 3)), entry('undated', null)];
  assert.deepEqual(filter(data, '', 'all', '7', now).map(item => item.id), ['start', 'today']);
  assert.equal(filter(data, '', 'all', 'all', now).length, 5);
});

test('thirty-day period handles month boundaries and refreshes after midnight', () => {
  const data = [entry('boundary', new Date(2026, 9, 3)), entry('earlier', new Date(2026, 9, 2, 23, 59))];
  assert.deepEqual(filter(data, '', 'all', '30', new Date(2026, 10, 1)).map(item => item.id), ['boundary']);
  assert.equal(filter(data, '', 'all', '30', new Date(2026, 10, 2)).length, 0);
});
