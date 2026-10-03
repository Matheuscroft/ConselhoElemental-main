export type ISODateString = string;

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

export interface WorkoutExercise {
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

export interface WorkoutSetPlan {
  id: string;
  setNumber: number;
  targetReps?: number;
  targetDurationSeconds?: number;
  targetLoadKg: number;
  restSeconds: number;
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
}

export interface WorkoutExerciseResult {
  exerciseId: string;
  exerciseNameSnapshot: string;
  order: number;
  muscleDistribution: MuscleContribution[];
  sets: PerformedSet[];
}

export type WorkoutSessionStatus = 'in_progress' | 'completed' | 'cancelled';

export interface WorkoutSession {
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
  name: string;
  category?: WorkoutExerciseCategory;
  source?: WorkoutExerciseSource;
  scheduledAt?: ISODateString;
  estimatedDurationMinutes?: number;
  exercises?: WorkoutExercisePlan[];
}

export interface WorkoutUpdateInput {
  name?: string;
  category?: WorkoutExerciseCategory;
  source?: WorkoutExerciseSource;
  status?: WorkoutStatus;
  scheduledAt?: ISODateString;
  estimatedDurationMinutes?: number;
  exercises?: WorkoutExercisePlan[];
}

export interface PerformedSetUpdateInput {
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
