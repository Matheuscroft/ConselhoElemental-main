import type { OrbeEstado } from './orbes-tipos.ts';

/**
 * The physics of the Sanctuary's constellation, with no DOM: where each of the
 * four orbs stands for a given phase, which one is at the front, and how the
 * phase moves when someone drags, releases, or presses an arrow.
 *
 * The phase is an angle in radians. Orb `i` stands at `angulo(i, fase)`; the
 * sine of that angle is its depth (+1 at the front, nearest to the viewer).
 */

export const TAU = Math.PI * 2;
/** A quarter turn: one orb to the next. */
export const PASSO = Math.PI / 2;
/** The phase at which orb 0 is exactly at the front. Every `PASSO` from it puts another orb there. */
export const FASE_FRENTE = Math.PI * 1.25;
/** The slow turn of the constellation when nobody touches it. */
export const SEGUNDOS_POR_VOLTA = 48;
/** A press that moves less than this many pixels is a tap, not a drag. */
export const LIMIAR_ARRASTO = 8;
/** After a gesture the constellation waits this long before it starts turning by itself again. */
export const PAUSA_APOS_GESTO_MS = 6000;

const RAIO_VERTICAL = 0.17;
const VELOCIDADE_MAXIMA = 12;

export const limitar = (valor: number, minimo = 0, maximo = 1) =>
  Number.isFinite(valor) ? Math.min(maximo, Math.max(minimo, valor)) : minimo;

/** Any angle, brought to (-PI, PI]. */
export function envolver(angulo: number): number {
  const volta = ((angulo + Math.PI) % TAU + TAU) % TAU;
  return volta === 0 ? Math.PI : volta - Math.PI;
}

export const angulo = (indice: number, fase: number) => -Math.PI * 0.75 + indice * PASSO + fase;

/**
 * How far to the side an orb travels, as a fraction of the orbit's width. It
 * mirrors the stylesheet's `--orbit-radius-x` for each breakpoint, so the
 * canvas and the links agree on where each orb is.
 */
export function raioHorizontal(largura: number): number {
  if (!(largura > 0)) return 0.37;
  const [teto, folga] = largura <= 600 ? [0.4, 58] : largura <= 900 ? [0.39, 58] : [0.37, 68];
  return Math.min(teto, 0.5 - folga / largura);
}

export interface Geometria {
  /** Offsets in the unit of the stylesheet: multiplied by the radius, they give the position. */
  readonly orbitaX: number;
  readonly orbitaY: number;
  readonly profundidade: number;
  /** 0.8 at the back, 1.2 at the front. */
  readonly escala: number;
  /** 0.55 at the back, 1 at the front: back orbs are dim, never hidden. */
  readonly opacidade: number;
  /** Centre of the orb in fractions of the orbit stage, top-left origin. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export function geometria(indice: number, fase: number, largura: number): Geometria {
  const a = angulo(indice, fase);
  const profundidade = Math.sin(a);
  const perspectiva = 1 / (1 - profundidade * 0.16);
  const orbitaX = Math.cos(a) * perspectiva;
  const orbitaY = (profundidade - Math.cos(a) * 0.45) * perspectiva;
  return {
    orbitaX,
    orbitaY,
    profundidade,
    escala: 1 + profundidade * 0.2,
    opacidade: 0.55 + (profundidade + 1) * 0.225,
    x: 0.5 + orbitaX * raioHorizontal(largura),
    y: 0.5 + orbitaY * RAIO_VERTICAL,
    z: Math.round(profundidade * 90) + 100,
  };
}

/** The orb nearest to the viewer. */
export function indiceDaFrente(fase: number, total = 4): number {
  let melhor = 0;
  let maior = -Infinity;
  for (let i = 0; i < total; i += 1) {
    const profundidade = Math.sin(angulo(i, fase));
    if (profundidade > maior + 1e-9) { maior = profundidade; melhor = i; }
  }
  return melhor;
}

/** How much an orb is the focus, from how near to the front it is: 0 below 0.6 of depth, 1 at the front. */
export function focoDaProfundidade(profundidade: number): number {
  const t = limitar((profundidade - 0.6) / 0.4);
  return t * t * (3 - 2 * t);
}

/** How much an orb asks for attention, from the rituals waiting today. None waiting: no pulse. */
export function cargaDosPendentes(pendentes: number): number {
  if (!(pendentes > 0)) return 0;
  return limitar(0.45 + pendentes * 0.18);
}

/** The frame the scene draws. `tocado` is the index of an orb under a finger or a pointer, or -1. */
export function estadosDasOrbes<T extends string>(
  elementos: readonly T[],
  fase: number,
  largura: number,
  cargas: readonly number[],
  tocado = -1,
): (OrbeEstado & { elemento: T })[] {
  return elementos.map((elemento, indice) => {
    const g = geometria(indice, fase, largura);
    return {
      elemento,
      x: g.x,
      y: g.y,
      escala: g.escala,
      profundidade: g.profundidade,
      foco: Math.max(focoDaProfundidade(g.profundidade), indice === tocado ? 1 : 0),
      carga: limitar(cargas[indice] ?? 0),
    };
  }) as (OrbeEstado & { elemento: T })[];
}

/** The phase nearest to `fase` at which some orb is exactly at the front. */
export function encaixeMaisProximo(fase: number): number {
  return Math.round((fase - FASE_FRENTE) / PASSO) * PASSO + FASE_FRENTE;
}

/** The phase, nearest to `fase`, that puts orb `indice` at the front. */
export function faseParaFrente(indice: number, fase: number): number {
  return fase + envolver(FASE_FRENTE - indice * PASSO - fase);
}

/** Where a released drag comes to rest: the orbit coasts a little with its speed, then lands on an orb. */
export function alvoDoEncaixe(fase: number, velocidade: number): number {
  return encaixeMaisProximo(fase + limitar(velocidade * 0.3, -Math.PI, Math.PI));
}

/** Smoothed speed of a finger (rad/s): a single jittery frame never throws the orbit. */
export function velocidadeSuavizada(anterior: number, deltaFase: number, deltaSegundos: number): number {
  if (!(deltaSegundos > 0)) return anterior;
  const instantanea = limitar(deltaFase / deltaSegundos, -VELOCIDADE_MAXIMA, VELOCIDADE_MAXIMA);
  return anterior + (instantanea - anterior) * 0.4;
}

/** The turn that follows the finger: dragging right brings the orb in front along with it. */
export const faseDoArrasto = (deltaPx: number, larguraPx: number): number =>
  -deltaPx / (Math.max(1, larguraPx) * raioHorizontal(larguraPx));

const RIGIDEZ = 70;
const AMORTECIMENTO = 2 * Math.sqrt(RIGIDEZ) * 0.9;

/** A damped spring toward the target: it keeps the speed of the release and settles with a short overshoot at most. */
export function passoDaMola(fase: number, velocidade: number, alvo: number, segundos: number) {
  let f = fase;
  let v = velocidade;
  let restante = Math.min(Math.max(segundos, 0), 0.08);
  while (restante > 0) {
    const dt = Math.min(restante, 1 / 120);
    v += (RIGIDEZ * (alvo - f) - AMORTECIMENTO * v) * dt;
    f += v * dt;
    restante -= dt;
  }
  return { fase: f, velocidade: v };
}

export const emRepousoDaMola = (fase: number, velocidade: number, alvo: number) =>
  Math.abs(alvo - fase) < 0.002 && Math.abs(velocidade) < 0.02;

/** Auto-rotation: the phase gained in `segundos`. */
export const avancoAutomatico = (segundos: number) => (Math.min(Math.max(segundos, 0), 0.064) / SEGUNDOS_POR_VOLTA) * TAU;
