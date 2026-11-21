import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const carregar = (arquivo, extra = {}) => {
  const saida = ts.transpileModule(readFileSync(resolve(root, arquivo), 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const modulo = { exports: {} };
  new Function('require', 'module', 'exports', saida)((id) => extra[id] ?? (() => { throw new Error(`unexpected import ${id}`); })(), modulo, modulo.exports);
  return modulo.exports;
};
const areasFile = carregar('src/constants/areas-with-subareas.ts');
const foco = carregar('src/lib/sanctuary/foco-inicial.ts', { '@/constants/areas-with-subareas': areasFile });

test('the opening offers the thirty top-level areas, grouped by the four elements', () => {
  const por = Object.fromEntries(foco.ORDEM_DO_FOCO.map((e) => [e, foco.areasDoElemento(e).length]));
  assert.deepEqual(por, { terra: 9, fogo: 8, agua: 6, ar: 7 });
  assert.deepEqual([...foco.ORDEM_DO_FOCO], ['terra', 'fogo', 'agua', 'ar']);
});

test('what was stored on the device is filtered to ids the app knows', () => {
  assert.deepEqual(foco.sanearAreas(['area-saude', 'inventada', 'area-saude', 'area-estudos']), ['area-saude', 'area-estudos']);
  assert.deepEqual(foco.sanearAreas([]), []);
});

test('the count of chosen areas is kept per element', () => {
  const c = foco.contagemPorElemento(new Set(['area-saude', 'area-nutricao', 'area-carreira']));
  assert.deepEqual(c, { terra: 2, fogo: 1, agua: 0, ar: 0 });
});

test('the opening stays light: the focus step reads the areas file, never the constants barrel or the store', () => {
  const fonte = `${readFileSync(resolve(root, 'src/lib/sanctuary/foco-inicial.ts'), 'utf8')}\n${readFileSync(resolve(root, 'src/components/entry/FocoInicial.tsx'), 'utf8')}`;
  for (const proibido of ["from '@/constants'", '@/stores/', '@/lib/backup']) assert.ok(!fonte.includes(proibido), proibido);
  assert.ok(!fonte.includes('.webp'), 'no heavy sphere images before the account exists');
});
