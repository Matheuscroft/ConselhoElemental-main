import { useCallback, useEffect, useLayoutEffect, useRef, type HTMLAttributes } from 'react';

// On the server (the markup tests) a layout effect has nothing to measure.
const useEfeitoDeLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A row of tab buttons with one bar that slides between them, on the spring of
 * the system (`--ds-ease-conjure`, the only curve that overshoots). The buttons
 * stay exactly what they were: plain `aria-pressed` buttons, with their own
 * logic. This only reads which one is pressed and writes where it sits, to
 * `--aba-x` and `--aba-w` on the row, so nothing re-renders to move the bar.
 *
 * Until the first measurement the pressed button keeps its own underline, so
 * the bar is never missing.
 */
export function AbasDeslizantes({ className, children, ...resto }: HTMLAttributes<HTMLDivElement>) {
  const grupoRef = useRef<HTMLDivElement>(null);

  const medir = useCallback(() => {
    const grupo = grupoRef.current;
    if (!grupo) return;
    const ativa = grupo.querySelector<HTMLElement>(':scope > [aria-pressed="true"]');
    if (!ativa || ativa.offsetWidth === 0) {
      grupo.removeAttribute('data-pronto');
      return;
    }
    grupo.style.setProperty('--aba-x', `${ativa.offsetLeft}px`);
    grupo.style.setProperty('--aba-w', `${ativa.offsetWidth}px`);
    grupo.setAttribute('data-pronto', 'true');
  }, []);

  // After every render: the pressed button is whichever one the parent says.
  useEfeitoDeLayout(medir);

  // Width changes the buttons without a render: a font arriving, a rotation, a count growing a digit.
  useEffect(() => {
    const grupo = grupoRef.current;
    if (!grupo || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(grupo);
    for (const botao of grupo.children) observador.observe(botao);
    return () => observador.disconnect();
  }, [medir]);

  return (
    <div ref={grupoRef} className={className ? `aba-grupo ${className}` : 'aba-grupo'} {...resto}>
      {children}
      <span className="aba-indicador" aria-hidden="true" />
    </div>
  );
}

export default AbasDeslizantes;
