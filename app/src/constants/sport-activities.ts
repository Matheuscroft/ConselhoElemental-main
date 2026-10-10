import type { MuscleContribution, WorkoutExercise, WorkoutExerciseCategory } from '@/types/workout';

export const MARTIAL_DISCIPLINES = ['Taekwondo', 'Jiu-jitsu', 'Judô', 'Karatê', 'Boxe', 'Muay Thai', 'Capoeira'];
const legs: MuscleContribution[] = [{muscleId:'quadriceps',percentage:30},{muscleId:'glutes',percentage:25},{muscleId:'hamstrings',percentage:20},{muscleId:'calves',percentage:15},{muscleId:'core',percentage:10}];
const whole: MuscleContribution[] = [{muscleId:'core',percentage:25},{muscleId:'quadriceps',percentage:20},{muscleId:'glutes',percentage:15},{muscleId:'shoulders',percentage:15},{muscleId:'upper_back',percentage:15},{muscleId:'forearms',percentage:10}];
const arms: MuscleContribution[] = [{muscleId:'shoulders',percentage:25},{muscleId:'triceps',percentage:20},{muscleId:'upper_back',percentage:20},{muscleId:'core',percentage:20},{muscleId:'quadriceps',percentage:15}];
const swimCrawl:MuscleContribution[]=[{muscleId:'lats',percentage:25},{muscleId:'shoulders',percentage:20},{muscleId:'triceps',percentage:15},{muscleId:'core',percentage:15},{muscleId:'quadriceps',percentage:15},{muscleId:'glutes',percentage:10}];
const swimBreast:MuscleContribution[]=[{muscleId:'adductors',percentage:25},{muscleId:'quadriceps',percentage:20},{muscleId:'glutes',percentage:15},{muscleId:'chest',percentage:15},{muscleId:'lats',percentage:15},{muscleId:'core',percentage:10}];
const grappling:MuscleContribution[]=[{muscleId:'core',percentage:25},{muscleId:'upper_back',percentage:20},{muscleId:'forearms',percentage:20},{muscleId:'biceps',percentage:15},{muscleId:'glutes',percentage:10},{muscleId:'quadriceps',percentage:10}];
const kicking:MuscleContribution[]=[{muscleId:'quadriceps',percentage:25},{muscleId:'glutes',percentage:20},{muscleId:'hamstrings',percentage:15},{muscleId:'core',percentage:25},{muscleId:'calves',percentage:10},{muscleId:'shoulders',percentage:5}];
const activity = (id:string,name:string,category:WorkoutExerciseCategory,family:string,muscles:MuscleContribution[]):WorkoutExercise => ({
 id:`sport-${id}`,name,category,family,source:'native',level:'custom',description:'Modelo para registrar uma atividade realizada. Não é uma prescrição de treino.',
 instructions:['Registre o tempo ativo realmente praticado, sem contar intervalos.','Informe o esforço percebido de 1 a 10 e descreva o que fez.','Conclua apenas os blocos que você realizou.'],
 benefits:[],contraindications:[],variations:[],measureMode:'duration',defaultSets:1,defaultReps:0,defaultDurationSeconds:600,defaultLoadKg:0,loadMode:'none',muscleDistribution:muscles,
});
export const SPORT_ACTIVITIES:WorkoutExercise[] = [
 activity('run-continuous','Corrida contínua','running','Corrida',legs),
 activity('run-intervals','Corrida intervalada','running','Corrida',legs),
 activity('swim-crawl','Nado crawl','swimming','Natação',swimCrawl),
 activity('swim-breast','Nado peito','swimming','Natação',swimBreast),
 activity('swim-back','Nado costas','swimming','Natação',whole),
 activity('cycle-road','Pedalada ao ar livre','cycling','Ciclismo',legs),
 activity('cycle-indoor','Bicicleta ergométrica','cycling','Ciclismo',legs),
 ...MARTIAL_DISCIPLINES.flatMap((discipline,index)=>[
  activity(`martial-${index}-technique`,`${discipline} · prática técnica`,'martial_arts',discipline,discipline==='Boxe'?arms:['Jiu-jitsu','Judô'].includes(discipline)?grappling:['Taekwondo','Karatê','Capoeira'].includes(discipline)?kicking:whole),
  activity(`martial-${index}-rounds`,`${discipline} · rounds / combate`,'martial_arts',discipline,discipline==='Boxe'?arms:['Jiu-jitsu','Judô'].includes(discipline)?grappling:['Taekwondo','Karatê','Capoeira'].includes(discipline)?kicking:whole),
 ]),
];
