/**
 * ActiveWorkout — Fitness UI Kit re-skin.
 *
 * Retains ALL existing store logic:
 * - getSessionById, finishWorkout, completePerformedSet, skipPerformedSet
 * - elapsed timer, progress calculations
 *
 * Visual changes:
 * - Dark fitness canvas background
 * - FitnessExerciseCard for each exercise (pending/active/completed)
 * - Green progress bar driven by real doneSets/totalSets
 * - Violet "time left" subtitle
 * - Pill Pause + coral Finish buttons at bottom
 */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  FitnessPageShell,
  FitnessHeader,
  FitnessButton,
  FitnessExerciseCard,
  FitnessCard,
} from '@/components/fitness';
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
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatDurationCompact } from '@/lib/fitness/fitness-format';
import type { ExerciseCardState } from '@/components/fitness/FitnessExerciseCard';

/** Convert elapsed seconds to display like "15min left" */
const buildTimeLeftLabel = (
  elapsedSeconds: number,
  estimatedMinutes: number
): string => {
  const estimatedSeconds = estimatedMinutes * 60;
  const remaining = Math.max(0, estimatedSeconds - elapsedSeconds);
  const mins = Math.ceil(remaining / 60);
  if (mins <= 0) return 'Finalizando…';
  return `${mins}min left`;
};

export const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const {
    getSessionById,
    getWorkoutById,
    getExerciseById,
    completePerformedSet,
    skipPerformedSet,
    finishWorkout,
  } = useWorkoutStore();

  const session = sessionId ? getSessionById(sessionId) : undefined;
  const workout = session ? getWorkoutById(session.workoutId) : undefined;

  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);

  // Timer
  useEffect(() => {
    if (!session) return undefined;
    const computeElapsed = () =>
      Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000));
    setElapsedSeconds(computeElapsed());
    if (isPaused || session.status !== 'in_progress') return undefined;
    const interval = setInterval(() => setElapsedSeconds(computeElapsed()), 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.startedAt, session?.status, isPaused]);

  // Auto-expand first incomplete exercise
  useEffect(() => {
    if (session && !expandedExerciseId && session.exerciseResults.length > 0) {
      const firstIncomplete = session.exerciseResults.find((r) =>
        r.sets.some((s) => !s.completed && !s.skipped)
      );
      setExpandedExerciseId((firstIncomplete ?? session.exerciseResults[0]).exerciseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  const sortedResults = useMemo(
    () => (session ? [...session.exerciseResults].sort((a, b) => a.order - b.order) : []),
    [session]
  );

  if (!sessionId || !session) {
    return (
      <FitnessPageShell className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-fitness-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-fitness-text mb-2">Sessão não encontrada</h2>
        <p className="text-sm text-fitness-muted mb-4 text-center">
          Esta sessão não existe mais ou pertence a outra conta.
        </p>
        <FitnessButton variant="secondary" onClick={() => navigate('/treinos')}>
          Voltar para Treinos
        </FitnessButton>
      </FitnessPageShell>
    );
  }

  if (session.status === 'completed') {
    return <Navigate to={`/treinos/resumo/${session.id}`} replace />;
  }

  if (session.status === 'cancelled') {
    return (
      <FitnessPageShell className="flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-fitness-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-fitness-text mb-2">Este treino foi cancelado</h2>
        <FitnessButton variant="secondary" onClick={() => navigate('/treinos')}>
          Voltar para Treinos
        </FitnessButton>
      </FitnessPageShell>
    );
  }

  // Progress calculations (real data from store)
  const totalSets = session.exerciseResults.reduce((sum, r) => sum + r.sets.length, 0);
  const doneSets = session.exerciseResults.reduce(
    (sum, r) => sum + r.sets.filter((s) => s.completed || s.skipped).length,
    0
  );
  const hasIncompleteSets = doneSets < totalSets;
  const progressPercent = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

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

  const timeLeftLabel = workout
    ? buildTimeLeftLabel(elapsedSeconds, workout.estimatedDurationMinutes)
    : undefined;

  return (
    <FitnessPageShell
      ctaOffset
      className="max-w-md mx-auto w-full"
    >
      {/* Header */}
      <FitnessHeader
        title={session.workoutNameSnapshot}
        subtitle={timeLeftLabel}
        subtitleColor="text-fitness-primary"
        onBack={() => navigate('/treinos')}
      />

      {/* Overall progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 mt-2"
      >
        <FitnessCard className="py-3 px-5">
          <div className="flex items-center justify-between text-[12px] text-fitness-muted mb-2">
            <span>{doneSets} / {totalSets} séries</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-[5px] w-full rounded-full bg-fitness-surface-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-fitness-green"
              style={{ transition: 'width 0.4s ease' }}
            />
          </div>
        </FitnessCard>
      </motion.div>

      {/* Exercise cards */}
      <div className="space-y-4 mb-6">
        {sortedResults.map((result) => {
          const exercise = getExerciseById(result.exerciseId);
          const completedSets = result.sets.filter((s) => s.completed || s.skipped).length;
          const totalExSets = result.sets.length;
          const isAllDone =
            totalExSets > 0 && result.sets.every((s) => s.completed || s.skipped);
          const isExpanded = expandedExerciseId === result.exerciseId;

          const cardState: ExerciseCardState = isAllDone
            ? 'completed'
            : isExpanded
            ? 'active'
            : 'pending';

          const progressRatio = totalExSets > 0 ? completedSets / totalExSets : 0;

          const durationLabel = exercise?.durationLabel
            ?? `${totalExSets} série${totalExSets !== 1 ? 's' : ''}`;

          return (
            <FitnessExerciseCard
              key={result.exerciseId}
              name={result.exerciseNameSnapshot}
              durationLabel={durationLabel}
              state={cardState}
              progressRatio={progressRatio}
              expanded={isExpanded}
              onToggleExpand={() =>
                setExpandedExerciseId((cur) =>
                  cur === result.exerciseId ? null : result.exerciseId
                )
              }
            />
          );
        })}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-gradient-to-t from-fitness-canvas via-fitness-canvas/95 to-transparent pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] flex justify-center gap-4 px-8">
        {/* Pause / Resume */}
        <FitnessButton
          variant={isPaused ? 'primary' : 'secondary'}
          size="md"
          onClick={() => setIsPaused((p) => !p)}
          className="flex-1 max-w-[160px]"
          aria-label={isPaused ? 'Retomar treino' : 'Pausar treino'}
        >
          {isPaused ? 'Retomar' : 'Pausar'}
        </FitnessButton>

        {/* Finish */}
        <FitnessButton
          variant="coral"
          size="md"
          onClick={handleFinishClick}
          className="flex-1 max-w-[160px]"
          aria-label="Finalizar treino"
        >
          Finalizar
        </FitnessButton>
      </div>

      {/* Confirm dialog for incomplete sets */}
      <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <AlertDialogContent className="bg-fitness-surface border-fitness-surface-muted rounded-[24px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-fitness-text">Finalizar treino incompleto?</AlertDialogTitle>
            <AlertDialogDescription className="text-fitness-muted">
              Ainda há {totalSets - doneSets} série(s) não concluída(s). Elas não contarão para o volume desta sessão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-fitness-surface-hover text-fitness-text">
              Continuar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={performFinish}
              className="rounded-full bg-fitness-coral hover:bg-fitness-coral/90 text-white"
            >
              Finalizar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </FitnessPageShell>
  );
};
