import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const { caminhoDoElemento, caminhoDoMago, xpDoNivel, DEGRAUS } = loadComponent('src/lib/maestria/caminho.ts');
const { LevelingCalculatorService } = loadComponent('src/services/leveling-calculator.ts');

test('the XP a level starts at is the exact point where the calculator turns to that level', () => {
  for (const nivel of [2, 4, 8, 10, 25]) {
    const xp = xpDoNivel(nivel);
    assert.equal(LevelingCalculatorService.calculate(xp).level, nivel);
    assert.equal(LevelingCalculatorService.calculate(xp - 1).level, nivel - 1);
  }
  assert.equal(xpDoNivel(1), 0);
});

test('an element starts in the Faísca frame and the next step is Fluxo at level 4, with the XP that is missing', () => {
  const novo = caminhoDoElemento(0);
  assert.equal(novo.degrau, 'faisca');
  assert.equal(novo.proximo.nome, 'Fluxo');
  assert.equal(novo.proximo.nivel, 4);
  assert.equal(novo.proximo.faltamNiveis, 3);
  assert.equal(novo.proximo.faltamXp, xpDoNivel(4));
});

test('the frame steps follow the levels: Fluxo from 4, Domínio from 8, and Domínio has no next step', () => {
  assert.equal(caminhoDoElemento(xpDoNivel(4)).degrau, 'fluxo');
  assert.equal(caminhoDoElemento(xpDoNivel(8) - 1).degrau, 'fluxo');
  assert.equal(caminhoDoElemento(xpDoNivel(8) - 1).proximo.faltamXp, 1);
  const dominio = caminhoDoElemento(xpDoNivel(8));
  assert.equal(dominio.degrau, 'dominio');
  assert.equal(dominio.proximo, undefined);
  assert.deepEqual(DEGRAUS.map(d => d.nivel), [1, 4, 8]);
});

test('the mage always sees the next title and the top of the ladder', () => {
  const novo = caminhoDoMago(0);
  assert.equal(novo.titulo, 'Iniciado');
  assert.equal(novo.proximoTitulo.titulo, 'Aprendiz');
  assert.equal(novo.proximoTitulo.faltamNiveis, 9);
  assert.equal(novo.topo.titulo, 'Lenda');
  assert.equal(novo.xpParaProximoNivel, 100);
  const lenda = caminhoDoMago(xpDoNivel(200));
  assert.equal(lenda.titulo, 'Lenda');
  assert.equal(lenda.proximoTitulo, undefined);
});
