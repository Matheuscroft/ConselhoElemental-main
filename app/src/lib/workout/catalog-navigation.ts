import { MUSCLE_REGIONS, MUSCLE_TARGETS } from '@/constants/muscle-regions';
import { STRENGTH_EQUIPMENT_LABELS } from '@/constants/strength-training-exercises';
import type { Exercise } from '@/types/workout';

/** Presentation only. Assign each exercise once, retaining its original object/order. */
export function groupCatalogExercises<T extends Pick<Exercise, 'primaryMuscles'>>(exercises: T[]) {
  const groups = MUSCLE_REGIONS.map(region => ({ ...region, label: region.id === 'shoulders' ? 'Ombros' : region.label, exercises: [] as T[] }));
  const other = { id: 'other', label: 'Outros exercícios', icon: 'mixed' as const, muscles: [], exercises: [] as T[] };
  for (const exercise of exercises) {
    const primary = exercise.primaryMuscles?.[0];
    const group = groups.find(region => primary && region.muscles.includes(primary)) ?? other;
    group.exercises.push(exercise);
  }
  return [...groups, other].filter(group => group.exercises.length > 0);
}

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
/** Literal, accent-insensitive multi-word search across existing names/tags. */
export function matchesCatalogSearch(exercise: Pick<Exercise, 'name' | 'focus' | 'primaryMuscles' | 'secondaryMuscles' | 'strengthProfile'>, query: string, includeSecondary = false) {
  const words = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const muscles = [...(exercise.primaryMuscles ?? []), ...(includeSecondary ? exercise.secondaryMuscles ?? [] : [])];
  const haystack = normalize([
    exercise.name, exercise.focus ?? '',
    ...MUSCLE_TARGETS.filter(target => muscles.includes(target.id)).map(target => target.label),
    ...MUSCLE_REGIONS.filter(region => region.muscles.some(muscle => muscles.includes(muscle))).map(region => region.label),
    ...(exercise.strengthProfile?.equipmentIds ?? []).map(item => STRENGTH_EQUIPMENT_LABELS[item]),
  ].join(' '));
  return words.every(word => haystack.includes(word));
}
