import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const rig = loadComponent('src/components/fitness-kit/figura-rig.ts');
const des = loadComponent('src/components/fitness-kit/figura-desenho.ts');
const { PADROES, EXTRAS } = loadComponent('src/components/fitness-kit/figura-padroes.ts');

const limites = (id) => des.limitesDoPadrao(PADROES[id], EXTRAS[id]);

test('os limites contêm todo ponto do esqueleto em toda pose do loop', () => {
  const pose = rig.criarPose(), sk = rig.criarEsqueleto();
  for (const p of Object.values(PADROES)) {
    const b = limites(p.id);
    for (let t = 0; t <= 1.0001; t += 0.0137) {
      rig.amostrarPadrao(p, t, pose);
      rig.resolver(pose, p.vista, sk, rig.PROPORCOES, EXTRAS[p.id]?.anguloPe);
      for (const [nome, pt] of Object.entries(sk)) {
        assert.ok(pt.x >= b.x - 1e-6 && pt.x <= b.x + b.w + 1e-6 && pt.y >= b.y - 1e-6 && pt.y <= b.y + b.h + 1e-6, `${p.id} t=${t.toFixed(2)} ${nome} fora dos limites`);
      }
    }
  }
});

test('o viewBox contém os limites com margem, na proporção pedida, para qualquer aspecto', () => {
  for (const p of Object.values(PADROES)) {
    const b = limites(p.id);
    for (const aspecto of [1, 1.6]) {
      const v = des.enquadramentoDe(p, EXTRAS[p.id], aspecto);
      assert.ok(Math.abs(v.w / v.h - aspecto) < 1e-9, `${p.id}: proporção`);
      assert.ok(v.x <= b.x && v.x + v.w >= b.x + b.w, `${p.id}: corta na largura`);
      assert.ok(v.y <= b.y && v.y + v.h >= b.y + b.h, `${p.id}: corta na altura`);
      assert.ok(v.w >= b.w * 1.2 - 1e-9 || v.h >= b.h * 1.2 - 1e-9, `${p.id}: sem margem`);
    }
  }
});

test('é calculado uma vez por padrão (mesmo objeto nas chamadas seguintes)', () => {
  const p = PADROES['agachamento-livre'];
  assert.equal(des.limitesDoPadrao(p, EXTRAS[p.id]), des.limitesDoPadrao(p, EXTRAS[p.id]));
  assert.equal(des.enquadramentoDe(p, undefined, 1.6), des.enquadramentoDe(p, undefined, 1.6));
});

test('a natação deita e fica larga; o agachamento fica alto', () => {
  const nado = limites('nado-crawl'), agacha = limites('agachamento-livre');
  assert.ok(nado.w > nado.h * 1.5, `nado ${nado.w.toFixed(0)} x ${nado.h.toFixed(0)}`);
  assert.ok(agacha.h > agacha.w * 1.2, `agachamento ${agacha.w.toFixed(0)} x ${agacha.h.toFixed(0)}`);
});

test('no cartão 16:10 a figura ocupa de 70% a 90% da dimensão que a limita', () => {
  for (const p of Object.values(PADROES)) {
    const b = limites(p.id);
    const v = des.enquadramentoDe(p, EXTRAS[p.id], 1.6);
    const ocupa = Math.max(b.w / v.w, b.h / v.h);
    assert.ok(ocupa >= 0.7 && ocupa <= 0.9, `${p.id}: ocupa ${(ocupa * 100).toFixed(0)}%`);
  }
});

test('com chão, o chão fica no mesmo respiro da borda de baixo em padrões baixos e altos', () => {
  for (const id of ['agachamento-livre', 'supino-barra', 'prancha', 'corrida']) {
    const v = des.enquadramentoDe(PADROES[id], EXTRAS[id], 1.6);
    const fracao = (v.y + v.h - 88) / v.h;
    assert.ok(fracao > 0.03 && fracao < 0.2, `${id}: chão a ${(fracao * 100).toFixed(0)}% da borda`);
  }
});
