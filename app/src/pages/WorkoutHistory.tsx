/**
 * WorkoutHistory — "Workouts" list grouped by month, built from real sessions.
 * Route: /treinos/historico
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessBottomNav,
  WorkoutHistoryCard,
} from '@/components/fitness';
import { useWorkoutStore } from '@/stores/workoutStore';
import { CATEGORY_ICONS, formatVolume } from '@/lib/workout';
import { formatDayOfMonth, formatDurationCompact } from '@/lib/fitness/fitness-format';
import { groupSessionsByMonth } from '@/lib/fitness/fitness-insights';
import type { WorkoutSession } from '@/types/workout';

export const WorkoutHistory: React.FC = () => {
  const navigate = useNavigate();
  const { getWorkoutHistory, getWorkoutById } = useWorkoutStore();

  const groups = useMemo(() => groupSessionsByMonth(getWorkoutHistory()), [getWorkoutHistory]);

  const metricFor = (session: WorkoutSession): { value?: string | number; unit?: string } => {
    if (session.status !== 'completed') return { value: 'Em andamento' };
    if (session.totalVolume > 0) return { value: formatVolume(session.totalVolume) };
    return { value: formatDurationCompact(Math.round(session.durationSeconds / 60)) };
  };

  return (
    <FitnessPageShell navOffset className="max-w-md mx-auto w-full">
      <FitnessHeader title="Workouts" subtitle={groups[0]?.label} onBack={() => navigate('/treinos')} />

      <div className="mt-8 space-y-8">
        {groups.length === 0 && (
          <p className="text-sm text-fitness-muted text-center py-16">Nenhum treino registrado ainda.</p>
        )}
        {groups.map((group) => (
          <section key={group.key} aria-label={group.label}>
            <h2 className="text-[13px] font-medium text-fitness-muted capitalize mb-3">{group.label}</h2>
            <div className="space-y-5">
              {group.sessions.map((session) => {
                const workout = getWorkoutById(session.workoutId);
                const Icon = CATEGORY_ICONS[workout?.category ?? 'mixed'] ?? Dumbbell;
                const metric = metricFor(session);
                return (
                  <WorkoutHistoryCard
                    key={session.id}
                    name={session.workoutNameSnapshot}
                    dateLabel={formatDayOfMonth(session.startedAt)}
                    metricValue={metric.value}
                    metricUnit={metric.unit}
                    icon={Icon}
                    onClick={() =>
                      navigate(
                        session.status === 'in_progress'
                          ? `/treinos/ativo/${session.id}`
                          : `/treinos/resumo/${session.id}`
                      )
                    }
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
