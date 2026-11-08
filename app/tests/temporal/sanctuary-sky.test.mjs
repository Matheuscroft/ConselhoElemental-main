import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const require = createRequire(new URL('../../package.json', import.meta.url));
const root = new URL('../../', import.meta.url).pathname;

// The real getSeason and getHemisphereFromLatitude, lifted out of the constants
// barrel so the test never pulls in leveling, storage or account code.
const constants = readFileSync(resolve(root, 'src/constants/index.ts'), 'utf8');
const ast = ts.createSourceFile('constants.ts', constants, ts.ScriptTarget.Latest, true);
const helpers = ast.statements
  .filter((node) => ts.isFunctionDeclaration(node) && ['getSeason', 'getHemisphereFromLatitude'].includes(node.name?.text))
  .map((node) => node.getText(ast))
  .join('\n');
const legacyModule = { exports: {} };
new Function('exports', ts.transpileModule(helpers, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText)(legacyModule.exports);

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

const dir = 'src/lib/temporal/';
const { sanctuarySky, sanctuaryAnchor, HORIZON_Y, HORIZONTAL_FIELD } = load(dir + 'sanctuary-sky.ts');
const {
  SANCTUARY_CITIES,
  DEFAULT_SANCTUARY_CITY_ID,
  getSanctuaryCity,
  getSanctuaryCityPreference,
  setSanctuaryCityPreference,
} = load(dir + 'sanctuary-city.ts');

const RECIFE = getSanctuaryCity('recife');
const OLINDA = getSanctuaryCity('olinda');

test('only the two chosen cities exist, with southern coordinates and no daylight saving', () => {
  assert.deepEqual(SANCTUARY_CITIES.map((city) => city.id), ['recife', 'olinda']);
  assert.equal(DEFAULT_SANCTUARY_CITY_ID, 'recife');
  for (const city of SANCTUARY_CITIES) {
    assert.ok(city.latitude < 0, `${city.id} must be in the southern hemisphere`);
    assert.ok(city.longitude > -36 && city.longitude < -34, `${city.id} longitude out of Pernambuco`);
    assert.equal(city.timeZone, 'America/Recife');
  }
});

test('an unknown stored city falls back to the default instead of throwing', () => {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
    },
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {},
  };
  try {
    assert.equal(getSanctuaryCityPreference(), 'recife');
    setSanctuaryCityPreference('olinda');
    assert.equal(getSanctuaryCityPreference(), 'olinda');
    store.set('ce:sanctuary:city', 'lisboa');
    assert.equal(getSanctuaryCityPreference(), 'recife');
  } finally {
    delete globalThis.window;
  }
});

test('the Sun is high at local noon and far below the horizon at local midnight', () => {
  const noon = sanctuarySky(new Date('2026-11-08T15:00:00Z'), RECIFE);
  const midnight = sanctuarySky(new Date('2026-11-08T03:00:00Z'), RECIFE);

  assert.ok(noon.sun.altitude > 70, `noon altitude was ${noon.sun.altitude}`);
  assert.equal(noon.sun.aboveHorizon, true);
  assert.equal(noon.daylight, 'day');

  assert.ok(midnight.sun.altitude < -50, `midnight altitude was ${midnight.sun.altitude}`);
  assert.equal(midnight.sun.aboveHorizon, false);
  assert.equal(midnight.daylight, 'night');
});

test('in southern spring the setting Sun is south of west, which is why it sits on the right of the scene', () => {
  const sky = sanctuarySky(new Date('2026-11-08T20:15:00Z'), RECIFE);
  assert.ok(sky.sun.azimuth > 245 && sky.sun.azimuth < 260, `azimuth was ${sky.sun.azimuth}`);
  assert.ok(Math.abs(sky.sun.altitude) < 1.5, `altitude was ${sky.sun.altitude}`);
  assert.equal(sky.daylight, 'golden');

  const anchor = sanctuaryAnchor(sky.sun);
  // The concept art placed the Sun at x = 0.835; the computed anchor must agree.
  assert.ok(Math.abs(anchor.x - 0.835) < 0.02, `anchor x was ${anchor.x}`);
  assert.ok(Math.abs(anchor.y - HORIZON_Y) < 0.02, `anchor y was ${anchor.y}`);
});

test('the season follows the hemisphere of the chosen city, not the calendar of the north', () => {
  assert.equal(sanctuarySky(new Date('2026-07-15T15:00:00Z'), RECIFE).season.name, 'Inverno');
  assert.equal(sanctuarySky(new Date('2026-01-15T15:00:00Z'), RECIFE).season.name, 'Verão');
  assert.equal(sanctuarySky(new Date('2026-07-15T15:00:00Z'), RECIFE).hemisphere, 'south');
});

test('the Moon phase matches the USNO full moon of April 2024', () => {
  const sky = sanctuarySky(new Date('2024-04-23T23:49:00Z'), RECIFE);
  assert.equal(sky.moon.phaseName, 'Lua Cheia');
  assert.ok(sky.moon.illuminated > 0.99, `illuminated fraction was ${sky.moon.illuminated}`);
});

test('a body below the horizon is never marked visible, however the anchor falls', () => {
  const sky = sanctuarySky(new Date('2026-11-08T03:00:00Z'), RECIFE);
  assert.equal(sanctuaryAnchor(sky.sun).visible, false);
  assert.ok(sanctuaryAnchor(sky.sun).y > HORIZON_Y, 'a body below the horizon must map below the horizon line');
});

test('anchors are geometric: due south is the centre, the horizon is the horizon line', () => {
  const south = sanctuaryAnchor({ altitude: 0, azimuth: 180, aboveHorizon: true });
  assert.equal(south.x, 0.5);
  assert.equal(south.y, HORIZON_Y);
  assert.equal(south.visible, true);

  const zenith = sanctuaryAnchor({ altitude: 90, azimuth: 180, aboveHorizon: true });
  assert.ok(Math.abs(zenith.y) < 1e-9, `zenith y was ${zenith.y}`);

  // Behind the camera: still above the horizon, but outside the arc it can draw.
  const behind = sanctuaryAnchor({ altitude: 30, azimuth: 0, aboveHorizon: true });
  assert.equal(behind.visible, false);

  const edge = sanctuaryAnchor({ altitude: 10, azimuth: 180 + HORIZONTAL_FIELD / 2, aboveHorizon: true });
  assert.equal(edge.visible, true);
  assert.ok(Math.abs(edge.x - 1) < 1e-9, `edge x was ${edge.x}`);
});

test('Olinda and Recife are close enough to share the artwork but are not the same observer', () => {
  const at = new Date('2026-11-08T20:15:00Z');
  const recife = sanctuarySky(at, RECIFE);
  const olinda = sanctuarySky(at, OLINDA);

  assert.notEqual(recife.city.id, olinda.city.id);
  assert.ok(Math.abs(recife.sun.altitude - olinda.sun.altitude) < 0.1);
  assert.ok(Math.abs(sanctuaryAnchor(recife.sun).x - sanctuaryAnchor(olinda.sun).x) < 0.001);
});
