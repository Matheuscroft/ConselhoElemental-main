import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

const { HudRecursos } = loadComponent('src/components/layout/HudRecursos.tsx');
const html = renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(HudRecursos)));
const bandejaInicio = html.indexOf('id="hud-bandeja"');
const fora = html.slice(0, bandejaInicio);
const dentro = html.slice(bandejaInicio);

test('the thread is one closed button wired to the tray', () => {
  assert.match(html, /<button[^>]*class="hud-fio"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /aria-controls="hud-bandeja"/);
  assert.ok(bandejaInicio > 0, 'the tray exists in the markup');
});

test('four accounts carry their resource and state', () => {
  for (const recurso of ['ofensiva', 'vida', 'stamina', 'prana']) {
    assert.match(fora, new RegExp(`class="hud-conta"[^>]*data-recurso="${recurso}"`), recurso);
  }
  assert.equal((fora.match(/data-recurso=/g) ?? []).length, 4);
  assert.equal((fora.match(/data-estado=/g) ?? []).length, 4);
  assert.match(fora, /--hud-cor:#/);
});

test('accessible name carries the raw figures and the decorative parts hide', () => {
  const nome = html.match(/<button[^>]*class="hud-fio"[^>]*aria-label="([^"]+)"/)?.[1]
    ?? html.match(/aria-label="([^"]+)"[^>]*class="hud-fio"/)?.[1] ?? '';
  assert.match(nome, /Nível \d+, \d+ de \d+ XP\. Ofensiva \d+ dias?, vida \d+ de 100, stamina \d+ de 100, prana \d+ de 100\. Mostrar detalhes/);
  assert.match(fora, /class="hud-contas" aria-hidden="true"/);
});

test('no number is visible outside the tray except the level seal', () => {
  const visivel = fora
    .replace(/<span class="hud-selo"[^>]*>\d+<\/span>/, '')
    .replace(/<[^>]*>/g, ' ');
  assert.doesNotMatch(visivel, /\d/);
});

test('the tray holds the progressbar and the definition list', () => {
  assert.match(dentro, /role="progressbar"/);
  assert.match(dentro, /<dl class="hud-grade">/);
  assert.match(dentro, /faltam/);
  assert.match(dentro, /\/100/);
  assert.doesNotMatch(fora, /role="progressbar"/);
});
