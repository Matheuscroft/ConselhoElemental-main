import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';

const { RosaElemental, anguloMaisCurto } = loadComponent('src/components/mais/RosaElemental.tsx');
const contagens = { fogo: 6, ar: 3, agua: 4, terra: 1 };
const render = (props = {}) => renderToStaticMarkup(React.createElement(RosaElemental, { ativo: 'agua', contagens, onEscolher() {}, ...props }));
const botoes = (html) => html.match(/<button\b[^>]*>/g) ?? [];

test('quatro botões rotulados, uma parada de Tab e um aria-current', () => {
  const html = render();
  const lista = botoes(html);
  assert.equal(lista.length, 4);
  for (const rotulo of ['Fogo, Agir, 6 páginas', 'Ar, Saber, 3 páginas', 'Água, Fluir, 4 páginas', 'Terra, Sustentar, 1 página'])
    assert.ok(html.includes(`aria-label="${rotulo}"`), rotulo);
  assert.equal(lista.filter((b) => b.includes('tabindex="0"')).length, 1);
  assert.ok(lista.find((b) => b.includes('tabindex="0"')).includes('Água'));
  assert.equal(lista.filter((b) => b.includes('aria-current="true"')).length, 1);
  assert.ok(lista.every((b) => b.includes('type="button"')));
});

test('o svg é decorativo e só a compacta torna os botões inertes', () => {
  assert.match(render(), /<svg\b[^>]*aria-hidden="true"/);
  assert.equal(botoes(render()).filter((b) => b.includes('inert')).length, 0);
  assert.equal(botoes(render({ compacta: true })).filter((b) => b.includes('inert')).length, 4);
});

test('a agulha acumula o ângulo pelo caminho mais curto', () => {
  assert.equal(anguloMaisCurto(270, 0), 360);
  assert.equal(anguloMaisCurto(0, 270), -90);
  assert.equal(anguloMaisCurto(90, 270), -90); // empate de 180: anti-horário
  assert.equal(anguloMaisCurto(360, 90), 450);
});

test('a busca apaga os triângulos fora do conjunto', () => {
  const html = render({ acesos: ['ar'] });
  assert.equal((html.match(/data-apagado="true"/g) ?? []).length, 3);
});
