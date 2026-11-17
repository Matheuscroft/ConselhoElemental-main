import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadComponent } from '../elemental/load-component.mjs';

const { CALISTENIA_EXERCISES } = loadComponent('src/constants/calistenia-exercises.ts');
const { STRENGTH_TRAINING_EXERCISES } = loadComponent('src/constants/strength-training-exercises.ts');
const { SPORT_ACTIVITIES } = loadComponent('src/constants/sport-activities.ts');
const { YOGA_POSES } = loadComponent('src/constants/yoga-poses.ts');
const { classificarMovimento, padraoDeMovimento, PADROES_RESERVADOS } = loadComponent('src/lib/workout/exercise-motion.ts');
const { PADROES, padraoExiste } = loadComponent('src/components/fitness-kit/figura-padroes.ts');

/**
 * O catálogo de 373 exercícios só existe montado dentro da store; aqui ele é
 * remontado dos mesmos dados puros, com o mesmo mapeamento (id, nome, categoria
 * e família) que `buildLegacyCatalog` usa em src/stores/workoutStore.ts.
 */
const catalogo = [
  ...YOGA_POSES.map((p) => ({ id: `yoga-${p.id}`, name: p.namePt, category: 'yoga', family: p.family })),
  ...CALISTENIA_EXERCISES.map((e) => ({ id: `calistenia-${e.id}`, name: e.namePt, category: 'calisthenics', family: e.category })),
  ...STRENGTH_TRAINING_EXERCISES,
  ...SPORT_ACTIVITIES,
];

test('o catálogo remontado tem os 373 exercícios', () => {
  assert.equal(catalogo.length, 373);
});

test('todo exercício tem padrão de movimento', () => {
  for (const ex of catalogo) {
    const id = padraoDeMovimento(ex);
    assert.equal(typeof id, 'string', ex.name);
    assert.ok(id.length > 0, ex.name);
  }
});

test('musculação e calistenia: o padrão existe no registro e nunca cai no genérico', () => {
  const forca = catalogo.filter((e) => ['strength', 'hypertrophy', 'calisthenics'].includes(e.category));
  assert.equal(forca.length, 70 + 124);
  const linhas = [];
  for (const ex of forca) {
    const { padrao, motivo } = classificarMovimento(ex);
    assert.ok(padraoExiste(padrao), `${ex.name} -> ${padrao} não existe no registro`);
    assert.notEqual(motivo, 'fallback', `${ex.name} caiu no fallback`);
    linhas.push(`${ex.category === 'calisthenics' ? 'cali' : 'musc'} | ${ex.name} | ${padrao} | ${motivo}`);
  }
  mkdirSync('docs/generated', { recursive: true });
  writeFileSync('docs/generated/exercicio-para-padrao.txt', `categoria | exercício | padrão | motivo\n${linhas.join('\n')}\n`);
});

test('todo padrão de força, corrida, ciclismo, natação e luta do registro é usado por algum exercício do catálogo, ou é variante de um usado', () => {
  const usados = new Set(catalogo.map((e) => padraoDeMovimento(e)));
  const orfaos = Object.keys(PADROES).filter((id) => !usados.has(id));
  assert.ok(orfaos.length < Object.keys(PADROES).length / 3, `muitos padrões sem uso: ${orfaos.join(', ')}`);
});

test('corrida, ciclismo, natação e artes marciais agora têm figura; só yoga e o personalizado sem match ficam sem', () => {
  const semFigura = catalogo.filter((e) => !padraoExiste(padraoDeMovimento(e)));
  assert.ok(semFigura.every((e) => e.category === 'yoga'), `sem figura fora da yoga: ${semFigura.filter((e) => e.category !== 'yoga').map((e) => e.name).join(', ')}`);
  for (const ex of catalogo) {
    const id = padraoDeMovimento(ex);
    assert.ok(padraoExiste(id) || PADROES_RESERVADOS.includes(id), `${ex.name} -> ${id} não existe nem é reservado`);
  }
  assert.deepEqual([...PADROES_RESERVADOS].sort(), ['generico', 'yoga']);
  assert.equal(padraoDeMovimento({ name: 'Qualquer', category: 'mixed' }), 'generico');
  assert.equal(padraoDeMovimento({ name: 'Meu exercício', category: 'strength', source: 'custom' }), 'generico');
});

test('artes marciais: golpe, agarre, forma e esgrima vão ao padrão certo', () => {
  const alvo = (nome, familia) => padraoDeMovimento({ name: nome, family: familia, category: 'martial_arts' });
  assert.equal(alvo('Boxe · prática técnica', 'Boxe'), 'luta-soco');
  assert.equal(alvo('Lethwei · rounds / combate', 'Lethwei'), 'luta-soco');
  assert.equal(alvo('Taekwondo · prática técnica', 'Taekwondo'), 'luta-chute');
  assert.equal(alvo('Capoeira · roda de capoeira', 'Capoeira'), 'luta-chute');
  assert.equal(alvo('Savate · rounds / combate', 'Savate'), 'luta-chute');
  assert.equal(alvo('Jiu-jitsu · rolagem / luta de treino', 'Jiu-jitsu'), 'luta-solo');
  assert.equal(alvo('Judô · rounds / combate', 'Judô'), 'luta-solo');
  assert.equal(alvo('Sumô · prática técnica', 'Sumô'), 'luta-solo');
  assert.equal(alvo('Aikido · prática técnica', 'Aikido'), 'luta-solo');
  assert.equal(alvo('Karatê · formas / kata / sequência', 'Karatê'), 'luta-forma');
  assert.equal(alvo('Kendo · prática técnica', 'Kendo'), 'luta-forma');
  assert.equal(alvo('Esgrima · rounds / combate', 'Esgrima'), 'luta-forma');
});

test('a tabela completa exercício -> padrão é gravada para revisão', () => {
  const linhas = catalogo.map((ex) => {
    const { padrao, motivo } = classificarMovimento(ex);
    return `${ex.category} | ${ex.name} | ${padrao} | ${motivo}`;
  });
  mkdirSync('docs/generated', { recursive: true });
  writeFileSync('docs/generated/exercicio-para-padrao-completo.txt', `categoria | exercício | padrão | motivo\n${linhas.join('\n')}\n`);
  assert.equal(linhas.length, 373);
});
