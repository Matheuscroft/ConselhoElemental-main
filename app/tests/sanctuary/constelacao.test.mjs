import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FASE_FRENTE, PASSO, alvoDoEncaixe, cargaDosPendentes, emRepousoDaMola, encaixeMaisProximo, envolver,
  estadosDasOrbes, faseDoArrasto, faseParaFrente, focoDaProfundidade, geometria, indiceDaFrente,
  passoDaMola, raioHorizontal, velocidadeSuavizada,
} from '../../src/components/sanctuary/constelacao-fisica.ts';
import { dataLocal, pendentesDeHoje, textoDePendentes, vertentesDoElemento } from '../../src/components/sanctuary/constelacao-dados.ts';

test('a fase de frente põe a primeira esfera na frente, e cada quarto de volta a seguinte', () => {
  for (let i = 0; i < 4; i += 1) {
    assert.equal(indiceDaFrente(faseParaFrente(i, 0)), i);
    assert.ok(Math.abs(geometria(i, faseParaFrente(i, 0), 390).profundidade - 1) < 1e-9);
  }
  assert.equal(indiceDaFrente(FASE_FRENTE), 0);
  assert.equal(indiceDaFrente(FASE_FRENTE + PASSO), 3);
});

test('as de trás são menores e mais fracas, nunca escondidas; a da frente é maior e plena', () => {
  const frente = geometria(0, FASE_FRENTE, 390);
  const tras = geometria(2, FASE_FRENTE, 390);
  assert.ok(frente.escala > 1 && tras.escala < 1 && tras.escala >= 0.8);
  assert.equal(Math.round(frente.opacidade * 100), 100);
  assert.ok(tras.opacidade >= 0.55);
  assert.ok(frente.z > tras.z);
  for (let i = 0; i < 4; i += 1) assert.ok(geometria(i, 1.234, 390).opacidade > 0.5);
});

test('o encaixe cai sempre numa fase em que alguma esfera está na frente', () => {
  for (const fase of [-3, 0, 0.7, 2.2, 5.9, 11]) {
    const alvo = encaixeMaisProximo(fase);
    assert.ok(Math.abs(alvo - fase) <= PASSO / 2 + 1e-9);
    assert.ok(Math.abs(geometria(indiceDaFrente(alvo), alvo, 390).profundidade - 1) < 1e-9);
  }
});

test('soltar com velocidade desliza até a esfera seguinte; parado, fica na mais próxima', () => {
  const parado = alvoDoEncaixe(FASE_FRENTE + 0.3, 0);
  assert.equal(parado, FASE_FRENTE);
  const lancado = alvoDoEncaixe(FASE_FRENTE + 0.3, 4);
  assert.ok(lancado > parado);
  assert.ok(Math.abs(alvoDoEncaixe(0, 1e9) - alvoDoEncaixe(0, 1e12)) < 1e-9, 'a velocidade é limitada');
});

test('arrastar para a direita traz para a frente a esfera que estava à direita', () => {
  assert.ok(faseDoArrasto(40, 390) < 0);
  assert.ok(faseDoArrasto(-40, 390) > 0);
  assert.ok(raioHorizontal(390) <= 0.4 && raioHorizontal(390) > 0.3);
});

test('a mola chega ao alvo, em repouso, sem passar longe', () => {
  let estado = { fase: 0, velocidade: 3 };
  let maximo = 0;
  for (let i = 0; i < 240; i += 1) {
    estado = passoDaMola(estado.fase, estado.velocidade, PASSO, 1 / 60);
    maximo = Math.max(maximo, estado.fase);
  }
  assert.ok(emRepousoDaMola(estado.fase, estado.velocidade, PASSO));
  assert.ok(maximo < PASSO * 1.25, 'o excesso é curto');
});

test('a velocidade do dedo é suavizada e limitada', () => {
  assert.ok(velocidadeSuavizada(0, 1000, 0.016) <= 12 * 0.4 + 1e-9);
  assert.equal(velocidadeSuavizada(2, 1, 0), 2);
});

test('envolver devolve ângulos em (-PI, PI]', () => {
  for (const a of [-10, -Math.PI, 0, Math.PI, 7]) {
    const e = envolver(a);
    assert.ok(e > -Math.PI - 1e-9 && e <= Math.PI + 1e-9);
  }
});

test('os estados entregues à cena trazem foco só na frente, carga e tocado', () => {
  const estados = estadosDasOrbes(['fogo', 'ar', 'agua', 'terra'], FASE_FRENTE, 390, [0.6, 0, 0, 1], 2);
  assert.equal(estados[0].foco, 1);
  assert.equal(estados[1].foco, 0);
  assert.equal(estados[2].foco, 1, 'a esfera tocada ganha foco');
  assert.equal(estados[0].carga, 0.6);
  assert.ok(estados.every((e) => e.x >= 0 && e.x <= 1 && e.y >= 0 && e.y <= 1));
  assert.equal(focoDaProfundidade(-1), 0);
});

test('a carga só existe com pendência e nunca passa de 1', () => {
  assert.equal(cargaDosPendentes(0), 0);
  assert.ok(cargaDosPendentes(1) > 0);
  assert.equal(cargaDosPendentes(50), 1);
});

test('pendências de hoje: sem data conta, vencida conta, futura e concluída não', () => {
  const tasks = [
    { isCompleted: false, elementId: 'fogo', dueDate: null },
    { isCompleted: false, elementId: 'fogo', dueDate: '2026-11-16' },
    { isCompleted: false, elementId: 'fogo', dueDate: '2026-11-01' },
    { isCompleted: false, elementId: 'fogo', dueDate: '2026-11-17' },
    { isCompleted: true, elementId: 'fogo' },
    { isCompleted: false, elementId: 'agua' },
  ];
  assert.deepEqual(pendentesDeHoje(tasks, '2026-11-16'), { fogo: 3, agua: 1 });
  assert.equal(textoDePendentes(1), '1 ritual hoje');
  assert.equal(textoDePendentes(2), '2 rituais hoje');
  assert.equal(dataLocal(new Date(2026, 0, 5)), '2026-01-05');
});

test('vertentes: as ativas primeiro, até três, com o resto contado', () => {
  const areas = ['a', 'b', 'c', 'd', 'e'].map((id) => ({ id, name: id.toUpperCase(), elementId: 'fogo' }))
    .concat([{ id: 'x', name: 'X', elementId: 'agua' }]);
  assert.deepEqual(vertentesDoElemento('fogo', areas, ['b', 'c', 'd', 'e', 'x']), { nomes: ['B', 'C', 'D'], restantes: 1, total: 4 });
  assert.deepEqual(vertentesDoElemento('fogo', areas, []), { nomes: ['A', 'B', 'C'], restantes: 2, total: 5 });
  assert.deepEqual(vertentesDoElemento('ar', areas, []), { nomes: [], restantes: 0, total: 0 });
});
