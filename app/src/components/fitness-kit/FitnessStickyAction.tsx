import React, { useEffect, useRef } from 'react';

interface FitnessStickyActionProps {
  children: React.ReactNode;
  /** Largura do conteúdo: `button` (botão único estreito) ou `row` (dois botões). */
  focused?: boolean;
  layout?: 'button' | 'row';
  onHeightChange?: (height: number) => void;
}

/** Barra de ação fixa acima da navegação global, respeitando a safe area. */
export const FitnessStickyAction: React.FC<FitnessStickyActionProps> = ({ children, layout = 'button', onHeightChange }) => {
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
  <div ref={actionRef} className={`pointer-events-none fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 border-t border-white/10 bg-fitness-canvas/95 px-6 pb-3 pt-3 md:pb-[calc(1rem+env(safe-area-inset-bottom))] md:left-72`}>
    <div className={layout === 'button' ? 'pointer-events-auto mx-auto flex max-w-md justify-center px-4' : 'pointer-events-auto mx-auto flex max-w-md gap-4'}>
      {children}
    </div>
  </div>
  );
};
