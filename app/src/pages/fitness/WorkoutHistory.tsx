import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { FitnessButton, FitnessBottomNav, FitnessEmptyState, FitnessPageShell, SectionHeader, WorkoutHistoryCard } from '@/components/fitness-kit';
import { mapSessionsToHistoryItems } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMonthLabel } from '@/lib/fitness-kit/format';
import { CATEGORY_ICONS } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';

export const WorkoutHistory: React.FC = () => {
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const sessions = useWorkoutStore(useShallow((state) => state.getWorkoutHistory()));
  const workouts = useWorkoutStore(useShallow((state) => state.getCompletedWorkouts()));
  const plannedWorkouts = useWorkoutStore(useShallow((state) => state.getPlannedWorkouts()));

  const items = useMemo(() => {
    const now = new Date();
    const scoped = showAll
      ? sessions
      : sessions.filter((session) => {
          const date = new Date(session.completedAt ?? session.startedAt);
          return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
        });
    const categoryByWorkoutId = new Map([...workouts, ...plannedWorkouts].map((workout) => [workout.id, workout.category]));
    return mapSessionsToHistoryItems(scoped, (workoutId) => categoryByWorkoutId.get(workoutId));
  }, [sessions, workouts, plannedWorkouts, showAll]);

  const hasAnyCompleted = sessions.some((session) => session.status === 'completed');
  const isMonthEmpty = items.length === 0 && hasAnyCompleted && !showAll;

  return (
    <FitnessPageShell withNav>
      <SectionHeader
        level="page"
        title={FITNESS_COPY.workouts}
        subtitle={showAll ? 'Todo o histórico' : formatMonthLabel()}
        actionLabel={hasAnyCompleted ? (showAll ? 'Este mês' : isMonthEmpty ? 'Ver tudo' : FITNESS_COPY.showAll) : undefined}
        onAction={() => setShowAll((current) => !current)}
      />

      <div className="mt-8 space-y-5">
        {items.length === 0 ? (
          <FitnessEmptyState
            message={hasAnyCompleted ? 'Nenhum treino registrado neste mês.' : FITNESS_COPY.empty.history}
            action={isMonthEmpty ? (
              <FitnessButton variant="primary" onClick={() => setShowAll(true)}>
                Ver todo o histórico
              </FitnessButton>
            ) : !hasAnyCompleted ? (
              <FitnessButton variant="primary" onClick={() => navigate('/treinos')}>
                Iniciar treino
              </FitnessButton>
            ) : undefined}
          />
        ) : (
          items.map((item) => (
            <WorkoutHistoryCard
              key={item.id}
              name={item.name}
              dateLabel={item.dateLabel}
              metricValue={item.metricValue}
              metricUnit={item.metricUnit}
              icon={CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.mixed}
              onClick={() => navigate(`/treinos/resumo/${item.id}`)}
            />
          ))
        )}
      </div>

      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
