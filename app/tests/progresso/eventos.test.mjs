import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectarEventos, nivelDoElemento } from '../../src/lib/progresso/eventos.ts';
import { assinarAscensoes, emitirAscensao, ascensoesPendentes } from '../../src/lib/progresso/canal.ts';

const usuario = (extra = {}) => ({ xp_fire: 0, xp_water: 0, xp_air: 0, xp_earth: 0, ...extra });
const estado = (parcial = {}) => ({ habits: [], actions: [], user: usuario(), ...parcial });
const habito = (id, elementId, completions) => ({ id, name: `Ciclo ${id}`, elementId, completions, childHabits: [] });

test('uma conclusão nova de ciclo vira evento, com elemento e XP do recibo', () => {
  const antes = estado({ habits: [habito('h', 'fogo', [])] });
  const depois = estado({ habits: [habito('h', 'fogo', [{ id: 'c1', xpAwarded: 12 }])] });
  const eventos = detectarEventos(antes, depois);
  assert.equal(eventos.length, 1);
  assert.deepEqual({ ...eventos[0] }, { tipo: 'conclusao', id: 'ciclo:c1', nome: 'Ciclo h', elemento: 'fogo', xp: 12 });
});

test('recibos que já existiam não geram evento', () => {
  const h = habito('h', 'agua', [{ id: 'c1' }]);
  assert.equal(detectarEventos(estado({ habits: [h] }), estado({ habits: [h] })).length, 0);
});

test('uma tarefa concluída vira evento com o elemento do XP da conclusão', () => {
  const acao = { id: 'a', name: 'Estudar', elementId: 'ar', completedAt: new Date(), completionXp: { amount: 8, elementId: 'terra' } };
  const eventos = detectarEventos(estado({ actions: [{ ...acao, completedAt: null }] }), estado({ actions: [acao] }));
  assert.equal(eventos[0].elemento, 'terra');
  assert.equal(eventos[0].xp, 8);
});

test('subir de maestria 3 para 4 é a ascensão ao nível 2; 7 para 8, ao nível 3', () => {
  const ate = (nivelXp) => estado({ user: usuario({ xp_water: nivelXp }) });
  const sobe = detectarEventos(ate(322), ate(676)).filter((e) => e.tipo === 'ascensao');
  assert.equal(sobe.length, 1);
  assert.equal(sobe[0].elemento, 'agua');
  assert.equal(sobe[0].nivel, 2);
  const dominio = detectarEventos(ate(2592), ate(3530)).filter((e) => e.tipo === 'ascensao');
  assert.equal(dominio[0].nivel, 3);
});

test('descer de nível, ou ganhar XP sem cruzar o limiar, não é ascensão', () => {
  const ate = (xp) => estado({ user: usuario({ xp_fire: xp }) });
  assert.equal(detectarEventos(ate(676), ate(322)).length, 0);
  assert.equal(detectarEventos(ate(700), ate(900)).length, 0);
  assert.equal(nivelDoElemento(usuario({ xp_fire: 3530 }), 'fogo'), 3);
});

test('o canal guarda a ascensão sem ouvinte e a entrega quando a tela assina', () => {
  const a = { tipo: 'ascensao', elemento: 'fogo', nivel: 3, maestria: 8 };
  assert.equal(emitirAscensao(a), false);
  assert.equal(ascensoesPendentes(), 1);
  const recebidas = [];
  const parar = assinarAscensoes((x) => recebidas.push(x));
  assert.equal(recebidas.length, 1);
  assert.equal(ascensoesPendentes(), 0);
  assert.equal(emitirAscensao(a), true);
  assert.equal(recebidas.length, 2);
  parar();
  assert.equal(emitirAscensao(a), false);
});
