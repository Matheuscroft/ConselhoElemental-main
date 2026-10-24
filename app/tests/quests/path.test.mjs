import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';
const { buildQuestTrails, nextQuestCards, trailHref } = loadComponent('src/components/quests/quest-path.ts');
const { QuestTrailMap } = loadComponent('src/components/quests/QuestTrailMap.tsx');
const task = (id, extra = {}) => ({ id, title: `Ritual ${id}`, elementId: 'terra', parentId: null, isCompleted: false, childItems: [], plannedTimeMinutes: null, ...extra });
const quest = (id, extra = {}) => ({ id, title: `Jornada ${id}`, elementId: 'terra', tasks: [], habits: [], itemOrder: [], isCompleted: false, ...extra });
const project = (id, extra = {}) => ({ ...quest(id), status: 'active', missions: [], quests: [], ...extra });
const source = (extra = {}) => ({ tasks: [], habits: [], quests: [], projects: [], ...extra });

test('live IDs override stale aggregator snapshots without changing macro progress', () => {
  const data = source({ tasks: [task('a', { isCompleted: true, title: 'Título atual' })], quests: [quest('q', { tasks: [task('a')], progress: 0 })] });
  const before = JSON.stringify(data);
  const [trail] = buildQuestTrails(data);
  assert.equal(trail.steps[0].title, 'Título atual'); assert.equal(trail.done, 1); assert.equal(trail.next, undefined);
  assert.equal(trail.completed, false); assert.equal(JSON.stringify(data), before);
  data.tasks[0].isCompleted = false;
  assert.equal(buildQuestTrails(data)[0].done, 0, 'Undo must be reflected from the live record');
});

test('deleted references remain unavailable, not falsely completed or offered next', () => {
  const [trail] = buildQuestTrails(source({ tasks: [task('b')], quests: [quest('q', { tasks: [task('a', { isCompleted: true }), task('b')] })] }));
  assert.equal(trail.steps[0].available, false); assert.equal(trail.done, 0); assert.equal(trail.total, 2); assert.equal(trail.next.id, 'b');
});

test('itemOrder and parent-linked additions preserve meaningful step order', () => {
  const [trail] = buildQuestTrails(source({ tasks: [task('a'), task('b'), task('c', { parentId: 'q' })], quests: [quest('q', { tasks: [task('a'), task('b')], itemOrder: ['b', 'a'] })] }));
  assert.deepEqual(trail.steps.map(s => s.id), ['b', 'a', 'c']);
});

test('recurring habits are distinct from finite progress and stay accessible', () => {
  const habit = { id: 'h', name: 'Respirar', elementId: 'ar', completions: ['2026-10-22'] };
  const [trail] = buildQuestTrails(source({ habits: [habit], quests: [quest('q', { habits: [habit] })] }));
  assert.equal(trail.total, 0); assert.equal(trail.done, 0); assert.equal(trail.next, undefined); assert.equal(trail.steps[0].kind, 'habit'); assert.equal(trail.steps[0].available, true);
});

test('project chapters and nested journeys resolve live tasks and deduplicate IDs', () => {
  const q = quest('q', { tasks: [task('b'), task('a')], title: 'Jornada atual' });
  const [_, trail] = buildQuestTrails(source({ tasks: [task('a'), task('b')], quests: [q], projects: [project('p', { missions: [{ id: 'm', title: 'Capítulo', tasks: [task('a')], habits: [] }], quests: [quest('q')] })] }));
  assert.equal(trail.total, 2); assert.deepEqual(trail.chapters, [{ id: 'm', title: 'Capítulo' }]); assert.equal(trail.steps.find(s => s.id === 'b').chapter, 'Jornada atual');
});

test('completed or archived macro records are never offered as next quests', () => {
  const trails = buildQuestTrails(source({ tasks: [task('a')], quests: [quest('q', { tasks: [task('a')], isCompleted: true })], projects: [project('p', { tasks: [task('a')], status: 'archived' })] }));
  assert.equal(nextQuestCards(trails).length, 0); assert.equal(trails[1].steps.length, 1);
});

test('home suggestions deduplicate shared actions across trails', () => {
  const trails = buildQuestTrails(source({ tasks: [task('a'), task('b')], quests: [quest('one', { tasks: [task('a')] }), quest('two', { tasks: [task('a')] }), quest('three', { tasks: [task('b')] })] }));
  assert.deepEqual(nextQuestCards(trails).map(t => t.next.id), ['a', 'b']);
  assert.equal(nextQuestCards(trails, 1).length, 1);
});

test('native and aggregate task destinations are distinguishable without losing steps', () => {
  const tasks = [task('a', { sourceModule: 'modulo_treino' }), task('b', { childItems: [{ id: 'child' }] })];
  const [trail] = buildQuestTrails(source({ tasks, quests: [quest('q', { tasks })] }));
  assert.equal(trail.steps[0].native, true); assert.equal(trail.steps[1].hasChildren, true);
});

test('URL deep links preserve exact opaque IDs and never include execution commands', () => {
  const url = new URL(trailHref('quest:a/b&c', 'task:d#e'), 'https://example.test');
  assert.equal(url.pathname, '/rituais'); assert.equal(url.searchParams.get('trilha'), 'quest:a/b&c'); assert.equal(url.searchParams.get('etapa'), 'task:d#e'); assert.equal([...url.searchParams].length, 2);
});

test('all nodes are freely selectable, including later steps; current and expansion are separate', () => {
  const tasks = [task('a'), task('b'), task('c', { isCompleted: true })];
  const [trail] = buildQuestTrails(source({ tasks, quests: [quest('q', { tasks })] }));
  const selections = [];
  const tree = QuestTrailMap({ trail, selectedKey: 'task:b', onSelect: key => selections.push(key), detail: s => React.createElement('p', null, s.title) });
  const list = tree.props.children[0];
  for (const item of list.props.children) item.props.children[1].props.onClick();
  assert.deepEqual(selections, ['task:a', 'task:b', 'task:c']);
  const html = renderToStaticMarkup(tree);
  assert.equal((html.match(/<button/g) ?? []).length, 3); assert.doesNotMatch(html, /disabled/);
  assert.match(html, /aria-current="step"/); assert.match(html, /aria-expanded="true" aria-controls="quest-detail-quest%3Aq-1"/);
});

test('trail rendering escapes user content and does not invent rewards or locked steps', () => {
  const tasks = [task('a', { title: '<script>alert(1)</script>' })];
  const [trail] = buildQuestTrails(source({ tasks, quests: [quest('q', { tasks })] }));
  const html = renderToStaticMarkup(React.createElement(QuestTrailMap, { trail, selectedKey: 'task:a', onSelect() {}, detail: () => 'Livre' }));
  assert.match(html, /&lt;script&gt;/); assert.doesNotMatch(html, /<script|Claim XP|Bloqueado/);
});

test('completed status also suppresses next recommendations when legacy boolean differs', () => {
  const tasks = [task('a')];
  const [trail] = buildQuestTrails(source({ tasks, quests: [quest('q', { tasks, status: 'completed', isCompleted: false })] }));
  assert.equal(trail.completed, true); assert.equal(trail.next, undefined);
});

test('only explicit same-page quest selection preserves scroll; external entry and list navigation reset', () => {
  const { preserveQuestStepScroll } = loadComponent('src/components/quests/quest-navigation.ts');
  assert.equal(preserveQuestStepScroll('/rituais', '/rituais', { questStepSelection: true }), true);
  for (const args of [[undefined, '/rituais', { questStepSelection: true }], ['/santuario', '/rituais', { questStepSelection: true }], ['/rituais', '/rituais', null], ['/rituais', '/rituais', { questStepSelection: false }], ['/ciclos', '/ciclos', { questStepSelection: true }]]) assert.equal(preserveQuestStepScroll(...args), false);
});


test('different trails keep disclosure IDs distinct and tied to their controls', () => {
  const data = source({ tasks: [task('a')], quests: [quest('one', { tasks: [task('a')] }), quest('two', { tasks: [task('a')] })] });
  const html = buildQuestTrails(data).map(trail => renderToStaticMarkup(React.createElement(QuestTrailMap, { trail, selectedKey: 'task:a', onSelect() {}, detail: () => 'Detalhes' }))).join('');
  const controls = [...html.matchAll(/aria-controls="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(controls).size, 2);
  for (const id of controls) assert.ok(html.includes(`id="${id}"`));
});

test('deleted completed snapshots are presented as unavailable, without a completion treatment', () => {
  const [trail] = buildQuestTrails(source({ quests: [quest('q', { tasks: [task('removed', { isCompleted: true })] })] }));
  const html = renderToStaticMarkup(React.createElement(QuestTrailMap, { trail, onSelect() {}, detail: () => 'Revisar composição' }));
  assert.match(html, /data-complete="false"/);
  assert.match(html, /data-available="false"/);
  assert.match(html, /Indisponível/);
  assert.doesNotMatch(html, /aria-current="step"|disabled/);
});

test('long trails retain every complete title and freely selectable action', () => {
  const tasks = Array.from({ length: 100 }, (_, i) => task(String(i), { title: `Etapa ${i} com título completo para leitura e navegação` }));
  const [trail] = buildQuestTrails(source({ tasks, quests: [quest('q', { tasks })] }));
  const html = renderToStaticMarkup(React.createElement(QuestTrailMap, { trail, selectedKey: 'task:99', onSelect() {}, detail: () => 'Selecionada' }));
  assert.equal((html.match(/<button/g) ?? []).length, 100);
  assert.equal((html.match(/aria-expanded="true"/g) ?? []).length, 1);
  for (const task of tasks) assert.ok(html.includes(task.title));
  assert.match(html, /aria-controls="quest-detail-quest%3Aq-99"/);
});

test('Rituais opens tasks by default, with explicit trail and legacy links preserved', () => {
  const { ritualView } = loadComponent('src/components/quests/quest-navigation.ts');
  for (const query of ['', 'view=lista', 'view=unknown', 'etapa=task%3Aone', 'trilha=']) assert.equal(ritualView(new URLSearchParams(query)), 'lista');
  for (const query of ['view=trilhas', 'trilha=quest%3Aone', 'trilha=project%3Atwo&etapa=task%3Aone']) assert.equal(ritualView(new URLSearchParams(query)), 'trilhas');
  const explicitList = new URLSearchParams('view=lista&trilha=project%3Atwo&etapa=task%3Aone');
  const before = explicitList.toString();
  assert.equal(ritualView(explicitList), 'lista');
  assert.equal(explicitList.toString(), before, 'View selection must not erase a saved deep link');
});
