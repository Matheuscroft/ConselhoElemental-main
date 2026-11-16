import { useCallback, useEffect, useLayoutEffect, useRef, type HTMLAttributes } from 'react';

// On the server (the markup tests) a layout effect has nothing to measure.
const useEfeitoDeLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Where the thumb was when the last Temporal screen closed. Each view is its
 * own route, so this component is born again on every tab; without a memory
 * the thumb would simply appear on the new tab instead of travelling to it.
 */
let ultima: { x: number; w: number } | null = null;

/**
 * The view selector of the Temporal screens: a row of links with one lit thumb
 * that slides to the current one on the spring of the system
 * (`--ds-ease-conjure`, the only curve that overshoots). The links stay plain
 * links, with their own `aria-current`; this only reads which one is current
 * and writes where it sits, to `--aba-x` and `--aba-w`, so nothing re-renders
 * to move the thumb. On a page that belongs to none of them (the Moon, the
 * Seasons) the thumb stays out.
 */
export function AbasTemporais({ className, children, ...resto }: HTMLAttributes<HTMLElement>) {
  const grupoRef = useRef<HTMLElement>(null);

  const medir = useCallback(() => {
    const grupo = grupoRef.current;
    if (!grupo) return;
    const ativa = grupo.querySelector<HTMLElement>(':scope > a[aria-current="page"]');
    if (!ativa || ativa.offsetWidth === 0) {
      grupo.removeAttribute('data-pronto');
      return;
    }
    const destino = { x: ativa.offsetLeft, w: ativa.offsetWidth };
    if (!grupo.hasAttribute('data-pronto') && ultima) {
      // Start from where the last screen left the thumb, then let it travel.
      grupo.style.setProperty('--aba-x', `${ultima.x}px`);
      grupo.style.setProperty('--aba-w', `${ultima.w}px`);
      grupo.setAttribute('data-pronto', 'true');
      void grupo.offsetWidth;
    }
    grupo.style.setProperty('--aba-x', `${destino.x}px`);
    grupo.style.setProperty('--aba-w', `${destino.w}px`);
    grupo.setAttribute('data-pronto', 'true');
    ultima = destino;
  }, []);

  useEfeitoDeLayout(medir);

  // Width changes the links without a render: a font arriving, a rotation.
  useEffect(() => {
    const grupo = grupoRef.current;
    if (!grupo || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(grupo);
    for (const elo of grupo.querySelectorAll(':scope > a')) observador.observe(elo);
    return () => observador.disconnect();
  }, [medir]);

  return (
    <nav ref={grupoRef} className={className ? `temporal-abas ${className}` : 'temporal-abas'} {...resto}>
      {children}
      <i className="temporal-aba-marca" aria-hidden="true" />
    </nav>
  );
}

export default AbasTemporais;
