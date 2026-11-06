import type { FitnessGlyphName } from '@/components/fitness-kit/FitnessGlyph';
import type { MuscleGroupId } from '@/types/workout';

export const MUSCLE_REGIONS: { id: string; label: string; icon: FitnessGlyphName; muscles: MuscleGroupId[] }[] = [
  { id: 'chest', label: 'Peito', icon: 'chest', muscles: ['chest'] },
  { id: 'back', label: 'Costas', icon: 'back', muscles: ['upper_back', 'lats', 'lower_back'] },
  { id: 'shoulders', label: 'Ombros e cintura escapular', icon: 'shoulders', muscles: ['shoulders', 'serratus'] },
  { id: 'arms', label: 'Braços', icon: 'arms', muscles: ['biceps', 'triceps', 'forearms'] },
  { id: 'core', label: 'Abdômen', icon: 'core', muscles: ['core', 'obliques'] },
  { id: 'legs', label: 'Pernas', icon: 'legs', muscles: ['quadriceps', 'glutes', 'hamstrings', 'calves', 'tibialis', 'adductors'] },
];

export const MUSCLE_TARGETS: { id: MuscleGroupId; label: string; icon: FitnessGlyphName }[] = [
  { id: 'chest', label: 'Peitoral', icon: 'chest' },
  { id: 'upper_back', label: 'Costas superiores', icon: 'upper_back' },
  { id: 'lats', label: 'Dorsais', icon: 'lats' },
  { id: 'lower_back', label: 'Lombar', icon: 'lower_back' },
  { id: 'shoulders', label: 'Ombros', icon: 'shoulders' },
  { id: 'biceps', label: 'Bíceps', icon: 'biceps' },
  { id: 'triceps', label: 'Tríceps', icon: 'triceps' },
  { id: 'forearms', label: 'Antebraços', icon: 'forearms' },
  { id: 'core', label: 'Abdômen', icon: 'core' },
  { id: 'obliques', label: 'Oblíquos', icon: 'obliques' },
  { id: 'glutes', label: 'Glúteos', icon: 'glutes' },
  { id: 'quadriceps', label: 'Quadríceps', icon: 'quadriceps' },
  { id: 'hamstrings', label: 'Posteriores da coxa', icon: 'hamstrings' },
  { id: 'adductors', label: 'Adutores', icon: 'adductors' },
  { id: 'calves', label: 'Panturrilhas', icon: 'calves' },
  { id: 'tibialis', label: 'Tibial anterior', icon: 'tibialis' },
  { id: 'serratus', label: 'Serrátil anterior', icon: 'serratus' },
];
