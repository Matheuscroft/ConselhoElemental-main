import React from 'react';

interface FitnessStickyActionProps {
  children: React.ReactNode;
  /** Largura do conteúdo: `button` (botão único estreito) ou `row` (dois botões). */
  layout?: 'button' | 'row';
}

/** Barra de ação fixa no rodapé com degradê escuro, respeitando a safe area. */
export const FitnessStickyAction: React.FC<FitnessStickyActionProps> = ({ children, layout = 'button' }) => (
  <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-fitness-black via-fitness-black/90 to-transparent px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-10 md:left-72">
    <div className={layout === 'button' ? 'pointer-events-auto mx-auto flex max-w-md justify-center px-4' : 'pointer-events-auto mx-auto flex max-w-md gap-4'}>
      {children}
    </div>
  </div>
);
