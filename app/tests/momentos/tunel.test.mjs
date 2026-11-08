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

const t = load('src/lib/momentos/tunel.ts');

test('the days hang on alternating walls, each turned toward the middle', () => {
  const a = t.parede(0);
  const b = t.parede(1);
  assert.ok(a.x < 0 && b.x > 0, 'they alternate sides');
  assert.equal(a.x, -b.x, 'and stand the same distance out');
  // Turned toward the corridor, not away: facing outward would show their
  // backs to someone flying down the middle.
  assert.ok(a.giro > 0 && b.giro < 0);
  assert.equal(a.giro, -b.giro);
  assert.deepEqual(t.parede(2), a, 'and the pattern repeats');
});

test('flying forward brings the days toward the camera', () => {
  assert.equal(t.profundidade(0, 0), 0, 'the first day starts at the camera');
  assert.equal(t.profundidade(0, 1), t.ESPACAMENTO);
  // Fly one space and the second day is where the first was.
  assert.equal(t.profundidade(t.ESPACAMENTO, 1), 0);
  assert.ok(t.profundidade(t.ESPACAMENTO, 0) < 0, 'and the first is behind you');
});

test('a day already passed is let go, not drawn behind the camera', () => {
  const passado = t.lugarNoTunel(t.ESPACAMENTO * 3, 0);
  assert.equal(passado.visivel, false);
  assert.equal(passado.opacidade, 0);
});

test('the far end of the corridor is light, not a wall of pictures', () => {
  const perto = t.lugarNoTunel(0, 0);
  const meio = t.lugarNoTunel(0, 2);
  const longe = t.lugarNoTunel(0, 4);

  assert.equal(perto.opacidade, 1);
  assert.equal(perto.escala, 1);
  assert.equal(perto.desfoque, 0);

  assert.ok(meio.opacidade < perto.opacidade && meio.opacidade > longe.opacidade, 'it fades with distance');
  assert.ok(meio.escala < perto.escala && meio.escala > longe.escala, 'and shrinks');
  assert.ok(meio.desfoque > perto.desfoque && meio.desfoque < longe.desfoque, 'and softens');
  assert.ok(longe.opacidade > 0 && longe.visivel, 'the last one still shows before it goes');
});

test('nothing is drawn beyond the reach, however long the corridor', () => {
  for (const indice of [5, 20, 400]) {
    const fora = t.lugarNoTunel(0, indice);
    assert.equal(fora.visivel, false, `day ${indice} is past the reach`);
    assert.equal(fora.opacidade, 0);
  }
});

test('the day in focus is the one the camera is on', () => {
  assert.equal(t.diaNoFoco(0, 9), 0);
  assert.equal(t.diaNoFoco(t.ESPACAMENTO * 3, 9), 3);
  assert.equal(t.diaNoFoco(t.ESPACAMENTO * 3.6, 9), 4, 'past halfway the next day takes over');
  // Flying past the end, or before the start, never names a day that is not there.
  assert.equal(t.diaNoFoco(t.ESPACAMENTO * 99, 9), 8);
  assert.equal(t.diaNoFoco(-5000, 9), 0);
  assert.equal(t.diaNoFoco(0, 0), 0);
});

test('the corridor is exactly as long as the days in it', () => {
  assert.equal(t.vooTotal(1), 0, 'a single day needs no flying');
  assert.equal(t.vooTotal(9), t.ESPACAMENTO * 8);
  assert.equal(t.vooTotal(0), 0);
});
