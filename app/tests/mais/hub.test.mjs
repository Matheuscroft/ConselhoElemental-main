import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from '../elemental/load-component.mjs';

const root = new URL('../../', import.meta.url).pathname;
const { HubMagico } = loadComponent('src/components/mais/HubMagico.tsx');
const { filterNavigationRoutes } = loadComponent('src/components/elemental/navigation.ts');
const { APP_ROUTES } = loadComponent('src/lib/app-routes.ts');

const render = (pathname = '/lua') => renderToStaticMarkup(
  React.createElement(MemoryRouter, { initialEntries: [pathname] }, React.createElement(HubMagico, { pathname, onFechar() {}, onNavegar() {} })),
);
const html = render();
const tags = (re) => html.match(re) ?? [];
const texto = html.replace(/<[^>]+>/g, ' ');

test('um href por rota visível e aria-current só na Lua', () => {
  const visiveis = filterNavigationRoutes(APP_ROUTES, '');
  for (const rota of visiveis) assert.ok(html.includes(`href="${rota.path}"`), rota.path);
  const atuais = tags(/<[^>]*aria-current="page"[^>]*>/g);
  assert.equal(atuais.length, 1);
  assert.ok(atuais[0].includes('href="/lua"'));
  assert.ok(html.includes('data-ativo="agua"'), 'a rosa aponta a água');
});

test('a rosa tem 4 botões rotulados e uma só parada de Tab; o tabindex rotativo cai na água', () => {
  const rosa = html.slice(html.indexOf('rosa-botoes'), html.indexOf('rosa-botoes') + 2000);
  const botoes = rosa.match(/<button\b[^>]*>/g).slice(0, 4);
  assert.equal(botoes.filter((b) => b.includes('aria-label="') && b.includes('páginas"')).length, 4);
  assert.equal(botoes.filter((b) => b.includes('tabindex="0"')).length, 1);
  assert.ok(botoes.find((b) => b.includes('tabindex="0"')).includes('Água'));
});

test('a busca é type=search com rótulo, e o status vive logo abaixo', () => {
  const entrada = tags(/<input\b[^>]*>/g).find((i) => i.includes('type="search"'));
  assert.ok(entrada, 'input type=search');
  const id = entrada.match(/\bid="([^"]+)"/)[1];
  assert.ok(html.includes(`for="${id}"`), 'label ligado ao campo');
  assert.ok(html.includes('placeholder="Buscar uma página: lua, treino, semana"'));
  assert.ok(html.includes('role="status"'));
  assert.ok(html.indexOf('role="status"') > html.indexOf('type="search"'));
  assert.ok(html.indexOf('role="status"') < html.indexOf('hub-corpo'));
});

test('as quatro inscrições, os portais e Som e vibração existem; nada de "·" nem lucide', () => {
  for (const el of ['fogo', 'ar', 'agua', 'terra']) assert.ok(html.includes(`id="mais-inscricao-${el}"`), el);
  for (const rotulo of ['Nova atividade', 'Meu progresso', 'Minha semana', 'Treinar']) assert.ok(texto.includes(rotulo), rotulo);
  assert.ok(texto.includes('Som e vibração'));
  assert.ok(texto.includes('Todas as páginas'));
  assert.equal(texto.includes('·'), false);
  assert.equal(/lucide/.test(html), false);
  assert.equal(html.includes('Há pouco'), false, 'sem recentes, sem "Há pouco"');
});

test('a ordem do DOM é a ordem de foco: fechar, rosa, busca, portais, inscrições, som', () => {
  assert.equal(/tabindex="[1-9]/.test(html), false, 'nenhum tabindex positivo');
  const marcas = ['aria-label="Fechar"', 'rosa-botoes', 'type="search"', 'hub-portais', 'id="mais-inscricao-fogo"', 'id="mais-inscricao-terra"', 'Som e vibração'];
  const posicoes = marcas.map((m) => html.indexOf(m));
  posicoes.forEach((p, i) => assert.ok(p >= 0, marcas[i]));
  assert.deepEqual([...posicoes].sort((a, b) => a - b), posicoes);
});

test('o CSS do hub: sem filtro de fundo, sem ms nem font-size literal, raios 12/16/50%, reduzido cobre cada animação', () => {
  const css = readFileSync(resolve(root, 'src/components/mais/hub.css'), 'utf8');
  assert.equal(/backdrop-filter/.test(css), false);
  assert.equal(/\d\s*ms\b/.test(css.replace(/\/\*[\s\S]*?\*\//g, '')), false);
  assert.equal(/font-size:\s*[\d.]+(px|rem|em)/.test(css), false);
  for (const [, valor] of css.matchAll(/border-radius:\s*([^;]+);/g)) {
    assert.ok(/^(12px|16px|50%|var\(--ds-raio-(runa|controle)\))$/.test(valor.trim()), valor);
  }
  const reduzido = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
  const fora = css.slice(0, css.indexOf('@media (prefers-reduced-motion: reduce)'));
  assert.ok(/animation:\s*hub-sobe/.test(fora));
  assert.ok(/\.hub-portal, \.hub-inscricoes \.ins-cabeca \{ animation: none/.test(reduzido));
  assert.ok(/\.hub-rosa-linha \{ transition: none/.test(reduzido));
  assert.ok(/\.hub-fechar \{ transition: none/.test(reduzido));
  for (const el of ['fogo', 'agua', 'ar', 'terra']) assert.ok(reduzido.includes(`[data-element="${el}"][data-tocado] .hub-portal-sigilo { animation: none`), el);
});
