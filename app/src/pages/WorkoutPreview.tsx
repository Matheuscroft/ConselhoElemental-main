/**
 * WorkoutPreview — Pre-workout detail screen.
 * Shows hero image/gradient, workout name, duration, difficulty,
 * exercise program list, and sticky "Start workout" CTA.
 *
 * Route: /treinos/preview/:workoutId
 */
import React, { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Dumbbell } from 'lucide-react';
import {
  FitnessPageShell,
  FitnessButton,
  FitnessIconBadge,
  SectionHeader,
} from '@/components/fitness';
import { useWorkoutStore } from '@/stores/workoutStore';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import { formatDurationCompact, formatSecondsLabel } from '@/lib/fitness/fitness-format';

export const WorkoutPreview: React.FC = () => {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();

  const { getWorkoutById, getExerciseById, startWorkout } = useWorkoutStore();

  const workout = workoutId ? getWorkoutById(workoutId) : undefined;

  const exercises = useMemo(() => {
    if (!workout) return [];
    return workout.exercises
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((plan) => ({
        plan,
        exercise: getExerciseById(plan.exerciseId),
      }));
  }, [workout, getExerciseById]);

  if (!workout) {
    return (
      <FitnessPageShell className="flex flex-col items-center justify-center min-h-dvh">
        <AlertCircle className="w-12 h-12 text-fitness-muted mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-fitness-text mb-2">Treino não encontrado</h2>
        <p className="text-sm text-fitness-muted mb-4 text-center">
          Este treino não existe mais ou foi removido.
        </p>
        <FitnessButton variant="secondary" onClick={() => navigate('/treinos')}>
          Voltar para Treinos
        </FitnessButton>
      </FitnessPageShell>
    );
  }

  const CategoryIcon = CATEGORY_ICONS[workout.category] ?? Dumbbell;

  const handleStart = () => {
    const session = startWorkout(workout.id);
    if (session) navigate(`/treinos/ativo/${session.id}`);
  };

  return (
    <FitnessPageShell noPadX ctaOffset className="max-w-md mx-auto w-full">
      {/* ── Hero zone ─────────────────────────────────────────────────── */}
      <div className="relative h-52 bg-gradient-to-br from-fitness-primary-dark via-fitness-primary-dim to-fitness-primary overflow-hidden">
        {/* Back arrow overlaid */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/30 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Title centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-[26px] font-semibold text-white drop-shadow-md px-12 text-center">
            {workout.name}
          </h1>
        </div>

        {/* Bottom curve mask */}
        <div
          className="absolute bottom-0 inset-x-0 h-8 bg-fitness-canvas"
          style={{ borderRadius: '52px 52px 0 0' }}
        />
      </div>

      {/* ── Content sheet ─────────────────────────────────────────────── */}
      <div className="px-6 pt-2">
        {/* Workout name + duration */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-[26px] font-semibold text-fitness-text leading-tight max-w-[70%]">
            {workout.name}
          </h2>
          <span className="text-[17px] font-semibold text-fitness-primary mt-1">
            {formatDurationCompact(workout.estimatedDurationMinutes)}
          </span>
        </div>

        {/* Meta pills */}
        <div className="flex items-center gap-3 mb-7">
          <span className="text-[13px] text-fitness-muted">Dificuldade</span>
          <span className="px-3 py-1 rounded-full bg-fitness-primary/20 text-fitness-primary text-[12px] font-medium">
            {CATEGORY_LABELS[workout.category]}
          </span>
          <span className="text-[13px] text-fitness-muted ml-2">Duração</span>
          <span className="px-3 py-1 rounded-full bg-fitness-primary/20 text-fitness-primary text-[12px] font-medium">
            {formatDurationCompact(workout.estimatedDurationMinutes)}
          </span>
        </div>

        {/* Program section */}
        <SectionHeader title="Program" className="mb-4" />

        <div className="space-y-4">
          {exercises.length === 0 ? (
            <p className="text-sm text-fitness-muted">Nenhum exercício neste treino.</p>
          ) : (
            exercises.map(({ plan, exercise }) => {
              const ExIcon = exercise
                ? (CATEGORY_ICONS[exercise.category] ?? Dumbbell)
                : Dumbbell;
              const durationLabel = exercise?.durationLabel ?? `${plan.sets.length} séries`;

              return (
                <div
                  key={plan.id}
                  className="flex items-center gap-4 rounded-[20px] bg-fitness-surface px-4 py-4 shadow-fitness-card"
                >
                  <FitnessIconBadge icon={ExIcon} size="md" aria-label={exercise?.name ?? plan.exerciseId} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-fitness-text truncate">
                      {exercise?.name ?? plan.exerciseId}
                    </p>
                    <p className="text-[13px] text-fitness-muted mt-0.5">{durationLabel}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sticky Start CTA */}
      <div className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-fitness-canvas via-fitness-canvas/95 to-transparent pointer-events-none">
        <FitnessButton
          variant="primary"
          size="lg"
          onClick={handleStart}
          className="w-[75%] pointer-events-auto"
          aria-label={`Iniciar ${workout.name}`}
        >
          Start workout
        </FitnessButton>
      </div>
    </FitnessPageShell>
  );
};
