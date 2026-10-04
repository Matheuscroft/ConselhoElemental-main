/**
 * Mapa — index of every page with how it can be reached and a short live status.
 * Route: /mapa
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const navigate = useNavigate();
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
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="font-mystic text-xl">Mapa de páginas</h2>
        <p className="text-sm text-white/50">
          {APP_ROUTES.length} páginas navegáveis · {INTERNAL_ROUTES.length} rotas internas
          {hiddenCount > 0 && ` · ${hiddenCount} sem acesso por menu`}
        </p>
      </motion.div>

      {GROUPS.map((group) => (
        <section key={group} aria-label={group} className="mb-6">
          <h3 className="font-mystic text-sm text-mystic-gold mb-2.5">{group}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {APP_ROUTES.filter((route) => route.group === group).map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => navigate(route.path)}
                className="text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mystic-cyan"
              >
                <GlassCard className="p-3.5 h-full hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
                      <route.icon className="w-5 h-5 text-mystic-arcane" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white truncate">{route.label}</p>
                      <p className="text-[11px] text-white/50">{route.description}</p>
                      <p className="text-[10px] font-mono text-white/30 mt-0.5">{route.path}</p>
                      {liveStatus[route.id] && (
                        <p className="text-[11px] text-mystic-gold mt-1">{liveStatus[route.id]}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">{accessChips(route)}</div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        </section>
      ))}

      <section aria-label="Rotas internas" className="mb-6">
        <h3 className="font-mystic text-sm text-mystic-gold mb-2.5">Rotas internas</h3>
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
      </section>
    </AppLayout>
  );
};
