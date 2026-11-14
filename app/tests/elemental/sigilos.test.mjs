import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadComponent } from './load-component.mjs';

const root = new URL('../../', import.meta.url).pathname;
const { SIGILOS } = loadComponent('src/components/elemental/sigilos.ts');
const { ArcaneIcon, RouteIcon, ROUTE_ICONS } = loadComponent('src/components/elemental/ArcaneIcon.tsx');
const { APP_ROUTES } = loadComponent('src/lib/app-routes.ts');

/** Teto do PATHS antigo: so pode cair. */
const TETO_PATHS_LEGADO = 35;
const source = readFileSync(join(root, 'src/components/elemental/ArcaneIcon.tsx'), 'utf8');
const bloco = source.slice(source.indexOf('const PATHS = {'), source.indexOf('} as const;'));
const legados = [...bloco.matchAll(/^\s{2}(\w+):\s*'/gm)].map((m) => m[1]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (path.endsWith('.tsx')) out.push(path);
  }
  return out;
}

/** Walks M m L l H h V v A a Z z and returns every endpoint. */
function pontos(d) {
  const out = []; let x = 0; let y = 0; let sx = 0; let sy = 0;
  for (const [, cmd, args] of d.matchAll(/([MmLlHhVvAaZz])([^MmLlHhVvAaZz]*)/g)) {
    const n = (args.match(/-?\d*\.?\d+/g) || []).map(Number);
    const rel = cmd === cmd.toLowerCase();
    const upper = cmd.toUpperCase();
    if (upper === 'Z') { x = sx; y = sy; continue; }
    const size = { M: 2, L: 2, H: 1, V: 1, A: 7 }[upper];
    assert.ok(size, `comando nao suportado ${cmd}`);
    assert.equal(n.length % size, 0, `argumentos incompletos em ${cmd}: ${d}`);
    for (let i = 0; i < n.length; i += size) {
      const a = n.slice(i, i + size);
      if (upper === 'H') x = rel ? x + a[0] : a[0];
      else if (upper === 'V') y = rel ? y + a[0] : a[0];
      else { const [dx, dy] = upper === 'A' ? [a[5], a[6]] : [a[0], a[1]]; x = rel ? x + dx : dx; y = rel ? y + dy : dy; }
      if (upper === 'M' && i === 0) { sx = x; sy = y; }
      out.push([x, y]);
    }
  }
  return out;
}

test('todo name literal passado a ArcaneIcon/RouteIcon existe em SIGILOS ou no PATHS legado', () => {
  const known = new Set([...Object.keys(SIGILOS), ...legados]);
  for (const file of walk(join(root, 'src'))) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/<ArcaneIcon\b[^>]*?\bname="([^"]+)"/g)) assert.ok(known.has(m[1]), `${file}: ${m[1]}`);
  }
});

test('todo APP_ROUTES tem icone proprio em ROUTE_ICONS e o primeiro path e unico', () => {
  const firsts = new Map();
  for (const route of APP_ROUTES) {
    const name = ROUTE_ICONS[route.id];
    assert.ok(name, route.id);
    assert.ok(SIGILOS[name], `${route.id} -> ${name}`);
    const first = renderToStaticMarkup(React.createElement(RouteIcon, { routeId: route.id })).match(/<path d="([^"]+)"/)[1];
    assert.ok(!firsts.has(first), `${route.id} repete ${firsts.get(first)}`);
    firsts.set(first, route.id);
  }
  assert.notEqual(SIGILOS.explorar.traco, SIGILOS.grimorio.traco);
});

test('cada traco e unico, usa ate 3 formas e cabe em 0..24', () => {
  const seen = new Map();
  for (const [name, { traco, nucleo }] of Object.entries(SIGILOS)) {
    assert.ok(!seen.has(traco), `${name} repete ${seen.get(traco)}`);
    seen.set(traco, name);
    assert.doesNotMatch(traco, /circle/);
    for (const d of [traco, nucleo].filter(Boolean)) {
      for (const [x, y] of pontos(d)) assert.ok(x >= 0 && x <= 24 && y >= 0 && y <= 24, `${name}: ${x},${y}`);
    }
  }
});

test('ArcaneIcon: tracos 1.5/2, nucleo so quando ativo, aria-hidden por padrao', () => {
  const html = (props) => renderToStaticMarkup(React.createElement(ArcaneIcon, props));
  assert.match(html({ name: 'santuario', size: 24 }), /stroke-width="1.5"/);
  assert.match(html({ name: 'santuario', size: 16 }), /stroke-width="2"/);
  assert.equal((html({ name: 'santuario' }).match(/<path/g) || []).length, 1);
  assert.equal((html({ name: 'santuario', ativo: true }).match(/<path/g) || []).length, 2);
  assert.match(html({ name: 'santuario' }), /aria-hidden="true"/);
  assert.match(html({ name: 'conta', label: '<x>' }), /aria-label="&lt;x&gt;"/);
});

test('PATHS legado so pode encolher', () => {
  assert.ok(legados.length > 0 && legados.length <= TETO_PATHS_LEGADO, `PATHS legado tem ${legados.length}, teto ${TETO_PATHS_LEGADO}`);
});
