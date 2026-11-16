import { useEffect, useRef, type RefObject } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import type { ElementId } from '@/types';
import { criarCena, type CenaFoco } from './foco-cena';

/** Energy of the scene while the session runs and while it waits. */
const ENERGIA_EM_FOCO = 1;
const ENERGIA_PAUSADA = 0.28;

export interface RajadaFoco {
  /** Changes every time a burst is wanted. */
  readonly n: number;
  readonly forca: number;
}

/**
 * The canvas of the focus screen. Decorative only: it knows the element, whether
 * the session runs and when a burst of light is wanted, and nothing about time or
 * reward. For someone who asked for less motion it draws nothing at all, and the
 * stylesheet's still light is the whole scene.
 */
export function FocoCena({ element, running, rajada, centroRef }: {
  element: ElementId;
  running: boolean;
  rajada: RajadaFoco;
  /** The element the burst leaves from (the ring), so it starts where the eye is. */
  centroRef: RefObject<HTMLElement | null>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const cena = useRef<CenaFoco | null>(null);
  const energia = useRef(running ? ENERGIA_EM_FOCO : ENERGIA_PAUSADA);
  const reduzido = useMotionPreference();

  useEffect(() => { energia.current = running ? ENERGIA_EM_FOCO : ENERGIA_PAUSADA; }, [running]);

  useEffect(() => {
    const alvo = canvas.current;
    if (!alvo || reduzido) return;
    const criada = criarCena(alvo, element, () => energia.current);
    cena.current = criada;
    return () => { criada?.parar(); cena.current = null; };
  }, [element, reduzido]);

  useEffect(() => {
    if (!rajada.n || !canvas.current || !centroRef.current) return;
    const tela = canvas.current.getBoundingClientRect();
    const centro = centroRef.current.getBoundingClientRect();
    if (!tela.width || !tela.height) return;
    cena.current?.rajada((centro.left + centro.width / 2 - tela.left) / tela.width, (centro.top + centro.height / 2 - tela.top) / tela.height, rajada.forca);
  }, [rajada, centroRef]);

  return <canvas ref={canvas} className="foco-canvas" aria-hidden="true" />;
}
