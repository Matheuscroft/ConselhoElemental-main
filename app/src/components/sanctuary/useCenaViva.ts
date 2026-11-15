import { useEffect, type RefObject } from 'react';
import {
  amortecer, emRepouso, inclinacaoNaCena, luzNoCartao, ponteiroNaCena, REPOUSO, type Vetor,
} from '@/lib/sanctuary/cena-viva';

/**
 * Safari on an iPhone only hands over the tilt after a permission dialog. A
 * dialog to make a picture sway is a bad trade, so there the scene follows the
 * finger alone and never asks.
 */
function inclinacaoSemPedido(): boolean {
  if (typeof DeviceOrientationEvent === 'undefined') return false;
  return typeof (DeviceOrientationEvent as unknown as { requestPermission?: unknown }).requestPermission !== 'function';
}

/**
 * Depth for a scene: the pointer, or the tilt of the phone, becomes two
 * numbers between -1 and 1 written to `--par-x` and `--par-y` on the scene.
 * The stylesheet decides how far each layer travels with them.
 *
 * Nothing re-renders. The loop only runs while the numbers are still
 * travelling, reads the layout at most once a frame, and stops off screen.
 */
export function useParalaxe(cenaRef: RefObject<HTMLElement | null>, ativo: boolean) {
  useEffect(() => {
    const cena = cenaRef.current;
    if (!cena || !ativo) return;

    let alvo: Vetor = REPOUSO;
    let atual: Vetor = REPOUSO;
    let ponteiro: Vetor | null = null;
    let pelaMao = false;
    let visivel = true;
    let quadro = 0;
    let anterior: number | undefined;

    const escrever = () => {
      cena.style.setProperty('--par-x', atual.x.toFixed(3));
      cena.style.setProperty('--par-y', atual.y.toFixed(3));
    };

    const passo = (agora: number) => {
      quadro = 0;
      if (ponteiro) {
        alvo = ponteiroNaCena(ponteiro.x, ponteiro.y, cena.getBoundingClientRect());
        ponteiro = null;
      }
      const delta = anterior === undefined ? 16 : Math.min(agora - anterior, 64);
      anterior = agora;
      atual = { x: amortecer(atual.x, alvo.x, delta), y: amortecer(atual.y, alvo.y, delta) };
      if (emRepouso(atual, alvo)) {
        atual = alvo;
        anterior = undefined;
        escrever();
        return;
      }
      escrever();
      quadro = requestAnimationFrame(passo);
    };

    const acordar = () => {
      if (!quadro && visivel && !document.hidden) quadro = requestAnimationFrame(passo);
    };

    const aoMover = (evento: PointerEvent) => {
      pelaMao = true;
      ponteiro = { x: evento.clientX, y: evento.clientY };
      acordar();
    };
    const soltar = () => {
      pelaMao = false;
      ponteiro = null;
      alvo = REPOUSO;
      acordar();
    };
    const aoInclinar = (evento: DeviceOrientationEvent) => {
      // The hand wins: a finger on the scene is a clearer wish than a wrist.
      if (pelaMao) return;
      alvo = inclinacaoNaCena(evento.beta, evento.gamma);
      acordar();
    };

    const naTela = new IntersectionObserver(([entrada]) => {
      visivel = entrada?.isIntersecting ?? true;
      if (visivel) acordar();
    });
    naTela.observe(cena);

    cena.addEventListener('pointermove', aoMover, { passive: true });
    cena.addEventListener('pointerleave', soltar);
    cena.addEventListener('pointercancel', soltar);
    const comInclinacao = inclinacaoSemPedido();
    if (comInclinacao) window.addEventListener('deviceorientation', aoInclinar, { passive: true });

    return () => {
      cancelAnimationFrame(quadro);
      naTela.disconnect();
      cena.removeEventListener('pointermove', aoMover);
      cena.removeEventListener('pointerleave', soltar);
      cena.removeEventListener('pointercancel', soltar);
      if (comInclinacao) window.removeEventListener('deviceorientation', aoInclinar);
      cena.style.removeProperty('--par-x');
      cena.style.removeProperty('--par-y');
    };
  }, [cenaRef, ativo]);
}

/**
 * Light that follows the finger across glass. One listener on the container
 * finds the `[data-luz]` surface under the pointer and writes where the light
 * sits, in pixels, to `--luz-x` and `--luz-y`; `data-luz-acesa` is what the
 * stylesheet fades in and out. A tap lights the surface as well as a hover,
 * so a phone gets the same answer a mouse does.
 */
export function useLuzDoToque(raizRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;

    let cartao: HTMLElement | null = null;
    let ponteiro: Vetor | null = null;
    let quadro = 0;

    const apagar = () => {
      cartao?.removeAttribute('data-luz-acesa');
      cartao = null;
      ponteiro = null;
    };

    const pintar = () => {
      quadro = 0;
      if (!cartao || !ponteiro) return;
      const luz = luzNoCartao(ponteiro.x, ponteiro.y, cartao.getBoundingClientRect());
      cartao.style.setProperty('--luz-x', `${luz.x}px`);
      cartao.style.setProperty('--luz-y', `${luz.y}px`);
      cartao.setAttribute('data-luz-acesa', '');
    };

    const aoMover = (evento: PointerEvent) => {
      const sob = evento.target instanceof Element ? evento.target.closest<HTMLElement>('[data-luz]') : null;
      if (sob !== cartao) {
        apagar();
        cartao = sob;
      }
      if (!cartao) return;
      ponteiro = { x: evento.clientX, y: evento.clientY };
      if (!quadro) quadro = requestAnimationFrame(pintar);
    };
    const aoSoltar = (evento: PointerEvent) => {
      // A mouse is still over the card after it lets go; a finger is gone.
      if (evento.pointerType !== 'mouse') apagar();
    };

    raiz.addEventListener('pointermove', aoMover, { passive: true });
    raiz.addEventListener('pointerdown', aoMover, { passive: true });
    raiz.addEventListener('pointerup', aoSoltar);
    raiz.addEventListener('pointerleave', apagar);
    raiz.addEventListener('pointercancel', apagar);

    return () => {
      cancelAnimationFrame(quadro);
      apagar();
      raiz.removeEventListener('pointermove', aoMover);
      raiz.removeEventListener('pointerdown', aoMover);
      raiz.removeEventListener('pointerup', aoSoltar);
      raiz.removeEventListener('pointerleave', apagar);
      raiz.removeEventListener('pointercancel', apagar);
    };
  }, [raizRef]);
}
