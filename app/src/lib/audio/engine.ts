import type { Partitura } from './cues';
import { assinarPreferencias, lerPreferencias } from './preferencias';
import { renderizarPartitura } from './render';
import { renderizarReverb } from './timbres';

/**
 * Plays scores from `cues.ts`. Each score is rendered once (pure synthesis in
 * `render.ts`) into an AudioBuffer and cached; the engine only mixes: source ->
 * dry (0.75) + reverb send -> shared ConvolverNode -> master gain -> soft
 * compressor -> output. One lazily created context, a polyphony cap and a
 * 80 ms coalescing window for completions. Everything is a safe no-op when
 * there is no AudioContext, when sound was not activated by a gesture, when it
 * is muted, or when the tab is hidden. It never throws for lack of support.
 */

/** Cap on simultaneous cues (each cue is one source with many synthesized layers). */
export const MAX_VOZES = 6;
export const INTERVALO_CONCLUSAO_MS = 80;
const MAX_CACHE = 48;
const NIVEL_MESTRE = 0.8;
const SECO = 0.75;
const RAMPA = 0.02;

export interface OpcoesMotor {
  criarContexto?: () => AudioContext | null;
  oculto?: () => boolean;
  agora?: () => number;
}

export interface Motor {
  ativarSom(): Promise<boolean>;
  tocar(partitura: Partitura): void;
  /** Rate-limited entry for completions: at most one per 80 ms, bursts coalesced. */
  tocarConclusao(partitura: Partitura): void;
  readonly ativo: boolean;
  readonly vozesAtivas: number;
}

function contextoPadrao(): AudioContext | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  const Ctor = g.AudioContext ?? g.webkitAudioContext;
  return Ctor ? new Ctor() : null;
}

const ocultoPadrao = () => typeof document !== 'undefined' && document.hidden === true;

interface VozAtiva {
  parar: () => void;
}

export function criarMotor(opcoes: OpcoesMotor = {}): Motor {
  const criarContexto = opcoes.criarContexto ?? contextoPadrao;
  const oculto = opcoes.oculto ?? ocultoPadrao;
  const agoraMs = opcoes.agora ?? (() => Date.now());

  let ctx: AudioContext | null = null;
  let mestre: GainNode | null = null;
  let reverb: ConvolverNode | null = null;
  let ativo = false;
  let falhou = false;
  const vozes: VozAtiva[] = [];
  const cache = new Map<string, AudioBuffer>();
  let ultimaConclusaoMs = -Infinity;
  let pendente: Partitura | null = null;
  let temporizador: ReturnType<typeof setTimeout> | null = null;

  function volumeEfetivo(): number {
    const p = lerPreferencias();
    return p.ligado ? p.volume * NIVEL_MESTRE : 0;
  }

  function aplicarVolume() {
    if (!ctx || !mestre) return;
    try {
      mestre.gain.setTargetAtTime(volumeEfetivo(), ctx.currentTime, 0.03);
    } catch {
      /* ignore */
    }
  }
  assinarPreferencias(aplicarVolume);

  function construir(): boolean {
    if (ctx) return true;
    if (falhou) return false;
    try {
      const novo = criarContexto();
      if (!novo) {
        falhou = true;
        return false;
      }
      const ganho = novo.createGain();
      ganho.gain.value = volumeEfetivo();
      const compressor = novo.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.knee.value = 24;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.25;
      ganho.connect(compressor);
      compressor.connect(novo.destination);
      // Shared chamber reverb (impulse response synthesized once).
      try {
        const [esq, dir] = renderizarReverb(novo.sampleRate);
        const ir = novo.createBuffer(2, esq.length, novo.sampleRate);
        ir.getChannelData(0).set(esq);
        ir.getChannelData(1).set(dir);
        const conv = novo.createConvolver();
        conv.normalize = false;
        conv.buffer = ir;
        conv.connect(ganho);
        reverb = conv;
      } catch {
        reverb = null; // dry only
      }
      ctx = novo;
      mestre = ganho;
      return true;
    } catch {
      falhou = true;
      ctx = null;
      return false;
    }
  }

  async function ativarSom(): Promise<boolean> {
    try {
      if (!construir() || !ctx) return false;
      if (ctx.state === 'suspended') await ctx.resume();
      ativo = ctx.state !== 'closed';
      aplicarVolume();
      return ativo;
    } catch {
      return false;
    }
  }

  function bufferDe(c: AudioContext, p: Partitura): AudioBuffer {
    const chave = `${p.chave}@${c.sampleRate}`;
    const guardado = cache.get(chave);
    if (guardado) return guardado;
    const { esquerdo, direito } = renderizarPartitura(c.sampleRate, p);
    const buf = c.createBuffer(2, esquerdo.length, c.sampleRate);
    buf.getChannelData(0).set(esquerdo);
    buf.getChannelData(1).set(direito);
    if (cache.size >= MAX_CACHE) {
      const primeira = cache.keys().next().value;
      if (primeira !== undefined) cache.delete(primeira);
    }
    cache.set(chave, buf);
    return buf;
  }

  function descartarMaisAntiga() {
    const mais = vozes.shift();
    mais?.parar();
  }

  function tocar(partitura: Partitura): void {
    try {
      if (!ativo || !ctx || !mestre || !partitura.vozes.length) return;
      if (oculto()) return;
      const prefs = lerPreferencias();
      if (!prefs.ligado || prefs.volume <= 0) return;
      if (ctx.state !== 'running') {
        void ctx.resume().catch(() => undefined);
        return;
      }
      const c = ctx;
      const buffer = bufferDe(c, partitura);
      // Make room first: the oldest cue is dropped, never the new one.
      while (vozes.length >= MAX_VOZES) descartarMaisAntiga();

      const fonte = c.createBufferSource();
      fonte.buffer = buffer;
      const seco = c.createGain();
      seco.gain.value = SECO;
      fonte.connect(seco);
      seco.connect(mestre);
      const nos: AudioNode[] = [fonte, seco];
      if (reverb && partitura.reverb > 0) {
        const envio = c.createGain();
        envio.gain.value = partitura.reverb;
        fonte.connect(envio);
        envio.connect(reverb);
        nos.push(envio);
      }
      const registro: VozAtiva = {
        parar: () => {
          try {
            seco.gain.cancelScheduledValues(c.currentTime);
            seco.gain.setTargetAtTime(0.0001, c.currentTime, RAMPA / 3);
            fonte.stop(c.currentTime + RAMPA);
          } catch {
            /* already stopped */
          }
        },
      };
      vozes.push(registro);
      fonte.onended = () => {
        const posicao = vozes.indexOf(registro);
        if (posicao >= 0) vozes.splice(posicao, 1);
        for (const no of nos) {
          try {
            no.disconnect();
          } catch {
            /* ignore */
          }
        }
      };
      fonte.start(c.currentTime + 0.01);
    } catch {
      /* sound must never break the app */
    }
  }

  function emitirPendente() {
    temporizador = null;
    if (!pendente) return;
    const p = pendente;
    pendente = null;
    ultimaConclusaoMs = agoraMs();
    tocar(p);
  }

  function tocarConclusao(partitura: Partitura): void {
    if (!ativo) return;
    const agora = agoraMs();
    const espera = ultimaConclusaoMs + INTERVALO_CONCLUSAO_MS - agora;
    if (espera <= 0 && !temporizador) {
      ultimaConclusaoMs = agora;
      tocar(partitura);
      return;
    }
    // Burst: keep only the strongest pending completion and play it once.
    const forca = (p: Partitura) => p.vozes.reduce((soma, v) => soma + v.ganho, 0);
    if (!pendente || forca(partitura) > forca(pendente)) pendente = partitura;
    if (!temporizador) temporizador = setTimeout(emitirPendente, Math.max(0, espera));
  }

  return {
    ativarSom,
    tocar,
    tocarConclusao,
    get ativo() {
      return ativo;
    },
    get vozesAtivas() {
      return vozes.length;
    },
  };
}

/** The app's single engine. */
export const motor: Motor = criarMotor();
