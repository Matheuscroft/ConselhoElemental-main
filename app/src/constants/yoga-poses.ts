import type { YogaEnergyFocus, YogaPoseCategory, YogaSourceReference } from '@/types/workout';

export type YogaPose = {
  id: string;
  namePt: string;
  nameSanskrit: string;
  family: string;
  focus: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  benefits: string[];
  alignment: string[];
  breathing: string;
  contraindications?: string[];
  duration?: string;
  variations?: string[];
  category?: YogaPoseCategory;
  pillars?: string[];
  muscleActivation?: Record<string, number>;
  jointsInvolved?: string[];
  energyFocus?: YogaEnergyFocus;
  description?: string;
  translation?: string;
  commonMisalignments?: string[];
  props?: string[];
  safetyNotes?: string[];
  sources?: YogaSourceReference[];
  dataConfidence?: 'curated' | 'provisional';
};

const BASE_YOGA_POSES: YogaPose[] = [
  {
    id: 'tadasana',
    namePt: 'Postura da Montanha',
    nameSanskrit: 'Tadasana',
    family: 'Posturas em pé',
    focus: 'alinhamento e presença',
    level: 'Iniciante',
    benefits: [
      'Melhora o alinhamento postural',
      'Fortalece as coxas e tornozelos',
      'Cultiva estabilidade mental',
      'Estimula consciência corporal',
    ],
    alignment: [
      'Pés paralelos com dedos espalhados',
      'Peso distribuído uniformemente',
      'Quadris alinhados com ombros',
      'Coroa da cabeça apontando para o céu',
    ],
    breathing: 'Respiração natural e profunda, observando o fluxo de energia',
    duration: '30-60 segundos',
    variations: ['Tadasana com olhos fechados', 'Tadasana com palmas juntas no peito'],
  },
  {
    id: 'vrksasana',
    namePt: 'Postura da Árvore',
    nameSanskrit: 'Vrksasana',
    family: 'Equilíbrio em pé',
    focus: 'equilíbrio e concentração',
    level: 'Iniciante',
    benefits: [
      'Aprimora o equilíbrio e propriocepção',
      'Fortalece pernas e glúteos',
      'Desenvolve foco mental',
      'Melhora a estabilidade emocional',
    ],
    alignment: [
      'Pé de apoio bem enraizado no solo',
      'Outro pé pressionado contra a coxa interna',
      'Quadril aberto para o lado',
      'Mãos em posição de oração ou levantadas',
    ],
    breathing: 'Respiração lenta e profunda, focando no enraizamento',
    duration: '30-45 segundos em cada lado',
    contraindications: ['Pressão arterial baixa recente', 'Tontura'],
    variations: ['Vrksasana com pé em meia altura', 'Vrksasana com braços levantados'],
  },
  {
    id: 'virabhadrasana-ii',
    namePt: 'Guerreiro II',
    nameSanskrit: 'Virabhadrasana II',
    family: 'Posturas em pé',
    focus: 'força de pernas e estabilidade',
    level: 'Iniciante',
    benefits: [
      'Fortalece pernas, glúteos e costas',
      'Melhora resistência e estamina',
      'Abre quadris e ombros',
      'Cultiva coragem e determinação',
    ],
    alignment: [
      'Pés afastados na largura das cadeiras',
      'Pé dianteiro a 90 graus, traseiro a 45 graus',
      'Joelho dianteiro alinhado com tornozelo',
      'Tronco ereto e ombros relaxados',
    ],
    breathing: 'Inspiração enquanto estabiliza, expiração enquanto aprofunda',
    duration: '30-60 segundos em cada lado',
    variations: ['Guerreiro II com braços estendidos', 'Guerreiro II com palmas juntas'],
  },
  {
    id: 'adho-mukha-svanasana',
    namePt: 'Cachorro olhando para baixo',
    nameSanskrit: 'Adho Mukha Svanasana',
    family: 'Transição e força',
    focus: 'cadeia posterior e ombros',
    level: 'Iniciante',
    benefits: [
      'Alonga toda a cadeia posterior do corpo',
      'Fortalece braços e ombros',
      'Relaxa sistema nervoso',
      'Inverte a circulação energética',
    ],
    alignment: [
      'Mãos afastadas na largura dos ombros',
      'Pés afastados na largura dos quadris',
      'Cabeça entre os braços',
      'Coccix apontando para o céu',
    ],
    breathing: 'Inspiração profunda, expiração com alongamento',
    duration: '30-60 segundos',
    variations: ['Com joelhos levemente flexionados', 'Com pés em movimento alternado'],
  },
  {
    id: 'uttanasana',
    namePt: 'Pinça em pé',
    nameSanskrit: 'Uttanasana',
    family: 'Flexões à frente',
    focus: 'alongamento posterior e calma',
    level: 'Iniciante',
    benefits: [
      'Alonga isquiotibiais e coluna vertebral',
      'Reduz estresse e ansiedade',
      'Melhora circulação cerebral',
      'Acalma o sistema nervoso',
    ],
    alignment: [
      'Pés paralelos afastados na largura dos quadris',
      'Dobra a partir dos quadris, não da cintura',
      'Braços pendurados naturalmente',
      'Cabeça e pescoço relaxados',
    ],
    breathing: 'Expiração profunda enquanto desce, inspiração enquanto sobe',
    duration: '1-2 minutos',
    contraindications: ['Pressão alta não controlada', 'Descolamento de retina'],
    variations: ['Uttanasana com mãos segurando os pés', 'Uttanasana dinâmica com movimento'],
  },
  {
    id: 'bhujangasana',
    namePt: 'Cobra',
    nameSanskrit: 'Bhujangasana',
    family: 'Extensões',
    focus: 'mobilidade torácica e abertura de peito',
    level: 'Iniciante',
    benefits: [
      'Fortalece costas e braços',
      'Abre peito e ombros',
      'Melhora postura',
      'Estimula órgãos abdominais',
    ],
    alignment: [
      'Mãos sob os ombros',
      'Cotovelos próximos ao corpo',
      'Ombros afastados das orelhas',
      'Pubis pressionado no chão',
    ],
    breathing: 'Inspiração enquanto levanta o peito, expiração enquanto baixa',
    duration: '15-30 segundos',
    contraindications: ['Síndrome do túnel do carpo', 'Gravidez avançada'],
    variations: ['Cobra baixa', 'Cobra com braços estendidos'],
  },
  {
    id: 'ustrasana',
    namePt: 'Camelo',
    nameSanskrit: 'Ustrasana',
    family: 'Extensões',
    focus: 'abertura de quadris e peitoral',
    level: 'Intermediário',
    benefits: [
      'Abre intensa o peito e abdômen',
      'Alonga flexores de quadril',
      'Fortalece costas',
      'Libera emoções retidas',
    ],
    alignment: [
      'Joelhos afastados na largura dos quadris',
      'Mãos no sacro ou nas solas dos pés',
      'Peito aberto para o céu',
      'Cabeça em posição neutra ou levemente para trás',
    ],
    breathing: 'Inspiração profunda na abertura, expiração na sustentação',
    duration: '15-30 segundos',
    contraindications: ['Pressão alta', 'Problemas na coluna cervical'],
    variations: ['Camelo com uma mão no sacro', 'Camelo preparatório com mãos em blocos'],
  },
  {
    id: 'ardha-matsyendrasana',
    namePt: 'Torção sentada',
    nameSanskrit: 'Ardha Matsyendrasana',
    family: 'Torções',
    focus: 'mobilidade de coluna e respiração',
    level: 'Iniciante',
    benefits: [
      'Massageia órgãos internos',
      'Mobiliza a coluna vertebral',
      'Melhora digestão',
      'Libera tensão na parte superior das costas',
    ],
    alignment: [
      'Coluna alongada na inspiração',
      'Torção aprofunda na expiração',
      'Braço contrário apoiado na coxa oposta',
      'Ombros relaxados para trás',
    ],
    breathing: 'Expiração profunda na torção para maior penetração',
    duration: '30-60 segundos em cada lado',
    contraindications: ['Hérnias discais', 'Gravidez'],
    variations: ['Com perna estendida', 'Com perna flexionada'],
  },
  {
    id: 'eka-pada-rajakapotasana',
    namePt: 'Pombo',
    nameSanskrit: 'Eka Pada Rajakapotasana (prep.)',
    family: 'Abertura de quadris',
    focus: 'glúteos e quadril profundo',
    level: 'Intermediário',
    benefits: [
      'Alonga profundamente glúteos e músculos do quadril',
      'Libera tensão acumulada no quadril',
      'Melhora flexibilidade',
      'Alivia dor nas costas',
    ],
    alignment: [
      'Joelho da frente flexionado',
      'Quadril alinhado',
      'Tronco ereto ou inclinado para frente',
      'Pressão uniforme no chão',
    ],
    breathing: 'Expiração profunda na flexão frontal para aprofundar o alongamento',
    duration: '1-2 minutos em cada lado',
    contraindications: ['Lesão nos joelhos ou quadril'],
    variations: ['Pombo preparatório em quatro apoios', 'Pombo com inclinação frontal'],
  },
  {
    id: 'balasana',
    namePt: 'Postura da Criança',
    nameSanskrit: 'Balasana',
    family: 'Recuperação',
    focus: 'descanso e regulação do sistema nervoso',
    level: 'Iniciante',
    benefits: [
      'Repousa o sistema nervoso',
      'Alonga coluna vertebral e quadril',
      'Acalma mente agitada',
      'Restaura energia',
    ],
    alignment: [
      'Joelhos afastados ou juntos',
      'Testa apoiada no tapete',
      'Braços estendidos ou ao lado do corpo',
      'Respiração lenta e natural',
    ],
    breathing: 'Respiração natural e meditativa',
    duration: '1-5 minutos (quanto mais, melhor)',
    variations: ['Com braços estendidos', 'Com braços ao lado', 'Com pernas juntas'],
  },
  {
    id: 'setu-bandhasana',
    namePt: 'Meia Ponte',
    nameSanskrit: 'Setu Bandhasana',
    family: 'Extensões',
    focus: 'cadeia posterior e estabilidade lombar',
    level: 'Iniciante',
    benefits: [
      'Fortalece glúteos e isquiotibiais',
      'Protege a coluna lombar',
      'Abre peito e ombros',
      'Melhora circulação',
    ],
    alignment: [
      'Pés paralelos afastados na largura dos quadris',
      'Mãos entrelaçadas sob o corpo',
      'Glúteos contraídos na sustentação',
      'Joelhos alinhados com tornozelos',
    ],
    breathing: 'Inspiração enquanto levanta, expiração na sustentação',
    duration: '30-60 segundos',
    contraindications: ['Síndrome do impacto de ombro'],
    variations: ['Com blocos sob o sacro', 'Com perna estendida'],
  },
  {
    id: 'savasana',
    namePt: 'Postura do Cadáver',
    nameSanskrit: 'Savasana',
    family: 'Encerramento',
    focus: 'integração e relaxamento profundo',
    level: 'Iniciante',
    benefits: [
      'Integra todos os benefícios da prática',
      'Reduz estresse e ansiedade profundamente',
      'Restaura energia vital',
      'Conecta mente, corpo e espírito',
    ],
    alignment: [
      'Corpo completamente relaxado',
      'Pés naturalmente afastados',
      'Braços ao lado com palmas abertas',
      'Cabeça em posição neutra',
    ],
    breathing: 'Respiração natural, observação silenciosa',
    duration: '5-15 minutos (mínimo 5)',
    variations: ['Com travesseiro sob a cabeça', 'Com travesseiro sob os joelhos'],
  },
];

const USER_PROPOSAL_SOURCE = { label: 'Acervo proposto pelo usuário (estimativas não validadas)' };
const YOGA_JOURNAL_SOURCE = {
  label: 'Yoga Journal — biblioteca de posturas (referência para nomenclatura)',
  url: 'https://www.yogajournal.com/poses/',
};

const richPose = (pose: Omit<YogaPose, 'sources' | 'dataConfidence'>, source: YogaSourceReference = YOGA_JOURNAL_SOURCE): YogaPose => ({
  ...pose,
  sources: [source],
  dataConfidence: 'provisional',
});

/** Novas fichas autorais: nomes conferidos em bibliotecas de asanas; instruções resumidas para o app. */
const ADDED_YOGA_POSES: YogaPose[] = [
  richPose({ id:'virabhadrasana-i', namePt:'Guerreiro I', nameSanskrit:'Virabhadrasana I', category:'standing', family:'Posturas em pé', focus:'força das pernas e extensão do quadril', level:'Intermediário', duration:'20–45 s por lado', energyFocus:'STRENGTH', description:'Base em passada com os braços elevados e o tronco orientado para a frente.', pillars:['Força','Estabilidade','Mobilidade de quadril'], muscleActivation:{'Quadríceps':35,'Glúteos':30,'Flexores do quadril':20,'Ombros e core':15}, jointsInvolved:['Quadril','Joelhos','Tornozelos','Ombros'], alignment:['Afaste os pés em passada estável e mantenha o calcanhar traseiro apoiado conforme sua mobilidade.','Flexione o joelho da frente sem deixá-lo colapsar para dentro.','Eleve os braços apenas até onde os ombros permaneçam confortáveis.'], breathing:'Respire de forma contínua, sem prender o ar.', benefits:['Pratica estabilidade em base assimétrica','Combina sustentação de pernas e mobilidade do quadril'], contraindications:['Adapte ou evite se houver dor aguda no joelho, quadril ou ombro.'], variations:['Mãos nos quadris','Passada mais curta','Braços em posição de oração'], props:['Bloco sob as mãos, se necessário']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'virabhadrasana-iii', namePt:'Guerreiro III', nameSanskrit:'Virabhadrasana III', category:'balance', family:'Equilíbrios', focus:'equilíbrio unipodal e controle do tronco', level:'Avançado', duration:'10–30 s por lado', energyFocus:'STRENGTH', description:'Equilíbrio em uma perna com o tronco e a perna livre inclinados para formar uma linha longa.', pillars:['Equilíbrio','Força','Coordenação'], muscleActivation:{'Glúteos e posteriores da coxa':40,'Core e extensores da coluna':35,'Pé e tornozelo de apoio':25}, jointsInvolved:['Quadril','Tornozelo','Joelho','Coluna'], alignment:['Use uma parede ou cadeira como apoio no início.','Estenda a perna livre sem girar excessivamente a pelve.','Mantenha o pescoço alinhado ao tronco.'], breathing:'Mantenha a respiração estável e saia da postura se perder o controle.', benefits:['Desafia equilíbrio e coordenação','Treina estabilidade do tronco e do quadril'], contraindications:['Instabilidade importante ou dor no tornozelo, joelho ou quadril.'], variations:['Mãos apoiadas na parede','Mãos nos quadris','Braços ao lado do tronco'], props:['Parede ou cadeira']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'trikonasana', namePt:'Postura do Triângulo', nameSanskrit:'Trikonasana', category:'standing', family:'Posturas em pé', focus:'mobilidade lateral e alongamento das pernas', level:'Intermediário', duration:'20–45 s por lado', energyFocus:'FLEXIBILITY', description:'Postura lateral ampla com as pernas estendidas e o tronco inclinado sobre a perna da frente.', pillars:['Mobilidade','Equilíbrio','Alongamento'], muscleActivation:{'Pernas e adutores':35,'Core e oblíquos':30,'Costas e ombros':20,'Pés e tornozelos':15}, jointsInvolved:['Quadris','Joelhos','Coluna','Ombros','Tornozelos'], alignment:['Mantenha as duas pernas firmes sem travar os joelhos.','Apoie a mão em uma canela, bloco ou cadeira, sem forçar o alcance.','Gire o tórax apenas até onde seja confortável.'], breathing:'Respire livremente, expandindo as costelas.', benefits:['Explora mobilidade lateral do tronco','Treina estabilidade em base ampla'], contraindications:['Evite forçar a flexão ou rotação se houver dor lombar ou no joelho.'], variations:['Mão em bloco','Braço superior apoiado no quadril']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'paschimottanasana', namePt:'Pinça Sentada', nameSanskrit:'Paschimottanasana', category:'seated', family:'Flexões à frente', focus:'flexão de quadril e cadeia posterior', level:'Intermediário', duration:'30–90 s', energyFocus:'FLEXIBILITY', description:'Flexão sentada à frente; a amplitude deve vir do quadril e pode ser pequena.', pillars:['Flexibilidade','Respiração','Atenção corporal'], muscleActivation:{'Isquiotibiais e panturrilhas':45,'Costas':30,'Core':15,'Quadris':10}, jointsInvolved:['Quadris','Joelhos','Coluna'], alignment:['Sente-se sobre uma manta se a pelve inclinar para trás.','Flexione os joelhos o quanto for necessário.','Alongue o tronco para a frente sem puxar os pés à força.'], breathing:'Respiração calma; não force a expiração para aprofundar.', benefits:['Pratica flexão de quadril com controle','Pode ser ajustada com joelhos flexionados'], contraindications:['Cuidado com desconforto agudo lombar ou posterior da coxa.'], variations:['Joelhos flexionados','Faixa ao redor dos pés'], props:['Manta','Faixa']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'baddha-konasana', namePt:'Postura da Borboleta', nameSanskrit:'Baddha Konasana', category:'seated', family:'Posturas sentadas', focus:'mobilidade confortável dos quadris', level:'Iniciante', duration:'30–90 s', energyFocus:'MOBILITY', description:'Sentado, aproxime as plantas dos pés e deixe os joelhos abrirem sem empurrá-los.', pillars:['Mobilidade','Relaxamento','Postura'], muscleActivation:{'Adutores':45,'Rotadores do quadril':25,'Costas e core':30}, jointsInvolved:['Quadris','Joelhos','Coluna'], alignment:['Sente-se em apoio elevado se a lombar arredondar.','Aproxime os pés apenas até manter conforto nos joelhos.','Permita que as pernas desçam pelo próprio peso.'], breathing:'Respiração natural, sem pressionar as coxas.', benefits:['Pratica mobilidade dos quadris em posição sentada','Pode ser sustentada com apoio'], contraindications:['Não pressione os joelhos; adapte em caso de sensibilidade articular.'], variations:['Pés mais afastados do corpo','Inclinação leve à frente'], props:['Manta sob a pelve','Blocos sob as coxas']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'urdhva-mukha-svanasana', namePt:'Cachorro Olhando para Cima', nameSanskrit:'Urdhva Mukha Svanasana', category:'prone', family:'Extensões', focus:'extensão da coluna e apoio dos braços', level:'Avançado', duration:'10–20 s', energyFocus:'STRENGTH', description:'Extensão apoiada nas mãos, com as coxas elevadas; requer preparação de punhos, ombros e coluna.', pillars:['Força','Mobilidade','Consciência corporal'], muscleActivation:{'Costas':30,'Ombros e braços':30,'Glúteos e pernas':20,'Core':20}, jointsInvolved:['Punhos','Cotovelos','Ombros','Coluna','Quadris'], alignment:['Pressione o chão sem colapsar nos ombros.','Eleve as coxas somente se a lombar permanecer confortável.','Mantenha o pescoço longo e o olhar neutro.'], breathing:'Respire sem comprimir a lombar; saia se houver dor.', benefits:['Treina extensão ativa do tronco','Combina apoio de braços e mobilidade anterior'], contraindications:['Evite em caso de dor lombar ou de punho; prefira Cobra baixa.'], variations:['Cobra baixa (Bhujangasana)','Apoio sobre antebraços'], props:['Manta sob as coxas']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'urdhva-dhanurasana', namePt:'Postura da Roda', nameSanskrit:'Urdhva Dhanurasana', category:'supine', family:'Extensões', focus:'extensão global avançada', level:'Avançado', duration:'5–15 s', energyFocus:'STRENGTH', description:'Retroflexão avançada apoiada em mãos e pés. Requer aquecimento, progressão e amplitude sem dor.', pillars:['Força','Mobilidade','Progressão'], muscleActivation:{'Ombros e braços':30,'Costas':30,'Glúteos e pernas':25,'Core':15}, jointsInvolved:['Punhos','Ombros','Coluna','Quadris','Tornozelos'], alignment:['Aqueça ombros, punhos e coluna antes da tentativa.','Distribua o apoio entre mãos e pés; não force a cabeça contra o chão.','Interrompa diante de dor, formigamento ou tontura.'], breathing:'Respire continuamente e desça com controle.', benefits:['Desafia força e mobilidade em cadeia completa'], contraindications:['Não indicada para iniciantes sem orientação; evite com dor ou restrição em punhos, ombros ou coluna.'], variations:['Ponte (Setu Bandhasana)','Roda apoiada em blocos sob supervisão'], props:['Blocos (progressões orientadas)']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'marjaryasana-bitilasana', namePt:'Gato-Vaca', nameSanskrit:'Marjaryasana–Bitilasana', category:'flow', family:'Mobilidade', focus:'mobilidade segmentada da coluna', level:'Iniciante', duration:'6–10 ciclos', energyFocus:'MOBILITY', description:'Movimento suave entre arredondar e estender a coluna em quatro apoios.', pillars:['Mobilidade','Respiração','Aquecimento'], muscleActivation:{'Core e costas':60,'Ombros e quadris':40}, jointsInvolved:['Coluna','Ombros','Punhos','Quadris'], alignment:['Posicione mãos sob os ombros e joelhos sob os quadris.','Movimente a coluna dentro de uma amplitude confortável.','Evite jogar a cabeça para trás.'], breathing:'Sincronize o movimento com a respiração sem prender o ar.', benefits:['Aquece a coluna com movimento controlado','Facilita percepção de flexão e extensão'], variations:['Punhos apoiados em blocos','Antebraços apoiados em caso de sensibilidade nos punhos'], props:['Blocos (opcional)']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'kumbhakasana', namePt:'Prancha Alta', nameSanskrit:'Kumbhakasana (variação de prancha)', category:'balance', family:'Transição e força', focus:'estabilidade do tronco e apoio dos braços', level:'Intermediário', duration:'10–40 s', energyFocus:'STRENGTH', description:'Apoio em mãos e pontas dos pés com o corpo alinhado; pode ser feito com joelhos no chão.', pillars:['Força','Estabilidade','Coordenação'], muscleActivation:{'Core':40,'Ombros e braços':30,'Quadríceps':15,'Glúteos':15}, jointsInvolved:['Punhos','Ombros','Coluna','Quadris','Tornozelos'], alignment:['Empurre o chão e mantenha os ombros confortáveis.','Aproxime costelas e pelve sem prender a respiração.','Use joelhos apoiados para reduzir a carga.'], breathing:'Respiração contínua; encerre antes de perder o alinhamento.', benefits:['Treina sustentação isométrica do tronco','Permite progressão por tempo ou apoio dos joelhos'], contraindications:['Adapte em caso de dor no punho ou ombro.'], variations:['Joelhos no chão','Antebraços no solo']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'sarvangasana', namePt:'Postura da Vela', nameSanskrit:'Sarvangasana', category:'inversion', family:'Invertidas', focus:'equilíbrio invertido com apoio dos ombros', level:'Avançado', duration:'Somente com orientação adequada', energyFocus:'STRENGTH', description:'Invertida avançada com carga na cintura escapular e flexão cervical; exige instrução presencial qualificada.', pillars:['Equilíbrio','Controle','Progressão'], muscleActivation:{'Core e estabilizadores':40,'Ombros e braços':35,'Quadris e pernas':25}, jointsInvolved:['Ombros','Coluna cervical','Quadris'], alignment:['Não apoie o peso sobre a cabeça ou o pescoço.','Use cobertores e orientação presencial; não tente sem preparo.','Saia imediatamente em caso de pressão ou desconforto cervical.'], breathing:'Mantenha respiração livre; desmonte com controle.', benefits:['Trabalha controle corporal invertido quando ensinada com segurança'], contraindications:['Evite sem orientação, especialmente com questões cervicais, glaucoma ou pressão não controlada.'], variations:['Pernas na parede (Viparita Karani) como alternativa restaurativa'], props:['Cobertores firmes; orientação presencial essencial']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'raja-kapotasana', namePt:'Pombo Real', nameSanskrit:'Eka Pada Rajakapotasana (variação avançada)', category:'kneeling', family:'Abertura de quadris', focus:'extensão avançada de quadril e coluna', level:'Avançado', duration:'Somente em progressão orientada', energyFocus:'FLEXIBILITY', description:'Variação profunda e avançada do Pombo com extensão da coluna e alcance do pé; não é a mesma ficha do Pombo preparatório existente.', pillars:['Mobilidade','Flexibilidade','Progressão'], muscleActivation:{'Costas e ombros':35,'Quadris e glúteos':35,'Core e pernas':30}, jointsInvolved:['Quadris','Joelhos','Ombros','Coluna'], alignment:['Construa a postura em etapas e use apoio.','Não force o joelho dianteiro nem comprima a lombar.','Interrompa se houver dor ou pinçamento.'], breathing:'Respire naturalmente e recue ao primeiro sinal de desconforto.', benefits:['Registra uma variação avançada distinta do Pombo preparatório'], contraindications:['Não indicada sem progressão e orientação; evite com lesões de joelho, quadril ou coluna.'], variations:['Pombo preparatório existente (Eka Pada Rajakapotasana prep.)'], props:['Faixa e apoio sob o quadril']}, USER_PROPOSAL_SOURCE),
  richPose({ id:'utkatasana', namePt:'Postura da Cadeira', nameSanskrit:'Utkatasana', category:'standing', family:'Posturas em pé', focus:'força isométrica de pernas', level:'Iniciante', duration:'15–40 s', energyFocus:'STRENGTH', description:'Agachamento sustentado em pé, com os quadris recuando como se fosse sentar.', pillars:['Força','Estabilidade','Equilíbrio'], muscleActivation:{'Quadríceps e glúteos':55,'Core e costas':25,'Ombros':20}, jointsInvolved:['Quadris','Joelhos','Tornozelos','Ombros'], alignment:['Mantenha o peso distribuído no pé inteiro.','Flexione os joelhos dentro da amplitude confortável.','Braços podem ficar na altura dos ombros ou com mãos nos quadris.'], breathing:'Respire de forma constante durante a sustentação.', benefits:['Pratica força de pernas e controle postural'], contraindications:['Adapte em caso de dor no joelho ou equilíbrio limitado.'], variations:['Costas apoiadas na parede','Mãos nos quadris']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'anjaneyasana', namePt:'Afundo Baixo', nameSanskrit:'Anjaneyasana', category:'kneeling', family:'Posturas ajoelhadas', focus:'extensão do quadril e estabilidade em passada', level:'Iniciante', duration:'20–45 s por lado', energyFocus:'MOBILITY', description:'Afundo com joelho traseiro apoiado e tronco ereto, ajustado para conforto do joelho e quadril.', pillars:['Mobilidade','Estabilidade','Respiração'], muscleActivation:{'Glúteos e pernas':45,'Core':25,'Flexores do quadril':30}, jointsInvolved:['Quadris','Joelhos','Tornozelos'], alignment:['Use uma manta sob o joelho traseiro.','Mantenha o joelho dianteiro estável sobre o pé.','Eleve o tronco sem empurrar a pelve à força.'], breathing:'Respire livremente e reduza a amplitude se houver pressão.', benefits:['Explora extensão dos flexores do quadril','Pode ser apoiado e adaptado'], contraindications:['Proteja o joelho apoiado; não force a amplitude.'], variations:['Mãos em blocos','Afundo com joelho traseiro elevado'], props:['Manta','Blocos']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'ashta-chandrasana', namePt:'Afundo Alto', nameSanskrit:'Ashta Chandrasana (variação)', category:'standing', family:'Posturas em pé', focus:'força e equilíbrio em passada', level:'Intermediário', duration:'15–40 s por lado', energyFocus:'STRENGTH', description:'Passada alta com a perna traseira estendida e o tronco ereto.', pillars:['Força','Equilíbrio','Coordenação'], muscleActivation:{'Quadríceps e glúteos':55,'Core':25,'Ombros':20}, jointsInvolved:['Quadris','Joelhos','Tornozelos','Ombros'], alignment:['Reduza a distância da passada para manter o equilíbrio.','Evite hiperestender o joelho traseiro.','Mãos podem permanecer nos quadris.'], breathing:'Mantenha a respiração contínua.', benefits:['Treina estabilidade e sustentação em passada'], contraindications:['Adapte em caso de dor no joelho ou equilíbrio instável.'], variations:['Joelho traseiro apoiado','Mãos nos quadris']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'utthita-parsvakonasana', namePt:'Ângulo Lateral Estendido', nameSanskrit:'Utthita Parsvakonasana', category:'standing', family:'Posturas em pé', focus:'força lateral e mobilidade do tronco', level:'Intermediário', duration:'20–40 s por lado', energyFocus:'STRENGTH', description:'Base ampla com o joelho dianteiro flexionado e o tronco alongado sobre a perna.', pillars:['Força','Mobilidade','Estabilidade'], muscleActivation:{'Pernas e glúteos':45,'Core e oblíquos':30,'Ombros e costas':25}, jointsInvolved:['Quadris','Joelhos','Tornozelos','Coluna','Ombros'], alignment:['Apoie o antebraço na coxa ou a mão em um bloco.','Mantenha o joelho alinhado com os dedos do pé.','Alongue os dois lados do tronco sem colapsar.'], breathing:'Respire pelas laterais das costelas.', benefits:['Combina base de força e alongamento lateral'], contraindications:['Não force o joelho ou o ombro apoiado.'], variations:['Antebraço na coxa','Mão em bloco']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'sukhasana', namePt:'Postura Fácil', nameSanskrit:'Sukhasana', category:'seated', family:'Posturas sentadas', focus:'postura sentada e respiração', level:'Iniciante', duration:'1–5 min', energyFocus:'RESTORATIVE', description:'Assento confortável de pernas cruzadas, preferencialmente com a pelve elevada.', pillars:['Postura','Respiração','Atenção'], muscleActivation:{'Costas e core':60,'Quadris':25,'Pernas':15}, jointsInvolved:['Quadris','Joelhos','Tornozelos','Coluna'], alignment:['Eleve a pelve até os joelhos ficarem abaixo ou próximos dos quadris.','Alterne o cruzamento das pernas.','Sente-se sobre uma cadeira se o chão não for confortável.'], breathing:'Respiração natural, sem rigidez.', benefits:['Oferece uma posição de prática sentada adaptável'], contraindications:['Evite permanecer em posição dolorosa ou com dormência.'], variations:['Sentado em cadeira','Pernas estendidas'], props:['Manta ou almofada']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'uttana-shishosana', namePt:'Postura do Filhote Estendido', nameSanskrit:'Uttana Shishosana', category:'kneeling', family:'Recuperação', focus:'alongamento de ombros e coluna', level:'Iniciante', duration:'30–90 s', energyFocus:'MOBILITY', description:'A partir de quatro apoios, caminhe com as mãos à frente e mantenha os quadris sobre os joelhos.', pillars:['Mobilidade','Alongamento','Respiração'], muscleActivation:{'Ombros e costas':55,'Core':25,'Quadris e pernas':20}, jointsInvolved:['Ombros','Coluna','Quadris','Joelhos'], alignment:['Mantenha os quadris alinhados sobre os joelhos.','Apoie a testa ou o peito em um bloco se necessário.','Não force os ombros até o limite.'], breathing:'Respire sem comprimir o peito.', benefits:['Explora flexão dos ombros e extensão da coluna'], contraindications:['Adapte em caso de desconforto no ombro ou joelho.'], variations:['Testa em bloco','Braços menos avançados'], props:['Bloco','Manta']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'matsyasana', namePt:'Postura do Peixe', nameSanskrit:'Matsyasana', category:'supine', family:'Extensões', focus:'extensão torácica apoiada', level:'Intermediário', duration:'15–45 s', energyFocus:'MOBILITY', description:'Abertura do peito em decúbito, preferencialmente apoiada para manter o pescoço confortável.', pillars:['Mobilidade','Respiração','Abertura torácica'], muscleActivation:{'Costas':35,'Peito e ombros':35,'Core e pernas':30}, jointsInvolved:['Coluna torácica','Ombros','Pescoço'], alignment:['Use apoio sob as costas e mantenha o pescoço sem compressão.','Não coloque peso sobre o topo da cabeça.','Saia lentamente.'], breathing:'Respire sem restringir a garganta.', benefits:['Permite explorar extensão torácica com apoio'], contraindications:['Evite extensão cervical forçada ou se causar tontura/dor.'], variations:['Manta longitudinal sob as costas','Braços ao lado do corpo'], props:['Manta ou bolster']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'salamba-bhujangasana', namePt:'Postura da Esfinge', nameSanskrit:'Salamba Bhujangasana', category:'prone', family:'Extensões', focus:'extensão suave da coluna', level:'Iniciante', duration:'20–60 s', energyFocus:'MOBILITY', description:'Extensão baixa de bruços com apoio nos antebraços.', pillars:['Mobilidade','Postura','Respiração'], muscleActivation:{'Costas':45,'Ombros e braços':25,'Glúteos e pernas':20,'Core':10}, jointsInvolved:['Coluna','Cotovelos','Ombros','Quadris'], alignment:['Cotovelos ficam abaixo ou ligeiramente à frente dos ombros.','Alongue o peito para a frente sem comprimir a lombar.','Mantenha as pernas relaxadas.'], breathing:'Respiração natural; diminua a altura se houver pressão lombar.', benefits:['Alternativa de menor amplitude para extensão de bruços'], contraindications:['Evite se a extensão provocar dor lombar.'], variations:['Antebraços mais à frente','Manta sob a pelve'], props:['Manta']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'salabhasana', namePt:'Postura do Gafanhoto', nameSanskrit:'Shalabhasana', category:'prone', family:'Extensões', focus:'força posterior do tronco', level:'Intermediário', duration:'5–20 s', energyFocus:'STRENGTH', description:'Extensão ativa de bruços, elevando uma ou mais partes do corpo apenas dentro de uma amplitude confortável.', pillars:['Força','Coordenação','Postura'], muscleActivation:{'Costas e glúteos':55,'Posteriores da coxa':25,'Ombros e braços':20}, jointsInvolved:['Coluna','Quadris','Ombros'], alignment:['Comece elevando apenas o peito ou uma perna.','Alongue a nuca e não force a altura.','Mantenha a respiração livre.'], breathing:'Respire continuamente; descanse entre tentativas.', benefits:['Treina extensão ativa do tronco e quadris'], contraindications:['Adapte em caso de desconforto lombar ou cervical.'], variations:['Braços ao lado do corpo','Elevação alternada de pernas']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'ananda-balasana', namePt:'Postura do Bebê Feliz', nameSanskrit:'Ananda Balasana', category:'supine', family:'Recuperação', focus:'mobilidade confortável dos quadris', level:'Iniciante', duration:'30–90 s', energyFocus:'MOBILITY', description:'Deitado de costas, segure as coxas ou os pés e permita que os joelhos se aproximem do tronco sem tração.', pillars:['Mobilidade','Relaxamento','Respiração'], muscleActivation:{'Core':25,'Quadris e adutores':45,'Ombros e braços':30}, jointsInvolved:['Quadris','Joelhos','Ombros'], alignment:['Segure atrás das coxas se alcançar os pés exigir esforço.','Mantenha o sacro confortável no chão.','Não balance com força.'], breathing:'Respiração tranquila.', benefits:['Oferece exploração suave da mobilidade do quadril'], contraindications:['Evite puxar os pés ou joelhos com força.'], variations:['Mãos atrás das coxas','Um joelho de cada vez']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'supta-baddha-konasana', namePt:'Borboleta Deitada', nameSanskrit:'Supta Baddha Konasana', category:'restorative', family:'Recuperação', focus:'descanso apoiado e abertura confortável', level:'Iniciante', duration:'1–5 min', energyFocus:'RESTORATIVE', description:'Deitado com as plantas dos pés próximas e os joelhos apoiados; use suportes para não tracionar a virilha.', pillars:['Recuperação','Respiração','Relaxamento'], muscleActivation:{'Atividade postural leve':35,'Quadris e adutores':35,'Costas':30}, jointsInvolved:['Quadris','Joelhos','Coluna'], alignment:['Apoie ambos os joelhos em blocos ou almofadas.','Mantenha a coluna em posição confortável.','Saia ajudando as pernas com as mãos.'], breathing:'Respire com naturalidade.', benefits:['Permite repouso em posição de abertura apoiada'], contraindications:['Não mantenha a posição se houver tensão ou dor nos joelhos/virilha.'], variations:['Apoios altos sob os joelhos','Pernas juntas em Savasana'], props:['Almofadas ou blocos']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'virasana', namePt:'Postura do Herói', nameSanskrit:'Virasana', category:'kneeling', family:'Posturas sentadas', focus:'assento ajoelhado com apoio', level:'Intermediário', duration:'20–90 s', energyFocus:'MOBILITY', description:'Ajoelhado, sente-se entre os pés apenas se os joelhos e tornozelos estiverem confortáveis; use altura generosa.', pillars:['Postura','Mobilidade','Atenção'], muscleActivation:{'Costas e core':55,'Quadris':20,'Pernas':25}, jointsInvolved:['Joelhos','Tornozelos','Quadris'], alignment:['Coloque um bloco ou almofada alta entre os calcanhares.','Não force os pés para fora.','Saia com as mãos apoiadas.'], breathing:'Respiração natural e postura sem esforço.', benefits:['Alternativa de assento para práticas contemplativas'], contraindications:['Evite com dor ou limitação de joelho/tornozelo.'], variations:['Sentado em bloco alto','Ajoelhado em cadeira'], props:['Bloco ou almofada firme']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'upavistha-konasana', namePt:'Abertura Sentada de Pernas', nameSanskrit:'Upavistha Konasana', category:'seated', family:'Flexões à frente', focus:'mobilidade dos quadris e pernas', level:'Intermediário', duration:'20–60 s', energyFocus:'FLEXIBILITY', description:'Sentado com pernas afastadas em amplitude confortável; mantenha a coluna longa e evite forçar a flexão.', pillars:['Flexibilidade','Mobilidade','Postura'], muscleActivation:{'Adutores e posteriores da coxa':50,'Costas e core':35,'Quadris':15}, jointsInvolved:['Quadris','Joelhos','Coluna'], alignment:['Sente-se sobre manta se a pelve tombar para trás.','Mantenha os joelhos apontados para cima.','Incline-se pouco ou permaneça ereto.'], breathing:'Respire sem pressionar as pernas contra o chão.', benefits:['Explora abertura de pernas em posição sentada'], contraindications:['Não force a amplitude; adapte em caso de dor na virilha ou joelho.'], variations:['Joelhos levemente flexionados','Inclinação lateral suave'], props:['Manta','Blocos sob os joelhos']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'garudasana', namePt:'Postura da Águia', nameSanskrit:'Garudasana', category:'balance', family:'Equilíbrios', focus:'equilíbrio e coordenação cruzada', level:'Intermediário', duration:'10–30 s por lado', energyFocus:'STRENGTH', description:'Equilíbrio em uma perna com braços e pernas cruzados em uma variação adaptável.', pillars:['Equilíbrio','Coordenação','Concentração'], muscleActivation:{'Pernas e glúteos':45,'Core':25,'Ombros e braços':30}, jointsInvolved:['Tornozelos','Joelhos','Quadris','Ombros','Cotovelos'], alignment:['Use parede para apoio.','Cruze os braços ou pernas somente até onde for confortável.','Mantenha o pé de apoio estável.'], breathing:'Respire sem prender o ar.', benefits:['Treina equilíbrio e coordenação entre os lados do corpo'], contraindications:['Adapte ou evite se houver dor no joelho ou ombro.'], variations:['Ponta do pé livre no chão','Abraço dos braços sem cruzar pernas'], props:['Parede']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'navasana', namePt:'Postura do Barco', nameSanskrit:'Navasana', category:'seated', family:'Transição e força', focus:'estabilidade abdominal em posição sentada', level:'Intermediário', duration:'10–30 s', energyFocus:'STRENGTH', description:'Equilíbrio sentado sobre os ísquios; joelhos dobrados são uma progressão válida.', pillars:['Força','Equilíbrio','Controle'], muscleActivation:{'Core e flexores do quadril':55,'Costas':20,'Pernas':25}, jointsInvolved:['Quadris','Coluna','Joelhos'], alignment:['Mantenha o peito aberto e coluna longa.','Segure atrás das coxas se necessário.','Evite arredondar a lombar para elevar as pernas.'], breathing:'Respiração contínua durante a sustentação.', benefits:['Treina equilíbrio sentado e controle do tronco'], contraindications:['Evite se causar dor lombar ou pressão abdominal desconfortável.'], variations:['Pés no chão','Joelhos dobrados','Mãos atrás das coxas']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'parsvottanasana', namePt:'Postura da Pirâmide', nameSanskrit:'Parsvottanasana', category:'standing', family:'Flexões à frente', focus:'alongamento posterior em base escalonada', level:'Intermediário', duration:'20–45 s por lado', energyFocus:'FLEXIBILITY', description:'Flexão à frente com os pés em trilhos separados para facilitar equilíbrio e alinhamento.', pillars:['Equilíbrio','Flexibilidade','Postura'], muscleActivation:{'Pernas e glúteos':45,'Core e costas':35,'Pés e tornozelos':20}, jointsInvolved:['Quadris','Joelhos','Tornozelos','Coluna'], alignment:['Afaste os pés lateralmente como em trilhos, não numa linha única.','Flexione o joelho da frente se necessário.','Apoie as mãos em blocos ou cadeira.'], breathing:'Respire livremente e evite puxar o tronco para baixo.', benefits:['Combina equilíbrio e flexão de quadril'], contraindications:['Adapte em caso de dor lombar ou posterior da coxa.'], variations:['Mãos em blocos','Tronco ereto']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'ardha-uttanasana', namePt:'Meia Flexão em Pé', nameSanskrit:'Ardha Uttanasana', category:'standing', family:'Flexões à frente', focus:'alongamento axial e dobradiça de quadril', level:'Iniciante', duration:'3–6 respirações', energyFocus:'MOBILITY', description:'Meia flexão com as mãos apoiadas nas pernas, blocos ou cadeira e a coluna alongada.', pillars:['Mobilidade','Postura','Aquecimento'], muscleActivation:{'Costas e core':45,'Posteriores da coxa':35,'Glúteos e pernas':20}, jointsInvolved:['Quadris','Coluna','Joelhos'], alignment:['Apoie as mãos acima dos joelhos sem pressionar a patela.','Flexione joelhos para manter a coluna longa.','Projete o peito para a frente sem comprimir o pescoço.'], breathing:'Inspire alongando o tronco; expire mantendo estabilidade.', benefits:['Ensina a dobradiça de quadril com apoio'], variations:['Mãos na parede','Mãos em cadeira'], props:['Blocos ou cadeira']}, YOGA_JOURNAL_SOURCE),
  richPose({ id:'malasana', namePt:'Postura da Guirlanda', nameSanskrit:'Malasana', category:'standing', family:'Posturas em pé', focus:'agachamento e mobilidade de tornozelos e quadris', level:'Intermediário', duration:'15–45 s', energyFocus:'MOBILITY', description:'Agachamento profundo em amplitude individual, com apoio sob os calcanhares se necessário.', pillars:['Mobilidade','Equilíbrio','Força'], muscleActivation:{'Quadríceps e glúteos':45,'Adutores':25,'Core e costas':20,'Tornozelos':10}, jointsInvolved:['Quadris','Joelhos','Tornozelos'], alignment:['Mantenha os pés em posição confortável e joelhos acompanhando os dedos.','Sente-se em bloco se os calcanhares não alcançarem o chão.','Não force os joelhos para fora com os braços.'], breathing:'Respire com o tronco ereto e sem tensão.', benefits:['Explora agachamento e mobilidade em posição baixa'], contraindications:['Adapte para sensibilidade no joelho, quadril ou tornozelo.'], variations:['Sentado em bloco','Calcanhares apoiados em manta'], props:['Bloco','Manta enrolada']}, YOGA_JOURNAL_SOURCE),
];

const CATEGORY_BY_ID: Record<string, YogaPose['category']> = {
  'tadasana':'standing','vrksasana':'balance','virabhadrasana-ii':'standing','adho-mukha-svanasana':'inversion','uttanasana':'standing','bhujangasana':'prone','ustrasana':'kneeling','ardha-matsyendrasana':'seated','eka-pada-rajakapotasana':'kneeling','balasana':'restorative','setu-bandhasana':'supine','savasana':'restorative',
};

const BASE_PROFILES: Record<string, Pick<YogaPose, 'pillars' | 'muscleActivation' | 'jointsInvolved' | 'energyFocus' | 'description'>> = {
  tadasana:{pillars:['Estabilidade','Postura','Alinhamento'],muscleActivation:{'Quadríceps':30,'Glúteos':25,'Core / Transverso':25,'Panturrilhas':20},jointsInvolved:['Tornozelos','Joelhos','Quadril','Coluna'],energyFocus:'RESTORATIVE',description:'Postura base em pé para observar alinhamento e distribuição do peso.'},
  vrksasana:{pillars:['Equilíbrio','Estabilidade','Concentração'],muscleActivation:{'Glúteos e estabilizadores':40,'Panturrilha e pé de apoio':30,'Core':20,'Quadríceps':10},jointsInvolved:['Tornozelo','Joelho','Quadril'],energyFocus:'STRENGTH',description:'Equilíbrio unipodal adaptável com o pé livre apoiado em diferentes alturas.'},
  'virabhadrasana-ii':{pillars:['Força','Estabilidade','Mobilidade'],muscleActivation:{'Quadríceps':35,'Adutores e glúteo médio':35,'Deltoides':20,'Core':10},jointsInvolved:['Quadril','Joelho','Ombros'],energyFocus:'STRENGTH',description:'Postura em base ampla com joelho dianteiro flexionado e braços abertos.'},
  'adho-mukha-svanasana':{pillars:['Mobilidade','Força','Alongamento'],muscleActivation:{'Ombros e braços':35,'Pernas e cadeia posterior':35,'Core':20,'Tríceps':10},jointsInvolved:['Ombros','Punhos','Tornozelos','Quadril'],energyFocus:'MOBILITY',description:'Postura em V invertido que pode ser modificada dobrando os joelhos ou usando apoio.'},
  uttanasana:{pillars:['Flexibilidade','Mobilidade','Respiração'],muscleActivation:{'Isquiotibiais':45,'Costas':30,'Glúteos':15,'Panturrilhas':10},jointsInvolved:['Quadril','Joelhos','Coluna'],energyFocus:'FLEXIBILITY',description:'Flexão à frente em pé, com joelhos adaptados à mobilidade individual.'},
  bhujangasana:{pillars:['Mobilidade','Força','Postura'],muscleActivation:{'Costas':45,'Braços e ombros':25,'Glúteos':20,'Peitoral':10},jointsInvolved:['Coluna','Ombros','Punhos','Quadris'],energyFocus:'STRENGTH',description:'Extensão baixa de bruços com cotovelos dobrados e amplitude controlada.'},
  ustrasana:{pillars:['Mobilidade','Extensão','Progressão'],muscleActivation:{'Pernas e flexores do quadril':40,'Costas':35,'Core e glúteos':15,'Peitoral':10},jointsInvolved:['Joelhos','Quadris','Coluna','Ombros'],energyFocus:'MOBILITY',description:'Extensão ajoelhada que deve ser praticada com amplitude gradual e apoio.'},
  'ardha-matsyendrasana':{pillars:['Mobilidade','Controle','Respiração'],muscleActivation:{'Oblíquos':45,'Rotadores da coluna':35,'Glúteos':20},jointsInvolved:['Coluna','Quadril','Joelhos'],energyFocus:'MOBILITY',description:'Torção sentada realizada a partir do alongamento axial, sem forçar o alcance.'},
  'eka-pada-rajakapotasana':{pillars:['Mobilidade','Flexibilidade','Apoio'],muscleActivation:{'Glúteos e rotadores do quadril':50,'Flexores do quadril':35,'Core':15},jointsInvolved:['Quadril','Joelho','Tornozelo'],energyFocus:'FLEXIBILITY',description:'Pombo preparatório com suporte sob o quadril e opção de manter o tronco ereto.'},
  balasana:{pillars:['Recuperação','Respiração','Mobilidade'],muscleActivation:{'Costas e quadris (baixa demanda)':70,'Ombros':30},jointsInvolved:['Joelhos','Quadris','Ombros'],energyFocus:'RESTORATIVE',description:'Postura de repouso ajoelhada; pode receber apoio sob tronco, cabeça ou quadris.'},
  'setu-bandhasana':{pillars:['Força','Estabilidade','Mobilidade'],muscleActivation:{'Glúteos':45,'Isquiotibiais':30,'Costas':15,'Quadríceps':10},jointsInvolved:['Quadril','Coluna','Joelhos','Ombros'],energyFocus:'STRENGTH',description:'Elevação da pelve em decúbito dorsal com apoio estável dos pés.'},
  savasana:{pillars:['Recuperação','Atenção','Respiração'],muscleActivation:{'Relaxamento / atividade postural leve':100},jointsInvolved:['Corpo em repouso apoiado'],energyFocus:'RESTORATIVE',description:'Repouso deitado com suportes opcionais para conforto.'},
};

export const YOGA_POSES: YogaPose[] = [...BASE_YOGA_POSES, ...ADDED_YOGA_POSES].map((pose) => ({
  ...pose,
  category: pose.category ?? CATEGORY_BY_ID[pose.id] ?? 'flow',
  ...(!pose.pillars ? BASE_PROFILES[pose.id] : {}),
  ...(pose.id in BASE_PROFILES ? { dataConfidence: 'provisional' as const, sources: [USER_PROPOSAL_SOURCE] } : {}),
}));

export const GROUP_ORDER = [
  'Posturas em pé',
  'Equilíbrio em pé',
  'Transição e força',
  'Flexões à frente',
  'Extensões',
  'Torções',
  'Abertura de quadris',
  'Recuperação',
  'Encerramento',
  'Equilíbrios',
  'Posturas sentadas',
  'Posturas ajoelhadas',
  'Invertidas',
  'Mobilidade',
] as const;

export const getPoseById = (id: string): YogaPose | undefined => {
  return YOGA_POSES.find((pose) => pose.id === id);
};
