import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from '../elemental/load-component.mjs';

const { CerimoniaDeNivel } = loadComponent('src/components/cerimonia/CerimoniaDeNivel.tsx');
const nivel = loadComponent('src/lib/cerimonia/nivel.ts');

const html = () => renderToStaticMarkup(React.createElement(CerimoniaDeNivel, {
  de: 4, para: 5, titulo: 'Iniciado', fracao: 0.4, faltam: 80, onFechar() {},
}));

test('a cerimônia de nível é um diálogo modal com nível, título, barra e Continuar', () => {
  const out = html();
  assert.match(out, /role="dialog"/);
  assert.match(out, /aria-modal="true"/);
  assert.match(out, /Nível 5/);
  assert.match(out, />Iniciado</);
  assert.match(out, />Continuar</);
  assert.match(out, /aria-label="40% do caminho até o nível 6"/);
  assert.match(out, /Faltam 80 XP para o nível 6/);
});

test('com movimento reduzido (SSR) não há raios nem luzes', () => {
  const out = html();
  assert.doesNotMatch(out, /cerimonia-nivel__raios/);
  assert.doesNotMatch(out, /cerimonia-nivel__luzes/);
});

test('a fila toca uma cerimônia por vez, na ordem de chegada', () => {
  const a = { id: 'a', de: 1, para: 2, titulo: 'Iniciado' };
  const b = { id: 'b', de: 2, para: 3, titulo: 'Iniciado' };
  let fila = nivel.adicionarPedido([], a);
  fila = nivel.adicionarPedido(fila, b);
  assert.equal(nivel.pedidoAtual(fila).id, 'a');
  fila = nivel.concluirPedido(fila);
  assert.equal(nivel.pedidoAtual(fila).id, 'b');
  assert.equal(nivel.pedidoAtual(nivel.concluirPedido(fila)), null);
});

test('uma ascensão na mesma rajada adia a cerimônia do mago', () => {
  assert.equal(nivel.atrasoDaCerimonia(false), 0);
  assert.equal(nivel.atrasoDaCerimonia(true), 4500);
});

test('o progresso lê a mesma conta do HUD e xpParaNivel é o menor XP do nível', () => {
  const xp = nivel.xpParaNivel(5);
  assert.equal(nivel.progressoDoNivel(xp).nivel, 5);
  assert.equal(nivel.progressoDoNivel(xp - 1).nivel, 4);
  const p = nivel.progressoDoNivel(xp + 10);
  assert.ok(p.faltam > 0 && p.fracao > 0 && p.fracao < 1);
  assert.equal(p.proximo, 6);
});
