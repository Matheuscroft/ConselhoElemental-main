import type { ElementoDoDia } from './elemento-do-dia.ts';
import type { NivelVfx } from './nivel-vfx.ts';
import { EASE } from '../motion/motion.ts';

/**
 * The frame of the open card in the Reel. Pure data and pure rules; the
 * canvas and the SVG only read from here.
 *
 * The colour is the day's leading element (see elemento-do-dia.ts), not the
 * sign. A day with no leading element is gold and lights no triangle.
 *
 * Three levels of VFX (nivel-vfx.ts) change how much the element does, never
 * what it does: each element has one verb, and the level only raises its
 * amplitude, its reach and its particle count.
 */

/** Gold, for a day that has no leading element. */
export const NEUTRO = '#d6b66f';

/** The glow ring around the card, in CSS px, and the room the canvas adds (level 1). */
export const MARGEM_PX = 24;

/** Particles drawn by level 1; a finished day draws PARTICULAS_DIA_COMPLETO. */
export const PARTICULAS = 64;
export const PARTICULAS_DIA_COMPLETO = 96;

/** The most particles any level allocates: the buffers are sized once. */
export const PARTICULAS_MAX = 192;

/** The room the canvas leaves around the card, by level: the live edge needs more. */
export const MARGEM_POR_NIVEL: Readonly<Record<NivelVfx, number>> = { 1: 24, 2: 40, 3: 40 };

/** Orbiting particles by level, and for a finished day. */
export const PARTICULAS_POR_NIVEL: Readonly<Record<NivelVfx, number>> = { 1: 64, 2: 128, 3: 128 };
export const PARTICULAS_COMPLETO_POR_NIVEL: Readonly<Record<NivelVfx, number>> = { 1: 96, 2: 192, 3: 192 };

/** Frame rate of the frame loop: only the third level is fluid. */
export const FPS_POR_NIVEL: Readonly<Record<NivelVfx, number>> = { 1: 30, 2: 30, 3: 60 };

/** How much stronger each level makes the verb, and how far the orbit opens. */
export const FORCA_POR_NIVEL: Readonly<Record<NivelVfx, number>> = { 1: 1, 2: 1.6, 3: 2 };
export const ALCANCE_POR_NIVEL: Readonly<Record<NivelVfx, number>> = { 1: 1, 2: 1.4, 3: 1.55 };

/** Reduced motion turns every level into level 1, drawn once. */
export const nivelEfetivo = (nivel: NivelVfx, reduzido: boolean): NivelVfx => (reduzido ? 1 : nivel);

export const margemDoNivel = (nivel: NivelVfx): number => MARGEM_POR_NIVEL[nivel];

export const particulasDoNivel = (nivel: NivelVfx, completo: boolean): number =>
  (completo ? PARTICULAS_COMPLETO_POR_NIVEL : PARTICULAS_POR_NIVEL)[nivel];

/** Only the third level lets the particles leave the card for the whole screen. */
export const temDobraDeTelaCheia = (nivel: NivelVfx, reduzido: boolean): boolean =>
  nivelEfetivo(nivel, reduzido) === 3;

/** The four alchemical triangles, in the order they light up. */
export const TRIANGULOS: readonly ElementoDoDia[] = ['fogo', 'agua', 'ar', 'terra'];

export interface ConfigElemento {
  /** Orbit speed, in turns per second. */
  readonly velocidade: number;
  /** How far outside the border a particle orbits, in px: [min, max]. */
  readonly afastamento: readonly [number, number];
  /** Drift away from the card in px/s (negative falls back in). */
  readonly subida: number;
  /** Sprite size in px at DPR 1. */
  readonly tamanho: number;
  /** 0..1, how much each particle flickers. */
  readonly cintilar: number;
}

/**
 * Fire spirals up in embers, water drifts slow, earth orbits low and small,
 * air is quick and flickers. The speed multiplier of the sign's modality is
 * gone with the sign: it is 1 for every element.
 */
export const CONFIG: Record<ElementoDoDia, ConfigElemento> = {
  fogo: { velocidade: 0.07, afastamento: [3, 22], subida: 9, tamanho: 3.2, cintilar: 0.55 },
  agua: { velocidade: 0.04, afastamento: [6, 24], subida: -3, tamanho: 4.2, cintilar: 0.2 },
  terra: { velocidade: 0.05, afastamento: [2, 9], subida: 0, tamanho: 2.6, cintilar: 0.3 },
  ar: { velocidade: 0.16, afastamento: [8, 26], subida: 2, tamanho: 2.4, cintilar: 0.85 },
};

/** The orbit of a day without a leading element: calm, gold. */
export const CONFIG_NEUTRO: ConfigElemento = {
  velocidade: 0.05,
  afastamento: [4, 18],
  subida: 0,
  tamanho: 2.8,
  cintilar: 0.3,
};

export const configDoElemento = (elemento: ElementoDoDia | null): ConfigElemento =>
  elemento ? CONFIG[elemento] : CONFIG_NEUTRO;

/** The colour of the frame: the element's own aura, or gold. */
export const corDaMoldura = (
  elemento: ElementoDoDia | null,
  aura: Readonly<Record<ElementoDoDia, string>>,
): string => (elemento ? aura[elemento] : NEUTRO);

/** Which triangles are lit: the day's element; all four once the day is done. */
export function triangulosAcesos(elemento: ElementoDoDia | null, completo: boolean): readonly ElementoDoDia[] {
  if (!elemento) return [];
  return completo ? TRIANGULOS : [elemento];
}

// ---------------------------------------------------------------------------
// The verb of each element
// ---------------------------------------------------------------------------

export type Verbo = 'lanca' | 'corre' | 'gira' | 'ergue' | 'respira';

export interface MovimentoDoVerbo {
  readonly verbo: Verbo;
  /**
   * Vertical drift over one cycle of a particle, in px, at level 1:
   * [linear, quadratic] in the cycle's phase. Negative is up.
   */
  readonly arrasto: readonly [number, number];
  /** Radial wave on the orbit, in px. */
  readonly ondula: number;
  /** Sideways flicker, in px. */
  readonly tremula: number;
  /** Multiplier on the orbit speed. */
  readonly giro: number;
  /** Cycles of the verb's arc per second; 0 holds the particle still on it. */
  readonly ciclo: number;
}

/**
 * Fire throws (rises, accelerates, flickers). Water runs (undulates, arcs that
 * fall). Air spins (a quick whirl). Earth lifts (a short impulse, then heavy
 * gravity). A day with no element breathes: the gold of before.
 */
export const VERBOS: Record<ElementoDoDia, MovimentoDoVerbo> = {
  fogo: { verbo: 'lanca', arrasto: [-14, -10], ondula: 0, tremula: 3, giro: 1, ciclo: 0.34 },
  agua: { verbo: 'corre', arrasto: [-6, 12], ondula: 4, tremula: 0, giro: 0.9, ciclo: 0.28 },
  ar: { verbo: 'gira', arrasto: [0, 0], ondula: 2, tremula: 0, giro: 1.7, ciclo: 0.4 },
  terra: { verbo: 'ergue', arrasto: [-10, 22], ondula: 0, tremula: 0, giro: 0.8, ciclo: 0.26 },
};

export const VERBO_NEUTRO: MovimentoDoVerbo = {
  verbo: 'respira',
  arrasto: [0, 0],
  ondula: 0,
  tremula: 0,
  giro: 1,
  ciclo: 0,
};

export const verboDoElemento = (elemento: ElementoDoDia | null): MovimentoDoVerbo =>
  elemento ? VERBOS[elemento] : VERBO_NEUTRO;

/** Everything the frame's shaders read, as numbers that can be blended. */
export interface ParametrosMoldura {
  readonly velocidade: number;
  readonly afastamentoMin: number;
  readonly afastamentoMax: number;
  readonly subida: number;
  readonly tamanho: number;
  readonly cintilar: number;
  readonly arrastoLinear: number;
  readonly arrastoQuadratico: number;
  readonly ondula: number;
  readonly tremula: number;
  readonly giro: number;
  readonly ciclo: number;
  /** 0 at level 1, 1 from level 2: the live edge in the glow shader. */
  readonly vivo: number;
  /** Which element's live edge shows (one-hot; all zero is the neutral gold). */
  readonly pesoFogo: number;
  readonly pesoAgua: number;
  readonly pesoAr: number;
  readonly pesoTerra: number;
}

export type ChaveDeParametro = keyof ParametrosMoldura;

/** The element's orbit, verb and live edge at a level. */
export function parametrosDaMoldura(elemento: ElementoDoDia | null, nivel: NivelVfx): ParametrosMoldura {
  const config = configDoElemento(elemento);
  const verbo = verboDoElemento(elemento);
  const forca = FORCA_POR_NIVEL[nivel];
  const alcance = ALCANCE_POR_NIVEL[nivel];
  return {
    velocidade: config.velocidade,
    afastamentoMin: config.afastamento[0] * alcance,
    afastamentoMax: config.afastamento[1] * alcance,
    subida: config.subida,
    tamanho: config.tamanho,
    cintilar: config.cintilar,
    arrastoLinear: verbo.arrasto[0] * forca,
    arrastoQuadratico: verbo.arrasto[1] * forca,
    ondula: verbo.ondula * forca,
    tremula: verbo.tremula * forca,
    giro: 1 + (verbo.giro - 1) * forca,
    ciclo: verbo.ciclo,
    vivo: nivel >= 2 ? 1 : 0,
    pesoFogo: elemento === 'fogo' ? 1 : 0,
    pesoAgua: elemento === 'agua' ? 1 : 0,
    pesoAr: elemento === 'ar' ? 1 : 0,
    pesoTerra: elemento === 'terra' ? 1 : 0,
  };
}

/** A blend of two parameter sets: a new element never cuts, it settles. */
export function interpolarParametros(de: ParametrosMoldura, para: ParametrosMoldura, k: number): ParametrosMoldura {
  const saida = { ...para } as Record<ChaveDeParametro, number>;
  for (const chave of Object.keys(para) as ChaveDeParametro[]) {
    saida[chave] = de[chave] + (para[chave] - de[chave]) * k;
  }
  return saida;
}

// ---------------------------------------------------------------------------
// The leap: particles that leave the card (level 3)
// ---------------------------------------------------------------------------

/** One leap lasts this long, in seconds, and then the canvas rests. */
export const DOBRA_S = 1.4;
/** The last particles leave this late, in seconds, so the burst is a whip and not a block. */
export const ATRASO_MAXIMO_S = 0.25;
export const PARTICULAS_DOBRA = 240;
export const PARTICULAS_DOBRA_CONQUISTA = 480;
export const DPR_MAXIMO_DOBRA = 1.5;

export type TipoDeDobra = 'troca' | 'conquista' | 'toque';

/** The element's index in the shader, in the order of the triangles. */
export const INDICE_DO_ELEMENTO: Readonly<Record<ElementoDoDia, number>> = { fogo: 0, agua: 1, ar: 2, terra: 3 };

export const particulasDaDobra = (tipo: TipoDeDobra): number =>
  tipo === 'conquista' ? PARTICULAS_DOBRA_CONQUISTA : PARTICULAS_DOBRA;

export interface CaixaDoCartao {
  /** Half the card's width and height, in px. */
  readonly meiaLargura: number;
  readonly meiaAltura: number;
}

export const CAIXA_PADRAO: CaixaDoCartao = { meiaLargura: 74, meiaAltura: 98.5 };

export type Semente = readonly [number, number, number, number];

export interface PosicaoNaDobra {
  /** px from the card's centre, y growing down like the screen. */
  readonly x: number;
  readonly y: number;
  /** Where the particle was born on the card's edge, same frame of reference. */
  readonly origemX: number;
  readonly origemY: number;
  /** 0..1 over the particle's own life (0 before it leaves). */
  readonly vida: number;
}

/**
 * Where a particle is born: a point on the upper half of the card's outline
 * (the top edge and the upper half of each side), so what is thrown up never
 * crosses the face of the card. Fire and earth use it; water too. Air starts
 * from the whole outline and spirals out.
 */
function nascerNaBordaSuperior(s: number, c: CaixaDoCartao): { x: number; y: number; nx: number } {
  const w = c.meiaLargura * 2;
  const h = c.meiaAltura * 2;
  const k = s * (w + h);
  if (k < w) return { x: -c.meiaLargura + k, y: -c.meiaAltura, nx: 0 };
  if (k < w + h / 2) return { x: c.meiaLargura, y: -c.meiaAltura + (k - w), nx: 1 };
  return { x: -c.meiaLargura, y: -c.meiaAltura + (k - w - h / 2), nx: -1 };
}

function nascerNaBordaInteira(s: number, c: CaixaDoCartao): { x: number; y: number } {
  const w = c.meiaLargura * 2;
  const h = c.meiaAltura * 2;
  const k = s * 2 * (w + h);
  if (k < w) return { x: -c.meiaLargura + k, y: -c.meiaAltura };
  if (k < w + h) return { x: c.meiaLargura, y: -c.meiaAltura + (k - w) };
  if (k < 2 * w + h) return { x: c.meiaLargura - (k - w - h), y: c.meiaAltura };
  return { x: -c.meiaLargura, y: c.meiaAltura - (k - 2 * w - h) };
}

const GRAVIDADE_AGUA = 620;
const GRAVIDADE_TERRA = 1500;
const RESTITUICAO_TERRA = 0.35;

/**
 * The position of one particle `t` seconds after a leap began, as a closed
 * form of time: the same formulas the vertex shader of DobraTelaCheia runs, so
 * a particle needs no CPU per frame. `semente` is four numbers in 0..1.
 *
 * Fire is whipped up and to the sides and accelerates; water is a parabola;
 * air spirals out from the whole outline; earth is flung in a fan, falls with
 * weight and bounces once on the card's baseline (the bottom edge), then rests.
 */
export function posicaoNaDobra(
  elemento: ElementoDoDia,
  semente: Semente,
  t: number,
  caixa: CaixaDoCartao = CAIXA_PADRAO,
): PosicaoNaDobra {
  const [s0, s1, s2, s3] = semente;
  const u = Math.max(t - s3 * ATRASO_MAXIMO_S, 0);
  const vida = Math.min(u / (DOBRA_S - ATRASO_MAXIMO_S), 1);

  if (elemento === 'ar') {
    const o = nascerNaBordaInteira(s0, caixa);
    const th = Math.atan2(o.y, o.x) + u * (6 + 3 * s2);
    const r0 = Math.hypot(o.x, o.y);
    const r = (r0 + 220 * (0.4 + s2) * Math.max(u, 0.0001) ** 1.3) * (1 + 0.12 * Math.sin(th * 3 + u * 9));
    return { x: r * Math.cos(th), y: r * Math.sin(th), origemX: o.x, origemY: o.y, vida };
  }

  const o = nascerNaBordaSuperior(s0, caixa);
  if (elemento === 'fogo') {
    const ang = (s1 - 0.5) * 2 + o.nx * 0.7;
    const vel = 170 + 160 * s2;
    return {
      x: o.x + Math.sin(ang) * vel * u + 14 * Math.sin(u * 9 + s2 * 17) * u,
      y: o.y - (Math.cos(ang) * vel * u + 120 * u * u),
      origemX: o.x,
      origemY: o.y,
      vida,
    };
  }

  if (elemento === 'agua') {
    const ang = (s1 - 0.5) * 1.4 + o.nx * 0.6;
    const vel = 330 + 180 * s2;
    return {
      x: o.x + Math.sin(ang) * vel * u,
      y: o.y - Math.cos(ang) * vel * u + 0.5 * GRAVIDADE_AGUA * u * u,
      origemX: o.x,
      origemY: o.y,
      vida,
    };
  }

  // Terra
  const ang = (s1 - 0.5) * 1.2 + o.nx * 0.9;
  const vel = 230 + 150 * s2;
  const subindo = Math.cos(ang) * vel;
  const lado = Math.sin(ang) * vel;
  const chao = caixa.meiaAltura;
  const tBate = (subindo + Math.sqrt(subindo * subindo - 2 * GRAVIDADE_TERRA * (o.y - chao))) / GRAVIDADE_TERRA;
  if (u < tBate) {
    return {
      x: o.x + lado * u,
      y: o.y - subindo * u + 0.5 * GRAVIDADE_TERRA * u * u,
      origemX: o.x,
      origemY: o.y,
      vida,
    };
  }
  const w = u - tBate;
  const quicaY = -RESTITUICAO_TERRA * (-subindo + GRAVIDADE_TERRA * tBate);
  return {
    x: o.x + lado * tBate + lado * 0.5 * w,
    y: Math.min(chao + quicaY * w + 0.5 * GRAVIDADE_TERRA * w * w, chao),
    origemX: o.x,
    origemY: o.y,
    vida,
  };
}

/** The cubic-bezier of a beat, solved for x: the same curve the CSS uses. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const eixo = (a: number, b: number, s: number) => 3 * a * (1 - s) ** 2 * s + 3 * b * (1 - s) * s ** 2 + s ** 3;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let s = x;
    for (let i = 0; i < 24; i += 1) {
      const atual = eixo(x1, x2, s);
      if (Math.abs(atual - x) < 1e-5) break;
      if (atual < x) lo = s; else hi = s;
      s = (lo + hi) / 2;
    }
    return eixo(y1, y2, s);
  };
}

export const CURVA_PADRAO = cubicBezier(...EASE.standard);
export const CURVA_CONJURE = cubicBezier(...EASE.conjure);

/**
 * How far a leap reaches at `k` (0..1 of its opening beat). Only the conquest
 * is a `conjure` and passes its target; the leap of a day change opens in
 * `reveal` and never goes past 1.
 */
export function alcanceDaDobra(tipo: TipoDeDobra, k: number): number {
  if (tipo === 'conquista') return 1.2 * CURVA_CONJURE(k);
  return 0.6 + 0.4 * CURVA_PADRAO(k);
}

export interface EstadoDoDia {
  readonly dia: string;
  readonly feitos: number;
  readonly total: number;
}

/**
 * True only when the last cycle of the open day was just completed here:
 * same day, at least one cycle, and done went from total - 1 to total. Opening
 * an already finished day, a jump from 0 to the total, or changing day never
 * counts.
 */
export function diaConquistado(anterior: EstadoDoDia | null, atual: EstadoDoDia | null): boolean {
  if (!anterior || !atual) return false;
  if (anterior.dia !== atual.dia) return false;
  if (atual.total <= 0) return false;
  return anterior.feitos === atual.total - 1 && atual.feitos === atual.total;
}
