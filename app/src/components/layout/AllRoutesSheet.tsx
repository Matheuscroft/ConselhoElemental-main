import { NavigationGroup } from '@/components/elemental/NavigationCards';
import { RouteIcon } from '@/components/elemental/ArcaneIcon';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
  const search = query.trim();
  const routes = filterNavigationRoutes(APP_ROUTES, query);
  const changeOpen = (next: boolean) => {
    if (!next) setQuery('');
    onOpenChange(next);
  };

  return (
    <Sheet open={open} onOpenChange={changeOpen}>
      <SheetContent side="bottom" className={cn('max-h-[85dvh] overflow-y-auto rounded-t-3xl', styles.content)}>
        <SheetHeader>
          <SheetTitle className={styles.title}>Todas as páginas</SheetTitle>
          <SheetDescription>Encontre o que você quer fazer e continue sua jornada.</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5">
          <label className="elemental-route-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar páginas do app</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar ritual, treino, calendário…" /></label>
          {search && <p className="text-sm text-fitness-muted" role="status">{routes.length} páginas encontradas</p>}
          {routes.length === 0 && <button type="button" className="min-h-11 text-mystic-gold" onClick={() => setQuery('')}>Limpar busca e ver todas</button>}
          {GROUPS.filter((group) => routes.some((route) => route.group === group)).map((group) => (
            <NavigationGroup key={group} group={group} count={routes.filter((route) => route.group === group).length} initiallyOpen={APP_ROUTES.some((route) => route.group === group && route.path === pathname)} reveal={!!search}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                        'flex min-h-20 flex-col items-center justify-center gap-2 p-3 rounded-xl text-center transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
                        isActive ? styles.tileActive : styles.tile
                      )}
                    >
                      <RouteIcon routeId={route.id} size={24} className={styles.icon} />
                      <span className="text-xs font-medium leading-snug">{route.label}</span>
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
