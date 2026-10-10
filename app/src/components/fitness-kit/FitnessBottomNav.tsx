import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Dumbbell, History, Plus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isActive: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  { id: 'workouts', label: 'Treinos', icon: Dumbbell, path: '/treinos', isActive: (p) => p === '/treinos' || p.startsWith('/treinos/preview') || p.startsWith('/treinos/plano') },
  { id: 'history', label: 'Histórico', icon: History, path: '/treinos/historico', isActive: (p) => p.startsWith('/treinos/historico') },
  { id: 'health', label: 'Saúde', icon: BarChart3, path: '/treinos/insights', isActive: (p) => p.startsWith('/treinos/insights') || p.startsWith('/treinos/semana') || p.startsWith('/treinos/corpo') || p.startsWith('/treinos/painel') },
];

export const NEW_WORKOUT_PATH = '/treinos?novo=1';

/** Abas internas do módulo, exibidas no topo das páginas principais de Fitness. */
export const FitnessTopTabs: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="mb-7 mt-2 flex justify-center">
      <nav aria-label="Seções de treino" className="grid w-full max-w-md grid-cols-3 rounded-2xl border border-white/10 bg-black/20 p-1.5">
        {ITEMS.map(({ id, label, icon: Icon, path, isActive }) => {
          const active = isActive(pathname);
          return (
            <button key={id} type="button" onClick={() => navigate(path)} aria-current={active ? 'page' : undefined}
              className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-mystic-cyan', active ? 'bg-mystic-cyan/15 text-mystic-cyan' : 'text-white/60 hover:bg-white/5 hover:text-white')}>
              <Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/** @deprecated Kept as an alias for legacy page imports; renders top tabs. */
export const FitnessBottomNav = FitnessTopTabs;

export const FitnessModuleFab: React.FC = () => <FitnessCreateWorkoutFab />;

/** Ação primária do módulo, elevada acima da navegação global. */
export const FitnessCreateWorkoutFab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(NEW_WORKOUT_PATH)} aria-label="Criar treino"
      className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-fitness-primary text-white shadow-fitness-primary outline-none transition-transform hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas md:right-8">
      <Plus className="h-7 w-7" aria-hidden="true" />
    </button>
  );
};
