import { isNativeSession, sessionActivity } from '@/lib/fitness/activity-history';
import { useFitnessHistory } from '@/lib/fitness/use-fitness-history';
import React, { useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, Scale, Trash2 } from 'lucide-react';
import {
  BodyMetricsCard,
  FitnessButton,
  FitnessTopTabs,
  FitnessHeader,
  FitnessPageShell,
  RingsOverview,
  TrendAreaChart,
  WorkoutHistoryCard,
  type RingMetric,
} from '@/components/fitness-kit';
import '@/components/fitness-kit/saude-uau.css';
import { SaudeCena } from '@/components/fitness-kit/saude-cena';
import { elementoDaModalidade, useSaudeLuz } from '@/components/fitness-kit/saude-luz';
import { SaudePainel } from '@/components/fitness-kit/saude-painel';
import { SaudeVazio } from '@/components/fitness-kit/saude-vazio';
import { BODY_MEASUREMENT_FIELDS, BodyMeasurementDialog } from '@/components/workout';
import { mapMeasurementToMetrics } from '@/lib/fitness-kit/adapters';
import { formatDurationCompact } from '@/lib/fitness/fitness-format';
import { buildDayBuckets } from '@/lib/fitness/fitness-insights';
import { CATEGORY_ICONS, CATEGORY_LABELS, formatWorkoutDateTime } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';

const ordem = (valor: number) => ({ '--ordem': Math.min(valor, 9) }) as CSSProperties;
const oneDecimal = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

const BodyContent: React.FC<{ embedded: boolean }> = ({ embedded }) => {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const luz = useSaudeLuz();
  const latest = useWorkoutStore((state) => state.getLatestBodyMeasurement());
  const history = useWorkoutStore(useShallow((state) => state.getBodyMeasurementHistory()));
  const sessions = useFitnessHistory();
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
  const todayMinutes = days.at(-1)?.minutes ?? 0;
  const weekWorkouts = days.reduce((sum, day) => sum + day.workouts, 0);
  const rings: RingMetric[] = [
    { id: 'time', value: todayMinutes, max: 60, color: '#00C99A', trackColor: '#165B50', label: 'Tempo hoje', display: formatDurationCompact(todayMinutes), count: { value: todayMinutes, format: (value) => formatDurationCompact(Math.round(value)) } },
    { id: 'workouts', value: weekWorkouts, max: 3, color: '#FF9B52', trackColor: '#6B4021', label: 'Treinos nos últimos 7 dias', display: `${weekWorkouts} / 3`, count: { value: weekWorkouts, format: (value) => `${Math.round(value)} / 3` } },
  ];
  const recent = sessions.filter((session) => session.status === 'completed').slice(0, 3);
  const latestWeight = latest?.weightKg;

  return (
    <>
      {!embedded && <FitnessHeader title="Meu corpo" onBack={() => navigate('/treinos/insights')} backLabel="Voltar para Saúde" />}
      <div className={embedded ? 'saude-pilha' : 'saude-pilha saude-pilha-pagina'}>
        <BodyMetricsCard glass metrics={metrics} measuredAt={latest?.measuredAt} extraIds={extraFields.map((field) => String(field.key))} onRecord={() => setDialogOpen(true)} />

        {extraFields.length > 0 && (
          <section className="saude-extras ds-pane saude-entra" style={ordem(2)} aria-label="Outras medidas">
            <h2 className="saude-secao">Outras medidas</h2>
            <dl>
              {extraFields.map((field) => <div key={field.key} className="saude-extra">
                <dt>{field.label}</dt>
                <dd>{latest?.[field.key]}<span>{field.unit}</span></dd>
              </div>)}
            </dl>
          </section>
        )}

        <SaudePainel
          order={3}
          arrivalKey="corpo-peso"
          title="Evolução do peso"
          subtitle={latestWeight != null ? 'Na última avaliação' : undefined}
          highlight={latestWeight != null && trend.length >= 2 ? { value: latestWeight, format: oneDecimal, unit: 'kg' } : undefined}
          summary={trend.length >= 2 ? `Peso por avaliação: ${trend.map((point) => `${point.label}: ${point.value} kg`).join(', ')}` : undefined}
          empty={trend.length >= 2 ? undefined : (
            <SaudeVazio
              icon={Scale}
              title="A curva do peso começa aqui"
              text="Registre pelo menos duas avaliações com peso para acompanhar sua evolução."
              action={<FitnessButton size="md" variant="secondary" onClick={() => setDialogOpen(true)}>Registrar avaliação</FitnessButton>}
            />
          )}
        >
          {(arrived) => <TrendAreaChart data={trend} unit="kg" decimals={1} height={190} color={luz.acento} animate arrived={arrived} fitRange highlight={trend.length - 1} />}
        </SaudePainel>

        <section aria-label="Histórico de avaliações">
          <div className="saude-secao-linha saude-entra" style={ordem(4)}>
            <h2 className="saude-secao">Avaliações</h2>
            <small>{history.length} {history.length === 1 ? 'registro' : 'registros'}</small>
          </div>
          {history.length === 0 ? (
            <div className="ds-pane saude-vazio-painel saude-entra" style={ordem(5)}>
              <SaudeVazio compact icon={Scale} title="Nenhuma avaliação ainda" text="Sua primeira avaliação, feita no cartão acima, vira a primeira runa desta lista." />
            </div>
          ) : (
            <ul className="saude-lista">
              {[...history].reverse().map((measurement, index) => {
                const date = new Date(measurement.measuredAt);
                return (
                  <li key={measurement.id} className="saude-avaliacao ds-pane saude-entra" data-luz="" style={ordem(index + 5)}>
                    <div className="saude-avaliacao-cabeca">
                      <span className="saude-avaliacao-data" aria-hidden="true">
                        <b>{date.toLocaleDateString('pt-BR', { day: '2-digit' })}</b>
                        <small>{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small>
                      </span>
                      <time dateTime={measurement.measuredAt}>{formatWorkoutDateTime(measurement.measuredAt)}</time>
                      <button type="button" aria-label={`Excluir avaliação de ${formatWorkoutDateTime(measurement.measuredAt)}`}
                        onClick={() => deleteMeasurement(measurement.id)}
                        className="saude-excluir">
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                    <dl className="saude-avaliacao-medidas">
                      {BODY_MEASUREMENT_FIELDS.filter((field) => typeof measurement[field.key] === 'number').map((field) => (
                        <div key={field.key}><dt>{field.label}</dt><dd>{measurement[field.key]} {field.unit}</dd></div>
                      ))}
                    </dl>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <details className="saude-detalhes ds-pane saude-entra" style={ordem(6)}>
          <summary>Atividade de treino<ChevronDown aria-hidden="true" /></summary>
          <RingsOverview variant="painel" metrics={rings} ariaLabel="Tempo de treino hoje e número de treinos nos últimos sete dias" arrivalKey="corpo-aneis" />
          <p className="saude-nota">Referências visuais: 60 minutos por dia e 3 treinos em 7 dias.</p>
        </details>

        <section aria-label="Treinos recentes">
          <div className="saude-secao-linha saude-entra" style={ordem(7)}>
            <h2 className="saude-secao">Treinos recentes</h2>
            <button type="button" className="saude-link" onClick={() => navigate('/treinos/historico')}>Ver histórico</button>
          </div>
          {recent.length === 0 ? (
            <div className="ds-pane saude-vazio-painel saude-entra" style={ordem(8)}>
              <SaudeVazio compact icon={CATEGORY_ICONS.mixed} title="Nenhum treino concluído" text="Seus treinos concluídos aparecem aqui." />
            </div>
          ) : (
            <div className="saude-lista">
              {recent.map((session, index) => {
                const category = (isNativeSession(session) ? session.exerciseResults[0]?.modality : getWorkoutById(session.workoutId)?.category) ?? 'mixed';
                return (
                  <WorkoutHistoryCard key={session.id} order={index + 8} name={isNativeSession(session) ? session.nameSnapshot : session.workoutNameSnapshot}
                    dateLabel={new Date(session.completedAt ?? session.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    modalityLabel={CATEGORY_LABELS[category]}
                    element={elementoDaModalidade(category)}
                    icon={CATEGORY_ICONS[category] ?? CATEGORY_ICONS.mixed}
                    metricValue={String(Math.round(sessionActivity(session).seconds / 60))} metricUnit="min"
                    onClick={() => navigate(`/treinos/resumo/${session.id}`)} />
                );
              })}
            </div>
          )}
        </section>
      </div>
      <BodyMeasurementDialog variant="fitness" open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
};

export const Corpo: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => (
  <FitnessPageShell focused withNav showPageMap={false}>
    <FitnessTopTabs />
    <SaudeCena chave="corpo">
      <BodyContent embedded={embedded} />
    </SaudeCena>
  </FitnessPageShell>
);
