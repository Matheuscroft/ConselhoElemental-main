import { FITNESS_ICONS } from './FitnessGlyph';
import React, { useContext } from 'react';
import { FitnessEmbeddedContext } from './FitnessEmbeddedContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, History, Activity, Plus, type LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  isActive: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  { id: 'workouts', label: 'Treinos', icon: FITNESS_ICONS.strength, path: '/treinos', isActive: (p) => p === '/treinos' || p.startsWith('/treinos/preview') || p.startsWith('/treinos/plano') },
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

  const params = new URLSearchParams(search);
  const ativo = ITEMS.find(({ id, isActive }) => params.get('tab') === id || (!params.has('tab') && isActive(pathname)))?.id;

  return (
    <div className="mb-7 mt-2 flex justify-center">
      <nav aria-label="Seções de treino" data-ativa={ativo} className="fitness-elemental-tabs tr-abas ds-pane grid w-full max-w-md grid-cols-4">
        <span className="tr-abas-indicador" aria-hidden="true" />
        {ITEMS.map(({ id, label, icon: Icon, path }) => (
          <button key={id} type="button" onClick={() => navigate(path)} aria-current={ativo === id ? 'page' : undefined}
            className="tr-aba outline-none">
            <Icon className="hidden h-4 w-4 sm:block" aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
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
      className="tr-fab fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-2xl border border-[rgb(var(--el-gold)/0.5)] bg-[rgb(var(--el-gold))] text-[rgb(var(--el-canvas))] shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary focus-visible:ring-offset-2 focus-visible:ring-offset-fitness-canvas md:right-8">
      <Plus className="h-7 w-7" aria-hidden="true" />
    </button>
  );
};

/** Alias compatível com imports existentes; declarado após o componente para evitar TDZ. */
export const FitnessModuleFab = FitnessCreateWorkoutFab;
