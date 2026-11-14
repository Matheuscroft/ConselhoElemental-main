import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ALCANCE_POR_NIVEL,
  ATRASO_MAXIMO_S,
  CAIXA_PADRAO,
  CURVA_CONJURE,
  CURVA_PADRAO,
  DOBRA_S,
  FPS_POR_NIVEL,
  MARGEM_POR_NIVEL,
  PARTICULAS_COMPLETO_POR_NIVEL,
  PARTICULAS_DOBRA,
  PARTICULAS_DOBRA_CONQUISTA,
  PARTICULAS_MAX,
  PARTICULAS_POR_NIVEL,
  VERBOS,
  VERBO_NEUTRO,
  alcanceDaDobra,
  interpolarParametros,
  margemDoNivel,
  nivelEfetivo,
  parametrosDaMoldura,
  particulasDaDobra,
  particulasDoNivel,
  posicaoNaDobra,
  temDobraDeTelaCheia,
  verboDoElemento,
} from '../../src/lib/momentos/moldura.ts';

const ELEMENTOS = ['fogo', 'agua', 'ar', 'terra'];

test('cada elemento tem o seu verbo e o neutro respira', () => {
  assert.equal(VERBOS.fogo.verbo, 'lanca');
  assert.equal(VERBOS.agua.verbo, 'corre');
  assert.equal(VERBOS.ar.verbo, 'gira');
  assert.equal(VERBOS.terra.verbo, 'ergue');
  assert.equal(verboDoElemento(null), VERBO_NEUTRO);
  assert.equal(VERBO_NEUTRO.verbo, 'respira');
});

test('os verbos têm a física do conceito: fogo sobe, terra cai, ar gira mais, água ondula', () => {
  assert.ok(VERBOS.fogo.arrasto[0] < 0 && VERBOS.fogo.arrasto[1] < 0, 'fogo sobe e acelera');
  assert.ok(VERBOS.fogo.tremula > 0, 'fogo tremula');
  assert.ok(VERBOS.terra.arrasto[0] < 0 && VERBOS.terra.arrasto[1] > 0, 'terra tem impulso e gravidade');
  assert.ok(VERBOS.ar.giro > Math.max(VERBOS.fogo.giro, VERBOS.agua.giro, VERBOS.terra.giro), 'ar gira mais rápido');
  assert.ok(VERBOS.agua.ondula > 0 && VERBOS.agua.arrasto[1] > 0, 'água ondula e cai em arco');
  assert.deepEqual([...VERBO_NEUTRO.arrasto], [0, 0]);
});

test('o nível define partículas, margem e quadros', () => {
  assert.deepEqual([1, 2, 3].map((n) => PARTICULAS_POR_NIVEL[n]), [64, 128, 128]);
  assert.deepEqual([1, 2, 3].map((n) => margemDoNivel(n)), [24, 40, 40]);
  assert.deepEqual([1, 2, 3].map((n) => FPS_POR_NIVEL[n]), [30, 30, 60]);
  assert.equal(particulasDoNivel(1, false), 64);
  assert.equal(particulasDoNivel(2, false), 128);
  assert.equal(particulasDoNivel(1, true), 96, 'o nível 1 de um dia completo é o de hoje');
  for (const nivel of [1, 2, 3]) {
    assert.ok(PARTICULAS_COMPLETO_POR_NIVEL[nivel] <= PARTICULAS_MAX);
    assert.ok(PARTICULAS_COMPLETO_POR_NIVEL[nivel] > PARTICULAS_POR_NIVEL[nivel]);
  }
});

test('movimento reduzido vira nível 1 e nunca monta a dobra de tela cheia', () => {
  for (const nivel of [1, 2, 3]) assert.equal(nivelEfetivo(nivel, true), 1);
  for (const nivel of [1, 2, 3]) assert.equal(nivelEfetivo(nivel, false), nivel);
  assert.equal(temDobraDeTelaCheia(3, true), false);
  assert.equal(temDobraDeTelaCheia(3, false), true);
  assert.equal(temDobraDeTelaCheia(2, false), false);
  assert.equal(temDobraDeTelaCheia(1, false), false);
});

test('a margem do CSS é a mesma do shader, por nível', () => {
  const css = readFileSync(new URL('../../src/components/momentos/moldura-feitico.css', import.meta.url), 'utf8');
  assert.match(css, new RegExp(`--moldura-margem: ${MARGEM_POR_NIVEL[1]}px;`));
  assert.match(css, new RegExp(`data-nivel='2'\\],\\s*\\.reel-feitico\\[data-nivel='3'\\] \\{ --moldura-margem: ${MARGEM_POR_NIVEL[2]}px;`));
  assert.equal(MARGEM_POR_NIVEL[2], MARGEM_POR_NIVEL[3]);
});

test('os parâmetros: o nível sobe a força do verbo e o alcance, e liga a borda viva', () => {
  const um = parametrosDaMoldura('fogo', 1);
  const dois = parametrosDaMoldura('fogo', 2);
  const tres = parametrosDaMoldura('fogo', 3);
  assert.equal(um.vivo, 0);
  assert.equal(dois.vivo, 1);
  assert.equal(tres.vivo, 1);
  assert.ok(Math.abs(dois.arrastoLinear) > Math.abs(um.arrastoLinear));
  assert.ok(Math.abs(tres.arrastoLinear) > Math.abs(dois.arrastoLinear));
  assert.ok(dois.afastamentoMax > um.afastamentoMax);
  assert.equal(um.afastamentoMax, 22 * ALCANCE_POR_NIVEL[1]);
  assert.equal(um.pesoFogo, 1);
  assert.equal(um.pesoAgua + um.pesoAr + um.pesoTerra, 0);
  const neutro = parametrosDaMoldura(null, 3);
  assert.equal(neutro.pesoFogo + neutro.pesoAgua + neutro.pesoAr + neutro.pesoTerra, 0);
  assert.equal(neutro.arrastoLinear, 0);
});

test('o nível 1 mantém a órbita de hoje: velocidade, afastamento e tamanho do elemento', () => {
  const um = parametrosDaMoldura('agua', 1);
  assert.equal(um.velocidade, 0.04);
  assert.equal(um.afastamentoMin, 6);
  assert.equal(um.afastamentoMax, 24);
  assert.equal(um.tamanho, 4.2);
});

test('trocar de elemento interpola, nunca corta', () => {
  const fogo = parametrosDaMoldura('fogo', 3);
  const agua = parametrosDaMoldura('agua', 3);
  const meio = interpolarParametros(fogo, agua, 0.5);
  assert.equal(meio.pesoFogo, 0.5);
  assert.equal(meio.pesoAgua, 0.5);
  assert.equal(interpolarParametros(fogo, agua, 0).pesoFogo, 1);
  assert.equal(interpolarParametros(fogo, agua, 1).pesoAgua, 1);
  assert.ok(meio.velocidade > Math.min(fogo.velocidade, agua.velocidade));
  assert.ok(meio.velocidade < Math.max(fogo.velocidade, agua.velocidade));
});

// --- the leap ---------------------------------------------------------------

const sementes = [
  [0.05, 0.2, 0.3, 0],
  [0.2, 0.5, 0.5, 0],
  [0.4, 0.8, 0.9, 0],
  [0.12, 0.35, 0.7, 0.1],
  [0.3, 0.65, 0.1, 0],
];

test('a dobra tem 240 partículas, e 480 na conquista', () => {
  assert.equal(PARTICULAS_DOBRA, 240);
  assert.equal(PARTICULAS_DOBRA_CONQUISTA, 480);
  assert.equal(particulasDaDobra('troca'), 240);
  assert.equal(particulasDaDobra('toque'), 240);
  assert.equal(particulasDaDobra('conquista'), 480);
});

test('o fogo sobe e acelera', () => {
  for (const s of sementes) {
    const ini = posicaoNaDobra('fogo', s, 0, CAIXA_PADRAO);
    const meio = posicaoNaDobra('fogo', s, 0.7, CAIXA_PADRAO);
    const fim = posicaoNaDobra('fogo', s, DOBRA_S, CAIXA_PADRAO);
    assert.ok(meio.y < ini.y, 'sobe');
    assert.ok(fim.y < meio.y, 'continua subindo');
    assert.ok(ini.origemY <= 0, 'nasce na metade de cima do contorno, para não cruzar o rosto do cartão');
    // acceleration: it climbs more in the second half than in the first.
    const subiuPrimeiro = ini.y - posicaoNaDobra('fogo', s, 0.7, CAIXA_PADRAO).y;
    const subiuDepois = meio.y - fim.y;
    assert.ok(subiuDepois > subiuPrimeiro * 0.6 || fim.y < -150, 'o chicote não perde força');
  }
});

test('a terra cai abaixo da origem, com peso, e quica uma vez na linha de base do cartão', () => {
  const chao = CAIXA_PADRAO.meiaAltura;
  for (const s of sementes) {
    const ini = posicaoNaDobra('terra', s, 0, CAIXA_PADRAO);
    const fim = posicaoNaDobra('terra', s, DOBRA_S, CAIXA_PADRAO);
    assert.ok(fim.y > ini.y, 'termina abaixo de onde nasceu');
    assert.ok(fim.y <= chao + 1e-9, 'nunca passa da linha de base');

    // Walk the whole leap. The height rises (y falls), the stone drops to the
    // baseline, bounces once (one impact: y turns from growing to falling) and rests.
    let subiu = false;
    let anterior = ini.y;
    let sentido = 0;
    let impactos = 0;
    let maiorY = -Infinity;
    for (let t = 0; t <= DOBRA_S + 1e-9; t += 0.005) {
      const { y } = posicaoNaDobra('terra', s, t, CAIXA_PADRAO);
      if (y < ini.y - 1) subiu = true;
      maiorY = Math.max(maiorY, y);
      const novoSentido = Math.sign(Math.round((y - anterior) * 1000) / 1000);
      if (novoSentido !== 0) {
        if (sentido > 0 && novoSentido < 0) impactos += 1;
        sentido = novoSentido;
      }
      anterior = y;
    }
    assert.ok(subiu, 'sobe num impulso');
    assert.ok(maiorY <= chao + 1e-9 && maiorY > chao - 12, 'chega à linha de base e não passa dela');
    assert.equal(impactos, 1, 'quica uma vez só, e depois repousa');
  }
});

test('a água sobe em parábola e cai', () => {
  for (const s of sementes) {
    let menorY = Infinity;
    let tMenor = 0;
    for (let t = 0; t <= DOBRA_S; t += 0.01) {
      const { y } = posicaoNaDobra('agua', s, t, CAIXA_PADRAO);
      if (y < menorY) { menorY = y; tMenor = t; }
    }
    const ini = posicaoNaDobra('agua', s, 0, CAIXA_PADRAO);
    const fim = posicaoNaDobra('agua', s, DOBRA_S, CAIXA_PADRAO);
    assert.ok(menorY < ini.y - 20, 'sobe');
    assert.ok(tMenor > 0.1 && tMenor < DOBRA_S, 'o topo da parábola fica no meio do voo');
    assert.ok(fim.y > menorY, 'e depois cai');
  }
});

test('o ar gira em espiral: o raio abre e o ângulo avança', () => {
  for (const s of sementes) {
    const a = posicaoNaDobra('ar', s, 0.05, CAIXA_PADRAO);
    const b = posicaoNaDobra('ar', s, DOBRA_S, CAIXA_PADRAO);
    assert.ok(Math.hypot(b.x, b.y) > Math.hypot(a.x, a.y) * 1.5, 'abre saindo pelas bordas');
    const angA = Math.atan2(a.y, a.x);
    const angB = Math.atan2(b.y, b.x);
    assert.notEqual(angA.toFixed(2), angB.toFixed(2), 'gira');
  }
});

test('antes do atraso da partícula ela ainda está na borda do cartão', () => {
  for (const elemento of ELEMENTOS) {
    const s = [0.3, 0.4, 0.5, 1];
    const antes = posicaoNaDobra(elemento, s, ATRASO_MAXIMO_S * 0.5, CAIXA_PADRAO);
    assert.equal(antes.vida, 0);
    assert.ok(Number.isFinite(antes.x) && Number.isFinite(antes.y));
    const fim = posicaoNaDobra(elemento, s, DOBRA_S, CAIXA_PADRAO);
    assert.ok(fim.vida > 0.95 && fim.vida <= 1);
  }
});

test('todas as posições são finitas durante e depois da dobra', () => {
  for (const elemento of ELEMENTOS) {
    for (const s of sementes) {
      for (let t = 0; t <= DOBRA_S + 0.5; t += 0.05) {
        const { x, y } = posicaoNaDobra(elemento, s, t, CAIXA_PADRAO);
        assert.ok(Number.isFinite(x) && Number.isFinite(y), `${elemento} t=${t}`);
      }
    }
  }
});

test('só a conquista ultrapassa o alvo; a dobra de troca nunca passa de 1', () => {
  let maxConquista = 0;
  let maxTroca = 0;
  let maxToque = 0;
  for (let k = 0; k <= 1.0001; k += 0.01) {
    maxConquista = Math.max(maxConquista, alcanceDaDobra('conquista', k));
    maxTroca = Math.max(maxTroca, alcanceDaDobra('troca', k));
    maxToque = Math.max(maxToque, alcanceDaDobra('toque', k));
  }
  assert.ok(maxConquista > alcanceDaDobra('conquista', 1) + 0.02, 'o conjure ultrapassa e volta');
  assert.ok(maxTroca <= 1 + 1e-9);
  assert.ok(maxToque <= 1 + 1e-9);
  assert.ok(Math.abs(alcanceDaDobra('troca', 1) - 1) < 1e-9);
});

test('as curvas das batidas são as do sistema de movimento', () => {
  assert.equal(CURVA_PADRAO(0), 0);
  assert.equal(CURVA_PADRAO(1), 1);
  for (let k = 0; k <= 1; k += 0.05) assert.ok(CURVA_PADRAO(k) <= 1 + 1e-6);
  let pico = 0;
  for (let k = 0; k <= 1; k += 0.01) pico = Math.max(pico, CURVA_CONJURE(k));
  assert.ok(pico > 1.05, 'o conjure é a única curva que passa do alvo');
});
