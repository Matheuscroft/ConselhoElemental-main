import type { MuscleGroupId } from '@/types/workout';

export const MUSCLE_REGIONS: { id: string; label: string; emoji: string; muscles: MuscleGroupId[] }[] = [
  { id: 'chest', label: 'Peito', emoji: '🛡️', muscles: ['chest'] },
  { id: 'back', label: 'Costas', emoji: '🦴', muscles: ['upper_back', 'lats', 'lower_back'] },
  { id: 'shoulders', label: 'Ombros e cintura escapular', emoji: '🏋️', muscles: ['shoulders', 'serratus'] },
  { id: 'arms', label: 'Braços', emoji: '💪', muscles: ['biceps', 'triceps', 'forearms'] },
  { id: 'core', label: 'Abdômen', emoji: '🧍', muscles: ['core', 'obliques'] },
  { id: 'legs', label: 'Pernas', emoji: '🦵', muscles: ['quadriceps', 'glutes', 'hamstrings', 'calves', 'tibialis', 'adductors'] },
];

export const MUSCLE_TARGETS: { id: MuscleGroupId; label: string; emoji: string }[] = [
  { id: 'chest', label: 'Peitoral', emoji: '🛡️' },
  { id: 'upper_back', label: 'Costas superiores', emoji: '🦴' },
  { id: 'lats', label: 'Dorsais', emoji: '🪽' },
  { id: 'lower_back', label: 'Lombar', emoji: '🧍' },
  { id: 'shoulders', label: 'Ombros', emoji: '🏋️' },
  { id: 'biceps', label: 'Bíceps', emoji: '💪' },
  { id: 'triceps', label: 'Tríceps', emoji: '💪' },
  { id: 'forearms', label: 'Antebraços', emoji: '✊' },
  { id: 'core', label: 'Abdômen', emoji: '🧍' },
  { id: 'obliques', label: 'Oblíquos', emoji: '↔️' },
  { id: 'glutes', label: 'Glúteos', emoji: '🦵' },
  { id: 'quadriceps', label: 'Quadríceps', emoji: '🦵' },
  { id: 'hamstrings', label: 'Posteriores da coxa', emoji: '🦵' },
  { id: 'adductors', label: 'Adutores', emoji: '🦵' },
  { id: 'calves', label: 'Panturrilhas', emoji: '🦶' },
  { id: 'tibialis', label: 'Tibial anterior', emoji: '🦶' },
  { id: 'serratus', label: 'Serrátil anterior', emoji: '🪽' },
];
