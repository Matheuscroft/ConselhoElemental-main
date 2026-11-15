import { useEffect, useRef, useState, type RefObject } from 'react';

/** The first sight of the balance, per opening of the app. Coming back is not an arrival. */
let equilibrioJaVisto = false;

/**
 * Tells a panel when it first scrolls into view, once per opening of the app.
 * Until then `chegou` is false, so the arcs can rest at zero and the numbers
 * can count up to the real ones in front of the person, not behind the fold.
 * On a return visit it is true from the first render: nothing is staged twice.
 */
export function useChegada(alvoRef: RefObject<Element | null>): boolean {
  const [chegou, setChegou] = useState(() => equilibrioJaVisto);
  const jaVisto = useRef(equilibrioJaVisto);

  useEffect(() => {
    if (jaVisto.current) return;
    const alvo = alvoRef.current;
    if (!alvo) return;
    const observador = new IntersectionObserver(([entrada]) => {
      if (!entrada?.isIntersecting) return;
      equilibrioJaVisto = true;
      jaVisto.current = true;
      setChegou(true);
      observador.disconnect();
    }, { threshold: 0.35 });
    observador.observe(alvo);
    return () => observador.disconnect();
  }, [alvoRef]);

  return chegou;
}
