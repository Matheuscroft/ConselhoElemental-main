import test from 'node:test';
import assert from 'node:assert/strict';
import { loadComponent } from '../elemental/load-component.mjs';

const { regioesDoExercicio, REGIAO_DO_MUSCULO } = loadComponent('src/lib/workout/exercise-muscles.ts');
const { REGIOES_MUSCULARES } = loadComponent('src/components/fitness-kit/figura-ilustracao.ts');
const { STRENGTH_TRAINING_EXERCISES } = loadComponent('src/constants/strength-training-exercises.ts');
const { CALISTENIA_EXERCISES } = loadComponent('src/constants/calistenia-exercises.ts');

test('toda região mapeada é uma região que a ilustração sabe acender', () => {
  for (const regiao of Object.values(REGIAO_DO_MUSCULO)) assert.ok(REGIOES_MUSCULARES.includes(regiao), regiao);
});

test('os músculos primários viram regiões, sem repetir', () => {
  assert.deepEqual(regioesDoExercicio({ primaryMuscles: ['chest', 'triceps', 'shoulders'] }), ['peitoral', 'triceps', 'ombros']);
  assert.deepEqual(regioesDoExercicio({ primaryMuscles: ['upper_back', 'lats'] }), ['costas']);
  assert.deepEqual(regioesDoExercicio({ primaryMuscles: ['core', 'obliques'] }), ['abdomen']);
});

test('sem músculos primários usa as fatias grandes da distribuição', () => {
  const ex = { muscleDistribution: [{ muscleId: 'quadriceps', percentage: 40 }, { muscleId: 'glutes', percentage: 30 }, { muscleId: 'calves', percentage: 10 }] };
  assert.deepEqual(regioesDoExercicio(ex), ['quadriceps', 'gluteos']);
  assert.deepEqual(regioesDoExercicio({}), []);
});

test('todo exercício de musculação e calistenia do catálogo acende ao menos uma região', () => {
  for (const ex of [...STRENGTH_TRAINING_EXERCISES, ...CALISTENIA_EXERCISES]) {
    assert.ok(regioesDoExercicio(ex).length >= 1 || !ex.primaryMuscles?.length, ex.name ?? ex.namePt);
  }
});
