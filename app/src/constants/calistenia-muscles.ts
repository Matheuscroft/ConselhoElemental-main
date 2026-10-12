import type { MuscleGroupId } from '@/types/workout';

export interface ExerciseMuscleProfile { primaryMuscles: MuscleGroupId[]; secondaryMuscles: MuscleGroupId[] }
/** Catalog tags for discovery, not measured activation percentages or scoring inputs. */
export const CALISTENIA_MUSCLE_PROFILES: Record<string, ExerciseMuscleProfile> = {
  'incline-push-up': { primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders', 'core'] },
  'push-up': { primaryMuscles: ['chest'], secondaryMuscles: ['triceps', 'shoulders', 'core'] },
  'pike-push-up': { primaryMuscles: ['shoulders'], secondaryMuscles: ['triceps', 'chest', 'core'] },
  'australian-row': { primaryMuscles: ['upper_back', 'lats'], secondaryMuscles: ['biceps', 'forearms', 'core'] },
  'pull-up': { primaryMuscles: ['lats', 'upper_back'], secondaryMuscles: ['biceps', 'forearms', 'core'] },
  'bodyweight-squat': { primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings', 'adductors', 'calves', 'core'] },
  'walking-lunge': { primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings', 'adductors', 'calves', 'core'] },
  'hollow-body-hold': { primaryMuscles: ['core'], secondaryMuscles: [] },
  'plank': { primaryMuscles: ['core'], secondaryMuscles: ['shoulders', 'glutes'] },
  'hanging-knee-raise': { primaryMuscles: ['core'], secondaryMuscles: ['forearms', 'lats'] },
  'l-sit-tuck': { primaryMuscles: ['core'], secondaryMuscles: ['triceps', 'shoulders', 'quadriceps'] },
  'burpee-controlled': { primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['chest', 'triceps', 'shoulders', 'core', 'calves'] },
  'diamond-push-up': { primaryMuscles: ['triceps', 'chest'], secondaryMuscles: ['shoulders', 'core'] },
  'dips': { primaryMuscles: ['chest', 'triceps'], secondaryMuscles: ['shoulders', 'core'] },
  'chin-up': { primaryMuscles: ['lats', 'biceps'], secondaryMuscles: ['upper_back', 'forearms', 'core'] },
  'muscle-up-transition': { primaryMuscles: ['lats', 'upper_back'], secondaryMuscles: ['biceps', 'forearms', 'chest', 'triceps', 'core'] },
  'bulgarian-split-squat': { primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings', 'adductors', 'calves', 'core'] },
  'pistol-squat': { primaryMuscles: ['quadriceps', 'glutes'], secondaryMuscles: ['hamstrings', 'adductors', 'calves', 'core'] },
  'glute-bridge': { primaryMuscles: ['glutes'], secondaryMuscles: ['hamstrings', 'core'] },
  'v-up': { primaryMuscles: ['core'], secondaryMuscles: [] },
  'dragon-flag': { primaryMuscles: ['core'], secondaryMuscles: ['lats', 'glutes'] },
};

/** Upgrade only the exact automatically assigned tags; preserve custom profiles. */
export function correctPreviousMuscleTags<T extends { legacyId?: string; primaryMuscles?: MuscleGroupId[]; secondaryMuscles?: MuscleGroupId[] }>(exercise: T): T {
  const id = exercise.legacyId?.replace(/^calistenia-/, '');
  const previous: Record<string, ExerciseMuscleProfile> = {
    'burpee-controlled': { primaryMuscles: ['quadriceps', 'glutes', 'chest'], secondaryMuscles: ['triceps', 'shoulders', 'core', 'calves'] },
    'diamond-push-up': { primaryMuscles: ['triceps'], secondaryMuscles: ['chest', 'shoulders', 'core'] },
  };
  if (!id || !previous[id] || JSON.stringify(exercise.primaryMuscles) !== JSON.stringify(previous[id].primaryMuscles) ||
    JSON.stringify(exercise.secondaryMuscles) !== JSON.stringify(previous[id].secondaryMuscles)) return exercise;
  return { ...exercise, primaryMuscles: [...CALISTENIA_MUSCLE_PROFILES[id].primaryMuscles], secondaryMuscles: [...CALISTENIA_MUSCLE_PROFILES[id].secondaryMuscles] };
}
