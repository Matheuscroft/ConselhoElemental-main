import {
  Dumbbell,
  Flame,
  Flower2,
  HeartPulse,
  PersonStanding,
  Shapes,
  Sparkles,
  Waves,
  type LucideIcon,
} from 'lucide-react';
import type {
  MuscleGroupId,
  WorkoutExerciseCategory,
  WorkoutExerciseLevel,
  WorkoutExerciseSource,
  WorkoutSessionStatus,
  WorkoutStatus,
} from '@/types/workout';

export const ALL_CATEGORIES: WorkoutExerciseCategory[] = [
  'strength',
  'hypertrophy',
  'calisthenics',
  'yoga',
  'mobility',
  'conditioning',
  'mixed',
  'custom',
];

export const CATEGORY_LABELS: Record<WorkoutExerciseCategory, string> = {
  strength: 'Força',
  hypertrophy: 'Hipertrofia',
  calisthenics: 'Calistenia',
  yoga: 'Yoga',
  mobility: 'Mobilidade',
  conditioning: 'Condicionamento',
  mixed: 'Misto',
  custom: 'Personalizado',
};

export const CATEGORY_DESCRIPTIONS: Record<WorkoutExerciseCategory, string> = {
  strength: 'Cargas progressivas e recordes de força',
  hypertrophy: 'Volume dedicado ao ganho de massa muscular',
  calisthenics: 'Controle corporal usando o próprio peso',
  yoga: 'Posturas, respiração e mobilidade consciente',
  mobility: 'Amplitude de movimento e soltura articular',
  conditioning: 'Resistência cardiorrespiratória e ritmo',
  mixed: 'Combinação de estímulos em uma sessão',
  custom: 'Exercícios criados pelo próprio mago',
};

export const CATEGORY_ICONS: Record<WorkoutExerciseCategory, LucideIcon> = {
  strength: Dumbbell,
  hypertrophy: Flame,
  calisthenics: PersonStanding,
  yoga: Flower2,
  mobility: Waves,
  conditioning: HeartPulse,
  mixed: Shapes,
  custom: Sparkles,
};

export const SOURCE_LABELS: Record<WorkoutExerciseSource, string> = {
  native: 'Nativo',
  calistenia: 'Calistenia',
  yoga: 'Yoga',
  custom: 'Personalizado',
};

export const LEVEL_LABELS: Record<WorkoutExerciseLevel, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
  custom: 'Personalizado',
};

export const LEVEL_BADGE_CLASSES: Record<WorkoutExerciseLevel, string> = {
  beginner: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
  intermediate: 'border-orange-400/40 text-orange-300 bg-orange-500/10',
  advanced: 'border-rose-400/40 text-rose-300 bg-rose-500/10',
  custom: 'border-mystic-arcane/40 text-mystic-arcane bg-mystic-arcane/10',
};

export const STATUS_LABELS: Record<WorkoutStatus, string> = {
  planned: 'Planejado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const STATUS_BADGE_CLASSES: Record<WorkoutStatus, string> = {
  planned: 'border-white/20 text-white/70 bg-white/5',
  in_progress: 'border-mystic-cyan/40 text-mystic-cyan bg-mystic-cyan/10',
  completed: 'border-terra-light/40 text-terra-light bg-terra-light/10',
  cancelled: 'border-rose-400/30 text-rose-300/80 bg-rose-500/5',
};

export const SESSION_STATUS_LABELS: Record<WorkoutSessionStatus, string> = {
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

// Ordem de exibição priorizando grupos maiores, usada nas barras de distribuição muscular.
export const MUSCLE_LABELS: Record<MuscleGroupId, string> = {
  chest: 'Peito',
  upper_back: 'Costas Superiores',
  lats: 'Dorsais',
  shoulders: 'Ombros',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  forearms: 'Antebraços',
  core: 'Core',
  glutes: 'Glúteos',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores de Coxa',
  calves: 'Panturrilhas',
  adductors: 'Adutores',
  lower_back: 'Lombar',
};

export const getInstructionsLabel = (source: WorkoutExerciseSource): string =>
  source === 'yoga' ? 'Alinhamento' : 'Execução Técnica';
