/**
 * WorkoutInsights — "Your body" + "Trending", built from real body measurements and sessions.
 * Route: /treinos/insights
 */
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessCard,
  FitnessBottomNav,
  ChartWidget,
  BodySilhouette,
} from '@/components/fitness';
import { TrendAreaChart, type TrendPoint } from '@/components/fitness/TrendAreaChart';
import { useWorkoutStore } from '@/stores/workoutStore';
import { BODY_MEASUREMENT_FIELDS } from '@/components/workout';
import { cn } from '@/lib/utils';

type TrendMode = 'weight' | 'volume';

const BODY_CARD_KEYS = ['heightCm', 'weightKg', 'waterPercent', 'bodyFatPercent', 'muscleMassKg'] as const;

const dayLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const WorkoutInsights: React.FC = () => {
  const navigate = useNavigate();
  const { getLatestBodyMeasurement, getBodyMeasurementHistory, getVolumeHistory } = useWorkoutStore();
  const [mode, setMode] = useState<TrendMode>('volume');

  const latest = getLatestBodyMeasurement();
  const bodyFields = latest
    ? BODY_MEASUREMENT_FIELDS.filter(
        (field) =>
          (BODY_CARD_KEYS as readonly string[]).includes(field.key) && typeof latest[field.key] === 'number'
      )
    : [];

  const weightTrend = useMemo<TrendPoint[]>(
    () =>
      getBodyMeasurementHistory()
        .filter((measurement) => measurement.weightKg != null)
        .slice(-7)
        .map((measurement) => ({ label: dayLabel(measurement.measuredAt), value: measurement.weightKg as number })),
    [getBodyMeasurementHistory]
  );

  const volumeTrend = useMemo<TrendPoint[]>(
    () =>
      getVolumeHistory()
        .slice(-7)
        .map((point) => ({ label: dayLabel(point.date), value: Math.round(point.volume) })),
    [getVolumeHistory]
  );

  const trend = mode === 'weight' ? weightTrend : volumeTrend;

  return (
    <FitnessPageShell navOffset className="max-w-md mx-auto w-full">
      <FitnessHeader
        title="Insights"
        subtitle="Visão geral"
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

      <FitnessCard className="mt-8 mb-6 p-6">
        <h2 className="text-[20px] font-semibold text-fitness-text mb-4">Seu corpo</h2>
        {bodyFields.length === 0 ? (
          <p className="text-sm text-fitness-muted py-4">Nenhuma medição registrada.</p>
        ) : (
          <div className="flex items-center gap-6">
            <BodySilhouette className="w-[35%] max-w-[110px] shrink-0 text-fitness-lavender-soft" />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5 flex-1 min-w-0">
              {bodyFields.map((field) => (
                <div key={field.key} className="min-w-0">
                  <dd className="text-[22px] font-semibold text-fitness-text leading-tight truncate">
                    {latest?.[field.key]}
                    <span className="text-[13px] font-medium text-fitness-muted ml-0.5">{field.unit}</span>
                  </dd>
                  <dt className="text-[12px] text-fitness-muted truncate">{field.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        )}
      </FitnessCard>

      <ChartWidget
        title="Tendência"
        titleRight={
          <div role="group" aria-label="Série exibida" className="flex gap-1.5">
            {(['volume', 'weight'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
                className={cn(
                  'px-3 py-1 rounded-full text-[12px] font-medium transition-colors',
                  mode === option
                    ? 'bg-fitness-primary/20 text-fitness-primary'
                    : 'bg-fitness-surface-hover text-fitness-muted hover:text-fitness-text'
                )}
              >
                {option === 'volume' ? 'Volume' : 'Peso'}
              </button>
            ))}
          </div>
        }
        isEmpty={trend.length < 2}
        emptyMessage="Ainda não há dados suficientes para mostrar uma tendência."
      >
        <TrendAreaChart data={trend} height={200} />
      </ChartWidget>

      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
