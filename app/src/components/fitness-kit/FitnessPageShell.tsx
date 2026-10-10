import { LayoutGrid } from 'lucide-react';
import { AllRoutesSheet } from '@/components/layout/AllRoutesSheet';
import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface FitnessPageShellProps {
  children: React.ReactNode;
  /** Fluxo de escolha mobile, centralizado como tablet também no PC. */
  focused?: boolean;
  showPageMap?: boolean;
  /** Mantido por compatibilidade; reserva espaço para a navegação global. */
  withNav?: boolean;
  /** Reserva espaço no rodapé para um CTA fixo (ex.: barra de ações). */
  withFixedAction?: boolean;
  /** Conteúdo sem padding lateral (heroes de largura total). */
  bleed?: boolean;
  /** Remove o espaçamento superior (hero encosta no topo da tela). */
  flushTop?: boolean;
  className?: string;
}

/**
 * Casca de página do kit Health & Fitness.
 * Mobile: tela cheia no canvas escuro, respeitando safe areas.
 * Desktop: mantém a Sidebar global do app e centraliza uma coluna de ~448px.
 */
export const FitnessPageShell: React.FC<FitnessPageShellProps> = ({
  children,
  focused = false,
  showPageMap = true,
  withNav = false,
  withFixedAction = false,
  bleed = false,
  flushTop = false,
  className,
}) => {
  const [routesOpen, setRoutesOpen] = useState(false);
  const timerRunning = useAppStore((state) => state.timer.isRunning);
  const tickTimer = useAppStore((state) => state.tickTimer);

  // O AppLayout normalmente mantém o relógio do timer global; como esta casca
  // substitui o AppLayout no módulo, preservamos esse comportamento.
  useEffect(() => {
    if (!timerRunning) return undefined;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  const bottomPadding = withNav
    ? 'pb-[calc(8rem+env(safe-area-inset-bottom))]'
    : withFixedAction
      ? 'pb-[calc(7.5rem+env(safe-area-inset-bottom))]'
      : 'pb-[calc(2.5rem+env(safe-area-inset-bottom))]';

  return (
    <div className={cn('min-h-dvh font-sans text-fitness-text antialiased overflow-x-hidden', focused ? 'bg-fitness-canvas' : 'bg-transparent')}>
      <Sidebar />
      <AllRoutesSheet open={routesOpen} onOpenChange={setRoutesOpen} variant="fitness" />
      <main
        id="main-content"
        className={cn(
          'relative mx-auto',
          focused ? 'mx-auto max-w-xl md:ml-72 md:mr-0 md:max-w-none' : 'max-w-md md:ml-72 md:mr-0 md:max-w-none',
          !flushTop && 'pt-[calc(1.5rem+env(safe-area-inset-top))]',
          bottomPadding,
          className
        )}
      >
        {showPageMap && <div className={focused ? 'absolute right-6 top-[calc(1.5rem+env(safe-area-inset-top))] z-10' : 'mx-auto flex w-full justify-end px-6 pb-3 md:max-w-md'}>
          <button type="button" aria-label="Mapa de páginas" onClick={() => setRoutesOpen(true)} className={cn('flex min-h-11 items-center justify-center gap-2 rounded-full text-sm text-fitness-muted hover:text-fitness-text focus-visible:ring-2 focus-visible:ring-fitness-primary', focused ? 'w-11' : 'px-3')}>
            <LayoutGrid className="h-5 w-5" aria-hidden="true" /> {!focused && 'Todas as páginas'}
          </button>
        </div>}
        <div className={cn('mx-auto w-full', !focused && 'md:max-w-md', !bleed && 'px-6')}>{children}</div>
      </main>
      <MobileBottomNav />
    </div>
  );
};
