import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = new URL('../../', import.meta.url).pathname;

// Only ZODIAC_SIGNS is lifted out of the constants barrel, so the test never
// pulls in leveling, storage or account code to read a list of twelve names.
const constants = readFileSync(resolve(root, 'src/constants/index.ts'), 'utf8');
const ast = ts.createSourceFile('constants.ts', constants, ts.ScriptTarget.Latest, true);
const lifted = ast.statements
  .filter((node) => ts.isVariableStatement(node)
    && node.declarationList.declarations.some((d) => d.name.getText(ast) === 'ZODIAC_SIGNS'))
  .map((node) => node.getText(ast))
  .join('\n');
const legacyModule = { exports: {} };
new Function('exports', ts.transpileModule(lifted, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText)(legacyModule.exports);

const cache = new Map();
function load(file) {
  const path = resolve(root, file);
  if (cache.has(path)) return cache.get(path);
  const source = readFileSync(path, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', output)((id) => {
    if (id === '@/constants') return legacyModule.exports;
    if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts');
    if (!id.startsWith('.')) return require(id);
    const target = resolve(dirname(path), id);
    const local = ['.ts', '.tsx'].map((ext) => target + ext).find(existsSync);
    return load(local);
  }, module, module.exports);
  cache.set(path, module.exports);
  return module.exports;
}

const z = load('src/lib/sanctuary/zodiac.ts');

test('the elements and modalities come out of the zodiac order, not a typed table', () => {
  const elements = Array.from({ length: 12 }, (_, i) => z.zodiacProfile(i).element);
  const modalities = Array.from({ length: 12 }, (_, i) => z.zodiacProfile(i).modality);

  // Counting from Áries: fire, earth, air, water, repeating; cardinal, fixed,
  // mutable, repeating. This is the structure, so it is what the test fixes.
  assert.deepEqual(elements, [
    'fogo', 'terra', 'ar', 'agua',
    'fogo', 'terra', 'ar', 'agua',
    'fogo', 'terra', 'ar', 'agua',
  ]);
  assert.deepEqual(modalities, [
    'cardeal', 'fixo', 'mutavel', 'cardeal',
    'fixo', 'mutavel', 'cardeal', 'fixo',
    'mutavel', 'cardeal', 'fixo', 'mutavel',
  ]);
});

test('Libra is air and cardinal, and sits in the middle of its trio', () => {
  const libra = z.zodiacProfile(6);
  assert.equal(libra.name, 'Libra');
  assert.equal(libra.element, 'ar');
  assert.equal(libra.modality, 'cardeal');
  assert.equal(z.triadPosition(6), 1, 'the middle sign keeps the base colour');
});

test('an element reads as itself while its three signs stay apart', () => {
  for (const [a, b, c] of [[0, 4, 8], [1, 5, 9], [2, 6, 10], [3, 7, 11]]) {
    const colours = [a, b, c].map((i) => z.auraColour(i));
    assert.equal(new Set(colours).size, 3, 'the trio must not collapse into one colour');
    for (const colour of colours) assert.match(colour, /^#[0-9a-f]{6}$/);
  }
});

test('the sign comes from where the Sun was, not from a table of date ranges', () => {
  // Mid-sign dates, safely away from every boundary.
  assert.equal(z.zodiacProfileAt(new Date('2026-10-08T12:00:00Z')).name, 'Libra');
  assert.equal(z.zodiacProfileAt(new Date('2026-01-10T12:00:00Z')).name, 'Capricórnio');
  assert.equal(z.zodiacProfileAt(new Date('2026-07-04T12:00:00Z')).name, 'Câncer');
  assert.equal(z.zodiacProfileAt(new Date('2026-04-05T12:00:00Z')).name, 'Áries');
});

test('the equinox puts the Sun at the very start of Libra', () => {
  // The September equinox is the Sun crossing 180 degrees, which is Libra's
  // first instant. A day either side must land on either side of it.
  assert.equal(z.zodiacProfileAt(new Date('2026-09-20T12:00:00Z')).name, 'Virgem');
  assert.equal(z.zodiacProfileAt(new Date('2026-09-25T12:00:00Z')).name, 'Libra');
});

test('the aura grows fastest at the levels that decide whether someone returns', () => {
  assert.equal(z.auraScale(1), z.AURA_MIN_SCALE);
  assert.equal(z.auraScale(z.AURA_FULL_LEVEL), z.AURA_MAX_SCALE);
  assert.equal(z.auraScale(999), z.AURA_MAX_SCALE, 'past the top it stops growing');
  assert.equal(z.auraScale(0), z.AURA_MIN_SCALE, 'a nonsense level never shrinks it');

  for (let level = 1; level < 50; level += 1) {
    assert.ok(z.auraScale(level + 1) > z.auraScale(level), `level ${level} must grow`);
  }
  const early = z.auraScale(5) - z.auraScale(1);
  const late = z.auraScale(50) - z.auraScale(46);
  assert.ok(early > late * 3, 'the early levels must be the visible ones');
});

test('a birth date is read at local noon, and nonsense is refused', () => {
  const date = z.parseBirthDate('1990-10-08');
  assert.ok(date);
  assert.equal(date.getFullYear(), 1990);
  assert.equal(date.getMonth(), 9);
  assert.equal(date.getDate(), 8, 'noon keeps the timezone from moving the day');

  for (const bad of [null, '', 'ontem', '08/10/1990', '1990-13-01', '2026-02-30', '1990-10-8']) {
    assert.equal(z.parseBirthDate(bad), null, `${bad} is not a date`);
  }
});

test('an index outside the wheel wraps instead of throwing', () => {
  assert.equal(z.zodiacProfile(12).name, 'Áries');
  assert.equal(z.zodiacProfile(-1).name, 'Peixes');
  assert.equal(z.zodiacProfile(18).name, 'Libra');
});
