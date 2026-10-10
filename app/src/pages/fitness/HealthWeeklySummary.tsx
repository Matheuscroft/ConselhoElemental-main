import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  ChartWidget,
  FitnessTopTabs,
  FitnessCard,
  FitnessPageShell,
  MiniSparkline,
  SectionHeader,
  WeeklyBars,
} from '@/components/fitness-kit';
import { buildWeekBuckets } from '@/lib/fitness-kit/adapters';
import { DAILY_EXERCISE_GOAL_MINUTES } from '@/lib/fitness-kit/constants';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { useWeekStartsOnPreference } from '@/lib/temporal';
import { useWorkoutStore } from '@/stores/workoutStore';

export const HealthWeeklySummary: React.FC = () => {
  const navigate = useNavigate();
  const sessions = useWorkoutStore(useShallow((state) => state.getWorkoutHistory()));
  const { weekStartsOn } = useWeekStartsOnPreference();

  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn), [sessions, weekStartsOn]);
  const hasData = week.some((day) => day.sessionCount > 0);
  const limit = Math.max(DAILY_EXERCISE_GOAL_MINUTES, Math.ceil(Math.max(...week.map((day) => day.minutes))));
  const today = new Date();
  const visibleDays = week.filter((day) => day.date.getTime() <= today.getTime());

  return (
    <FitnessPageShell withNav>
      <FitnessTopTabs />
      <SectionHeader
        level="page"
        title={FITNESS_COPY.weeklySummary}
        subtitle={FITNESS_COPY.thisWeek}
        actionLabel="Ver histórico"
        onAction={() => navigate('/treinos/historico')}
      />

      <div className="mt-8 space-y-5">
        <ChartWidget
          title="Minutos de exercício"
          radius="lg"
          className="p-6"
          emptyMessage={hasData ? undefined : FITNESS_COPY.empty.weekly}
        >
          <WeeklyBars
            data={week.map((day) => ({ label: day.initial, value: day.minutes, caption: `${day.fullLabel}: ${formatMinutes(day.minutes)}` }))}
            max={limit}
            limitLabel={formatMinutes(limit)}
            ariaLabel="Minutos de exercício por dia nesta semana"
          />
        </ChartWidget>

        <div className="space-y-3" role="list" aria-label="Dias da semana">
          {visibleDays.map((day) => (
            <FitnessCard key={day.key} radius="md" className="flex items-start gap-4 px-4 py-4" role="listitem">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fitness-text">{day.fullLabel}</p>
                <p className="text-sm text-fitness-text-soft">
                  {day.sessionCount > 0 ? formatMinutes(day.minutes) : <span className="text-fitness-muted">Sem treino</span>}
                </p>
              </div>
              {day.sessionCount > 0 && day.setVolumes.length >= 2 && (
                <div className="w-32 shrink-0 self-center" aria-hidden="true">
                  <MiniSparkline values={day.setVolumes} height={32} />
                </div>
              )}
            </FitnessCard>
          ))}
        </div>
      </div>

    </FitnessPageShell>
  );
};
