import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

const { Vazio } = loadComponent('src/components/elemental/blocos/Vazio.tsx');
const { MarcaElemento } = loadComponent('src/components/elemental/blocos/MarcaElemento.tsx');
const { Medidor } = loadComponent('src/components/elemental/blocos/Medidor.tsx');
const render = (el) => renderToStaticMarkup(el);
const h = React.createElement;

test('Vazio: quatro sigilos, h3, ação e data-compacto', () => {
  const html = render(h(Vazio, { titulo: 'Nada ainda', texto: 'Comece', acao: h('button', null, 'Criar'), compacto: true }));
  assert.match(html, /class="ds-vazio"/);
  assert.match(html, /data-compacto/);
  assert.equal((html.match(/class="cycle-sigil"/g) ?? []).length, 4);
  assert.match(html, /<h3[^>]*>Nada ainda<\/h3>/);
  assert.match(html, /<button>Criar<\/button>/);
  assert.match(html, /class="ds-vazio-losango"/);
  assert.doesNotMatch(render(h(Vazio, { titulo: 'x' })), /data-compacto/);
});

test('MarcaElemento: data-element e nome por elemento', () => {
  const nomes = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
  for (const [el, nome] of Object.entries(nomes)) {
    const html = render(h(MarcaElemento, { elemento: el }));
    assert.match(html, new RegExp(`class="ds-marca" data-element="${el}"`));
    assert.ok(html.includes(`${nome}</span>`), el);
    assert.match(html, /data-size="trail"/);
  }
  assert.match(render(h(MarcaElemento, { elemento: 'ar', tom: 'ouro' })), /data-tom="ouro"/);
});

test('Medidor fio: progressbar com valores e --medidor-valor', () => {
  const html = render(h(Medidor, { forma: 'fio', valor: 0.4, rotulo: '2 de 5', espesso: true }));
  assert.match(html, /role="progressbar"/);
  assert.match(html, /aria-valuenow="40"/);
  assert.match(html, /aria-valuemin="0"/);
  assert.match(html, /aria-valuemax="100"/);
  assert.match(html, /aria-label="2 de 5"/);
  assert.match(html, /--medidor-valor:0\.4/);
  assert.match(html, /data-forma="fio"/);
  assert.match(html, /data-espesso/);
  assert.match(render(h(Medidor, { valor: 7 })), /--medidor-valor:1[;"]/);
});

test('Medidor trilha: N itens e acima de 14 vira fio', () => {
  const html = render(h(Medidor, { forma: 'trilha', valor: 0.5, itens: 6 }));
  assert.match(html, /data-forma="trilha"/);
  assert.match(html, /<ol[^>]*aria-hidden="true"/);
  assert.equal((html.match(/<li/g) ?? []).length, 6);
  assert.equal((html.match(/data-filled="true"/g) ?? []).length, 3);
  const longo = render(h(Medidor, { forma: 'trilha', valor: 0.5, itens: 15 }));
  assert.match(longo, /data-forma="fio"/);
  assert.doesNotMatch(longo, /<li/);
});

test('Medidor anel: pathLength 100, estado e sem número', () => {
  const html = render(h(Medidor, { forma: 'anel', valor: 0.25, estado: 'baixo', tamanho: 44 }));
  assert.match(html, /pathLength="100"/);
  assert.match(html, /stroke-dasharray="25 100"/);
  assert.match(html, /data-estado="baixo"/);
  assert.doesNotMatch(html.replace(/<[^>]*>/g, ''), /\d/);
});
