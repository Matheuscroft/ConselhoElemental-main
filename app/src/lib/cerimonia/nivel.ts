import { LevelingCalculatorService } from '../../services/leveling-calculator.ts';
import { DURATION, STAGGER } from '../motion/motion.ts';
import type { Premio } from './cerimonia.ts';

/**
 * The ceremony for the mage's level (the number on the HUD seal). Pure logic
 * only: what each beat shows, how far the bar to the next level is, and the
 * queue that lets one ceremony play at a time.
 */

export interface PedidoDeNivel {
  readonly id: string;
  readonly de: number;
  readonly para: number;
  readonly titulo: string;
  /**
   * How far through the level just beaten the mage was before the gain that
   * made them rise (0..1). The ring of the ceremony starts filling from here.
   * Absent: `FRACAO_ANTES_PADRAO`.
   */
  readonly fracaoAntes?: number;
}

export interface ProgressoDoNivel {
  readonly nivel: number;
  /** 0..1 of the way to the next level. */
  readonly fracao: number;
  readonly faltam: number;
  readonly proximo: number;
}

/**
 * Same arithmetic as the HUD: XP inside this level against the size of the
 * level, and what is left of it.
 */
export function progressoDoNivel(xpTotal: number): ProgressoDoNivel {
  const nivel = LevelingCalculatorService.calculate(xpTotal);
  const noNivel = nivel.xpTotal - nivel.xpAtLevelStart;
  return {
    nivel: nivel.level,
    fracao: Math.min(1, Math.max(0, noNivel / nivel.xpToNextLevel)),
    faltam: Math.max(0, nivel.xpToNextLevel - noNivel),
    proximo: nivel.level + 1,
  };
}

/** The least total XP that reaches a level. Levels only rise with XP, so it bisects. */
export function xpParaNivel(nivel: number): number {
  let baixo = 0;
  let alto = 1024;
  while (LevelingCalculatorService.calculate(alto).level < nivel && alto < 1e12) alto *= 2;
  while (baixo < alto) {
    const meio = Math.floor((baixo + alto) / 2);
    if (LevelingCalculatorService.calculate(meio).level >= nivel) alto = meio;
    else baixo = meio + 1;
  }
  return baixo;
}

/** Where the ring starts when the request does not say how far the mage was. */
export const FRACAO_ANTES_PADRAO = 0.35;
/** The ring never starts so full that there is no fill left to watch. */
const FRACAO_ANTES_MAXIMA = 0.92;

/** Any number a request may carry, made safe for the ring: finite, 0..0.92, default when absent. */
export function fracaoAntesValida(valor: number | null | undefined): number {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return FRACAO_ANTES_PADRAO;
  return Math.min(FRACAO_ANTES_MAXIMA, Math.max(0, valor));
}

/**
 * The fraction of level `de` the mage had at `xpAntes`, the total XP before the
 * gain. When the gain skipped over more than one level, `xpAntes` is not inside
 * `de` any more, and the default stands in for it.
 */
export function fracaoAntesDoGanho(xpAntes: number, de: number): number {
  const antes = progressoDoNivel(Number.isFinite(xpAntes) ? Math.max(0, xpAntes) : 0);
  return antes.nivel === de ? fracaoAntesValida(antes.fracao) : FRACAO_ANTES_PADRAO;
}

/** The shape `proximoBeat` walks: arrival, the counting number, the bar, the end. */
export const PREMIO_DE_NIVEL: Premio = {
  titulo: 'Novo nível',
  numero: { rotulo: 'Nível', de: 0, para: 0 },
  destrave: { titulo: 'Progresso', detalhe: 'Até o próximo nível' },
};

/** How long a ceremony of the mage waits when an element ascended in the same burst. */
export const ADIAMENTO_POR_ASCENSAO = 4500;

export const atrasoDaCerimonia = (haAscensao: boolean): number =>
  haAscensao ? ADIAMENTO_POR_ASCENSAO : 0;

/** One at a time: the head plays, the rest wait in the order they arrived. */
export const adicionarPedido = (fila: readonly PedidoDeNivel[], pedido: PedidoDeNivel): PedidoDeNivel[] =>
  [...fila, pedido];

export const concluirPedido = (fila: readonly PedidoDeNivel[]): PedidoDeNivel[] => fila.slice(1);

export const pedidoAtual = (fila: readonly PedidoDeNivel[]): PedidoDeNivel | null => fila[0] ?? null;

/**
 * The clock of the opening scene, "the bar completes", in milliseconds since
 * the scene mounted, all derived from the motion beats. The ring fades in
 * (`entrada`), fills from where the mage was up to 100% (`preenche`), closes
 * (`fecha`: shock rings, flash, the burst of particles and the title), the
 * burst flies into the seal (`convergencia`) and the seal lights up (`selo`).
 */
export const ANEL = {
  entrada: Math.round(DURATION.conjure * 0.7),
  preenche: Math.round(DURATION.conjure * 3),
  fecha: Math.round(DURATION.conjure * 0.7) + Math.round(DURATION.conjure * 3),
  convergencia: Math.round(DURATION.conjure * 1.5),
  selo: Math.round(DURATION.conjure * 0.7) + Math.round(DURATION.conjure * 3) + Math.round(DURATION.conjure * 1.5),
} as const;

/**
 * The scenes of the ceremony, in milliseconds. The ring (the old impact scene
 * folded into it: the title now lands during the burst), the four element
 * cards, then the summary. The CSS counts the same multiples of
 * `--ds-duration-conjure`.
 */
export const CENA = {
  anel: ANEL.fecha + Math.round(DURATION.conjure * 3.1),
  cartoes: Math.round(DURATION.conjure * 3),
  numero: Math.round(DURATION.conjure * 3),
} as const;

/** Where inside scene 2 the first card jumps, and the gap between cards (two stagger steps). */
export const CARTAO_INICIO = DURATION.settle;
export const CARTAO_PASSO = STAGGER * 2;
/** Where inside the summary scene the seal lands. */
export const ACENDE_EM = DURATION.conjure;

export const duracaoDaCerimonia = (): number => CENA.anel + CENA.cartoes + CENA.numero;

export type FaseDaAscensao = 'entra' | 'fecha' | 'aceso';

/** What the ring scene is doing at `ms`: filling, closing with the burst, or with the seal lit. */
export function faseDaAscensao(ms: number): FaseDaAscensao {
  if (ms >= ANEL.selo) return 'aceso';
  return ms >= ANEL.fecha ? 'fecha' : 'entra';
}

/**
 * The fill curve. `curva` is 0..1 of the fill phase; the answer is 0..1 of the
 * ring. It starts at a walk and accelerates to the end: a straight part and a
 * squared part, so the speed grows from 0.3 to 1.7 times the average.
 */
export const CURVA_DO_ANEL = { reta: 0.3, quadrada: 0.7 } as const;

export function fracaoDoAnel(curva: number, de: number, ate = 1): number {
  const t = Number.isFinite(curva) ? Math.min(1, Math.max(0, curva)) : 0;
  const u = CURVA_DO_ANEL.reta * t + CURVA_DO_ANEL.quadrada * t * t;
  return de + (ate - de) * u;
}

/** `fracaoDoAnel` read off the scene clock: zero before the fill starts, `ate` once it ends. */
export const fracaoDoAnelEm = (ms: number, de: number, ate = 1): number =>
  fracaoDoAnel((ms - ANEL.entrada) / ANEL.preenche, de, ate);

/** The fractions of the ring that tick (a sound each) while it fills. */
export const MARCOS_DO_ANEL = [0.25, 0.5, 0.75] as const;

/**
 * The marks still ahead of a ring that starts at `de`, with the scene instant
 * each is crossed at: the inverse of the curve. A mark too close to the start
 * would sound at once, so it is left out.
 */
export function marcosDoPreenchimento(de: number): { marco: number; instante: number }[] {
  const { reta, quadrada } = CURVA_DO_ANEL;
  return MARCOS_DO_ANEL.filter((marco) => marco > de + 0.04).map((marco) => {
    const u = (marco - de) / (1 - de);
    const t = (-reta + Math.sqrt(reta * reta + 4 * quadrada * u)) / (2 * quadrada);
    return { marco, instante: Math.round(ANEL.entrada + t * ANEL.preenche) };
  });
}

/**
 * The unit-ring table the particles read: `n + 1` points `(x, y)` on the ring
 * of `AnelXp` (the same ellipse, 98 x 14), spaced by arc length from twelve
 * o'clock clockwise, so index `i / n` is "i / n of the way round" exactly as the
 * path's dash offset reads it. Coordinates are in -1..1 on each axis (y down).
 */
export function tabelaDoAnel(n = 64): Float32Array {
  const A = 98;
  const B = 14;
  const passos = 2048;
  const acumulado = new Float64Array(passos + 1);
  let anterior = 0;
  for (let i = 1; i <= passos; i += 1) {
    const t = (i / passos) * Math.PI * 2;
    const meio = t - Math.PI / passos;
    const velocidade = Math.hypot(A * Math.cos(meio), B * Math.sin(meio));
    anterior += velocidade * ((Math.PI * 2) / passos);
    acumulado[i] = anterior;
  }
  const total = acumulado[passos];
  const saida = new Float32Array((n + 1) * 2);
  let j = 0;
  for (let i = 0; i <= n; i += 1) {
    const alvo = (i / n) * total;
    while (j < passos && acumulado[j + 1] < alvo) j += 1;
    const trecho = acumulado[j + 1] - acumulado[j] || 1;
    const t = ((j + (alvo - acumulado[j]) / trecho) / passos) * Math.PI * 2;
    saida[i * 2] = Math.sin(t);
    saida[i * 2 + 1] = -Math.cos(t);
  }
  return saida;
}

/** A point of the ring at `fracao` (0..1), read off a `tabelaDoAnel`, written into `saida`. */
export function pontoDoAnel(tabela: Float32Array, fracao: number, saida: { x: number; y: number }): void {
  const n = tabela.length / 2 - 1;
  const f = Math.min(1, Math.max(0, fracao)) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const k = f - i;
  saida.x = tabela[i * 2] + (tabela[i * 2 + 2] - tabela[i * 2]) * k;
  saida.y = tabela[i * 2 + 1] + (tabela[i * 2 + 3] - tabela[i * 2 + 1]) * k;
}

/** Particles by screen width: a phone below 390 px gets half. */
export const quantidadeDeParticulas = (largura: number): number => (largura >= 390 ? 600 : 300);

/** The sharpest the canvas may draw: 2x, and 1.5x on a narrow screen. */
export const pixelRatioMaximo = (largura: number): number => (largura <= 480 ? 1.5 : 2);

export type ElementoDoCartao = 'fogo' | 'agua' | 'ar' | 'terra';
export const ELEMENTOS_DOS_CARTOES: readonly ElementoDoCartao[] = ['fogo', 'agua', 'ar', 'terra'];

interface XpPorElemento {
  readonly xp_fire?: number;
  readonly xp_water?: number;
  readonly xp_air?: number;
  readonly xp_earth?: number;
}

/**
 * The element that lights the ring: the one the mage has raised the highest.
 * On a tie earth wins, and if earth is not in the tie, the first in the order
 * fire, water, air.
 */
export function elementoDominante(niveis: Record<ElementoDoCartao, number>): ElementoDoCartao {
  const maior = Math.max(niveis.fogo, niveis.agua, niveis.ar, niveis.terra);
  if (niveis.terra === maior) return 'terra';
  return ELEMENTOS_DOS_CARTOES.find((el) => niveis[el] === maior) ?? 'terra';
}

/** Mastery level of each element, from the same calculator the sanctuary and the HUD read. */
export function niveisDosElementos(user: XpPorElemento | null | undefined): Record<ElementoDoCartao, number> {
  const nivelDe = (xp: number | undefined) => LevelingCalculatorService.calculate(xp ?? 0).level;
  return {
    fogo: nivelDe(user?.xp_fire),
    agua: nivelDe(user?.xp_water),
    ar: nivelDe(user?.xp_air),
    terra: nivelDe(user?.xp_earth),
  };
}
