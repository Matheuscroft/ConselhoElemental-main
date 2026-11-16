import { ActivitySessionMetrics } from '@/components/workout/ActivitySessionMetrics';
import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ExerciseCard,
  ExerciseSetRow,
  FitnessButton,
  FitnessCard,
  FitnessEmptyState,
  FitnessHeader,
  FitnessPageShell,
  MuscleBars,
  VideoExercisePlayer,
  type ExerciseCardState,
} from '@/components/fitness-kit';
import { TreinoAnel } from '@/components/fitness-kit/treino-anel';
import { TreinoBarraAcao } from '@/components/fitness-kit/treino-barra';
import { TreinoCena } from '@/components/fitness-kit/treino-cena';
import { TreinoDescanso, useDescanso } from '@/components/fitness-kit/treino-descanso';
import { TreinoEstatisticas } from '@/components/fitness-kit/treino-estatisticas';
import '@/components/fitness-kit/treino-uau.css';
import { getYogaIllustrationFullSrc } from '@/constants/yoga-image-prompts';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatClock, formatMinutes } from '@/lib/fitness-kit/format';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutExercise } from '@/types/workout';

/** Mídia real do exercício. Hoje só o Yoga possui ilustrações; nada é inventado. */
const getExercisePoster = (exercise?: WorkoutExercise): string | undefined =>
  exercise?.source === 'yoga' && exercise.legacyId ? getYogaIllustrationFullSrc(exercise.legacyId) : undefined;

export const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const session = useWorkoutStore((state) => (sessionId ? state.getSessionById(sessionId) : undefined));
  const workout = useWorkoutStore((state) => (session ? state.getWorkoutById(session.workoutId) : undefined));
  const preview = useWorkoutStore(useShallow((state) => (sessionId ? state.previewSessionImpact(sessionId) : undefined)));
  const resourceSnapshot = useWorkoutStore(useShallow((state) => state.getResourceSnapshot()));
  const getExerciseById = useWorkoutStore((state) => state.getExerciseById);
  const completePerformedSet = useWorkoutStore((state) => state.completePerformedSet);
  const skipPerformedSet = useWorkoutStore((state) => state.skipPerformedSet);
  const finishWorkout = useWorkoutStore((state) => state.finishWorkout);

  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [alturaBarra, setAlturaBarra] = useState<number>();

  // Rest only reads which sets are done: it never delays or records anything.
  const setsConcluidas = useMemo(
    () => (session?.exerciseResults ?? []).flatMap((result) => {
      const plan = workout?.exercises.find((exercisePlan) => exercisePlan.order === result.order);
      return result.sets
        .filter((set) => set.completed && !set.skipped)
        .map((set) => ({ id: set.id, descansoSegundos: plan?.sets.find((setPlan) => setPlan.setNumber === set.setNumber)?.restSeconds ?? 60 }));
    }),
    [session, workout],
  );
  const haSeriePendente = (session?.exerciseResults ?? []).some((result) => result.sets.some((set) => !set.completed && !set.skipped));
  const { descanso, dispensar } = useDescanso(setsConcluidas, haSeriePendente);

  const startedAt = session?.startedAt;
  const status = session?.status;

  useEffect(() => {
    if (!startedAt) return undefined;
    const computeElapsed = () => Math.max(0, Math.round((Date.now() - new Date(startedAt).getTime()) / 1000));
    setElapsedSeconds(computeElapsed());

    if (isPaused || status !== 'in_progress') return undefined;
    const interval = setInterval(() => setElapsedSeconds(computeElapsed()), 1000);
    return () => clearInterval(interval);
  }, [startedAt, status, isPaused]);

  const firstSessionExerciseId = session?.id;
  useEffect(() => {
    if (!session || session.exerciseResults.length === 0) return;
    const firstIncomplete = session.exerciseResults.find((result) => result.sets.some((set) => !set.completed && !set.skipped));
    setExpandedExerciseId((firstIncomplete ?? session.exerciseResults[0]).exerciseId);
    // Só ao abrir uma sessão diferente; cada série concluída não deve recolher/reabrir cards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstSessionExerciseId]);

  if (!sessionId || !session) {
    return (
      <FitnessPageShell>
        <FitnessEmptyState
          className="mt-24"
          message="Esta sessão de treino não existe mais ou pertence a outra conta."
          action={<FitnessButton size="md" onClick={() => navigate('/treinos')}>Voltar para Treinos</FitnessButton>}
        />
      </FitnessPageShell>
    );
  }

  if (session.status === 'completed') return <Navigate to={`/treinos/resumo/${session.id}`} replace />;

  if (session.status === 'cancelled') {
    return (
      <FitnessPageShell>
        <FitnessEmptyState
          className="mt-24"
          message="Este treino foi cancelado."
          action={<FitnessButton size="md" onClick={() => navigate('/treinos')}>Voltar para Treinos</FitnessButton>}
        />
      </FitnessPageShell>
    );
  }

  const getMuscleDistribution = useWorkoutStore.getState().getMuscleDistribution;
  const muscleDistribution = getMuscleDistribution(session.id);

  const orderedResults = session.exerciseResults.slice().sort((a, b) => a.order - b.order);
  const isResultDone = (result: (typeof orderedResults)[number]) =>
    result.sets.length > 0 && result.sets.every((set) => set.completed || set.skipped);
  const currentExerciseId = orderedResults.find((result) => !isResultDone(result))?.exerciseId;

  const totalSets = orderedResults.reduce((sum, result) => sum + result.sets.length, 0);
  const doneSets = orderedResults.reduce((sum, result) => sum + result.sets.filter((set) => set.completed || set.skipped).length, 0);
  const completedSets = orderedResults.reduce((sum, result) => sum + result.sets.filter((set) => set.completed).length, 0);
  const skippedSets = doneSets - completedSets;
  const hasIncompleteSets = doneSets < totalSets;

  const estimatedSeconds = (workout?.estimatedDurationMinutes ?? 0) * 60;
  const remainingSeconds = hasIncompleteSets ? Math.max(0, estimatedSeconds - elapsedSeconds) : 0;
  const subtitle = isPaused
    ? 'Relógio oculto · registro manual disponível'
    : estimatedSeconds > 0 && remainingSeconds > 0
      ? `${formatClock(elapsedSeconds)} · ${formatMinutes(Math.ceil(remainingSeconds / 60))} ${FITNESS_COPY.timeLeft}`
      : `${formatClock(elapsedSeconds)} ${FITNESS_COPY.elapsed}`;

  const performFinish = () => {
    const finished = finishWorkout(session.id);
    setShowFinishConfirm(false);
    if (finished) navigate(`/treinos/resumo/${finished.id}`);
  };

  const handleFinishClick = () => {
    if (hasIncompleteSets) {
      setShowFinishConfirm(true);
      return;
    }
    performFinish();
  };

  const impactMetrics = [
    { id: 'earth', label: 'Terra (potencial)', value: String(Math.round(preview?.earthPoints ?? 0)) },
    { id: 'strength', label: 'Força (potencial)', value: `+${Math.round(preview?.strengthGain ?? 0)}` },
    { id: 'stamina', label: 'Custo de Stamina', value: String(Math.round(preview?.staminaCost ?? 0)) },
    { id: 'prana', label: 'Custo de Prana', value: String(Math.round(preview?.pranaCost ?? 0)) },
  ];

  return (
    <FitnessPageShell focused withFixedAction fixedActionHeight={alturaBarra}>
      <TreinoCena>
      <FitnessHeader
        title={session.workoutNameSnapshot}
        subtitle={subtitle}
        onBack={() => navigate('/treinos')}
        backLabel="Voltar para Treinos"
      />
      <section className="treino-progresso ds-pane treino-entra" aria-label="Progresso da sessão">
        <TreinoAnel valor={totalSets > 0 ? doneSets / totalSets : 0} tamanho={68} espessura={7} rotulo="Séries processadas">
          {totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0}%
        </TreinoAnel>
        <div className="treino-progresso-texto">
          <span className="treino-progresso-numero">{completedSets} de {totalSets}</span>
          <p className="treino-progresso-rotulo" aria-live="polite">
            {['running','swimming','cycling','martial_arts'].includes(workout?.category ?? '') ? 'blocos concluídos' : 'séries concluídas'}{skippedSets > 0 ? ` · ${skippedSets} ${skippedSets === 1 ? 'pulada' : 'puladas'}` : ''}
          </p>
        </div>
      </section>

      <div className="mt-5 space-y-4">
        {orderedResults.map((result) => {
          const exercise = getExerciseById(result.exerciseId);
          const plan = workout?.exercises.find((exercisePlan) => exercisePlan.order === result.order);
          const done = result.sets.filter((set) => set.completed || set.skipped).length;
          const complete = isResultDone(result);
          const allSkipped = result.sets.length > 0 && result.sets.every((set) => set.skipped);
          const state: ExerciseCardState = allSkipped ? 'skipped' : complete ? 'completed' : result.exerciseId === currentExerciseId ? 'active' : 'pending';
          const currentSet = result.sets.find((set) => !set.completed && !set.skipped);
          const skipped = result.sets.filter((set) => set.skipped).length;
          const subtitleText = complete ? (skipped > 0 ? `${done - skipped} concluídas · ${skipped} puladas` : 'Concluído') : currentSet ? `${exercise?.source === 'native' ? 'Bloco' : 'Série'} ${currentSet.setNumber} de ${result.sets.length}` : `${result.sets.length} séries`;

          return (
            <ExerciseCard
              key={result.exerciseId}
              title={result.exerciseNameSnapshot}
              subtitle={subtitleText}
              state={state}
              progress={result.sets.length > 0 ? (done / result.sets.length) * 100 : 0}
              expanded={expandedExerciseId === result.exerciseId}
              onToggle={() => setExpandedExerciseId((current) => (current === result.exerciseId ? null : result.exerciseId))}
            >
              <VideoExercisePlayer title={result.exerciseNameSnapshot} src={result.videoUrl ?? exercise?.videoUrl} poster={result.imageUrl ?? exercise?.imageUrl ?? getExercisePoster(exercise)} />
              {result.sets.filter((set) => set.completed || set.skipped || set.id === currentSet?.id).map((set) => (
                <ExerciseSetRow
                  key={set.id}
                  set={set}
                  activity={exercise?.source === 'native'}
                  distanceUnit={exercise?.category === 'swimming' ? 'm' : ['running','cycling'].includes(exercise?.category ?? '') ? 'km' : undefined}
                  measureMode={exercise?.measureMode ?? 'reps'}
                  loadMode={exercise?.loadMode ?? 'weighted'}
                  restSeconds={plan?.sets.find((setPlan) => setPlan.setNumber === set.setNumber)?.restSeconds ?? 60}
                  onComplete={(values) => completePerformedSet(session.id, set.id, values)}
                  onSkip={() => skipPerformedSet(session.id, set.id)}
                />
              ))}
            </ExerciseCard>
          );
        })}
      </div>

      <ActivitySessionMetrics session={session} earthPoints={preview?.earthPoints} />
      <details className="mt-10 rounded-fit-lg bg-fitness-surface p-5">
        <summary className="cursor-pointer rounded-lg font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-fitness-primary">Músculos e recompensas</summary>
      <FitnessCard radius="lg" className="mt-5 p-1">
        <h2 className="font-sans text-xl font-semibold text-fitness-text">Distribuição muscular estimada</h2>
        <p className="mt-3 text-xs text-fitness-muted">Com tempo e esforço registrados, somente esses blocos entram na estimativa. Sem essas medidas, usa-se o índice legado. Os dois métodos não são somados.</p>
        <div className="mt-4">
          <MuscleBars distribution={muscleDistribution} emptyMessage="Conclua séries para revelar a distribuição muscular desta sessão." />
        </div>
      </FitnessCard>

      <FitnessCard radius="lg" className="mt-5 p-6">
        <h2 className="font-sans text-xl font-semibold text-fitness-text">Impacto Arcano (potencial)</h2>
        <TreinoEstatisticas metrics={impactMetrics} denso />
        <p className="mt-6 text-sm text-fitness-muted">
          Prana disponível: {resourceSnapshot.basePrana > 0 ? `${resourceSnapshot.currentPrana}/${resourceSnapshot.basePrana}` : 'não configurado'} · Stamina disponível: {resourceSnapshot.currentStamina}/{resourceSnapshot.baseStamina}
        </p>
        <p className="mt-1 text-xs text-fitness-muted-dark">Valores potenciais — confirmados apenas ao finalizar o treino.</p>
      </FitnessCard>

      </details>

      <p className="mt-5 text-sm text-fitness-muted">Tempo da sessão e tempo ativo declarado são medidas diferentes. O descanso não entra no tempo ativo.</p>
      </TreinoCena>
      <TreinoBarraAcao onHeightChange={setAlturaBarra}>
        {descanso && <TreinoDescanso key={descanso.fim} descanso={descanso} onDispensar={dispensar} />}
        <div className="treino-barra-botoes">
          <button type="button" className="treino-acao" onClick={() => setIsPaused((current) => !current)}>
            {isPaused ? 'Ver relógio' : 'Ocultar relógio'}
          </button>
          <button type="button" className="treino-acao treino-acao--principal" onClick={handleFinishClick}>
            {hasIncompleteSets ? 'Finalizar treino' : 'Concluir treino'}
          </button>
        </div>
      </TreinoBarraAcao>

      <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <AlertDialogContent className="rounded-fit-lg border-0 bg-fitness-surface text-fitness-text">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans text-fitness-text">Finalizar treino incompleto?</AlertDialogTitle>
            <AlertDialogDescription className="text-fitness-muted">
              Ainda há {totalSets - doneSets} série(s) não concluída(s). Elas não contarão para o volume desta sessão. Deseja finalizar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-0 bg-fitness-canvas text-fitness-text hover:bg-fitness-surface-hover hover:text-fitness-text">
              Continuar treino
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-fitness-coral text-white hover:bg-fitness-coral/90" onClick={performFinish}>
              Finalizar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FitnessPageShell>
  );
};
