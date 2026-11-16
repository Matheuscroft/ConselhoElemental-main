import { NativeWorkoutPreview } from './NativeWorkoutPreview';
import React, { useMemo, useState, type CSSProperties } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  FitnessBottomNav,
  FitnessButton,
  FitnessEmptyState,
  WorkoutPreviewHero,
  FitnessPageShell,
} from '@/components/fitness-kit';
import { TreinoBarraAcao } from '@/components/fitness-kit/treino-barra';
import { TreinoCena } from '@/components/fitness-kit/treino-cena';
import { TreinoLinha } from '@/components/fitness-kit/treino-linha';
import '@/components/fitness-kit/treino-uau.css';
import { ExerciseDetailSheet } from '@/components/workout';
import { resolveExerciseMedia } from '@/lib/workout/exercise-media';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatClock, formatMinutes } from '@/lib/fitness-kit/format';
import { CATEGORY_LABELS, LEVEL_LABELS } from '@/lib/workout';
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
  const { workoutId } = useParams();
  const template = useWorkoutStore(state => state.templates.find(item => item.id === workoutId));
  return template ? <NativeWorkoutPreview template={template} /> : <LegacyWorkoutPreview />;
};

const LegacyWorkoutPreview: React.FC = () => {
  const navigate = useNavigate();
  const [detailExercise, setDetailExercise] = useState<WorkoutExercise | null>(null);
  const [alturaBarra, setAlturaBarra] = useState<number>();
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

  const totalSets = rows.reduce((sum, row) => sum + row.plan.sets.length, 0);

  return (
    <FitnessPageShell focused withFixedAction fixedActionHeight={alturaBarra} showPageMap={false} bleed flushTop>
      <TreinoCena>
      <WorkoutPreviewHero title={workout.name} heroImage={rows.map(({ plan, exercise }) => resolveExerciseMedia(plan, exercise, exercise).poster).find(Boolean)} onBack={() => navigate(`/treinos?modalidade=${workout.category}`)}>
        <li className="treino-chip">{CATEGORY_LABELS[workout.category]} · {rows.every((row)=>row.exercise?.source === 'native') ? 'Registro manual' : SCORE_LABEL[difficultyScore]}</li>
        <li className="treino-chip treino-chip--xp">{formatMinutes(workout.estimatedDurationMinutes)}</li>
        <li className="treino-chip">{rows.length} {rows.length === 1 ? 'exercício' : 'exercícios'} · {totalSets} {totalSets === 1 ? 'série' : 'séries'}</li>
      </WorkoutPreviewHero>

      <div className="treino-corpo">
        <p className="treino-corpo-nota treino-entra" style={{ '--i': 2 } as CSSProperties}>Tempo planejado, ajustável ao executar.</p>

        <h2 className="treino-secao treino-entra" style={{ '--i': 3 } as CSSProperties}>{FITNESS_COPY.program}</h2>
        <p className="treino-corpo-nota treino-entra" style={{ '--i': 3 } as CSSProperties}>Toque em um exercício para ver a execução.</p>
        {rows.length === 0 ? (
          <FitnessEmptyState message="Este treino ainda não tem exercícios." />
        ) : (
          <div className="treino-lista">
            {rows.map(({ plan, exercise }, index) => (
              <TreinoLinha
                key={plan.id}
                numero={index + 1}
                indice={index}
                titulo={exercise?.name ?? 'Exercício removido'}
                subtitulo={describePlan(plan, exercise)}
                onClick={exercise ? () => setDetailExercise(exercise) : undefined}
                ariaLabel={exercise ? `Ver detalhes de ${exercise.name}` : undefined}
              />
            ))}
          </div>
        )}
      </div>
      </TreinoCena>

      <ExerciseDetailSheet
        variant="fitness"
        exercise={detailExercise}
        open={Boolean(detailExercise)}
        onOpenChange={(open) => { if (!open) setDetailExercise(null); }}
      />

      <TreinoBarraAcao onHeightChange={setAlturaBarra}>
        <button type="button" className="treino-acao treino-acao--principal w-full" disabled={actionDisabled} onClick={handlePrimaryAction}>
          {actionLabel}
        </button>
      </TreinoBarraAcao>
    </FitnessPageShell>
  );
};
