import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Dumbbell } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import {
  ChartWidget,
  FitnessTopTabs,
  FitnessCreateWorkoutFab,
  FitnessButton,
  FitnessPageShell,
  MiniBars,
  MiniSparkline,
  NEW_WORKOUT_PATH,
  RingsOverview,
  type RingMetric,
} from '@/components/fitness-kit';
import { buildWeekBuckets, getTodayExerciseMinutes } from '@/lib/fitness-kit/adapters';
import { DAILY_EXERCISE_GOAL_MINUTES } from '@/lib/fitness-kit/constants';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { useWeekStartsOnPreference } from '@/lib/temporal';
import { useAppStore } from '@/stores/appStore';
import { useWorkoutStore } from '@/stores/workoutStore';

export const HealthDashboard: React.FC = () => {
  const navigate = useNavigate();
  const userName = useAppStore((state) => state.user?.name);
  const sessions = useWorkoutStore(useShallow((state) => state.getWorkoutHistory()));
  const resources = useWorkoutStore(useShallow((state) => state.getResourceSnapshot()));
  const { weekStartsOn } = useWeekStartsOnPreference();

  const todayMinutes = useMemo(() => getTodayExerciseMinutes(sessions), [sessions]);
  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn), [sessions, weekStartsOn]);

  const rings = useMemo<RingMetric[]>(
    () => [
      {
        id: 'stamina',
        label: 'Stamina',
        value: resources.currentStamina,
        max: resources.baseStamina,
        display: `${resources.currentStamina}/${resources.baseStamina}`,
        color: '#00C99A',
        trackColor: 'rgba(22, 91, 80, 0.55)',
      },
      {
        id: 'exercise',
        label: 'Exercício',
        value: todayMinutes,
        max: DAILY_EXERCISE_GOAL_MINUTES,
        display: formatMinutes(todayMinutes),
        color: '#FF9B52',
        trackColor: 'rgba(255, 155, 82, 0.2)',
      },
      {
        id: 'prana',
        label: 'Prana',
        value: resources.currentPrana,
        max: resources.basePrana,
        display: `${resources.currentPrana}/${resources.basePrana}`,
        color: '#6697F2',
        trackColor: 'rgba(102, 151, 242, 0.2)',
      },
    ],
    [resources, todayMinutes]
  );

  const weekHasData = week.some((day) => day.sessionCount > 0);
  const measuredLoad = week.some((day)=>day.observedSessions>0);
  const volumeValues = week.map((day) => measuredLoad ? day.activityLoad : day.volume);
  const maxMinutes = Math.max(DAILY_EXERCISE_GOAL_MINUTES, ...week.map((day) => day.minutes));

  return (
    <FitnessPageShell withNav>
      <FitnessTopTabs />
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words font-sans text-[32px] font-semibold leading-[1.1] text-fitness-text">
            Olá{userName ? `, ${userName}` : ''}
          </h1>
          <p className="mt-1 text-lg text-fitness-muted">{FITNESS_COPY.today}</p>
        </div>
      </header>

      <div className="mt-10">
        <RingsOverview metrics={rings} ariaLabel="Recursos e exercício de hoje" />
      </div>

      <h2 className="mt-8 font-sans text-xl font-semibold text-fitness-text">Nesta semana</h2>
      <div className="mt-4 grid grid-cols-2 gap-5">
        <ChartWidget
          title={measuredLoad ? 'Carga percebida' : 'Volume legado'}
          icon={Dumbbell}
          iconClassName="text-fitness-primary"
          radius="sm"
          className="aspect-square p-4 sm:p-5"
          emptyMessage={weekHasData ? undefined : 'Sem treinos esta semana.'}
          summary={`Volume por dia nesta semana: ${volumeValues.map((value) => Math.round(value)).join(', ')} ${measuredLoad ? 'u.a.' : 'índice'}`}
          bodyClassName="mt-6"
        >
          <MiniSparkline values={volumeValues} color="#8582F2" height={96} />
        </ChartWidget>

        <ChartWidget
          title="Atividade"
          icon={Activity}
          iconClassName="text-fitness-green"
          radius="sm"
          className="aspect-square p-4 sm:p-5"
          emptyMessage={weekHasData ? undefined : 'Sem treinos esta semana.'}
          bodyClassName="mt-3"
        >
          <MiniBars
            data={week.map((day) => ({ label: day.initial, value: day.minutes, caption: `${day.fullLabel}: ${formatMinutes(day.minutes)}` }))}
            max={maxMinutes}
            ariaLabel="Minutos de exercício por dia nesta semana"
          />
        </ChartWidget>
      </div>

      <nav aria-label="Explorar saúde e tempo" className="mt-6 grid grid-cols-2 gap-3">
        <FitnessButton size="md" variant="secondary" onClick={() => navigate('/treinos/corpo')}>
          Meu corpo
        </FitnessButton>
        <FitnessButton size="md" variant="secondary" onClick={() => navigate('/treinos/semana')}>
          Esta semana
        </FitnessButton>
      </nav>

      <p className="mt-3 text-xs leading-relaxed text-fitness-muted">
        Stamina e Prana são recursos do jogo. O anel de exercício usa 30 minutos como referência visual diária.
      </p>

      <div className="mt-10 flex justify-center px-4">
        <FitnessButton className="w-full max-w-[19rem]" onClick={() => navigate(NEW_WORKOUT_PATH)}>
          {FITNESS_COPY.newWorkout}
        </FitnessButton>
      </div>

      <FitnessCreateWorkoutFab />
    </FitnessPageShell>
  );
};
