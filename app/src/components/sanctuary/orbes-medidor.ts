/**
 * Pure logic behind the orbs' WebGL scene (no three, no DOM), so it can be
 * tested in node: the frame-rate meter that decides when the device cannot keep
 * up, the draw order, and the small curves the scene shares.
 */

/** No verdict before this many seconds of running: shader compile and texture upload are not "slow". */
export const AQUECIMENTO_S = 2;
/** Length of one averaging window. */
export const JANELA_S = 1.5;
/** A window averaging more than this many milliseconds per frame is a slow one (about 40 fps). */
export const LIMITE_MS = 25;
/** Slow windows in a row before giving up. */
export const JANELAS_LENTAS = 2;
/** A gap longer than this is a pause (hidden tab, page idle), not a slow frame: the window restarts. */
export const PAUSA_S = 0.5;

export interface Medidor {
  /** Call once per drawn frame with the monotonic clock. Returns true exactly once: when it is time to degrade. */
  amostrar(segundos: number): boolean;
}

export function criarMedidor(): Medidor {
  let inicio = -1;
  let anterior = -1;
  let somaMs = 0;
  let quadros = 0;
  let inicioJanela = -1;
  let lentas = 0;
  let disparou = false;

  const reiniciarJanela = (agora: number) => {
    somaMs = 0;
    quadros = 0;
    inicioJanela = agora;
  };

  return {
    amostrar(segundos) {
      if (disparou) return false;
      if (inicio < 0) {
        inicio = segundos;
        anterior = segundos;
        return false;
      }
      const delta = segundos - anterior;
      anterior = segundos;
      if (delta > PAUSA_S || delta < 0) {
        // A pause: forget what was being averaged and wait the warm-up out again.
        inicio = segundos;
        inicioJanela = -1;
        lentas = 0;
        return false;
      }
      if (segundos - inicio < AQUECIMENTO_S) return false;
      if (inicioJanela < 0) {
        reiniciarJanela(segundos);
        return false;
      }
      somaMs += delta * 1000;
      quadros += 1;
      if (segundos - inicioJanela < JANELA_S) return false;
      const media = quadros > 0 ? somaMs / quadros : 0;
      lentas = media > LIMITE_MS ? lentas + 1 : 0;
      reiniciarJanela(segundos);
      if (lentas >= JANELAS_LENTAS) {
        disparou = true;
        return true;
      }
      return false;
    },
  };
}

/** Orbs that sit behind are drawn first. Sorts `ordem` (indexes into `profundidade`) in place, stable, no allocation. */
export function ordenarPorProfundidade(ordem: Int8Array | number[], profundidade: ArrayLike<number>, total: number): void {
  for (let i = 1; i < total; i += 1) {
    const atual = ordem[i];
    const valor = profundidade[atual];
    let j = i - 1;
    while (j >= 0 && profundidade[ordem[j]] > valor) {
      ordem[j + 1] = ordem[j];
      j -= 1;
    }
    ordem[j + 1] = atual;
  }
}

export const limitar = (valor: number, minimo: number, maximo: number) => (valor < minimo ? minimo : valor > maximo ? maximo : valor);

/** Pixel ratio of the canvas: at most 2, and at most 1.5 on a narrow screen. */
export function pixelRatioDasOrbes(larguraCss: number, dpr: number): number {
  const teto = larguraCss <= 480 ? 1.5 : 2;
  return limitar(dpr || 1, 1, teto);
}

/** How much larger a focused orb is drawn: up to 8%. */
export const FOCO_ESCALA = 0.08;
export function escalaVisual(escala: number, foco: number): number {
  return escala * (1 + FOCO_ESCALA * limitar(foco, 0, 1));
}

/** Smooth 0..1 easing for the rare transition the scene makes by itself. */
export function suavizar(t: number): number {
  const x = limitar(t, 0, 1);
  return x * x * (3 - 2 * x);
}
