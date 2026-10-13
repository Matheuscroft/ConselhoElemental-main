import { NativeSessionDetails } from '@/components/workout/NativeSessionDetails';
import { ActivitySessionMetrics } from '@/components/workout/ActivitySessionMetrics';
import { activityMetrics } from '@/lib/workout/activity-metrics';
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
import { useAppStore } from '@/stores/appStore';
import { resolveNativeSessionXp } from '@/lib/workout/native-session-reward';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';

const shortDate = (value: string): string => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

export const WorkoutSummary: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const session = useWorkoutStore((state) => (sessionId ? state.getSessionById(sessionId) : undefined));
  const nativeSession = useWorkoutStore((state) => sessionId ? state.nativeHistory.find((item) => item.id === sessionId) : undefined);
  const nativeHistory = useWorkoutStore((state) => state.nativeHistory);
  const nativeTemplates = useWorkoutStore((state) => state.templates);
  const coreState = {
    executionLogs: useAppStore((state) => state.executionLogs),
    actions: useAppStore((state) => state.actions),
    tasks: useAppStore((state) => state.tasks),
    habits: useAppStore((state) => state.habits),
  };
  const workout = useWorkoutStore((state) => (session ? state.getWorkoutById(session.workoutId) : undefined));
  const rating = useWorkoutStore((state) => (sessionId ? state.getSessionRating(sessionId) : undefined));
  const averageRating = useWorkoutStore((state) => state.getAverageRating());
  // Assinatura do conteúdo da conta: re-renderiza quando o histórico muda. Os getters de histórico
  // devolvem objetos novos a cada chamada, então são lidos no render (não via seletor).
  const accountData = useWorkoutStore((state) => state.accountDataById);
  const rateWorkout = useWorkoutStore((state) => state.rateWorkout);
  const applyGamificationForSession = useWorkoutStore((state) => state.applyGamificationForSession);
  const legacyReward = useWorkoutStore((state) => sessionId ? state.accountDataById[state.currentAccountId ?? 'local']?.gamificationLedger.find((entry) => entry.sessionId === sessionId)?.xpAwarded : undefined);

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

  const metrics = useMemo(() => {
    if (!session) return [];
    if (!session.exerciseResults.some((result)=>result.exerciseId.startsWith('sport-'))) return mapSessionToSummaryMetrics(session);
    const measured=activityMetrics(session);
    return [{id:'active-time',label:'Tempo ativo',value:(measured.seconds/60).toFixed(1),unit:'min'},{id:'activity-load',label:'Carga percebida',value:measured.load.toFixed(1),unit:'u.a.'},{id:'earth',label:'Terra',value:String(session.earthPoints)},{id:'distance',label:'Distância',value:measured.distance>0?String(measured.distance):'—',unit:'m'}];
  }, [session]);

  if (nativeSession) {
    const Icon = CATEGORY_ICONS[nativeSession.exerciseResults[0]?.modality ?? nativeTemplates.find((template) => template.id === nativeSession.templateId)?.modality ?? 'mixed'] ?? CATEGORY_ICONS.mixed;
    const xp = resolveNativeSessionXp(nativeSession, coreState);
    const completedSets = nativeSession.exerciseResults.flatMap((exercise) => exercise.sets).filter((set) => set.completed && !set.skipped);
    const coreLog = coreState.executionLogs.find((log) => log.id === nativeSession.coreExecutionLogId) ?? nativeSession.coreReceipt;
    const timeRange = formatTimeRange(nativeSession.startedAt, nativeSession.completedAt);
    const distance = completedSets.reduce((sum, set) => sum + (set.distanceMeters ?? 0), 0);
    const distanceSets = completedSets.filter(set => set.measureMode === 'duration' && (set.distanceMeters ?? 0) > 0);
    const distanceSeconds = distanceSets.reduce((sum, set) => sum + (set.durationSeconds ?? 0), 0);
    const nativeMetrics = [
      { id: 'duration', label: 'Tempo cronometrado', value: formatLongClock(nativeSession.durationSeconds) },
      ...(nativeSession.activeDurationSeconds != null ? [{ id: 'active', label: coreLog?.durationSource === 'ESTIMATED_ACTIVE' ? 'Tempo ativo estimado' : coreLog?.durationSource === 'MIXED_ACTIVE' ? 'Tempo ativo misto' : 'Tempo ativo informado', value: formatLongClock(nativeSession.activeDurationSeconds) }] : []),
      { id: 'blocks', label: 'Blocos concluídos', value: String(completedSets.length) },
      ...(distance > 0 ? [{ id: 'distance', label: 'Distância informada', value: (distance / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }), unit: 'km' }] : []),
      ...(distance > 0 && distanceSeconds > 0 && nativeSession.exerciseResults.every(exercise => exercise.modality === 'running') ? [{ id: 'pace', label: 'Ritmo dos blocos com distância', value: formatLongClock(distanceSeconds / (distance / 1000)), unit: '/km' }] : []),
    ];
    const share = async () => {
      const text = `${nativeSession.nameSnapshot} · ${new Date(nativeSession.completedAt ?? nativeSession.startedAt).toLocaleString('pt-BR')} · ${formatLongClock(nativeSession.durationSeconds)}${xp == null ? '' : ` · +${formatEarthXp(xp)} XP Terra`}`;
      try { if (typeof navigator.share === 'function') await navigator.share({ title: nativeSession.nameSnapshot, text }); else { await navigator.clipboard.writeText(text); toast.success('Resumo copiado'); } }
      catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) toast.error('Não foi possível compartilhar o resumo'); }
    };
    return <WorkoutSummaryView name={nativeSession.nameSnapshot} icon={Icon} timeRange={timeRange} metrics={nativeMetrics} onBack={() => navigate('/treinos/historico')} onShare={() => void share()} onSave={() => navigate('/treinos/historico')}>
      <FitnessCard radius="lg" className="overflow-hidden border border-fitness-green/25 bg-gradient-to-br from-fitness-green/15 via-fitness-surface to-fitness-surface p-6">
        <p className="text-sm font-medium text-fitness-muted">Recompensa conquistada</p>
        {xp == null ? <p className="mt-2 text-base text-fitness-muted">XP indisponível neste registro histórico.</p> : <p className="mt-1 text-3xl font-bold text-fitness-green">+{formatEarthXp(xp)} XP <span aria-label="Terra">🌿</span></p>}
        <p className="mt-1 text-sm text-fitness-muted">Terra · registrada ao concluir</p>
        {coreLog?.ruleVersion?.startsWith('core-native-workout-block-') && <p className="mt-4 text-sm text-fitness-text-soft">{completedSets.length} blocos concluídos · {formatLongClock(coreLog.actualTimeMinutes * 60)} ativos · esforço ponderado {coreLog.actualEffortLevel}/5</p>}
      </FitnessCard>
      <NativeSessionDetails session={nativeSession} history={nativeHistory} stars={rating?.stars ?? 0} onRate={(stars) => rateWorkout(nativeSession.id, stars)} />
    </WorkoutSummaryView>;
  }

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
    navigate('/treinos/historico');
  };

  return (
    <WorkoutSummaryView
      name={session.workoutNameSnapshot}
      icon={Icon}
      timeRange={timeRange}
      metrics={metrics}
      onBack={() => navigate('/treinos/historico')}
      onShare={() => void handleShare()}
      onSave={handleSave}
    >
      <ActivitySessionMetrics session={session} />
      <FitnessCard radius="lg" className="border border-fitness-green/25 bg-fitness-green/10 p-5">
        <p className="text-sm font-medium text-fitness-muted">Recompensa registrada</p>
        {legacyReward == null ? <p className="mt-1 text-sm text-fitness-muted">XP indisponível neste registro histórico.</p> : <p className="mt-1 text-2xl font-bold text-fitness-green">+{formatEarthXp(legacyReward)} XP <span aria-label="Terra">🌿</span></p>}
        <p className="mt-1 text-sm text-fitness-muted">Terra · registrada ao concluir</p>
      </FitnessCard>
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
      {!session.exerciseResults.some((result)=>result.exerciseId.startsWith('sport-')) && <ChartWidget
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
      </ChartWidget>}

      <ChartWidget title="Carga percebida registrada" summary="Somente sessões com tempo ativo e esforço; não é volume em kg." emptyMessage={useWorkoutStore.getState().getWorkoutHistory().filter((item)=>activityMetrics(item).observations>0).length<2 ? 'Registre duas sessões com tempo ativo e esforço para comparar.' : undefined}>
        <TrendAreaChart data={useWorkoutStore.getState().getWorkoutHistory().filter((item)=>activityMetrics(item).observations>0).map((item)=>({label:shortDate(item.completedAt ?? item.startedAt),value:activityMetrics(item).load}))} unit="u.a." />
      </ChartWidget>
      {!session.exerciseResults.some((result)=>result.exerciseId.startsWith('sport-')) && <ChartWidget
        title="Histórico de volume legado (índice)"
        emptyMessage={volumeSeries.length >= 2 ? undefined : FITNESS_COPY.empty.trend}
        summary={`Volume dos últimos ${volumeSeries.length} dias com treino`}
      >
        <TrendAreaChart data={volumeSeries} unit="índice" />
      </ChartWidget>}

      <FitnessCard radius="lg" className="p-6">
        <h3 className="font-sans text-xl font-semibold text-fitness-text">Distribuição muscular estimada</h3>
        <p className="mt-3 text-xs text-fitness-muted">Com tempo e esforço registrados, a distribuição usa apenas esses blocos. Sem essas medidas, usa-se o índice legado. Estimativa de perfil, não medição corporal.</p>
        <div className="mt-4">
          <MuscleBars distribution={muscleDistribution} emptyMessage="Nenhuma série concluída nesta sessão." />
        </div>
      </FitnessCard>
        </div>
      </details>
    </WorkoutSummaryView>
  );
};
