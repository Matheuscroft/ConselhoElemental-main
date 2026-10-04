import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { APP_ROUTES, type RouteGroup } from '@/lib/app-routes';
import { cn } from '@/lib/utils';

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className={cn('max-h-[85dvh] overflow-y-auto rounded-t-3xl', styles.content)}>
        <SheetHeader>
          <SheetTitle className={styles.title}>Todas as páginas</SheetTitle>
          <SheetDescription className="sr-only">Escolha uma página para abrir</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-5">
          {GROUPS.map((group) => (
            <section key={group} aria-label={group}>
              <h3 className={cn('text-xs font-semibold mb-2', styles.group)}>{group}</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {APP_ROUTES.filter((route) => route.group === group).map((route) => {
                  const isActive = pathname === route.path;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => {
                        onOpenChange(false);
                        navigate(route.path);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
                        isActive ? styles.tileActive : styles.tile
                      )}
                    >
                      <route.icon className={cn('w-5 h-5', styles.icon)} aria-hidden="true" />
                      <span className="text-[11px] font-medium leading-tight">{route.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};
