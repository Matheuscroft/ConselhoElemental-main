import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = new URL('../../', import.meta.url).pathname;
const src = resolve(root, 'src');

const walk = (dir, ext) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path, ext) : path.endsWith(ext) ? [path] : [];
});

const load = (file) => {
  const output = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)(() => ({}), module, module.exports);
  return module.exports;
};

const { ACENTO, TINTA, AURA, ELEMENTOS } = load('src/lib/design/palette.ts');
const fundacao = readFileSync(resolve(src, 'styles/elemental-fundacao.css'), 'utf8');

test('the element colours in the stylesheet are the palette, exactly', () => {
  const noCss = Object.fromEntries(
    [...fundacao.matchAll(/--element-([a-z]+):\s*(#[0-9a-f]{6})/g)].map(([, nome, hex]) => [nome, hex]),
  );
  assert.deepEqual(noCss, { ...ACENTO }, 'CSS and TypeScript must name the same four colours');
});

test('the element colours are declared in exactly one place', () => {
  const declaram = walk(src, '.css')
    .filter((path) => /--element-(terra|fogo|agua|ar):/.test(readFileSync(path, 'utf8')))
    .map((path) => relative(root, path));

  // They used to sit on :root for the app and again on .entry-shell, because
  // the theme stylesheet never reached the opening screens. One file now
  // carries them and every path loads it.
  assert.deepEqual(declaram, ['src/styles/elemental-fundacao.css']);
});

test('each role keeps its own colours, and covers all four elements', () => {
  for (const [nome, papel] of [['acento', ACENTO], ['tinta', TINTA], ['aura', AURA]]) {
    assert.deepEqual(Object.keys(papel).sort(), [...ELEMENTOS].sort(), `${nome} must cover the four`);
    for (const hex of Object.values(papel)) assert.match(hex, /^#[0-9a-f]{6}$/, `${nome} holds hex`);
  }
  // An aura has to read as light rather than as a label, so it is never the
  // accent repeated. If these ever collapse, the distinction has been lost.
  for (const elemento of ELEMENTOS) {
    assert.notEqual(AURA[elemento], ACENTO[elemento], `${elemento}: the aura is not the accent`);
    assert.notEqual(TINTA[elemento], ACENTO[elemento], `${elemento}: the wash is not the accent`);
  }
});

test('the type scale climbs, and never goes below what a phone can read', () => {
  const escala = [...fundacao.matchAll(/--ds-text-([a-z]+):\s*(\d+)px/g)].map(([, nome, px]) => [nome, Number(px)]);
  const ordem = escala.map(([nome]) => nome);

  assert.deepEqual(ordem, ['micro', 'small', 'body', 'lead', 'title', 'display', 'hero']);
  for (let i = 1; i < escala.length; i += 1) {
    assert.ok(escala[i][1] > escala[i - 1][1], `${ordem[i]} must be larger than ${ordem[i - 1]}`);
  }
  assert.equal(escala[0][1], 12, 'the floor is 12px: 10px and 11px were unreadable at arm\'s length');
  assert.equal(escala.find(([nome]) => nome === 'body')[1], 16,
    'body stays 16px, which is also what keeps iOS from zooming a focused field');
});

/**
 * A ratchet, not a rule. The app carries 69 different font sizes, in px, rem
 * and clamp(), including .78rem, .82rem, .83rem and .88rem. Re-typesetting
 * all of them blind -- with no way to see the result on a real screen --
 * would be reckless. This stops the bleeding instead: the number may fall,
 * never rise. Lower the ceiling whenever you remove one.
 */
const TETO_TAMANHOS = 69;

test('the number of distinct font sizes never grows', () => {
  const valores = new Set(
    walk(src, '.css')
      .flatMap((path) => [...readFileSync(path, 'utf8').matchAll(/font-size:\s*([^;}]+)/g)])
      .map(([, valor]) => valor.trim()),
  );

  assert.ok(
    valores.size <= TETO_TAMANHOS,
    `distinct font sizes rose from ${TETO_TAMANHOS} to ${valores.size}. `
      + 'Use a --ds-text-* step instead of inventing a value; if the step you need '
      + 'does not exist, add it to the scale rather than beside it.',
  );
});
