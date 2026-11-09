import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import test from 'node:test';

const root = new URL('../../', import.meta.url).pathname;
const src = resolve(root, 'src');

const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path) : /\.(css|tsx)$/.test(path) ? [path] : [];
});

const todos = walk(src).map((path) => [relative(root, path), readFileSync(path, 'utf8')]);
const folhas = todos.filter(([arquivo]) => arquivo.endsWith('.css'));
// Tailwind's `backdrop-blur-*` classes live in .tsx and are the same cost as a
// declared backdrop-filter, but a guard that only read .css could not see them.
const classesBlur = /\bbackdrop-blur(?:-[a-z0-9]+)?\b/g;
const semPrefixo = /(?<!-)(?<!webkit-)\bbackdrop-filter:/g;
const comPrefixo = /-webkit-backdrop-filter:/g;

test('every blur carries its prefixed twin, or it does nothing on an iPhone', () => {
  // Safari 17 and earlier only blur behind -webkit-backdrop-filter. The app
  // had seven blurs and two prefixes: five panes were flat on an iPhone and
  // nobody could see it from a desktop browser.
  const desemparelhados = folhas
    .map(([arquivo, css]) => [arquivo, (css.match(semPrefixo) ?? []).length, (css.match(comPrefixo) ?? []).length])
    .filter(([, sem, pre]) => sem !== pre)
    .map(([arquivo, sem, pre]) => `${arquivo}: ${sem} sem prefixo, ${pre} com`);

  assert.deepEqual(desemparelhados, [], 'declare -webkit-backdrop-filter beside every backdrop-filter');
});

/**
 * The glass budget. backdrop-filter is among the most expensive things a
 * browser does, and the app is meant to run on a phone. Glass belongs to
 * what actually floats over content; everything else uses `.ds-pane`, which
 * is the same material without the cost and reads almost the same on a dark
 * theme.
 *
 * The number may fall, never rise. Lower it whenever one goes.
 *
 * It went to 12 for the showcase card's foot of blur, deliberately: a real
 * progressive blur costs a backdrop-filter per step, and one layer with a
 * gradient mask reads the same for one. It only exists while a card is open,
 * so on a list of twenty journeys the runtime cost is a single blurred strip.
 */
const TETO_VIDRO = 15;
// 15 is a photograph of reality, not a goal: 11 declarations in .css plus four
// Tailwind `backdrop-blur-*` classes that escaped the old guard. The four are
// MobileBottomNav, Auth and the two VideoExercisePlayer. They should fall.

test('the app does not spread glass', () => {
  const total = todos.reduce((soma, [arquivo, texto]) => soma
    + (arquivo.endsWith('.css') ? (texto.match(semPrefixo) ?? []).length : (texto.match(classesBlur) ?? []).length), 0);
  assert.ok(
    total <= TETO_VIDRO,
    `blurred surfaces rose from ${TETO_VIDRO} to ${total}. Use .ds-pane unless the thing truly floats over content.`,
  );
});

test('the surface recipes exist and carry their own prefix', () => {
  const fundacao = folhas.find(([arquivo]) => arquivo.endsWith('elemental-fundacao.css'))[1];
  for (const receita of ['.ds-glass', '.ds-glass-float', '.ds-pane']) {
    assert.ok(fundacao.includes(receita), `${receita} must be part of the foundation`);
  }
  // The cheap recipe must stay cheap: the whole point of .ds-pane is that it
  // is the look without the blur.
  const pane = fundacao.slice(fundacao.indexOf('.ds-pane'));
  assert.equal(/backdrop-filter/.test(pane.slice(0, pane.indexOf('}'))), false,
    '.ds-pane must never blur, or it stops being the cheap one');
});
