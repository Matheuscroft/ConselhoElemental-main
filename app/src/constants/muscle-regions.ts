import type { MuscleGroupId } from '@/types/workout';

export const MUSCLE_REGIONS: { id: string; label: string; emoji: string; muscles: MuscleGroupId[] }[] = [
  { id: 'chest', label: 'Peito', emoji: '🛡️', muscles: ['chest'] },
  { id: 'back', label: 'Costas', emoji: '🦴', muscles: ['upper_back', 'lats', 'lower_back'] },
  { id: 'shoulders', label: 'Ombros', emoji: '🏋️', muscles: ['shoulders'] },
  { id: 'arms', label: 'Braços', emoji: '💪', muscles: ['biceps', 'triceps', 'forearms'] },
  { id: 'core', label: 'Abdômen', emoji: '🧍', muscles: ['core'] },
  { id: 'legs', label: 'Pernas', emoji: '🦵', muscles: ['quadriceps', 'glutes', 'hamstrings', 'calves', 'adductors'] },
];
