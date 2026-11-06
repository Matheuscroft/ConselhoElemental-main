import type { LucideIcon } from 'lucide-react';
import { FITNESS_ICONS } from '@/components/fitness-kit/FitnessGlyph';
import type {
  MuscleGroupId,
  WorkoutExerciseCategory,
  WorkoutExerciseLevel,
  WorkoutExerciseSource,
  WorkoutSessionStatus,
  WorkoutStatus,
} from '@/types/workout';

export const ALL_CATEGORIES: WorkoutExerciseCategory[] = [
  'running',
  'swimming',
  'martial_arts',
  'cycling',
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
  running: 'Corrida',
  swimming: 'Natação',
  martial_arts: 'Artes marciais',
  cycling: 'Ciclismo',
  strength: 'Musculação',
  hypertrophy: 'Hipertrofia',
  calisthenics: 'Calistenia',
  yoga: 'Yoga',
  mobility: 'Mobilidade',
  conditioning: 'Condicionamento',
  mixed: 'Misto',
  custom: 'Personalizado',
};

export const CATEGORY_DESCRIPTIONS: Record<WorkoutExerciseCategory, string> = {
  running: 'Planejamento de treinos de corrida',
  swimming: 'Planejamento de treinos de natação',
  martial_arts: 'Planejamento de treinos de artes marciais',
  cycling: 'Planejamento de treinos de ciclismo',
  strength: 'Exercícios com resistência externa: pesos livres, cabos, faixas e máquinas',
  hypertrophy: 'Volume dedicado ao ganho de massa muscular',
  calisthenics: 'Controle corporal usando o próprio peso',
  yoga: 'Posturas, respiração e mobilidade consciente',
  mobility: 'Amplitude de movimento e soltura articular',
  conditioning: 'Resistência cardiorrespiratória e ritmo',
  mixed: 'Combinação de estímulos em uma sessão',
  custom: 'Exercícios criados pelo próprio mago',
};

export const CATEGORY_ICONS: Record<WorkoutExerciseCategory, LucideIcon> = {
  running: FITNESS_ICONS.running,
  swimming: FITNESS_ICONS.swimming,
  martial_arts: FITNESS_ICONS.martial_arts,
  cycling: FITNESS_ICONS.cycling,
  strength: FITNESS_ICONS.strength,
  hypertrophy: FITNESS_ICONS.hypertrophy,
  calisthenics: FITNESS_ICONS.calisthenics,
  yoga: FITNESS_ICONS.yoga,
  mobility: FITNESS_ICONS.mobility,
  conditioning: FITNESS_ICONS.conditioning,
  mixed: FITNESS_ICONS.mixed,
  custom: FITNESS_ICONS.custom,
};

export const SOURCE_LABELS: Record<WorkoutExerciseSource, string> = {
  native: 'Nativo',
  calistenia: 'Calistenia',
  musculacao: 'Musculação',
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
  obliques: 'Oblíquos',
  glutes: 'Glúteos',
  quadriceps: 'Quadríceps',
  hamstrings: 'Posteriores de Coxa',
  calves: 'Panturrilhas',
  tibialis: 'Tibial anterior',
  serratus: 'Serrátil anterior',
  adductors: 'Adutores',
  lower_back: 'Lombar',
};

export const getInstructionsLabel = (source: WorkoutExerciseSource): string =>
  source === 'yoga' ? 'Alinhamento' : 'Execução Técnica';
