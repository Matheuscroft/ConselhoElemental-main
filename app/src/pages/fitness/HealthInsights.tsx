import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BodyMetricsCard,
  ChartWidget,
  FitnessTopTabs,
  FitnessPageShell,
  SectionHeader,
  TrendAreaChart,
} from '@/components/fitness-kit';
import { BodyMeasurementDialog } from '@/components/workout';
import { buildWeekBuckets, mapMeasurementToMetrics } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { useWeekStartsOnPreference } from '@/lib/temporal';
import { useWorkoutStore } from '@/stores/workoutStore';

export const HealthInsights: React.FC = () => {
  const navigate = useNavigate();
  const [measurementOpen, setMeasurementOpen] = useState(false);

  const sessions = useFitnessHistory();
  const latestMeasurement = useWorkoutStore((state) => state.getLatestBodyMeasurement());
  const { weekStartsOn } = useWeekStartsOnPreference();

  const bodyMetrics = useMemo(() => mapMeasurementToMetrics(latestMeasurement), [latestMeasurement]);
  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn), [sessions, weekStartsOn]);
  const measuredLoad = week.some((day)=>day.observedSessions>0);
  const trend = useMemo(() => week.map((day) => ({ label: day.shortLabel, value: Math.round(measuredLoad ? day.activityLoad : day.minutes) })), [week, measuredLoad]);
  const hasTrend = week.some((day) => day.sessionCount > 0);

  return (
    <FitnessPageShell focused withNav showPageMap={false}>
      <FitnessTopTabs />
      <SectionHeader
        level="section"
        title={FITNESS_COPY.insights}
        subtitle={FITNESS_COPY.thisWeek}
        actionLabel="Ver semana"
        onAction={() => navigate('/treinos/semana')}
      />

      <div className="mt-8 space-y-5">
        <BodyMetricsCard measuredAt={latestMeasurement?.measuredAt} metrics={bodyMetrics} onRecord={() => setMeasurementOpen(true)} onViewAll={() => navigate('/treinos/corpo')} />

        <ChartWidget
          title={FITNESS_COPY.trending}
          subtitle={<span className="text-base text-fitness-muted">{measuredLoad ? 'Carga percebida por dia (u.a.)' : 'Minutos ativos por dia'}</span>}
          radius="lg"
          className="p-6"
          emptyMessage={hasTrend ? undefined : FITNESS_COPY.empty.trend}
          summary={`${measuredLoad ? 'Carga percebida' : 'Tempo ativo'} por dia nesta semana: ${trend.map((point) => `${point.label} ${point.value} ${measuredLoad ? 'u.a.' : 'min'}`).join(', ')}`}
        >
          <TrendAreaChart data={trend} unit={measuredLoad ? 'u.a.' : 'min'} height={240} />
        </ChartWidget>
      </div>

      <BodyMeasurementDialog variant="fitness" open={measurementOpen} onOpenChange={setMeasurementOpen} />
    </FitnessPageShell>
  );
};
