/**
 * The geometry of a coverflow: where each card sits once you know how far it
 * is from the middle of the rail.
 *
 * Pure on purpose. The rail itself is a native scroller -- real momentum,
 * real touch, keyboard and screen readers for free -- and this only decides
 * how each card is turned and softened on top of it.
 */

export interface PosicaoReel {
  /** -1 is one card to the left of centre, 0 is centred, 1 is one to the right. */
  readonly distancia: number;
  readonly rotacao: number;
  readonly profundidade: number;
  readonly escala: number;
  readonly opacidade: number;
  readonly desfoque: number;
}

/** Past this many cards from the middle nothing more changes. */
export const ALCANCE = 2.4;
export const ROTACAO_MAXIMA = 34;
export const PROFUNDIDADE_MAXIMA = 220;
export const ESCALA_MINIMA = 0.82;
export const OPACIDADE_MINIMA = 0.38;
export const DESFOQUE_MAXIMO = 3.4;

const limitar = (valor: number, minimo: number, maximo: number) =>
  Math.min(maximo, Math.max(minimo, valor));

/** -0 is a real value in JavaScript and it has no business in a transform. */
const semZeroNegativo = (valor: number) => (valor === 0 ? 0 : valor);

/**
 * How far card `indice` sits from the middle, in cards. A fractional result
 * is the point: a rail mid-drag is between two cards, and the turn has to
 * follow the finger rather than snap when the scroll settles.
 */
export function distanciaDoCentro(
  rolagem: number,
  larguraVisivel: number,
  passo: number,
  largura: number,
  recuo: number,
  indice: number,
): number {
  if (passo <= 0) return 0;
  const centroDaJanela = rolagem + larguraVisivel / 2;
  // The step is the card plus its gap; the card's own centre is half the
  // card, not half the step. Using the step puts every card off by the gap.
  const centroDoCartao = recuo + indice * passo + largura / 2;
  return (centroDoCartao - centroDaJanela) / passo;
}

/** The card's turn, depth, size and softness at that distance. */
export function posicaoReel(distancia: number): PosicaoReel {
  const bruta = limitar(distancia, -ALCANCE, ALCANCE);
  const intensidade = Math.min(1, Math.abs(bruta) / ALCANCE);
  // Eased, so the neighbours part quickly and the far ones settle.
  const curva = intensidade * intensidade * (3 - 2 * intensidade);

  return {
    distancia: semZeroNegativo(bruta),
    // Neighbours turn toward the middle, which is what makes it a coverflow
    // rather than a row of cards sliding past.
    rotacao: semZeroNegativo(-Math.sign(bruta) * curva * ROTACAO_MAXIMA),
    profundidade: semZeroNegativo(-curva * PROFUNDIDADE_MAXIMA),
    escala: 1 - curva * (1 - ESCALA_MINIMA),
    opacidade: 1 - curva * (1 - OPACIDADE_MINIMA),
    desfoque: curva * DESFOQUE_MAXIMO,
  };
}

/** The card nearest the middle: the one that is active, and the only one that plays. */
export function indiceAtivo(
  rolagem: number,
  larguraVisivel: number,
  passo: number,
  largura: number,
  recuo: number,
  total: number,
): number {
  if (total <= 0 || passo <= 0) return 0;
  let melhor = 0;
  let menor = Infinity;
  for (let indice = 0; indice < total; indice += 1) {
    const d = Math.abs(distanciaDoCentro(rolagem, larguraVisivel, passo, largura, recuo, indice));
    if (d < menor) {
      menor = d;
      melhor = indice;
    }
  }
  return melhor;
}
