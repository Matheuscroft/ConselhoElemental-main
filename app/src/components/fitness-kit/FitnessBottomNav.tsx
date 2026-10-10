import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Dumbbell, History, Home, Plus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isActive: (pathname: string) => boolean;
}

const WORKOUT_FLOW_PREFIXES = ['/treinos/preview', '/treinos/plano', '/treinos/ativo', '/treinos/resumo'];

const ITEMS: NavItem[] = [
  { id: 'home', label: 'Início', icon: Home, path: '/treinos/painel', isActive: (p) => p === '/treinos/painel' },
  {
    id: 'workouts',
    label: 'Treinos',
    icon: Dumbbell,
    path: '/treinos',
    isActive: (p) => p === '/treinos' || WORKOUT_FLOW_PREFIXES.some((prefix) => p.startsWith(prefix)),
  },
  {
    id: 'insights',
    label: 'Saúde',
    icon: BarChart3,
    path: '/treinos/insights',
    isActive: (p) => p.startsWith('/treinos/insights') || p.startsWith('/treinos/semana') || p.startsWith('/treinos/corpo'),
  },
  { id: 'history', label: 'Histórico', icon: History, path: '/treinos/historico', isActive: (p) => p.startsWith('/treinos/historico') },
];

/** Rota que abre o diálogo "Novo treino" já existente em WorkoutSelect. */
export const NEW_WORKOUT_PATH = '/treinos?novo=1';

/** Navegação inferior do módulo: pílula surface, botão central elevado. */
export const FitnessBottomNav: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const renderItem = (item: NavItem) => {
    const active = item.isActive(pathname);
    const Icon = item.icon;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => navigate(item.path)}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-h-11 min-w-11 flex-col items-center justify-center gap-1 rounded-2xl px-1 text-[11px] outline-none transition-colors',
          'focus-visible:ring-2 focus-visible:ring-fitness-primary',
          active ? 'text-fitness-primary' : 'text-fitness-muted hover:text-fitness-text'
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] md:left-72">
      <nav
        aria-label="Navegação de treinos"
        className="pointer-events-auto mx-auto grid h-[72px] max-w-md grid-cols-5 items-center rounded-full bg-fitness-surface/90 px-3 shadow-fitness-elevated backdrop-blur-xl"
      >
        {renderItem(ITEMS[0])}
        {renderItem(ITEMS[1])}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate(NEW_WORKOUT_PATH)}
            aria-label="Novo treino"
            className="grid h-[60px] w-[60px] place-items-center rounded-full bg-fitness-primary text-white shadow-fitness-primary outline-none transition-[filter,transform] duration-200 hover:brightness-110 active:scale-95 focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-surface"
          >
            <Plus className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        {renderItem(ITEMS[2])}
        {renderItem(ITEMS[3])}
      </nav>
    </div>
  );
};
