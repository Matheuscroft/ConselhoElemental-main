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

const r = load('src/lib/momentos/reel.ts');

// A rail 390 wide, cards 220 with a 16 gap, padded so the first card can centre.
const LARGURA = 220;
const PASSO = LARGURA + 16;
const VISIVEL = 390;
const RECUO = (VISIVEL - LARGURA) / 2;
const dist = (rolagem, indice) => r.distanciaDoCentro(rolagem, VISIVEL, PASSO, LARGURA, RECUO, indice);

test('a card at rest in the middle is exactly centred', () => {
  assert.ok(Math.abs(dist(0, 0)) < 0.01, 'the first card centres when the rail is at its start');
  assert.ok(Math.abs(dist(PASSO, 1)) < 0.01, 'and so does the second, one step along');
  assert.ok(Math.abs(dist(PASSO * 5, 5)) < 0.01);
});

test('the distance is fractional, because a drag lands between cards', () => {
  // This is the point: mid-drag the turn follows the finger rather than
  // snapping when the scroll settles.
  const meio = dist(PASSO / 2, 0);
  assert.ok(meio < -0.4 && meio > -0.6, `half a step should read about -0.5, read ${meio}`);
});

test('the centre card faces you, and only the centre card', () => {
  const centro = r.posicaoReel(0);
  assert.equal(centro.rotacao, 0);
  assert.equal(centro.escala, 1);
  assert.equal(centro.opacidade, 1);
  assert.equal(centro.desfoque, 0);
  assert.equal(centro.profundidade, 0);
});

test('neighbours turn toward the middle, not away from it', () => {
  const esquerda = r.posicaoReel(-1);
  const direita = r.posicaoReel(1);
  // A card to the left of centre turns clockwise to face it; one to the
  // right turns the other way. Same sign on both would be a row sliding
  // past, not a coverflow.
  assert.ok(esquerda.rotacao > 0, 'the left neighbour turns toward the middle');
  assert.ok(direita.rotacao < 0, 'the right neighbour turns the other way');
  assert.equal(esquerda.rotacao, -direita.rotacao, 'and the two are mirrored');
});

test('a card softens and falls back the further out it is', () => {
  const perto = r.posicaoReel(0.5);
  const longe = r.posicaoReel(2);
  assert.ok(Math.abs(longe.rotacao) > Math.abs(perto.rotacao));
  assert.ok(longe.escala < perto.escala);
  assert.ok(longe.opacidade < perto.opacidade);
  assert.ok(longe.desfoque > perto.desfoque);
  assert.ok(longe.profundidade < perto.profundidade, 'further out is further back');
});

test('past the reach nothing more happens, however far the rail runs', () => {
  const limite = r.posicaoReel(r.ALCANCE);
  for (const fora of [r.ALCANCE + 1, 40, 1000]) {
    const p = r.posicaoReel(fora);
    assert.equal(p.rotacao, limite.rotacao);
    assert.equal(p.escala, limite.escala);
    assert.equal(p.opacidade, limite.opacidade);
  }
  assert.ok(limite.opacidade >= r.OPACIDADE_MINIMA, 'a card never disappears entirely');
  assert.equal(limite.escala, r.ESCALA_MINIMA);
});

test('the active card is the nearest one, even mid-drag', () => {
  assert.equal(r.indiceAtivo(0, VISIVEL, PASSO, LARGURA, RECUO, 6), 0);
  assert.equal(r.indiceAtivo(PASSO * 3, VISIVEL, PASSO, LARGURA, RECUO, 6), 3);
  // Just past halfway, the next card takes over.
  assert.equal(r.indiceAtivo(PASSO * 2.6, VISIVEL, PASSO, LARGURA, RECUO, 6), 3);
  assert.equal(r.indiceAtivo(PASSO * 2.4, VISIVEL, PASSO, LARGURA, RECUO, 6), 2);
  assert.equal(r.indiceAtivo(0, VISIVEL, PASSO, LARGURA, RECUO, 0), 0, 'an empty rail does not crash');
});
