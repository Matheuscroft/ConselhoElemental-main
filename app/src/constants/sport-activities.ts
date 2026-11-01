import type { MuscleContribution, WorkoutExercise, WorkoutExerciseCategory } from '@/types/workout';

/** Nomes usados no seletor de modalidade do editor de treino. */
export const MARTIAL_DISCIPLINES = [
  'Taekwondo', 'Jiu-jitsu', 'Judô', 'Karatê', 'Boxe', 'Muay Thai', 'Capoeira',
  'Kickboxing', 'Luta olímpica', 'Luta greco-romana', 'Sambo', 'Sanda', 'MMA',
  'Aikido', 'Kung fu / Wushu', 'Hapkido', 'Krav Maga', 'Savate', 'Pencak Silat',
  'Luta livre', 'Sumô', 'Kendo', 'Esgrima', 'Jiu-jitsu tradicional', 'Lethwei',
];

const legs: MuscleContribution[] = [{ muscleId: 'quadriceps', percentage: 30 }, { muscleId: 'glutes', percentage: 25 }, { muscleId: 'hamstrings', percentage: 20 }, { muscleId: 'calves', percentage: 15 }, { muscleId: 'core', percentage: 10 }];
const whole: MuscleContribution[] = [{ muscleId: 'core', percentage: 25 }, { muscleId: 'quadriceps', percentage: 20 }, { muscleId: 'glutes', percentage: 15 }, { muscleId: 'shoulders', percentage: 15 }, { muscleId: 'upper_back', percentage: 15 }, { muscleId: 'forearms', percentage: 10 }];
const arms: MuscleContribution[] = [{ muscleId: 'shoulders', percentage: 25 }, { muscleId: 'triceps', percentage: 20 }, { muscleId: 'upper_back', percentage: 20 }, { muscleId: 'core', percentage: 20 }, { muscleId: 'quadriceps', percentage: 15 }];
const swimCrawl: MuscleContribution[] = [{ muscleId: 'lats', percentage: 25 }, { muscleId: 'shoulders', percentage: 20 }, { muscleId: 'triceps', percentage: 15 }, { muscleId: 'core', percentage: 15 }, { muscleId: 'quadriceps', percentage: 15 }, { muscleId: 'glutes', percentage: 10 }];
const swimBreast: MuscleContribution[] = [{ muscleId: 'adductors', percentage: 25 }, { muscleId: 'quadriceps', percentage: 20 }, { muscleId: 'glutes', percentage: 15 }, { muscleId: 'chest', percentage: 15 }, { muscleId: 'lats', percentage: 15 }, { muscleId: 'core', percentage: 10 }];
const grappling: MuscleContribution[] = [{ muscleId: 'core', percentage: 25 }, { muscleId: 'upper_back', percentage: 20 }, { muscleId: 'forearms', percentage: 20 }, { muscleId: 'biceps', percentage: 15 }, { muscleId: 'glutes', percentage: 10 }, { muscleId: 'quadriceps', percentage: 10 }];
const kicking: MuscleContribution[] = [{ muscleId: 'quadriceps', percentage: 25 }, { muscleId: 'glutes', percentage: 20 }, { muscleId: 'hamstrings', percentage: 15 }, { muscleId: 'core', percentage: 25 }, { muscleId: 'calves', percentage: 10 }, { muscleId: 'shoulders', percentage: 5 }];

interface ActivityDefinition {
  id: string;
  name: string;
  category: WorkoutExerciseCategory;
  family: string;
  focus: string;
  equipment?: string[];
  variations?: string[];
  durationLabel?: string;
  defaultDurationSeconds?: number;
  instructions?: string[];
  muscles?: MuscleContribution[];
}

const activity = ({
  id, name, category, family, focus, equipment = [], variations = [], durationLabel = 'Registro livre por tempo',
  defaultDurationSeconds = 1800, instructions = [], muscles = [],
}: ActivityDefinition): WorkoutExercise => ({
  id: `sport-${id}`,
  name,
  category,
  family,
  source: 'native',
  level: 'custom',
  description: `${focus} Modelo para registrar uma atividade realizada; não é uma prescrição de treino.`,
  focus,
  durationLabel,
  equipment,
  instructions: [
    'Registre o tempo ativo realmente praticado; deixe pausas e intervalos fora do tempo ativo.',
    'Informe o esforço percebido de 1 a 10 e a distância, quando fizer sentido.',
    'Use as notas para registrar ritmo, percurso, técnica, rounds ou condições da sessão.',
    ...instructions,
  ],
  benefits: [],
  contraindications: [],
  variations,
  measureMode: 'duration',
  defaultSets: 1,
  defaultReps: 0,
  defaultDurationSeconds,
  defaultLoadKg: 0,
  loadMode: 'none',
  muscleDistribution: muscles,
});

const run = (id: string, name: string, focus: string, options: Partial<ActivityDefinition> = {}) => activity({
  id: `run-${id}`, name, category: 'running', family: options.family ?? 'Corrida', focus,
  equipment: options.equipment ?? ['Tênis de corrida'], muscles: legs, ...options,
});

/** Corrida: estilos de sessão, superfícies e formatos de prova como modelos de registro. */
const RUN_ACTIVITIES: WorkoutExercise[] = [
  run('continuous', 'Corrida contínua', 'Corrida em ritmo contínuo.', { durationLabel: 'Tempo ativo e distância' }),
  run('intervals', 'Corrida intervalada', 'Alternância de trechos rápidos e recuperação.', { variations: ['Intervalos por tempo', 'Intervalos por distância'] }),
  run('easy', 'Corrida leve / regenerativa', 'Rodagem confortável de recuperação.', { defaultDurationSeconds: 1500 }),
  run('long', 'Corrida longa', 'Rodagem contínua de maior duração.', { defaultDurationSeconds: 3600 }),
  run('tempo', 'Corrida de ritmo / tempo run', 'Trecho sustentado em ritmo forte controlado.'),
  run('fartlek', 'Fartlek', 'Variações livres de ritmo ao longo da corrida.'),
  run('progression', 'Corrida progressiva', 'Ritmo que aumenta gradualmente durante a sessão.'),
  run('hill-repeats', 'Tiros em subida', 'Repetições de corrida em subida com recuperação.'),
  run('hill-continuous', 'Corrida em percurso ondulado', 'Corrida em percurso com subidas e descidas.'),
  run('treadmill', 'Corrida na esteira', 'Corrida realizada em esteira.', { equipment: ['Esteira'] }),
  run('track', 'Corrida em pista', 'Corrida realizada em pista de atletismo.', { equipment: ['Pista de atletismo'] }),
  run('road', 'Corrida de rua', 'Corrida em vias pavimentadas.', { family: 'Corrida de rua' }),
  run('trail', 'Corrida em trilha (trail)', 'Corrida em trilhas e terrenos naturais.', { family: 'Corrida em trilha', equipment: ['Tênis de trilha'] }),
  run('cross-country', 'Cross-country', 'Corrida em percurso natural de grama, terra ou cascalho.', { family: 'Cross-country' }),
  run('mountain', 'Corrida de montanha', 'Corrida em terreno montanhoso e com variação de elevação.', { family: 'Corrida de montanha' }),
  run('ultra', 'Ultramaratona / ultratrail', 'Corrida de ultradistância; registre o tempo efetivamente ativo.', { family: 'Ultradistância', defaultDurationSeconds: 7200 }),
  run('run-walk', 'Corrida e caminhada', 'Sessão alternando corrida e caminhada.', { variations: ['Intervalos cronometrados', 'Alternância livre'] }),
  run('race', 'Prova / competição de corrida', 'Registro de uma prova ou evento de corrida.', { family: 'Prova', defaultDurationSeconds: 3600 }),
];

const swim = (id: string, name: string, focus: string, muscles: MuscleContribution[], options: Partial<ActivityDefinition> = {}) => activity({
  id: `swim-${id}`, name, category: 'swimming', family: options.family ?? 'Natação', focus,
  equipment: options.equipment ?? ['Piscina'], muscles, ...options,
});

/** Natação: quatro estilos, medley, águas abertas e modelos de técnica/equipamento. */
const SWIM_ACTIVITIES: WorkoutExercise[] = [
  swim('crawl', 'Nado crawl', 'Nado livre com braçada alternada e pernada.', swimCrawl, { durationLabel: 'Tempo ativo e metros' }),
  swim('breast', 'Nado peito', 'Nado com braçada e pernada simultâneas.', swimBreast),
  swim('back', 'Nado costas', 'Nado dorsal com braçada alternada.', whole),
  swim('butterfly', 'Nado borboleta', 'Nado com braçadas simultâneas e pernada ondulatória.', swimCrawl),
  swim('individual-medley', 'Medley individual', 'Sessão combinando borboleta, costas, peito e livre.', whole, { variations: ['Ordem completa', 'Treino técnico por estilos'] }),
  swim('freestyle', 'Série de nado livre', 'Série de nado livre; registre a distância e o tempo ativo.', swimCrawl),
  swim('open-water', 'Natação em águas abertas', 'Nado em mar, lago ou outro ambiente natural.', whole, { family: 'Águas abertas', equipment: ['Óculos', 'Touca de natação'], defaultDurationSeconds: 2400 }),
  swim('technique', 'Técnica de natação', 'Prática técnica de braçada, respiração, alinhamento e viradas.', whole, { family: 'Técnica', variations: ['Educativos de braçada', 'Respiração bilateral', 'Viradas'] }),
  swim('kickboard', 'Pernada com prancha', 'Prática de pernada com apoio de prancha.', legs, { family: 'Educativo', equipment: ['Prancha de natação'] }),
  swim('pull-buoy', 'Braçada com pull buoy', 'Prática de braçada com flutuador entre as pernas.', swimCrawl, { family: 'Educativo', equipment: ['Pull buoy'] }),
  swim('fins', 'Natação com nadadeiras', 'Série de nado com nadadeiras.', legs, { family: 'Equipamento', equipment: ['Nadadeiras'] }),
  swim('paddles', 'Natação com palmares', 'Série de braçada com palmares; registre a distância.', swimCrawl, { family: 'Equipamento', equipment: ['Palmares'] }),
  swim('intervals', 'Natação intervalada', 'Repetições de nado com pausas entre os trechos.', whole, { family: 'Formato de sessão' }),
  swim('endurance', 'Natação contínua / resistência', 'Nado contínuo focado em completar a sessão.', whole, { family: 'Formato de sessão', defaultDurationSeconds: 2400 }),
  swim('sprint', 'Tiros de natação', 'Trechos curtos de nado rápido com recuperação.', whole, { family: 'Formato de sessão' }),
  swim('recovery', 'Natação leve / recuperação', 'Nado leve e confortável.', whole, { family: 'Formato de sessão', defaultDurationSeconds: 1200 }),
];

const cycle = (id: string, name: string, focus: string, options: Partial<ActivityDefinition> = {}) => activity({
  id: `cycle-${id}`, name, category: 'cycling', family: options.family ?? 'Ciclismo', focus,
  equipment: options.equipment ?? ['Bicicleta'], muscles: legs, ...options,
});

/** Ciclismo: estrada, indoor e disciplinas/superfícies reconhecidas pela UCI. */
const CYCLING_ACTIVITIES: WorkoutExercise[] = [
  cycle('road', 'Pedalada ao ar livre', 'Pedalada em vias públicas ou estradas.', { durationLabel: 'Tempo ativo e distância' }),
  cycle('indoor', 'Bicicleta ergométrica', 'Pedalada em bicicleta estacionária.', { equipment: ['Bicicleta ergométrica'] }),
  cycle('road-endurance', 'Ciclismo de estrada — resistência', 'Pedalada de estrada contínua e de maior duração.', { defaultDurationSeconds: 3600 }),
  cycle('road-intervals', 'Ciclismo de estrada — intervalos', 'Trechos de intensidade alternados com recuperação.'),
  cycle('road-climbing', 'Ciclismo de estrada — subidas', 'Pedalada em percurso com subidas ou ganho de elevação.'),
  cycle('road-recovery', 'Pedalada leve / recuperação', 'Pedalada leve e confortável.', { defaultDurationSeconds: 1200 }),
  cycle('gravel', 'Ciclismo gravel', 'Pedalada em vias não pavimentadas e terrenos mistos.', { family: 'Gravel' }),
  cycle('mountain-xc', 'Mountain bike — cross-country', 'Pedalada de mountain bike em circuito ou trilha de cross-country.', { family: 'Mountain bike', equipment: ['Mountain bike'] }),
  cycle('mountain-trail', 'Mountain bike — trilha', 'Pedalada recreativa ou de treino em trilha.', { family: 'Mountain bike', equipment: ['Mountain bike'] }),
  cycle('mountain-enduro', 'Mountain bike — enduro', 'Sessão de mountain bike em trilhas com trechos variados.', { family: 'Mountain bike', equipment: ['Mountain bike'] }),
  cycle('mountain-downhill', 'Mountain bike — downhill', 'Descidas de mountain bike em pista ou trilha.', { family: 'Mountain bike', equipment: ['Mountain bike'] }),
  cycle('cyclocross', 'Ciclocross', 'Pedalada em circuito misto com obstáculos e trechos de terra.', { family: 'Ciclocross' }),
  cycle('track', 'Ciclismo de pista', 'Treino ou sessão em velódromo.', { family: 'Pista', equipment: ['Bicicleta de pista', 'Velódromo'] }),
  cycle('bmx-racing', 'BMX racing', 'Prática ou treino de corrida BMX em pista.', { family: 'BMX', equipment: ['Bicicleta BMX', 'Pista BMX'] }),
  cycle('bmx-freestyle', 'BMX freestyle', 'Prática de manobras e linhas de BMX freestyle.', { family: 'BMX', equipment: ['Bicicleta BMX', 'Pista ou skatepark'] }),
  cycle('trials', 'Bike trial', 'Prática de equilíbrio e transposição de obstáculos.', { family: 'Trial', equipment: ['Bicicleta de trial'] }),
  cycle('indoor-cycling-class', 'Aula de ciclismo indoor / spinning', 'Aula guiada de ciclismo estacionário.', { family: 'Indoor', equipment: ['Bicicleta de spinning'] }),
  cycle('smart-trainer', 'Treino em rolo / smart trainer', 'Pedalada em rolo ou treinador conectado.', { family: 'Indoor', equipment: ['Rolo ou smart trainer'] }),
  cycle('commute', 'Deslocamento de bicicleta', 'Pedalada como transporte ou deslocamento cotidiano.', { family: 'Mobilidade', defaultDurationSeconds: 1800 }),
  cycle('touring', 'Cicloturismo / passeio', 'Passeio ou viagem de bicicleta em ritmo próprio.', { family: 'Cicloturismo', defaultDurationSeconds: 3600 }),
  cycle('e-bike', 'Pedalada com bicicleta elétrica', 'Pedalada com assistência elétrica; registre distância e tempo.', { family: 'E-bike', equipment: ['Bicicleta elétrica'] }),
];

const LEGACY_DISCIPLINE_INDEX: Record<string, number> = {
  Taekwondo: 0, 'Jiu-jitsu': 1, Judô: 2, Karatê: 3, Boxe: 4, 'Muay Thai': 5, Capoeira: 6,
};
const GRAPPLING_DISCIPLINES = new Set(['Jiu-jitsu', 'Judô', 'Luta olímpica', 'Luta greco-romana', 'Sambo', 'Luta livre', 'Sumô', 'Jiu-jitsu tradicional']);
const STRIKING_DISCIPLINES = new Set(['Taekwondo', 'Karatê', 'Boxe', 'Muay Thai', 'Kickboxing', 'Sanda', 'MMA', 'Savate', 'Lethwei', 'Kung fu / Wushu', 'Pencak Silat', 'Krav Maga', 'Hapkido']);
const FORM_DISCIPLINES = new Set(['Taekwondo', 'Karatê', 'Capoeira', 'Aikido', 'Kung fu / Wushu', 'Hapkido', 'Pencak Silat', 'Kendo', 'Esgrima', 'Jiu-jitsu tradicional']);
const GRAPPLING_MUSCLES = new Set(['Jiu-jitsu', 'Judô', 'Luta olímpica', 'Luta greco-romana', 'Sambo', 'Luta livre', 'Sumô', 'Jiu-jitsu tradicional']);

const martialProfile = (discipline: string) => GRAPPLING_MUSCLES.has(discipline) ? grappling : STRIKING_DISCIPLINES.has(discipline) ? (discipline === 'Boxe' ? arms : kicking) : whole;
const martialSlug = (discipline: string) => discipline.toLocaleLowerCase('pt-BR')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const martialActivity = (discipline: string, format: string, label: string, focus: string, suffix?: string): WorkoutExercise => {
  const legacyIndex = LEGACY_DISCIPLINE_INDEX[discipline];
  const legacySuffix = suffix === 'technique' || suffix === 'rounds';
  const id = legacyIndex !== undefined && legacySuffix
    ? `martial-${legacyIndex}-${suffix}`
    : `martial-${martialSlug(discipline)}-${suffix ?? format}`;
  return activity({
    id, name: `${discipline} · ${label}`, category: 'martial_arts', family: discipline, focus,
    equipment: ['Registro livre; anote equipamentos usados'], muscles: martialProfile(discipline),
    defaultDurationSeconds: format === 'sparring' || format === 'rolling' ? 900 : 1800,
    durationLabel: 'Tempo ativo; rounds podem ser descritos nas notas',
    instructions: ['Informe se a prática foi sem contato, com contato controlado ou combate, conforme aplicável.'],
  });
};

const MARTIAL_ACTIVITIES: WorkoutExercise[] = MARTIAL_DISCIPLINES.flatMap((discipline) => {
  const entries = [
    martialActivity(discipline, 'technique', 'prática técnica', 'Treino técnico, fundamentos e combinações.', 'technique'),
    martialActivity(discipline, 'sparring', 'rounds / combate', 'Rounds, sparring ou combate conforme a modalidade.', 'rounds'),
  ];
  if (FORM_DISCIPLINES.has(discipline)) entries.push(martialActivity(discipline, 'forms', 'formas / kata / sequência', 'Prática de formas, kata, poomsae ou sequências técnicas.'));
  if (STRIKING_DISCIPLINES.has(discipline)) entries.push(martialActivity(discipline, 'pads', 'manoplas / saco / aparadores', 'Treino de golpes em manoplas, saco ou aparadores.'));
  if (GRAPPLING_DISCIPLINES.has(discipline)) entries.push(martialActivity(discipline, 'rolling', 'rolagem / luta de treino', 'Luta de treino, rolagem ou rounds de grappling.'));
  if (discipline === 'Capoeira') entries.push(martialActivity(discipline, 'roda', 'roda de capoeira', 'Prática em roda com jogo, música e movimentos da capoeira.'));
  if (discipline === 'Muay Thai') entries.push(martialActivity(discipline, 'wai-kru', 'Wai Kru / Ram Muay', 'Prática ritual e cultural de Wai Kru / Ram Muay.', 'wai-kru'));
  return entries;
});

export const SPORT_ACTIVITIES: WorkoutExercise[] = [
  ...RUN_ACTIVITIES,
  ...SWIM_ACTIVITIES,
  ...CYCLING_ACTIVITIES,
  ...MARTIAL_ACTIVITIES,
];
