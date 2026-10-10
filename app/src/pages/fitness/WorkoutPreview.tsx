import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  FitnessBottomNav,
  FitnessButton,
  FitnessEmptyState,
  FitnessListRow,
  FitnessHeader,
  FitnessPageShell,
  FitnessStickyAction,
  SectionHeader,

} from '@/components/fitness-kit';
import { ExerciseDetailSheet } from '@/components/workout';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatClock, formatMinutes } from '@/lib/fitness-kit/format';
import { CATEGORY_ICONS, CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { WorkoutExercise, WorkoutExerciseLevel, WorkoutExercisePlan } from '@/types/workout';

const LEVEL_SCORE: Record<WorkoutExerciseLevel, number> = { beginner: 1, intermediate: 2, advanced: 3, custom: 2 };
const SCORE_LABEL: Record<1 | 2 | 3, string> = { 1: LEVEL_LABELS.beginner, 2: LEVEL_LABELS.intermediate, 3: LEVEL_LABELS.advanced };

const describePlan = (plan: WorkoutExercisePlan, exercise?: WorkoutExercise): string => {
  const sets = plan.sets.length;
  const first = plan.sets[0];
  const setsLabel = `${sets} ${sets === 1 ? 'série' : 'séries'}`;
  if (!first) return setsLabel;
  if (exercise?.measureMode === 'duration' && first.targetDurationSeconds) {
    return `${setsLabel} · ${formatClock(first.targetDurationSeconds)}`;
  }
  if (first.targetReps) return `${setsLabel} · ${first.targetReps} reps`;
  return setsLabel;
};

export const WorkoutPreview: React.FC = () => {
  const navigate = useNavigate();
  const [detailExercise, setDetailExercise] = useState<WorkoutExercise | null>(null);
  const { workoutId } = useParams<{ workoutId: string }>();

  const workout = useWorkoutStore((state) => (workoutId ? state.getWorkoutById(workoutId) : undefined));
  const getExerciseById = useWorkoutStore((state) => state.getExerciseById);
  const startWorkout = useWorkoutStore((state) => state.startWorkout);

  const rows = useMemo(
    () =>
      (workout?.exercises ?? [])
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((plan) => ({ plan, exercise: getExerciseById(plan.exerciseId) })),
    [workout, getExerciseById]
  );

  const difficultyScore = useMemo<1 | 2 | 3>(() => {
    if (rows.length === 0) return 1;
    const average = rows.reduce((sum, row) => sum + LEVEL_SCORE[row.exercise?.level ?? 'custom'], 0) / rows.length;
    return Math.min(3, Math.max(1, Math.round(average))) as 1 | 2 | 3;
  }, [rows]);

  if (!workoutId) return <Navigate to="/treinos" replace />;

  if (!workout) {
    return (
      <FitnessPageShell withNav>
        <FitnessEmptyState
          className="mt-24"
          message="Este treino não existe mais ou pertence a outra conta."
          action={<FitnessButton size="md" onClick={() => navigate('/treinos')}>Voltar para Treinos</FitnessButton>}
        />
        <FitnessBottomNav />
      </FitnessPageShell>
    );
  }


  const isCompleted = workout.status === 'completed';
  const canStart = workout.status === 'planned' || workout.status === 'in_progress';

  const handlePrimaryAction = () => {
    if (isCompleted) {
      if (workout.lastSessionId) navigate(`/treinos/resumo/${workout.lastSessionId}`);
      return;
    }
    const session = startWorkout(workout.id);
    if (session) navigate(`/treinos/ativo/${session.id}`);
  };

  const actionLabel = isCompleted ? 'Ver resumo' : workout.status === 'in_progress' ? 'Continuar treino' : FITNESS_COPY.startWorkout;
  const actionDisabled = isCompleted ? !workout.lastSessionId : !canStart;

  return (
    <FitnessPageShell focused withFixedAction>
      <FitnessHeader title="Seu treino" onBack={() => navigate('/treinos')} />

      <div className="mt-8 bg-fitness-canvas">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="min-w-0 break-words font-sans text-[28px] font-semibold leading-tight text-fitness-text">{workout.name}</h2>
          <span className="shrink-0 text-lg font-medium text-fitness-primary">{formatMinutes(workout.estimatedDurationMinutes)}</span>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-sm text-fitness-muted">{CATEGORY_LABELS[workout.category]} · {rows.every((row)=>row.exercise?.source === 'native') ? 'Registro manual' : SCORE_LABEL[difficultyScore]}</span>
          <span className="text-sm text-fitness-muted">Tempo planejado, ajustável ao executar</span>
        </div>

        <div className="mt-12">
          <SectionHeader title={FITNESS_COPY.program} />
          <p className="mt-2 text-sm text-fitness-muted">
            {rows.length} {rows.length === 1 ? 'exercício' : 'exercícios'} · Toque para ver a execução
          </p>
          <div className="mt-5 space-y-4">
            {rows.length === 0 ? (
              <FitnessEmptyState message="Este treino ainda não tem exercícios." />
            ) : (
              rows.map(({ plan, exercise }) => (
                <FitnessListRow
                  key={plan.id}
                  icon={CATEGORY_ICONS[exercise?.category ?? 'mixed'] ?? CATEGORY_ICONS.mixed}
                  title={exercise?.name ?? 'Exercício removido'}
                  subtitle={describePlan(plan, exercise)}
                  onClick={exercise ? () => setDetailExercise(exercise) : undefined}
                  ariaLabel={exercise ? `Ver detalhes de ${exercise.name}` : undefined}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ExerciseDetailSheet
        variant="fitness"
        exercise={detailExercise}
        open={Boolean(detailExercise)}
        onOpenChange={(open) => { if (!open) setDetailExercise(null); }}
      />

      <FitnessStickyAction focused>
        <FitnessButton className="w-full" disabled={actionDisabled} onClick={handlePrimaryAction}>
          {actionLabel}
        </FitnessButton>
      </FitnessStickyAction>
    </FitnessPageShell>
  );
};
