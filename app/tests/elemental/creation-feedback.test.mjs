import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';

const { CreationResult } = loadComponent('src/components/invocation/CreationResult.tsx');
const { ForgeFeedback } = loadComponent('src/components/forge/ForgeFeedback.tsx');
const { creationStepPose } = loadComponent('src/components/motion/CreationStep.tsx');
const render = node => renderToStaticMarkup(React.createElement(MemoryRouter, null, node));

test('creation receipt offers the matching destination and sanctuary for all five types', () => {
  for (const [type, path] of Object.entries({ ACTION: '/rituais', HABIT: '/ciclos', QUEST: '/jornadas', PROJECT: '/grandes-obras', DRAFT: '/forja' })) {
    const html = render(React.createElement(CreationResult, { type, title: 'Minha intenção <nova>' }));
    assert.ok(html.includes(`href="${path}"`));
    assert.ok(html.includes('href="/santuario"'));
    assert.ok(html.includes('Minha intenção &lt;nova&gt;'));
    assert.match(html, /Você escolhe o próximo passo/);
    assert.equal((html.match(/<a /g) ?? []).length, 2);
  }
});

test('forge result keeps title and outcome explicit; only conversions offer a destination', () => {
  const value = { title: 'Ideia <real>', message: 'Alterações salvas.' };
  const edited = render(React.createElement(ForgeFeedback, { value }));
  assert.match(edited, /Ideia &lt;real&gt;/);
  assert.match(edited, /Alterações salvas\./);
  assert.doesNotMatch(edited, /<a /);
  const converted = render(React.createElement(ForgeFeedback, { value: { ...value, destination: 'QUEST' } }));
  assert.match(converted, /href="\/jornadas"/);
  assert.match(converted, /Ver Jornadas/);
});

test('forward and backward step transitions mirror each other; reduced motion never displaces', () => {
  for (const direction of [-1, 1]) {
    const entering = creationStepPose(direction, false);
    const exiting = creationStepPose(direction, false, true);
    assert.equal(entering.x, -exiting.x);
    assert.equal(Math.sign(entering.x), direction);
    assert.equal(creationStepPose(direction, true).x, 0);
    assert.equal(creationStepPose(direction, true, true).x, 0);
  }
});
