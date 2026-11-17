import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const rig = loadComponent('src/components/fitness-kit/figura-rig.ts');
const { PADROES } = loadComponent('src/components/fitness-kit/figura-padroes.ts');
const { posicaoNoLoop, posicaoNoCiclo, posicaoDoPadrao, PAUSA_NO_EXTREMO } = rig;

test('o vai-e-volta começa e termina parado no mesmo extremo, sem salto na emenda', () => {
  const d = 3;
  assert.equal(posicaoNoLoop(0, d), 0);
  assert.equal(posicaoNoLoop(d, d), 0);
  assert.ok(Math.abs(posicaoNoLoop(d - 1e-9, d) - posicaoNoLoop(0, d)) < 1e-6);
  assert.equal(posicaoNoLoop(d / 2, d), 1);
});

test('o vai-e-volta é contínuo: nenhum passo de 1/240 s salta mais que o previsto', () => {
  const d = 3, passo = 1 / 240;
  const maximo = (2 / d) / (1 - 2 * PAUSA_NO_EXTREMO) * passo * 1.05;
  let anterior = posicaoNoLoop(0, d);
  for (let t = passo; t < d * 3; t += passo) {
    const atual = posicaoNoLoop(t, d);
    assert.ok(Math.abs(atual - anterior) <= maximo, `salto em t=${t.toFixed(3)}`);
    anterior = atual;
  }
});

test('o vai-e-volta fica parado nos extremos e se move no meio, e é periódico', () => {
  const d = 2.4;
  assert.equal(posicaoNoLoop(d * PAUSA_NO_EXTREMO * 0.4, d), 0);
  assert.equal(posicaoNoLoop(d / 2 + d * PAUSA_NO_EXTREMO * 0.3, d), 1);
  assert.ok(posicaoNoLoop(d / 4, d) > 0.4 && posicaoNoLoop(d / 4, d) < 0.6);
  for (const t of [0.3, 1.1, 2.2]) assert.ok(Math.abs(posicaoNoLoop(t + d, d) - posicaoNoLoop(t, d)) < 1e-9);
  assert.equal(posicaoNoLoop(-0.5, d), posicaoNoLoop(d - 0.5, d));
});

test('o ciclo só avança, volta ao início sem inverter e é periódico', () => {
  const d = 1.5;
  let anterior = posicaoNoCiclo(0, d);
  let quedas = 0;
  for (let t = 1 / 240; t < d * 3; t += 1 / 240) {
    const atual = posicaoNoCiclo(t, d);
    if (atual < anterior) { quedas++; assert.ok(anterior > 0.99 && atual < 0.01, `queda fora da emenda em t=${t}`); }
    anterior = atual;
  }
  assert.equal(quedas, 2);
  assert.ok(Math.abs(posicaoNoCiclo(0.4 + d, d) - posicaoNoCiclo(0.4, d)) < 1e-9);
});

test('em todo padrão em ciclo a pose na emenda é a mesma (sem salto) e nada gira para trás', () => {
  const a = rig.criarPose(), b = rig.criarPose();
  const ciclos = Object.values(PADROES).filter((p) => p.modo === 'ciclo');
  assert.ok(ciclos.length >= 7, 'corrida, pedalada e os quatro nados em ciclo, no mínimo');
  for (const p of ciclos) {
    rig.amostrarPadrao(p, 0, a);
    rig.amostrarPadrao(p, 1, b);
    for (const j of Object.keys(a.ang)) assert.ok(Math.abs((((a.ang[j] - b.ang[j]) % 360) + 540) % 360 - 180) < 0.05, `${p.id}: ${j} salta na emenda`);
    assert.ok(Math.abs(a.raiz.x - b.raiz.x) < 0.05 && Math.abs(a.raiz.y - b.raiz.y) < 0.05, `${p.id}: raiz salta na emenda`);
    // Sem easing: a pose na metade do ciclo é a média dos quadros vizinhos, não uma curva que freia.
    const t0 = posicaoDoPadrao(p, 0.25 * p.duracaoS), t1 = posicaoDoPadrao(p, 0.5 * p.duracaoS);
    assert.ok(Math.abs(t0 - 0.25) < 1e-9 && Math.abs(t1 - 0.5) < 1e-9, `${p.id}: o ciclo deve ser linear no tempo`);
  }
});

test('a manivela da pedalada gira sempre para a frente (o ângulo do pedal só cresce)', () => {
  const p = PADROES.pedalada;
  const bb = { x: 48, y: 74 };
  const pose = rig.criarPose(), sk = rig.criarEsqueleto();
  let anterior = null, voltas = 0;
  for (let i = 0; i <= 240; i++) {
    rig.amostrarPadrao(p, i / 240, pose);
    rig.resolver(pose, p.vista, sk);
    let ang = Math.atan2(sk.peE.x - bb.x, bb.y - sk.peE.y) * 180 / Math.PI;
    if (ang < 0) ang += 360;
    if (anterior !== null) {
      let delta = ang - anterior;
      if (delta < -180) delta += 360;
      assert.ok(delta > 0, `manivela voltou em ${i / 240}: delta ${delta.toFixed(2)}`);
      if (delta < 0) voltas++;
    }
    anterior = ang;
  }
  assert.equal(voltas, 0);
});

test('o braço do crawl só gira num sentido (o ângulo nunca sobe)', () => {
  const p = PADROES['nado-crawl'];
  for (let i = 1; i < p.quadros.length; i++) {
    assert.ok(p.quadros[i].pose.ang.bracoE < p.quadros[i - 1].pose.ang.bracoE, `quadro ${i}`);
  }
});
