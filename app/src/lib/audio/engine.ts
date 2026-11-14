import type { Partitura, Voz } from './cues';
import { assinarPreferencias, lerPreferencias } from './preferencias';

/**
 * Plays scores from `cues.ts` with Web Audio. One lazily created context,
 * a master chain (gain -> compressor -> output), a shared noise buffer and a
 * polyphony cap. Everything is a safe no-op when there is no AudioContext,
 * when sound was not activated by a gesture, when it is muted, or when the
 * tab is hidden. It never throws for lack of support.
 */

export const MAX_VOZES = 12;
export const INTERVALO_CONCLUSAO_MS = 80;
const NIVEL_MESTRE = 0.8;
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
  fim: number;
  parar: () => void;
}

export function criarMotor(opcoes: OpcoesMotor = {}): Motor {
  const criarContexto = opcoes.criarContexto ?? contextoPadrao;
  const oculto = opcoes.oculto ?? ocultoPadrao;
  const agoraMs = opcoes.agora ?? (() => Date.now());

  let ctx: AudioContext | null = null;
  let mestre: GainNode | null = null;
  let entrada: AudioNode | null = null;
  let ruidoBranco: AudioBuffer | null = null;
  let ruidoRosa: AudioBuffer | null = null;
  let ativo = false;
  let falhou = false;
  const vozes: VozAtiva[] = [];
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
      compressor.threshold.value = -16;
      compressor.knee.value = 24;
      compressor.ratio.value = 6;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.2;
      ganho.connect(compressor);
      compressor.connect(novo.destination);
      const sr = novo.sampleRate;
      const tamanho = Math.max(1, Math.floor(sr * 2));
      const branco = novo.createBuffer(1, tamanho, sr);
      const rosa = novo.createBuffer(1, tamanho, sr);
      const dadosB = branco.getChannelData(0);
      const dadosR = rosa.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < tamanho; i += 1) {
        const x = Math.random() * 2 - 1;
        dadosB[i] = x;
        b0 = 0.99765 * b0 + x * 0.099046;
        b1 = 0.963 * b1 + x * 0.2965164;
        b2 = 0.57 * b2 + x * 1.0526913;
        dadosR[i] = (b0 + b1 + b2 + x * 0.1848) * 0.2;
      }
      ctx = novo;
      mestre = ganho;
      entrada = ganho;
      ruidoBranco = branco;
      ruidoRosa = rosa;
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

  function descartarMaisAntiga() {
    const mais = vozes.shift();
    mais?.parar();
  }

  function criarVoz(c: AudioContext, v: Voz, t0: number, saida: AudioNode, envioEco: AudioNode | null) {
    const inicio = t0 + v.atraso;
    const e = v.adsr;
    const fimAtaque = inicio + e.ataque;
    const fimDecaimento = fimAtaque + e.decaimento;
    const fimSustento = fimDecaimento + e.sustentacao;
    const fim = fimSustento + e.liberacao;
    const nos: AudioNode[] = [];

    let fonte: AudioScheduledSourceNode;
    if (v.fonte === 'ruido-branco' || v.fonte === 'ruido-rosa') {
      const s = c.createBufferSource();
      s.buffer = v.fonte === 'ruido-branco' ? ruidoBranco : ruidoRosa;
      s.loop = true;
      fonte = s;
    } else {
      const o = c.createOscillator();
      o.type = v.fonte;
      const [f0, f1] = v.freq;
      o.frequency.setValueAtTime(Math.max(20, f0), inicio);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), fim);
      fonte = o;
    }
    nos.push(fonte);

    let cadeia: AudioNode = fonte;
    if (v.filtro) {
      const f = c.createBiquadFilter();
      f.type = v.filtro.tipo;
      f.Q.value = v.filtro.q;
      f.frequency.setValueAtTime(Math.max(20, v.filtro.freq[0]), inicio);
      if (v.filtro.freq[1] !== v.filtro.freq[0]) f.frequency.exponentialRampToValueAtTime(Math.max(20, v.filtro.freq[1]), fim);
      cadeia.connect(f);
      cadeia = f;
      nos.push(f);
    }

    const g = c.createGain();
    const pico = Math.min(1, Math.max(0.0001, v.ganho));
    g.gain.setValueAtTime(0.0001, inicio);
    g.gain.linearRampToValueAtTime(pico, fimAtaque);
    g.gain.linearRampToValueAtTime(Math.max(0.0001, pico * e.sustain), fimDecaimento);
    g.gain.setValueAtTime(Math.max(0.0001, pico * e.sustain), fimSustento);
    g.gain.exponentialRampToValueAtTime(0.0001, fim);
    cadeia.connect(g);
    cadeia = g;
    nos.push(g);

    if (v.pan !== 0 && typeof c.createStereoPanner === 'function') {
      const p = c.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, v.pan));
      cadeia.connect(p);
      cadeia = p;
      nos.push(p);
    }
    cadeia.connect(saida);
    if (v.eco && envioEco) cadeia.connect(envioEco);

    const registro: VozAtiva = {
      fim,
      parar: () => {
        try {
          g.gain.cancelScheduledValues(c.currentTime);
          g.gain.setTargetAtTime(0.0001, c.currentTime, RAMPA / 3);
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
    fonte.start(inicio);
    fonte.stop(fim + 0.05);
  }

  function tocar(partitura: Partitura): void {
    try {
      if (!ativo || !ctx || !entrada || !partitura.vozes.length) return;
      if (oculto()) return;
      const prefs = lerPreferencias();
      if (!prefs.ligado || prefs.volume <= 0) return;
      if (ctx.state !== 'running') {
        void ctx.resume().catch(() => undefined);
        return;
      }
      const c = ctx;
      const t0 = c.currentTime + 0.01;
      let envioEco: GainNode | null = null;
      const extras: AudioNode[] = [];
      if (partitura.eco) {
        envioEco = c.createGain();
        envioEco.gain.value = partitura.eco.mix;
        const atraso = c.createDelay(1);
        atraso.delayTime.value = partitura.eco.atraso;
        const retorno = c.createGain();
        retorno.gain.value = partitura.eco.realimentacao;
        const abafa = c.createBiquadFilter();
        abafa.type = 'lowpass';
        abafa.frequency.value = 3500;
        envioEco.connect(atraso);
        atraso.connect(abafa);
        abafa.connect(retorno);
        retorno.connect(atraso);
        abafa.connect(entrada);
        extras.push(envioEco, atraso, retorno, abafa);
        limparEco(c, extras, partitura.duracao + 0.2);
      }
      // Make room first: the oldest voices are dropped, never the new cue.
      while (vozes.length + partitura.vozes.length > MAX_VOZES && vozes.length > 0) descartarMaisAntiga();
      for (const v of partitura.vozes.slice(0, MAX_VOZES)) criarVoz(c, v, t0, entrada, envioEco);
    } catch {
      /* sound must never break the app */
    }
  }

  /** Disconnects the echo nodes after the tail has rung out. */
  function limparEco(_c: AudioContext, nos: AudioNode[], segundos: number) {
    setTimeout(() => {
      for (const no of nos) {
        try {
          no.disconnect();
        } catch {
          /* ignore */
        }
      }
    }, segundos * 1000);
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
