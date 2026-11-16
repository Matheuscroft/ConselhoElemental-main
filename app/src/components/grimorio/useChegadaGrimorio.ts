import { useEffect, useState, type RefObject } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';

/** Which sections of the Grimoire were already seen, per opening of the app. */
const vistas = new Set<string>();

/**
 * Tells a section when it first scrolls into view, once per opening of the
 * app. Until then the arcs rest at zero and the line is undrawn, so they are
 * drawn in front of the person and not behind the fold. On a return visit, or
 * with reduced motion, it is true from the first render: nothing is staged
 * twice and nothing waits.
 */
export function useChegadaGrimorio(alvoRef: RefObject<Element | null>, chave: string): boolean {
  const reduzido = useMotionPreference();
  const [vista, setVista] = useState(() => vistas.has(chave));

  useEffect(() => {
    if (vistas.has(chave)) return;
    const alvo = alvoRef.current;
    if (!alvo) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada?.isIntersecting) return;
      vistas.add(chave);
      setVista(true);
      observador.disconnect();
    }, { threshold: 0.2 });
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [alvoRef, chave]);

  return reduzido || vista;
}
