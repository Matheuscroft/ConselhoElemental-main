/**
 * Scores for the app's sound cues, as plain data. Nothing here touches Web
 * Audio or renders samples: `timbres.ts` / `render.ts` turn a score into
 * samples and `engine.ts` plays them, so the scores can be tested in Node
 * (deterministic, finite, bounded in time and level).
 *
 * Scale: D major pentatonic (D E F# A B). It has no semitone clashes, so any
 * cue can overlap any other without sounding wrong. D4 = 293.66 Hz. Each
 * element owns a degree of that scale as its tonic:
 *   terra = D (degree 0), fogo = F# (2), agua = A (3), ar = B (4).
 *
 * Voices are named timbres (bell, crystal, harp pluck, breath, crackle, drop,
 * thump, marimba, choir ...) synthesized by code. Times are seconds, gains are
 * 0..1 relative inside a cue (the renderer normalizes the whole cue to
 * `pico`). The only "randomness" (harp humanization, crackle positions) comes
 * from fixed seeds, so every score and every rendering is reproducible.
 */

export type ElementoSom = 'fogo' | 'agua' | 'ar' | 'terra';

export type Timbre =
  | 'sino'
  | 'cristal'
  | 'harpa'
  | 'sopro'
  | 'whoosh'
  | 'estalo'
  | 'brasa'
  | 'gota'
  | 'bolha'
  | 'batida'
  | 'marimba'
  | 'cascalho'
  | 'sub'
  | 'coro'
  | 'swell'
  | 'clique';

export interface Voz {
  readonly timbre: Timbre;
  /** Main pitch in Hz (start pitch for sweeps; breath/whoosh: start of the filter sweep). */
  readonly freq: number;
  /** End pitch / end of a sweep in Hz (equals `freq` when there is no sweep). */
  readonly freq2: number;
  /** Seconds after the cue starts. */
  readonly atraso: number;
  /** Seconds the voice rings or lasts, from its own start. */
  readonly dur: number;
  /** 0..1 relative to the other voices of the cue. */
  readonly ganho: number;
  /** -1 (left) .. 1 (right). */
  readonly pan: number;
  /** 0..1: how bright / dense the voice is. */
  readonly brilho: number;
  readonly semente: number;
}

export type Sinal = 'conclusao' | 'nivel' | 'troca' | 'toque' | 'conquista';

export interface Partitura {
  readonly sinal: Sinal;
  /** Stable key that identifies the rendering (cache key). */
  readonly chave: string;
  /** Seconds until everything is silent. */
  readonly duracao: number;
  readonly vozes: readonly Voz[];
  /** Peak the whole rendered cue is normalized to (always <= 0.9). */
  readonly pico: number;
  /** Reverb send 0..1 (the dry path stays at ~0.75). */
  readonly reverb: number;
}

export const ELEMENTOS_SOM: readonly ElementoSom[] = ['fogo', 'agua', 'ar', 'terra'];

const D4 = 293.66;
const ESCALA = [0, 2, 4, 7, 9] as const;
const GRAU_TONICA: Record<ElementoSom, number> = { terra: 0, fogo: 2, agua: 3, ar: 4 };

/** Frequency of a pentatonic degree; 0 is D4, 5 is D5, -5 is D3. */
export function freqGrau(grau: number): number {
  const g = Math.trunc(grau);
  const oitava = Math.floor(g / 5);
  const semitons = ESCALA[((g % 5) + 5) % 5] + 12 * oitava;
  return D4 * 2 ** (semitons / 12);
}

const tonica = (el: ElementoSom, oitavas = 0) => freqGrau(GRAU_TONICA[el] + 5 * oitavas);

const limitar = (x: number, min: number, max: number) =>
  Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min;
const arred = (x: number) => Math.round(x * 1e6) / 1e6;

function hash(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i += 1) h = Math.imul(h ^ texto.charCodeAt(i), 16777619);
  return h >>> 0;
}

function rng(semente: number): () => number {
  let a = semente | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Extra {
  freq2?: number;
  pan?: number;
  brilho?: number;
}

function voz(chave: string, indice: number, timbre: Timbre, freq: number, atraso: number, dur: number, ganho: number, extra: Extra = {}): Voz {
  return {
    timbre,
    freq: arred(freq),
    freq2: arred(extra.freq2 ?? freq),
    atraso: arred(atraso),
    dur: arred(dur),
    ganho: arred(Math.min(1, Math.max(0.01, ganho))),
    pan: extra.pan ?? 0,
    brilho: arred(limitar(extra.brilho ?? 0.6, 0, 1)),
    semente: hash(`${chave}#${indice}`),
  };
}

function partitura(sinal: Sinal, chave: string, vozes: Voz[], pico: number, reverb: number): Partitura {
  const fim = vozes.reduce((max, v) => Math.max(max, v.atraso + v.dur), 0);
  return { sinal, chave, duracao: arred(fim), vozes, pico, reverb };
}

/** Small helper so each score reads as a list of layers. */
function construtor(chave: string) {
  const vozes: Voz[] = [];
  return {
    vozes,
    add(timbre: Timbre, freq: number, atraso: number, dur: number, ganho: number, extra?: Extra) {
      vozes.push(voz(chave, vozes.length, timbre, freq, atraso, dur, ganho, extra));
    },
  };
}

/* ------------------------------------------------------------------ */

/** Intensity is quantized to three steps: 0, 0.5, 1 (also the cache steps). */
function degrauIntensidade(intensidade: number): 0 | 1 | 2 {
  const i = limitar(intensidade, 0, 1);
  return i < 0.34 ? 0 : i < 0.67 ? 1 : 2;
}

/**
 * Short feedback when a task or cycle is completed (0.25 - 0.7 s). Two layers
 * at low intensity, three and four above: intensity adds layers and sparkle
 * (the whole cue is normalized, so it is never "just louder").
 */
export function conclusao(elemento: ElementoSom, intensidade = 0.5): Partitura {
  const d = degrauIntensidade(intensidade);
  const chave = `conclusao:${elemento}:${d}`;
  const b = construtor(chave);
  const brilho = [0.35, 0.65, 1][d];
  const g0 = GRAU_TONICA[elemento];
  const t = tonica(elemento);
  const t1 = tonica(elemento, 1);

  if (elemento === 'fogo') {
    // crackle + warm breath + short bell on F#
    b.add('estalo', 0, 0, 0.3, 0.7, { brilho, pan: -0.2 });
    b.add('whoosh', 220, 0, 0.4, 0.8, { freq2: 700, brilho });
    b.add('sino', t1, 0.02, 0.5, 0.55, { brilho, pan: 0.1 });
    if (d >= 1) b.add('brasa', t, 0.04, 0.45, 0.4, { brilho });
    if (d >= 2) {
      b.add('estalo', 0, 0.12, 0.25, 0.55, { brilho, pan: 0.3 });
      b.add('sino', freqGrau(g0 + 8), 0.11, 0.55, 0.4, { brilho, pan: -0.25 });
    }
  } else if (elemento === 'agua') {
    // drop + crystal, then bubbles and a crystal glint
    b.add('gota', t1, 0, 0.24, 0.9, { brilho });
    b.add('cristal', t1, 0.06, 0.55, 0.6, { brilho, pan: 0.15 });
    if (d >= 1) b.add('bolha', freqGrau(g0 + 7), 0.14, 0.13, 0.5, { brilho, pan: -0.3 });
    if (d >= 2) {
      b.add('cristal', tonica(elemento, 2), 0.16, 0.45, 0.35, { brilho, pan: 0.35 });
      b.add('gota', freqGrau(g0 + 7), 0.25, 0.22, 0.55, { brilho, pan: -0.15 });
    }
  } else if (elemento === 'ar') {
    // ascending breath + wind-chime bells
    b.add('sopro', 500, 0, 0.46, 0.9, { freq2: 3200, brilho });
    b.add('cristal', t1, 0.14, 0.52, 0.55, { brilho, pan: 0.3 });
    if (d >= 1) b.add('cristal', freqGrau(g0 + 7), 0.22, 0.45, 0.4, { brilho, pan: -0.3 });
    if (d >= 2) {
      b.add('sopro', 900, 0.08, 0.4, 0.45, { freq2: 4500, brilho, pan: 0.25 });
      b.add('sino', freqGrau(g0 + 10), 0.28, 0.4, 0.3, { brilho, pan: 0.1 });
    }
  } else {
    // earth thump + marimba, then gravel
    b.add('batida', 62, 0, 0.42, 1, { brilho });
    b.add('marimba', t, 0.01, 0.46, 0.7, { brilho, pan: 0.15 });
    if (d >= 1) b.add('cascalho', 0, 0.03, 0.22, 0.45, { brilho, pan: -0.2 });
    if (d >= 2) {
      b.add('batida', 55, 0.13, 0.36, 0.7, { brilho });
      b.add('marimba', freqGrau(g0 + 2), 0.13, 0.45, 0.55, { brilho, pan: -0.25 });
    }
  }
  return partitura('conclusao', chave, b.vozes, 0.5, 0.22);
}

/**
 * Fanfare for reaching a level.
 * Level 2 "Fluxo": rising four-note harp arpeggio + a bell on the tonic, long
 * reverb tail (about 2 s). Level 3+ "Dominio": open chord in bells (tonic,
 * fifth degree, octave) + wide harp arpeggio + soft sub-bass + crystal
 * shimmer (about 2.7 s). Level 5+ adds one more glint.
 */
export function nivel(elemento: ElementoSom, nivelAlcancado = 2): Partitura {
  const n = Math.round(limitar(nivelAlcancado, 2, 10));
  const faixa = n <= 2 ? 2 : n < 5 ? 3 : 5;
  const chave = `nivel:${elemento}:${faixa}`;
  const b = construtor(chave);
  const g0 = GRAU_TONICA[elemento];
  const humano = rng(hash(chave));
  const pan = (j: number) => [-0.35, -0.1, 0.15, 0.35, 0.05][j % 5];

  if (faixa === 2) {
    for (let j = 0; j < 4; j += 1) {
      const atraso = 0.02 + j * 0.12 + (humano() - 0.5) * 0.016;
      b.add('harpa', freqGrau(g0 + j), Math.max(0, atraso), 1.1, 0.7 + 0.1 * j + humano() * 0.08, { brilho: 0.6, pan: pan(j) });
    }
    b.add('sino', tonica(elemento, 1), 0.44, 1.5, 0.75, { brilho: 0.6 });
    return partitura('nivel', chave, b.vozes, 0.6, 0.35);
  }

  // Dominio: open chord of bells
  b.add('sino', freqGrau(g0), 0, 2.4, 0.8, { brilho: 0.7, pan: -0.2 });
  b.add('sino', freqGrau(g0 + 3), 0.08, 2.3, 0.65, { brilho: 0.7, pan: 0.2 });
  b.add('sino', freqGrau(g0 + 5), 0.16, 2.2, 0.55, { brilho: 0.7, pan: 0 });
  const arpejo = [0, 3, 5, 7, 10];
  arpejo.forEach((grau, j) => {
    const atraso = 0.05 + j * 0.14 + (humano() - 0.5) * 0.016;
    b.add('harpa', freqGrau(g0 + grau), Math.max(0, atraso), 1.6, 0.6 + humano() * 0.2, { brilho: 0.65, pan: pan(j) });
  });
  b.add('sub', freqGrau(g0 - 5), 0, 2.5, 0.5, { brilho: 0.3 });
  b.add('cristal', freqGrau(g0 + 10), 0.5, 1.9, 0.4, { brilho: 0.8, pan: 0.3 });
  b.add('cristal', freqGrau(g0 + 8), 0.75, 1.9, 0.3, { brilho: 0.8, pan: -0.3 });
  if (faixa >= 5) b.add('cristal', freqGrau(g0 + 12), 1.0, 1.65, 0.28, { brilho: 0.9, pan: 0.1 });
  return partitura('nivel', chave, b.vozes, 0.65, 0.4);
}

/** About one second of swell that crosses one element's timbre into another's. */
export function trocaDeElemento(de: ElementoSom, para: ElementoSom): Partitura {
  const chave = `troca:${de}:${para}`;
  const b = construtor(chave);
  const fa = tonica(de);
  const fb = tonica(para);
  b.add('swell', fa, 0, 1, 0.8, { freq2: fb, brilho: 0.5 });
  b.add('sopro', 400, 0, 1, 0.4, { freq2: 2600, brilho: 0.5, pan: 0.1 });
  b.add('sino', tonica(de, 1), 0, 0.6, 0.4, { brilho: 0.5, pan: -0.3 });
  b.add('sino', tonica(para, 1), 0.5, 0.5, 0.65, { brilho: 0.7, pan: 0.3 });
  return partitura('troca', chave, b.vozes, 0.5, 0.3);
}

/** Soft UI click: a tiny crystal tick, body at most 80 ms, very low. */
export function toque(): Partitura {
  const b = construtor('toque');
  b.add('clique', 2600, 0, 0.07, 1, { brilho: 0.5 });
  return partitura('toque', 'toque', b.vozes, 0.16, 0.05);
}

/** The big one for milestones (about 3.3 s): harp + bells + soft synthetic choir. */
export function conquista(): Partitura {
  const chave = 'conquista';
  const b = construtor(chave);
  const humano = rng(hash(chave));
  // rising harp arpeggio, slightly humanized
  for (let j = 0; j < 8; j += 1) {
    const atraso = 0.02 + j * 0.11 + (humano() - 0.5) * 0.016;
    b.add('harpa', freqGrau(j + 1), Math.max(0, atraso), 1.2, 0.55 + 0.05 * j + humano() * 0.1, { brilho: 0.7, pan: ((j % 3) - 1) * 0.3 });
  }
  // bells arrive on the chord
  const inicio = 0.9;
  b.add('sino', freqGrau(5), inicio, 2.3, 0.75, { brilho: 0.8, pan: -0.25 });
  b.add('sino', freqGrau(8), inicio + 0.07, 2.2, 0.55, { brilho: 0.8, pan: 0.25 });
  b.add('sino', freqGrau(7), inicio + 0.14, 2.1, 0.5, { brilho: 0.8, pan: 0 });
  // choir, a slow vibrato pad on D - A - D
  for (const [grau, ganho, pan] of [[0, 0.7, -0.2], [3, 0.55, 0.2], [5, 0.5, 0]] as const) {
    b.add('coro', freqGrau(grau), 0.8, 2.4, ganho, { brilho: 0.5, pan });
  }
  b.add('sub', freqGrau(-5), 0, 2.6, 0.5, { brilho: 0.3 });
  b.add('cristal', freqGrau(10), 1.4, 1.9, 0.35, { brilho: 0.9, pan: 0.35 });
  b.add('cristal', freqGrau(12), 1.7, 1.6, 0.25, { brilho: 0.9, pan: -0.35 });
  return partitura('conquista', chave, b.vozes, 0.65, 0.42);
}
