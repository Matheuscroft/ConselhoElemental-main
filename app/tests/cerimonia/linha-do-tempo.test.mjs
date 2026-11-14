import assert from 'node:assert/strict';
import test from 'node:test';
import { loadComponent } from '../elemental/load-component.mjs';

const nivel = loadComponent('src/lib/cerimonia/nivel.ts');

test('as três cenas somam cerca de 6,4 s e derivam dos tempos do sistema de movimento', () => {
  assert.equal(nivel.CENA.impacto, 1584);
  assert.equal(nivel.CENA.cartoes, 2160);
  assert.equal(nivel.CENA.numero, 2592);
  assert.equal(nivel.duracaoDaCerimonia(), 6336);
});

test('os quatro cartões saltam um a um, a 120 ms, e cabem na cena 2', () => {
  assert.equal(nivel.CARTAO_PASSO, 120);
  const ultimo = nivel.CARTAO_INICIO + 3 * nivel.CARTAO_PASSO;
  assert.ok(ultimo < nivel.CENA.cartoes);
  assert.deepEqual([...nivel.ELEMENTOS_DOS_CARTOES], ['fogo', 'agua', 'ar', 'terra']);
});

test('o nível de cada elemento sai do mesmo calculador, e sem usuário é 1', () => {
  assert.deepEqual({ ...nivel.niveisDosElementos(null) }, { fogo: 1, agua: 1, ar: 1, terra: 1 });
  const xp = nivel.xpParaNivel(4);
  assert.equal(nivel.niveisDosElementos({ xp_fire: xp, xp_water: 0 }).fogo, 4);
});
