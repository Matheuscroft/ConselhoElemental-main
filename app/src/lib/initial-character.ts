import type { User, OnboardingState } from '@/types';
import { AVATARS } from '@/constants';

/** Shared with the existing store: no account, storage, reward or network effects. */
export const createInitialUser = (): User => ({
  pranaLevel: 100,
  id: crypto.randomUUID(),
  name: 'Mago Iniciante',
  avatar: AVATARS[0],
  xp_fire: 0,
  xp_earth: 0,
  xp_water: 0,
  xp_air: 0,
  totalScore: 0,
  streak: 0,
  longestStreak: 0,
  joinedAt: new Date(),
});
export const createInitialOnboarding = (): OnboardingState => ({
  step: 0, selectedAreas: [], avatar: AVATARS[0], isComplete: false,
});
