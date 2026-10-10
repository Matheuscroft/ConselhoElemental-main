import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppStore } from '@/stores/appStore';
import { CALISTENIA_EXERCISES } from '@/constants/calistenia-exercises';
import { SPORT_ACTIVITIES } from '@/constants/sport-activities';
import { YOGA_POSES } from '@/constants/yoga-poses';
import type {
  BodyMeasurement,
  BodyMeasurementInput,
  ExerciseMeasureMode,
  ISODateString,
  MuscleContribution,
  MuscleGroupId,
  PerformedSet,
  PerformedSetUpdateInput,
  StrengthRecord,
  Workout,
  WorkoutAccountData,
  WorkoutCreateInput,
  WorkoutExercise,
  WorkoutExerciseCategory,
  WorkoutExercisePlan,
  WorkoutExerciseResult,
  WorkoutExerciseSource,
  WorkoutGamificationLedgerEntry,
  WorkoutRating,
  WorkoutResourceSnapshot,
  WorkoutSession,
  WorkoutSetPlan,
  WorkoutStats,
  WorkoutStrengthHistoryPoint,
  WorkoutUpdateInput,
  WorkoutVolumeHistoryPoint,
} from '@/types/workout';

const WORKOUT_STORAGE_KEY = 'dominio-do-mago-workout-storage-v1';
const FORMULA_VERSION = 'workout-v1';
const PRANA_MAX = 100;
const MUSCLE_PERCENTAGE_UNITS = 10000;

const MUSCLE_GROUP_ORDER: MuscleGroupId[] = [
  'chest',
  'upper_back',
  'lats',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'core',
  'glutes',
  'quadriceps',
  'hamstrings',
  'calves',
  'adductors',
  'lower_back',
];

const sanitizeNonNegative = (value: number | undefined | null, fallback = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(0, value);
};

const sanitizePositiveInteger = (value: number | undefined | null, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.max(1, Math.round(value));
};

const sanitizeInteger = (value: number | undefined | null, fallback = 0): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.round(value);
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const toIso = (value: Date | string | number | undefined | null): ISODateString => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? new Date().toISOString() : value.toISOString();
  }

  if (typeof value === 'number' || typeof value === 'string') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
  }

  return new Date().toISOString();
};

const toDate = (value: Date | string | number | undefined | null): Date | null => {
  if (value == null) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toDayKey = (value: Date | string | number | undefined | null): string | null => {
  const date = toDate(value);
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

let idSequence = 0;

const createId = (prefix: string): string => {
  const globalCrypto = globalThis.crypto;
  if (globalCrypto && typeof globalCrypto.randomUUID === 'function') {
    return `${prefix}-${globalCrypto.randomUUID()}`;
  }

  idSequence += 1;
  return `${prefix}-${Date.now()}-${idSequence}`;
};

const cloneContributions = (values: MuscleContribution[]): MuscleContribution[] =>
  values.map((value) => ({ ...value }));

const normalizeMuscleDistribution = (distribution: MuscleContribution[]): MuscleContribution[] => {
  const aggregated = new Map<MuscleGroupId, number>();
  distribution.forEach((entry) => {
    if (!MUSCLE_GROUP_ORDER.includes(entry.muscleId)) return;
    const percentage = sanitizeNonNegative(entry.percentage);
    if (percentage <= 0) return;
    aggregated.set(entry.muscleId, (aggregated.get(entry.muscleId) ?? 0) + percentage);
  });

  const total = Array.from(aggregated.values()).reduce((sum, value) => sum + value, 0);
  if (total <= 0) return [{ muscleId: 'core', percentage: 100 }];

  const rows = Array.from(aggregated.entries()).map(([muscleId, percentage]) => {
    const exactUnits = (percentage / total) * MUSCLE_PERCENTAGE_UNITS;
    const floorUnits = Math.floor(exactUnits);
    return {
      muscleId,
      exactUnits,
      floorUnits,
      fractionalUnits: exactUnits - floorUnits,
    };
  });

  let remainingUnits = MUSCLE_PERCENTAGE_UNITS - rows.reduce((sum, row) => sum + row.floorUnits, 0);
  rows.sort((left, right) => {
    if (right.fractionalUnits !== left.fractionalUnits) {
      return right.fractionalUnits - left.fractionalUnits;
    }
    return MUSCLE_GROUP_ORDER.indexOf(left.muscleId) - MUSCLE_GROUP_ORDER.indexOf(right.muscleId);
  });

  for (let index = 0; index < rows.length && remainingUnits > 0; index += 1) {
    rows[index].floorUnits += 1;
    remainingUnits -= 1;
    if (index === rows.length - 1 && remainingUnits > 0) index = -1;
  }

  return rows
    .map((row) => ({
      muscleId: row.muscleId,
      percentage: row.floorUnits / 100,
    }))
    .filter((entry) => entry.percentage > 0)
    .sort((left, right) => MUSCLE_GROUP_ORDER.indexOf(left.muscleId) - MUSCLE_GROUP_ORDER.indexOf(right.muscleId));
};

const averageNumbers = (values: number[], fallback: number): number => {
  if (values.length === 0) return fallback;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const parseNumberRange = (text: string): number[] => {
  const matches = text.match(/\d+(?:[.,]\d+)?/g) ?? [];
  return matches
    .map((match) => Number(match.replace(',', '.')))
    .filter((value) => Number.isFinite(value) && value >= 0);
};

const parseDurationSeconds = (duration?: string): number => {
  if (!duration) return 0;
  const values = parseNumberRange(duration);
  if (values.length === 0) return 0;
  const average = averageNumbers(values, 0);
  const lower = duration.toLocaleLowerCase('pt-BR');
  if (lower.includes('minuto')) return Math.round(average * 60);
  if (lower.includes('segundo')) return Math.round(average);
  return 0;
};

const parseSetCount = (duration?: string): number => {
  if (!duration) return 1;
  const match = duration.match(/(\d+)\s*(?:-|a|–|—)\s*(\d+)?\s*s[eé]ries/i);
  if (!match) return 1;
  const first = Number(match[1]);
  const second = match[2] ? Number(match[2]) : first;
  return sanitizePositiveInteger(averageNumbers([first, second], 1), 1);
};

const parseRepCount = (duration?: string): number => {
  if (!duration) return 10;
  const match = duration.match(/(\d+)\s*(?:-|a|–|—)\s*(\d+)?\s*repeti(?:ç|c)[õo]es?/i);
  if (!match) return 10;
  const first = Number(match[1]);
  const second = match[2] ? Number(match[2]) : first;
  return sanitizePositiveInteger(averageNumbers([first, second], 10), 10);
};

const yogaFallbackDistribution = (family: string, focus: string): MuscleContribution[] => {
  const familyLower = family.toLocaleLowerCase('pt-BR');
  const focusLower = focus.toLocaleLowerCase('pt-BR');

  if (familyLower.includes('flexões') || focusLower.includes('alongamento posterior')) {
    return [
      { muscleId: 'hamstrings', percentage: 35 },
      { muscleId: 'lower_back', percentage: 20 },
      { muscleId: 'calves', percentage: 15 },
      { muscleId: 'glutes', percentage: 15 },
      { muscleId: 'core', percentage: 15 },
    ];
  }

  if (familyLower.includes('extensões')) {
    return [
      { muscleId: 'lower_back', percentage: 25 },
      { muscleId: 'chest', percentage: 20 },
      { muscleId: 'shoulders', percentage: 20 },
      { muscleId: 'glutes', percentage: 20 },
      { muscleId: 'core', percentage: 15 },
    ];
  }

  if (familyLower.includes('transição') || familyLower.includes('força')) {
    return [
      { muscleId: 'shoulders', percentage: 25 },
      { muscleId: 'core', percentage: 25 },
      { muscleId: 'hamstrings', percentage: 15 },
      { muscleId: 'lats', percentage: 15 },
      { muscleId: 'triceps', percentage: 10 },
      { muscleId: 'calves', percentage: 10 },
    ];
  }

  return [
    { muscleId: 'quadriceps', percentage: 30 },
    { muscleId: 'glutes', percentage: 25 },
    { muscleId: 'calves', percentage: 15 },
    { muscleId: 'core', percentage: 20 },
    { muscleId: 'adductors', percentage: 10 },
  ];
};

const calisteniaFallbackDistribution = (category: string): MuscleContribution[] => {
  switch (category) {
    case 'Empurrar':
      return [
        { muscleId: 'chest', percentage: 45 },
        { muscleId: 'shoulders', percentage: 25 },
        { muscleId: 'triceps', percentage: 20 },
        { muscleId: 'core', percentage: 10 },
      ];
    case 'Puxar':
      return [
        { muscleId: 'lats', percentage: 40 },
        { muscleId: 'upper_back', percentage: 25 },
        { muscleId: 'biceps', percentage: 20 },
        { muscleId: 'forearms', percentage: 10 },
        { muscleId: 'core', percentage: 5 },
      ];
    case 'Pernas':
      return [
        { muscleId: 'quadriceps', percentage: 40 },
        { muscleId: 'glutes', percentage: 30 },
        { muscleId: 'hamstrings', percentage: 15 },
        { muscleId: 'adductors', percentage: 5 },
        { muscleId: 'calves', percentage: 10 },
      ];
    case 'Core':
      return [
        { muscleId: 'core', percentage: 65 },
        { muscleId: 'glutes', percentage: 15 },
        { muscleId: 'shoulders', percentage: 10 },
        { muscleId: 'forearms', percentage: 10 },
      ];
    case 'Isometrias e Skills':
      return [
        { muscleId: 'core', percentage: 40 },
        { muscleId: 'shoulders', percentage: 25 },
        { muscleId: 'triceps', percentage: 15 },
        { muscleId: 'glutes', percentage: 10 },
        { muscleId: 'forearms', percentage: 10 },
      ];
    case 'Condicionamento':
      return [
        { muscleId: 'quadriceps', percentage: 25 },
        { muscleId: 'glutes', percentage: 25 },
        { muscleId: 'chest', percentage: 15 },
        { muscleId: 'shoulders', percentage: 10 },
        { muscleId: 'core', percentage: 15 },
        { muscleId: 'calves', percentage: 10 },
      ];
    default:
      return [{ muscleId: 'core', percentage: 100 }];
  }
};

const mapLevel = (level: 'Iniciante' | 'Intermediário'): WorkoutExercise['level'] =>
  level === 'Iniciante' ? 'beginner' : 'intermediate';

const normalizeLegacyExercise = (
  exercise: {
    id: string;
    namePt: string;
    level: 'Iniciante' | 'Intermediário';
    focus: string;
    benefits: string[];
    breathing: string;
    contraindications?: string[];
    variations?: string[];
    duration?: string;
  },
  options: {
    source: WorkoutExerciseSource;
    category: WorkoutExerciseCategory;
    instructions: string[];
    familyOrCategory: string;
    muscleFallback: MuscleContribution[];
  }
): WorkoutExercise => {
  const durationSeconds = parseDurationSeconds(exercise.duration);
  const hasReps = /repeti(?:ç|c)[õo]es?/i.test(exercise.duration ?? '');
  const hasDuration = durationSeconds > 0;
  const measureMode: ExerciseMeasureMode = hasReps ? 'reps' : hasDuration ? 'duration' : 'reps';
  const defaultSets = parseSetCount(exercise.duration);
  const defaultReps = parseRepCount(exercise.duration);

  return {
    id: `${options.source}-${exercise.id}`,
    legacyId: exercise.id,
    name: exercise.namePt,
    source: options.source,
    category: options.category,
    level: mapLevel(exercise.level),
    description: options.familyOrCategory,
    family: options.familyOrCategory,
    durationLabel: exercise.duration,
    focus: exercise.focus,
    instructions: [...options.instructions],
    breathing: exercise.breathing,
    benefits: [...exercise.benefits],
    contraindications: [...(exercise.contraindications ?? [])],
    variations: [...(exercise.variations ?? [])],
    measureMode,
    defaultSets,
    defaultReps,
    defaultDurationSeconds: hasDuration ? durationSeconds : 0,
    defaultLoadKg: 0,
    loadMode: 'bodyweight',
    muscleDistribution: normalizeMuscleDistribution(options.muscleFallback),
  };
};

const buildLegacyCatalog = (): WorkoutExercise[] => {
  const yogaCatalog = YOGA_POSES.map((pose) => ({
    ...normalizeLegacyExercise(pose, {
      source: 'yoga',
      category: 'yoga',
      instructions: [...pose.alignment],
      familyOrCategory: pose.family,
      muscleFallback: yogaFallbackDistribution(pose.family, pose.focus),
    }),
    nameAlternate: pose.nameSanskrit,
  }));

  const calisteniaCatalog = CALISTENIA_EXERCISES.map((exercise) =>
    normalizeLegacyExercise(exercise, {
      source: 'calistenia',
      category: 'calisthenics',
      instructions: [...exercise.technique],
      familyOrCategory: exercise.category,
      muscleFallback: calisteniaFallbackDistribution(exercise.category),
    })
  );

  return [...yogaCatalog, ...calisteniaCatalog];
};

const DEFAULT_WORKOUT_CATALOG = buildLegacyCatalog();

const cloneExercise = (exercise: WorkoutExercise): WorkoutExercise => ({
  ...exercise,
  equipment: exercise.equipment ? [...exercise.equipment] : undefined,
  instructions: [...exercise.instructions],
  benefits: [...exercise.benefits],
  contraindications: [...exercise.contraindications],
  variations: [...exercise.variations],
  muscleDistribution: cloneContributions(exercise.muscleDistribution),
});

const createEmptyAccountData = (): WorkoutAccountData => ({
  workouts: [],
  sessions: [],
  exercisesCatalog: DEFAULT_WORKOUT_CATALOG.map(cloneExercise),
  bodyMeasurements: [],
  strengthRecords: [],
  strengthProgressPoints: 0,
  strengthStat: 0,
  gamificationLedger: [],
  ratings: [],
});

const LOCAL_ACCOUNT_ID = 'local';

// Perfis de conta (appStore.currentAccountId) sao opt-in; sem um selecionado, usamos
// um bucket local estavel para que o catalogo padrao continue visivel por padrao.
const resolveAccountId = (accountId: string | null): string => accountId ?? LOCAL_ACCOUNT_ID;

const getCurrentAccountId = (stateAccountId: string | null): string =>
  resolveAccountId(stateAccountId ?? useAppStore.getState().currentAccountId);

const getCurrentAccountData = (
  accountDataById: Record<string, WorkoutAccountData>,
  accountId: string | null
): WorkoutAccountData | null => {
  if (!accountId) return null;
  return accountDataById[accountId] ?? null;
};

const cloneSetPlan = (setPlan: WorkoutSetPlan, setNumber: number, keepId = false): WorkoutSetPlan => ({
  id: keepId ? setPlan.id : createId('workout-set'),
  setNumber,
  targetReps: setPlan.targetReps == null ? undefined : sanitizePositiveInteger(setPlan.targetReps, 1),
  targetDurationSeconds:
    setPlan.targetDurationSeconds == null ? undefined : sanitizeNonNegative(setPlan.targetDurationSeconds),
  targetLoadKg: sanitizeNonNegative(setPlan.targetLoadKg),
  restSeconds: sanitizeNonNegative(setPlan.restSeconds),
});

const cloneExercisePlan = (
  plan: WorkoutExercisePlan,
  order: number,
  keepIds = true
): WorkoutExercisePlan => ({
  id: keepIds ? plan.id : createId('workout-exercise'),
  exerciseId: plan.exerciseId,
  order,
  sets: plan.sets.map((setPlan, index) => cloneSetPlan(setPlan, index + 1, keepIds)),
  notes: plan.notes,
  muscleDistributionOverride: plan.muscleDistributionOverride
    ? normalizeMuscleDistribution(plan.muscleDistributionOverride)
    : undefined,
});

const normalizeWorkoutExercises = (exercises: WorkoutExercisePlan[]): WorkoutExercisePlan[] =>
  exercises
    .map((plan, index) => cloneExercisePlan(plan, index + 1, true))
    .sort((left, right) => left.order - right.order);

const getExerciseByIdFromData = (data: WorkoutAccountData | null, id: string): WorkoutExercise | undefined =>
  data?.exercisesCatalog.find((exercise) => exercise.id === id) ?? SPORT_ACTIVITIES.find((exercise) => exercise.id === id);

const getLatestWeightAt = (data: WorkoutAccountData, at: ISODateString): number | undefined => {
  const atTime = new Date(at).getTime();
  const candidates = data.bodyMeasurements
    .filter((measurement) => {
      const time = new Date(measurement.measuredAt).getTime();
      return Number.isFinite(time) && time <= atTime && measurement.weightKg != null && measurement.weightKg > 0;
    })
    .sort((left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime());

  return candidates[0]?.weightKg;
};

const getEffectiveLoadKg = (
  exercise: WorkoutExercise,
  loadKg: number,
  bodyweightKg: number | undefined
): number => {
  const sanitizedLoad = sanitizeNonNegative(loadKg);
  switch (exercise.loadMode) {
    case 'weighted':
      return sanitizedLoad;
    case 'bodyweight':
      return bodyweightKg != null && bodyweightKg > 0 ? bodyweightKg : Math.max(1, sanitizedLoad);
    case 'none':
      return 1;
    default:
      return Math.max(1, sanitizedLoad);
  }
};

const calculateSetVolume = (
  exercise: WorkoutExercise,
  loadKg: number,
  reps: number,
  durationSeconds: number,
  completed: boolean,
  bodyweightKg: number | undefined
): { effectiveLoadKg: number; volume: number } => {
  if (exercise.id.startsWith('sport-')) return {effectiveLoadKg:0,volume:0};
  const effectiveLoadKg = getEffectiveLoadKg(exercise, loadKg, bodyweightKg);
  if (!completed) return { effectiveLoadKg, volume: 0 };

  const safeReps = sanitizeNonNegative(reps);
  const safeDuration = sanitizeNonNegative(durationSeconds);
  const rawVolume =
    exercise.measureMode === 'reps'
      ? effectiveLoadKg * safeReps
      : effectiveLoadKg * (safeDuration / 60);

  return {
    effectiveLoadKg,
    volume: Number.isFinite(rawVolume) ? Math.max(0, rawVolume) : 0,
  };
};

const calculateEstimatedOneRepMax = (effectiveLoadKg: number, reps: number): number => {
  const safeLoad = sanitizeNonNegative(effectiveLoadKg);
  const cappedReps = clamp(sanitizeNonNegative(reps), 0, 30);
  const estimated = safeLoad * (1 + cappedReps / 30);
  return Number.isFinite(estimated) ? Math.max(0, estimated) : 0;
};

const roundFinite = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value * 100) / 100);
};

const makePerformedSet = (
  setPlan: WorkoutSetPlan,
  exercise: WorkoutExercise,
  bodyweightKg: number | undefined
): PerformedSet => {
  const reps = setPlan.targetReps ?? 0;
  const durationSeconds = setPlan.targetDurationSeconds ?? 0;
  const loadKg = sanitizeNonNegative(setPlan.targetLoadKg || exercise.defaultLoadKg);
  const calculation = calculateSetVolume(exercise, loadKg, reps, durationSeconds, false, bodyweightKg);

  return {
    id: createId('performed-set'),
    setNumber: setPlan.setNumber,
    loadKg,
    reps,
    durationSeconds: exercise.measureMode === 'duration' ? durationSeconds : undefined,
    completed: false,
    effectiveLoadKg: calculation.effectiveLoadKg,
    volume: 0,
    formulaVersion: FORMULA_VERSION,
  };
};

const makeExerciseResult = (
  plan: WorkoutExercisePlan,
  exercise: WorkoutExercise | undefined,
  bodyweightKg: number | undefined
): WorkoutExerciseResult => ({
  exerciseId: plan.exerciseId,
  exerciseNameSnapshot: exercise?.name ?? plan.exerciseId,
  order: plan.order,
  muscleDistribution: normalizeMuscleDistribution(
    plan.muscleDistributionOverride ?? exercise?.muscleDistribution ?? [{ muscleId: 'core', percentage: 100 }]
  ),
  sets: plan.sets.map((setPlan) =>
    makePerformedSet(
      setPlan,
      exercise ?? {
        id: plan.exerciseId,
        name: plan.exerciseId,
        source: 'custom',
        category: 'custom',
        level: 'custom',
        instructions: [],
        benefits: [],
        contraindications: [],
        variations: [],
        measureMode: setPlan.targetDurationSeconds != null ? 'duration' : 'reps',
        defaultSets: 1,
        defaultReps: setPlan.targetReps ?? 1,
        defaultDurationSeconds: setPlan.targetDurationSeconds ?? 0,
        defaultLoadKg: 0,
        loadMode: 'weighted',
        muscleDistribution: [{ muscleId: 'core', percentage: 100 }],
      },
      bodyweightKg
    )
  ),
});

const calculateExerciseBest = (
  result: WorkoutExerciseResult
): { bestEstimatedOneRepMax: number; bestSet: PerformedSet | undefined } => {
  let bestEstimatedOneRepMax = 0;
  let bestSet: PerformedSet | undefined;
  result.sets.forEach((set) => {
    if (!set.completed || set.skipped || set.reps <= 0) return;
    const estimated = calculateEstimatedOneRepMax(set.effectiveLoadKg, set.reps);
    if (estimated > bestEstimatedOneRepMax) {
      bestEstimatedOneRepMax = estimated;
      bestSet = set;
    }
  });
  return { bestEstimatedOneRepMax, bestSet };
};

const sanitizeStars = (stars: number): 1 | 2 | 3 | 4 | 5 => {
  const value = Math.round(clamp(sanitizeNonNegative(stars, 1), 1, 5));
  if (value <= 1) return 1;
  if (value === 2) return 2;
  if (value === 3) return 3;
  if (value === 4) return 4;
  return 5;
};

const getCompletedSessions = (data: WorkoutAccountData): WorkoutSession[] =>
  data.sessions.filter((session) => session.status === 'completed');

const getAverage = (values: number[]): number => roundFinite(averageNumbers(values, 0));

interface WorkoutState {
  currentAccountId: string | null;
  accountDataById: Record<string, WorkoutAccountData>;
  syncAccountContext: (accountId: string | null) => void;

  getExerciseById: (exerciseId: string) => WorkoutExercise | undefined;
  getExerciseCatalog: () => WorkoutExercise[];
  getExercisesBySource: (source: WorkoutExerciseSource) => WorkoutExercise[];
  getExercisesByCategory: (category: WorkoutExerciseCategory) => WorkoutExercise[];

  createWorkout: (input: WorkoutCreateInput) => Workout | undefined;
  updateWorkout: (workoutId: string, updates: WorkoutUpdateInput) => Workout | undefined;
  deleteWorkout: (workoutId: string) => void;
  duplicateWorkout: (workoutId: string, name?: string) => Workout | undefined;
  scheduleWorkout: (workoutId: string, scheduledAt: ISODateString) => Workout | undefined;
  rescheduleWorkout: (workoutId: string, scheduledAt: ISODateString | undefined) => Workout | undefined;
  getWorkoutById: (workoutId: string) => Workout | undefined;
  getWorkoutsForDate: (date: Date | ISODateString) => Workout[];
  getPlannedWorkouts: () => Workout[];
  getCompletedWorkouts: () => Workout[];

  startWorkout: (workoutId: string) => WorkoutSession | undefined;
  updatePerformedSet: (
    sessionId: string,
    performedSetId: string,
    updates: PerformedSetUpdateInput
  ) => WorkoutSession | undefined;
  completePerformedSet: (
    sessionId: string,
    performedSetId: string,
    updates?: PerformedSetUpdateInput
  ) => WorkoutSession | undefined;
  skipPerformedSet: (sessionId: string, performedSetId: string) => WorkoutSession | undefined;
  finishWorkout: (sessionId: string) => WorkoutSession | undefined;
  cancelWorkout: (sessionId: string) => WorkoutSession | undefined;
  resumeWorkout: (sessionId: string) => WorkoutSession | undefined;
  getActiveSession: () => WorkoutSession | undefined;
  getSessionById: (sessionId: string) => WorkoutSession | undefined;

  applyGamificationForSession: (sessionId: string) => WorkoutSession | undefined;
  previewSessionImpact: (sessionId: string) => WorkoutImpactPreview | undefined;
  getEarthPoints: () => number;
  getStrengthStat: () => number;
  getStrengthRecords: (exerciseId?: string) => StrengthRecord[];
  getResourceSnapshot: () => WorkoutResourceSnapshot;

  rateWorkout: (sessionId: string, stars: number) => WorkoutRating | undefined;
  getAverageRating: () => number;
  getSessionRating: (sessionId: string) => WorkoutRating | undefined;

  addBodyMeasurement: (input: BodyMeasurementInput) => BodyMeasurement | undefined;
  updateBodyMeasurement: (measurementId: string, updates: BodyMeasurementInput) => BodyMeasurement | undefined;
  deleteBodyMeasurement: (measurementId: string) => void;
  getLatestBodyMeasurement: () => BodyMeasurement | undefined;
  getBodyMeasurementHistory: () => BodyMeasurement[];

  getVolumeHistory: () => WorkoutVolumeHistoryPoint[];
  getStrengthHistory: () => WorkoutStrengthHistoryPoint[];
  getMuscleDistribution: (sessionId?: string) => MuscleContribution[];
  getWorkoutHistory: () => WorkoutSession[];
  getWorkoutStats: () => WorkoutStats;
}

const updateAccountData = (
  state: WorkoutState,
  accountId: string,
  updater: (data: WorkoutAccountData) => WorkoutAccountData
): Pick<WorkoutState, 'currentAccountId' | 'accountDataById'> => {
  const currentData = state.accountDataById[accountId] ?? createEmptyAccountData();
  return {
    currentAccountId: accountId,
    accountDataById: {
      ...state.accountDataById,
      [accountId]: updater(currentData),
    },
  };
};

const buildBodyMeasurement = (input: BodyMeasurementInput): BodyMeasurement => {
  const sanitizeOptionalMeasurement = (value: number | undefined): number | undefined => {
    if (value == null || !Number.isFinite(value)) return undefined;
    return Math.max(0, value);
  };

  return {
    id: createId('measurement'),
    measuredAt: toIso(input.measuredAt),
    heightCm: sanitizeOptionalMeasurement(input.heightCm),
    weightKg: sanitizeOptionalMeasurement(input.weightKg),
    bodyFatPercent: sanitizeOptionalMeasurement(input.bodyFatPercent),
    waterPercent: sanitizeOptionalMeasurement(input.waterPercent),
    muscleMassKg: sanitizeOptionalMeasurement(input.muscleMassKg),
    waistCm: sanitizeOptionalMeasurement(input.waistCm),
    chestCm: sanitizeOptionalMeasurement(input.chestCm),
    armCm: sanitizeOptionalMeasurement(input.armCm),
    thighCm: sanitizeOptionalMeasurement(input.thighCm),
    notes: input.notes?.trim() || undefined,
  };
};

export interface WorkoutImpactPreview {
  totalVolume: number;
  earthPoints: number;
  xpAwarded: number;
  staminaCost: number;
  pranaCost: number;
  strengthGain: number;
}

interface SessionImpactMetrics {
  durationSeconds: number;
  totalVolume: number;
  earthPoints: number;
  xpAwarded: number;
  staminaCost: number;
  pranaCost: number;
  strengthGainTotal: number;
  strengthBests: Array<{
    exerciseId: string;
    best: ReturnType<typeof calculateExerciseBest>;
    historicalBest: number;
    gain: number;
  }>;
}

// Pure projection shared by the live RPG impact preview and the real session finalization.
const computeSessionImpactMetrics = (
  session: WorkoutSession,
  data: WorkoutAccountData,
  nowIso: ISODateString
): SessionImpactMetrics => {
  const durationSeconds = Math.max(
    0,
    Math.round((new Date(nowIso).getTime() - new Date(session.startedAt).getTime()) / 1000)
  );
  const totalVolume = roundFinite(
    session.exerciseResults.reduce(
      (sessionSum, result) =>
        sessionSum + result.sets.reduce((exerciseSum, set) => (set.completed && !set.skipped ? exerciseSum + set.volume : exerciseSum), 0),
      0
    )
  );
  const nativeLoad = session.exerciseResults.filter((result) => result.exerciseId.startsWith('sport-')).reduce((sum, result) => sum + result.sets.reduce((total, performed) => performed.completed && !performed.skipped ? total + (performed.activityLoad ?? 0) : total, 0), 0);
  const legacyVolume = session.exerciseResults.filter((result) => !result.exerciseId.startsWith('sport-')).reduce((sum, result) => sum + result.sets.reduce((total, performed) => performed.completed && !performed.skipped ? total + (performed.activityLoad ?? performed.volume) : total, 0), 0);
  const rewardBasis = legacyVolume + nativeLoad;
  const earthPoints = rewardBasis > 0 ? Math.max(1, Math.floor(rewardBasis / 10)) : 0;
  const xpAwarded = Math.round(earthPoints / 2);
  const recordedActiveSeconds = session.exerciseResults.reduce((sum, result) => sum + result.sets.reduce((total, performed) => performed.completed && !performed.skipped ? total + (performed.durationSeconds ?? 0) : total, 0), 0);
  const hasNativeActivities = session.exerciseResults.some((result) => result.exerciseId.startsWith('sport-') || result.sets.some((performed)=>performed.activityLoad !== undefined));
  const durationMinutes = (hasNativeActivities ? recordedActiveSeconds : durationSeconds) / 60;
  const staminaCost = !hasNativeActivities || rewardBasis > 0 ? Math.max(1, Math.ceil(durationMinutes / 5 + rewardBasis / 100)) : 0;
  const pranaCost = !hasNativeActivities || rewardBasis > 0 ? Math.max(1, Math.ceil(durationMinutes / 10 + earthPoints / 10)) : 0;

  const bestByExercise = new Map<string, ReturnType<typeof calculateExerciseBest>>();
  session.exerciseResults.forEach((result) => {
    const best = calculateExerciseBest(result);
    if (!best.bestSet || best.bestEstimatedOneRepMax <= 0) return;
    const previous = bestByExercise.get(result.exerciseId);
    if (!previous || best.bestEstimatedOneRepMax > previous.bestEstimatedOneRepMax) {
      bestByExercise.set(result.exerciseId, best);
    }
  });

  let strengthGainTotal = 0;
  const strengthBests: SessionImpactMetrics['strengthBests'] = [];
  bestByExercise.forEach((best, exerciseId) => {
    const historicalBest = data.strengthRecords
      .filter((record) => record.exerciseId === exerciseId)
      .reduce((max, record) => Math.max(max, record.estimatedOneRepMax), 0);
    const gain = historicalBest > 0 ? Math.max(0, best.bestEstimatedOneRepMax - historicalBest) : 0;
    strengthGainTotal += gain;
    strengthBests.push({ exerciseId, best, historicalBest, gain });
  });

  return { durationSeconds, totalVolume, earthPoints, xpAwarded, staminaCost, pranaCost, strengthGainTotal, strengthBests };
};

const finalizeSessionState = (
  state: WorkoutState,
  accountId: string,
  sessionId: string,
  nowIso: ISODateString
): { nextState: Pick<WorkoutState, 'currentAccountId' | 'accountDataById'>; session: WorkoutSession | undefined } => {
  const data = state.accountDataById[accountId] ?? createEmptyAccountData();
  const existingSession = data.sessions.find((session) => session.id === sessionId);
  if (!existingSession) return { nextState: { currentAccountId: accountId, accountDataById: state.accountDataById }, session: undefined };
  if (existingSession.status === 'cancelled') {
    return { nextState: { currentAccountId: accountId, accountDataById: state.accountDataById }, session: existingSession };
  }

  const existingLedger = data.gamificationLedger.find((entry) => entry.sessionId === sessionId);
  if (existingSession.gamificationApplied || existingLedger) {
    const completedSession: WorkoutSession = existingSession.status === 'completed'
      ? existingSession
      : { ...existingSession, status: 'completed', completedAt: existingSession.completedAt ?? nowIso };
    const nextData: WorkoutAccountData = {
      ...data,
      sessions: data.sessions.map((session) => (session.id === sessionId ? completedSession : session)),
    };
    return {
      nextState: updateAccountData(state, accountId, () => nextData),
      session: completedSession,
    };
  }

  const metrics = computeSessionImpactMetrics(existingSession, data, nowIso);
  const { durationSeconds, totalVolume, earthPoints, xpAwarded, staminaCost, pranaCost, strengthGainTotal } = metrics;

  const nextStrengthRecords: StrengthRecord[] = [
    ...data.strengthRecords,
    ...metrics.strengthBests.map(({ exerciseId, best, historicalBest, gain }) => ({
      id: createId('strength-record'),
      exerciseId,
      recordedAt: nowIso,
      bestLoadKg: roundFinite(best.bestSet!.loadKg),
      bestReps: Math.min(30, Math.max(0, sanitizeInteger(best.bestSet!.reps))),
      estimatedOneRepMax: roundFinite(best.bestEstimatedOneRepMax),
      previousEstimatedOneRepMax: roundFinite(historicalBest),
      gain: roundFinite(gain),
      isPersonalRecord: historicalBest <= 0 || best.bestEstimatedOneRepMax > historicalBest,
    })),
  ];
  const strengthProgressPoints = roundFinite(data.strengthProgressPoints + strengthGainTotal);
  const strengthStat = Math.floor(strengthProgressPoints / 5);
  const gamificationEntry: WorkoutGamificationLedgerEntry = {
    id: createId('workout-ledger'),
    sessionId,
    appliedAt: nowIso,
    earthPoints,
    xpAwarded,
    totalScoreDelta: earthPoints,
    staminaCost,
    pranaCost,
    strengthGain: roundFinite(strengthGainTotal),
    formulaVersion: existingSession.exerciseResults.some((result) => result.exerciseId.startsWith('sport-') || result.sets.some((performed)=>performed.activityLoad !== undefined)) ? 'workout-activity-v2' : FORMULA_VERSION,
  };

  const finalSession: WorkoutSession = {
    ...existingSession,
    status: 'completed',
    completedAt: nowIso,
    durationSeconds,
    totalVolume,
    earthPoints,
    strengthGain: roundFinite(strengthGainTotal),
    pranaCost,
    staminaCost,
    gamificationApplied: true,
    formulaVersion: gamificationEntry.formulaVersion,
  };

  const nextData: WorkoutAccountData = {
    ...data,
    sessions: data.sessions.map((session) => (session.id === sessionId ? finalSession : session)),
    workouts: data.workouts.map((workout) =>
      workout.id === existingSession.workoutId
        ? { ...workout, status: 'completed', lastSessionId: sessionId, updatedAt: nowIso }
        : workout
    ),
    strengthRecords: nextStrengthRecords,
    strengthProgressPoints,
    strengthStat,
    gamificationLedger: [...data.gamificationLedger, gamificationEntry],
  };

  useAppStore.getState().addScore(earthPoints);
  useAppStore.getState().addExperience(xpAwarded);

  return {
    nextState: updateAccountData(state, accountId, () => nextData),
    session: finalSession,
  };
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentAccountId: resolveAccountId(useAppStore.getState().currentAccountId),
      accountDataById: {},

      syncAccountContext: (accountId) => {
        const resolvedAccountId = resolveAccountId(accountId);
        set((state) => updateAccountData(state, resolvedAccountId, (data) => data));
      },

      getExerciseById: (exerciseId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return getExerciseByIdFromData(data, exerciseId);
      },

      getExerciseCatalog: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const existing = data?.exercisesCatalog ?? [];
        return [...existing, ...SPORT_ACTIVITIES.filter((activity) => !existing.some((exercise) => exercise.id === activity.id))];
      },

      getExercisesBySource: (source) => get().getExerciseCatalog().filter((exercise) => exercise.source === source),

      getExercisesByCategory: (category) => get().getExerciseCatalog().filter((exercise) => exercise.category === category),

      createWorkout: (input) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId || !input.name.trim()) return undefined;

        const nowIso = new Date().toISOString();
        const category = input.category ?? 'mixed';
        const source = input.source ?? 'custom';
        const exercises = normalizeWorkoutExercises(input.exercises ?? []);
        const workout: Workout = {
          id: createId('workout'),
          name: input.name.trim(),
          category,
          source,
          status: 'planned',
          scheduledAt: input.scheduledAt ? toIso(input.scheduledAt) : undefined,
          createdAt: nowIso,
          updatedAt: nowIso,
          estimatedDurationMinutes: sanitizeNonNegative(input.estimatedDurationMinutes),
          exercises,
        };

        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({ ...data, workouts: [...data.workouts, workout] })),
        }));
        return workout;
      },

      updateWorkout: (workoutId, updates) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const nowIso = new Date().toISOString();
        let updatedWorkout: Workout | undefined;

        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            workouts: data.workouts.map((workout) => {
              if (workout.id !== workoutId) return workout;
              updatedWorkout = {
                ...workout,
                ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
                ...(updates.category !== undefined ? { category: updates.category } : {}),
                ...(updates.source !== undefined ? { source: updates.source } : {}),
                ...(updates.status !== undefined ? { status: updates.status } : {}),
                ...(updates.scheduledAt !== undefined
                  ? { scheduledAt: updates.scheduledAt ? toIso(updates.scheduledAt) : undefined }
                  : {}),
                ...(updates.estimatedDurationMinutes !== undefined
                  ? { estimatedDurationMinutes: sanitizeNonNegative(updates.estimatedDurationMinutes) }
                  : {}),
                ...(updates.exercises !== undefined ? { exercises: normalizeWorkoutExercises(updates.exercises) } : {}),
                updatedAt: nowIso,
              };
              return updatedWorkout;
            }),
          })),
        }));

        return updatedWorkout;
      },

      deleteWorkout: (workoutId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return;
        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            workouts: data.workouts.filter((workout) => workout.id !== workoutId),
          })),
        }));
      },

      duplicateWorkout: (workoutId, name) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const sourceWorkout = data?.workouts.find((workout) => workout.id === workoutId);
        if (!sourceWorkout) return undefined;

        const nowIso = new Date().toISOString();
        const workout: Workout = {
          ...sourceWorkout,
          id: createId('workout'),
          name: name?.trim() || `${sourceWorkout.name} — cópia`,
          status: 'planned',
          createdAt: nowIso,
          updatedAt: nowIso,
          lastSessionId: undefined,
          exercises: sourceWorkout.exercises.map((plan, index) => cloneExercisePlan(plan, index + 1, false)),
        };

        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => ({
            ...currentData,
            workouts: [...currentData.workouts, workout],
          })),
        }));
        return workout;
      },

      scheduleWorkout: (workoutId, scheduledAt) => get().rescheduleWorkout(workoutId, scheduledAt),

      rescheduleWorkout: (workoutId, scheduledAt) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const nowIso = new Date().toISOString();
        let updatedWorkout: Workout | undefined;
        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            workouts: data.workouts.map((workout) => {
              if (workout.id !== workoutId) return workout;
              updatedWorkout = { ...workout, scheduledAt: scheduledAt ? toIso(scheduledAt) : undefined, updatedAt: nowIso };
              return updatedWorkout;
            }),
          })),
        }));
        return updatedWorkout;
      },

      getWorkoutById: (workoutId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.workouts.find((workout) => workout.id === workoutId);
      },

      getWorkoutsForDate: (date) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const targetDay = toDayKey(date);
        if (!data || !targetDay) return [];
        return data.workouts
          .filter((workout) => toDayKey(workout.scheduledAt) === targetDay)
          .sort((left, right) => (left.scheduledAt ?? '').localeCompare(right.scheduledAt ?? ''));
      },

      getPlannedWorkouts: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.workouts.filter((workout) => workout.status === 'planned' || workout.status === 'in_progress') ?? [];
      },

      getCompletedWorkouts: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.workouts.filter((workout) => workout.status === 'completed') ?? [];
      },

      startWorkout: (workoutId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return undefined;

        const activeSession = data.sessions.find((session) => session.status === 'in_progress');
        if (activeSession) return activeSession;

        const workout = data.workouts.find((candidate) => candidate.id === workoutId);
        if (!workout || workout.status === 'cancelled') return undefined;

        const startedAt = new Date().toISOString();
        const bodyweightKgSnapshot = getLatestWeightAt(data, startedAt);
        const exerciseResults = workout.exercises.map((plan) =>
          makeExerciseResult(plan, getExerciseByIdFromData(data, plan.exerciseId), bodyweightKgSnapshot)
        );
        const session: WorkoutSession = {
          id: createId('workout-session'),
          workoutId: workout.id,
          workoutNameSnapshot: workout.name,
          status: 'in_progress',
          startedAt,
          scheduledAt: workout.scheduledAt,
          durationSeconds: 0,
          bodyweightKgSnapshot,
          exerciseResults,
          totalVolume: 0,
          earthPoints: 0,
          strengthGain: 0,
          pranaCost: 0,
          staminaCost: 0,
          gamificationApplied: false,
          formulaVersion: FORMULA_VERSION,
        };

        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => ({
            ...currentData,
            sessions: [...currentData.sessions, session],
            workouts: currentData.workouts.map((candidate) =>
              candidate.id === workout.id
                ? { ...candidate, status: 'in_progress', updatedAt: startedAt }
                : candidate
            ),
          })),
        }));

        return session;
      },

      updatePerformedSet: (sessionId, performedSetId, updates) => {
        if (updates.perceivedExertion !== undefined && (!Number.isFinite(updates.perceivedExertion) || updates.perceivedExertion < 1 || updates.perceivedExertion > 10)) return undefined;
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return undefined;
        const targetSession = data.sessions.find((session) => session.id === sessionId);
        if (!targetSession || targetSession.status !== 'in_progress') return targetSession;

        const nowIso = new Date().toISOString();
        let updatedSession: WorkoutSession | undefined;
        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => {
            const session = currentData.sessions.find((candidate) => candidate.id === sessionId);
            if (!session) return currentData;

            updatedSession = {
              ...session,
              exerciseResults: session.exerciseResults.map((result) => {
                const setIndex = result.sets.findIndex((performedSet) => performedSet.id === performedSetId);
                if (setIndex < 0) return result;
                const exercise = getExerciseByIdFromData(currentData, result.exerciseId);
                const existingSet = result.sets[setIndex];
                const loadKg = updates.loadKg === undefined ? existingSet.loadKg : sanitizeNonNegative(updates.loadKg);
                const reps = updates.reps === undefined ? existingSet.reps : sanitizeNonNegative(updates.reps);
                const durationSeconds =
                  updates.durationSeconds === undefined
                    ? existingSet.durationSeconds ?? 0
                    : sanitizeNonNegative(updates.durationSeconds);
                const calculation = calculateSetVolume(
                  exercise ?? {
                    id: result.exerciseId,
                    name: result.exerciseNameSnapshot,
                    source: 'custom',
                    category: 'custom',
                    level: 'custom',
                    instructions: [],
                    benefits: [],
                    contraindications: [],
                    variations: [],
                    measureMode: durationSeconds > 0 && reps === 0 ? 'duration' : 'reps',
                    defaultSets: 1,
                    defaultReps: 1,
                    defaultDurationSeconds: durationSeconds,
                    defaultLoadKg: 0,
                    loadMode: 'weighted',
                    muscleDistribution: result.muscleDistribution,
                  },
                  loadKg,
                  reps,
                  durationSeconds,
                  existingSet.completed && !existingSet.skipped,
                  session.bodyweightKgSnapshot
                );
                const nextSet: PerformedSet = {
                  ...existingSet,
                  loadKg,
                  reps,
                  durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
                  effectiveLoadKg: calculation.effectiveLoadKg,
                  volume: calculation.volume,
                  perceivedExertion: updates?.perceivedExertion === undefined ? existingSet.perceivedExertion : clamp(sanitizeInteger(updates.perceivedExertion), 1, 10),
                  distanceMeters: updates?.distanceMeters === undefined ? existingSet.distanceMeters : sanitizeNonNegative(updates.distanceMeters),
                  activityNotes: updates?.activityNotes === undefined ? existingSet.activityNotes : updates.activityNotes.slice(0, 2000),
                  activityLoad: (() => { const effort = updates?.perceivedExertion ?? existingSet.perceivedExertion; return effort ? roundFinite(durationSeconds / 60 * clamp(effort, 1, 10)) : undefined; })(),
                  completedAt: existingSet.completed ? existingSet.completedAt ?? nowIso : undefined,
                };
                return { ...result, sets: result.sets.map((candidate, index) => (index === setIndex ? nextSet : candidate)) };
              }),
            };

            return {
              ...currentData,
              sessions: currentData.sessions.map((candidate) => (candidate.id === sessionId && updatedSession ? updatedSession : candidate)),
            };
          }),
        }));
        return updatedSession;
      },

      completePerformedSet: (sessionId, performedSetId, updates) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return undefined;
        const session = data.sessions.find((candidate) => candidate.id === sessionId);
        if (!session || session.status !== 'in_progress') return session;

        const nowIso = new Date().toISOString();
        let completedSession: WorkoutSession | undefined;
        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => {
            const currentSession = currentData.sessions.find((candidate) => candidate.id === sessionId);
            if (!currentSession) return currentData;
            completedSession = {
              ...currentSession,
              exerciseResults: currentSession.exerciseResults.map((result) => {
                const setIndex = result.sets.findIndex((performedSet) => performedSet.id === performedSetId);
                if (setIndex < 0) return result;
                const existingSet = result.sets[setIndex];
                const exercise = getExerciseByIdFromData(currentData, result.exerciseId);
                const loadKg = updates?.loadKg === undefined ? existingSet.loadKg : sanitizeNonNegative(updates.loadKg);
                const reps = updates?.reps === undefined ? existingSet.reps : sanitizeNonNegative(updates.reps);
                const durationSeconds =
                  updates?.durationSeconds === undefined
                    ? existingSet.durationSeconds ?? 0
                    : sanitizeNonNegative(updates.durationSeconds);
                const observedEffort = updates?.perceivedExertion ?? existingSet.perceivedExertion;
                if (observedEffort !== undefined && (!Number.isFinite(observedEffort) || observedEffort < 1 || observedEffort > 10)) return result;
                if (exercise?.id.startsWith('sport-') && (observedEffort === undefined || durationSeconds <= 0)) return result;
                const calculation = calculateSetVolume(
                  exercise ?? {
                    id: result.exerciseId,
                    name: result.exerciseNameSnapshot,
                    source: 'custom',
                    category: 'custom',
                    level: 'custom',
                    instructions: [],
                    benefits: [],
                    contraindications: [],
                    variations: [],
                    measureMode: durationSeconds > 0 && reps === 0 ? 'duration' : 'reps',
                    defaultSets: 1,
                    defaultReps: 1,
                    defaultDurationSeconds: durationSeconds,
                    defaultLoadKg: 0,
                    loadMode: 'weighted',
                    muscleDistribution: result.muscleDistribution,
                  },
                  loadKg,
                  reps,
                  durationSeconds,
                  true,
                  currentSession.bodyweightKgSnapshot
                );
                const nextSet: PerformedSet = {
                  ...existingSet,
                  loadKg,
                  reps,
                  durationSeconds: durationSeconds > 0 ? durationSeconds : undefined,
                  completed: true,
                  skipped: false,
                  completedAt: nowIso,
                  effectiveLoadKg: calculation.effectiveLoadKg,
                  volume: calculation.volume,
                  perceivedExertion: updates?.perceivedExertion === undefined ? existingSet.perceivedExertion : clamp(sanitizeInteger(updates.perceivedExertion), 1, 10),
                  distanceMeters: updates?.distanceMeters === undefined ? existingSet.distanceMeters : sanitizeNonNegative(updates.distanceMeters),
                  activityNotes: updates?.activityNotes === undefined ? existingSet.activityNotes : updates.activityNotes.slice(0, 2000),
                  activityLoad: (() => { const effort = updates?.perceivedExertion ?? existingSet.perceivedExertion; return effort ? roundFinite(durationSeconds / 60 * clamp(effort, 1, 10)) : undefined; })(),
                  formulaVersion: exercise?.id.startsWith('sport-') ? 'workout-activity-v2' : FORMULA_VERSION,
                };
                return { ...result, sets: result.sets.map((candidate, index) => (index === setIndex ? nextSet : candidate)) };
              }),
            };
            return {
              ...currentData,
              sessions: currentData.sessions.map((candidate) =>
                candidate.id === sessionId && completedSession ? completedSession : candidate
              ),
            };
          }),
        }));
        return completedSession;
      },

      skipPerformedSet: (sessionId, performedSetId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const session = data?.sessions.find((candidate) => candidate.id === sessionId);
        if (!session || session.status !== 'in_progress') return session;

        let skippedSession: WorkoutSession | undefined;
        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => {
            const currentSession = currentData.sessions.find((candidate) => candidate.id === sessionId);
            if (!currentSession) return currentData;
            skippedSession = {
              ...currentSession,
              exerciseResults: currentSession.exerciseResults.map((result) => ({
                ...result,
                sets: result.sets.map((performedSet) =>
                  performedSet.id === performedSetId
                    ? {
                        ...performedSet,
                        completed: false,
                        skipped: true,
                        completedAt: undefined,
                        volume: 0,
                        formulaVersion: FORMULA_VERSION,
                      }
                    : performedSet
                ),
              })),
            };
            return {
              ...currentData,
              sessions: currentData.sessions.map((candidate) =>
                candidate.id === sessionId && skippedSession ? skippedSession : candidate
              ),
            };
          }),
        }));
        return skippedSession;
      },

      finishWorkout: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const nowIso = new Date().toISOString();
        const { nextState, session } = finalizeSessionState(get(), accountId, sessionId, nowIso);
        if (!session) return undefined;
        set(nextState);
        return session;
      },

      cancelWorkout: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const nowIso = new Date().toISOString();
        let cancelledSession: WorkoutSession | undefined;
        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            sessions: data.sessions.map((session) => {
              if (session.id !== sessionId || session.status !== 'in_progress') return session;
              cancelledSession = { ...session, status: 'cancelled' };
              return cancelledSession;
            }),
            workouts: data.workouts.map((workout) => {
              if (!cancelledSession || workout.id !== cancelledSession.workoutId) return workout;
              return { ...workout, status: 'cancelled', updatedAt: nowIso };
            }),
          })),
        }));
        return cancelledSession;
      },

      resumeWorkout: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        let resumedSession: WorkoutSession | undefined;
        const nowIso = new Date().toISOString();
        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            sessions: data.sessions.map((session) => {
              if (session.id !== sessionId || session.status !== 'cancelled' || session.gamificationApplied) return session;
              resumedSession = { ...session, status: 'in_progress' };
              return resumedSession;
            }),
            workouts: data.workouts.map((workout) =>
              resumedSession && workout.id === resumedSession.workoutId
                ? { ...workout, status: 'in_progress', updatedAt: nowIso }
                : workout
            ),
          })),
        }));
        return resumedSession;
      },

      getActiveSession: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.sessions.find((session) => session.status === 'in_progress');
      },

      getSessionById: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.sessions.find((session) => session.id === sessionId);
      },

      applyGamificationForSession: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const nowIso = new Date().toISOString();
        const { nextState, session } = finalizeSessionState(get(), accountId, sessionId, nowIso);
        if (!session) return undefined;
        set(nextState);
        return session;
      },

      previewSessionImpact: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const session = data?.sessions.find((candidate) => candidate.id === sessionId);
        if (!data || !session) return undefined;
        if (session.status !== 'in_progress') {
          return {
            totalVolume: session.totalVolume,
            earthPoints: session.earthPoints,
            xpAwarded: Math.round(session.earthPoints / 2),
            staminaCost: session.staminaCost,
            pranaCost: session.pranaCost,
            strengthGain: session.strengthGain,
          };
        }

        const metrics = computeSessionImpactMetrics(session, data, new Date().toISOString());
        return {
          totalVolume: metrics.totalVolume,
          earthPoints: metrics.earthPoints,
          xpAwarded: metrics.xpAwarded,
          staminaCost: metrics.staminaCost,
          pranaCost: metrics.pranaCost,
          strengthGain: roundFinite(metrics.strengthGainTotal),
        };
      },

      getEarthPoints: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return roundFinite(data?.gamificationLedger.reduce((sum, entry) => sum + entry.earthPoints, 0) ?? 0);
      },

      getStrengthStat: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.strengthStat ?? 0;
      },

      getStrengthRecords: (exerciseId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return [];
        return data.strengthRecords
          .filter((record) => exerciseId ? record.exerciseId === exerciseId : true)
          .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime());
      },

      getResourceSnapshot: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const appState = useAppStore.getState();
        const totalScore = appState.getTotalScore();
        const completedTasksToday = appState.getCompletedTasksToday();
        const basePrana = Math.min(PRANA_MAX, Math.round((totalScore / 500) * 100));
        const baseStamina = Math.min(100, 60 + Math.max(0, completedTasksToday) * 8);
        const todayKey = toDayKey(new Date());
        const ledgerToday = data?.gamificationLedger.filter((entry) => toDayKey(entry.appliedAt) === todayKey) ?? [];
        const pranaSpentByWorkoutsToday = ledgerToday.reduce((sum, entry) => sum + entry.pranaCost, 0);
        const staminaSpentByWorkoutsToday = ledgerToday.reduce((sum, entry) => sum + entry.staminaCost, 0);

        return {
          basePrana,
          pranaSpentByWorkoutsToday: roundFinite(pranaSpentByWorkoutsToday),
          currentPrana: Math.max(0, basePrana - pranaSpentByWorkoutsToday),
          baseStamina,
          staminaSpentByWorkoutsToday: roundFinite(staminaSpentByWorkoutsToday),
          currentStamina: Math.max(0, baseStamina - staminaSpentByWorkoutsToday),
        };
      },

      rateWorkout: (sessionId, stars) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data?.sessions.some((session) => session.id === sessionId)) return undefined;
        const sanitizedStars = sanitizeStars(stars);
        const nowIso = new Date().toISOString();
        let resultRating: WorkoutRating | undefined;

        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => {
            const existing = currentData.ratings.find((rating) => rating.sessionId === sessionId);
            resultRating = existing
              ? { ...existing, stars: sanitizedStars, updatedAt: nowIso }
              : { sessionId, stars: sanitizedStars, createdAt: nowIso, updatedAt: nowIso };
            return {
              ...currentData,
              ratings: existing
                ? currentData.ratings.map((rating) => (rating.sessionId === sessionId && resultRating ? resultRating : rating))
                : [...currentData.ratings, resultRating],
              sessions: currentData.sessions.map((session) =>
                session.id === sessionId ? { ...session, rating: sanitizedStars } : session
              ),
            };
          }),
        }));
        return resultRating;
      },

      getAverageRating: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return getAverage(data?.ratings.map((rating) => rating.stars) ?? []);
      },

      getSessionRating: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return data?.ratings.find((rating) => rating.sessionId === sessionId);
      },

      addBodyMeasurement: (input) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const measurement = buildBodyMeasurement(input);
        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            bodyMeasurements: [...data.bodyMeasurements, measurement].sort(
              (left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime()
            ),
          })),
        }));
        return measurement;
      },

      updateBodyMeasurement: (measurementId, updates) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return undefined;
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data?.bodyMeasurements.some((measurement) => measurement.id === measurementId)) return undefined;
        let updatedMeasurement: BodyMeasurement | undefined;
        set((state) => ({
          ...updateAccountData(state, accountId, (currentData) => ({
            ...currentData,
            bodyMeasurements: currentData.bodyMeasurements.map((measurement) => {
              if (measurement.id !== measurementId) return measurement;
              const sanitizeOptionalMeasurement = (value: number | undefined): number | undefined => {
                if (value == null || !Number.isFinite(value)) return undefined;
                return Math.max(0, value);
              };
              updatedMeasurement = {
                ...measurement,
                measuredAt: updates.measuredAt ? toIso(updates.measuredAt) : measurement.measuredAt,
                heightCm: updates.heightCm === undefined ? measurement.heightCm : sanitizeOptionalMeasurement(updates.heightCm),
                weightKg: updates.weightKg === undefined ? measurement.weightKg : sanitizeOptionalMeasurement(updates.weightKg),
                bodyFatPercent: updates.bodyFatPercent === undefined ? measurement.bodyFatPercent : sanitizeOptionalMeasurement(updates.bodyFatPercent),
                waterPercent: updates.waterPercent === undefined ? measurement.waterPercent : sanitizeOptionalMeasurement(updates.waterPercent),
                muscleMassKg: updates.muscleMassKg === undefined ? measurement.muscleMassKg : sanitizeOptionalMeasurement(updates.muscleMassKg),
                waistCm: updates.waistCm === undefined ? measurement.waistCm : sanitizeOptionalMeasurement(updates.waistCm),
                chestCm: updates.chestCm === undefined ? measurement.chestCm : sanitizeOptionalMeasurement(updates.chestCm),
                armCm: updates.armCm === undefined ? measurement.armCm : sanitizeOptionalMeasurement(updates.armCm),
                thighCm: updates.thighCm === undefined ? measurement.thighCm : sanitizeOptionalMeasurement(updates.thighCm),
                notes: updates.notes === undefined ? measurement.notes : updates.notes.trim() || undefined,
              };
              return updatedMeasurement;
            }),
          })),
        }));
        return updatedMeasurement;
      },

      deleteBodyMeasurement: (measurementId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        if (!accountId) return;
        set((state) => ({
          ...updateAccountData(state, accountId, (data) => ({
            ...data,
            bodyMeasurements: data.bodyMeasurements.filter((measurement) => measurement.id !== measurementId),
          })),
        }));
      },

      getLatestBodyMeasurement: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return [...(data?.bodyMeasurements ?? [])].sort(
          (left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime()
        )[0];
      },

      getBodyMeasurementHistory: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return [...(data?.bodyMeasurements ?? [])].sort(
          (left, right) => new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime()
        );
      },

      getVolumeHistory: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return [];
        const byDay = new Map<string, number>();
        getCompletedSessions(data).forEach((session) => {
          const day = toDayKey(session.completedAt ?? session.startedAt);
          if (!day) return;
          byDay.set(day, (byDay.get(day) ?? 0) + session.totalVolume);
        });
        return Array.from(byDay.entries())
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([date, volume]) => ({ date, volume: roundFinite(volume) }));
      },

      getStrengthHistory: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return [];
        return [...data.strengthRecords]
          .sort((left, right) => new Date(left.recordedAt).getTime() - new Date(right.recordedAt).getTime())
          .map<WorkoutStrengthHistoryPoint>((record) => ({
            date: record.recordedAt,
            estimatedOneRepMax: record.estimatedOneRepMax,
            exerciseId: record.exerciseId,
          }));
      },

      getMuscleDistribution: (sessionId) => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        if (!data) return [];
        const sessions = sessionId
          ? data.sessions.filter((session) => session.id === sessionId)
          : getCompletedSessions(data);
        const hasObservedLoad = sessions.some((session) => session.exerciseResults.some((result) => result.sets.some((performed) => performed.completed && !performed.skipped && performed.activityLoad !== undefined)));
        const totals = new Map<MuscleGroupId, number>();
        sessions.forEach((session) => {
          session.exerciseResults.forEach((result) => {
            const volume = result.sets.reduce(
              (sum, set) => (set.completed && !set.skipped ? sum + (hasObservedLoad ? set.activityLoad ?? 0 : result.exerciseId.startsWith('sport-') ? 0 : set.volume) : sum),
              0
            );
            result.muscleDistribution.forEach((entry) => {
              const muscleVolume = volume * (entry.percentage / 100);
              totals.set(entry.muscleId, (totals.get(entry.muscleId) ?? 0) + muscleVolume);
            });
          });
        });

        if (totals.size === 0 || Array.from(totals.values()).every((value) => value <= 0)) return [];
        return normalizeMuscleDistribution(
          Array.from(totals.entries()).map(([muscleId, percentage]) => ({ muscleId, percentage }))
        );
      },

      getWorkoutHistory: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        return [...(data?.sessions ?? [])].sort(
          (left, right) => new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
        );
      },

      getWorkoutStats: () => {
        const accountId = getCurrentAccountId(get().currentAccountId);
        const data = getCurrentAccountData(get().accountDataById, accountId);
        const sessions = data ? getCompletedSessions(data) : [];
        const totalVolume = sessions.reduce((sum, session) => sum + session.totalVolume, 0);
        const totalDurationSeconds = sessions.reduce((sum, session) => sum + session.durationSeconds, 0);
        const totalEarthPoints = sessions.reduce((sum, session) => sum + session.earthPoints, 0);
        const totalStrengthGain = sessions.reduce((sum, session) => sum + session.strengthGain, 0);
        const ratings = data?.ratings ?? [];
        return {
          completedWorkouts: sessions.length,
          totalVolume: roundFinite(totalVolume),
          totalDurationSeconds: Math.max(0, Math.round(totalDurationSeconds)),
          totalEarthPoints: roundFinite(totalEarthPoints),
          totalStrengthGain: roundFinite(totalStrengthGain),
          averageRating: getAverage(ratings.map((rating) => rating.stars)),
          averageVolumePerWorkout: sessions.length > 0 ? roundFinite(totalVolume / sessions.length) : 0,
        };
      },
    }),
    {
      name: WORKOUT_STORAGE_KEY,
      onRehydrateStorage: () => () => {
        useWorkoutStore.getState().syncAccountContext(useAppStore.getState().currentAccountId);
      },
    }
  )
);

useAppStore.subscribe((state, previousState) => {
  if (state.currentAccountId !== previousState.currentAccountId) {
    useWorkoutStore.getState().syncAccountContext(state.currentAccountId);
  }
});

useWorkoutStore.getState().syncAccountContext(useAppStore.getState().currentAccountId);
