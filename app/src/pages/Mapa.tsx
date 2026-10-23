import { NavigationGroup, RouteShowcase } from '@/components/elemental/NavigationCards';
/**
 * Mapa — index of every page with how it can be reached and a short live status.
 * Route: /mapa
 */
import React from 'react';
import { AppLayout } from '@/components/layout';
import { GlassCard } from '@/components/ui/glass-card';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { APP_ROUTES, INTERNAL_ROUTES, type AppRoute, type RouteGroup } from '@/lib/app-routes';

const GROUPS: RouteGroup[] = ['Núcleo', 'Tempo e ciclos', 'Treino', 'Domínios'];

const Chip: React.FC<{ tone: 'ok' | 'warn'; children: React.ReactNode }> = ({ tone, children }) => (
  <span
    className={`text-[10px] px-2 py-0.5 rounded-full border ${
      tone === 'ok'
        ? 'text-mystic-cyan border-mystic-cyan/30 bg-mystic-cyan/10'
        : 'text-amber-300 border-amber-400/30 bg-amber-500/10'
    }`}
  >
    {children}
  </span>
);

const accessChips = (route: AppRoute): React.ReactNode[] => {
  const chips: React.ReactNode[] = [];
  if (route.sidebar) chips.push(<Chip key="side" tone="ok">Menu lateral</Chip>);
  if (route.mobile === 'bar') chips.push(<Chip key="bar" tone="ok">Barra mobile</Chip>);
  if (route.mobile === 'more') chips.push(<Chip key="more" tone="ok">Mobile · Mais</Chip>);
  if (route.via) chips.push(<Chip key="via" tone="ok">Via {route.via}</Chip>);
  if (chips.length === 0) chips.push(<Chip key="hidden" tone="warn">Oculta</Chip>);
  return chips;
};

export const Mapa: React.FC = () => {
  const { getCompletedTasksToday, getCompletedHabitsToday, getStreak } = useAppStore();
  const { getPlannedWorkouts, getActiveSession, getWorkoutStats } = useWorkoutStore();

  const activeSession = getActiveSession();
  const stats = getWorkoutStats();

  const liveStatus: Record<string, string> = {
    santuario: `Sequência de ${getStreak()} dia(s)`,
    rituais: `${getCompletedTasksToday()} concluído(s) hoje`,
    ciclos: `${getCompletedHabitsToday()} hábito(s) hoje`,
    treinos: activeSession ? 'Sessão em andamento' : `${getPlannedWorkouts().length} planejado(s)`,
    'treinos-historico': `${stats.completedWorkouts} concluído(s)`,
  };

  const hiddenCount = APP_ROUTES.filter((route) => !route.sidebar && !route.mobile && !route.via).length;

  return (
    <AppLayout showAura={false}>
      <header className="mb-6">
        <h2 className="font-mystic text-xl">Mapa de páginas</h2>
        <p className="text-sm text-white/50">
          {APP_ROUTES.length} páginas navegáveis · {INTERNAL_ROUTES.length} rotas internas
          {hiddenCount > 0 && ` · ${hiddenCount} sem acesso por menu`}
        </p>
      </header>

      <div className="elemental-atlas">
        {GROUPS.map((group) => {
          const routes = APP_ROUTES.filter((route) => route.group === group);
          return <NavigationGroup key={group} group={group} count={routes.length} initiallyOpen={group === 'Núcleo'}>
            <div className="elemental-route-grid">{routes.map((route) => <RouteShowcase key={route.id} route={route} status={liveStatus[route.id]}>{accessChips(route)}</RouteShowcase>)}</div>
          </NavigationGroup>;
        })}
      </div>

      <details className="elemental-internal-routes">
        <summary>Fluxos acessados dentro das páginas</summary>
        <GlassCard className="p-3.5">
          <ul className="space-y-2.5">
            {INTERNAL_ROUTES.map((route) => (
              <li key={route.pattern}>
                <p className="text-sm text-white">{route.label}</p>
                <p className="text-[10px] font-mono text-white/30">{route.pattern}</p>
                <p className="text-[11px] text-white/50">Abre a partir de: {route.opensFrom}</p>
              </li>
            ))}
          </ul>
        </GlassCard>
      </details>
    </AppLayout>
  );
};
