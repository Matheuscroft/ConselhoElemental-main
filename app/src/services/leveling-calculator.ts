import type { ElementId, MasteryTitle } from '@/types';

export const LEVELING_RULESET_VERSION = 'provisional-v1';
export const BASE_XP = 100;
export const EXPONENT = 1.15;

const BRACKETS: Array<{ min: number; max: number; title: MasteryTitle; multiplier: number }> = [
  { min: 1, max: 9, title: 'Iniciado', multiplier: 1 },
  { min: 10, max: 24, title: 'Aprendiz', multiplier: 1.2 },
  { min: 25, max: 49, title: 'Adepto', multiplier: 1.5 },
  { min: 50, max: 74, title: 'Especialista', multiplier: 2 },
  { min: 75, max: 99, title: 'Mestre', multiplier: 2.5 },
  { min: 100, max: 149, title: 'Grão-Mestre', multiplier: 3.5 },
  { min: 150, max: 199, title: 'Ancião', multiplier: 5 },
  { min: 200, max: Number.POSITIVE_INFINITY, title: 'Lenda', multiplier: 8 },
];

export interface LevelProgress { level: number; title: MasteryTitle; xpTotal: number; xpAtLevelStart: number; xpToNextLevel: number; progressFraction: number }
const bracketFor = (level: number) => BRACKETS.find((bracket) => level >= bracket.min && level <= bracket.max) ?? BRACKETS[0];
const xpForNextLevel = (level: number): number => Math.max(1, Math.ceil(BASE_XP * Math.pow(level, EXPONENT) * bracketFor(level + 1).multiplier));

export class LevelingCalculatorService {
  static calculate(rawXp: number): LevelProgress {
    const xpTotal = Math.max(0, Math.floor(Number.isFinite(rawXp) ? rawXp : 0));
    let remaining = xpTotal; let level = 1; let xpAtLevelStart = 0; let xpToNextLevel = xpForNextLevel(level);
    while (remaining >= xpToNextLevel) { remaining -= xpToNextLevel; xpAtLevelStart += xpToNextLevel; level += 1; xpToNextLevel = xpForNextLevel(level); }
    return { level, title: bracketFor(level).title, xpTotal, xpAtLevelStart, xpToNextLevel, progressFraction: remaining / xpToNextLevel };
  }
  static calculateAvatar(user: Pick<Record<`xp_${ElementId}`, number>, `xp_${ElementId}`>): LevelProgress {
    return this.calculate(user.xp_fire + user.xp_earth + user.xp_water + user.xp_air);
  }
}
