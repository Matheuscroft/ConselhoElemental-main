/**
 * HealthDashboard — Fitness UI Kit re-skin for /treinos/corpo.
 * Shows activity rings, weight chart, recent metrics, and history.
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Ruler,
  Scale,
  Dumbbell,
  Droplet,
  Percent,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessBottomNav,
  SectionHeader,
  RingsOverview,
  type RingDef,
  ChartWidget,
  WorkoutHistoryCard,
  FitnessCard,
} from '@/components/fitness';
import { TrendAreaChart } from '@/components/fitness/TrendAreaChart';
import { BODY_MEASUREMENT_FIELDS, BodyMeasurementDialog } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatDayLabel, formatDurationCompact } from '@/lib/fitness/fitness-format';
import { buildDayBuckets } from '@/lib/fitness/fitness-insights';
import { CATEGORY_ICONS, formatWorkoutDateTime } from '@/lib/workout';
import type { BodyMeasurementInput } from '@/types/workout';

const DAILY_MINUTES_GOAL = 60;
const WEEKLY_WORKOUTS_GOAL = 3;

const FIELD_ICONS: Partial<Record<keyof BodyMeasurementInput, LucideIcon>> = {
  weightKg: Scale,
  waterPercent: Droplet,
  bodyFatPercent: Percent,
  muscleMassKg: Dumbbell,
};

export const Corpo: React.FC = () => {
  const navigate = useNavigate();
  const {
    getLatestBodyMeasurement,
    getBodyMeasurementHistory,
    deleteBodyMeasurement,
    getCompletedWorkouts,
    getWorkoutHistory,
  } = useWorkoutStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const latestMeasurement = getLatestBodyMeasurement();
  const history = getBodyMeasurementHistory();
  const completedWorkouts = getCompletedWorkouts();
  const visibleFields = latestMeasurement
    ? BODY_MEASUREMENT_FIELDS.filter((field) => typeof latestMeasurement[field.key] === 'number')
    : [];

  // Rings use only real sessions; targets are fixed UI goals (60 min/day, 3 workouts/week).
  const dayBuckets = useMemo(() => buildDayBuckets(getWorkoutHistory(), 7), [getWorkoutHistory]);
  const minutesToday = dayBuckets[dayBuckets.length - 1]?.minutes ?? 0;
  const workoutsThisWeek = dayBuckets.reduce((sum, day) => sum + day.workouts, 0);
  const rings: RingDef[] = [
    {
      value: minutesToday,
      max: DAILY_MINUTES_GOAL,
      color: '#00C99A',
      trackColor: '#165B50',
      label: 'Tempo hoje',
      valueLabel: formatDurationCompact(minutesToday),
    },
    {
      value: workoutsThisWeek,
      max: WEEKLY_WORKOUTS_GOAL,
      color: '#FF9B52',
      trackColor: '#6B4021',
      label: 'Treinos na semana',
      valueLabel: `${workoutsThisWeek} / ${WEEKLY_WORKOUTS_GOAL}`,
    },
  ];

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
    <FitnessPageShell navOffset className="max-w-md mx-auto w-full">
      {/* Header */}
      <FitnessHeader
        title="Dashboard"
        onBack={() => navigate('/treinos')}
        rightAction={
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="w-10 h-10 rounded-full bg-fitness-primary flex items-center justify-center text-white hover:bg-fitness-primary-hover transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary"
            aria-label="Registrar avaliação corporal"
          >
            <Plus className="w-5 h-5" />
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
        <FitnessCard className="flex items-center gap-4 py-6 px-5">
          <div className="shrink-0">
            <RingsOverview rings={rings} size={140} summary="Anéis de treino: tempo hoje e treinos na semana" />
          </div>
          <ul className="flex-1 min-w-0 space-y-4">
            {rings.map((ring) => (
              <li key={ring.label} className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ring.color }} aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-fitness-text truncate">{ring.label}</p>
                  <p className="text-[13px] text-fitness-muted">{ring.valueLabel}</p>
                </div>
              </li>
            ))}
          </ul>
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
          isEmpty={weightTrend.length < 2}
          emptyMessage="Registre pelo menos 2 avaliações com peso para ver a evolução."
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

      {/* Latest measurement */}
      <ChartWidget
        className="mb-8"
        title="Última avaliação"
        isEmpty={!latestMeasurement}
        emptyMessage="Nenhuma avaliação registrada ainda. Registre a primeira para acompanhar sua evolução."
      >
        {latestMeasurement && (
          <>
            <p className="text-[12px] text-fitness-muted mb-3">
              {formatWorkoutDateTime(latestMeasurement.measuredAt)}
            </p>
            <div className="grid grid-cols-2 gap-4">
              {visibleFields.map((field) => {
                const Icon = FIELD_ICONS[field.key] ?? Ruler;
                return (
                  <div key={field.key} className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-fitness-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-fitness-primary" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-fitness-text truncate">
                        {latestMeasurement[field.key]}
                        <span className="text-[11px] text-fitness-muted ml-0.5">{field.unit}</span>
                      </p>
                      <p className="text-[11px] text-fitness-muted truncate">{field.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </ChartWidget>

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

      {/* Measurement history */}
      <ChartWidget
        className="mb-6"
        title="Histórico de avaliações"
        isEmpty={history.length === 0}
        emptyMessage="Nenhuma avaliação registrada."
      >
        <div className="space-y-2">
          {[...history].reverse().map((measurement) => {
            const fields = BODY_MEASUREMENT_FIELDS.filter((field) => typeof measurement[field.key] === 'number');
            return (
              <div key={measurement.id} className="rounded-2xl bg-fitness-surface-muted px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-fitness-muted">{formatWorkoutDateTime(measurement.measuredAt)}</span>
                  <button
                    type="button"
                    aria-label="Excluir avaliação"
                    onClick={() => deleteBodyMeasurement(measurement.id)}
                    className="text-fitness-muted hover:text-fitness-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                {fields.length > 0 && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    {fields.map((field) => (
                      <span key={field.key} className="text-[12px] text-fitness-muted">
                        {field.label}: <span className="text-fitness-text">{measurement[field.key]}{field.unit}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ChartWidget>

      <BodyMeasurementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
