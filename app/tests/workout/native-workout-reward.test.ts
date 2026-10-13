import {
  buildNativeWorkoutRewardBlocks,
  calculateNativeWorkoutReward,
  perceivedExertionToCoreLevel,
} from '../../src/lib/core/native-workout-reward.ts';

function assert(condition: unknown, message = 'assertion failed'): asserts condition {
  if (!condition) throw new Error(message);
}

Deno.test('soma apenas séries concluídas, exclui puladas e usa RPE por série', () => {
  const metrics = buildNativeWorkoutRewardBlocks([{ sets: [
    { completed: true, measureMode: 'reps', reps: 10, loadFactor: 1, perceivedExertion: 2 },
    { completed: true, measureMode: 'duration', durationSeconds: 60, loadFactor: 1.5, perceivedExertion: 8 },
    { completed: false, measureMode: 'reps', reps: 50, perceivedExertion: 10 },
    { completed: true, skipped: true, measureMode: 'duration', durationSeconds: 120, perceivedExertion: 10 },
  ] }], 3);

  assert(metrics.totalER === 55, `expected 55 ER, received ${metrics.totalER}`);
  assert(metrics.baseValue === 6.5, `expected 6.5 base value, received ${metrics.baseValue}`);
  assert(metrics.activeDurationSeconds === 100, `expected 100 active seconds, received ${metrics.activeDurationSeconds}`);
  assert(metrics.blocks.length === 2, `expected 2 reward blocks, received ${metrics.blocks.length}`);
  assert(metrics.blocks[0].effortLevel === 1 && metrics.blocks[1].effortLevel === 4, 'RPE should map independently to Core effort');
  assert(metrics.durationSource === 'MIXED_ACTIVE', 'mixed measured and estimated time should be labeled');
});

Deno.test('intensidade muda o prêmio e blocos concluídos adicionais somam contribuição', () => {
  const low = buildNativeWorkoutRewardBlocks([{ sets: [
    { completed: true, measureMode: 'duration', durationSeconds: 1800, perceivedExertion: 2 },
  ] }]);
  const high = buildNativeWorkoutRewardBlocks([{ sets: [
    { completed: true, measureMode: 'duration', durationSeconds: 1800, perceivedExertion: 8 },
  ] }]);
  const mixed = buildNativeWorkoutRewardBlocks([{ sets: [
    { completed: true, measureMode: 'duration', durationSeconds: 900, perceivedExertion: 2 },
    { completed: true, measureMode: 'duration', durationSeconds: 900, perceivedExertion: 8 },
  ] }]);

  const lowReward = calculateNativeWorkoutReward(low.blocks, low.activeDurationSeconds, 3);
  const highReward = calculateNativeWorkoutReward(high.blocks, high.activeDurationSeconds, 3);
  const mixedReward = calculateNativeWorkoutReward(mixed.blocks, mixed.activeDurationSeconds, 3);
  assert(lowReward.executedValue === 10, `expected low-effort cap 10, received ${lowReward.executedValue}`);
  assert(highReward.executedValue === 100, `expected high-effort cap 100, received ${highReward.executedValue}`);
  assert(mixedReward.executedValue === 110, `expected the two distinct effort blocks to sum to 110, received ${mixedReward.executedValue}`);
  assert(mixedReward.effortLevel === 3, `expected weighted Core effort 3, received ${mixedReward.effortLevel}`);
});

Deno.test('sem trabalho concluído não há pontos nem custo de Prana; invalid RPE is rejected', () => {
  const empty = buildNativeWorkoutRewardBlocks([{ sets: [
    { completed: false, measureMode: 'reps', reps: 10 },
  ] }], 3);
  const reward = calculateNativeWorkoutReward(empty.blocks, empty.activeDurationSeconds, 3);
  assert(reward.executedValue === 0 && reward.pranaCost === 0, 'empty session should grant/cost nothing');
  assert(perceivedExertionToCoreLevel(2) === 1 && perceivedExertionToCoreLevel(8) === 4, 'RPE conversion should stay deterministic');
  let rejected = false;
  try {
    buildNativeWorkoutRewardBlocks([{ sets: [{ completed: true, measureMode: 'reps', reps: 3, perceivedExertion: 11 }] }]);
  } catch { rejected = true; }
  assert(rejected, 'RPE above 10 must be rejected');
});

Deno.test('repetições e duração equivalente recebem mesma recompensa sem mudar ER canônico', () => {
  const reps = buildNativeWorkoutRewardBlocks([{sets: [{completed: true, measureMode: 'reps', reps: 10, perceivedExertion: 8}]}]);
  const timed = buildNativeWorkoutRewardBlocks([{sets: [{completed: true, measureMode: 'duration', durationSeconds: 40, perceivedExertion: 8}]}]);
  assert(reps.totalER === 10 && timed.totalER === 20, 'canonical ER must remain unchanged');
  assert(reps.baseValue === timed.baseValue, 'same active time and effort must use same scoring base');
  const reward = (m: typeof reps) => calculateNativeWorkoutReward(m.blocks, m.activeDurationSeconds).executedValue;
  assert(reward(reps) === reward(timed), 'equivalent strength/time blocks should score equally');
  const intense = buildNativeWorkoutRewardBlocks([{sets: [{completed: true, measureMode: 'reps', reps: 10, perceivedExertion: 10}]}]);
  assert(reward(intense) > reward(reps), 'observed effort should increase reward');
});
