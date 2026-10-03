import type { WorkoutExercise, WorkoutExercisePlan, WorkoutSetPlan } from '@/types/workout';

let localIdSequence = 0;

// O store exige IDs já definidos em WorkoutExercisePlan/WorkoutSetPlan antes de persistir;
// esta função apenas gera identificadores locais, sem nenhuma regra de negócio.
export const createLocalWorkoutId = (prefix: string): string => {
  const globalCrypto = globalThis.crypto;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }

  localIdSequence += 1;
  return `${prefix}-${Date.now()}-${localIdSequence}`;
};

const DEFAULT_REST_SECONDS = 60;

export interface ExerciseDraftConfig {
  sets: number;
  reps: number;
  durationSeconds: number;
  loadKg: number;
  restSeconds: number;
}

export const createDefaultDraftConfig = (exercise: WorkoutExercise): ExerciseDraftConfig => ({
  sets: Math.max(1, exercise.defaultSets || 3),
  reps: exercise.measureMode === 'reps' ? Math.max(1, exercise.defaultReps || 10) : 0,
  durationSeconds: exercise.measureMode === 'duration' ? Math.max(5, exercise.defaultDurationSeconds || 30) : 0,
  loadKg: exercise.loadMode === 'weighted' ? Math.max(0, exercise.defaultLoadKg || 0) : 0,
  restSeconds: DEFAULT_REST_SECONDS,
});

export const buildExercisePlan = (
  exercise: WorkoutExercise,
  order: number,
  config: ExerciseDraftConfig
): WorkoutExercisePlan => {
  const sets: WorkoutSetPlan[] = Array.from({ length: Math.max(1, config.sets) }, (_, index) => ({
    id: createLocalWorkoutId('set'),
    setNumber: index + 1,
    targetReps: exercise.measureMode === 'reps' ? Math.max(1, config.reps) : undefined,
    targetDurationSeconds: exercise.measureMode === 'duration' ? Math.max(1, config.durationSeconds) : undefined,
    targetLoadKg: exercise.loadMode === 'weighted' ? Math.max(0, config.loadKg) : 0,
    restSeconds: Math.max(0, config.restSeconds),
  }));

  return {
    id: createLocalWorkoutId('exercise-plan'),
    exerciseId: exercise.id,
    order,
    sets,
  };
};
