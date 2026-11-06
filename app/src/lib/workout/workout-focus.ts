import type { FitnessGlyphName } from '@/components/fitness-kit/FitnessGlyph';
import { CATEGORY_LABELS } from './workout-labels';
import type { Exercise, MuscleGroupId, WorkoutExerciseCategory, WorkoutTemplate } from '@/types/workout';

const muscleRegions: Record<MuscleGroupId, { id: string; label: string; icon: FitnessGlyphName }> = {
  chest: { id: 'chest', label: 'Peito', icon: 'chest' },
  upper_back: { id: 'back', label: 'Costas', icon: 'back' },
  lats: { id: 'back', label: 'Costas', icon: 'back' },
  lower_back: { id: 'back', label: 'Costas', icon: 'back' },
  shoulders: { id: 'shoulders', label: 'Ombros', icon: 'shoulders' },
  biceps: { id: 'arms', label: 'Braços', icon: 'arms' },
  triceps: { id: 'arms', label: 'Braços', icon: 'arms' },
  forearms: { id: 'arms', label: 'Braços', icon: 'arms' },
  core: { id: 'core', label: 'Abdômen', icon: 'core' },
  obliques: { id: 'core', label: 'Abdômen', icon: 'core' },
  glutes: { id: 'legs', label: 'Pernas', icon: 'legs' },
  quadriceps: { id: 'legs', label: 'Pernas', icon: 'legs' },
  hamstrings: { id: 'legs', label: 'Pernas', icon: 'legs' },
  calves: { id: 'legs', label: 'Pernas', icon: 'legs' },
  tibialis: { id: 'legs', label: 'Pernas', icon: 'legs' },
  serratus: { id: 'shoulders', label: 'Ombros', icon: 'shoulders' },
  adductors: { id: 'legs', label: 'Pernas', icon: 'legs' },
};

/** One vote per exercise, using its first primary muscle; ties follow workout order. */
export function getExerciseFocus(exerciseId: string, catalog: Exercise[]) {
  const primary = catalog.find((exercise) => exercise.id === exerciseId)?.primaryMuscles?.[0];
  return primary ? muscleRegions[primary] : undefined;
}

export function getWorkoutFocus(template: WorkoutTemplate | undefined, catalog: Exercise[]) {
  const counts = new Map<string, { label: string; icon: FitnessGlyphName; count: number }>();
  for (const planned of template?.exercises ?? []) {
    const region = getExerciseFocus(planned.exerciseId, catalog);
    if (!region) continue;
    const existing = counts.get(region.id);
    counts.set(region.id, { label: region.label, icon: region.icon, count: (existing?.count ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0];
}

const muscleFocusedModalities = new Set<WorkoutExerciseCategory>(['strength', 'hypertrophy', 'calisthenics']);

/** Presentation only: the saved sport wins over muscle tags and arbitrary workout names. */
function activityPresentation(modality: WorkoutExerciseCategory | undefined, focus: { label: string; icon: FitnessGlyphName } | undefined) {
  if ((!modality || muscleFocusedModalities.has(modality)) && focus) return focus;
  const activity = modality && Object.hasOwn(CATEGORY_LABELS, modality) ? modality : 'mixed';
  return { icon: activity as FitnessGlyphName, label: CATEGORY_LABELS[activity] };
}

export function getExercisePresentation(exerciseId: string, catalog: Exercise[], fallbackModality?: WorkoutExerciseCategory) {
  const exercise = catalog.find((item) => item.id === exerciseId);
  return activityPresentation(exercise?.modality ?? fallbackModality, getExerciseFocus(exerciseId, catalog));
}

export function getWorkoutPresentation(template: WorkoutTemplate | undefined, catalog: Exercise[], fallbackModality?: WorkoutExerciseCategory) {
  return activityPresentation(template?.modality ?? fallbackModality, getWorkoutFocus(template, catalog));
}
