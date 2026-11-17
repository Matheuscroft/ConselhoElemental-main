import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const load = (file, deps = {}) => {
  const output = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => deps[id] ?? {}, module, module.exports);
  return module.exports;
};
const momento = load('src/lib/momentos/momento.ts');
const { serializar, ler, FORMATO_MOMENTOS, BYTES_MAXIMOS_ARQUIVO } = load('src/lib/momentos/momento-arquivo.ts', { './momento': momento });

const img = 'data:image/webp;base64,AAAA';

test('a moments file goes out and comes back whole', () => {
  const texto = serializar([{ dia: '2026-11-16', imagem: img }, { dia: '2026-11-17', imagem: img }], new Date('2026-11-17T12:00:00Z'));
  const r = ler(texto);
  assert.equal(r.ok, true);
  assert.deepEqual(r.itens.map((i) => i.dia), ['2026-11-16', '2026-11-17']);
  assert.equal(r.ignorados, 0);
});

test('damaged, foreign and oversized files never reach the store', () => {
  assert.deepEqual(ler('{nao json'), { ok: false, motivo: 'invalido' });
  assert.deepEqual(ler(JSON.stringify({ format: 'outro', version: 1, itens: [] })), { ok: false, motivo: 'invalido' });
  assert.deepEqual(ler(JSON.stringify({ format: FORMATO_MOMENTOS, version: 2, itens: [] })), { ok: false, motivo: 'invalido' });
  assert.deepEqual(ler('{}', BYTES_MAXIMOS_ARQUIVO + 1), { ok: false, motivo: 'grande' });
});

test('bad days, bad images and repeated days are skipped, the rest is kept', () => {
  const texto = JSON.stringify({ format: FORMATO_MOMENTOS, version: 1, itens: [
    { dia: '2026-02-30', imagem: img }, { dia: '2026-11-16', imagem: 'http://x/y.png' },
    { dia: '2026-11-16', imagem: img }, { dia: '2026-11-16', imagem: img }, null,
  ] });
  const r = ler(texto);
  assert.equal(r.ok, true);
  assert.equal(r.itens.length, 1);
  assert.equal(r.ignorados, 4);
});
