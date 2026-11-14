import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';

const { NoticiaElemental } = loadComponent('src/components/feedback/NoticiaElemental.tsx');
const { PreferenciasDeSom } = loadComponent('src/components/feedback/PreferenciasDeSom.tsx');
const fila = loadComponent('src/components/feedback/fila.ts');

const noticia = (extra = {}) => ({ id: 'n1', tipo: 'conclusao', nome: 'Meditar dez minutos', elemento: 'fogo', xp: 12, ...extra });
const html = (n) => renderToStaticMarkup(React.createElement(NoticiaElemental, { noticia: n, semTemporizador: true }));

test('the notice shows name, XP and element label, as a polite status', () => {
  const out = html(noticia());
  assert.match(out, /role="status"/);
  assert.match(out, /aria-live="polite"/);
  assert.match(out, /Meditar dez minutos/);
  assert.match(out, /\+12 XP/);
  assert.match(out, />Fogo</);
});

test('without XP there is no XP chip', () => {
  assert.doesNotMatch(html(noticia({ xp: 0 })), /XP/);
});

test('the four elements carry distinct classes', () => {
  const classes = ['fogo', 'agua', 'ar', 'terra'].map((e) => /class="noticia ([^"]*)"/.exec(html(noticia({ elemento: e })))[1]);
  assert.equal(new Set(classes).size, 4);
  assert.match(classes[1], /noticia--agua/);
});

test('an ascension names the level and offers the way to the frame only when no screen heard it', () => {
  const a = renderToStaticMarkup(React.createElement(NoticiaElemental, {
    noticia: noticia({ tipo: 'ascensao', nivel: 3, xp: 0, nome: '', elemento: 'terra', semTela: true }),
    onVer() {}, semTemporizador: true,
  }));
  assert.match(a, /Domínio/);
  assert.match(a, /Ver na borda/);
  assert.doesNotMatch(html(noticia({ tipo: 'ascensao', nivel: 2, elemento: 'ar', semTela: false })), /Ver na borda/);
  assert.match(html(noticia({ tipo: 'ascensao', nivel: 2, elemento: 'ar' })), /Fluxo/);
});

test('sound preferences render the three labelled controls', () => {
  const out = renderToStaticMarkup(React.createElement(PreferenciasDeSom));
  assert.match(out, />Som</);
  assert.match(out, /<label[^>]*>Volume<\/label>/);
  assert.match(out, /type="range"/);
  assert.match(out, />Vibração</);
  assert.equal((out.match(/role="switch"/g) ?? []).length, 2);
});

const conclusao = (i, xp = 10, elemento = 'fogo') => ({ tipo: 'conclusao', id: `c${i}`, nome: `t${i}`, elemento, xp });
const ids = () => { let i = 0; return () => `id${++i}`; };

test('a burst of more than three becomes one summary with the XP added up', () => {
  const out = fila.noticiasDeConclusoes([1, 2, 3, 4, 5].map((i) => conclusao(i, 10)), ids());
  assert.equal(out.length, 1);
  assert.equal(out[0].tipo, 'resumo');
  assert.equal(out[0].nome, '5 conclusões');
  assert.equal(out[0].xp, 50);
  assert.equal(out[0].elemento, 'fogo');
  assert.equal(fila.noticiasDeConclusoes([conclusao(1, 5, 'ar'), conclusao(2, 5, 'terra'), conclusao(3, 5, 'ar'), conclusao(4, 5, 'ar')], ids())[0].elemento, null);
});

test('three or fewer stay separate', () => {
  assert.equal(fila.noticiasDeConclusoes([1, 2, 3].map((i) => conclusao(i)), ids()).length, 3);
});

test('at most three are visible and the oldest leaves first', () => {
  const novo = ids();
  let atual = [];
  for (let i = 0; i < 5; i += 1) atual = fila.empilhar(atual, fila.noticiasDeConclusoes([conclusao(i)], novo));
  assert.deepEqual(atual.map((n) => n.nome), ['t2', 't3', 't4']);
  assert.deepEqual(fila.remover(atual, atual[0].id).map((n) => n.nome), ['t3', 't4']);
});

test('sound intensity is XP over 40, clamped to 0..1', () => {
  assert.equal(fila.intensidadeDoXp(20), 0.5);
  assert.equal(fila.intensidadeDoXp(400), 1);
  assert.equal(fila.intensidadeDoXp(-3), 0);
  assert.equal(fila.intensidadeDoXp(NaN), 0);
});
