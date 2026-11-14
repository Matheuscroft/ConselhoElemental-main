import type { Voz } from './cues';

/**
 * Pure sample synthesis: each function takes a sample rate and a voice and
 * returns a mono Float32Array normalized to a peak of 1 (the mixer in
 * `render.ts` scales it). No Web Audio, no Math.random: noise comes from a
 * seeded generator, so a rendering is reproducible and testable in Node.
 *
 * Recipes: bell = inharmonic additive partials (1, 2.76, 5.40, 8.93) with
 * faster decay up high; crystal = harmonic-ish partials + soft FM glass;
 * harp = Karplus-Strong string with a fractional-delay tuning allpass;
 * breath = pink noise through a sweeping state-variable band-pass; fire =
 * seeded crackles + brown-noise whoosh + tremolo ember; water = pitch-falling
 * drop and pitch-rising bubble; earth = pitch-falling sine thump with soft
 * tanh saturation + marimba partials (1, 3.93, 9.2) + gravel grains.
 * Everything above ~6 kHz is attenuated and above ~9 kHz dropped, to stay soft.
 */

const DOIS_PI = Math.PI * 2;

export function criarRng(semente: number): () => number {
  let a = semente | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const limitar = (x: number, min: number, max: number) => (Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : min);

const freqSegura = (f: number, sr: number) => limitar(f, 20, sr * 0.4);

/** Gentle ceiling on bright partials. */
const suavidade = (f: number) => (f < 6000 ? 1 : f < 9000 ? 0.35 : 0);

interface Parcial {
  f: number;
  a: number;
  /** Decay time constant in seconds. */
  tau: number;
}

function aditivo(sr: number, n: number, partes: Parcial[], ataque: number): Float32Array {
  const out = new Float32Array(n);
  const na = Math.max(1, Math.round(ataque * sr));
  for (const p of partes) {
    const amp0 = p.a * suavidade(p.f);
    if (amp0 <= 0 || p.f >= sr * 0.45 || p.tau <= 0) continue;
    const w = (DOIS_PI * p.f) / sr;
    const dec = Math.exp(-1 / (p.tau * sr));
    let amp = amp0;
    let ph = 0;
    for (let i = 0; i < n; i += 1) {
      if (amp < 1e-4) break;
      out[i] += Math.sin(ph) * amp * (i < na ? i / na : 1);
      ph += w;
      amp *= dec;
    }
  }
  return out;
}

/** Short filtered noise tick that gives bells and marimbas their "strike". */
function golpe(sr: number, out: Float32Array, rnd: () => number, ganho: number, tau: number) {
  const dec = Math.exp(-1 / (tau * sr));
  let amp = ganho;
  let lp = 0;
  const n = Math.min(out.length, Math.round(tau * 8 * sr));
  for (let i = 0; i < n; i += 1) {
    lp += 0.3 * ((rnd() * 2 - 1) - lp);
    out[i] += lp * amp;
    amp *= dec;
  }
}

function normalizar(buf: Float32Array): Float32Array {
  let pico = 0;
  for (let i = 0; i < buf.length; i += 1) {
    const a = Math.abs(buf[i]);
    if (a > pico) pico = a;
  }
  if (pico > 0) {
    const k = 1 / pico;
    for (let i = 0; i < buf.length; i += 1) buf[i] *= k;
  }
  return buf;
}

/** Quick fade in/out so a voice never clicks at its ends. */
function bordas(sr: number, buf: Float32Array, entrada = 0.0007, saida = 0.03) {
  const ni = Math.min(buf.length, Math.round(entrada * sr));
  const ns = Math.min(buf.length, Math.round(saida * sr));
  for (let i = 0; i < ni; i += 1) buf[i] *= i / ni;
  for (let i = 0; i < ns; i += 1) buf[buf.length - 1 - i] *= i / ns;
}

/* ---------------- bells and crystal ---------------- */

function sino(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const f = freqSegura(v.freq, sr);
  const tau = v.dur / 5;
  const alto = 0.35 + 0.65 * v.brilho;
  const razoes = [1, 2.76, 5.4, 8.93];
  const amps = [1, 0.55, 0.28, 0.12];
  const partes: Parcial[] = [{ f: f * 0.5, a: 0.3, tau: tau * 1.2 }];
  razoes.forEach((r, k) => partes.push({ f: f * r, a: amps[k] * (k === 0 ? 1 : alto), tau: tau / (1 + 0.7 * k) }));
  const out = aditivo(sr, n, partes, 0.002);
  golpe(sr, out, rnd, 0.12 * alto, 0.003);
  return out;
}

function cristal(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const f = freqSegura(v.freq, sr);
  const tau = v.dur / 4.5;
  const alto = 0.35 + 0.65 * v.brilho;
  const razoes = [1, 2, 3, 4.2, 5.4];
  const amps = [1, 0.5, 0.33, 0.2, 0.12];
  const partes: Parcial[] = razoes.map((r, k) => ({ f: f * r, a: amps[k] * (k === 0 ? 1 : alto), tau: tau / (1 + 0.6 * k) }));
  const out = aditivo(sr, n, partes, 0.0015);
  // soft FM glass: modulator 1.4 x carrier, index falling quickly
  const wc = (DOIS_PI * f) / sr;
  const wm = wc * 1.4;
  const decIndice = Math.exp(-1 / (0.05 * sr));
  const decAmp = Math.exp(-1 / (tau * sr));
  let indice = 2.2 * alto;
  let amp = 0.3;
  let pc = 0;
  let pm = 0;
  for (let i = 0; i < n && amp > 1e-4; i += 1) {
    out[i] += Math.sin(pc + indice * Math.sin(pm)) * amp * Math.min(1, i / (0.0015 * sr));
    pc += wc;
    pm += wm;
    indice *= decIndice;
    amp *= decAmp;
  }
  golpe(sr, out, rnd, 0.06 * alto, 0.002);
  return out;
}

function clique(sr: number, n: number, v: Voz): Float32Array {
  const f = freqSegura(v.freq, sr);
  const partes: Parcial[] = [
    { f, a: 1, tau: 0.012 },
    { f: f * 1.5, a: 0.4, tau: 0.008 },
    { f: f * 2.4, a: 0.2, tau: 0.005 },
  ];
  return aditivo(sr, n, partes, 0.0008);
}

/* ---------------- harp: Karplus-Strong ---------------- */

function harpa(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const f = freqSegura(v.freq, sr);
  const D = sr / f - 0.5;
  const N = Math.max(2, Math.floor(D - 0.5));
  const d = D - N; // 0.5 .. 1.5 samples of fractional delay, done by an allpass
  const c = (1 - d) / (1 + d);
  const linha = new Float32Array(N);
  // excitation: low-passed noise, brighter with `brilho`, zero mean
  const p = 0.65 - 0.5 * v.brilho;
  let lp = 0;
  let media = 0;
  for (let i = 0; i < N; i += 1) {
    lp = (1 - p) * (rnd() * 2 - 1) + p * lp;
    linha[i] = lp;
    media += lp;
  }
  media /= N;
  for (let i = 0; i < N; i += 1) linha[i] -= media;
  // loop gain so the string falls about 60 dB over 0.8 x dur (damping also rises with pitch)
  const t60 = Math.max(0.2, v.dur * 0.8);
  const g = Math.min(0.9995, 10 ** (-3 / (t60 * f)));
  const out = new Float32Array(n);
  let idx = 0;
  let anterior = 0;
  let apx = 0;
  let apy = 0;
  for (let i = 0; i < n; i += 1) {
    const saiu = linha[idx];
    out[i] = saiu;
    const media2 = 0.5 * (saiu + anterior);
    anterior = saiu;
    const ap = c * media2 + apx - c * apy;
    apx = media2;
    apy = ap;
    linha[idx] = g * ap;
    idx += 1;
    if (idx >= N) idx = 0;
  }
  return out;
}

/* ---------------- breath, whoosh, fire ---------------- */

function ruidoRosa(rnd: () => number): () => number {
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  return () => {
    const x = rnd() * 2 - 1;
    b0 = 0.99765 * b0 + x * 0.099046;
    b1 = 0.963 * b1 + x * 0.2965164;
    b2 = 0.57 * b2 + x * 1.0526913;
    return b0 + b1 + b2 + x * 0.1848;
  };
}

/** Swell shape: rises to a peak at `pico` (0..1 of the duration) then decays softly. */
function envSopro(x: number, pico: number): number {
  return x < pico ? (x / pico) ** 1.6 : Math.exp(-((x - pico) / (1 - pico)) * 4);
}

function sopro(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const rosa = ruidoRosa(rnd);
  const f1 = freqSegura(v.freq, sr);
  const f2 = freqSegura(v.freq2, sr);
  const razao = (f2 / f1) ** (1 / Math.max(1, n));
  const amortecimento = 1 / 3.5;
  const teto = sr / 6.5;
  let fc = f1;
  let low = 0;
  let band = 0;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const f = 2 * Math.sin((Math.PI * Math.min(fc, teto)) / sr);
    const x = rosa();
    const high = x - low - amortecimento * band;
    band += f * high;
    low += f * band;
    out[i] = band * envSopro(i / n, 0.45);
    fc *= razao;
  }
  return out;
}

function whoosh(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const f1 = freqSegura(v.freq, sr);
  const f2 = freqSegura(v.freq2, sr);
  const razao = (f2 / f1) ** (1 / Math.max(1, n));
  let marrom = 0;
  let y1 = 0;
  let y2 = 0;
  let fc = f1;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    marrom = (marrom + 0.02 * (rnd() * 2 - 1)) / 1.02;
    const a = 1 - Math.exp((-DOIS_PI * fc) / sr);
    y1 += a * (marrom - y1);
    y2 += a * (y1 - y2);
    out[i] = y2 * envSopro(i / n, 0.3);
    fc *= razao;
  }
  return out;
}

function estalo(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const out = new Float32Array(n);
  const quantidade = 3 + Math.round(5 * v.brilho);
  for (let k = 0; k < quantidade; k += 1) {
    const inicio = Math.floor(n * 0.75 * rnd() ** 1.5);
    const amp = k === 0 ? 1 : 0.3 + 0.6 * rnd();
    const tau = 0.0015 + 0.003 * rnd();
    const dec = Math.exp(-1 / (tau * sr));
    let a = amp;
    let anterior = 0;
    let lp = 0;
    const comprimento = Math.round(tau * 7 * sr);
    for (let i = 0; i < comprimento && inicio + i < n; i += 1) {
      const x = (rnd() * 2 - 1) * a;
      const agudo = x - anterior; // first difference: crisp but not harsh
      anterior = x;
      lp += 0.4 * (agudo - lp);
      out[inicio + i] += lp;
      a *= dec;
    }
  }
  return out;
}

function brasa(sr: number, n: number, v: Voz): Float32Array {
  const f = freqSegura(v.freq, sr);
  const tau = v.dur / 3.5;
  const partes: Parcial[] = [];
  for (let k = 1; k <= 6; k += 1) partes.push({ f: f * k, a: k ** -1.4, tau });
  const out = aditivo(sr, n, partes, 0.025);
  const w = (DOIS_PI * 5) / sr;
  for (let i = 0; i < n; i += 1) out[i] *= 1 + 0.25 * Math.sin(w * i);
  return out;
}

/* ---------------- water ---------------- */

/**
 * A water drop: the pitch RISES fast and lands on the note (that rising "bloop" is what
 * the ear reads as water; a falling pitch reads as a laser). A soft resonance keeps
 * ringing on the landing note, and a tiny filtered click opens it.
 */
function gota(sr: number, n: number, v: Voz): Float32Array {
  const f1 = freqSegura(v.freq, sr);
  const f0 = freqSegura(f1 * 0.55, sr);
  const tauP = 0.022;
  const decA = Math.exp(-1 / ((v.dur / 4) * sr));
  const decR = Math.exp(-1 / ((v.dur / 3) * sr));
  const wr = (DOIS_PI * f1) / sr;
  let ph = 0;
  let pr = 0;
  let a = 1;
  let r = 0;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const sobe = 1 - Math.exp(-i / (tauP * sr));
    const f = f0 + (f1 - f0) * sobe;
    ph += (DOIS_PI * f) / sr;
    r = Math.min(0.45, r + (i < tauP * 3 * sr ? 0.45 / (tauP * 3 * sr) : 0));
    const ataque = Math.min(1, i / (0.0012 * sr));
    out[i] = (Math.sin(ph) * a + 0.12 * Math.sin(2 * ph) * a * a + Math.sin(pr) * r * (i > tauP * sr ? 1 : 0.3)) * ataque;
    pr += wr;
    a *= decA;
    r *= decR;
  }
  return out;
}

/** A small bubble: a short, quiet rise that lands on the note. */
function bolha(sr: number, n: number, v: Voz): Float32Array {
  const f = freqSegura(v.freq, sr);
  const dec = Math.exp(-1 / ((v.dur / 4) * sr));
  let ph = 0;
  let a = 1;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    ph += (DOIS_PI * f * (0.7 + 0.3 * (1 - Math.exp(-i / (0.014 * sr))))) / sr;
    out[i] = Math.sin(ph) * a * Math.min(1, i / (0.002 * sr));
    a *= dec;
  }
  return out;
}

/* ---------------- earth ---------------- */

function batida(sr: number, n: number, v: Voz): Float32Array {
  const f1 = freqSegura(v.freq, sr);
  const f0 = f1 * 1.7;
  const dec = Math.exp(-1 / ((v.dur / 5) * sr));
  let ph = 0;
  let a = 1;
  const norm = Math.tanh(1.8);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    ph += (DOIS_PI * (f1 + (f0 - f1) * Math.exp(-i / (0.035 * sr)))) / sr;
    out[i] = (Math.tanh(1.8 * Math.sin(ph)) / norm) * a * Math.min(1, i / (0.0015 * sr));
    a *= dec;
  }
  return out;
}

function marimba(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const f = freqSegura(v.freq, sr);
  const tau = v.dur / 4.5;
  const alto = 0.35 + 0.65 * v.brilho;
  const out = aditivo(
    sr,
    n,
    [
      { f, a: 1, tau },
      { f: f * 3.93, a: 0.4 * alto, tau: tau / 2 },
      { f: f * 9.2, a: 0.12 * alto, tau: tau / 4.5 },
    ],
    0.001,
  );
  golpe(sr, out, rnd, 0.1, 0.003);
  return out;
}

function cascalho(sr: number, n: number, v: Voz, rnd: () => number): Float32Array {
  const out = new Float32Array(n);
  const graos = 6 + Math.round(6 * v.brilho);
  for (let k = 0; k < graos; k += 1) {
    const inicio = Math.floor(n * 0.8 * rnd());
    const amp = 0.3 + 0.7 * rnd();
    const dec = Math.exp(-1 / (0.004 * sr));
    let a = amp;
    let l1 = 0;
    let l2 = 0;
    for (let i = 0; i < Math.round(0.03 * sr) && inicio + i < n; i += 1) {
      l1 += 0.45 * ((rnd() * 2 - 1) - l1);
      l2 += 0.45 * (l1 - l2);
      out[inicio + i] += l2 * a;
      a *= dec;
    }
  }
  return out;
}

/* ---------------- pads ---------------- */

function sub(sr: number, n: number, v: Voz): Float32Array {
  const f = freqSegura(v.freq, sr);
  const w = (DOIS_PI * f) / sr;
  const dur = n / sr;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / sr;
    const env = (1 - Math.exp(-t / 0.06)) * Math.exp(-Math.max(0, t - 0.4 * dur) / (0.18 * dur));
    out[i] = (Math.sin(w * i) + 0.2 * Math.sin(2 * w * i)) * env;
  }
  return out;
}

function coro(sr: number, n: number, v: Voz): Float32Array {
  const f = freqSegura(v.freq, sr);
  const dur = n / sr;
  const ataque = Math.min(0.5, dur * 0.25);
  const solta = Math.min(0.9, dur * 0.4);
  const out = new Float32Array(n);
  // two slightly detuned copies, soft "ah" vowel shaping, slow vibrato
  const harmonicos: number[] = [];
  for (let k = 1; k <= 6; k += 1) {
    const fk = f * k;
    const vogal = Math.exp(-(((fk - 700) / 450) ** 2)) + 0.6 * Math.exp(-(((fk - 1200) / 500) ** 2)) + 0.12;
    harmonicos.push((1 / k) * vogal * suavidade(fk));
  }
  for (const cents of [-7, 7]) {
    const w = (DOIS_PI * f * 2 ** (cents / 1200)) / sr;
    let ph = 0;
    for (let i = 0; i < n; i += 1) {
      const t = i / sr;
      const vib = 1 + 0.005 * Math.min(1, t / 0.5) * Math.sin(DOIS_PI * 5.2 * t + (cents > 0 ? 1.3 : 0));
      ph += w * vib;
      let s = 0;
      for (let k = 0; k < harmonicos.length; k += 1) s += harmonicos[k] * Math.sin((k + 1) * ph);
      const env =
        t < ataque ? 0.5 - 0.5 * Math.cos((Math.PI * t) / ataque) : t > dur - solta ? 0.5 + 0.5 * Math.cos((Math.PI * (t - (dur - solta))) / solta) : 1;
      out[i] += s * env;
    }
  }
  return out;
}

function swell(sr: number, n: number, v: Voz): Float32Array {
  const f1 = freqSegura(v.freq, sr);
  const f2 = freqSegura(v.freq2, sr);
  let ph = 0;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const x = i / n;
    ph += (DOIS_PI * f1 * (f2 / f1) ** x) / sr;
    const env = Math.sin(Math.PI * x ** 0.8) ** 2;
    out[i] = (Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.12 * Math.sin(3 * ph)) * env;
  }
  return out;
}

/** Renders one voice to mono samples, peak-normalized to 1. */
export function renderizarVoz(sr: number, v: Voz): Float32Array {
  const n = Math.max(1, Math.round(v.dur * sr));
  const rnd = criarRng(v.semente);
  let buf: Float32Array;
  switch (v.timbre) {
    case 'sino': buf = sino(sr, n, v, rnd); break;
    case 'cristal': buf = cristal(sr, n, v, rnd); break;
    case 'harpa': buf = harpa(sr, n, v, rnd); break;
    case 'sopro': buf = sopro(sr, n, v, rnd); break;
    case 'whoosh': buf = whoosh(sr, n, v, rnd); break;
    case 'estalo': buf = estalo(sr, n, v, rnd); break;
    case 'brasa': buf = brasa(sr, n, v); break;
    case 'gota': buf = gota(sr, n, v); break;
    case 'bolha': buf = bolha(sr, n, v); break;
    case 'batida': buf = batida(sr, n, v); break;
    case 'marimba': buf = marimba(sr, n, v, rnd); break;
    case 'cascalho': buf = cascalho(sr, n, v, rnd); break;
    case 'sub': buf = sub(sr, n, v); break;
    case 'coro': buf = coro(sr, n, v); break;
    case 'swell': buf = swell(sr, n, v); break;
    case 'clique': buf = clique(sr, n, v); break;
    default: buf = new Float32Array(n);
  }
  for (let i = 0; i < buf.length; i += 1) if (!Number.isFinite(buf[i])) buf[i] = 0;
  bordas(sr, buf);
  return normalizar(buf);
}

/** Synthetic chamber impulse response: decorrelated stereo noise, exponential decay, closing low-pass. */
export function renderizarReverb(sr: number, semente = 1234, t60 = 1.4): [Float32Array, Float32Array] {
  const n = Math.floor(sr * (t60 + 0.1));
  const pre = Math.floor(0.012 * sr);
  const canais: Float32Array[] = [];
  let energia = 0;
  for (let c = 0; c < 2; c += 1) {
    const rnd = criarRng(semente + c * 7919);
    const h = new Float32Array(n);
    let lp = 0;
    let a = 0.5;
    for (let i = pre; i < n; i += 1) {
      const t = (i - pre) / sr;
      if (((i - pre) & 63) === 0) a = 1 - Math.exp((-DOIS_PI * (1200 + 8000 * Math.exp(-t * 1.6))) / sr);
      lp += a * ((rnd() * 2 - 1) - lp);
      h[i] = lp * Math.exp((-6.9 * t) / t60);
    }
    // a few early reflections, different per channel
    const taps = c === 0 ? [0.019, 0.031, 0.047, 0.066] : [0.023, 0.037, 0.053, 0.071];
    taps.forEach((tp, k) => {
      const pos = Math.floor(tp * sr);
      if (pos < n) h[pos] += (k % 2 ? -1 : 1) * 0.5 * 0.7 ** k;
    });
    for (let i = 0; i < n; i += 1) energia += h[i] * h[i];
    canais.push(h);
  }
  const k = energia > 0 ? 1 / Math.sqrt(energia / 2) : 1;
  for (const h of canais) for (let i = 0; i < n; i += 1) h[i] *= k;
  return [canais[0], canais[1]];
}
