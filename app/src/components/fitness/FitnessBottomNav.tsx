/**
 * FitnessBottomNav — pill navigation shared by the main Fitness screens.
 * The center action opens the "create workout" flow.
 */
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart3, CalendarDays, Dumbbell, LayoutGrid, Plus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AllRoutesSheet } from '@/components/layout/AllRoutesSheet';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const LEFT_ITEMS: NavItem[] = [
  { to: '/treinos', label: 'Treinos', icon: Dumbbell, end: true },
  { to: '/treinos/semana', label: 'Semana', icon: CalendarDays },
];

const RIGHT_ITEMS: NavItem[] = [
  { to: '/treinos/insights', label: 'Insights', icon: BarChart3 },
];

const NavEntry: React.FC<{ item: NavItem }> = ({ item }) => (
  <NavLink
    to={item.to}
    end={item.end}
    className={({ isActive }) =>
      cn(
        'flex-1 min-h-11 flex flex-col items-center justify-center gap-0.5 rounded-full text-[11px] transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary',
        isActive ? 'text-fitness-primary' : 'text-fitness-muted hover:text-fitness-text'
      )
    }
  >
    <item.icon className="w-5 h-5" aria-hidden="true" />
    <span>{item.label}</span>
  </NavLink>
);

export const FitnessBottomNav: React.FC = () => {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Navegação de treinos"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-[calc(1rem+env(safe-area-inset-bottom))] pointer-events-none"
      >
        <div className="pointer-events-auto relative flex w-full max-w-md items-center h-[72px] px-3 rounded-full bg-fitness-surface/90 backdrop-blur-xl shadow-fitness-elevated">
          {LEFT_ITEMS.map((item) => (
            <NavEntry key={item.to} item={item} />
          ))}
          <div className="flex-1 flex justify-center">
            <NavLink
              to="/treinos?novo=1"
              aria-label="Criar novo treino"
              className="-mt-8 w-14 h-14 rounded-full bg-fitness-primary text-white flex items-center justify-center shadow-fitness-primary transition-transform active:scale-95 hover:bg-fitness-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-lavender"
            >
              <Plus className="w-7 h-7" aria-hidden="true" />
            </NavLink>
          </div>
          {RIGHT_ITEMS.map((item) => (
            <NavEntry key={item.to} item={item} />
          ))}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="Mais páginas"
            aria-haspopup="dialog"
            className="flex-1 min-h-11 flex flex-col items-center justify-center gap-0.5 rounded-full text-[11px] text-fitness-muted hover:text-fitness-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
          >
            <LayoutGrid className="w-5 h-5" aria-hidden="true" />
            <span>Mais</span>
          </button>
        </div>
      </nav>

      <AllRoutesSheet open={moreOpen} onOpenChange={setMoreOpen} variant="fitness" />
    </>
  );
};
