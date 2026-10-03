import { formatDuration, formatTime } from '@/constants';
import type { ISODateString } from '@/types/workout';

export { formatDuration, formatTime };

export const formatWorkoutDateTime = (value?: ISODateString): string => {
  if (!value) return 'Sem data definida';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sem data definida';

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (date.toDateString() === today.toDateString()) return `Hoje · ${time}`;
  if (date.toDateString() === yesterday.toDateString()) return `Ontem · ${time}`;

  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} · ${time}`;
};

export const formatVolume = (value: number): string => `${Math.round(value).toLocaleString('pt-BR')} kg`;

export const formatWeight = (value: number): string => `${Math.round(value).toLocaleString('pt-BR')} kg`;

export const formatPercent = (value: number): string => `${Math.round(value).toLocaleString('pt-BR')}%`;

interface DurationEstimateInput {
  sets: Array<{ restSeconds: number }>;
}

const ESTIMATED_WORK_SECONDS_PER_SET = 45;

// Estimativa apenas para pré-preencher o campo editável de duração ao criar um treino.
export const estimateWorkoutDurationMinutes = (exercises: DurationEstimateInput[]): number => {
  const totalSeconds = exercises.reduce(
    (sum, exercise) =>
      sum + exercise.sets.reduce((setSum, set) => setSum + ESTIMATED_WORK_SECONDS_PER_SET + Math.max(0, set.restSeconds), 0),
    0
  );
  return Math.max(5, Math.round(totalSeconds / 60));
};
