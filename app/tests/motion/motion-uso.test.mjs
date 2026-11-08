import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import test from 'node:test';

const root = new URL('../../', import.meta.url).pathname;
const src = resolve(root, 'src');

const walk = (dir) => readdirSync(dir).flatMap((entry) => {
  const path = join(dir, entry);
  return statSync(path).isDirectory() ? walk(path) : path.endsWith('.tsx') ? [path] : [];
});

/**
 * A scene with its own timing, and why. The stylesheet has always said that
 * ambient elemental scenes keep their own clock; these are the ones that are,
 * and naming each here is cheaper than letting any number through.
 */
const CENAS = new Map([
  ['src/components/destiny/DestinyWheel.tsx', 'a roda do destino tem a curva própria de uma roleta'],
]);

const ocorrencias = walk(src).flatMap((path) => {
  const relativo = relative(root, path);
  return [...readFileSync(path, 'utf8').matchAll(/transition=\{\{([^}]*)\}\}/g)]
    .map((match) => ({ relativo, corpo: match[1] }))
    .filter(({ corpo }) => /duration:\s*[0-9.]/.test(corpo) || /duration:\s*[a-zA-Z]+\s*\?/.test(corpo));
});

test('a duration written by hand is either a scene or a mistake', () => {
  const soltas = ocorrencias.filter(({ relativo, corpo }) => {
    if (CENAS.has(relativo)) return false;
    // An endless loop and a keyframed sequence are not one beat, so neither
    // can be expressed as one: they keep their own timing by nature. Only
    // Infinity counts -- `repeat: 2` is a finite animation and owes the
    // system a beat like any other.
    return !/repeat:\s*Infinity/.test(corpo) && !/times:\s*\[/.test(corpo);
  });

  assert.deepEqual(
    soltas.map(({ relativo, corpo }) => `${relativo}: ${corpo.trim()}`),
    [],
    'use beat() or beatUnless(): a number typed here is how the app loses its sense of time',
  );
});

test('every scene that keeps its own clock is named, and still exists', () => {
  for (const [path] of CENAS) {
    const corpo = readFileSync(resolve(root, path), 'utf8');
    assert.ok(/transition=\{\{/.test(corpo), `${path} no longer has a transition: drop it from the list`);
  }
});
