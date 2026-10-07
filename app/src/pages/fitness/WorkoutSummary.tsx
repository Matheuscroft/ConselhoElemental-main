import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ChartWidget,
  FitnessButton,
  FitnessCard,
  FitnessEmptyState,
  FitnessPageShell,
  MuscleBars,
  TrendAreaChart,
  WorkoutSummaryView,
} from '@/components/fitness-kit';
import { StarRating } from '@/components/workout';
import { mapSessionToSummaryMetrics } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatLongClock, formatTimeRange } from '@/lib/fitness-kit/format';
import { CATEGORY_ICONS } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';

const shortDate = (value: string): string => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const WorkoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const session = useWorkoutStore((state) => (sessionId ? state.getSessionById(sessionId) : undefined));
  const workout = useWorkoutStore((state) => (session ? state.getWorkoutById(session.workoutId) : undefined));
  const rating = useWorkoutStore((state) => (sessionId ? state.getSessionRating(sessionId) : undefined));
  const averageRating = useWorkoutStore((state) => state.getAverageRating());
  // Assinatura do conteúdo da conta: re-renderiza quando o histórico muda. Os getters de histórico
  // devolvem objetos novos a cada chamada, então são lidos no render (não via seletor).
  const accountData = useWorkoutStore((state) => state.accountDataById);
  const rateWorkout = useWorkoutStore((state) => state.rateWorkout);
  const applyGamificationForSession = useWorkoutStore((state) => state.applyGamificationForSession);

  const exerciseOptions = useMemo(() => {
    if (!session) return [];
    const seen = new Set<string>();
    return session.exerciseResults.filter((result) => {
      if (seen.has(result.exerciseId)) return false;
      seen.add(result.exerciseId);
      return true;
    });
  }, [session]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>(undefined);
  const effectiveExerciseId = selectedExerciseId ?? exerciseOptions[0]?.exerciseId;

  const { strengthSeries, volumeSeries } = useMemo(() => {
    const api = useWorkoutStore.getState();
    // `accountData` participa do cálculo para invalidar o memo quando os dados da conta mudam.
    const hasData = Object.keys(accountData).length > 0;
    if (!hasData) return { strengthSeries: [], volumeSeries: [] };
    return {
      strengthSeries: effectiveExerciseId
        ? api
            .getStrengthHistory()
            .filter((point) => point.exerciseId === effectiveExerciseId)
            .map((point) => ({ label: shortDate(point.date), value: Math.round(point.estimatedOneRepMax) }))
        : [],
      volumeSeries: api
        .getVolumeHistory()
        .slice(-14)
        .map((point) => ({ label: shortDate(point.date), value: Math.round(point.volume) })),
    };
  }, [accountData, effectiveExerciseId]);

  const metrics = useMemo(() => (session ? mapSessionToSummaryMetrics(session) : []), [session]);

  if (!sessionId || !session) {
    return (
      <FitnessPageShell>
        <FitnessEmptyState
          className="mt-24"
          message="Esta sessão não existe mais ou pertence a outra conta."
          action={<FitnessButton size="md" onClick={() => navigate('/treinos')}>Voltar para Treinos</FitnessButton>}
        />
      </FitnessPageShell>
    );
  }

  if (session.status === 'in_progress') {
    return (
      <FitnessPageShell>
        <FitnessEmptyState
          className="mt-24"
          message="Este treino ainda está em andamento. Finalize a sessão para ver o resumo completo."
          action={<FitnessButton size="md" onClick={() => navigate(`/treinos/ativo/${session.id}`)}>Continuar treino</FitnessButton>}
        />
      </FitnessPageShell>
    );
  }

  const muscleDistribution = useWorkoutStore.getState().getMuscleDistribution(session.id);
  const Icon = CATEGORY_ICONS[workout?.category ?? 'mixed'] ?? CATEGORY_ICONS.mixed;
  const timeRange = formatTimeRange(session.startedAt, session.completedAt);

  const handleShare = async () => {
    const volumeMetric = metrics.find((metric) => metric.id === 'volume');
    const text = [
      session.workoutNameSnapshot,
      `Tempo: ${formatLongClock(session.durationSeconds)}`,
      volumeMetric ? `Volume: ${volumeMetric.value} ${volumeMetric.unit ?? ''}`.trim() : undefined,
    ]
      .filter(Boolean)
      .join(' · ');

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: session.workoutNameSnapshot, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success('Resumo copiado');
    } catch (error) {
      // Cancelar o compartilhamento nativo não é um erro para o usuário.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('Não foi possível compartilhar o resumo');
    }
  };

  const handleSave = () => {
    applyGamificationForSession(session.id);
    navigate('/treinos');
  };

  return (
    <WorkoutSummaryView
      name={session.workoutNameSnapshot}
      icon={Icon}
      timeRange={timeRange}
      metrics={metrics}
      onBack={() => navigate('/treinos')}
      onShare={() => void handleShare()}
      onSave={handleSave}
    >
      <FitnessCard radius="lg" className="flex flex-col items-center p-6 text-center">
        <h3 className="font-sans text-xl font-semibold text-fitness-text">Como foi este treino?</h3>
        <div className="mt-4">
          <StarRating variant="fitness" value={rating?.stars ?? 0} onRate={(stars) => rateWorkout(session.id, stars)} />
        </div>
        <p className="mt-3 text-sm text-fitness-muted">
          Média das suas sessões: {averageRating > 0 ? averageRating.toFixed(1) : 'ainda não avaliado'}
        </p>
      </FitnessCard>

      <details className="rounded-fit-lg bg-fitness-surface p-5">
        <summary className="min-h-11 cursor-pointer rounded-lg py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-fitness-primary">Evolução e distribuição muscular</summary>
        <div className="mt-4 space-y-5">
      <ChartWidget
        title="Progressão de força"
        subtitle={
          exerciseOptions.length > 1 ? (
            <select
              value={effectiveExerciseId}
              onChange={(event) => setSelectedExerciseId(event.target.value)}
              aria-label="Exercício da progressão de força"
              className="h-11 w-full max-w-full rounded-xl bg-fitness-canvas px-3 text-base text-fitness-text outline-none focus:ring-2 focus:ring-fitness-primary"
            >
              {exerciseOptions.map((option) => (
                <option key={option.exerciseId} value={option.exerciseId}>
                  {option.exerciseNameSnapshot}
                </option>
              ))}
            </select>
          ) : undefined
        }
        emptyMessage={strengthSeries.length >= 2 ? undefined : FITNESS_COPY.empty.trend}
        summary={`1RM estimado em ${strengthSeries.length} registros`}
      >
        <TrendAreaChart data={strengthSeries} unit="kg" />
      </ChartWidget>

      <ChartWidget
        title="Histórico de volume"
        emptyMessage={volumeSeries.length >= 2 ? undefined : FITNESS_COPY.empty.trend}
        summary={`Volume dos últimos ${volumeSeries.length} dias com treino`}
      >
        <TrendAreaChart data={volumeSeries} unit="kg" />
      </ChartWidget>

      <FitnessCard radius="lg" className="p-6">
        <h3 className="font-sans text-xl font-semibold text-fitness-text">Distribuição muscular</h3>
        <div className="mt-4">
          <MuscleBars distribution={muscleDistribution} emptyMessage="Nenhuma série concluída nesta sessão." />
        </div>
      </FitnessCard>
        </div>
      </details>
    </WorkoutSummaryView>
  );
};
