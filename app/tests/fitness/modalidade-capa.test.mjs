import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const saida = ts.transpileModule(readFileSync(root + 'src/components/fitness-kit/modalidade-capa.ts', 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const modulo = { exports: {} };
new Function('module', 'exports', saida)(modulo, modulo.exports);
const { capaDaModalidade } = modulo.exports;

const MODALIDADES = ['running', 'calisthenics', 'swimming', 'martial_arts', 'yoga', 'cycling', 'strength'];

test('todo arquivo de capa mapeado existe em public/fitness/capas', () => {
  for (const id of MODALIDADES) {
    const caminho = capaDaModalidade(id);
    if (!caminho) continue;
    assert.match(caminho, /^\/fitness\/capas\/[a-z-]+\.webp$/);
    assert.ok(existsSync(root + 'public' + caminho), `${id}: ${caminho} não existe`);
  }
});

test('toda modalidade do app tem capa e id desconhecido não', () => {
  const sem = MODALIDADES.filter((id) => !capaDaModalidade(id));
  assert.deepEqual(sem, []);
  assert.equal(capaDaModalidade('desconhecida'), undefined);
});
