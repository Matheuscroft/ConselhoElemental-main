import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { Trash2 } from 'lucide-react';
import {
  BodyMetricsCard,
  ChartWidget,
  FitnessBottomNav,
  FitnessCard,
  FitnessHeader,
  FitnessPageShell,
  SectionHeader,
  TrendAreaChart,
  WorkoutHistoryCard,
} from '@/components/fitness-kit';
import { RingsOverview, type RingDef } from '@/components/fitness/MetricRing';
import { BODY_MEASUREMENT_FIELDS, BodyMeasurementDialog } from '@/components/workout';
import { mapMeasurementToMetrics } from '@/lib/fitness-kit/adapters';
import { formatDurationCompact } from '@/lib/fitness/fitness-format';
import { buildDayBuckets } from '@/lib/fitness/fitness-insights';
import { CATEGORY_ICONS, formatWorkoutDateTime } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';

export const Corpo: React.FC = () => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const latest = useWorkoutStore((state) => state.getLatestBodyMeasurement());
  const history = useWorkoutStore(useShallow((state) => state.getBodyMeasurementHistory()));
  const sessions = useWorkoutStore(useShallow((state) => state.getWorkoutHistory()));
  const getWorkoutById = useWorkoutStore((state) => state.getWorkoutById);
  const deleteMeasurement = useWorkoutStore((state) => state.deleteBodyMeasurement);
  const metrics = useMemo(() => mapMeasurementToMetrics(latest), [latest]);
  const fields = latest ? BODY_MEASUREMENT_FIELDS.filter((field) => typeof latest[field.key] === 'number') : [];
  const extraFields = fields.filter((field) => !metrics.some((metric) => metric.id === field.key));
  const trend = useMemo(() => history.filter((m) => m.weightKg != null).slice(-7).map((m) => ({
    label: new Date(m.measuredAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    value: m.weightKg as number,
  })), [history]);
  const days = useMemo(() => buildDayBuckets(sessions, 7), [sessions]);
  const rings: RingDef[] = [
    { value: days.at(-1)?.minutes ?? 0, max: 60, color: '#00C99A', trackColor: '#165B50', label: 'Tempo hoje', valueLabel: formatDurationCompact(days.at(-1)?.minutes ?? 0) },
    { value: days.reduce((sum, day) => sum + day.workouts, 0), max: 3, color: '#FF9B52', trackColor: '#6B4021', label: 'Treinos nos últimos 7 dias', valueLabel: `${days.reduce((sum, day) => sum + day.workouts, 0)} / 3` },
  ];
  const recent = sessions.filter((session) => session.status === 'completed').slice(0, 3);

  return (
    <FitnessPageShell withNav>
      <FitnessHeader title="Meu corpo" onBack={() => navigate('/treinos/insights')} backLabel="Voltar para Saúde" />
      <div className="mt-8 space-y-6">
        <BodyMetricsCard metrics={metrics} measuredAt={latest?.measuredAt} onRecord={() => setDialogOpen(true)} />
        {extraFields.length > 0 && (
          <FitnessCard radius="lg" className="p-6">
            <SectionHeader title="Outras medidas" />
            <dl className="mt-5 grid grid-cols-2 gap-5">
              {extraFields.map((field) => <div key={field.key} className="min-w-0">
                <dt className="text-sm text-fitness-muted">{field.label}</dt>
                <dd className="mt-1 break-words text-xl text-fitness-text">{latest?.[field.key]} <span className="text-sm">{field.unit}</span></dd>
              </div>)}
            </dl>
          </FitnessCard>
        )}
        <ChartWidget title="Evolução do peso" radius="lg"
          subtitle={latest?.weightKg != null ? `${latest.weightKg} kg na última avaliação` : undefined}
          emptyMessage={trend.length < 2 ? 'Registre pelo menos duas avaliações com peso para acompanhar sua evolução.' : undefined}
          summary={`Peso por avaliação: ${trend.map((point) => `${point.label}: ${point.value} kg`).join(', ')}`}>
          <TrendAreaChart data={trend} unit="kg" height={190} />
        </ChartWidget>
        <section aria-label="Histórico de avaliações">
          <SectionHeader title="Avaliações" subtitle={`${history.length} ${history.length === 1 ? 'registro' : 'registros'}`} />
          {history.length === 0 ? <p className="py-6 text-base text-fitness-muted">Registre sua primeira avaliação no cartão acima.</p> : (
            <div className="mt-5 space-y-4">
              {[...history].reverse().map((measurement) => (
                <FitnessCard key={measurement.id} radius="md" className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <time dateTime={measurement.measuredAt} className="text-sm text-fitness-text-soft">{formatWorkoutDateTime(measurement.measuredAt)}</time>
                    <button type="button" aria-label={`Excluir avaliação de ${formatWorkoutDateTime(measurement.measuredAt)}`}
                      onClick={() => deleteMeasurement(measurement.id)}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-fitness-muted hover:bg-fitness-red/10 hover:text-fitness-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
                    {BODY_MEASUREMENT_FIELDS.filter((field) => typeof measurement[field.key] === 'number').map((field) => (
                      <div key={field.key} className="min-w-0"><dt className="text-sm text-fitness-muted">{field.label}</dt><dd className="break-words text-base">{measurement[field.key]} {field.unit}</dd></div>
                    ))}
                  </dl>
                </FitnessCard>
              ))}
            </div>
          )}
        </section>
        <details className="rounded-fit-lg bg-fitness-surface p-6">
          <summary className="cursor-pointer rounded-lg text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">Atividade de treino</summary>
          <div className="mt-5 flex items-center gap-4">
            <RingsOverview rings={rings} size={120} summary="Tempo de treino hoje e número de treinos nos últimos sete dias" />
            <ul className="min-w-0 space-y-4">{rings.map((ring) => <li key={ring.label}><p className="text-sm text-fitness-muted">{ring.label}</p><p className="text-base">{ring.valueLabel}</p></li>)}</ul>
          </div>
          <p className="mt-4 text-sm text-fitness-muted">Referências visuais: 60 minutos por dia e 3 treinos em 7 dias.</p>
        </details>
        <section aria-label="Treinos recentes">
          <SectionHeader title="Treinos recentes" actionLabel="Ver histórico" onAction={() => navigate('/treinos/historico')} />
          <div className="mt-5 space-y-4">
            {recent.length === 0 ? <p className="py-4 text-base text-fitness-muted">Seus treinos concluídos aparecem aqui.</p> : recent.map((session) => (
              <WorkoutHistoryCard key={session.id} name={session.workoutNameSnapshot}
                dateLabel={new Date(session.completedAt ?? session.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                icon={CATEGORY_ICONS[getWorkoutById(session.workoutId)?.category ?? 'mixed'] ?? CATEGORY_ICONS.mixed}
                metricValue={String(Math.round(session.durationSeconds / 60))} metricUnit="min"
                onClick={() => navigate(`/treinos/resumo/${session.id}`)} />
            ))}
          </div>
        </section>
      </div>
      <BodyMeasurementDialog variant="fitness" open={dialogOpen} onOpenChange={setDialogOpen} />
      <FitnessBottomNav />
    </FitnessPageShell>
  );
};
