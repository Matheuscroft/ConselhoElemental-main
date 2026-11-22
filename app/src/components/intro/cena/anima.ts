/**
 * A tiny, frame-driven animation kit for the grimoire: easings with anticipation and overshoot,
 * and tweens that resolve a promise when they land. Driven by the scene's own clock, so pausing the
 * loop (hidden tab) pauses every animation with it.
 */

export type Easing = (t: number) => number;

export const linear: Easing = (t) => t;
export const easeOutCubic: Easing = (t) => 1 - (1 - t) ** 3;
export const easeInOutCubic: Easing = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOutQuint: Easing = (t) => 1 - (1 - t) ** 5;
export const easeInOutSine: Easing = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
/** Ends past the target and settles back: the one overshoot the design system allows (conjure). */
export const easeOutBack = (s = 1.4): Easing => (t) => 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
/** Starts by moving the wrong way a little: anticipation. */
export const easeInBack = (s = 1.6): Easing => (t) => (s + 1) * t ** 3 - s * t ** 2;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, v: number) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

interface Tween {
  readonly inicio: number;
  readonly duracao: number;
  readonly de: number;
  readonly para: number;
  readonly easing: Easing;
  readonly aplicar: (v: number) => void;
  readonly resolver: () => void;
  readonly chave?: string;
}

export interface Animador {
  /** Current scene time in seconds. */
  readonly agora: number;
  /** Advance the clock and every running tween. */
  passo(dt: number): void;
  /** Tween a value; a tween with the same key replaces the running one (and resolves it). */
  animar(op: { de: number; para: number; duracao: number; easing?: Easing; aplicar: (v: number) => void; atraso?: number; chave?: string }): Promise<void>;
  esperar(segundos: number): Promise<void>;
  /** Finish every running tween at its end value (used by Pular and reduced motion). */
  concluirTudo(): void;
  limpar(): void;
}

export function criarAnimador(): Animador {
  let agora = 0;
  let tweens: Tween[] = [];
  const esperas: { ate: number; resolver: () => void }[] = [];
  return {
    get agora() { return agora; },
    passo(dt) {
      agora += dt;
      const vivos: Tween[] = [];
      for (const tw of tweens) {
        const t = tw.duracao <= 0 ? 1 : clamp01((agora - tw.inicio) / tw.duracao);
        if (agora >= tw.inicio) tw.aplicar(lerp(tw.de, tw.para, tw.easing(t)));
        if (t >= 1 && agora >= tw.inicio) tw.resolver(); else vivos.push(tw);
      }
      tweens = vivos;
      for (let i = esperas.length - 1; i >= 0; i -= 1) {
        if (agora >= esperas[i].ate) { esperas[i].resolver(); esperas.splice(i, 1); }
      }
    },
    animar({ de, para, duracao, easing = easeInOutCubic, aplicar, atraso = 0, chave }) {
      if (chave) {
        for (const tw of tweens) if (tw.chave === chave) tw.resolver();
        tweens = tweens.filter((tw) => tw.chave !== chave);
      }
      return new Promise<void>((resolver) => {
        tweens.push({ inicio: agora + atraso, duracao, de, para, easing, aplicar, resolver, chave });
      });
    },
    esperar(segundos) {
      return new Promise<void>((resolver) => esperas.push({ ate: agora + segundos, resolver }));
    },
    concluirTudo() {
      for (const tw of tweens) { tw.aplicar(tw.para); tw.resolver(); }
      tweens = [];
      for (const e of esperas.splice(0)) e.resolver();
    },
    limpar() { tweens = []; esperas.splice(0); },
  };
}
