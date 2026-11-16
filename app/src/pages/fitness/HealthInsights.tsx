import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import {
  BodyMetricsCard,
  FitnessButton,
  FitnessTopTabs,
  FitnessPageShell,
  TrendAreaChart,
} from '@/components/fitness-kit';
import '@/components/fitness-kit/saude-uau.css';
import { SaudeCena } from '@/components/fitness-kit/saude-cena';
import { useSaudeLuz } from '@/components/fitness-kit/saude-luz';
import { SaudeCabeca, SaudePainel } from '@/components/fitness-kit/saude-painel';
import { SaudeVazio } from '@/components/fitness-kit/saude-vazio';
import { BodyMeasurementDialog } from '@/components/workout';
import { buildWeekBuckets, mapMeasurementToMetrics } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatMinutes } from '@/lib/fitness-kit/format';
import { useWeekStartsOnPreference } from '@/lib/temporal';
import { useWorkoutStore } from '@/stores/workoutStore';

const whole = (value: number) => String(Math.round(value));

const HealthEvolution: React.FC = () => {
  const navigate = useNavigate();
  const [measurementOpen, setMeasurementOpen] = useState(false);
  const luz = useSaudeLuz();

  const sessions = useFitnessHistory();
  const latestMeasurement = useWorkoutStore((state) => state.getLatestBodyMeasurement());
  const { weekStartsOn } = useWeekStartsOnPreference();

  const bodyMetrics = useMemo(() => mapMeasurementToMetrics(latestMeasurement), [latestMeasurement]);
  const week = useMemo(() => buildWeekBuckets(sessions, weekStartsOn), [sessions, weekStartsOn]);
  const measuredLoad = week.some((day)=>day.observedSessions>0);
  const trend = useMemo(() => week.map((day) => ({ label: day.shortLabel, value: Math.round(measuredLoad ? day.activityLoad : day.minutes) })), [week, measuredLoad]);
  const hasTrend = week.some((day) => day.sessionCount > 0);
  const total = trend.reduce((sum, point) => sum + point.value, 0);
  const todayIndex = week.findIndex((day) => day.isToday);

  return (
    <>
      <SaudeCabeca
        title={FITNESS_COPY.insights}
        subtitle={FITNESS_COPY.thisWeek}
        actionLabel="Ver semana"
        onAction={() => navigate('/treinos/semana')}
      />

      <div className="saude-pilha">
        <SaudePainel
          glass
          order={1}
          arrivalKey="evolucao-tendencia"
          title={FITNESS_COPY.trending}
          subtitle={measuredLoad ? 'Carga percebida por dia (u.a.)' : 'Minutos ativos por dia'}
          highlight={hasTrend ? (measuredLoad ? { value: total, format: whole, unit: 'u.a.' } : { value: total, format: formatMinutes }) : undefined}
          summary={hasTrend ? `${measuredLoad ? 'Carga percebida' : 'Tempo ativo'} por dia nesta semana: ${trend.map((point) => `${point.label} ${point.value} ${measuredLoad ? 'u.a.' : 'min'}`).join(', ')}` : undefined}
          empty={hasTrend ? undefined : (
            <SaudeVazio
              icon={Sprout}
              title="A linha da semana espera o primeiro treino"
              text={FITNESS_COPY.empty.trend}
              action={<FitnessButton size="md" onClick={() => navigate('/treinos')}>Iniciar treino</FitnessButton>}
            />
          )}
        >
          {(arrived) => (
            <TrendAreaChart data={trend} unit={measuredLoad ? 'u.a.' : 'min'} height={220} color={luz.acento} animate arrived={arrived} highlight={todayIndex >= 0 ? todayIndex : undefined} />
          )}
        </SaudePainel>

        <BodyMetricsCard
          measuredAt={latestMeasurement?.measuredAt}
          metrics={bodyMetrics}
          onRecord={() => setMeasurementOpen(true)}
          onViewAll={() => navigate('/treinos/corpo')}
        />
      </div>

      <BodyMeasurementDialog variant="fitness" open={measurementOpen} onOpenChange={setMeasurementOpen} />
    </>
  );
};

export const HealthInsights: React.FC = () => (
  <FitnessPageShell focused withNav showPageMap={false}>
    <FitnessTopTabs />
    <SaudeCena chave="evolucao">
      <HealthEvolution />
    </SaudeCena>
  </FitnessPageShell>
);
