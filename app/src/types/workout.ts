export type ISODateString = string;

/** UUID v4 como string com marca de tipo; a fronteira de I/O valida o formato. */
declare const uuidV4Brand: unique symbol;
export type UUIDv4 = string & { readonly [uuidV4Brand]: 'UUIDv4' };

export type MuscleGroupId =
  | 'chest'
  | 'upper_back'
  | 'lats'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'glutes'
  | 'quadriceps'
  | 'hamstrings'
  | 'calves'
  | 'adductors'
  | 'lower_back';

export interface MuscleContribution {
  muscleId: MuscleGroupId;
  percentage: number;
}

export type WorkoutExerciseSource = 'native' | 'calistenia' | 'yoga' | 'custom';

export type WorkoutExerciseCategory =
  | 'running'
  | 'swimming'
  | 'martial_arts'
  | 'cycling'
  | 'strength'
  | 'hypertrophy'
  | 'calisthenics'
  | 'yoga'
  | 'mobility'
  | 'conditioning'
  | 'mixed'
  | 'custom';

export type ExerciseMeasureMode = 'reps' | 'duration';
export type WorkoutExerciseLevel = 'beginner' | 'intermediate' | 'advanced' | 'custom';
export type ExerciseLoadMode = 'weighted' | 'bodyweight' | 'none';

/** Formato antigo do catálogo, mantido para Store/UI ainda não migradas. */
export interface LegacyWorkoutExercise {
  id: string;
  name: string;
  source: WorkoutExerciseSource;
  category: WorkoutExerciseCategory;
  level: WorkoutExerciseLevel;
  description?: string;
  family?: string;
  nameAlternate?: string;
  durationLabel?: string;
  focus?: string;
  equipment?: string[];
  instructions: string[];
  breathing?: string;
  benefits: string[];
  contraindications: string[];
  variations: string[];
  measureMode: ExerciseMeasureMode;
  defaultSets: number;
  defaultReps: number;
  defaultDurationSeconds: number;
  defaultLoadKg: number;
  loadMode: ExerciseLoadMode;
  muscleDistribution: MuscleContribution[];
  legacyId?: string;
}

export type WorkoutExerciseMode = 'catalog' | 'planned' | 'executed';

/** Exercício de referência do catálogo; a modalidade não é uma Core Area. */
export type Exercise = Omit<LegacyWorkoutExercise, 'category' | 'id'> & {
  id: UUIDv4;
  modality: WorkoutExerciseCategory;
};

interface WorkoutSetBase {
  id: UUIDv4;
  setNumber: number;
  targetLoadKg?: number;
  loadKg?: number;
  restSeconds?: number;
  loadFactor?: 0.8 | 1 | 1.5;
  completed: boolean;
  skipped?: boolean;
  completedAt?: ISODateString;
}

/** Série dinâmica ou isométrica, sem permitir as duas métricas ao mesmo tempo. */
export type WorkoutSet = WorkoutSetBase & (
  | { measureMode: 'reps'; reps?: number; targetReps?: number; durationSeconds?: never; targetDurationSeconds?: never }
  | { measureMode: 'duration'; durationSeconds?: number; targetDurationSeconds?: number; reps?: never; targetReps?: never }
);

/** Instância que agrega séries, planejada ou registrada numa sessão. */
export interface WorkoutExerciseInstance<Mode extends 'planned' | 'executed' = 'planned'> {
  id: UUIDv4;
  exerciseId: UUIDv4;
  order: number;
  exerciseNameSnapshot: string;
  modality?: WorkoutExerciseCategory;
  sets: WorkoutSet[];
  notes?: string;
  muscleDistribution?: MuscleContribution[];
  muscleDistributionOverride?: MuscleContribution[];
  instanceMode?: Mode;
}

export type PlannedExercise = WorkoutExerciseInstance<'planned'>;
export type ExecutedExercise = WorkoutExerciseInstance<'executed'>;

/**
 * Sem parâmetro preserva o tipo de catálogo legado. Novas instâncias declaram
 * WorkoutExercise<'planned'> ou WorkoutExercise<'executed'> explicitamente;
 * novos catálogos usam Exercise, com `modality`.
 */
export type WorkoutExercise<Mode extends WorkoutExerciseMode = 'catalog'> =
  Mode extends 'catalog' ? LegacyWorkoutExercise : WorkoutExerciseInstance<Mode & ('planned' | 'executed')>;

export interface WorkoutSetPlan {
  id: string;
  setNumber: number;
  targetReps?: number;
  targetDurationSeconds?: number;
  targetLoadKg: number;
  restSeconds: number;
  /** Fator de carga canônico do Módulo de Treino; dados anteriores usam 1.0. */
  loadFactor?: 0.8 | 1 | 1.5;
}

export interface WorkoutExercisePlan {
  id: string;
  exerciseId: string;
  order: number;
  sets: WorkoutSetPlan[];
  notes?: string;
  muscleDistributionOverride?: MuscleContribution[];
}

export type WorkoutStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

export interface Workout {
  effortLevel?: number;
  id: string;
  name: string;
  category: WorkoutExerciseCategory;
  source: WorkoutExerciseSource;
  status: WorkoutStatus;
  scheduledAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  estimatedDurationMinutes: number;
  exercises: WorkoutExercisePlan[];
  lastSessionId?: string;
}

/** Blueprint inerte na biblioteca; existir aqui não cria item no Core. */
export interface WorkoutTemplate {
  /** Inteiro 1–5; formulários novos sugerem 3, ausência mantém padrão Core 1. */
  effortLevel?: number;
  durationEstimateMode?: 'auto' | 'manual';
  id: UUIDv4;
  name: string;
  modality: WorkoutExerciseCategory;
  source: WorkoutExerciseSource;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  estimatedDurationMinutes: number;
  exercises: WorkoutExercise<'planned'>[];
  description?: string;
}

/** Sequência ordenada de blueprints, sem HabitRotation até ativação explícita. */
export interface WorkoutSequence {
  id: UUIDv4;
  name: string;
  /** A ordem do array é a ordem da sequência; IDs são UUID v4. */
  templateIds: UUIDv4[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  description?: string;
}

/** Relação rastreável produzida pelo Adapter durante ativação solicitada. */
export interface WorkoutCoreActivation {
  id: UUIDv4;
  sourceTemplateId?: UUIDv4;
  sourceSequenceId?: UUIDv4;
  coreEntityId: UUIDv4;
  kind: 'ACTION' | 'HABIT' | 'HABIT_ROTATION';
  activatedAt: ISODateString;
}

export interface PerformedSet {
  id: string;
  setNumber: number;
  loadKg: number;
  reps: number;
  durationSeconds?: number;
  completed: boolean;
  skipped?: boolean;
  completedAt?: ISODateString;
  effectiveLoadKg: number;
  volume: number;
  formulaVersion: string;
  /** Snapshot do fator usado na série planejada, para projeção ER rastreável. */
  loadFactor?: 0.8 | 1 | 1.5;
  perceivedExertion?: number;
  distanceMeters?: number;
  activityNotes?: string;
  activityLoad?: number;
}

export interface WorkoutExerciseResult {
  exerciseId: string;
  exerciseNameSnapshot: string;
  order: number;
  muscleDistribution: MuscleContribution[];
  sets: PerformedSet[];
}

export type WorkoutSessionStatus = 'in_progress' | 'completed' | 'cancelled';

export interface LegacyWorkoutSession {
  id: string;
  workoutId: string;
  workoutNameSnapshot: string;
  status: WorkoutSessionStatus;
  startedAt: ISODateString;
  completedAt?: ISODateString;
  scheduledAt?: ISODateString;
  durationSeconds: number;
  bodyweightKgSnapshot?: number;
  exerciseResults: WorkoutExerciseResult[];
  totalVolume: number;
  earthPoints: number;
  strengthGain: number;
  pranaCost: number;
  staminaCost: number;
  rating?: 1 | 2 | 3 | 4 | 5;
  gamificationApplied: boolean;
  formulaVersion: string;
}

/** Sessão nativa real; templateId ausente representa uma sessão ad-hoc. */
export interface NativeWorkoutSession {
  /** Snapshot do esforço global escolhido no planejamento. */
  effortLevel?: number;
  id: UUIDv4;
  templateId?: UUIDv4;
  sequenceId?: UUIDv4;
  /** Vínculo Core ativo (Action/Habit/ocorrência), quando aplicável. */
  coreEntityId?: UUIDv4;
  nameSnapshot: string;
  status: WorkoutSessionStatus;
  startedAt: ISODateString;
  completedAt?: ISODateString;
  scheduledAt?: ISODateString;
  durationSeconds: number;
  exerciseResults: WorkoutExercise<'executed'>[];
  totalER: number;
  baseValue?: number;
  /** Correlação do único ExecutionLog emitido para esta sessão. */
  coreExecutionLogId?: UUIDv4;
}

/** Mantém compatibilidade até a migração de Store/UI para o modelo canônico. */
export type WorkoutSession<Mode extends 'legacy' | 'native' = 'legacy'> =
  Mode extends 'native' ? NativeWorkoutSession : LegacyWorkoutSession;

export interface WorkoutRating {
  sessionId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface BodyMeasurement {
  id: string;
  measuredAt: ISODateString;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercent?: number;
  waterPercent?: number;
  muscleMassKg?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
}

export interface StrengthRecord {
  id: string;
  exerciseId: string;
  recordedAt: ISODateString;
  bestLoadKg: number;
  bestReps: number;
  estimatedOneRepMax: number;
  previousEstimatedOneRepMax: number;
  gain: number;
  isPersonalRecord: boolean;
}

export interface WorkoutGamificationLedgerEntry {
  id: string;
  sessionId: string;
  appliedAt: ISODateString;
  earthPoints: number;
  xpAwarded: number;
  totalScoreDelta: number;
  staminaCost: number;
  pranaCost: number;
  strengthGain: number;
  formulaVersion: string;
}

export interface WorkoutResourceSnapshot {
  basePrana: number;
  pranaSpentByWorkoutsToday: number;
  currentPrana: number;
  baseStamina: number;
  staminaSpentByWorkoutsToday: number;
  currentStamina: number;
}

export interface WorkoutVolumeHistoryPoint {
  date: string;
  volume: number;
}

export interface WorkoutStrengthHistoryPoint {
  date: string;
  estimatedOneRepMax: number;
  exerciseId: string;
}

export interface WorkoutStats {
  completedWorkouts: number;
  totalVolume: number;
  totalDurationSeconds: number;
  totalEarthPoints: number;
  totalStrengthGain: number;
  averageRating: number;
  averageVolumePerWorkout: number;
}

export interface WorkoutAccountData {
  workouts: Workout[];
  sessions: WorkoutSession[];
  exercisesCatalog: WorkoutExercise[];
  bodyMeasurements: BodyMeasurement[];
  strengthRecords: StrengthRecord[];
  strengthProgressPoints: number;
  strengthStat: number;
  gamificationLedger: WorkoutGamificationLedgerEntry[];
  ratings: WorkoutRating[];
}

export interface WorkoutCreateInput {
  effortLevel?: number;
  name: string;
  category?: WorkoutExerciseCategory;
  source?: WorkoutExerciseSource;
  scheduledAt?: ISODateString;
  estimatedDurationMinutes?: number;
  exercises?: WorkoutExercisePlan[];
}

export interface WorkoutUpdateInput {
  effortLevel?: number;
  name?: string;
  category?: WorkoutExerciseCategory;
  source?: WorkoutExerciseSource;
  status?: WorkoutStatus;
  scheduledAt?: ISODateString;
  estimatedDurationMinutes?: number;
  exercises?: WorkoutExercisePlan[];
}

export interface PerformedSetUpdateInput {
  perceivedExertion?: number;
  distanceMeters?: number;
  activityNotes?: string;
  loadKg?: number;
  reps?: number;
  durationSeconds?: number;
}

export interface BodyMeasurementInput {
  measuredAt?: ISODateString;
  heightCm?: number;
  weightKg?: number;
  bodyFatPercent?: number;
  waterPercent?: number;
  muscleMassKg?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
  notes?: string;
}
