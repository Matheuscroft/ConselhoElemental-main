import type { UUIDv4, WorkoutExerciseInstance, WorkoutTemplate } from '../../src/types/workout.ts';
import { projectTemplateReward } from '../../src/lib/workout/native-reward-preview.ts';
import { projectWorkoutProgress } from '../../src/lib/workout/native-progress-reward.ts';
import { buildNativeCompletion } from '../../src/lib/core/native-action-completion.ts';

// Fixed, valid UUID fixtures; no real account or storage is used.
const exercise = {
  id: '00000000-0000-4000-8000-000000000001' as UUIDv4,
  exerciseId: '00000000-0000-4000-8000-000000000002' as UUIDv4,
  order: 0, exerciseNameSnapshot: 'Exercício de teste',
  sets: [{ id: '00000000-0000-4000-8000-000000000003' as UUIDv4,
    setNumber: 1, measureMode: 'reps', targetReps: 10, reps: 10, completed: true, loadFactor: 1 }],
} satisfies WorkoutExerciseInstance;
const template = { exercises: [exercise], effortLevel: 3, durationEstimateMode: 'manual', estimatedDurationMinutes: 120 } satisfies Pick<WorkoutTemplate, 'exercises' | 'effortLevel' | 'durationEstimateMode' | 'estimatedDurationMinutes'>;
const equal = (actual: number | undefined, expected: number) => {
  if (typeof actual !== 'number' || !Number.isFinite(actual) || Math.abs(actual - expected) > 1e-9) throw Error(`Expected ${expected}, received ${actual}`);
};

Deno.test('regra restaurada: ER × 0.10, esforço global e tempo de sessão no preview/check-in', () => {
  const preview = projectTemplateReward(template);
  const checkin = projectWorkoutProgress([exercise], 120, 3);
  equal(preview.totalER, 10); equal(preview.baseValue, 1);
  equal(preview.earthXp, 6.75); equal(checkin.earthXp, 6.75);
  equal(projectTemplateReward({ ...template, estimatedDurationMinutes: 5 }).earthXp, 2.7);
  // RPE individual é informativo na regra atual, sem redefinir esforço global.
  const withRpe = { ...exercise, sets: exercise.sets.map(set => ({ ...set, perceivedExertion: 10 })) };
  equal(projectWorkoutProgress([withRpe], 120, 3).earthXp, checkin.earthXp);
});

Deno.test('LIVE usa tempo medido e coincide com o recibo consolidado do Core', () => {
  const progress = projectWorkoutProgress([exercise], 120, 3, 90);
  equal(progress.baseValue, 1); equal(progress.earthXp, 1.95); equal(progress.durationSeconds, 90);
  const completion = buildNativeCompletion({ sessionId: '00000000-0000-4000-8000-000000000004',
    title: 'Sessão isolada', baseValue: progress.baseValue, durationSeconds: 90, effortLevel: 3,
    completedAt: '2026-10-23T12:00:00.000Z' }, 100);
  equal(completion.log.executedValue, progress.earthXp);
  equal(completion.log.pranaDeltaApplied, -15);
});

Deno.test('progresso vazio não atribui volume ou XP a séries não realizadas', () => {
  const pending = { ...exercise, sets: exercise.sets.map(set => ({ ...set, completed: false })) };
  const skipped = { ...exercise, sets: exercise.sets.map(set => ({ ...set, skipped: true })) };
  for (const item of [pending, skipped]) {
    const progress = projectWorkoutProgress([item], 120, 3, 90);
    equal(progress.totalER, 0); equal(progress.earthXp, 0);
  }
});
