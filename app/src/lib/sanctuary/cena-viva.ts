/**
 * The arithmetic behind a scene that answers the hand: where a pointer or a
 * tilt puts the parallax, how it eases there, and where the light sits inside
 * a card. Nothing here touches the DOM, so the numbers can be tested without
 * a browser; `useCenaViva.ts` is the only place that writes them anywhere.
 */

export interface Vetor {
  readonly x: number;
  readonly y: number;
}

export interface Retangulo {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export const REPOUSO: Vetor = { x: 0, y: 0 };

/** -1..1, and 0 for anything that is not a number. */
export const limitar = (valor: number): number =>
  Number.isFinite(valor) ? Math.max(-1, Math.min(1, valor)) : 0;

/**
 * A pointer inside the scene, as -1..1 on each axis with 0 at the centre. A
 * scene that has no size yet answers with rest rather than with NaN.
 */
export function ponteiroNaCena(x: number, y: number, cena: Retangulo): Vetor {
  if (!(cena.width > 0) || !(cena.height > 0)) return REPOUSO;
  return {
    x: limitar(((x - cena.left) / cena.width) * 2 - 1),
    y: limitar(((y - cena.top) / cena.height) * 2 - 1),
  };
}

/**
 * How a phone is usually held: tipped back about this far. Tilt is measured
 * from here, so the scene rests when the phone is simply in the hand.
 */
export const INCLINACAO_NEUTRA = 45;

/**
 * Device tilt as -1..1. `alcance` is the tilt, in degrees, that reaches the
 * edge: small enough that a wrist does it, large enough that walking does not.
 */
export function inclinacaoNaCena(beta: number | null, gamma: number | null, alcance = 18): Vetor {
  if (beta === null || gamma === null || !(alcance > 0)) return REPOUSO;
  return {
    x: limitar(gamma / alcance),
    y: limitar((beta - INCLINACAO_NEUTRA) / alcance),
  };
}

/**
 * One step toward a target, by half-life, so the ease is the same at 60 and at
 * 120 frames a second. A long frame can never overshoot: the factor stays
 * between 0 and 1.
 */
export function amortecer(atual: number, alvo: number, deltaMs: number, meiaVidaMs = 110): number {
  if (!(deltaMs > 0) || !(meiaVidaMs > 0)) return atual;
  const fator = 1 - Math.pow(0.5, deltaMs / meiaVidaMs);
  return atual + (alvo - atual) * fator;
}

/** Close enough that another frame would change nothing a person could see. */
export const emRepouso = (atual: Vetor, alvo: Vetor, folga = 0.002): boolean =>
  Math.abs(atual.x - alvo.x) < folga && Math.abs(atual.y - alvo.y) < folga;

/**
 * Where the light sits inside a card, in pixels from its top-left corner. It
 * is allowed a little past the edge, so the rim still catches it when the
 * finger is just outside.
 */
export function luzNoCartao(x: number, y: number, cartao: Retangulo, sobra = 24): Vetor {
  const dentro = (valor: number, tamanho: number) =>
    Math.max(-sobra, Math.min(tamanho + sobra, Number.isFinite(valor) ? valor : 0));
  return {
    x: Math.round(dentro(x - cartao.left, cartao.width)),
    y: Math.round(dentro(y - cartao.top, cartao.height)),
  };
}
