/**
 * The veil between the grimoire and the app: a full-screen layer that lives in document.body, outside React, so
 * it outlives the ceremony's unmount. It covers the screen (the warm light of "entrar na história", or the night
 * for the short exits), the next screen mounts and paints underneath, and only then does it dissolve.
 *
 * It can never leave the screen stuck: every step has a wall-clock fallback and the veil removes itself after
 * 9 s past the last step it was asked for, whatever happens. Only opacity, and the backdrop blur on the way out, animate (compositor work).
 */

export type TomVeu = 'luz' | 'noite';

export interface Veu {
  /** Fade in over `ms`; resolves when the screen is fully covered. */
  cobrir(op: { tom: TomVeu; ms: number }): Promise<void>;
  /** Wait until the next screen is in place and painted, then dissolve over `ms` and remove. */
  revelar(op: { tom: TomVeu; ms: number }): Promise<void>;
  /** Speed up whatever is animating (the tap that hurries the transition). */
  acelerar(fator: number): void;
  remover(): void;
}

// a luz do clarão no pico; a noite (o fundo das telas do app, #14122a, a névoa da cena)
const FUNDO_LUZ = 'radial-gradient(130% 95% at 50% 46%, #fffaf0 0%, #f6e8cb 38%, #e8cd9d 78%, #cdab78 100%)';
const FUNDO_NOITE = 'radial-gradient(120% 90% at 50% 40%, #2a2450 0%, #1a1734 55%, #0d0b18 100%)';

const quadro = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** The next screen is in: the grimoire is gone and no route is still showing its loading fallback. */
async function proximaTelaPronta(limiteMs: number): Promise<void> {
  const ate = performance.now() + limiteMs;
  while (performance.now() < ate) {
    const semGrimorio = !document.querySelector('section.grimorio');
    const semEspera = !Array.from(document.querySelectorAll('p')).some((p) => /^Preparando/.test(p.textContent ?? '') && p.offsetParent !== null);
    if (semGrimorio && semEspera) break;
    await quadro();
  }
  // dois quadros: o primeiro monta, o segundo garante que a tela já foi pintada debaixo do véu
  await quadro(); await quadro();
}

export function criarVeu(): Veu {
  const el = document.createElement('div');
  el.className = 'grimorio-veu';
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = 'position:fixed;inset:0;z-index:95;pointer-events:auto;contain:strict;';
  const luz = document.createElement('div');
  const noite = document.createElement('div');
  for (const [camada, fundo] of [[luz, FUNDO_LUZ], [noite, FUNDO_NOITE]] as const) {
    camada.style.cssText = `position:absolute;inset:0;opacity:0;background:${fundo};will-change:opacity;`;
    el.appendChild(camada);
  }
  document.body.appendChild(el);
  let vivo = true;
  let animacoes: Animation[] = [];
  let ritmo = 1;
  let seguranca = window.setTimeout(() => remover(), 9000);
  /** The self-removal follows the longest step asked for (the laboratory's slow motion can take 12 s). */
  const armar = (ms: number) => { window.clearTimeout(seguranca); seguranca = window.setTimeout(() => remover(), ms + 9000); };

  function remover() {
    if (!vivo) return;
    vivo = false;
    window.clearTimeout(seguranca);
    for (const a of animacoes) a.cancel();
    el.remove();
  }
  const animar = (alvo: HTMLElement, quadros: Keyframe[], ms: number, easing: string): Promise<void> => {
    const fim = quadros[quadros.length - 1] as Record<string, string | number>;
    if (typeof alvo.animate !== 'function') {
      Object.assign(alvo.style, fim);
      return new Promise((r) => window.setTimeout(r, ms));
    }
    const a = alvo.animate(quadros, { duration: Math.max(1, ms), easing, fill: 'forwards' });
    a.playbackRate = ritmo;
    animacoes.push(a);
    // relógio de parede como reserva: uma animação que nunca termina (aba oculta, compositor parado) não prende a tela
    return Promise.race([
      a.finished.then(() => undefined, () => undefined),
      new Promise<void>((r) => window.setTimeout(r, ms / ritmo + 400)),
    ]);
  };

  return {
    async cobrir({ tom, ms }) {
      if (!vivo) return;
      armar(ms);
      el.style.pointerEvents = 'auto';
      await animar(tom === 'luz' ? luz : noite, [{ opacity: 0 }, { opacity: 1 }], ms, 'cubic-bezier(0.55, 0, 0.75, 0.2)');
    },
    async revelar({ tom, ms }) {
      if (!vivo) return;
      armar(ms + 1500);
      const t0 = performance.now();
      await proximaTelaPronta(1500);
      if (import.meta.env.DEV) console.info(`[véu] a próxima tela ficou pronta em ${Math.round(performance.now() - t0)} ms`);
      if (!vivo) return;
      el.style.pointerEvents = 'none';
      animacoes = animacoes.filter((a) => a.playState !== 'finished');
      if (tom === 'luz') {
        // continuidade de tom: a luz quente passa pelo crepúsculo da cena e se abre sobre a tela escura do app,
        // com um desfoque leve que se dissolve junto (o "movimento" da passagem)
        const desfoque = CSS.supports?.('backdrop-filter', 'blur(1px)') || CSS.supports?.('-webkit-backdrop-filter', 'blur(1px)');
        const passos: Promise<void>[] = [
          animar(luz, [{ opacity: 1 }, { opacity: 0.55, offset: 0.3 }, { opacity: 0 }], ms, 'cubic-bezier(0.2, 0.6, 0.35, 1)'),
          animar(noite, [{ opacity: 0 }, { opacity: 0.5, offset: 0.35 }, { opacity: 0 }], ms, 'ease-out'),
        ];
        if (desfoque) {
          passos.push(animar(el, [
            { backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } as Keyframe,
            { backdropFilter: 'blur(0px)', WebkitBackdropFilter: 'blur(0px)' } as Keyframe,
          ], ms * 0.8, 'ease-out'));
        }
        await Promise.all(passos);
      } else {
        await animar(noite, [{ opacity: 1 }, { opacity: 0 }], ms, 'ease-out');
      }
      remover();
    },
    acelerar(fator) {
      ritmo = Math.max(ritmo, fator);
      for (const a of animacoes) a.playbackRate = ritmo;
    },
    remover,
  };
}
