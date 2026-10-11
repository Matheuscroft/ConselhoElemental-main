import React, { useEffect, useRef } from 'react';

interface FitnessStickyActionProps {
  children: React.ReactNode;
  /** Largura do conteúdo: `button` (botão único estreito) ou `row` (dois botões). */
  focused?: boolean;
  layout?: 'button' | 'row';
  onHeightChange?: (height: number) => void;
}

/** Barra de ação fixa no rodapé com degradê escuro, respeitando a safe area. */
export const FitnessStickyAction: React.FC<FitnessStickyActionProps> = ({ children, layout = 'button', focused = false, onHeightChange }) => {
  const actionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = actionRef.current;
    if (!element || !onHeightChange) return;
    const measure = () => onHeightChange(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [onHeightChange]);
  return (
  <div ref={actionRef} className={`pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-fitness-canvas/95 border-t border-white/10 px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 ${focused ? '' : 'md:left-72'}`}>
    <div className={layout === 'button' ? 'pointer-events-auto mx-auto flex max-w-md justify-center px-4' : 'pointer-events-auto mx-auto flex max-w-md gap-4'}>
      {children}
    </div>
  </div>
  );
};
