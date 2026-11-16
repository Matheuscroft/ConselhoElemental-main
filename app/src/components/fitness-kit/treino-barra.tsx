import { useEffect, useRef, type ReactNode } from 'react';
import './treino-uau.css';

/**
 * The bar of actions that floats over the content, above the global
 * navigation. It is the one real pane of glass of each training screen
 * (`.ds-glass-float`), and the only thing that stays under the thumb.
 */
export function TreinoBarraAcao({ children, onHeightChange }: { children: ReactNode; onHeightChange?: (height: number) => void }) {
  const barra = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const elemento = barra.current;
    if (!elemento || !onHeightChange) return;
    const medir = () => onHeightChange(elemento.getBoundingClientRect().height);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [onHeightChange]);
  return <div ref={barra} className="treino-barra ds-glass-float">{children}</div>;
}
