import { createContext, useContext } from 'react';
import type { ElementId } from '@/types';
import type { WorkoutExerciseCategory } from '@/types/workout';

/** The light of the week behind the Health tabs: read-only, never scored here. */
export interface SaudeLuz {
  /** Hex accent of the element leading the week, or the gold of the module when none leads yet. */
  readonly acento: string;
  readonly aura: string;
  readonly elemento: ElementId | null;
}

export const LUZ_PADRAO: SaudeLuz = { acento: '#d5b66f', aura: '#d5b66f', elemento: null };

export const SaudeLuzContext = createContext<SaudeLuz>(LUZ_PADRAO);
export const useSaudeLuz = () => useContext(SaudeLuzContext);

/**
 * The element a modality is painted in on its rune. Presentation only: a
 * colour for the eye, it changes no score and no element of any record.
 */
const ELEMENTO_DA_MODALIDADE: Partial<Record<WorkoutExerciseCategory, ElementId>> = {
  strength: 'terra',
  hypertrophy: 'terra',
  calisthenics: 'terra',
  running: 'ar',
  cycling: 'ar',
  swimming: 'agua',
  yoga: 'agua',
  mobility: 'agua',
  martial_arts: 'fogo',
  conditioning: 'fogo',
};

export const elementoDaModalidade = (categoria: WorkoutExerciseCategory | string | undefined): ElementId | undefined =>
  categoria ? ELEMENTO_DA_MODALIDADE[categoria as WorkoutExerciseCategory] : undefined;
