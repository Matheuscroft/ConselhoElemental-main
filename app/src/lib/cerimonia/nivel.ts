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
 * The three scenes of the ceremony, in milliseconds, all derived from the
 * motion beats. Impact (the panel and the title), the four element cards, then
 * the number. The CSS counts the same multiples of `--ds-duration-conjure`.
 */
export const CENA = {
  impacto: Math.round(DURATION.conjure * 2.2),
  cartoes: Math.round(DURATION.conjure * 3),
  numero: Math.round(DURATION.conjure * 3.6),
} as const;

/** Where inside scene 2 the first card jumps, and the gap between cards (two stagger steps). */
export const CARTAO_INICIO = DURATION.settle;
export const CARTAO_PASSO = STAGGER * 2;
/** Where inside scene 3 the seal lights up and the number starts to count. */
export const ACENDE_EM = DURATION.conjure;

export const duracaoDaCerimonia = (): number => CENA.impacto + CENA.cartoes + CENA.numero;

export type ElementoDoCartao = 'fogo' | 'agua' | 'ar' | 'terra';
export const ELEMENTOS_DOS_CARTOES: readonly ElementoDoCartao[] = ['fogo', 'agua', 'ar', 'terra'];

interface XpPorElemento {
  readonly xp_fire?: number;
  readonly xp_water?: number;
  readonly xp_air?: number;
  readonly xp_earth?: number;
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
