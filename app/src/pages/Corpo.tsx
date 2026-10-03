/**
 * HealthDashboard — Fitness UI Kit re-skin for /treinos/corpo.
 * Shows activity rings, weight chart, recent metrics, and history.
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Scale,
  Activity,
  Droplet,
  Moon,
  ChevronRight,
} from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  SectionHeader,
  RingsOverview,
  ChartWidget,
  FitnessIconBadge,
  WorkoutHistoryCard,
  FitnessCard,
} from '@/components/fitness';
import { TrendAreaChart } from '@/components/fitness/TrendAreaChart';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatDayLabel } from '@/lib/fitness/fitness-format';
import { CATEGORY_ICONS } from '@/lib/workout';

export const Corpo: React.FC = () => {
  const navigate = useNavigate();
  const {
    getLatestBodyMeasurement,
    getBodyMeasurementHistory,
    getCompletedWorkouts,
    getWorkoutStats,
  } = useWorkoutStore();

  const latestMeasurement = getLatestBodyMeasurement();
  const history = getBodyMeasurementHistory();
  const completedWorkouts = getCompletedWorkouts();
  const stats = getWorkoutStats();

  // Activity Rings (Mocking sleep/water, using real exercise data for the middle ring)
  const rings = {
    sleep: {
      value: 6.5,
      max: 8,
      color: '#00C99A', // Green
      trackColor: '#165B50',
      label: 'Sleep',
      valueLabel: '6.5h',
    },
    exercise: {
      // e.g., mapping total volume or simply a fixed percentage for demo, or today's completed workouts
      value: completedWorkouts.filter(w => new Date(w.updatedAt).toDateString() === new Date().toDateString()).length,
      max: 1, // goal of 1 workout a day
      color: '#FF9B52', // Orange
      trackColor: '#6B4021',
      label: 'Exercise',
      valueLabel: '1 / 1',
    },
    water: {
      value: 1.2,
      max: 2,
      color: '#6697F2', // Blue
      trackColor: '#1D3B6B',
      label: 'Water',
      valueLabel: '1.2L',
    },
  };

  // Weight Trend for chart
  const weightTrend = useMemo(() => {
    return history
      .filter((m) => m.weightKg != null)
      .slice(-7)
      .map((m) => ({
        label: new Date(m.measuredAt).toLocaleDateString('en-US', { weekday: 'short' }),
        value: m.weightKg as number,
      }));
  }, [history]);

  return (
    <FitnessPageShell className="max-w-md mx-auto w-full">
      {/* Header */}
      <FitnessHeader
        title="Dashboard"
        onBack={() => navigate('/treinos')}
        rightAction={
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-fitness-surface flex items-center justify-center text-fitness-text hover:bg-fitness-surface-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            aria-label="Notificações"
          >
            <Bell className="w-5 h-5" />
          </button>
        }
      />

      <div className="py-2">
        <p className="text-[28px] font-semibold text-fitness-text mb-1">
          {formatDayLabel(new Date().toISOString())}
        </p>
      </div>

      {/* Activity Rings Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 mt-2"
      >
        <FitnessCard className="flex flex-col items-center justify-center py-6">
          <RingsOverview
            sleep={rings.sleep}
            exercise={rings.exercise}
            water={rings.water}
            size={180}
            summary="Anéis de atividade diária"
          />
          <div className="flex items-center justify-center gap-6 mt-6 w-full">
            <div className="flex flex-col items-center gap-1">
              <Moon className="w-4 h-4 text-fitness-green" />
              <span className="text-[12px] font-medium text-fitness-text">{rings.sleep.valueLabel}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Activity className="w-4 h-4 text-fitness-orange" />
              <span className="text-[12px] font-medium text-fitness-text">{rings.exercise.valueLabel}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Droplet className="w-4 h-4 text-fitness-blue" />
              <span className="text-[12px] font-medium text-fitness-text">{rings.water.valueLabel}</span>
            </div>
          </div>
        </FitnessCard>
      </motion.div>

      {/* Weight Trend */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <ChartWidget
          title="Weight"
          titleRight={
            latestMeasurement?.weightKg && (
              <div className="text-right">
                <span className="text-[16px] font-semibold text-fitness-text">{latestMeasurement.weightKg} kg</span>
              </div>
            )
          }
        >
          <TrendAreaChart data={weightTrend} height={140} />
        </ChartWidget>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <SectionHeader
          title="History"
          action={
            <button
              onClick={() => { /* Handle full history view if needed */ }}
              className="text-[14px] text-fitness-primary font-medium hover:underline"
            >
              See all
            </button>
          }
        />
        <div className="space-y-3 mt-4">
          {completedWorkouts.length === 0 ? (
            <p className="text-sm text-fitness-muted py-4 text-center">
              Nenhum treino concluído ainda.
            </p>
          ) : (
            completedWorkouts.slice(0, 3).map((w) => {
              const Icon = CATEGORY_ICONS[w.category] ?? Activity;
              return (
                <WorkoutHistoryCard
                  key={w.id}
                  name={w.name}
                  dateLabel={new Date(w.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  icon={Icon}
                  metricValue={w.estimatedDurationMinutes}
                  metricUnit="min"
                />
              );
            })
          )}
        </div>
      </motion.div>
    </FitnessPageShell>
  );
};
