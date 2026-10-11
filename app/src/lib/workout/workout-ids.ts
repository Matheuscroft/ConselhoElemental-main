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
  reps: number;
  durationSeconds: number;
  loadKg: number;
  restSeconds: number;
  loadFactor: 0.8 | 1 | 1.5;
  id?: string;
}

export const createDefaultDraftConfig = (exercise: WorkoutExercise): ExerciseDraftConfig => ({
  reps: exercise.measureMode === 'reps' ? Math.max(1, exercise.defaultReps || 10) : 0,
  durationSeconds: exercise.measureMode === 'duration' ? Math.max(5, exercise.defaultDurationSeconds || 30) : 0,
  loadKg: exercise.loadMode === 'weighted' ? Math.max(0, exercise.defaultLoadKg || 0) : 0,
  restSeconds: DEFAULT_REST_SECONDS,
  loadFactor: 1,
});

export const createDefaultDraftConfigs = (exercise: WorkoutExercise): ExerciseDraftConfig[] =>
  Array.from({ length: Math.max(1, exercise.defaultSets || 3) }, () => createDefaultDraftConfig(exercise));

export const draftConfigsFromPlan = (
  exercise: WorkoutExercise,
  sets: WorkoutSetPlan[]
): ExerciseDraftConfig[] => sets.map((set) => ({
  id: set.id,
  reps: set.targetReps ?? 0,
  durationSeconds: set.targetDurationSeconds ?? 0,
  loadKg: set.targetLoadKg,
  restSeconds: set.restSeconds,
  loadFactor: set.loadFactor === 0.8 || set.loadFactor === 1.5 ? set.loadFactor : 1,
})).map((config) => ({ ...createDefaultDraftConfig(exercise), ...config }));

export const buildExercisePlan = (
  exercise: WorkoutExercise,
  order: number,
  configs: ExerciseDraftConfig[],
  existingPlanId?: string
): WorkoutExercisePlan => {
  const sets: WorkoutSetPlan[] = configs.map((config, index) => ({
    id: config.id ?? createLocalWorkoutId('set'),
    setNumber: index + 1,
    targetReps: exercise.measureMode === 'reps' ? Math.max(1, config.reps) : undefined,
    targetDurationSeconds: exercise.measureMode === 'duration' ? Math.max(1, config.durationSeconds) : undefined,
    targetLoadKg: exercise.loadMode === 'weighted' ? Math.max(0, config.loadKg) : 0,
    restSeconds: Math.max(0, config.restSeconds),
    loadFactor: config.loadFactor,
  }));

  return {
    id: existingPlanId ?? createLocalWorkoutId('exercise-plan'),
    exerciseId: exercise.id,
    order,
    sets,
  };
};
