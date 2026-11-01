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

type AdditionalCalisthenicsExercise = Omit<CalisteniaExercise, 'benefits' | 'technique' | 'breathing'> & {
  benefits?: string[];
  technique: string[];
  breathing?: string;
};

const additionalExercise = (exercise: AdditionalCalisthenicsExercise): CalisteniaExercise => ({
  ...exercise,
  benefits: exercise.benefits ?? ['Desenvolve força e controle corporal na variação escolhida.', 'Pode ser ajustado por amplitude, apoio, ritmo ou duração.'],
  breathing: exercise.breathing ?? 'Respire continuamente e mantenha o controle do movimento.',
});

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
  // Empurrar — progressões e ênfases distintas da flexão tradicional.
  additionalExercise({
    id: 'wall-push-up', namePt: 'Flexão na Parede', category: 'Empurrar', focus: 'peitoral, tríceps e progressão inicial de empurrar', level: 'Iniciante',
    duration: '2-4 séries de 8-15 repetições', defaultSets: 3, defaultReps: 10,
    technique: ['Fique de frente para uma parede e apoie as mãos um pouco além da largura dos ombros.', 'Mantenha o corpo alinhado e flexione os cotovelos levando o peito em direção à parede.', 'Empurre a parede para voltar; afaste os pés para aumentar gradualmente a dificuldade.'],
    variations: ['Flexão em bancada alta', 'Flexão inclinada', 'Flexão na parede com pausa'],
  }),
  additionalExercise({
    id: 'knee-push-up', namePt: 'Flexão com Joelhos', category: 'Empurrar', focus: 'peitoral e tríceps com alavanca reduzida', level: 'Iniciante',
    duration: '2-4 séries de 6-15 repetições', defaultSets: 3, defaultReps: 8,
    technique: ['Apoie mãos e joelhos no solo, com mãos pouco além dos ombros.', 'Alinhe cabeça, quadris e joelhos; evite dobrar o quadril para trás.', 'Desça o peito entre as mãos e empurre o solo para retornar.'],
    variations: ['Flexão inclinada', 'Flexão tradicional', 'Flexão com joelhos e pausa'],
  }),
  additionalExercise({
    id: 'decline-push-up', namePt: 'Flexão Declinada', category: 'Empurrar', focus: 'ênfase em ombros e porção superior do peitoral', level: 'Avançado',
    duration: '3-4 séries de 5-12 repetições', defaultSets: 3, defaultReps: 6,
    technique: ['Apoie os pés em uma superfície firme e as mãos no chão.', 'Mantenha o tronco firme e desça o peito com controle.', 'Empurre sem deixar a lombar afundar; ajuste a altura dos pés à sua capacidade.'],
    contraindications: ['Interrompa se houver dor aguda no ombro ou punho.'], variations: ['Flexão tradicional', 'Flexão com pés em apoio baixo', 'Flexão pike'],
  }),
  additionalExercise({
    id: 'eccentric-push-up', namePt: 'Flexão Negativa (Descida Controlada)', category: 'Empurrar', focus: 'controle excêntrico de peitoral e tríceps', level: 'Iniciante', measureMode: 'reps',
    duration: '3-5 séries de 3-8 descidas lentas', defaultSets: 3, defaultReps: 5,
    technique: ['Comece na posição alta de flexão, com o corpo em linha.', 'Desça lentamente por cerca de 3-5 segundos, mantendo cotovelos e tronco controlados.', 'Apoie os joelhos para retornar ao início e repita a descida sem pressa.'],
    variations: ['Negativa com joelhos', 'Flexão inclinada', 'Flexão tradicional'],
  }),
  additionalExercise({
    id: 'tempo-push-up', namePt: 'Flexão Tradicional com Descida Lenta', category: 'Empurrar', focus: 'flexão tradicional com ênfase em tempo sob tensão', level: 'Intermediário',
    duration: '3-4 séries de 5-12 repetições; descida de 3-5 segundos', defaultSets: 3, defaultReps: 8,
    technique: ['Assuma a posição de flexão tradicional com tronco e pernas alinhados.', 'Desça em 3-5 segundos sem perder a linha do corpo.', 'Empurre de volta com controle; cada ciclo completo conta como uma repetição.'],
    variations: ['Flexão com pausa no fundo', 'Flexão tradicional', 'Flexão com joelhos e descida lenta'],
  }),
  additionalExercise({
    id: 'pause-push-up', namePt: 'Flexão com Pausa no Fundo', category: 'Empurrar', focus: 'força e controle no ponto inferior da flexão', level: 'Intermediário',
    duration: '3-4 séries de 5-12 repetições com pausa', defaultSets: 3, defaultReps: 8,
    technique: ['Desça como na flexão tradicional mantendo o corpo alinhado.', 'Faça uma pausa breve perto do solo sem relaxar o tronco.', 'Empurre para cima sem quicar ou perder a posição das escápulas.'],
    variations: ['Flexão com pausa elevada', 'Flexão negativa', 'Flexão tradicional'],
  }),
  additionalExercise({
    id: 'wide-push-up', namePt: 'Flexão com Pegada Aberta', category: 'Empurrar', focus: 'peitoral em flexão horizontal com mãos mais afastadas', level: 'Intermediário',
    duration: '3-4 séries de 6-12 repetições', defaultSets: 3, defaultReps: 8,
    technique: ['Posicione as mãos mais afastadas que na flexão tradicional, dentro de uma amplitude confortável.', 'Desça o peito entre as mãos mantendo punhos e cotovelos confortáveis.', 'Empurre sem deixar os cotovelos abrirem além do que consegue controlar.'],
    contraindications: ['Reduza a abertura se causar desconforto no ombro ou punho.'], variations: ['Flexão tradicional', 'Flexão inclinada', 'Flexão com pausa'],
  }),
  additionalExercise({
    id: 'close-grip-push-up', namePt: 'Flexão com Pegada Fechada', category: 'Empurrar', focus: 'tríceps e peitoral em apoio estreito', level: 'Intermediário',
    duration: '3-4 séries de 5-12 repetições', defaultSets: 3, defaultReps: 8,
    technique: ['Apoie as mãos pouco mais estreitas que os ombros, sem exigir que se toquem.', 'Mantenha os cotovelos próximos ao tronco durante a descida.', 'Empurre o solo estendendo os braços sem travar com força os cotovelos.'],
    variations: ['Flexão diamante', 'Flexão com joelhos', 'Flexão tradicional'],
  }),
  additionalExercise({
    id: 'scapular-push-up', namePt: 'Flexão Escapular', category: 'Empurrar', focus: 'controle da cintura escapular e serrátil anterior', level: 'Iniciante',
    duration: '2-4 séries de 8-15 repetições', defaultSets: 3, defaultReps: 10,
    technique: ['Comece em prancha alta com cotovelos estendidos.', 'Sem dobrar os braços, deixe o peito aproximar-se do solo e depois empurre o chão afastando as escápulas.', 'Mantenha abdômen firme e amplitude pequena, controlada.'],
    variations: ['Flexão escapular inclinada', 'Prancha com protração escapular'],
  }),
  additionalExercise({
    id: 'archer-push-up', namePt: 'Flexão Arqueiro', category: 'Empurrar', focus: 'empurrar unilateral assistido e estabilidade do tronco', level: 'Avançado',
    duration: '3-4 séries de 3-8 repetições por lado', defaultSets: 3, defaultReps: 5,
    technique: ['Abra as mãos além dos ombros e mantenha uma delas sob o ombro que irá flexionar.', 'Desloque o tronco para esse lado enquanto o outro braço permanece mais estendido.', 'Retorne ao centro e alterne os lados com amplitude que consiga controlar.'],
    variations: ['Flexão arqueiro inclinada', 'Flexão tradicional', 'Flexão unilateral assistida'],
  }),
  additionalExercise({
    id: 'jump-push-up', namePt: 'Flexão Explosiva', category: 'Empurrar', focus: 'potência de empurrar', level: 'Avançado',
    duration: '3-5 séries de 3-8 repetições', defaultSets: 3, defaultReps: 5,
    technique: ['Use uma variação de flexão que consiga executar com alinhamento.', 'Empurre com intenção rápida o suficiente para as mãos perderem contato com o solo, se isso for confortável.', 'Aterrisse com cotovelos levemente flexionados e encerre a série quando a aterrissagem perder controle.'],
    contraindications: ['Evite se houver dor no punho, ombro ou cotovelo.'], variations: ['Flexão rápida sem tirar as mãos do solo', 'Flexão com joelhos explosiva'],
  }),
  // Puxar — pegadas, posições escapulares e progressões isométricas/excêntricas.
  additionalExercise({
    id: 'neutral-grip-pull-up', namePt: 'Barra Fixa com Pegada Neutra', category: 'Puxar', focus: 'dorsais, costas superiores e flexores do cotovelo', level: 'Intermediário',
    duration: '3-5 séries de 3-10 repetições', defaultSets: 4, defaultReps: 5,
    technique: ['Use barras paralelas ou alças que permitam manter as palmas uma de frente para a outra.', 'Inicie em suspensão controlada e mova os ombros para baixo antes de dobrar os cotovelos.', 'Puxe até o queixo passar das mãos e desça com controle até estender os braços.'],
    contraindications: ['Interrompa se houver dor aguda no ombro ou cotovelo.'], variations: ['Barra fixa pronada', 'Chin-up', 'Barra neutra com elástico'],
  }),
  additionalExercise({
    id: 'scapular-pull-up', namePt: 'Elevação Escapular na Barra', category: 'Puxar', focus: 'depressão escapular e início da puxada vertical', level: 'Iniciante',
    duration: '2-4 séries de 6-12 repetições', defaultSets: 3, defaultReps: 8,
    technique: ['Pendure-se na barra com braços estendidos e pegada confortável.', 'Sem dobrar os cotovelos, afaste os ombros das orelhas e eleve levemente o corpo.', 'Retorne devagar à posição inicial; não transforme o movimento em uma barra completa.'],
    contraindications: ['Faça com apoio dos pés ou assistência se a suspensão sem apoio causar dor.'], variations: ['Elevação escapular com pés apoiados', 'Suspensão ativa'],
  }),
  additionalExercise({
    id: 'dead-hang', namePt: 'Suspensão Passiva na Barra (Dead Hang)', category: 'Isometrias e Skills', focus: 'pegada e tolerância à posição de suspensão', level: 'Iniciante', measureMode: 'duration',
    duration: '2-4 séries de 10-40 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 20,
    technique: ['Segure uma barra firme e deixe os braços estendidos.', 'Mantenha o corpo estável e os ombros em uma posição confortável, sem forçar amplitude.', 'Desça com apoio seguro antes de soltar as mãos.'],
    contraindications: ['Evite suspensão sem apoio se houver dor ou limitação no ombro ou na pegada.'], variations: ['Suspensão com pés apoiados', 'Suspensão ativa'],
  }),
  additionalExercise({
    id: 'active-hang', namePt: 'Suspensão Ativa na Barra', category: 'Isometrias e Skills', focus: 'estabilidade escapular e pegada em suspensão', level: 'Iniciante', measureMode: 'duration',
    duration: '2-4 séries de 10-30 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 15,
    technique: ['Comece pendurado com braços estendidos.', 'Ative os ombros afastando-os das orelhas e mantendo o tronco firme.', 'Sustente a posição sem dobrar os cotovelos; retorne ao apoio antes de soltar.'],
    contraindications: ['Reduza a duração ou use apoio se a posição provocar dor.'], variations: ['Suspensão passiva', 'Elevação escapular na barra'],
  }),
  additionalExercise({
    id: 'scapular-hang-hold', namePt: 'Isometria de Depressão Escapular na Barra', category: 'Isometrias e Skills', focus: 'sustentação escapular na fase inicial da puxada', level: 'Iniciante', measureMode: 'duration',
    duration: '2-4 séries de 8-20 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 12,
    technique: ['Inicie em suspensão com braços estendidos.', 'Afaste os ombros das orelhas sem dobrar os cotovelos.', 'Mantenha a tensão pelo tempo escolhido e relaxe com apoio seguro.'],
    variations: ['Suspensão ativa', 'Elevação escapular na barra'],
  }),
  additionalExercise({
    id: 'chin-up-top-hold', namePt: 'Isometria no Topo do Chin-up', category: 'Isometrias e Skills', focus: 'sustentação no topo da puxada supinada', level: 'Intermediário', measureMode: 'duration',
    duration: '3-5 séries de 5-20 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 10,
    technique: ['Use um degrau ou apoio para chegar à posição alta sem saltar.', 'Mantenha o queixo acima da barra, cotovelos flexionados e tronco firme.', 'Desça com apoio ou controle; não solte de uma vez ao terminar o tempo.'],
    contraindications: ['Use apoio para entrar e sair da posição; pare se houver dor no cotovelo ou ombro.'], variations: ['Isometria em ângulo médio', 'Negativa de chin-up', 'Chin-up com elástico'],
  }),
  additionalExercise({
    id: 'flexed-arm-hang', namePt: 'Isometria com Braços Flexionados', category: 'Isometrias e Skills', focus: 'sustentação isométrica de puxada', level: 'Intermediário', measureMode: 'duration',
    duration: '3-5 séries de 5-20 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 10,
    technique: ['Com apoio, posicione-se com cotovelos flexionados e queixo próximo da barra.', 'Sustente a posição sem encolher excessivamente os ombros.', 'Use apoio para descer com segurança ao completar a série.'],
    variations: ['Isometria no topo do chin-up', 'Suspensão ativa'],
  }),
  additionalExercise({
    id: 'negative-pull-up', namePt: 'Barra Fixa Negativa (Descida Controlada)', category: 'Puxar', focus: 'fase excêntrica da puxada pronada', level: 'Intermediário', measureMode: 'reps',
    duration: '3-5 séries de 2-6 descidas de 3-8 segundos', defaultSets: 4, defaultReps: 3,
    technique: ['Use um apoio para iniciar com o queixo acima da barra.', 'Desça lentamente até estender os braços, mantendo controle e evitando queda livre.', 'Cada descida completa conta como uma repetição; retorne ao topo usando apoio.'],
    contraindications: ['Não salte para a posição alta nem solte o corpo rapidamente no final.'], variations: ['Negativa de chin-up', 'Barra fixa com elástico', 'Isometria no topo'],
  }),
  additionalExercise({
    id: 'negative-chin-up', namePt: 'Chin-up Negativo (Descida Supinada)', category: 'Puxar', focus: 'fase excêntrica da puxada supinada', level: 'Intermediário', measureMode: 'reps',
    duration: '3-5 séries de 2-6 descidas de 3-8 segundos', defaultSets: 4, defaultReps: 3,
    technique: ['Use apoio para começar com o queixo acima da barra e palmas voltadas para você.', 'Desça de forma contínua e controlada até os braços estenderem.', 'Suba novamente com apoio, sem saltar para alcançar a posição inicial.'],
    contraindications: ['Reduza a duração ou use elástico se perder o controle da descida.'], variations: ['Barra fixa supinada', 'Isometria no topo do chin-up'],
  }),
  additionalExercise({
    id: 'chest-to-bar-pull-up', namePt: 'Barra Fixa Peito à Barra', category: 'Puxar', focus: 'puxada vertical de maior amplitude e potência', level: 'Avançado',
    duration: '3-5 séries de 2-8 repetições', defaultSets: 4, defaultReps: 4,
    technique: ['Inicie em suspensão controlada com pegada pronada.', 'Puxe com intenção de aproximar a parte alta do peito da barra, mantendo o tronco firme.', 'Desça sob controle antes de iniciar a repetição seguinte.'],
    contraindications: ['Exige domínio de barras; interrompa diante de dor no ombro ou cotovelo.'], variations: ['Barra fixa estrita', 'Barra com elástico', 'Barra explosiva'],
  }),
  additionalExercise({
    id: 'assisted-pull-up', namePt: 'Barra Fixa com Elástico', category: 'Puxar', focus: 'progressão assistida de puxada vertical', level: 'Iniciante',
    duration: '3-5 séries de 4-10 repetições', defaultSets: 4, defaultReps: 6,
    technique: ['Prenda um elástico próprio para treino em uma barra segura e confira sua fixação.', 'Apoie o pé ou joelho conforme o elástico e inicie com ombros controlados.', 'Puxe até o queixo passar da barra e retorne devagar; escolha uma assistência estável.'],
    contraindications: ['Inspecione o elástico e não fique diretamente na linha de retorno caso ele escape.'], variations: ['Barra com pés apoiados', 'Remada australiana', 'Negativa de barra'],
  }),
  additionalExercise({
    id: 'scapular-australian-row', namePt: 'Remada Australiana Escapular', category: 'Puxar', focus: 'retração escapular com braços estendidos', level: 'Iniciante',
    duration: '2-4 séries de 8-15 repetições', defaultSets: 3, defaultReps: 10,
    technique: ['Posicione-se sob uma barra baixa com braços estendidos e corpo alinhado.', 'Aproxime as escápulas para elevar o peito levemente sem dobrar os cotovelos.', 'Retorne com controle; ajuste a dificuldade dobrando os joelhos.'],
    variations: ['Remada australiana com joelhos flexionados', 'Remada australiana tradicional'],
  }),
  // Pernas e tornozelos — variações de base, amplitude e apoio.
  additionalExercise({
    id: 'sumo-squat', namePt: 'Agachamento Sumô', category: 'Pernas', focus: 'glúteos, adutores e quadríceps em base ampla', level: 'Iniciante',
    duration: '3-5 séries de 10-20 repetições', defaultSets: 3, defaultReps: 12,
    technique: ['Adote uma base mais ampla que os ombros e aponte os pés levemente para fora.', 'Desça entre as pernas mantendo joelhos acompanhando a direção dos pés.', 'Suba empurrando o chão sem deixar os joelhos colapsarem para dentro.'],
    variations: ['Agachamento sumô com pausa', 'Agachamento livre', 'Agachamento sumô com amplitude reduzida'],
  }),
  additionalExercise({
    id: 'step-calf-raise', namePt: 'Panturrilha no Step', category: 'Pernas', focus: 'flexão plantar da panturrilha com amplitude ampliada', level: 'Iniciante',
    duration: '3-5 séries de 10-20 repetições', defaultSets: 4, defaultReps: 12,
    technique: ['Apoie a parte da frente dos pés em um step firme e segure em apoio estável.', 'Desça os calcanhares apenas até uma amplitude confortável.', 'Eleve os calcanhares e faça uma pausa breve no alto, sem quicar.'],
    contraindications: ['Use apoio e evite amplitude dolorosa no tornozelo ou tendão de Aquiles.'], variations: ['Panturrilha no chão', 'Panturrilha unilateral no step'],
  }),
  additionalExercise({
    id: 'single-leg-step-calf-raise', namePt: 'Panturrilha Unilateral no Step', category: 'Pernas', focus: 'panturrilha unilateral com amplitude ampliada', level: 'Intermediário',
    duration: '3-4 séries de 8-15 repetições por lado', defaultSets: 3, defaultReps: 10,
    technique: ['Apoie o antepé de uma perna em um step e segure em apoio estável.', 'Desça o calcanhar com controle e eleve o corpo usando essa perna.', 'Complete as repetições de um lado antes de trocar.'],
    contraindications: ['Faça primeiro a versão bilateral se o equilíbrio ou tornozelo limitar o movimento.'], variations: ['Panturrilha bilateral no step', 'Panturrilha unilateral no chão'],
  }),
  additionalExercise({
    id: 'tibialis-raise-wall', namePt: 'Elevação de Ponta dos Pés na Parede', category: 'Pernas', focus: 'dorsiflexores do tornozelo e tibial anterior', level: 'Iniciante',
    duration: '2-4 séries de 12-20 repetições', defaultSets: 3, defaultReps: 15,
    technique: ['Encoste as costas na parede e avance os pés alguns centímetros.', 'Mantenha os calcanhares apoiados e eleve as pontas dos pés em direção às canelas.', 'Desça devagar sem deixar os pés baterem no chão.'],
    variations: ['Elevação alternada dos pés', 'Elevação de ponta dos pés sentado'],
  }),
  additionalExercise({
    id: 'reverse-lunge', namePt: 'Avanço Reverso', category: 'Pernas', focus: 'quadríceps e glúteos em padrão unilateral', level: 'Iniciante',
    duration: '3-4 séries de 8-12 repetições por perna', defaultSets: 3, defaultReps: 10,
    technique: ['Dê um passo para trás mantendo o pé da frente completamente apoiado.', 'Flexione as pernas até uma amplitude confortável com tronco estável.', 'Empurre o chão com a perna da frente para retornar; alterne os lados.'],
    variations: ['Avanço caminhando', 'Avanço reverso com pausa', 'Agachamento dividido'],
  }),
  additionalExercise({
    id: 'lateral-lunge', namePt: 'Avanço Lateral', category: 'Pernas', focus: 'quadríceps, glúteos e adutores em deslocamento lateral', level: 'Intermediário',
    duration: '3-4 séries de 6-10 repetições por lado', defaultSets: 3, defaultReps: 8,
    technique: ['Afaste os pés e transfira o quadril para um lado, flexionando essa perna.', 'Mantenha a outra perna mais estendida e o pé inteiro apoiado.', 'Empurre o chão para retornar ao centro e repita para o outro lado.'],
    variations: ['Agachamento lateral curto', 'Avanço lateral alternado'],
  }),
  additionalExercise({
    id: 'wall-sit', namePt: 'Isometria na Parede (Wall Sit)', category: 'Isometrias e Skills', focus: 'sustentação isométrica de quadríceps e glúteos', level: 'Iniciante', measureMode: 'duration',
    duration: '2-5 séries de 15-60 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 30,
    technique: ['Encoste as costas na parede e posicione os pés à frente.', 'Deslize até uma altura que consiga sustentar com conforto e mantenha os joelhos alinhados aos pés.', 'Empurre com os pés e use a parede para voltar a ficar em pé.'],
    contraindications: ['Ajuste a altura se provocar dor no joelho.'], variations: ['Wall sit mais alto', 'Wall sit com uma perna assistida'],
  }),
  additionalExercise({
    id: 'tempo-squat', namePt: 'Agachamento Livre com Descida Lenta', category: 'Pernas', focus: 'controle excêntrico de quadríceps e glúteos', level: 'Iniciante',
    duration: '3-4 séries de 8-15 repetições; descida de 3-5 segundos', defaultSets: 3, defaultReps: 10,
    technique: ['Use a base confortável do agachamento livre.', 'Desça em 3-5 segundos mantendo os pés apoiados e joelhos alinhados.', 'Suba com controle; conte uma repetição após completar todo o movimento.'],
    variations: ['Agachamento com pausa', 'Agachamento sumô com descida lenta'],
  }),
  additionalExercise({
    id: 'jump-squat', namePt: 'Agachamento com Salto', category: 'Condicionamento', focus: 'potência de pernas e aterrissagem', level: 'Intermediário',
    duration: '3-5 séries de 4-10 repetições', defaultSets: 3, defaultReps: 6,
    technique: ['Desça em um agachamento curto e controlado.', 'Salte verticalmente e aterrisse suavemente com joelhos alinhados.', 'Reinicie cada repetição após estabilizar a aterrissagem.'],
    contraindications: ['Prefira o agachamento livre sem salto se houver dor ou desconforto articular.'], variations: ['Agachamento livre', 'Agachamento com elevação de calcanhar'],
  }),
  // Core e habilidades de sustentação.
  additionalExercise({
    id: 'side-plank', namePt: 'Prancha Lateral', category: 'Core', focus: 'estabilidade lateral do tronco e quadril', level: 'Iniciante', measureMode: 'duration',
    duration: '2-4 séries de 15-45 segundos por lado', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 20,
    technique: ['Apoie o antebraço sob o ombro e alinhe o corpo de lado.', 'Eleve o quadril sem girar o tronco e mantenha respiração contínua.', 'Apoie os joelhos para reduzir a alavanca se necessário.'],
    variations: ['Prancha lateral com joelhos apoiados', 'Prancha lateral com elevação de perna'],
  }),
  additionalExercise({
    id: 'dead-bug', namePt: 'Dead Bug', category: 'Core', focus: 'estabilidade anti-extensão do tronco', level: 'Iniciante',
    duration: '2-4 séries de 6-12 repetições por lado', defaultSets: 3, defaultReps: 8,
    technique: ['Deite de costas com quadris e joelhos flexionados e braços apontando para cima.', 'Mantenha a lombar confortável contra o solo enquanto estende braço e perna opostos.', 'Retorne e alterne os lados sem acelerar ou perder o controle.'],
    variations: ['Toque de calcanhar alternado', 'Dead bug com amplitude reduzida'],
  }),
  additionalExercise({
    id: 'reverse-crunch', namePt: 'Abdominal Reverso', category: 'Core', focus: 'flexão controlada do tronco e retroversão pélvica', level: 'Iniciante',
    duration: '3-4 séries de 8-15 repetições', defaultSets: 3, defaultReps: 10,
    technique: ['Deite de costas com joelhos flexionados e abdômen ativo.', 'Aproxime os joelhos do tronco elevando discretamente o quadril.', 'Desça devagar sem usar balanço para iniciar a repetição seguinte.'],
    variations: ['Elevação de joelhos deitado', 'Elevação de joelhos na barra'],
  }),
  additionalExercise({
    id: 'crunch', namePt: 'Abdominal Curto (Crunch)', category: 'Core', focus: 'flexão curta do tronco para aproximar costelas e pelve', level: 'Iniciante',
    duration: '2-4 séries de 10-20 repetições', defaultSets: 3, defaultReps: 12,
    technique: ['Deite de costas com joelhos dobrados e pés apoiados no chão.', 'Contraia o abdômen e eleve apenas cabeça e parte superior das costas, sem transformar o movimento em um abdominal completo.', 'Desça devagar até apoiar as escápulas; mantenha o pescoço relaxado e não puxe a cabeça com as mãos.'],
    contraindications: ['Reduza a amplitude ou interrompa se houver dor no pescoço ou lombar.'], variations: ['Crunch com braços cruzados', 'Crunch com alcance à frente', 'Abdominal completo (sit-up)'],
  }),
  additionalExercise({
    id: 'toe-touch-crunch', namePt: 'Abdominal Toque nos Tornozelos', category: 'Core', focus: 'flexão do tronco com pernas elevadas e alcance aos pés', level: 'Iniciante',
    duration: '2-4 séries de 8-15 repetições', defaultSets: 3, defaultReps: 10,
    technique: ['Deite de costas e eleve as pernas, mantendo joelhos estendidos ou levemente flexionados.', 'Eleve as escápulas e alcance as mãos na direção dos tornozelos; não balance as pernas.', 'Retorne o tronco com controle mantendo as pernas estáveis.'],
    contraindications: ['Flexione levemente os joelhos se houver tensão desconfortável atrás das pernas ou na lombar.'], variations: ['Canivete V-Up', 'Crunch com joelhos flexionados'],
  }),
  additionalExercise({
    id: 'bicycle-crunch', namePt: 'Abdominal Bicicleta', category: 'Core', focus: 'flexão e rotação alternada do tronco, com ênfase nos oblíquos', level: 'Intermediário',
    duration: '2-4 séries de 8-15 repetições por lado', defaultSets: 3, defaultReps: 10,
    technique: ['Deite de costas, mãos apoiadas levemente junto à cabeça e lombar confortável contra o solo.', 'Eleve os joelhos; aproxime um joelho do tronco enquanto estende a outra perna.', 'Gire o tronco levando o ombro oposto em direção ao joelho, sem puxar a cabeça; alterne devagar.'],
    contraindications: ['Encurte a extensão das pernas se a lombar perder contato confortável com o solo.'], variations: ['Bicicleta com pés mais altos', 'Bicicleta lenta com pausa', 'Dead bug alternado'],
  }),
  additionalExercise({
    id: 'bent-knee-leg-raise-hover', namePt: 'Elevação de Pernas com Pausa sem Tocar o Chão', category: 'Core', focus: 'controle abdominal ao estender e baixar as pernas', level: 'Intermediário',
    duration: '2-4 séries de 6-12 repetições', defaultSets: 3, defaultReps: 8,
    technique: ['Deite de costas e traga os joelhos em direção ao peito sem embalar o corpo.', 'Estenda as pernas enquanto as baixa; pare antes de os pés tocarem o chão.', 'Faça uma pausa breve nessa altura apenas mantendo a lombar estável, depois recolha os joelhos para a próxima repetição.'],
    contraindications: ['Mantenha os joelhos mais dobrados ou reduza a descida se a lombar arquear ou doer.'], variations: ['Elevação de joelhos deitado', 'Dead bug', 'Elevação de pernas na barra'],
  }),
  additionalExercise({
    id: 'hanging-leg-raise', namePt: 'Elevação de Pernas na Barra', category: 'Core', focus: 'controle abdominal e flexão de quadril em suspensão', level: 'Avançado',
    duration: '3-4 séries de 5-12 repetições', defaultSets: 3, defaultReps: 6,
    technique: ['Pendure-se com pegada firme e ombros controlados.', 'Eleve as pernas juntas sem embalar o corpo, usando amplitude que consiga controlar.', 'Desça devagar até a posição inicial sem relaxar bruscamente os ombros.'],
    contraindications: ['Use elevação de joelhos se a suspensão ou controle do tronco ainda forem limitantes.'], variations: ['Elevação de joelhos na barra', 'Elevação de pernas com joelhos flexionados'],
  }),
  additionalExercise({
    id: 'hanging-oblique-knee-raise', namePt: 'Elevação Lateral de Joelhos na Barra', category: 'Core', focus: 'flexão e rotação controlada do tronco com ênfase nos oblíquos', level: 'Intermediário',
    duration: '3 séries de 6-12 repetições por lado', defaultSets: 3, defaultReps: 8,
    technique: ['Pendure-se em uma barra firme, com pegada segura, ombros ativos e tronco sem balanço.', 'Eleve os joelhos em direção a um lado do peito, girando a pelve com controle; não force a lombar.', 'Desça devagar ao centro e alterne o lado na repetição seguinte, ou complete as repetições de um lado antes de trocar.'],
    contraindications: ['Use elevação de joelhos frontal como progressão mais simples; interrompa se houver dor no ombro, cotovelo ou lombar.'], variations: ['Elevação de joelhos na barra', 'Elevação lateral com pernas mais estendidas', 'Hanging windshield wiper (avançado)'],
  }),
  additionalExercise({
    id: 'hanging-knee-raise-hold', namePt: 'Isometria de Joelhos Elevados na Barra', category: 'Core', focus: 'sustentação abdominal e controle pélvico em suspensão', level: 'Intermediário', measureMode: 'duration',
    duration: '3-4 séries de 5-20 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 10,
    technique: ['Pendure-se com ombros ativos e eleve os joelhos até uma altura confortável.', 'Mantenha a posição sem balançar nem arquear a lombar.', 'Desça com controle ou use apoio para sair da barra.'],
    contraindications: ['Reduza a altura se houver desconforto na lombar ou nos ombros.'], variations: ['Elevação de joelhos dinâmica', 'Tuck hold no solo'],
  }),
  additionalExercise({
    id: 'handstand-wall-hold', namePt: 'Parada de Mãos na Parede (Isometria)', category: 'Isometrias e Skills', focus: 'sustentação invertida e alinhamento de ombros', level: 'Avançado', measureMode: 'duration',
    duration: '3-5 séries de 5-30 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 10,
    technique: ['Use uma parede livre e espaço desobstruído; entre na posição com uma progressão segura.', 'Empurre o chão, mantenha os braços estendidos e o abdômen ativo.', 'Saia da posição com controle antes de atingir a falha.'],
    contraindications: ['Não pratique invertido sem domínio da entrada/saída e sem espaço seguro; evite com dor ou restrição médica.'],
    variations: ['Pike hold com pés no chão', 'Parada de mãos com apoio parcial na parede'],
  }),
  additionalExercise({
    id: 'tuck-planche-hold', namePt: 'Tuck Planche (Isometria)', category: 'Isometrias e Skills', focus: 'sustentação de ombros, braços e core em apoio', level: 'Avançado', measureMode: 'duration',
    duration: '3-5 séries de 3-15 segundos', defaultSets: 4, defaultReps: 0, defaultDurationSeconds: 6,
    technique: ['Apoie as mãos em barras baixas ou no chão, com punhos confortáveis.', 'Empurre o apoio, incline os ombros à frente e recolha os joelhos.', 'Sustente apenas o tempo em que mantém controle; desmonte a posição com segurança.'],
    contraindications: ['Exige preparação de punhos e ombros; encerre ao perder o controle.'], variations: ['Planche lean', 'Frog stand', 'Tuck planche com apoio dos pés'],
  }),
  additionalExercise({
    id: 'parallel-bar-support-hold', namePt: 'Isometria de Apoio nas Paralelas', category: 'Isometrias e Skills', focus: 'suporte de ombros e tríceps com braços estendidos', level: 'Iniciante', measureMode: 'duration',
    duration: '3-5 séries de 10-30 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 15,
    technique: ['Segure apoios paralelos estáveis e suba com auxílio dos pés se necessário.', 'Mantenha os braços estendidos sem travar agressivamente os cotovelos.', 'Sustente o corpo estável e desça com apoio ao terminar.'],
    contraindications: ['Use apoio baixo e seguro; não solte as barras durante a sustentação.'], variations: ['Apoio com os pés assistindo', 'L-sit tuck nas paralelas', 'Mergulho nas paralelas'],
  }),
  additionalExercise({
    id: 'front-lever-tuck-hold', namePt: 'Front Lever Tuck (Isometria)', category: 'Isometrias e Skills', focus: 'sustentação de dorsais e core em alavanca horizontal', level: 'Avançado', measureMode: 'duration',
    duration: '3-5 séries de 3-15 segundos', defaultSets: 4, defaultReps: 0, defaultDurationSeconds: 6,
    technique: ['Segure uma barra firme e comece com joelhos recolhidos.', 'Ative os ombros e incline o tronco para trás mantendo quadris elevados.', 'Sustente apenas enquanto controlar a posição e desça com cuidado.'],
    contraindications: ['Progrida a partir de remadas e suspensões; evite balanço ou descida descontrolada.'], variations: ['Tuck front lever avançado', 'Remada australiana', 'Front lever com uma perna'],
  }),
  additionalExercise({
    id: 'glute-bridge-single-leg', namePt: 'Elevação Pélvica Unilateral', category: 'Pernas', focus: 'glúteos e extensão unilateral do quadril', level: 'Intermediário',
    duration: '3-4 séries de 8-15 repetições por lado', defaultSets: 3, defaultReps: 10,
    technique: ['Deite de costas com um pé apoiado e a outra perna elevada.', 'Empurre o chão com o pé apoiado e eleve o quadril sem girar a pelve.', 'Desça com controle e complete as repetições antes de trocar de lado.'],
    variations: ['Elevação pélvica bilateral', 'Elevação pélvica unilateral com pausa'],
  }),
  additionalExercise({
    id: 'step-up', namePt: 'Subida no Step (Step-up)', category: 'Pernas', focus: 'quadríceps e glúteos em apoio unilateral', level: 'Iniciante',
    duration: '3-4 séries de 8-12 repetições por perna', defaultSets: 3, defaultReps: 10,
    technique: ['Use um degrau baixo, firme e antiderrapante.', 'Suba apoiando o pé inteiro e estenda a perna sem impulsionar excessivamente com a de trás.', 'Desça devagar e alterne ou complete um lado por vez.'],
    contraindications: ['Escolha altura que permita subir sem dor ou perda de equilíbrio.'], variations: ['Step-up baixo', 'Step-up com pausa no topo'],
  }),
  additionalExercise({
    id: 'arch-hold', namePt: 'Arch Hold (Extensão Posterior Isométrica)', category: 'Core', focus: 'extensores do tronco e cadeia posterior', level: 'Iniciante', measureMode: 'duration',
    duration: '2-4 séries de 10-30 segundos', defaultSets: 3, defaultReps: 0, defaultDurationSeconds: 15,
    technique: ['Deite de barriga para baixo com pernas estendidas e braços em posição confortável.', 'Eleve levemente peito e pernas sem forçar o pescoço ou comprimir a lombar.', 'Sustente com respiração contínua e relaxe ao terminar.'],
    contraindications: ['Use amplitude pequena ou interrompa se houver desconforto lombar.'], variations: ['Elevação alternada de braço e perna', 'Superman hold'],
  }),
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
