import { CALISTENIA_MUSCLE_PROFILES } from './calistenia-muscles';
import type { MuscleGroupId } from '@/types/workout';

export type CalisteniaExercise = {
  primaryMuscles?: MuscleGroupId[];
  secondaryMuscles?: MuscleGroupId[];
  id: string;
  namePt: string;
  category: string;
  focus: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  measureMode?: 'reps' | 'duration';
  defaultSets?: number;
  defaultReps?: number;
  defaultDurationSeconds?: number;
  benefits: string[];
  technique: string[];
  breathing: string;
  contraindications?: string[];
  duration?: string;
  variations?: string[];
};

const CALISTENIA_EXERCISE_DEFINITIONS: CalisteniaExercise[] = [
  {
    id: 'incline-push-up',
    namePt: 'Flexão Inclinada',
    category: 'Empurrar',
    focus: 'peitoral, tríceps e base técnica',
    level: 'Iniciante',
    benefits: [
      'Desenvolve força de empurrar com menor carga inicial',
      'Fortalece peitoral, ombros e tríceps',
      'Melhora estabilidade de escápulas e core',
      'Prepara para progressões de flexão no solo',
    ],
    technique: [
      'Mãos apoiadas em superfície elevada e estável',
      'Corpo em linha reta da cabeça aos calcanhares',
      'Cotovelos descendo em ângulo confortável',
      'Empurre o chão mantendo abdômen ativo',
    ],
    breathing: 'Inspire ao descer, expire ao empurrar para cima.',
    duration: '3-4 séries de 8-15 repetições',
    variations: ['Flexão na parede', 'Flexão no banco', 'Flexão tradicional'],
  },
  {
    id: 'push-up',
    namePt: 'Flexão Tradicional',
    category: 'Empurrar',
    focus: 'força de empurrar horizontal',
    level: 'Intermediário',
    benefits: [
      'Fortalece peitoral, deltoide anterior e tríceps',
      'Aprimora estabilidade de core e cintura escapular',
      'Melhora controle corporal global',
      'Serve de base para variações avançadas',
    ],
    technique: [
      'Mãos abaixo dos ombros com dedos ativos',
      'Coluna neutra e glúteos contraídos',
      'Desça com controle sem colapsar lombar',
      'Empurre o solo até extensão confortável dos braços',
    ],
    breathing: 'Inspire na fase excêntrica e expire na concêntrica.',
    duration: '3-5 séries de 6-12 repetições',
    variations: ['Flexão diamante', 'Flexão arqueiro', 'Pseudo planche push-up'],
  },
  {
    id: 'pike-push-up',
    namePt: 'Flexão Pike',
    category: 'Empurrar',
    focus: 'ombros e transição para empurrar vertical',
    level: 'Intermediário',
    benefits: [
      'Fortalece deltoides e tríceps',
      'Prepara para handstand push-up',
      'Desenvolve consciência de alinhamento overhead',
      'Aumenta resistência de ombros',
    ],
    technique: [
      'Quadris elevados formando um V invertido',
      'Mãos firmes no chão e ombros ativos',
      'Leve a cabeça em direção ao solo entre as mãos',
      'Empurre para cima mantendo controle escapular',
    ],
    breathing: 'Inspire ao descer e expire ao retornar.',
    duration: '3-4 séries de 5-10 repetições',
    contraindications: ['Dor aguda no ombro', 'Lesão cervical não reabilitada'],
    variations: ['Pike com pés elevados', 'Negativa de HSPU'],
  },
  {
    id: 'australian-row',
    namePt: 'Remada Australiana',
    category: 'Puxar',
    focus: 'costas, bíceps e retração escapular',
    level: 'Iniciante',
    benefits: [
      'Fortalece dorsais e romboides',
      'Melhora postura e controle escapular',
      'Constrói base para barra fixa',
      'Trabalha pegada com segurança',
    ],
    technique: [
      'Corpo alinhado em prancha sob barra baixa',
      'Puxe o peito em direção à barra',
      'Cotovelos próximos ao tronco',
      'Desça com controle sem perder tensão',
    ],
    breathing: 'Expire ao puxar, inspire ao retornar.',
    duration: '3-5 séries de 8-15 repetições',
    variations: ['Com joelhos flexionados', 'Com pés elevados', 'Pegada supinada'],
  },
  {
    id: 'pull-up',
    namePt: 'Barra Fixa',
    category: 'Puxar',
    focus: 'puxada vertical e força relativa',
    level: 'Intermediário',
    benefits: [
      'Fortalece dorsais, bíceps e antebraços',
      'Aumenta força de tração vertical',
      'Desenvolve pegada e controle do tronco',
      'Melhora composição corporal funcional',
    ],
    technique: [
      'Pendure-se com ombros ativos e core firme',
      'Inicie com depressão escapular',
      'Puxe até queixo ultrapassar a barra',
      'Desça de forma controlada até extensão total',
    ],
    breathing: 'Expire durante a subida, inspire na descida.',
    duration: '4-6 séries de 3-8 repetições',
    contraindications: ['Tendinite aguda em cotovelo/ombro'],
    variations: ['Barra com elástico', 'Chin-up', 'Barra com pausa isométrica'],
  },
  {
    id: 'bodyweight-squat',
    namePt: 'Agachamento Livre',
    category: 'Pernas',
    focus: 'força de pernas e padrão de joelho',
    level: 'Iniciante',
    benefits: [
      'Fortalece quadríceps, glúteos e adutores',
      'Melhora mobilidade de quadril e tornozelos',
      'Desenvolve coordenação e controle postural',
      'Base para progressões unilaterais',
    ],
    technique: [
      'Pés na largura confortável e coluna neutra',
      'Desça mantendo joelhos alinhados com os pés',
      'Distribua o peso no médio-pé',
      'Suba empurrando o chão com estabilidade',
    ],
    breathing: 'Inspire ao descer e expire na subida.',
    duration: '3-5 séries de 12-20 repetições',
    variations: ['Agachamento com pausa', 'Agachamento salto', 'Pistol squat progressão'],
  },
  {
    id: 'walking-lunge',
    namePt: 'Avanço Caminhando',
    category: 'Pernas',
    focus: 'força unilateral e estabilidade',
    level: 'Intermediário',
    benefits: [
      'Corrige assimetrias entre pernas',
      'Fortalece glúteos e quadríceps',
      'Melhora equilíbrio dinâmico',
      'Aprimora estabilidade de quadril',
    ],
    technique: [
      'Dê um passo longo e controlado',
      'Joelho da frente alinhado ao tornozelo',
      'Desça o joelho de trás sem colidir no chão',
      'Empurre com a perna da frente para avançar',
    ],
    breathing: 'Mantenha respiração ritmada, expirando na subida.',
    duration: '3-4 séries de 8-12 repetições por perna',
    variations: ['Avanço reverso', 'Avanço com pausa', 'Avanço explosivo'],
  },
  {
    id: 'hollow-body-hold',
    namePt: 'Hollow Body Hold',
    category: 'Core',
    focus: 'anti-extensão e rigidez do tronco',
    level: 'Iniciante',
    benefits: [
      'Fortalece abdômen profundo',
      'Melhora transferência de força para movimentos compostos',
      'Protege lombar em exercícios dinâmicos',
      'Base para skills de ginástica',
    ],
    technique: [
      'Lombar pressionada no chão',
      'Braços e pernas elevados conforme capacidade',
      'Costelas para baixo e abdômen ativo',
      'Sustente sem perder alinhamento',
    ],
    breathing: 'Respiração curta e controlada, sem perder tensão.',
    duration: '3-5 séries de 20-40 segundos',
    contraindications: ['Dor lombar sem avaliação profissional'],
    variations: ['Tuck hollow', 'Hollow rocks', 'Hollow completo'],
  },
  {
    id: 'plank',
    namePt: 'Prancha Frontal',
    category: 'Core',
    focus: 'estabilidade global e resistência isométrica',
    level: 'Iniciante',
    benefits: [
      'Fortalece core, ombros e glúteos',
      'Melhora postura e resistência isométrica',
      'Aumenta consciência corporal',
      'Apoia prevenção de dor lombar',
    ],
    technique: [
      'Antebraços no chão e cotovelos sob ombros',
      'Corpo alinhado em linha reta',
      'Abdômen e glúteos contraídos',
      'Evite elevar ou afundar quadril',
    ],
    breathing: 'Respire de forma contínua mantendo o brace abdominal.',
    duration: '3-5 séries de 30-90 segundos',
    variations: ['Prancha com alcance', 'Prancha RKC', 'Prancha com carga'],
  },
  {
    id: 'hanging-knee-raise',
    namePt: 'Elevação de Joelhos na Barra',
    category: 'Core',
    focus: 'flexão de quadril e controle abdominal',
    level: 'Intermediário',
    benefits: [
      'Fortalece abdômen inferior e flexores de quadril',
      'Melhora controle pélvico',
      'Desenvolve pegada e estabilidade de ombros',
      'Prepara para elevação de pernas',
    ],
    technique: [
      'Pendure-se com escápulas ativas',
      'Eleve os joelhos sem balançar o tronco',
      'Controle a descida mantendo tensão',
      'Evite usar impulso excessivo',
    ],
    breathing: 'Expire ao elevar joelhos e inspire ao descer.',
    duration: '3-4 séries de 8-15 repetições',
    contraindications: ['Dor aguda no ombro ou cotovelo'],
    variations: ['Knee raise com pausa', 'Leg raise parcial', 'Toes to bar progressão'],
  },
  {
    id: 'l-sit-tuck',
    namePt: 'L-Sit (Progressão Tuck)',
    category: 'Isometrias e Skills',
    focus: 'compressão de core e força de ombros',
    level: 'Intermediário',
    benefits: [
      'Fortalece core e flexores de quadril',
      'Melhora suporte de ombros',
      'Desenvolve coordenação para skills avançadas',
      'Aprimora consciência de linha corporal',
    ],
    technique: [
      'Apoie mãos em paralelas ou blocos',
      'Empurre o chão e eleve quadris',
      'Mantenha joelhos recolhidos (tuck) inicialmente',
      'Progrida para extensão gradual das pernas',
    ],
    breathing: 'Respire curto e controlado durante a sustentação.',
    duration: '4-6 séries de 10-25 segundos',
    contraindications: ['Dor em punho sem adaptação de apoio'],
    variations: ['Tuck hold', 'One-leg L-sit', 'L-sit completo'],
  },
  {
    id: 'burpee-controlled',
    namePt: 'Burpee Controlado',
    category: 'Condicionamento',
    focus: 'capacidade cardiorrespiratória e corpo inteiro',
    level: 'Intermediário',
    benefits: [
      'Aumenta condicionamento metabólico',
      'Integra empurrar, agachar e estabilizar',
      'Melhora resistência geral',
      'Eleva gasto energético',
    ],
    technique: [
      'Agache com coluna neutra',
      'Leve pés para trás com controle',
      'Execute flexão opcional conforme nível',
      'Retorne e estenda quadris com postura firme',
    ],
    breathing: 'Mantenha ritmo respiratório constante sem apneia.',
    duration: '6-12 minutos em blocos (ex: EMOM ou intervalado)',
    contraindications: ['Condição cardíaca sem liberação médica'],
    variations: ['Burpee sem salto', 'Burpee com salto', 'Burpee lateral'],
  },
{
  "id": "diamond-push-up",
  "namePt": "Flexão Diamante",
  "category": "Empurrar",
  "focus": "tríceps e porção interna do peitoral",
  "level": "Intermediário",
  "benefits": [
    "Forte hipertrofia e ganho de força no tríceps",
    "Reduz a carga sobre os ombros em comparação com a flexão aberta",
    "Aumenta a força de bloqueio dos cotovelos"
  ],
  "technique": [
    "Mãos juntas formando um diamante (ou triângulo) com indicadores e polegares",
    "Corpo em linha reta",
    "Desça até o peito tocar (ou quase tocar) as mãos",
    "Mantenha os cotovelos próximos ao corpo, não os deixe abrir excessivamente"
  ],
  "breathing": "Inspire ao descer, expire empurrando com força.",
  "contraindications": [
    "Dores nos punhos ou epicondilite (cotovelo)"
  ],
  "duration": "3-4 séries de 8-12 repetições",
  "variations": [
    "Flexão diamante com joelhos (iniciante)",
    "Flexão diamante declinada (avançado)"
  ]
},
{
  "id": "dips",
  "namePt": "Mergulho nas Paralelas",
  "category": "Empurrar",
  "focus": "peitoral inferior, tríceps e ombros frontais",
  "level": "Intermediário",
  "benefits": [
    "Um dos maiores construtores de massa muscular para a parte superior",
    "Exige grande estabilização do core e ombros",
    "Prepara articulações para movimentos mais complexos (ex: Muscle-up)"
  ],
  "technique": [
    "Apoie-se nas barras paralelas com os braços esticados",
    "Incline o tronco levemente para frente (foca mais no peito) ou fique reto (foca no tríceps)",
    "Desça controladamente até os ombros passarem a linha dos cotovelos (ângulo de 90º)",
    "Empurre de volta à posição inicial travando os cotovelos"
  ],
  "breathing": "Inspire profundamente na descida, expire na subida.",
  "contraindications": [
    "Lesões no manguito rotador ou dores nos ombros"
  ],
  "duration": "3-5 séries de 5-10 repetições",
  "variations": [
    "Mergulho no banco (iniciante)",
    "Mergulho com peso extra (avançado)"
  ]
},
{
  "id": "chin-up",
  "namePt": "Barra Fixa Supinada (Chin-up)",
  "category": "Puxar",
  "focus": "bíceps e dorsais",
  "level": "Intermediário",
  "benefits": [
    "O melhor exercício de peso corporal para o bíceps",
    "Desenvolve a espessura das costas",
    "Mais fácil de progredir inicialmente do que a barra pronada"
  ],
  "technique": [
    "Segure a barra com as palmas viradas para você, largura dos ombros",
    "Inicie pendurado (dead hang) com ombros relaxados",
    "Puxe o corpo para cima até o queixo passar da barra",
    "Desça de forma controlada até esticar os braços totalmente"
  ],
  "breathing": "Expire ao puxar, inspire controlando a descida.",
  "contraindications": [
    "Tendinite crônica no cotovelo"
  ],
  "duration": "3-4 séries de 5-10 repetições",
  "variations": [
    "Isometria no topo (iniciante)",
    "Pull-up pronado (intermediário)"
  ]
},
{
  "id": "muscle-up-transition",
  "namePt": "Transição para Muscle-Up",
  "category": "Puxar",
  "focus": "explosão dorsal e técnica de transição",
  "level": "Avançado",
  "benefits": [
    "Treina a potência de puxada (High Pull-up)",
    "Prepara os pulsos e ombros para a subida acima da barra",
    "Conecta movimentos de puxar com empurrar"
  ],
  "technique": [
    "Use uma pegada falsa ou pegada forte e profunda na barra",
    "Faça um leve balanço (kip) ou puxe de forma estrita e explosiva",
    "Puxe a barra em direção ao abdômen/peito inferior, não em direção ao queixo",
    "Pratique o giro dos cotovelos por cima da barra"
  ],
  "breathing": "Inspire antes de puxar, expire no momento explosivo.",
  "contraindications": [
    "Falta de base sólida (mínimo de 10 barras estritas necessárias antes de tentar)"
  ],
  "duration": "4-5 séries de 3-5 repetições",
  "variations": [
    "Muscle-up com elástico",
    "High pull-ups"
  ]
},
{
  "id": "bulgarian-split-squat",
  "namePt": "Agachamento Búlgaro",
  "category": "Pernas",
  "focus": "quadríceps, glúteos e estabilidade",
  "level": "Intermediário",
  "benefits": [
    "Trabalho unilateral intenso que corrige assimetrias",
    "Exige e desenvolve extremo equilíbrio",
    "Gera alta hipertrofia nas pernas sem necessidade de barra pesada nas costas"
  ],
  "technique": [
    "Em pé, apoie o peito de um dos pés num banco ou cadeira atrás de você",
    "Dê um passo à frente com a outra perna",
    "Desça flexionando o joelho da frente até a coxa ficar paralela ao chão",
    "Mantenha o peito estufado e o joelho da frente alinhado com o pé"
  ],
  "breathing": "Inspire descendo, expire subindo.",
  "contraindications": [
    "Problemas de joelho não reabilitados"
  ],
  "duration": "3-4 séries de 8-15 repetições (cada perna)",
  "variations": [
    "Passada/Avanço (iniciante)",
    "Búlgaro com salto (avançado)"
  ]
},
{
  "id": "pistol-squat",
  "namePt": "Agachamento Pistol",
  "category": "Pernas",
  "focus": "força unilateral extrema, mobilidade de tornozelo",
  "level": "Avançado",
  "benefits": [
    "Demonstração máxima de controle corporal e força nas pernas",
    "Exige grande flexibilidade do quadril e tornozelo",
    "Ativa intensamente o core para não cair para trás"
  ],
  "technique": [
    "Fique em um pé só, esticando a outra perna reta para frente",
    "Estique os braços para frente para fazer contrapeso",
    "Desça controladamente o máximo possível (até encostar a coxa na panturrilha)",
    "Empurre o chão com o pé inteiro para voltar à posição inicial"
  ],
  "breathing": "Inspire fundo e segure a pressão no abdômen ao descer, expire subindo.",
  "contraindications": [
    "Falta de mobilidade ou dores patelares (joelho)"
  ],
  "duration": "3-5 séries de 3-8 repetições (cada perna)",
  "variations": [
    "Pistol apoiado em um batente (iniciante)",
    "Pistol descendo até um banco (intermediário)"
  ]
},
{
  "id": "glute-bridge",
  "namePt": "Elevação Pélvica",
  "category": "Pernas",
  "focus": "glúteos, posteriores de coxa e lombar",
  "level": "Iniciante",
  "benefits": [
    "Fortalece os glúteos, essenciais para a postura",
    "Alivia tensões na lombar fortalecendo a cadeia posterior",
    "Fácil execução para todos os níveis"
  ],
  "technique": [
    "Deite de costas com os joelhos dobrados e pés no chão, perto dos glúteos",
    "Aperte o abdômen e empurre o chão com os calcanhares",
    "Eleve os quadris até o corpo formar uma linha reta dos ombros aos joelhos",
    "Contraia os glúteos no topo por 2 segundos e desça"
  ],
  "breathing": "Inspire embaixo, expire empurrando para cima.",
  "contraindications": [],
  "duration": "3-4 séries de 15-20 repetições",
  "variations": [
    "Elevação pélvica unilateral (intermediário)",
    "Elevação pélvica com peso (intermediário)"
  ]
},
{
  "id": "v-up",
  "namePt": "Abdominal Canivete (V-Up)",
  "category": "Core",
  "focus": "abdômen completo (reto e inferior)",
  "level": "Intermediário",
  "benefits": [
    "Trabalha a parte superior e inferior do abdômen simultaneamente",
    "Desenvolve coordenação explosiva",
    "Fortalece os flexores do quadril"
  ],
  "technique": [
    "Deite de costas com pernas esticadas e braços estendidos acima da cabeça",
    "Suba o tronco e as pernas ao mesmo tempo, formando um V com o corpo",
    "Tente tocar os pés com as mãos no topo do movimento",
    "Desça de forma controlada sem deixar os pés despencarem no chão"
  ],
  "breathing": "Expire forte ao subir fechando o V, inspire controlando a descida.",
  "contraindications": [
    "Lombalgia severa (dores agudas na lombar)"
  ],
  "duration": "3-4 séries de 10-20 repetições",
  "variations": [
    "Canivete alternado (iniciante)",
    "Tuck-up abraçando os joelhos (iniciante)"
  ]
},
{
  "id": "dragon-flag",
  "namePt": "Dragon Flag",
  "category": "Isometrias e Skills",
  "focus": "força extrema do core",
  "level": "Avançado",
  "benefits": [
    "Movimento icônico (popularizado por Bruce Lee)",
    "Recruta o abdômen inteiro como um bloco de concreto",
    "Constrói imensa estabilidade na coluna"
  ],
  "technique": [
    "Deite num banco e segure firmemente atrás da cabeça",
    "Eleve as pernas e o tronco até ficar apoiado apenas pela parte superior das costas/ombros",
    "O corpo deve ser uma linha reta sólida dos ombros aos pés",
    "Desça o corpo inteiro lentamente sem dobrar o quadril (fase excêntrica)"
  ],
  "breathing": "Inspire e trave o abdômen no topo, expire controladamente no final da descida.",
  "contraindications": [
    "Fraqueza na lombar ou falta de força abdominal básica"
  ],
  "duration": "3-5 séries de 3-6 descidas (excêntricas) ou isometria de 10-20s",
  "variations": [
    "Dragon flag com joelhos encolhidos (intermediário)",
    "Descidas lentas - Negativas (intermediário)"
  ],
  "measureMode": "reps",
  "defaultSets": 4,
  "defaultReps": 5
},
];

export const CALISTENIA_EXERCISES: CalisteniaExercise[] = CALISTENIA_EXERCISE_DEFINITIONS.map((exercise) => ({
  ...exercise, ...CALISTENIA_MUSCLE_PROFILES[exercise.id],
}));

export const CALISTENIA_GROUP_ORDER = [
  'Empurrar',
  'Puxar',
  'Pernas',
  'Core',
  'Isometrias e Skills',
  'Condicionamento',
] as const;

export const getCalisteniaExerciseById = (id: string): CalisteniaExercise | undefined => {
  return CALISTENIA_EXERCISES.find((exercise) => exercise.id === id);
};
