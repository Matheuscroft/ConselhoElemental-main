import { getYogaIllustrationFullSrc } from '@/constants/yoga-image-prompts';
import type { LegacyWorkoutExercise } from '@/types/workout';

type Media = { imageUrl?: string; videoUrl?: string };
export const validExerciseMediaUrl = (value?: string): boolean => {
  if (!value) return true;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
};
export function resolveExerciseMedia(snapshot: Media, exercise?: Media, legacy?: LegacyWorkoutExercise) {
  const src = snapshot.videoUrl || exercise?.videoUrl;
  const poster = snapshot.imageUrl || exercise?.imageUrl || (legacy?.source === 'yoga' && legacy.legacyId ? getYogaIllustrationFullSrc(legacy.legacyId) : undefined);
  return { src: validExerciseMediaUrl(src) ? src : undefined, poster: validExerciseMediaUrl(poster) ? poster : undefined };
}
