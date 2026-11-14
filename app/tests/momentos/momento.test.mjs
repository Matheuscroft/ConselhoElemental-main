import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const load = (file) => {
  const output = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(() => ({}), module, module.exports);
  return module.exports;
};

const m = load('src/lib/momentos/momento.ts');

test('a day is keyed by the local calendar, not by UTC', () => {
  // Late evening in Brazil is already the next day in UTC. Filing a moment
  // under the UTC day would put the photograph someone took tonight on
  // tomorrow's card.
  assert.equal(m.chaveDoDia(new Date(2026, 10, 8, 23, 30)), '2026-11-08');
  assert.equal(m.chaveDoDia(new Date(2026, 0, 1, 0, 5)), '2026-01-01');
  assert.equal(m.chaveDoDia(new Date(2026, 11, 31, 22, 0)), '2026-12-31');
});

test('a key has to be a day that exists', () => {
  for (const boa of ['2026-11-08', '2024-02-29', '2026-01-01']) {
    assert.equal(m.chaveValida(boa), true, boa);
  }
  for (const ruim of ['2026-02-30', '2026-13-01', '2026-11-8', '08-11-2026', '', 'hoje', '2025-02-29']) {
    assert.equal(m.chaveValida(ruim), false, ruim);
  }
});

test('a photograph is fitted, never enlarged', () => {
  // Landscape, portrait and square all keep their shape.
  assert.deepEqual(m.caberEm({ largura: 4000, altura: 3000 }, 1600), { largura: 1600, altura: 1200 });
  assert.deepEqual(m.caberEm({ largura: 3000, altura: 4000 }, 1600), { largura: 1200, altura: 1600 });
  assert.deepEqual(m.caberEm({ largura: 2000, altura: 2000 }, 480), { largura: 480, altura: 480 });

  // Already small: left alone. Blowing it up costs bytes and adds nothing.
  assert.deepEqual(m.caberEm({ largura: 300, altura: 200 }, 1600), { largura: 300, altura: 200 });

  // A canvas cannot draw half a pixel, and never zero of one.
  const magro = m.caberEm({ largura: 4000, altura: 3 }, 480);
  assert.equal(magro.largura, 480);
  assert.ok(Number.isInteger(magro.altura) && magro.altura >= 1, 'a sliver still has a row');

  assert.deepEqual(m.caberEm({ largura: 0, altura: 0 }, 480), { largura: 0, altura: 0 });
});

test('the thumbnail is far smaller than the display copy, on purpose', () => {
  // A reel scrolls thirty of these at once; decoding thirty full-size
  // photographs to fill a carousel is how a phone locks up.
  assert.ok(m.LADO_MINIATURA * 3 < m.LADO_EXIBICAO, 'the gap has to be real');
  const grande = m.caberEm({ largura: 4032, altura: 3024 }, m.LADO_EXIBICAO);
  const pequena = m.caberEm({ largura: 4032, altura: 3024 }, m.LADO_MINIATURA);
  assert.ok(grande.largura * grande.altura > pequena.largura * pequena.altura * 9,
    'the thumbnail must cost an order of magnitude less to decode');
});

test('a file is refused for a reason someone can act on', () => {
  const foto = { type: 'image/jpeg', size: 3_200_000 };
  assert.equal(m.recusarMomento(foto, '2026-11-08'), null);

  assert.equal(m.recusarMomento({ type: 'video/mp4', size: 1000 }, '2026-11-08'), 'tipo');
  assert.equal(m.recusarMomento({ type: 'image/jpeg', size: 40_000_000 }, '2026-11-08'), 'tamanho');
  assert.equal(m.recusarMomento({ type: 'image/jpeg', size: 0 }, '2026-11-08'), 'tamanho');
  assert.equal(m.recusarMomento(foto, '2026-02-30'), 'dia');

  // The phone's own formats are photographs too.
  for (const tipo of ['image/heic', 'image/heif', 'image/webp', 'image/png']) {
    assert.equal(m.recusarMomento({ type: tipo, size: 1000 }, '2026-11-08'), null, tipo);
  }

  for (const motivo of ['tipo', 'tamanho', 'dia']) {
    assert.match(m.MENSAGEM_RECUSA[motivo], /\S/, `${motivo} needs words`);
  }
});

test('a photograph is kept for the past and today, never for a future day', () => {
  const hoje = new Date(2026, 10, 10, 23, 59);
  assert.equal(m.podeGuardarFoto('2026-11-09', hoje), true);
  assert.equal(m.podeGuardarFoto('2026-11-10', hoje), true);
  assert.equal(m.podeGuardarFoto('2026-11-11', hoje), false);
  assert.equal(m.podeGuardarFoto('2026-12-01', hoje), false);
  assert.equal(m.podeGuardarFoto('2027-01-01', hoje), false);
  assert.equal(m.podeGuardarFoto('2025-12-31', hoje), true);
  assert.equal(m.podeGuardarFoto('lixo', hoje), false);
});

test('the month turn compares by calendar, not by digits', () => {
  const fim = new Date(2026, 0, 31);
  assert.equal(m.podeGuardarFoto('2026-01-31', fim), true);
  assert.equal(m.podeGuardarFoto('2026-02-01', fim), false);
  assert.equal(m.podeGuardarFoto('2025-12-31', new Date(2026, 0, 1)), true);
});
