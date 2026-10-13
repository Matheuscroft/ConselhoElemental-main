export interface NativeWorkoutRewardBlock {
  baseValue: number;
  effortLevel: number;
}

export interface NativeWorkoutSetInput {
  completed: boolean;
  skipped?: boolean;
  measureMode: 'reps' | 'duration';
  reps?: number;
  durationSeconds?: number;
  loadFactor?: number;
  perceivedExertion?: number;
}

export interface NativeWorkoutExerciseInput {
  sets: NativeWorkoutSetInput[];
}

const effortRules: Record<number, { multiplier: number; cap: number; pranaCost: number }> = {
  1: { multiplier: 1, cap: 10, pranaCost: 5 },
  2: { multiplier: 1.2, cap: 25, pranaCost: 10 },
  3: { multiplier: 1.5, cap: 50, pranaCost: 15 },
  4: { multiplier: 2, cap: 100, pranaCost: 25 },
  5: { multiplier: 2.8, cap: 200, pranaCost: 35 },
};

export const perceivedExertionToCoreLevel = (value: number) => Math.max(1, Math.min(5, Math.round(value / 2)));
export const coreLevelToDefaultPerceivedExertion = (value: number) => Math.max(1, Math.min(5, value)) * 2 - 1;

const round = (value: number) => Number(value.toFixed(10));

/** Converts only completed Native sets into Core scoring blocks and active time. */
export function buildNativeWorkoutRewardBlocks(
  exercises: NativeWorkoutExerciseInput[],
  fallbackEffortLevel = 1,
  baseValuePerER = 0.1,
) {
  if (!Number.isInteger(fallbackEffortLevel) || fallbackEffortLevel < 1 || fallbackEffortLevel > 5) {
    throw new Error('O esforço padrão deve ser um inteiro entre 1 e 5.');
  }
  if (!Number.isFinite(baseValuePerER) || baseValuePerER <= 0) throw new Error('A conversão de ER deve ser positiva.');

  const blocks: NativeWorkoutRewardBlock[] = [];
  let totalER = 0;
  let activeDurationSeconds = 0;
  let measuredBlocks = 0;
  let estimatedBlocks = 0;
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      if (!set.completed || set.skipped) continue;
      const amount = set.measureMode === 'reps' ? set.reps ?? 0 : set.durationSeconds ?? 0;
      if (!Number.isFinite(amount) || amount <= 0) continue;
      const loadFactor = set.loadFactor ?? 1;
      const er = (set.measureMode === 'reps' ? amount : amount / 2) * loadFactor;
      const rpe = set.perceivedExertion;
      if (rpe !== undefined && (!Number.isInteger(rpe) || rpe < 1 || rpe > 10)) {
        throw new Error('O esforço percebido deve ser um inteiro entre 1 e 10.');
      }
      const effortLevel = rpe === undefined ? fallbackEffortLevel : perceivedExertionToCoreLevel(rpe);
      // Repetições usam 4 s de atividade estimada; a mesma duração temporizada
      // deve ter a mesma base de jogo. ER canônico permanece inalterado.
      const baseValue = round(er * baseValuePerER * (set.measureMode === 'reps' ? 2 : 1));
      totalER += er;
      if (set.measureMode === 'duration') {
        activeDurationSeconds += amount;
        measuredBlocks += 1;
      } else {
        activeDurationSeconds += amount * 4;
        estimatedBlocks += 1;
      }
      blocks.push({ baseValue, effortLevel });
    }
  }
  totalER = round(totalER);
  activeDurationSeconds = Math.round(activeDurationSeconds);
  const durationSource: 'MEASURED' | 'ESTIMATED_ACTIVE' | 'MIXED_ACTIVE' = measuredBlocks && estimatedBlocks ? 'MIXED_ACTIVE' : estimatedBlocks ? 'ESTIMATED_ACTIVE' : 'MEASURED';
  return {
    blocks,
    totalER,
    baseValue: round(blocks.reduce((sum, block) => sum + block.baseValue, 0)),
    activeDurationSeconds,
    durationSource,
  };
}

/** Core scores each completed block, applying time/presence once to the whole session. */
export function calculateNativeWorkoutReward(
  blocks: NativeWorkoutRewardBlock[],
  durationSeconds: number,
  fallbackEffortLevel = 1,
  preview = false,
) {
  if (!Number.isFinite(durationSeconds) || durationSeconds < 0) throw new Error('Duração inválida.');
  if (!Number.isInteger(fallbackEffortLevel) || fallbackEffortLevel < 1 || fallbackEffortLevel > 5) {
    throw new Error('O esforço padrão deve ser um inteiro entre 1 e 5.');
  }
  for (const block of blocks) {
    if (!Number.isFinite(block.baseValue) || block.baseValue < 0 || !Number.isInteger(block.effortLevel) || !effortRules[block.effortLevel]) {
      throw new Error('Bloco de recompensa inválido.');
    }
  }

  const totalBaseValue = round(blocks.reduce((sum, block) => sum + block.baseValue, 0));
  const weights = blocks.map((block) => block.baseValue);
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const effortLevel = weightTotal > 0
    ? Math.max(1, Math.min(5, Math.round(blocks.reduce((sum, block) => sum + block.effortLevel * block.baseValue, 0) / weightTotal)))
    : fallbackEffortLevel;
  const minutes = durationSeconds / 60;
  const presence = preview ? 0.5 : minutes < 0.5 ? 0 : minutes < 1 ? 0.1 : minutes < 2 ? 0.3 : 0.5;
  const timeMultiplier = minutes < 5 ? 1 : minutes < 16 ? 1.2 : minutes < 31 ? 1.5 : minutes < 61 ? 2 : minutes < 91 ? 2.5 : minutes <= 120 ? 3 : 4;
  const scored = blocks.map((block) => {
    const rule = effortRules[block.effortLevel];
    const raw = block.baseValue * (1 + presence) * rule.multiplier * timeMultiplier;
    return { raw, executed: Math.min(raw, rule.cap), cap: rule.cap };
  });
  const rawValue = round(scored.reduce((sum, block) => sum + block.raw, 0));
  const executedValue = round(scored.reduce((sum, block) => sum + block.executed, 0));
  const effortCap = scored.reduce((sum, block) => sum + block.cap, 0);
  const rules = effortRules[effortLevel];
  const effortMultiplier = weightTotal > 0
    ? blocks.reduce((sum, block) => sum + effortRules[block.effortLevel].multiplier * block.baseValue, 0) / weightTotal
    : rules.multiplier;
  return {
    totalBaseValue, rawValue, executedValue, effortCap, effortLevel,
    timeMultiplier, presenceMultiplier: 1 + presence, effortMultiplier,
    pranaCost: blocks.length ? rules.pranaCost : 0,
  };
}
