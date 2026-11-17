import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const rig = loadComponent('src/components/fitness-kit/figura-rig.ts');
const des = loadComponent('src/components/fitness-kit/figura-desenho.ts');
const { PADROES, EXTRAS } = loadComponent('src/components/fitness-kit/figura-padroes.ts');

const PASSOS_POR_LOOP = 240;
/**
 * Limite por passo (1/240 do loop): 6% da altura do enquadramento do padrão no
 * cartão (cerca de 4 a 5 unidades). A maior velocidade legítima da bateria (a
 * ponta do pé no chute frontal) é de ~3,7 unidades por passo; os defeitos que
 * este teste existe para pegar saltavam de 9 a 23 unidades (pé trocando de
 * regime de uma vez, cotovelo dando a volta de 330 graus, raios da roda).
 */
const FRACAO_DA_ALTURA = Number(process.env.FRACAO_CONT ?? 0.06);
const MUSCULOS = new Set(['peitoral', 'costas', 'ombros', 'biceps', 'triceps', 'antebraco', 'abdomen', 'gluteos', 'quadriceps', 'posteriores', 'panturrilha']);
const NUM = /-?\d+(?:\.\d+)?/g;

/** Coordenadas de todo elemento da cena, exceto a linha do chão e a da água (que são fixas). */
function pontos(prims, geo, saida) {
  let n = 0;
  prims.forEach((pr, i) => {
    const o = i * 4;
    if (pr.k === 'l') {
      if (pr.c === 'chao' || pr.c === 'agua') return;
      saida[n++] = [geo.g[o], geo.g[o + 1], i, pr.c]; saida[n++] = [geo.g[o + 2], geo.g[o + 3], i, pr.c];
    } else if (pr.k === 'c') {
      if (geo.g[o + 2] === 0) return;
      saida[n++] = [geo.g[o], geo.g[o + 1], i, pr.c];
    } else if (geo.d[i]) {
      const m = geo.d[i].match(NUM);
      if (pr.c === 'sombra') { saida[n++] = [Number(m[0]), Number(m[1]), i, pr.c]; return; }
      for (let j = 0; j + 1 < m.length; j += 2) saida[n++] = [Number(m[j]), Number(m[j + 1]), i, pr.c];
    }
  });
  saida.length = n;
  return saida;
}

function maiorSalto(p, passosTotal, fatorTempo = 1) {
  const extra = EXTRAS[p.id];
  const prims = des.primitivasDe(p, extra);
  const a = des.criarGeometria(prims.length), b = des.criarGeometria(prims.length);
  let pa = [], pb = [], pior = { d: 0, onde: '' };
  const dt = (p.duracaoS * fatorTempo) / PASSOS_POR_LOOP;
  for (let i = 0; i <= passosTotal; i++) {
    const t = rig.posicaoDoPadrao(p, i * dt);
    des.preencherGeometria(p, t, i % 2 ? b : a, extra, MUSCULOS);
    const pp = pontos(prims, i % 2 ? b : a, i % 2 ? pb : pa);
    if (i > 0) {
      const ant = i % 2 ? pa : pb;
      if (ant.length !== pp.length) { pior = { d: Infinity, onde: `${p.id}: número de pontos mudou (${ant.length} -> ${pp.length}) no passo ${i}` }; break; }
      for (let k = 0; k < pp.length; k++) {
        const d = Math.hypot(pp[k][0] - ant[k][0], pp[k][1] - ant[k][1]);
        if (d > pior.d) pior = { d, onde: `${p.id} passo ${i} (t=${t.toFixed(3)}) elemento ${pp[k][3]}#${pp[k][2]}` };
      }
    }
  }
  return pior;
}

test('nenhum ponto de nenhum elemento salta entre passos vizinhos (2 loops, emenda e retorno incluídos)', () => {
  const falhas = [];
  const maximos = [];
  for (const p of Object.values(PADROES)) {
    const r = maiorSalto(p, PASSOS_POR_LOOP * 2);
    maximos.push([r.d, r.onde]);
    const limite = des.enquadramentoDe(p, EXTRAS[p.id], 1.6).h * FRACAO_DA_ALTURA;
    if (r.d > limite) falhas.push(`${r.onde}: ${r.d.toFixed(2)} unidades (limite ${limite.toFixed(2)})`);
  }
  maximos.sort((x, y) => y[0] - x[0]);
  if (process.env.IMPRIMIR_CONT) console.log(maximos.slice(0, 14).map(([d, o]) => `${d.toFixed(2)}  ${o}`).join('\n'));
  assert.deepEqual(falhas, [], `limite de ${FRACAO_DA_ALTURA * 100}% da altura do enquadramento por passo (1/${PASSOS_POR_LOOP} do loop)`);
});

test('todo padrão em ciclo fecha: o último quadro é o primeiro e a emenda não salta', () => {
  for (const p of Object.values(PADROES).filter((x) => x.modo === 'ciclo')) {
    const extra = EXTRAS[p.id];
    const prims = des.primitivasDe(p, extra);
    const a = des.criarGeometria(prims.length), b = des.criarGeometria(prims.length);
    des.preencherGeometria(p, 0, a, extra);
    des.preencherGeometria(p, 1, b, extra);
    const pa = pontos(prims, a, []), pb = pontos(prims, b, []);
    assert.equal(pa.length, pb.length);
    for (let k = 0; k < pa.length; k++) assert.ok(Math.hypot(pa[k][0] - pb[k][0], pa[k][1] - pb[k][1]) < 0.15, `${p.id}: ${pa[k][3]}#${pa[k][2]} não fecha`);
  }
});
