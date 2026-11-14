/**
 * Scores for the app's sound cues, as plain data. Nothing here touches Web
 * Audio: `engine.ts` plays what these functions describe, so the scores can be
 * tested in Node (deterministic, finite, bounded in time and level).
 *
 * Scale: D major pentatonic (D E F# A B). It has no semitone clashes, so any
 * cue can overlap any other without sounding wrong. D4 = 293.66 Hz. Each
 * element owns a degree of that scale as its tonic:
 *   terra = D (degree 0, the lowest and heaviest), agua = A (3),
 *   fogo = F# (2), ar = B (4).
 *
 * Timbres: fogo = filtered noise crackle + warm rising sawtooth;
 * agua = glass drop (sine falling in pitch) + bubbles; ar = band-pass breath
 * sweeping up + high partials; terra = low sine thump + triangle wood.
 *
 * Times are in seconds, gains are 0..1 per voice. There is no randomness.
 */

export type ElementoSom = 'fogo' | 'agua' | 'ar' | 'terra';
export type Fonte = 'sine' | 'triangle' | 'sawtooth' | 'square' | 'ruido-branco' | 'ruido-rosa';

export interface Envelope {
  readonly ataque: number;
  readonly decaimento: number;
  /** Level 0..1 of the peak that is held after the decay. */
  readonly sustain: number;
  /** Seconds the sustain level is held. */
  readonly sustentacao: number;
  readonly liberacao: number;
}

export interface FiltroVoz {
  readonly tipo: 'lowpass' | 'highpass' | 'bandpass';
  /** Start and end cutoff in Hz; swept exponentially across the voice. */
  readonly freq: readonly [number, number];
  readonly q: number;
}

export interface Voz {
  readonly fonte: Fonte;
  /** Start and end pitch in Hz, swept exponentially. Ignored for noise. */
  readonly freq: readonly [number, number];
  /** Seconds after the cue starts. */
  readonly atraso: number;
  readonly adsr: Envelope;
  readonly filtro?: FiltroVoz;
  readonly ganho: number;
  /** -1 (left) .. 1 (right). */
  readonly pan: number;
  /** Routed also to the echo tail. */
  readonly eco?: boolean;
}

export interface EcoCauda {
  /** Delay between repeats, seconds. */
  readonly atraso: number;
  readonly realimentacao: number;
  readonly mix: number;
  /** Seconds the tail rings after the last voice ends. */
  readonly cauda: number;
}

export type Sinal = 'conclusao' | 'nivel' | 'troca' | 'toque' | 'conquista';

export interface Partitura {
  readonly sinal: Sinal;
  /** Seconds until everything, tail included, is silent. */
  readonly duracao: number;
  readonly vozes: readonly Voz[];
  readonly eco?: EcoCauda;
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

function env(ataque: number, decaimento: number, sustain: number, sustentacao: number, liberacao: number): Envelope {
  return { ataque, decaimento, sustain, sustentacao, liberacao };
}

function voz(
  fonte: Fonte,
  f0: number,
  f1: number,
  atraso: number,
  adsr: Envelope,
  ganho: number,
  extra: { filtro?: FiltroVoz; pan?: number; eco?: boolean } = {},
): Voz {
  return {
    fonte,
    freq: [arred(f0), arred(f1)],
    atraso,
    adsr,
    ganho: arred(Math.min(1, ganho)),
    pan: extra.pan ?? 0,
    filtro: extra.filtro,
    eco: extra.eco,
  };
}

const filtro = (tipo: FiltroVoz['tipo'], a: number, b: number, q: number): FiltroVoz => ({
  tipo,
  freq: [arred(a), arred(b)],
  q,
});

export function duracaoVoz(v: Voz): number {
  const e = v.adsr;
  return v.atraso + e.ataque + e.decaimento + e.sustentacao + e.liberacao;
}

function partitura(sinal: Sinal, vozes: Voz[], eco?: EcoCauda): Partitura {
  const fim = vozes.reduce((max, v) => Math.max(max, duracaoVoz(v)), 0);
  return { sinal, duracao: arred(fim + (eco?.cauda ?? 0)), vozes, eco };
}

/* ------------------------------------------------------------------ */

/** Short feedback when a task or cycle is completed (0.25 - 0.7 s). */
export function conclusao(elemento: ElementoSom, intensidade = 0.5): Partitura {
  const i = limitar(intensidade, 0, 1);
  const k = 0.55 + 0.45 * i; // overall level, monotonic in intensity
  const camada1 = i >= 0.34;
  const camada2 = i >= 0.67;
  const t = tonica(elemento);
  const v: Voz[] = [];

  if (elemento === 'fogo') {
    v.push(voz('ruido-branco', 0, 0, 0, env(0.002, 0.07, 0, 0, 0.04), 0.3 * k, { filtro: filtro('bandpass', 3200, 1400, 1.2), pan: -0.15 }));
    v.push(voz('sawtooth', t / 2, t, 0, env(0.01, 0.2, 0.15, 0.1, 0.18), 0.2 * k, { filtro: filtro('lowpass', 900, 2600, 1.5) }));
    if (camada1) v.push(voz('sawtooth', t, t * 1.5, 0.03, env(0.01, 0.18, 0.1, 0.05, 0.15), 0.12 * k, { filtro: filtro('lowpass', 1200, 3200, 1), pan: 0.2 }));
    if (camada2) {
      v.push(voz('ruido-branco', 0, 0, 0.1, env(0.002, 0.05, 0, 0, 0.03), 0.2 * k, { filtro: filtro('highpass', 2500, 4000, 0.7), pan: 0.3 }));
      v.push(voz('ruido-branco', 0, 0, 0.19, env(0.002, 0.05, 0, 0, 0.03), 0.16 * k, { filtro: filtro('highpass', 3000, 5000, 0.7), pan: -0.3 }));
    }
  } else if (elemento === 'agua') {
    v.push(voz('sine', t * 2, t, 0, env(0.003, 0.16, 0.05, 0.04, 0.2), 0.3 * k, { filtro: filtro('lowpass', 3200, 700, 2), eco: true }));
    v.push(voz('sine', t * 3, t * 4, 0.09, env(0.003, 0.06, 0, 0, 0.05), 0.1 * k, { pan: 0.3 }));
    if (camada1) v.push(voz('sine', t * 2.5, t * 4, 0.16, env(0.003, 0.07, 0, 0, 0.06), 0.1 * k, { pan: -0.3 }));
    if (camada2) {
      v.push(voz('sine', t * 4, t * 6, 0.24, env(0.003, 0.06, 0, 0, 0.06), 0.08 * k, { pan: 0.4 }));
      v.push(voz('triangle', t * 3, t * 1.5, 0.05, env(0.005, 0.2, 0, 0, 0.15), 0.1 * k, { filtro: filtro('lowpass', 2000, 500, 1) }));
    }
  } else if (elemento === 'ar') {
    v.push(voz('ruido-rosa', 0, 0, 0, env(0.14, 0.12, 0.2, 0.05, 0.2), 0.34 * k, { filtro: filtro('bandpass', 400, 3200, 4) }));
    v.push(voz('sine', t * 4, t * 4, 0.12, env(0.02, 0.15, 0.1, 0.05, 0.2), 0.1 * k, { pan: 0.35, eco: true }));
    if (camada1) v.push(voz('sine', t * 6, t * 6, 0.18, env(0.02, 0.12, 0.1, 0.03, 0.18), 0.07 * k, { pan: -0.35 }));
    if (camada2) {
      v.push(voz('triangle', t * 2, t * 3, 0.05, env(0.05, 0.15, 0.1, 0.05, 0.18), 0.08 * k, { filtro: filtro('lowpass', 2500, 5000, 0.8) }));
      v.push(voz('ruido-rosa', 0, 0, 0.1, env(0.08, 0.1, 0, 0, 0.15), 0.12 * k, { filtro: filtro('highpass', 3000, 6000, 1) }));
    }
  } else {
    v.push(voz('sine', 90, 55, 0, env(0.003, 0.26, 0.2, 0.08, 0.15), 0.5 * k, { filtro: filtro('lowpass', 400, 160, 0.7) }));
    v.push(voz('triangle', t, t * 0.8, 0, env(0.002, 0.07, 0, 0, 0.05), 0.2 * k, { filtro: filtro('bandpass', 900, 600, 2), pan: 0.15 }));
    if (camada1) v.push(voz('ruido-rosa', 0, 0, 0, env(0.002, 0.05, 0, 0, 0.04), 0.14 * k, { filtro: filtro('lowpass', 500, 200, 0.7) }));
    if (camada2) {
      v.push(voz('sine', 75, 50, 0.13, env(0.003, 0.2, 0.1, 0.05, 0.12), 0.35 * k, { filtro: filtro('lowpass', 350, 140, 0.7) }));
      v.push(voz('triangle', t * 1.5, t * 1.2, 0.13, env(0.002, 0.06, 0, 0, 0.05), 0.12 * k, { filtro: filtro('bandpass', 1000, 700, 2), pan: -0.2 }));
    }
  }
  return partitura('conclusao', v);
}

function timbreNota(el: ElementoSom): Fonte {
  return el === 'fogo' ? 'sawtooth' : el === 'agua' ? 'sine' : 'triangle';
}

/** Fanfare for reaching a level (1.2 - 2.5 s); more layers with the level. */
export function nivel(elemento: ElementoSom, nivelAlcancado = 2): Partitura {
  const n = Math.round(limitar(nivelAlcancado, 2, 10));
  const notas = Math.min(4 + (n - 2), 8);
  const passo = 0.09;
  const base = tonica(elemento);
  const fonte = timbreNota(elemento);
  const brilhante = elemento === 'fogo' ? filtro('lowpass', 1500, 4500, 1) : undefined;
  const v: Voz[] = [];

  for (let j = 0; j < notas; j += 1) {
    const ultima = j === notas - 1;
    const f = freqGrau(GRAU_TONICA[elemento] + j);
    v.push(
      voz(fonte, f, f, j * passo, env(0.008, 0.12, ultima ? 0.5 : 0.25, ultima ? 0.55 : 0.05, ultima ? 0.45 : 0.2), 0.16, {
        filtro: brilhante,
        pan: ((j % 3) - 1) * 0.25,
        eco: true,
      }),
    );
  }
  const topo = freqGrau(GRAU_TONICA[elemento] + notas - 1);
  v.push(voz('sine', topo * 2, topo * 2, (notas - 1) * passo, env(0.01, 0.15, 0.2, 0.3, 0.4), 0.06, { pan: 0.3, eco: true }));
  v.push(voz('sine', base / 4, base / 4, 0, env(0.03, 0.2, 0.6, 0.6, 0.4), 0.3));
  if (n >= 3) v.push(voz('ruido-rosa', 0, 0, 0, env(0.25, 0.2, 0.1, 0.1, 0.3), 0.1, { filtro: filtro('bandpass', 500, 4000, 2), eco: true }));
  if (n >= 4) v.push(voz('triangle', base * 2, base * 2, notas * passo * 0.5, env(0.02, 0.2, 0.3, 0.4, 0.4), 0.08, { pan: -0.3, eco: true }));
  if (n >= 5) v.push(voz('sine', base * 3, base * 3, notas * passo * 0.7, env(0.02, 0.2, 0.3, 0.4, 0.4), 0.06, { pan: 0.4, eco: true }));
  if (n >= 6) v.push(voz('sine', base / 2, base / 2, 0.05, env(0.03, 0.2, 0.5, 0.5, 0.4), 0.14));

  return partitura('nivel', v, { atraso: 0.17, realimentacao: 0.4, mix: 0.3, cauda: 0.6 });
}

/** One-second swell that crosses one element's timbre into another's. */
export function trocaDeElemento(de: ElementoSom, para: ElementoSom): Partitura {
  const fa = tonica(de);
  const fb = tonica(para);
  const v: Voz[] = [
    voz(timbreNota(de), fa, fb, 0, env(0.05, 0.25, 0.4, 0.2, 0.4), 0.18, { filtro: filtro('lowpass', 3000, 400, 1), pan: -0.2 }),
    voz(timbreNota(para), fa, fb, 0.3, env(0.3, 0.2, 0.6, 0.1, 0.1), 0.2, { filtro: filtro('lowpass', 400, 3000, 1), pan: 0.2 }),
    voz('ruido-rosa', 0, 0, 0, env(0.4, 0.2, 0.1, 0.1, 0.3), 0.1, { filtro: filtro('bandpass', 300, 3000, 3) }),
    voz('sine', fa / 2, fb / 2, 0, env(0.2, 0.2, 0.5, 0.3, 0.3), 0.18),
  ];
  return partitura('troca', v);
}

/** Soft UI click (at most 80 ms). */
export function toque(): Partitura {
  return partitura('toque', [
    voz('sine', 1320, 880, 0, env(0.002, 0.03, 0, 0, 0.02), 0.12, { filtro: filtro('lowpass', 4000, 2000, 0.7) }),
  ]);
}

/** The big one for milestones (about 3 s): rising arpeggio, chord, shimmer. */
export function conquista(): Partitura {
  const v: Voz[] = [];
  const passo = 0.1;
  for (let j = 0; j < 8; j += 1) {
    const f = freqGrau(j + 2);
    v.push(voz('triangle', f, f, j * passo, env(0.008, 0.12, 0.25, 0.05, 0.25), 0.14, { pan: ((j % 3) - 1) * 0.3, eco: true }));
    v.push(voz('sine', f * 2, f * 2, j * passo, env(0.008, 0.1, 0.1, 0.02, 0.2), 0.05, { pan: ((j % 3) - 1) * -0.3, eco: true }));
  }
  const inicioAcorde = 0.85;
  for (const [grau, g] of [[5, 0.14], [8, 0.1], [10, 0.1], [12, 0.07]] as const) {
    const f = freqGrau(grau);
    v.push(voz('triangle', f, f, inicioAcorde, env(0.05, 0.3, 0.5, 0.9, 0.7), g, { pan: grau % 2 ? 0.3 : -0.3, eco: true }));
  }
  v.push(voz('sine', freqGrau(-10), freqGrau(-10), 0, env(0.05, 0.3, 0.6, 1.5, 0.8), 0.32));
  v.push(voz('sine', freqGrau(-5), freqGrau(-5), inicioAcorde, env(0.05, 0.3, 0.5, 0.9, 0.7), 0.18));
  v.push(voz('ruido-rosa', 0, 0, 0, env(0.6, 0.3, 0.15, 0.6, 0.6), 0.1, { filtro: filtro('bandpass', 500, 6000, 2.5), eco: true }));
  v.push(voz('sine', freqGrau(17), freqGrau(17), inicioAcorde + 0.1, env(0.05, 0.3, 0.2, 0.7, 0.5), 0.04, { pan: 0.5, eco: true }));
  return partitura('conquista', v, { atraso: 0.21, realimentacao: 0.45, mix: 0.3, cauda: 0.3 });
}
