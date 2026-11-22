/**
 * The grimoire's sound: a cue bus over Web Audio, synthesised in real time so every sound can be
 * scheduled on the same clock as the animation it belongs to (06-SOUND-DESIGN).
 *
 * Nothing starts on its own: `iniciar` must run inside a real gesture (the tap on the clasp), which
 * is both the browser's rule and the person's consent. Silence is always the default; the scene works
 * the same without any of this. Master: compressor as a limiter (peak ≤ −3 dBFS), a pad bus that can
 * duck, and an effects bus.
 *
 * Signature chord Dmaj9: Water A, Earth D, Fire F♯, Air E; the pad holds D and A until the Seal.
 */

export type CueGrimorio =
  | 'fecho.toque' | 'fecho.giro' | 'capa' | 'luz.sobe' | 'lenda.linha'
  | 'gota.convite' | 'agua.arrasto' | 'agua.solta' | 'terra.firma' | 'fogo.risco' | 'fogo.assenta' | 'ar.assenta' | 'selo.completo' | 'final.botao';

export interface SomGrimorio {
  readonly iniciado: boolean;
  readonly mudo: boolean;
  /** Call inside a user gesture. Safe to call twice. */
  iniciar(): Promise<void>;
  /** Fire a cue now (+ the scheduling margin). `p` carries cue parameters (duration, pan, intensity). */
  cue(id: CueGrimorio, p?: { dur?: number; pan?: number; forca?: number }): void;
  definirMudo(mudo: boolean): void;
  suspender(): Promise<void>;
  retomar(): Promise<void>;
  /** A gesture's continuous voice, driven every frame by the finger (0 = silent). Water: drag speed; Earth: hold progress. */
  continuo(nome: 'agua' | 'terra', valor: number): void;
  /** Fade everything out (≈300 ms) and close. */
  encerrar(fadeMs?: number): Promise<void>;
  /** For the offline render and the laboratory. */
  readonly contexto: BaseAudioContext | null;
}

const NOTA = { D2: 73.42, D3: 146.83, A3: 220, D4: 293.66, Fs4: 369.99, A4: 440, D5: 587.33, E5: 659.26, Fs5: 739.99, A5: 880, E6: 1318.51, A6: 1760 } as const;
const MARGEM = 0.03; // s: agenda com folga, para o som não chegar antes do quadro

type Ctx = BaseAudioContext;

interface Mixer {
  ctx: Ctx;
  mestre: GainNode;
  efeitos: GainNode;
  cama: GainNode;
  ruido: AudioBuffer;
}

function criarRuido(ctx: Ctx): AudioBuffer {
  const b = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2), ctx.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1;
  return b;
}

export function montarMixer(ctx: Ctx, destino: AudioNode): Mixer {
  const limitador = ctx.createDynamicsCompressor();
  limitador.threshold.value = -6; limitador.knee.value = 0; limitador.ratio.value = 20; limitador.attack.value = 0.002; limitador.release.value = 0.12;
  const mestre = ctx.createGain(); mestre.gain.value = 0.7;
  const efeitos = ctx.createGain(); efeitos.gain.value = 1;
  const cama = ctx.createGain(); cama.gain.value = 0;
  efeitos.connect(mestre); cama.connect(mestre); mestre.connect(limitador); limitador.connect(destino);
  return { ctx, mestre, efeitos, cama, ruido: criarRuido(ctx) };
}

/* ------------------------------------------------------------------ peças de síntese */

function envelope(g: AudioParam, t: number, ataque: number, pico: number, queda: number) {
  g.cancelScheduledValues(t);
  g.setValueAtTime(0.0001, t);
  g.exponentialRampToValueAtTime(Math.max(0.0002, pico), t + ataque);
  g.exponentialRampToValueAtTime(0.0001, t + ataque + queda);
}

function saida(m: Mixer, pan = 0, bus: AudioNode = m.efeitos): GainNode {
  const g = m.ctx.createGain();
  const p = m.ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan));
  g.connect(p).connect(bus);
  return g;
}

function ruidoFiltrado(m: Mixer, t: number, dur: number, tipo: BiquadFilterType, freq: number, q: number, destino: AudioNode) {
  const s = m.ctx.createBufferSource(); s.buffer = m.ruido; s.loop = true;
  const f = m.ctx.createBiquadFilter(); f.type = tipo; f.frequency.value = freq; f.Q.value = q;
  s.connect(f).connect(destino);
  s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.05);
  return f;
}

function parcial(m: Mixer, t: number, freq: number, pico: number, queda: number, destino: AudioNode, tipo: OscillatorType = 'sine') {
  const o = m.ctx.createOscillator(); o.type = tipo; o.frequency.value = freq;
  const g = m.ctx.createGain(); envelope(g.gain, t, 0.002, pico, queda);
  o.connect(g).connect(destino); o.start(t); o.stop(t + queda + 0.05);
  return o;
}

/** A soft bell (FM): carrier + modulator at a non-integer ratio, the glassy timbre of Water and Air. */
function sino(m: Mixer, t: number, freq: number, pico: number, queda: number, destino: AudioNode, razao = 2.756) {
  const c = m.ctx.createOscillator(); c.frequency.value = freq;
  const mod = m.ctx.createOscillator(); mod.frequency.value = freq * razao;
  const idx = m.ctx.createGain(); idx.gain.setValueAtTime(freq * 2.2, t); idx.gain.exponentialRampToValueAtTime(freq * 0.05, t + queda);
  mod.connect(idx).connect(c.frequency);
  const g = m.ctx.createGain(); envelope(g.gain, t, 0.004, pico, queda);
  c.connect(g).connect(destino); c.start(t); mod.start(t); c.stop(t + queda + 0.05); mod.stop(t + queda + 0.05);
}

/** A bubble: a short sine that rises (water's "blip"). */
function bolha(m: Mixer, t: number, pico: number, destino: AudioNode) {
  const f0 = 700 + Math.random() * 1200;
  const o = m.ctx.createOscillator(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 1.6, t + 0.03);
  const g = m.ctx.createGain(); envelope(g.gain, t, 0.002, pico, 0.035);
  o.connect(g).connect(destino); o.start(t); o.stop(t + 0.06);
}

/** Stones scraping: a short gritty burst in a mid band. */
function raspa(m: Mixer, t: number, pico: number, destino: AudioNode) {
  const g = m.ctx.createGain(); envelope(g.gain, t, 0.004, pico, 0.05 + Math.random() * 0.05); g.connect(destino);
  ruidoFiltrado(m, t, 0.12, 'bandpass', 700 + Math.random() * 900, 2.5, g);
}

/** A plucked harp-like string: triangle with a fast bright attack and a long decay. */
function harpa(m: Mixer, t: number, freq: number, pico: number, queda: number, destino: AudioNode) {
  const o = m.ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = freq;
  const f = m.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 8, t); f.frequency.exponentialRampToValueAtTime(freq * 2, t + queda * 0.5);
  const g = m.ctx.createGain(); envelope(g.gain, t, 0.003, pico, queda);
  o.connect(f).connect(g).connect(destino); o.start(t); o.stop(t + queda + 0.05);
}

/* ------------------------------------------------------------------ cues da abertura (etapa 1) */

const CUES: Partial<Record<CueGrimorio, (m: Mixer, t: number, p: { dur?: number; pan?: number; forca?: number }) => void>> = {
  /** Brass latch + low thunk: on contact. */
  'fecho.toque': (m, t, p) => {
    const out = saida(m, p.pan ?? 0.35);
    const clique = m.ctx.createGain(); envelope(clique.gain, t, 0.001, 0.55, 0.05); clique.connect(out);
    ruidoFiltrado(m, t, 0.07, 'bandpass', 3200, 6, clique);
    for (const [f, a, q] of [[1870, 0.12, 0.11], [2950, 0.08, 0.08], [4310, 0.05, 0.06]] as const) parcial(m, t, f, a, q, out);
    const baque = m.ctx.createOscillator(); baque.frequency.setValueAtTime(110, t); baque.frequency.exponentialRampToValueAtTime(58, t + 0.14);
    const gb = m.ctx.createGain(); envelope(gb.gain, t, 0.004, 0.5, 0.22); baque.connect(gb).connect(out); baque.start(t); baque.stop(t + 0.3);
    // harmônico do baque, para o alto-falante pequeno "ouvir" o grave
    parcial(m, t, 220, 0.08, 0.12, out);
  },
  /** The Seal turns 16°: three small ratchet ticks, rising. */
  'fecho.giro': (m, t, p) => {
    const out = saida(m, p.pan ?? 0.35);
    [0, 0.11, 0.21].forEach((dt, i) => {
      const g = m.ctx.createGain(); envelope(g.gain, t + dt, 0.001, 0.32 - i * 0.05, 0.035); g.connect(out);
      ruidoFiltrado(m, t + dt, 0.05, 'bandpass', 4200 + i * 300, 9, g);
      parcial(m, t + dt, 2100 + i * 140, 0.05, 0.04, out);
    });
  },
  /** The cover: leather creak and a heavy whoosh that follow the swing (p.dur = swing duration). */
  'capa': (m, t, p) => {
    const dur = p.dur ?? 1.6;
    const out = saida(m, -0.2);
    // medido no render offline: sem isto a capa ficava ~9 dB abaixo da cama (o cue sheet pede +6 dB)
    out.gain.value = 2.6;
    // rangido: dente-de-serra grave numa ressonância estreita, com tremor de atrito
    const serra = m.ctx.createOscillator(); serra.type = 'sawtooth'; serra.frequency.setValueAtTime(78, t); serra.frequency.linearRampToValueAtTime(96, t + dur * 0.6);
    const res = m.ctx.createBiquadFilter(); res.type = 'bandpass'; res.frequency.value = 880; res.Q.value = 14;
    const tremor = m.ctx.createOscillator(); tremor.frequency.value = 23; const prof = m.ctx.createGain(); prof.gain.value = 0.5;
    const gr = m.ctx.createGain(); gr.gain.setValueAtTime(0.0001, t); gr.gain.linearRampToValueAtTime(0.16, t + 0.12); gr.gain.linearRampToValueAtTime(0.05, t + dur * 0.5); gr.gain.linearRampToValueAtTime(0.0001, t + dur * 0.8);
    const am = m.ctx.createGain(); am.gain.value = 0.5; tremor.connect(prof).connect(am.gain);
    serra.connect(res).connect(am).connect(gr).connect(out);
    serra.start(t); tremor.start(t); serra.stop(t + dur); tremor.stop(t + dur);
    // sopro pesado: ruído com banda que sobe com a velocidade da capa (pico no meio do giro)
    const sopro = m.ctx.createGain(); sopro.gain.setValueAtTime(0.0001, t); sopro.gain.linearRampToValueAtTime(0.32, t + dur * 0.55); sopro.gain.exponentialRampToValueAtTime(0.0001, t + dur * 1.05);
    sopro.connect(out);
    const f = ruidoFiltrado(m, t, dur * 1.1, 'bandpass', 260, 1.2, sopro);
    f.frequency.setValueAtTime(260, t); f.frequency.exponentialRampToValueAtTime(1300, t + dur * 0.55); f.frequency.exponentialRampToValueAtTime(380, t + dur);
    // folhas: pequenos estalos de papel no fim
    for (let i = 0; i < 7; i += 1) {
      const tt = t + dur * (0.55 + i * 0.06) + Math.random() * 0.02;
      const g = m.ctx.createGain(); envelope(g.gain, tt, 0.001, 0.06 + Math.random() * 0.05, 0.03); g.connect(out);
      ruidoFiltrado(m, tt, 0.05, 'highpass', 3500, 0.7, g);
    }
    // assentamento: baque macio quando a capa pousa
    const pousa = t + dur;
    const o = m.ctx.createOscillator(); o.frequency.setValueAtTime(80, pousa); o.frequency.exponentialRampToValueAtTime(52, pousa + 0.12);
    const g = m.ctx.createGain(); envelope(g.gain, pousa, 0.006, 0.28, 0.2); o.connect(g).connect(out); o.start(pousa); o.stop(pousa + 0.3);
  },
  /** Light rises through the gutter: a shimmer and the pad base comes in (D and A). */
  'luz.sobe': (m, t) => {
    const out = saida(m, 0.0);
    [NOTA.D5, NOTA.A5, NOTA.E6].forEach((f, i) => sino(m, t + i * 0.18, f, 0.05, 2.4, out, 3.01));
    const ar = m.ctx.createGain(); ar.gain.setValueAtTime(0.0001, t); ar.gain.linearRampToValueAtTime(0.06, t + 1.2); ar.gain.linearRampToValueAtTime(0.0001, t + 3);
    ar.connect(out);
    const f = ruidoFiltrado(m, t, 3.2, 'bandpass', 1800, 3, ar);
    f.frequency.setValueAtTime(900, t); f.frequency.exponentialRampToValueAtTime(5200, t + 2.6);
    // cama: D3 + A3 (+ D4 suave), dente-de-serra filtrado, que respira devagar
    const filtro = m.ctx.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 700; filtro.Q.value = 0.4;
    const lfo = m.ctx.createOscillator(); lfo.frequency.value = 0.07; const lg = m.ctx.createGain(); lg.gain.value = 260; lfo.connect(lg).connect(filtro.frequency); lfo.start(t);
    filtro.connect(m.cama);
    // níveis medidos no render offline: cama ≈ −19 LUFS (meta do 06: −20 a −18)
    for (const [fr, a] of [[NOTA.D3, 0.11], [NOTA.A3, 0.088], [NOTA.D4, 0.04]] as const) {
      for (const det of [-6, 5]) {
        const o = m.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = det;
        const g = m.ctx.createGain(); g.gain.value = a; o.connect(g).connect(filtro); o.start(t);
      }
    }
    m.cama.gain.cancelScheduledValues(t); m.cama.gain.setValueAtTime(m.cama.gain.value, t); m.cama.gain.linearRampToValueAtTime(1.0, t + 3.5);
  },
  /** The drop invites: a small glass "plink" that falls a fifth, up and to the left (where the drop waits). */
  'gota.convite': (m, t) => {
    const out = saida(m, -0.3);
    const o = m.ctx.createOscillator(); o.frequency.setValueAtTime(NOTA.A6, t); o.frequency.exponentialRampToValueAtTime(NOTA.A5 * 1.5, t + 0.06);
    const g = m.ctx.createGain(); envelope(g.gain, t, 0.002, 0.11, 0.22); o.connect(g).connect(out); o.start(t); o.stop(t + 0.3);
    sino(m, t + 0.012, NOTA.A6, 0.035, 0.9, out, 3.01);
  },
  /** Offline twin of the live drag voice (for the recorded video): water running for `dur`, brighter with `forca`. */
  'agua.arrasto': (m, t, p) => {
    const dur = p.dur ?? 1.2, forca = p.forca ?? 0.6;
    const out = saida(m, -0.25);
    const g = m.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.2 * forca, t + 0.12);
    g.gain.setValueAtTime(0.2 * forca, t + dur - 0.15); g.gain.linearRampToValueAtTime(0.0001, t + dur); g.connect(out);
    const f = ruidoFiltrado(m, t, dur, 'bandpass', 600 + 1200 * forca, 1.4, g);
    f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(600 + 1200 * forca, t + dur * 0.5);
    for (let k = t + 0.05; k < t + dur - 0.05; k += 0.07 + Math.random() * 0.06) bolha(m, k, 0.045 * forca, out);
  },
  /** Release at the end of the groove: splash, a harp run up to A, and the Water stem (A) joins the bed. */
  'agua.solta': (m, t) => {
    const out = saida(m, -0.3);
    const sp = m.ctx.createGain(); envelope(sp.gain, t, 0.003, 0.32, 0.38); sp.connect(out);
    const f = ruidoFiltrado(m, t, 0.45, 'bandpass', 2400, 0.9, sp);
    f.frequency.setValueAtTime(2600, t); f.frequency.exponentialRampToValueAtTime(420, t + 0.35);
    [NOTA.Fs4, NOTA.A4, NOTA.D5, NOTA.E5, NOTA.A5].forEach((fr, i) => harpa(m, t + 0.06 + i * 0.055, fr, i === 4 ? 0.12 : 0.08, i === 4 ? 2.2 : 0.9, out));
    // haste da Água: Lá suave e contínuo, entra na cama (as hastes somam o Dmaj9 até o Selo)
    for (const [fr, a] of [[NOTA.A4, 0.03], [NOTA.A5, 0.012]] as const) {
      const o = m.ctx.createOscillator(); o.frequency.value = fr;
      const g = m.ctx.createGain(); g.gain.setValueAtTime(0.0001, t + 0.3); g.gain.linearRampToValueAtTime(a, t + 2.3);
      o.connect(g).connect(m.cama); o.start(t + 0.3);
    }
  },
  /** The hold completes: the stones drop with a thud, a low D with its harmonics, and the Earth stem (D) joins the bed. */
  'terra.firma': (m, t) => {
    const out = saida(m, 0.3);
    const o = m.ctx.createOscillator(); o.frequency.setValueAtTime(96, t); o.frequency.exponentialRampToValueAtTime(44, t + 0.18);
    const g = m.ctx.createGain(); envelope(g.gain, t, 0.003, 0.7, 0.35); o.connect(g).connect(out); o.start(t); o.stop(t + 0.45);
    const n = m.ctx.createGain(); envelope(n.gain, t, 0.002, 0.35, 0.22); n.connect(out);
    ruidoFiltrado(m, t, 0.3, 'lowpass', 900, 0.7, n);
    for (let k = 0; k < 4; k += 1) raspa(m, t + 0.05 + k * 0.06 + Math.random() * 0.03, 0.06, out);
    // o Ré: fundamental grave e os harmônicos D4/A4 que o alto-falante pequeno consegue tocar
    for (const [fr, a, q] of [[NOTA.D3, 0.14, 2.4], [NOTA.D4, 0.07, 2.0], [NOTA.A4, 0.035, 1.6]] as const) parcial(m, t + 0.04, fr, a, q, out, 'triangle');
    for (const [fr, a] of [[NOTA.D2, 0.05], [NOTA.D3, 0.025]] as const) {
      const s = m.ctx.createOscillator(); s.frequency.value = fr;
      const gs = m.ctx.createGain(); gs.gain.setValueAtTime(0.0001, t + 0.3); gs.gain.linearRampToValueAtTime(a, t + 2.3);
      s.connect(gs).connect(m.cama); s.start(t + 0.3);
    }
  },
  /** A line of the legend settles: very soft ink. */
  'lenda.linha': (m, t) => {
    const out = saida(m, (Math.random() - 0.5) * 0.3);
    const g = m.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    g.connect(out);
    const f = ruidoFiltrado(m, t, 0.5, 'lowpass', 1300 + Math.random() * 500, 0.6, g);
    f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.4);
  },
};

export function criarSomGrimorio(): SomGrimorio {
  let ctx: AudioContext | null = null;
  let mixer: Mixer | null = null;
  let mudo = false;
  let encerrado = false;
  /** Live voices of the gestures. Water: noise in a band that follows the drag speed, plus bubbles.
   *  Earth: a sub and a low rumble that grow with the hold, plus stones scraping at a rate that grows too. */
  interface Voz { g: GainNode; f: BiquadFilterNode; fontes: AudioScheduledSourceNode[]; out: GainNode; grao: number; valor: number; silencio: number }
  const vozes: Partial<Record<'agua' | 'terra', Voz>> = {};
  const parar = (nome: 'agua' | 'terra') => {
    const v = vozes[nome];
    if (!v || !ctx) return;
    delete vozes[nome];
    window.clearInterval(v.grao); window.clearTimeout(v.silencio);
    const t = ctx.currentTime;
    v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.06);
    for (const f of v.fontes) f.stop(t + 0.4);
  };
  const criarVoz = (nome: 'agua' | 'terra', c: AudioContext, m: Mixer): Voz => {
    const out = saida(m, nome === 'agua' ? -0.25 : 0.3);
    const g = c.createGain(); g.gain.value = 0; g.connect(out);
    const ruido = c.createBufferSource(); ruido.buffer = m.ruido; ruido.loop = true;
    const f = c.createBiquadFilter();
    const fontes: AudioScheduledSourceNode[] = [ruido];
    if (nome === 'agua') { f.type = 'bandpass'; f.Q.value = 1.4; f.frequency.value = 600; }
    else {
      f.type = 'lowpass'; f.Q.value = 0.8; f.frequency.value = 140;
      const sub = c.createOscillator(); sub.frequency.value = NOTA.D2 * 0.625; // ~46 Hz, abaixo do Ré
      const gs = c.createGain(); gs.gain.value = 0.9; sub.connect(gs).connect(g); sub.start(); fontes.push(sub);
      const harm = c.createOscillator(); harm.frequency.value = NOTA.D2 * 1.25; // harmônico para o alto-falante pequeno
      const gh = c.createGain(); gh.gain.value = 0.25; harm.connect(gh).connect(g); harm.start(); fontes.push(harm);
    }
    ruido.connect(f).connect(g); ruido.start();
    const voz: Voz = { g, f, fontes, out, grao: 0, valor: 0, silencio: 0 };
    voz.grao = window.setInterval(() => {
      if (!ctx || !mixer || voz.valor <= 0.05) return;
      if (nome === 'agua') { if (Math.random() < 0.35 + voz.valor * 0.5) bolha(mixer, ctx.currentTime + 0.01, 0.045 * voz.valor, voz.out); }
      else if (Math.random() < voz.valor * 0.8) raspa(mixer, ctx.currentTime + 0.01, 0.05 * voz.valor, voz.out);
    }, 60);
    return voz;
  };
  return {
    get iniciado() { return ctx !== null; },
    get mudo() { return mudo; },
    get contexto() { return ctx; },
    async iniciar() {
      if (ctx || encerrado) return;
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor({ latencyHint: 'interactive' });
      mixer = montarMixer(ctx, ctx.destination);
      if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined);
      mixer.mestre.gain.value = mudo ? 0 : 0.7;
    },
    cue(id, p = {}) {
      if (!ctx || !mixer || encerrado) return;
      const latencia = (ctx as AudioContext & { outputLatency?: number }).outputLatency ?? 0;
      const t = ctx.currentTime + MARGEM - Math.min(latencia, 0.02);
      CUES[id]?.(mixer, Math.max(ctx.currentTime, t), p);
    },
    continuo(nome, valor) {
      if (!ctx || !mixer || encerrado) return;
      const t = ctx.currentTime;
      let v = vozes[nome];
      if (valor <= 0.02) {
        if (v && v.valor > 0) { v.valor = 0; v.g.gain.setTargetAtTime(0, t, 0.08); v.silencio = window.setTimeout(() => parar(nome), 500); }
        return;
      }
      if (!v) { v = criarVoz(nome, ctx, mixer); vozes[nome] = v; }
      window.clearTimeout(v.silencio);
      v.valor = Math.min(1, valor);
      if (nome === 'agua') {
        v.g.gain.setTargetAtTime(0.2 * v.valor, t, 0.05);
        v.f.frequency.setTargetAtTime(500 + 1300 * v.valor, t, 0.08);
      } else {
        v.g.gain.setTargetAtTime(0.06 + 0.22 * v.valor * v.valor, t, 0.08);
        v.f.frequency.setTargetAtTime(120 + 220 * v.valor, t, 0.1);
      }
    },
    definirMudo(m) {
      mudo = m;
      if (!ctx || !mixer) return;
      const t = ctx.currentTime;
      mixer.mestre.gain.cancelScheduledValues(t); mixer.mestre.gain.setValueAtTime(mixer.mestre.gain.value, t);
      mixer.mestre.gain.linearRampToValueAtTime(m ? 0 : 0.7, t + 0.25);
    },
    async suspender() { if (ctx && ctx.state === 'running') await ctx.suspend().catch(() => undefined); },
    async retomar() { if (ctx && ctx.state === 'suspended') await ctx.resume().catch(() => undefined); },
    async encerrar(fadeMs = 300) {
      parar('agua'); parar('terra');
      encerrado = true;
      if (!ctx || !mixer) return;
      const t = ctx.currentTime;
      mixer.mestre.gain.cancelScheduledValues(t); mixer.mestre.gain.setValueAtTime(mixer.mestre.gain.value, t);
      mixer.mestre.gain.linearRampToValueAtTime(0, t + fadeMs / 1000);
      const c = ctx; ctx = null; mixer = null;
      window.setTimeout(() => { void c.close().catch(() => undefined); }, fadeMs + 50);
    },
  };
}

/** Render a timeline of cues offline (the laboratory exports it to pair with a screen recording). */
export async function renderizarOffline(linha: readonly { t: number; id: CueGrimorio; p?: { dur?: number; pan?: number; forca?: number } }[], duracao: number): Promise<AudioBuffer> {
  const taxa = 48000;
  const off = new OfflineAudioContext(2, Math.ceil(duracao * taxa), taxa);
  const m = montarMixer(off, off.destination);
  for (const c of linha) CUES[c.id]?.(m, c.t, c.p ?? {});
  return off.startRendering();
}
