import { NavigationGroup } from '@/components/elemental/NavigationCards';
import { RouteIcon } from '@/components/elemental/ArcaneIcon';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { APP_ROUTES, type RouteGroup } from '@/lib/app-routes';
import { cn } from '@/lib/utils';
import { filterNavigationRoutes } from '@/components/elemental/navigation';

const GROUPS: RouteGroup[] = ['Núcleo', 'Tempo e ciclos', 'Treino', 'Domínios'];

interface AllRoutesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant?: 'mystic' | 'fitness';
}

const STYLES = {
  mystic: {
    content: 'bg-void border-white/10 text-white',
    title: 'font-mystic text-white',
    group: 'text-mystic-gold',
    tile: 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/80',
    tileActive: 'bg-mystic-arcane/20 border-mystic-arcane/40 text-white',
    icon: 'text-mystic-gold',
  },
  fitness: {
    content: 'bg-fitness-canvas border-fitness-surface-hover text-fitness-text',
    title: 'text-fitness-text',
    group: 'text-fitness-primary',
    tile: 'bg-fitness-surface hover:bg-fitness-surface-hover text-fitness-text',
    tileActive: 'bg-fitness-primary/20 text-fitness-primary',
    icon: 'text-fitness-primary',
  },
} as const;

/** Bottom sheet listing every navigable page, grouped. */
export const AllRoutesSheet: React.FC<AllRoutesSheetProps> = ({ open, onOpenChange, variant = 'mystic' }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const styles = STYLES[variant];
  const [query, setQuery] = useState('');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [viewport, setViewport] = useState<{ top: number; height: number } | null>(null);
  useEffect(() => {
    if (!open || !window.visualViewport) return;
    const visible = window.visualViewport;
    const update = () => {
      const height = Math.min(visible.height * .94, 832);
      const top = visible.offsetTop + visible.height - height;
      setViewport(current => current?.height === height && current?.top === top ? current : { top, height });
    };
    update();
    visible.addEventListener('resize', update); visible.addEventListener('scroll', update);
    return () => { visible.removeEventListener('resize', update); visible.removeEventListener('scroll', update); };
  }, [open]);
  const quickActions = [{ id: 'invocar', label: 'Nova atividade' }, { id: 'ciclos', label: 'Minha rotina' }, { id: 'grimorio', label: 'Meu progresso' }];
  const search = query.trim();
  const routes = filterNavigationRoutes(APP_ROUTES, query);
  const changeOpen = (next: boolean) => {
    if (!next) setQuery('');
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetContent side="bottom" style={viewport ? { top: viewport.top, height: viewport.height, bottom: 'auto' } : undefined} onOpenAutoFocus={event => { event.preventDefault(); titleRef.current?.focus(); }} className={cn('all-routes-sheet h-[min(92dvh,52rem)] max-h-[calc(100dvh_-_env(safe-area-inset-top))] gap-0 overflow-hidden rounded-t-3xl p-0', styles.content)}>
        <div className="shrink-0 border-b border-white/10 px-4 pb-3 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-current/25" aria-hidden="true" />
          <SheetHeader className="gap-1 p-0 pr-10">
            <SheetTitle ref={titleRef} tabIndex={-1} className={styles.title}>Todas as páginas</SheetTitle>
            <SheetDescription>Encontre o que você quer fazer e continue sua jornada.</SheetDescription>
          </SheetHeader>
          <label className="elemental-route-search mt-3"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar páginas do app</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ritual, treino, calendário…" /></label>
          {search && <p className="mt-2 text-sm text-fitness-muted" role="status">{routes.length} páginas encontradas</p>}
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4">
          {routes.length === 0 && <button type="button" className="min-h-11 text-mystic-gold" onClick={() => setQuery('')}>Limpar busca e ver todas</button>}
          {!search && <nav className="mobile-quick-actions" aria-label="O que você quer fazer?">{quickActions.map(action => {
            const route = APP_ROUTES.find(item => item.id === action.id)!;
            return <button key={action.id} type="button" onClick={() => { changeOpen(false); navigate(route.path); }}><RouteIcon routeId={action.id} size={22} /><span>{action.label}</span></button>;
          })}</nav>}
          {GROUPS.filter((group) => routes.some((route) => route.group === group)).map((group) => (
            <NavigationGroup key={group} group={group} count={routes.filter((route) => route.group === group).length} initiallyOpen={APP_ROUTES.some((route) => route.group === group && route.path === pathname)} reveal={!!search}>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {routes.filter((route) => route.group === group).map((route) => {
                  const isActive = pathname === route.path;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        changeOpen(false);
                        navigate(route.path);
                      }}
                      className={cn(
                        'flex min-h-[60px] flex-row items-center justify-start gap-3 rounded-xl px-4 py-3 text-left transition-colors sm:min-h-20 sm:flex-col sm:justify-center sm:gap-2 sm:p-3 sm:text-center',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
                        isActive ? styles.tileActive : styles.tile
                      )}
                    >
                      <RouteIcon routeId={route.id} size={22} className={cn(styles.icon, 'shrink-0 sm:size-6')} />
                      <span className="route-page-label min-w-0 flex-1 text-sm font-medium leading-snug sm:flex-initial sm:text-xs"><strong>{route.label}</strong><small>{route.description}</small></span>
                      <ArrowRight size={16} aria-hidden="true" className="shrink-0 opacity-60 sm:hidden" />
                    </button>
                  );
                })}
              </div>
            </NavigationGroup>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
