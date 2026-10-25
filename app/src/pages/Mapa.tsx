/**
 * Mapa — index of every page with how it can be reached and a short live status.
 * Route: /mapa
 */
import React from 'react';
import { AppLayout } from '@/components/layout';
import { PageAtlas } from '@/components/elemental/PageAtlas';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import '@/components/elemental/page-atlas.css';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';
import { APP_ROUTES, INTERNAL_ROUTES } from '@/lib/app-routes';

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

  return (
    <AppLayout showAura={false}>
      <header className="page-atlas-heading"><span><ArcaneIcon name="mapa" size={32} /></span><div><h1>Mapa de páginas</h1><p>Encontre seu próximo passo. Busque uma atividade ou abra uma categoria.</p></div></header>
      <PageAtlas routes={APP_ROUTES} liveStatus={liveStatus} />

      <details className="elemental-internal-routes">
        <summary>Onde encontro os detalhes de cada atividade?</summary>
        <div className="page-atlas-internal">
          <ul className="space-y-2.5">
            {INTERNAL_ROUTES.map((route) => (
              <li key={route.pattern}>
                <p className="text-sm text-white">{route.label}</p>
                <p className="text-sm text-white/60">Abre a partir de: {route.opensFrom}</p>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </AppLayout>
  );
};
