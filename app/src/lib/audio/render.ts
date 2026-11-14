import type { Partitura } from './cues';
import { renderizarVoz } from './timbres';

/**
 * Mixes every voice of a score into one stereo buffer (equal-power pan) and
 * normalizes the whole cue to the score's target peak. Pure: same score and
 * sample rate give the same samples, no Web Audio involved.
 */

export interface Renderizado {
  readonly esquerdo: Float32Array;
  readonly direito: Float32Array;
}

export function renderizarPartitura(sr: number, p: Partitura): Renderizado {
  const n = Math.max(1, Math.ceil(p.duracao * sr));
  const esquerdo = new Float32Array(n);
  const direito = new Float32Array(n);
  for (const v of p.vozes) {
    const mono = renderizarVoz(sr, v);
    const inicio = Math.round(v.atraso * sr);
    const ang = ((Math.max(-1, Math.min(1, v.pan)) + 1) * Math.PI) / 4;
    const gl = Math.cos(ang) * v.ganho;
    const gr = Math.sin(ang) * v.ganho;
    const fim = Math.min(n, inicio + mono.length);
    for (let i = inicio; i < fim; i += 1) {
      const s = mono[i - inicio];
      esquerdo[i] += s * gl;
      direito[i] += s * gr;
    }
  }
  let pico = 0;
  for (let i = 0; i < n; i += 1) {
    pico = Math.max(pico, Math.abs(esquerdo[i]), Math.abs(direito[i]));
  }
  const alvo = Math.min(0.9, p.pico);
  const k = pico > 0 ? alvo / pico : 0;
  // 8 ms final fade guarantees the buffer ends at zero
  const nf = Math.min(n, Math.round(0.008 * sr));
  for (let i = 0; i < n; i += 1) {
    const f = i >= n - nf ? (n - 1 - i) / nf : 1;
    esquerdo[i] *= k * f;
    direito[i] *= k * f;
  }
  return { esquerdo, direito };
}
