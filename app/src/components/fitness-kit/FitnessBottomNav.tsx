import React, { useContext } from 'react';
import { FitnessEmbeddedContext } from './FitnessEmbeddedContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Dumbbell, History, Activity, Plus, type LucideIcon } from 'lucide-react';
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
  { id: 'history', label: 'Histórico', icon: History, path: '/treinos?tab=history', isActive: (p) => p.startsWith('/treinos/historico') },
  { id: 'body', label: 'Corpo', icon: Activity, path: '/treinos?tab=body', isActive: p => p.startsWith('/treinos/corpo') },
  { id: 'health', label: 'Saúde', icon: BarChart3, path: '/treinos?tab=health', isActive: (p) => p.startsWith('/treinos/insights') || p.startsWith('/treinos/semana') || p.startsWith('/treinos/painel') },
];

export const NEW_WORKOUT_PATH = '/treinos?novo=1';

/** Abas internas do módulo, exibidas no topo das páginas principais de Fitness. */
export const FitnessTopTabs: React.FC = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const embedded = useContext(FitnessEmbeddedContext);
  if (embedded) return null;

  return (
    <div className="mb-7 mt-2 flex justify-center">
      <nav aria-label="Seções de treino" className="grid w-full max-w-md grid-cols-4 rounded-2xl bg-fitness-surface p-1.5">
        {ITEMS.map(({ id, label, icon: Icon, path, isActive }) => {
          const active = new URLSearchParams(search).get('tab') === id || (!new URLSearchParams(search).has('tab') && isActive(pathname));
          return (
            <button key={id} type="button" onClick={() => navigate(path)} aria-current={active ? 'page' : undefined}
              className={cn('flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-fitness-primary', active ? 'bg-fitness-primary text-white' : 'text-white/60 hover:bg-white/5 hover:text-white')}>
              <Icon className="hidden h-4 w-4 sm:block" aria-hidden="true" /><span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

/** @deprecated Kept as an alias for legacy page imports; renders top tabs. */
export const FitnessBottomNav = FitnessTopTabs;

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

/** Alias compatível com imports existentes; declarado após o componente para evitar TDZ. */
export const FitnessModuleFab = FitnessCreateWorkoutFab;
