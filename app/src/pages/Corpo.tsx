<<<<<<< HEAD
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
=======
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Dumbbell,
  Droplet,
  Droplets,
  HeartPulse,
  Moon,
  Percent,
  Plus,
  Ruler,
  Scale,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BODY_MEASUREMENT_FIELDS, BodyMeasurementDialog } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatWorkoutDateTime } from '@/lib/workout';
import type { BodyMeasurementInput } from '@/types/workout';

const FIELD_ICONS: Partial<Record<keyof BodyMeasurementInput, LucideIcon>> = {
  heightCm: Ruler,
  weightKg: Scale,
  waterPercent: Droplet,
  bodyFatPercent: Percent,
  muscleMassKg: Dumbbell,
  waistCm: Ruler,
  chestCm: Ruler,
  armCm: Ruler,
  thighCm: Ruler,
};

const COMING_SOON = [
  { key: 'sleep', label: 'Sono', icon: Moon },
  { key: 'heart', label: 'Frequência cardíaca', icon: HeartPulse },
  { key: 'hydration', label: 'Hidratação', icon: Droplets },
];

const AXIS_TICK_STYLE = { fill: 'rgba(255,255,255,0.55)', fontSize: 11 };
const GRID_STROKE = 'rgba(255,255,255,0.08)';

const weightChartConfig: ChartConfig = {
  weightKg: { label: 'Peso (kg)', color: '#00D9FF' },
};

export const Corpo: React.FC = () => {
  const navigate = useNavigate();
  const { getLatestBodyMeasurement, getBodyMeasurementHistory, deleteBodyMeasurement } = useWorkoutStore();
  const [dialogOpen, setDialogOpen] = useState(false);

  const latest = getLatestBodyMeasurement();
  const history = getBodyMeasurementHistory();
  const visibleFields = latest ? BODY_MEASUREMENT_FIELDS.filter((field) => typeof latest[field.key] === 'number') : [];

  const weightTrend = useMemo(
    () =>
      history
        .filter((measurement) => measurement.weightKg != null)
        .map((measurement) => ({
          label: new Date(measurement.measuredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          weightKg: measurement.weightKg as number,
        })),
    [history]
  );

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="border-white/20" aria-label="Voltar para Treinos" onClick={() => navigate('/treinos')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h2 className="font-mystic text-xl">Corpo</h2>
            <p className="text-sm text-white/50">Acompanhamento corporal</p>
          </div>
        </div>
        <Button className="bg-mystic-arcane hover:bg-mystic-arcane/80" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
          Registrar
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Última avaliação</h3>
          {latest ? (
            <>
              <p className="text-[11px] text-white/45 mb-3">{formatWorkoutDateTime(latest.measuredAt)}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {visibleFields.map((field) => {
                  const Icon = FIELD_ICONS[field.key] ?? Ruler;
                  return (
                    <div key={field.key} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-mystic-arcane/15 border border-mystic-arcane/30 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-mystic-arcane" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-mono text-white truncate">
                          {latest[field.key]}
                          <span className="text-[10px] text-white/40 ml-0.5">{field.unit}</span>
                        </p>
                        <p className="text-[10px] text-white/45 truncate">{field.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-white/50">
              Nenhuma avaliação registrada ainda. Registre a primeira para começar a acompanhar sua evolução.
            </p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Evolução do peso</h3>
          {weightTrend.length >= 2 ? (
            <ChartContainer config={weightChartConfig} className="h-52 w-full">
              <LineChart data={weightTrend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_STROKE} />
                <XAxis dataKey="label" tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK_STYLE} axisLine={false} tickLine={false} width={36} domain={['auto', 'auto']} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="weightKg"
                  stroke="var(--color-weightKg)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--color-weightKg)' }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-xs text-white/50 py-6 text-center">
              {weightTrend.length === 0
                ? 'Nenhum registro de peso ainda.'
                : 'Registre pelo menos 2 avaliações com peso para ver a evolução.'}
            </p>
          )}
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Em breve</h3>
          <div className="grid grid-cols-3 gap-3">
            {COMING_SOON.map((item) => (
              <div key={item.key} className="rounded-xl border border-dashed border-white/15 p-3 text-center">
                <item.icon className="w-5 h-5 text-white/40 mx-auto mb-1.5" aria-hidden="true" />
                <p className="text-xs text-white/60">{item.label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">Em breve</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-6">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Histórico de avaliações</h3>
          {history.length === 0 ? (
            <p className="text-xs text-white/50">Nenhuma avaliação registrada.</p>
          ) : (
            <div className="space-y-2">
              {[...history].reverse().map((measurement) => {
                const fields = BODY_MEASUREMENT_FIELDS.filter((field) => typeof measurement[field.key] === 'number');
                return (
                  <div key={measurement.id} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-white/50">{formatWorkoutDateTime(measurement.measuredAt)}</span>
                      <button
                        type="button"
                        aria-label="Excluir avaliação"
                        onClick={() => deleteBodyMeasurement(measurement.id)}
                        className="text-white/30 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {fields.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1">
                        {fields.map((field) => (
                          <span key={field.key} className="text-[11px] text-white/70">
                            {field.label}: <span className="font-mono text-white">{measurement[field.key]}{field.unit}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      <BodyMeasurementDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </AppLayout>
>>>>>>> 42bd28d4c90747fd7bc1fff722dc1f9486157c1e
  );
};
