import { useCallback, useEffect, useLayoutEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';

// On the server (the markup tests) a layout effect has nothing to measure.
const useEfeitoDeLayout = typeof window === 'undefined' ? useEffect : useLayoutEffect;

const ATIVA = ':scope > :is([aria-pressed="true"], [aria-current="page"])';

interface ElementoAbasProps extends HTMLAttributes<HTMLElement> {
  /** `nav` for links, `div` for a group of buttons. */
  tag?: 'nav' | 'div';
  children: ReactNode;
}

/**
 * A row of tabs with one marker that slides under the active one, on the
 * spring of the system. The tabs stay what they were (links with
 * `aria-current`, or buttons with `aria-pressed`) and keep their own logic:
 * this only reads which one is active and writes where it sits to `--aba-x`
 * and `--aba-w`, so nothing re-renders to move the marker. The first
 * measurement is placed without travelling; every later one slides.
 */
export function ElementoAbas({ tag: Tag = 'div', className, children, ...resto }: ElementoAbasProps) {
  const grupoRef = useRef<HTMLElement>(null);

  const medir = useCallback(() => {
    const grupo = grupoRef.current;
    if (!grupo) return;
    const ativa = grupo.querySelector<HTMLElement>(ATIVA);
    if (!ativa || ativa.offsetWidth === 0) {
      grupo.removeAttribute('data-pronto');
      return;
    }
    grupo.style.setProperty('--aba-x', `${ativa.offsetLeft}px`);
    grupo.style.setProperty('--aba-w', `${ativa.offsetWidth}px`);
    grupo.setAttribute('data-pronto', 'true');
  }, []);

  useEfeitoDeLayout(medir);

  // From the second frame on the marker may travel; the first placement never does.
  useEffect(() => {
    const quadro = requestAnimationFrame(() => grupoRef.current?.setAttribute('data-anima', 'true'));
    return () => cancelAnimationFrame(quadro);
  }, []);

  // Width changes the tabs without a render: a font arriving, a rotation, a count growing a digit.
  useEffect(() => {
    const grupo = grupoRef.current;
    if (!grupo || typeof ResizeObserver === 'undefined') return;
    const observador = new ResizeObserver(medir);
    observador.observe(grupo);
    for (const aba of grupo.children) observador.observe(aba);
    return () => observador.disconnect();
  }, [medir]);

  return <Tag ref={grupoRef as never} className={className ? `elemento-abas ${className}` : 'elemento-abas'} {...resto}>
    <span className="elemento-abas-marca" aria-hidden="true" />
    {children}
  </Tag>;
}

export default ElementoAbas;
