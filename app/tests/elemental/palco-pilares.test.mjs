import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from './load-component.mjs';
const { PalcoPilares } = loadComponent('src/components/pilares/PalcoPilares.tsx');

const base = { descricao: 'Descrição do pilar.', areas: 3, ativas: 1 };
const render = (itens) => renderToStaticMarkup(React.createElement(MemoryRouter, null, React.createElement(PalcoPilares, { itens })));
const itens = (pontos) => ['fogo', 'ar', 'agua', 'terra'].map((id, i) => ({ ...base, id, nome: id.toUpperCase(), pontos: pontos[i], porcentagem: pontos[i] ? 25 : 0 }));

test('the stage has four tabs, one selected, one tabpanel and no canvas in the SSR', () => {
  const html = render(itens([0, 5, 2, 0]));
  assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
  assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
  assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 1);
  assert.doesNotMatch(html, /<canvas/);
  assert.match(html, /role="tablist"[^>]*aria-label="Pilares elementais"/);
});

test('the focus starts on the element with most points, and on the first when all are zero', () => {
  assert.match(render(itens([0, 5, 2, 0])), /id="pilar-aba-ar"[^>]*aria-selected="true"/);
  const vazio = render(itens([0, 0, 0, 0]));
  assert.match(vazio, /id="pilar-aba-fogo"[^>]*aria-selected="true"/);
  assert.match(vazio, /Seu FOGO aparece aqui quando você registrar atividades/);
  assert.equal((vazio.match(/Ainda sem pontos/g) ?? []).length, 4);
});

test('the explore button leads to the element page', () => {
  const html = render(itens([1, 0, 0, 0]));
  assert.match(html, /href="\/santuario\/elementos\/fogo"/);
});
