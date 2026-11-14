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

const { TINTA, AURA } = load('src/lib/design/palette.ts');
const css = readFileSync(resolve(root, 'src/styles/elemental-blocos.css'), 'utf8');
// Rules are read without comments, as the guards elsewhere read the file.
const regras = css.replace(/\/\*[\s\S]*?\*\//g, '');

test('tinta and aura tokens are the palette, exactly', () => {
  for (const [prefixo, papel] of [['tinta', TINTA], ['aura', AURA]]) {
    const noCss = Object.fromEntries(
      [...regras.matchAll(new RegExp(`--${prefixo}-([a-z]+):\\s*(#[0-9a-f]{6})`, 'g'))].map(([, nome, hex]) => [nome, hex]),
    );
    assert.deepEqual(noCss, { ...papel }, `--${prefixo}-* must match palette.ts`);
  }
});

test('radii are only 12px, 16px and 50% (or inherit, 0, or a token of those)', () => {
  const tokens = Object.fromEntries([...regras.matchAll(/(--ds-raio-[a-z]+):\s*([^;]+);/g)].map(([, n, v]) => [n, v.trim()]));
  for (const valor of Object.values(tokens)) assert.match(valor, /^(12px|16px)$/);
  const declaracoes = [...regras.matchAll(/border-radius:\s*([^;}]+)/g)].map(([, v]) => v.trim());
  assert.ok(declaracoes.length > 0);
  for (const declaracao of declaracoes) {
    for (const parte of declaracao.split(/\s+/)) {
      const ok = ['0', 'inherit', '50%', '12px', '16px'].includes(parte)
        || (/^var\(--ds-raio-[a-z]+\)$/.test(parte) && tokens[parte.slice(4, -1)] !== undefined);
      assert.ok(ok, `border-radius "${declaracao}" uses a value outside 12/16/50%`);
    }
  }
});

test('no literal font size, and no font shorthand', () => {
  for (const [, valor] of regras.matchAll(/font-size:\s*([^;}]+)/g)) {
    assert.match(valor.trim(), /^var\(--ds-(text|fluid)-[a-z-]+\)$/, `font-size "${valor}" must be a step`);
  }
  assert.equal(/(^|[\s;{])font:/.test(regras), false, 'no font: shorthand');
});

test('the blocks never blur', () => {
  assert.equal(css.includes('backdrop-filter'), false);
  assert.equal(/backdrop-blur/.test(css), false);
});

test('durations come from the tokens', () => {
  assert.equal(/\d(ms|s)\b/.test(regras.replace(/\bvar\(--ds-duration-[a-z]+\)/g, '')), false, 'no literal duration');
});

test('every keyframes has a reduced-motion block that neutralises it', () => {
  const nomes = [...regras.matchAll(/@keyframes\s+([a-z-]+)/g)].map(([, nome]) => nome);
  assert.ok(nomes.length >= 8);

  const inicio = regras.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.ok(inicio > 0, 'a reduced-motion block must exist');
  const reduzido = regras.slice(inicio);
  assert.ok(/animation:\s*none/.test(reduzido));

  // Every rule that starts an animation must have its selector listed (as a
  // whole selector or its prefix) inside the reduced block.
  const usos = [...regras.matchAll(/([^{}]+)\{[^{}]*\banimation(?:-name)?:\s*[^;}]*\bds-[a-z-]+/g)]
    .map(([, seletor]) => seletor.trim())
    .filter((seletor) => !seletor.startsWith('@keyframes'));
  assert.ok(usos.length > 0);
  for (const seletor of usos) {
    const base = seletor.replace(/::(before|after)$/, '').replace(/:not\([^)]*\)$/, '').replace(/\[data-element="[a-z]+"\]/, '');
    assert.ok(reduzido.includes(base) || reduzido.includes(base.replace(/\.ds-selo$/, '')),
      `"${seletor}" starts an animation that reduced motion does not stop`);
  }
  for (const nome of nomes) assert.ok(regras.includes(`animation`), `${nome} is used`);
});

test('every transition is switched off under reduced motion', () => {
  const inicio = regras.indexOf('@media (prefers-reduced-motion: reduce)');
  const reduzido = regras.slice(inicio);
  const comTransicao = [...regras.slice(0, inicio).matchAll(/([^{}]+)\{[^{}]*\btransition:/g)].map(([, s]) => s.trim());
  for (const seletor of comTransicao) {
    assert.ok(reduzido.includes(seletor), `"${seletor}" has a transition and no reduced-motion twin`);
  }
});

test('mask-image always carries its -webkit- twin', () => {
  const sem = (regras.match(/(?<!-webkit-)\bmask-image:/g) ?? []).length;
  const com = (regras.match(/-webkit-mask-image:/g) ?? []).length;
  assert.equal(sem, com);
});

test('the main block classes exist', () => {
  for (const nome of ['ds-runa', 'ds-selo', 'ds-abas', 'ds-linha', 'ds-medidor', 'ds-vazio', 'ds-campo', 'ds-botao', 'ds-folha', 'ds-grupo', 'ds-altar',
    'ds-marca', 'ds-meta', 'ds-cabecalho', 'ds-secao', 'ds-fracao', 'ds-elo', 'ds-cifra', 'ds-cifras', 'ds-menu', 'ds-folha-pe', 'ds-nota']) {
    assert.ok(new RegExp(`\\.${nome}(?![a-z-])`).test(regras), `.${nome} must exist`);
  }
});

test('element selectors only define variables, at zero specificity', () => {
  for (const [, corpo] of regras.matchAll(/:where\(\[data-element="[a-z]+"\]\)\s*\{([^}]*)\}/g)) {
    for (const declaracao of corpo.split(';').map((d) => d.trim()).filter(Boolean)) {
      assert.match(declaracao, /^--elem-(acento|tinta|aura):/);
    }
  }
  assert.equal(/(^|\n)\[data-element/.test(regras), false, 'a bare [data-element] rule would restyle existing screens');
});
