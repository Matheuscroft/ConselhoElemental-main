import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';

const { QuestResultStats, QuestProgress } = loadComponent('src/components/quests/QuestResultStats.tsx');
const { QuestRune, QuestVictorySeal } = loadComponent('src/components/quests/QuestRune.tsx');
const render = (Component, props) => renderToStaticMarkup(React.createElement(Component, props));

test('receipt displays supplied values without granting or inventing rewards', () => {
  const props = Object.freeze({ xp: 2.5, points: 7.25, minutes: 12.5 });
  const html = render(QuestResultStats, props);
  assert.match(html, /<dl/);
  for (const value of ['2,5', '7,25', '12,5 min']) assert.ok(html.includes(value));
  assert.doesNotMatch(html, /fragmento|streak|Claim|<button|aria-live/);
  assert.equal(render(QuestResultStats, props), html, 'Rendering again cannot advance counters');
});

test('unknown points and time stay unknown while zero is a recorded value', () => {
  const missing = render(QuestResultStats, { xp: 0, points: null, minutes: undefined });
  assert.equal((missing.match(/<dd>—<\/dd>/g) ?? []).length, 2);
  assert.match(missing, /<dd>0<\/dd>/);
  const zero = render(QuestResultStats, { xp: 0, points: 0, minutes: 0 });
  assert.doesNotMatch(zero, /—/);
  assert.match(zero, /0 min/);
});

test('progress exposes the final value immediately and handles an empty trail', () => {
  const html = render(QuestProgress, { done: 2, total: 4 });
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="2"/);
  assert.match(html, /aria-valuetext="2 de 4 rituais concluídos"/);
  assert.match(html, /scaleX\(0.5\)/);
  const empty = render(QuestProgress, { done: 0, total: 0 });
  assert.match(empty, /scaleX\(0\)/);
  assert.match(empty, /0 de 0 rituais/);
  assert.doesNotMatch(empty, /NaN|Infinity/);
});

test('element artwork is distinct, decorative and independent from remote assets', () => {
  const icons = ['terra', 'fogo', 'agua', 'ar'].map(element => render(QuestRune, { element }));
  assert.equal(new Set(icons).size, 4);
  for (const html of icons) {
    assert.match(html, /aria-hidden="true"/);
    assert.match(html, /focusable="false"/);
    assert.doesNotMatch(html, /https?:|<image|<animate|<script|id="/);
  }
});

test('celebration has no interactive or announcement content that can delay dismissal', () => {
  const html = render(QuestVictorySeal);
  assert.match(html, /aria-hidden="true"/);
  assert.doesNotMatch(html, /<button|tabindex|aria-live|<audio|<video/);
});

test('activity guide keeps task, habit, quest and project concepts linked to their own areas', async () => {
  const { MemoryRouter } = await import('react-router-dom');
  const { ActivityGuide } = loadComponent('src/components/quests/ActivityGuide.tsx');
  const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ActivityGuide)));
  for (const path of ['/rituais', '/ciclos', '/jornadas', '/grandes-obras']) assert.ok(html.includes(`href="${path}"`));
  for (const name of ['Rituais · tarefas', 'Ciclos · hábitos', 'Jornadas · quests', 'Grandes Obras · projetos']) assert.ok(html.includes(name));
  assert.match(html, /sem repetição automática/);
  assert.match(html, /dias ou datas da sua recorrência/);
});

test('chapter details link exact steps, distinguish unavailable references and preserve registered progress', async () => {
  const { MemoryRouter } = await import('react-router-dom');
  const { ProjectChapters } = loadComponent('src/components/quests/ProjectChapters.tsx');
  const { trailHref } = loadComponent('src/components/quests/quest-path.ts');
  const trail = { key: 'project:p', element: 'terra', completed: false, archived: false,
    chapters: [{ id: 'a', title: 'Estudar', progress: 12 }, { id: 'b', title: 'Estudar', progress: 0 }],
    steps: [{ key: 'task:one', title: 'Ler', chapterId: 'a', kind: 'task', available: true, completed: false, element: 'ar' },
      { key: 'task:lost', title: 'Removido', chapterId: 'a', kind: 'task', available: false, completed: false, element: 'terra' },
      { key: 'task:done', title: 'Revisar', chapterId: 'b', kind: 'task', available: true, completed: true, element: 'agua' }] };
  const markup = t => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(ProjectChapters, { trail: t })));
  const html = markup(trail);
  assert.ok(html.includes(trailHref(trail.key, 'task:one').replaceAll('&', '&amp;')));
  assert.match(html, /0 de 2 rituais concluídos/);
  assert.match(html, /1 de 1 rituais concluídos/);
  assert.match(html, /Progresso registrado do capítulo: 12%/);
  assert.match(html, /Referência indisponível/);
  assert.doesNotMatch(html, /href="[^"]*task%3Alost/);
  assert.doesNotMatch(markup({ ...trail, archived: true }), /Continuar capítulo/);
  assert.match(markup({ ...trail, chapters: [] }), /Organize esta obra em capítulos/);
});
