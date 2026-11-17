import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const rig = loadComponent('src/components/fitness-kit/figura-rig.ts');
const des = loadComponent('src/components/fitness-kit/figura-desenho.ts');
const { PADROES, EXTRAS } = loadComponent('src/components/fitness-kit/figura-padroes.ts');
const { CHAO, Y_CONTATO, PROPORCOES } = rig;

// Padrões em que o pé sai do chão por natureza (máquina com os pés soltos).
const PES_NO_AR = new Set(['leg-press', 'extensora', 'flexora', 'pedalada', 'luta-chute', 'condicionamento']);
const SEM_CHAO = (p) => p.chao === false || p.apoio === 'barra-acima';
const ANGULO_PE = (id) => EXTRAS[id]?.anguloPe;

test('todo padrão tem quadros em ordem, de 0 a 1, e id único', () => {
  const ids = new Set();
  for (const p of Object.values(PADROES)) {
    assert.ok(!ids.has(p.id), `id repetido ${p.id}`); ids.add(p.id);
    assert.ok(p.quadros.length >= 2, p.id);
    assert.equal(p.quadros[0].t, 0, p.id);
    assert.equal(p.quadros[p.quadros.length - 1].t, 1, p.id);
    for (let i = 1; i < p.quadros.length; i++) assert.ok(p.quadros[i].t > p.quadros[i - 1].t, `${p.id}: t fora de ordem`);
    assert.ok(p.duracaoS >= (p.modo === 'ciclo' ? 1 : 1.2) && p.duracaoS <= 4, `${p.id}: duração ${p.duracaoS}`);
    if (p.modo === 'ciclo') {
      const a = p.quadros[0].pose, b = p.quadros[p.quadros.length - 1].pose;
      for (const j of Object.keys(a.ang)) {
        const d = (((a.ang[j] - b.ang[j]) % 360) + 540) % 360 - 180; // os braços do nado são desenrolados: 270 e -90 são a mesma pose
        assert.ok(Math.abs(d) < 0.05, `${p.id}: ${j} do último quadro difere do primeiro`);
      }
      assert.ok(Math.abs(a.raiz.x - b.raiz.x) < 0.05 && Math.abs(a.raiz.y - b.raiz.y) < 0.05, `${p.id}: raiz do último quadro difere do primeiro`);
    }
    assert.ok(p.rotulo.length > 3, p.id);
  }
});

test('joelhos sem hiperextensão em todas as poses (vista de lado)', () => {
  for (const p of Object.values(PADROES).filter((x) => x.vista === 'lado')) {
    p.quadros.forEach((q, i) => {
      const a = q.pose.ang;
      assert.ok(a.coxaE - a.canelaE >= -3, `${p.id} quadro ${i}: joelho E hiperestendido`);
      assert.ok(a.coxaD - a.canelaD >= -3, `${p.id} quadro ${i}: joelho D hiperestendido`);
    });
  }
});

test('a figura toca o chão com o pé mais baixo e nunca o atravessa', () => {
  const falhas = [];
  for (const p of Object.values(PADROES)) {
    if (SEM_CHAO(p)) continue;
    p.quadros.forEach((q, i) => {
      const sk = rig.esqueletoDe(q.pose, p.vista, ANGULO_PE(p.id));
      const pes = Math.max(sk.peE.y, sk.peD.y, sk.pontaE.y, sk.pontaD.y);
      const todos = [sk.peE, sk.peD, sk.pontaE, sk.pontaD, sk.joelhoE, sk.joelhoD, sk.maoE, sk.maoD, sk.cotoveloE, sk.cotoveloD, sk.quadril, sk.pescoco];
      const fundo = Math.max(...todos.map((pt) => pt.y), sk.cabeca.y + PROPORCOES.cabecaR - 2.6);
      if (fundo > Y_CONTATO + 1.6) falhas.push(`${p.id} q${i}: atravessa o chão (${fundo.toFixed(1)})`);
      if (!PES_NO_AR.has(p.id) && Math.abs(pes - Y_CONTATO) > 1.2) falhas.push(`${p.id} q${i}: pé a ${(Y_CONTATO - pes).toFixed(1)} do chão`);
    });
  }
  assert.deepEqual(falhas, []);
});

test('toda a figura cabe no quadro 100 x 100 ao longo do movimento', () => {
  const falhas = [];
  const pose = rig.criarPose(), sk = rig.criarEsqueleto();
  for (const p of Object.values(PADROES)) {
    for (let t = 0; t <= 1.001; t += 0.05) {
      rig.amostrarPadrao(p, t, pose);
      rig.resolver(pose, p.vista, sk, rig.PROPORCOES, ANGULO_PE(p.id));
      for (const [nome, pt] of Object.entries(sk)) {
        if (pt.x < 2 || pt.x > 98 || pt.y < 2 || pt.y > 98) falhas.push(`${p.id} t=${t.toFixed(2)} ${nome} (${pt.x.toFixed(0)}, ${pt.y.toFixed(0)})`);
      }
    }
  }
  assert.deepEqual([...new Set(falhas.map((f) => f.split(' ')[0]))], [], falhas.slice(0, 12).join('\n'));
});

test('as primitivas não dependem da pose nem dos músculos e o extra de cada padrão referencia um padrão real', () => {
  for (const id of Object.keys(EXTRAS)) assert.ok(PADROES[id], `extra órfão ${id}`);
  for (const p of Object.values(PADROES)) {
    const prims = des.primitivasDe(p, EXTRAS[p.id]);
    for (const ativos of [undefined, new Set(['peitoral', 'quadriceps', 'costas', 'biceps', 'gluteos'])]) {
      for (const t of [0, 0.37, 1]) {
        const geo = des.preencherGeometria(p, t, des.criarGeometria(prims.length), EXTRAS[p.id], ativos);
        prims.forEach((pr, i) => {
          if (pr.k === 'p') assert.ok(!/NaN|Infinity/.test(geo.d[i]), `${p.id}: caminho inválido (${pr.c})`);
          else for (let j = 0; j < (pr.k === 'l' ? 4 : 3); j++) assert.ok(Number.isFinite(geo.g[i * 4 + j]), `${p.id}: coordenada inválida (${pr.c})`);
        });
      }
    }
  }
});

test('músculos inativos não desenham nada e ativos desenham', () => {
  const p = PADROES['supino-barra'];
  const prims = des.primitivasDe(p, EXTRAS[p.id]);
  const vazio = des.preencherGeometria(p, 0.5, des.criarGeometria(prims.length), EXTRAS[p.id], undefined);
  const aceso = des.preencherGeometria(p, 0.5, des.criarGeometria(prims.length), EXTRAS[p.id], new Set(['peitoral']));
  const contar = (geo) => prims.filter((pr, i) => pr.k === 'p' && (pr.c === 'musculo' || pr.c === 'musculo-d') && geo.d[i] !== '').length;
  assert.equal(contar(vazio), 0);
  assert.ok(contar(aceso) >= 1);
});
