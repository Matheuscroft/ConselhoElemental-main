import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fimDaEstacao,
  instanteDoCeu,
  luzDaLua,
  porcentagemIluminada,
  rotuloDeData,
  temaDaEstacao,
  variaveisDaLua,
} from '../../src/lib/temporal/ceu-dos-ciclos.ts';

const perto = (a, b, folga = 0.6) => assert.ok(Math.abs(a - b) <= folga, `${a} não está perto de ${b}`);

test('a tabela de luz bate nas cinco fases do conceito', () => {
  // [fração iluminada, arco, borda, halo, estrelas, luz da Terra]
  const tabela = [
    [0.0, 30, 0.3, 0.18, 1, 0.18],
    [0.15, 52.5, 0.375, 0.243, 0.88, 0.1301],
    [0.5, 105, 0.55, 0.39, 0.6, 0.045],
    [0.85, 157.5, 0.725, 0.537, 0.32, 0.00405],
    [1, 180, 0.8, 0.6, 0.2, 0],
  ];
  for (const [luz, arco, borda, halo, estrelas, terra] of tabela) {
    const r = luzDaLua({ illuminated: luz, waxing: true }, false);
    perto(r.arco, arco);
    perto(r.borda, borda, 0.005);
    perto(r.halo, halo, 0.005);
    perto(r.estrelas, estrelas, 0.005);
    perto(r.terra, terra, 0.0005);
  }
});

test('a Lua Nova nunca fica apagada: limbo, halo, anel e nebulosa têm piso', () => {
  const nova = luzDaLua({ illuminated: 0, waxing: true }, false);
  const cheia = luzDaLua({ illuminated: 1, waxing: true }, false);
  assert.ok(nova.borda >= 0.3 && cheia.borda >= 0.3);
  assert.ok(nova.halo >= 0.18 && cheia.halo >= 0.18);
  assert.ok(nova.limbo > cheia.limbo && cheia.limbo > 0, 'limbo aceso sempre, mais forte quanto mais escura');
  assert.ok(nova.nebulosa > cheia.nebulosa && cheia.nebulosa > 0);
  assert.equal(nova.terra, 0.18, 'luz da Terra até 3x a anterior (.06)');
});

test('a luz é contínua e limitada entre 0 e 1', () => {
  assert.equal(luzDaLua({ illuminated: 7, waxing: true }, false).luz, 1);
  assert.equal(luzDaLua({ illuminated: -3, waxing: true }, false).luz, 0);
  assert.equal(luzDaLua({ illuminated: Number.NaN, waxing: true }, false).luz, 0);
});

test('o lado aceso espelha no hemisfério sul', () => {
  assert.equal(luzDaLua({ illuminated: 0.5, waxing: true }, false).lado, 90);
  assert.equal(luzDaLua({ illuminated: 0.5, waxing: false }, false).lado, 270);
  assert.equal(luzDaLua({ illuminated: 0.5, waxing: true }, true).lado, 270);
  assert.equal(luzDaLua({ illuminated: 0.5, waxing: false }, true).lado, 90);
});

test('as variáveis CSS da Lua saem como o stylesheet espera', () => {
  const v = variaveisDaLua(luzDaLua({ illuminated: 1, waxing: true }, false));
  assert.deepEqual(Object.keys(v), ['--lua-arco', '--lua-lado', '--lua-borda', '--lua-halo']);
  assert.equal(v['--lua-arco'], '180.0deg');
  assert.equal(v['--lua-lado'], '90deg');
});

test('a porcentagem é arredondada como na página da Lua', () => {
  assert.equal(porcentagemIluminada(0.784), 78);
  assert.equal(porcentagemIluminada(0.785), 79);
  assert.equal(porcentagemIluminada(2), 100);
});

test('hoje lê o relógio; outro dia lê o meio-dia', () => {
  const agora = new Date(2026, 10, 9, 17, 31);
  assert.equal(instanteDoCeu(new Date(2026, 10, 9), agora).getTime(), agora.getTime());
  const outro = instanteDoCeu(new Date(2026, 10, 12), agora);
  assert.deepEqual([outro.getDate(), outro.getHours()], [12, 12]);
});

test('cada estação tem tema, e nome desconhecido não quebra', () => {
  assert.equal(temaDaEstacao('Primavera').tom, 'spring');
  assert.equal(temaDaEstacao('Verão').tom, 'summer');
  assert.equal(temaDaEstacao('Outono').tom, 'autumn');
  assert.equal(temaDaEstacao('Inverno').tom, 'winter');
  assert.equal(temaDaEstacao('Inverno').blur, 'strong');
  assert.equal(temaDaEstacao('Primavera').blur, 'soft');
  assert.equal(temaDaEstacao('???').tom, 'spring');
});

// Same boundaries as getSeason in the south, restated so the test needs no app imports.
const sul = (d) => {
  const m = d.getMonth() + 1;
  const dia = d.getDate();
  if ((m === 12 && dia >= 21) || m === 1 || m === 2 || (m === 3 && dia <= 19)) return { name: 'Verão' };
  if ((m === 3 && dia >= 20) || m === 4 || m === 5 || (m === 6 && dia <= 20)) return { name: 'Outono' };
  if ((m === 6 && dia >= 21) || m === 7 || m === 8 || (m === 9 && dia <= 22)) return { name: 'Inverno' };
  return { name: 'Primavera' };
};

test('a estação termina no dia antes da próxima', () => {
  const fim = fimDaEstacao(new Date(2026, 10, 9), sul);
  assert.deepEqual([fim.getMonth(), fim.getDate()], [11, 20]);
  assert.equal(rotuloDeData(fim), '20 de dezembro');
});

test('o fim vale no último dia, atravessa o ano e cobre o verão', () => {
  assert.equal(rotuloDeData(fimDaEstacao(new Date(2026, 11, 20), sul)), '20 de dezembro');
  const verao = fimDaEstacao(new Date(2026, 0, 15), sul);
  assert.equal(rotuloDeData(verao), '19 de março');
  assert.equal(rotuloDeData(fimDaEstacao(new Date(2026, 11, 28), sul)), '19 de março');
});

test('um leitor quebrado não prende o laço', () => {
  assert.equal(fimDaEstacao(new Date(2026, 0, 1), () => ({ name: 'Verão' })), null);
});
