import type { Exercise, MuscleGroupId, WorkoutTemplate } from '@/types/workout';

const muscleRegions: Record<MuscleGroupId, { id: string; label: string; emoji: string }> = {
  chest: { id: 'chest', label: 'Peito', emoji: '🛡️' },
  upper_back: { id: 'back', label: 'Costas', emoji: '🦴' },
  lats: { id: 'back', label: 'Costas', emoji: '🦴' },
  lower_back: { id: 'back', label: 'Costas', emoji: '🦴' },
  shoulders: { id: 'shoulders', label: 'Ombros', emoji: '🏋️' },
  biceps: { id: 'arms', label: 'Braços', emoji: '💪' },
  triceps: { id: 'arms', label: 'Braços', emoji: '💪' },
  forearms: { id: 'arms', label: 'Braços', emoji: '💪' },
  core: { id: 'core', label: 'Abdômen', emoji: '🧍' },
  glutes: { id: 'legs', label: 'Pernas', emoji: '🦵' },
  quadriceps: { id: 'legs', label: 'Pernas', emoji: '🦵' },
  hamstrings: { id: 'legs', label: 'Pernas', emoji: '🦵' },
  calves: { id: 'legs', label: 'Pernas', emoji: '🦵' },
  adductors: { id: 'legs', label: 'Pernas', emoji: '🦵' },
};

/** One vote per exercise, using its first primary muscle; ties follow workout order. */
export function getExerciseFocus(exerciseId: string, catalog: Exercise[]) {
  const primary = catalog.find((exercise) => exercise.id === exerciseId)?.primaryMuscles?.[0];
  return primary ? muscleRegions[primary] : undefined;
}

export function getWorkoutFocus(template: WorkoutTemplate | undefined, catalog: Exercise[]) {
  const counts = new Map<string, { label: string; emoji: string; count: number }>();
  for (const planned of template?.exercises ?? []) {
    const region = getExerciseFocus(planned.exerciseId, catalog);
    if (!region) continue;
    const existing = counts.get(region.id);
    counts.set(region.id, { label: region.label, emoji: region.emoji, count: (existing?.count ?? 0) + 1 });
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)[0];
}
