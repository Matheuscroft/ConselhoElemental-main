import type { WorkoutExercise, WorkoutExercisePlan } from '@/types/workout';
import { WORKOUT_ER_BASE_VALUE } from './workout-balance';

export interface PlannedWorkoutEquivalents {
  equivalents: number;
  baseValue: number;
}

/** Projeção do template conforme as unidades ER; não calcula XP ou Prana do Core. */
export const estimatePlannedWorkoutEquivalents = (
  plans: WorkoutExercisePlan[],
  catalog: WorkoutExercise[]
): PlannedWorkoutEquivalents => {
  const exerciseById = new Map(catalog.map((exercise) => [exercise.id, exercise]));
  const equivalents = plans.reduce((workoutTotal, plan) => {
    const exercise = exerciseById.get(plan.exerciseId);
    // Modalidades nativas por tempo/distância usam as métricas próprias do domínio,
    // não repetição dinâmica nem isometria.
    if (!exercise || exercise.source === 'native') return workoutTotal;

    return workoutTotal + plan.sets.reduce((exerciseTotal, set) => {
      const rawEquivalents = exercise.measureMode === 'reps'
        ? (set.targetReps ?? 0)
        : (set.targetDurationSeconds ?? 0) / 2;
      const loadFactor = set.loadFactor === 0.8 || set.loadFactor === 1.5 ? set.loadFactor : 1;
      return exerciseTotal + rawEquivalents * loadFactor;
    }, 0);
  }, 0);

  const normalizedEquivalents = Math.round(equivalents * 100) / 100;
  return {
    equivalents: normalizedEquivalents,
    baseValue: Math.round(normalizedEquivalents * WORKOUT_ER_BASE_VALUE * 10000) / 10000,
  };
};
