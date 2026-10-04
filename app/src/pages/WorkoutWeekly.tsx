/**
 * WorkoutWeekly — last 7 days of training time, built from real sessions.
 * Route: /treinos/semana
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessCard,
  FitnessBottomNav,
  ChartWidget,
  SummaryMetric,
  WeeklyBarChart,
} from '@/components/fitness';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatVolume } from '@/lib/workout';
import { formatDurationCompact } from '@/lib/fitness/fitness-format';
import { buildDayBuckets } from '@/lib/fitness/fitness-insights';

export const WorkoutWeekly: React.FC = () => {
  const navigate = useNavigate();
  const { getWorkoutHistory } = useWorkoutStore();

  const sessions = useMemo(() => getWorkoutHistory(), [getWorkoutHistory]);
  const days = useMemo(() => buildDayBuckets(sessions, 7), [sessions]);

  const peakMinutes = Math.max(0, ...days.map((day) => day.minutes));
  const totalMinutes = days.reduce((sum, day) => sum + day.minutes, 0);
  const totalVolume = days.reduce((sum, day) => sum + day.volume, 0);
  const totalWorkouts = days.reduce((sum, day) => sum + day.workouts, 0);

  const chartData = days.map((day) => ({ day: day.initial, value: day.minutes, max: peakMinutes }));

  return (
    <FitnessPageShell navOffset className="max-w-md mx-auto w-full">
      <FitnessHeader
        title="Summary"
        subtitle="Esta semana"
        onBack={() => navigate('/treinos')}
        rightAction={
          <button
            type="button"
            onClick={() => navigate('/treinos/historico')}
            className="text-[14px] font-medium text-fitness-primary whitespace-nowrap"
          >
            Ver tudo
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mt-8 mb-8">
        <SummaryMetric label="Tempo" value={formatDurationCompact(totalMinutes)} />
        <SummaryMetric label="Treinos" value={totalWorkouts} />
        <SummaryMetric label="Volume" value={formatVolume(totalVolume)} />
      </div>

      <ChartWidget
        className="mb-8"
        title="Tempo de treino"
        isEmpty={totalMinutes === 0}
        emptyMessage="Nenhum treino concluído nos últimos 7 dias."
      >
        <WeeklyBarChart data={chartData} limitLabel={peakMinutes > 0 ? formatDurationCompact(peakMinutes) : undefined} />
      </ChartWidget>

      <ul className="space-y-4">
        {[...days].reverse().map((day) => (
          <li key={day.key}>
            <FitnessCard className="flex items-center gap-4 py-4 px-5">
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-fitness-text capitalize truncate">{day.weekday}</p>
                <p className="text-[14px] text-fitness-muted mt-0.5">
                  {day.workouts > 0
                    ? `${formatDurationCompact(day.minutes)} · ${day.workouts} ${day.workouts === 1 ? 'treino' : 'treinos'}`
                    : 'Sem treino'}
                </p>
              </div>
            </FitnessCard>
          </li>
        ))}
      </ul>

      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
