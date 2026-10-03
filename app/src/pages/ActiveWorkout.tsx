import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Pause, Play, Square } from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui/glass-card';
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
import { ActiveExerciseCard, MuscleDistributionBars, RpgImpactCard } from '@/components/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatDuration, formatTime } from '@/lib/workout';

export const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();

  const {
    getSessionById,
    getWorkoutById,
    getExerciseById,
    getMuscleDistribution,
    previewSessionImpact,
    getResourceSnapshot,
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

  useEffect(() => {
    if (!session) return undefined;
    const computeElapsed = () =>
      Math.max(0, Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000));
    setElapsedSeconds(computeElapsed());

    if (isPaused || session.status !== 'in_progress') return undefined;
    const interval = setInterval(() => setElapsedSeconds(computeElapsed()), 1000);
    return () => clearInterval(interval);
    // 'session' muda de referência a cada atualização da store; dependemos só dos campos estáveis abaixo
    // para não reiniciar o intervalo a cada série concluída.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.startedAt, session?.status, isPaused]);

  useEffect(() => {
    if (session && !expandedExerciseId && session.exerciseResults.length > 0) {
      const firstIncomplete = session.exerciseResults.find((result) =>
        result.sets.some((set) => !set.completed && !set.skipped)
      );
      setExpandedExerciseId((firstIncomplete ?? session.exerciseResults[0]).exerciseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  const muscleDistribution = sessionId ? getMuscleDistribution(sessionId) : [];

  if (!sessionId || !session) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <AlertCircle className="w-12 h-12 text-mystic-gold mb-4" aria-hidden="true" />
          <h2 className="text-xl font-mystic mb-2">Sessão não encontrada</h2>
          <p className="text-sm text-white/50 mb-4">Esta sessão de treino não existe mais ou pertence a outra conta.</p>
          <Button onClick={() => navigate('/treinos')}>Voltar para Treinos</Button>
        </div>
      </AppLayout>
    );
  }

  if (session.status === 'completed') {
    return <Navigate to={`/treinos/resumo/${session.id}`} replace />;
  }

  if (session.status === 'cancelled') {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-96 text-center">
          <AlertCircle className="w-12 h-12 text-mystic-gold mb-4" aria-hidden="true" />
          <h2 className="text-xl font-mystic mb-2">Este treino foi cancelado</h2>
          <Button onClick={() => navigate('/treinos')}>Voltar para Treinos</Button>
        </div>
      </AppLayout>
    );
  }

  const totalSets = session.exerciseResults.reduce((sum, result) => sum + result.sets.length, 0);
  const doneSets = session.exerciseResults.reduce(
    (sum, result) => sum + result.sets.filter((set) => set.completed || set.skipped).length,
    0
  );
  const totalExercises = session.exerciseResults.length;
  const doneExercises = session.exerciseResults.filter((result) =>
    result.sets.every((set) => set.completed || set.skipped)
  ).length;
  const hasIncompleteSets = doneSets < totalSets;
  const progressPercent = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;

  const preview = previewSessionImpact(session.id);
  const resourceSnapshot = getResourceSnapshot();

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

  return (
    <AppLayout hideNav>
      <div className="flex items-center gap-3 mb-1">
        <Button variant="outline" size="icon" className="border-white/20" aria-label="Voltar para Treinos" onClick={() => navigate('/treinos')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0 flex-1 text-center">
          <h2 className="font-mystic text-lg truncate">{session.workoutNameSnapshot}</h2>
          {isPaused && (
            <Badge variant="outline" className="border-amber-400/40 text-amber-300 bg-amber-500/10 text-[10px]">
              Pausado
            </Badge>
          )}
        </div>
        <div className="w-9" aria-hidden="true" />
      </div>

      <div className="text-center mb-4">
        <p className="text-3xl font-mono font-bold text-mystic-cyan" aria-live="polite">
          {formatTime(elapsedSeconds)}
        </p>
        {workout && <p className="text-xs text-white/40 mt-0.5">Estimativa: {formatDuration(workout.estimatedDurationMinutes)}</p>}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between text-xs text-white/60 mb-2">
            <span>{doneExercises}/{totalExercises} exercícios</span>
            <span>{doneSets}/{totalSets} séries</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full rounded-full bg-gradient-to-r from-mystic-arcane to-mystic-cyan"
            />
          </div>
        </GlassCard>
      </motion.div>

      <div className="space-y-2.5 mb-4">
        {session.exerciseResults
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((result) => (
            <ActiveExerciseCard
              key={result.exerciseId}
              result={result}
              exercise={getExerciseById(result.exerciseId)}
              plan={workout?.exercises.find((exercisePlan) => exercisePlan.order === result.order)}
              expanded={expandedExerciseId === result.exerciseId}
              onToggleExpand={() =>
                setExpandedExerciseId((current) => (current === result.exerciseId ? null : result.exerciseId))
              }
              onCompleteSet={(performedSetId, values) => completePerformedSet(session.id, performedSetId, values)}
              onSkipSet={(performedSetId) => skipPerformedSet(session.id, performedSetId)}
            />
          ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <GlassCard className="p-4">
          <h3 className="font-mystic text-sm mb-3">Distribuição muscular</h3>
          <MuscleDistributionBars distribution={muscleDistribution} />
        </GlassCard>
      </motion.div>

      <div className="mb-24">
        <RpgImpactCard preview={preview} resourceSnapshot={resourceSnapshot} />
      </div>

      <div className="fixed bottom-0 inset-x-0 z-50 bg-black/80 backdrop-blur-xl border-t border-white/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-5xl flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-white/20 h-12"
            onClick={() => setIsPaused((prev) => !prev)}
          >
            {isPaused ? <Play className="w-4 h-4 mr-1.5" aria-hidden="true" /> : <Pause className="w-4 h-4 mr-1.5" aria-hidden="true" />}
            {isPaused ? 'Retomar' : 'Pausar'}
          </Button>
          <Button type="button" className="flex-1 h-12 bg-mystic-arcane hover:bg-mystic-arcane/80" onClick={handleFinishClick}>
            <Square className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Finalizar treino
          </Button>
        </div>
      </div>

      <AlertDialog open={showFinishConfirm} onOpenChange={setShowFinishConfirm}>
        <AlertDialogContent className="bg-mystic-purple/95 border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar treino incompleto?</AlertDialogTitle>
            <AlertDialogDescription>
              Ainda há {totalSets - doneSets} série(s) não concluída(s). Elas não contarão para o volume desta sessão. Deseja finalizar mesmo assim?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar treino</AlertDialogCancel>
            <AlertDialogAction onClick={performFinish}>Finalizar mesmo assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};
