import { useEffect, useState } from 'react';

/**
 * Which of the page's sections is being read: the one that crosses a band a little below the top of the screen.
 * Lets an in-page tab bar show where the reader is. Nothing is observed without IntersectionObserver.
 */
export function useSecaoAtiva(ids: readonly string[]): string | null {
  const [ativa, setAtiva] = useState<string | null>(ids[0] ?? null);
  const chave = ids.join('|');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const alvos = chave.split('|').map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!alvos.length) return;
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) if (entrada.isIntersecting) setAtiva(entrada.target.id);
    }, { rootMargin: '-25% 0px -65% 0px' });
    alvos.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, [chave]);
  return ativa;
}
