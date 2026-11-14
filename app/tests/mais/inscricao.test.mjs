import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { loadComponent } from '../elemental/load-component.mjs';

const root = new URL('../../', import.meta.url).pathname;
const { LinhaDeRota } = loadComponent('src/components/mais/LinhaDeRota.tsx');
const { InscricaoElemental } = loadComponent('src/components/mais/InscricaoElemental.tsx');

const rota = (id, label, path, description = 'Uma descrição') => ({ id, label, path, description });
const LUA = rota('lua', 'Lua', '/lua', 'Fases da lua');
const ESTACOES = rota('estacoes', 'Estações', '/estacoes', 'Estações do ano');
const TEMPORAL = rota('temporal', 'Temporal · Semana', '/temporal/semana', 'Visão semanal');
const html = (el) => renderToStaticMarkup(React.createElement(MemoryRouter, null, el));
const linha = (props) => html(React.createElement(LinhaDeRota, { rota: LUA, elemento: 'agua', ...props }));
const inscricao = (props) => html(React.createElement(InscricaoElemental, {
  elemento: 'agua', verbo: 'Fluir', linha: 'O tempo, as marés e os ciclos', contagem: 2, rotas: [], ...props,
}));

test('cada rota é um link, nunca um botão', () => {
  const saida = inscricao({ rotas: [{ rota: LUA, estado: 'normal' }, { rota: ESTACOES, estado: 'normal' }] });
  assert.equal((saida.match(/<a /g) ?? []).length, 2);
  assert.match(saida, /href="\/lua"/);
  assert.match(saida, /href="\/estacoes"/);
  assert.equal(/<button/.test(saida), false);
  assert.match(saida, /<section[^>]*data-element="agua"[^>]*id="mais-inscricao-agua"|<section[^>]*id="mais-inscricao-agua"[^>]*data-element="agua"/);
});

test('aria-current só na atual, com "Você está aqui"', () => {
  const saida = inscricao({ abertoAtual: 'lua', rotas: [{ rota: LUA, estado: 'normal' }, { rota: ESTACOES, estado: 'normal' }] });
  assert.equal((saida.match(/aria-current="page"/g) ?? []).length, 1);
  assert.equal((saida.match(/Você está aqui/g) ?? []).length, 1);
  assert.equal((linha({}).match(/aria-current/g) ?? []).length, 0);
  assert.match(linha({ atual: true }), /aria-current="page"/);
});

test('adormecida e latente ficam inertes e escondidas', () => {
  for (const estado of ['adormecida', 'latente']) {
    const saida = linha({ estado });
    assert.match(saida, /inert=""/);
    assert.match(saida, /aria-hidden="true"/);
    assert.match(saida, new RegExp(`data-${estado}`));
  }
  const normal = linha({});
  assert.equal(/inert|aria-hidden="true"/.test(normal.replace(/<svg[\s\S]*?<\/svg>/g, '')), false);
  assert.match(linha({ estado: 'acesa' }), /data-acesa/);
});

test('a primeira resposta mostra o Enter', () => {
  assert.match(linha({ primeira: true }), /data-primeira[^>]*>[\s\S]*<kbd[^>]*>Enter<\/kbd>/);
  assert.equal(/<kbd/.test(linha({})), false);
});

test('inscrição sem rota visível mostra "Nenhuma aqui"', () => {
  assert.match(inscricao({ contagem: 0, rotas: [] }), /Nenhuma aqui/);
  assert.match(inscricao({ contagem: 0, rotas: [{ rota: LUA, estado: 'adormecida' }] }), /Nenhuma aqui/);
  assert.match(inscricao({ contagem: 0, rotas: [{ rota: LUA, estado: 'adormecida' }] }), /data-vazia/);
  assert.equal(/Nenhuma aqui/.test(inscricao({ rotas: [{ rota: LUA, estado: 'normal' }] })), false);
});

test('o Temporal traz Mês, Ano e Calendário como links', () => {
  const saida = inscricao({ rotas: [{ rota: TEMPORAL, estado: 'normal' }] });
  for (const [texto, href] of [['Mês', '/temporal/mes'], ['Ano', '/temporal/ano'], ['Calendário', '/temporal/calendario']]) {
    assert.match(saida, new RegExp(`<a [^>]*href="${href}"[^>]*>${texto}</a>`));
  }
  assert.match(saida, /href="\/temporal\/semana"/);
  assert.equal(/<button/.test(saida), false);
  const mes = inscricao({ rotas: [{ rota: TEMPORAL, estado: 'adormecida', subportais: { 'temporal-mes': 'acesa' } }] });
  assert.equal(/Nenhuma aqui/.test(mes), false);
});

test('nenhum "·" no texto e nenhum lucide', () => {
  const saida = inscricao({ rotas: [{ rota: TEMPORAL, estado: 'normal' }, { rota: rota('treinos-painel', 'Treinos · Painel', '/treinos/painel'), estado: 'latente' }] });
  assert.equal(saida.includes('·'), false);
  assert.equal(/lucide/.test(saida), false);
  assert.match(saida, /Treinos, Painel/);
});

test('o CSS segue o sistema de design', () => {
  const css = readFileSync(resolve(root, 'src/components/mais/inscricao.css'), 'utf8');
  const regras = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.equal(/backdrop-filter|backdrop-blur/.test(css), false);
  assert.equal(/\d(ms|s)\b/.test(regras.replace(/var\(--ds-duration-[a-z]+\)/g, '')), false, 'sem duração literal');
  for (const [, v] of regras.matchAll(/font-size:\s*([^;}]+)/g)) assert.match(v.trim(), /^var\(--ds-(text|fluid)-[a-z-]+\)$/);
  for (const [, v] of regras.matchAll(/border-radius:\s*([^;}]+)/g)) {
    for (const parte of v.trim().split(/\s+/)) assert.ok(['0', '50%', '12px', '16px', 'var(--ds-raio-controle)', 'var(--ds-raio-runa)'].includes(parte), `raio ${parte}`);
  }
  assert.equal((regras.match(/(?<!-webkit-)\bmask-image:/g) ?? []).length, (regras.match(/-webkit-mask-image:/g) ?? []).length);
  // Toda animação e transição tem o gêmeo no bloco de movimento reduzido.
  const inicio = regras.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.ok(inicio > 0);
  const reduzido = regras.slice(inicio);
  const fora = regras.slice(0, inicio);
  const usos = [...fora.matchAll(/([^{}]+)\{[^{}]*\b(?:animation|transition):/g)].map(([, s]) => s.trim()).filter((s) => !s.startsWith('@'));
  assert.ok(usos.length >= 10);
  for (const seletor of usos) assert.ok(reduzido.includes(seletor), `"${seletor}" sem gêmeo em movimento reduzido`);
  for (const [, nome] of regras.matchAll(/@keyframes\s+([a-z-]+)/g)) assert.ok(fora.includes(`animation: ${nome} `), `${nome} sem uso`);
});

test('o componente não escreve duração nem tamanho de fonte', () => {
  for (const arquivo of ['LinhaDeRota.tsx', 'InscricaoElemental.tsx']) {
    const fonte = readFileSync(resolve(root, 'src/components/mais', arquivo), 'utf8');
    assert.equal(/font-?size|backdrop|lucide/i.test(fonte), false, arquivo);
  }
});
