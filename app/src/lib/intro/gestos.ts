/**
 * The four gestures of the ceremony, as pure functions over pointer samples.
 *
 * Coordinates are page-local metres on the right page, origin at the centre of the Seal, +x towards
 * the fore-edge and +y towards the head of the book (so "up" on the page). The scene projects the
 * finger onto the page and hands the point here; nothing in this file knows about Three.js, React or
 * the DOM, so every threshold can be tested.
 *
 * Every gesture is forgiving by design: progress never goes backwards because a finger wobbled, and a
 * single tap always completes the element through its own animation (the touch alternative).
 */

export interface PontoPagina { readonly x: number; readonly y: number }
export interface Amostra extends PontoPagina { readonly t: number }

const graus = (r: number) => (r * 180) / Math.PI;
const radianos = (g: number) => (g * Math.PI) / 180;
const limitar = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/* ---------------------------------------------------------------- Água: seguir o sulco */

export interface ArcoSulco {
  /** Radius of the groove, in metres. */
  readonly raio: number;
  /** Start and end angles in degrees (maths convention, counter-clockwise from +x). */
  readonly de: number;
  readonly ate: number;
  /** How far from the groove the finger may stray and still count, in metres. */
  readonly tolerancia: number;
}

/** The water quadrant's arc: from the left (just under 9 o'clock) up to 12 o'clock, clockwise. */
export const ARCO_AGUA: ArcoSulco = { raio: 0.0645, de: 186, ate: 98, tolerancia: 0.016 };

/** Point on the arc at progress p (0..1). */
export function pontoNoArco(arco: ArcoSulco, p: number): PontoPagina {
  const a = radianos(arco.de + (arco.ate - arco.de) * limitar(p));
  return { x: Math.cos(a) * arco.raio, y: Math.sin(a) * arco.raio };
}

/** Progress (0..1) of a point projected onto the arc, or null if it is off the groove. */
export function progressoNoArco(arco: ArcoSulco, ponto: PontoPagina): number | null {
  const r = Math.hypot(ponto.x, ponto.y);
  if (Math.abs(r - arco.raio) > arco.tolerancia) return null;
  let a = graus(Math.atan2(ponto.y, ponto.x));
  // bring the angle into the arc's span, whichever way it runs
  const lo = Math.min(arco.de, arco.ate), hi = Math.max(arco.de, arco.ate);
  while (a < lo - 180) a += 360;
  while (a > hi + 180) a -= 360;
  const p = (a - arco.de) / (arco.ate - arco.de);
  if (p < -0.12 || p > 1.12) return null;
  return limitar(p);
}

export interface EstadoSulco { readonly progresso: number; readonly ativo: boolean; readonly concluido: boolean }
export const SULCO_INICIAL: EstadoSulco = { progresso: 0, ativo: false, concluido: false };

/** How close to the drop the finger must land to pick it up (metres). Generous: ~56 px on a phone. */
export const RAIO_PEGAR_GOTA = 0.02;
/** The finger may not jump ahead along the groove by more than this (so a tap at the end does not count). */
const SALTO_MAXIMO = 0.2;
export const SULCO_COMPLETO = 0.96;

export function iniciarSulco(estado: EstadoSulco, arco: ArcoSulco, ponto: PontoPagina): EstadoSulco {
  if (estado.concluido) return estado;
  const gota = pontoNoArco(arco, estado.progresso);
  const perto = Math.hypot(ponto.x - gota.x, ponto.y - gota.y) <= RAIO_PEGAR_GOTA;
  return perto ? { ...estado, ativo: true } : estado;
}

export function moverSulco(estado: EstadoSulco, arco: ArcoSulco, ponto: PontoPagina): EstadoSulco {
  if (!estado.ativo || estado.concluido) return estado;
  const p = progressoNoArco(arco, ponto);
  if (p === null || p > estado.progresso + SALTO_MAXIMO || p <= estado.progresso) return estado;
  const concluido = p >= SULCO_COMPLETO;
  return { progresso: concluido ? 1 : p, ativo: !concluido, concluido };
}

/** Lifting the finger keeps what was earned: the drop waits where it stopped. */
export const soltarSulco = (estado: EstadoSulco): EstadoSulco => ({ ...estado, ativo: false });

/* ---------------------------------------------------------------- Terra: segurar */

/** How long the earth must be held to rise fully, in milliseconds. */
export const SEGURAR_MS = 1400;
/** Released early, the stones sink back this much faster than they rose. */
const RECUO = 2.2;

export interface EstadoSegurar { readonly progresso: number; readonly segurando: boolean; readonly concluido: boolean }
export const SEGURAR_INICIAL: EstadoSegurar = { progresso: 0, segurando: false, concluido: false };

/** Advance the hold by dt milliseconds. */
export function passoSegurar(estado: EstadoSegurar, dtMs: number): EstadoSegurar {
  if (estado.concluido) return estado;
  const delta = (dtMs / SEGURAR_MS) * (estado.segurando ? 1 : -RECUO);
  const progresso = limitar(estado.progresso + delta);
  const concluido = estado.segurando && progresso >= 1;
  return { progresso, segurando: estado.segurando && !concluido, concluido };
}
export const pressionar = (e: EstadoSegurar): EstadoSegurar => (e.concluido ? e : { ...e, segurando: true });
export const largar = (e: EstadoSegurar): EstadoSegurar => ({ ...e, segurando: false });

/* ---------------------------------------------------------------- Fogo: riscar */

export interface Traco { readonly de: PontoPagina; readonly ate: PontoPagina; readonly tolerancia: number }

export interface Risco {
  /** Fraction of the trace the stroke covered (0..1). */
  readonly cobertura: number;
  /** Mean speed along the trace, in metres per second. */
  readonly velocidade: number;
  /** +1 if struck from `de` to `ate`, -1 the other way, 0 if undecided. */
  readonly direcao: -1 | 0 | 1;
  readonly aceso: boolean;
}

/** The unlit trace of Fire: the "line of light" at the top of the Fire quadrant (Seal B), from its inner end outwards. */
export const TRACO_FOGO: Traco = { de: { x: 0.008, y: -0.009 }, ate: { x: 0.055, y: -0.0155 }, tolerancia: 0.014 };

/** A strike is a fast pass over most of the trace, like a match on its box. */
export const RISCO_COBERTURA = 0.6;
export const RISCO_VELOCIDADE = 0.18; // m/s on the page: about 280 px/s on a phone
/** A slow, careful pass over almost all of it also lights: nobody is punished for being gentle. */
export const RISCO_COBERTURA_LENTA = 0.9;

export function avaliarRisco(traco: Traco, amostras: readonly Amostra[]): Risco {
  const dx = traco.ate.x - traco.de.x, dy = traco.ate.y - traco.de.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  let tMin = Infinity, tMax = -Infinity, primeiro: Amostra | null = null, ultimo: Amostra | null = null;
  let tPrimeiro = 0, tUltimo = 0;
  for (const a of amostras) {
    const px = a.x - traco.de.x, py = a.y - traco.de.y;
    const t = (px * ux + py * uy) / L;
    const dist = Math.abs(px * uy - py * ux);
    if (dist > traco.tolerancia || t < -0.1 || t > 1.1) continue;
    const tc = limitar(t);
    if (!primeiro) { primeiro = a; tPrimeiro = tc; }
    ultimo = a; tUltimo = tc;
    tMin = Math.min(tMin, tc); tMax = Math.max(tMax, tc);
  }
  if (!primeiro || !ultimo || tMax <= tMin) return { cobertura: 0, velocidade: 0, direcao: 0, aceso: false };
  const cobertura = tMax - tMin;
  const dt = Math.max(1, ultimo.t - primeiro.t) / 1000;
  const velocidade = (cobertura * L) / dt;
  const direcao: -1 | 0 | 1 = tUltimo > tPrimeiro ? 1 : tUltimo < tPrimeiro ? -1 : 0;
  const aceso = (cobertura >= RISCO_COBERTURA && velocidade >= RISCO_VELOCIDADE) || cobertura >= RISCO_COBERTURA_LENTA;
  return { cobertura, velocidade, direcao, aceso };
}

/* ---------------------------------------------------------------- Ar: levantar a ponta da página */

/** Upward screen drag, as a fraction of the screen height, that lifts the corner fully. */
export const LEVANTAR_FRACAO = 0.12;
/** Released past this, the wind finishes the gesture; before it, the corner falls back. */
export const LEVANTAR_LIMIAR = 0.55;

/** Progress of the lift from the screen-space drag (dy negative = upwards). */
export const progressoLevantar = (dyTela: number, alturaTela: number): number =>
  limitar(-dyTela / Math.max(1, alturaTela * LEVANTAR_FRACAO));

export const levantouOSuficiente = (progresso: number): boolean => progresso >= LEVANTAR_LIMIAR;

