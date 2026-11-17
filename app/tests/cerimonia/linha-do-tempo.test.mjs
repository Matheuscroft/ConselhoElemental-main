import assert from 'node:assert/strict';
import test from 'node:test';
import { loadComponent } from '../elemental/load-component.mjs';

const nivel = loadComponent('src/lib/cerimonia/nivel.ts');

test('as três cenas derivam dos tempos do sistema de movimento: anel, cartões, resumo', () => {
  // The old impact scene (1584 ms) was folded into the ring scene: the title now
  // lands during the burst. The summary no longer counts the number (the seal
  // counts in the ring scene), so it shortened from 3.6 to 3 conjures.
  assert.equal(nivel.CENA.impacto, undefined);
  assert.equal(nivel.CENA.anel, 4896);
  assert.equal(nivel.CENA.cartoes, 2160);
  assert.equal(nivel.CENA.numero, 2160);
  assert.equal(nivel.duracaoDaCerimonia(), 9216);
});

test('o roteiro da cena do anel: entra, preenche, fecha, o selo chega, e sobra tempo para ler', () => {
  const { ANEL, CENA } = nivel;
  const DURATION = { conjure: 720 };
  assert.equal(ANEL.entrada, 504);
  assert.equal(ANEL.preenche, 2160);
  assert.equal(ANEL.fecha, ANEL.entrada + ANEL.preenche);
  assert.equal(ANEL.selo, ANEL.fecha + ANEL.convergencia);
  assert.equal(ANEL.convergencia, Math.round(DURATION.conjure * 1.5));
  // the count (one conjure) ends before the scene does
  assert.ok(ANEL.selo + DURATION.conjure < CENA.anel);
  assert.equal(nivel.faseDaAscensao(0), 'entra');
  assert.equal(nivel.faseDaAscensao(ANEL.fecha - 1), 'entra');
  assert.equal(nivel.faseDaAscensao(ANEL.fecha), 'fecha');
  assert.equal(nivel.faseDaAscensao(ANEL.selo - 1), 'fecha');
  assert.equal(nivel.faseDaAscensao(ANEL.selo), 'aceso');
});

test('o anel preenche de onde estava até 100%, acelerando e sem nunca voltar', () => {
  assert.equal(nivel.fracaoDoAnel(0, 0.35), 0.35);
  assert.equal(nivel.fracaoDoAnel(1, 0.35), 1);
  assert.equal(nivel.fracaoDoAnel(-3, 0.35), 0.35, 'before the fill it waits');
  assert.equal(nivel.fracaoDoAnel(9, 0.35), 1, 'after it, it stays closed');
  assert.equal(nivel.fracaoDoAnel(Number.NaN, 0.35), 0.35);
  let anterior = -1;
  let passoAnterior = 0;
  for (let i = 0; i <= 100; i += 1) {
    const f = nivel.fracaoDoAnel(i / 100, 0.2);
    assert.ok(f >= anterior, 'monotonic');
    if (i > 0) {
      const passo = f - anterior;
      assert.ok(passo >= passoAnterior - 1e-9, 'each step is at least as long as the last: it accelerates');
      passoAnterior = passo;
    }
    anterior = f;
  }
  // read off the scene clock
  assert.equal(nivel.fracaoDoAnelEm(0, 0.35), 0.35);
  assert.equal(nivel.fracaoDoAnelEm(nivel.ANEL.fecha, 0.35), 1);
});

test('os marcos de 25/50/75% soam no instante em que o anel os cruza, e só os que faltam', () => {
  assert.deepEqual(nivel.marcosDoPreenchimento(0.35).map((m) => m.marco), [0.5, 0.75]);
  assert.deepEqual(nivel.marcosDoPreenchimento(0).map((m) => m.marco), [0.25, 0.5, 0.75]);
  assert.deepEqual(nivel.marcosDoPreenchimento(0.74).map((m) => m.marco), [], 'too close to the start to sound');
  let ultimo = nivel.ANEL.entrada;
  for (const { marco, instante } of nivel.marcosDoPreenchimento(0)) {
    assert.ok(instante > ultimo && instante < nivel.ANEL.fecha);
    ultimo = instante;
    // the inverse of the curve: at that instant the ring is at the mark
    assert.ok(Math.abs(nivel.fracaoDoAnelEm(instante, 0) - marco) < 0.002);
  }
});

test('a fração de antes do pedido é sempre usável, e o padrão é 0,35', () => {
  assert.equal(nivel.FRACAO_ANTES_PADRAO, 0.35);
  assert.equal(nivel.fracaoAntesValida(undefined), 0.35);
  assert.equal(nivel.fracaoAntesValida(Number.NaN), 0.35);
  assert.equal(nivel.fracaoAntesValida(0.6), 0.6);
  assert.equal(nivel.fracaoAntesValida(-1), 0);
  assert.ok(nivel.fracaoAntesValida(1) < 1, 'there is always some ring left to fill');
  const xp = nivel.xpParaNivel(4);
  const meio = nivel.progressoDoNivel(xp + 30);
  assert.ok(Math.abs(nivel.fracaoAntesDoGanho(xp + 30, 4) - meio.fracao) < 1e-9);
  assert.equal(nivel.fracaoAntesDoGanho(xp + 30, 9), 0.35, 'a gain that skipped levels falls back to the default');
});

test('a tabela do anel mede por comprimento de arco, como o dashoffset do SVG', () => {
  const t = nivel.tabelaDoAnel(64);
  assert.equal(t.length, 65 * 2);
  const perto = (a, b) => Math.abs(a - b) < 1e-3;
  assert.ok(perto(t[0], 0) && perto(t[1], -1), 'starts at twelve o\'clock');
  assert.ok(perto(t[16 * 2], 1) && perto(t[16 * 2 + 1], 0), 'a quarter of the length is three o\'clock');
  assert.ok(perto(t[32 * 2], 0) && perto(t[32 * 2 + 1], 1), 'half is six o\'clock');
  assert.ok(perto(t[64 * 2], 0) && perto(t[64 * 2 + 1], -1), 'and it closes');
  const p = { x: 0, y: 0 };
  nivel.pontoDoAnel(t, 0.25, p);
  assert.ok(perto(p.x, 1) && perto(p.y, 0));
  nivel.pontoDoAnel(t, 2, p);
  assert.ok(perto(p.x, 0) && perto(p.y, -1), 'out of range is clamped');
});

test('o elemento que acende a cena é o de maior nível; empate é terra', () => {
  const n = (fogo, agua, ar, terra) => ({ fogo, agua, ar, terra });
  assert.equal(nivel.elementoDominante(n(1, 1, 1, 1)), 'terra');
  assert.equal(nivel.elementoDominante(n(5, 2, 2, 5)), 'terra', 'a tie with earth is earth');
  assert.equal(nivel.elementoDominante(n(5, 2, 2, 3)), 'fogo');
  assert.equal(nivel.elementoDominante(n(1, 4, 2, 3)), 'agua');
  assert.equal(nivel.elementoDominante(n(1, 2, 6, 3)), 'ar');
  assert.equal(nivel.elementoDominante(n(1, 4, 4, 3)), 'agua', 'a tie without earth keeps the fire, water, air order');
});

test('as partículas e a nitidez se adaptam à tela', () => {
  assert.equal(nivel.quantidadeDeParticulas(390), 600);
  assert.equal(nivel.quantidadeDeParticulas(1280), 600);
  assert.equal(nivel.quantidadeDeParticulas(375), 300);
  assert.equal(nivel.pixelRatioMaximo(390), 1.5);
  assert.equal(nivel.pixelRatioMaximo(1024), 2);
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
