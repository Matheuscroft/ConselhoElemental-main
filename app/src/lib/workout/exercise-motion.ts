/**
 * Classificação de exercício em PADRÃO DE MOVIMENTO (o que a figura animada
 * mostra). Usa palavras do nome, a família e a categoria; nunca depende de
 * dados que só existem no navegador. É só apresentação: não toca em pontuação.
 *
 * Sempre devolve um id. Para modalidades cujos padrões ainda não foram
 * desenhados (corrida, ciclismo, natação, lutas) o id é RESERVADO: não existe
 * no registro, e `padraoExiste` decide se há figura.
 */

export interface ExercicioClassificavel {
  id?: string;
  name?: string;
  nameAlternate?: string;
  category?: string;
  modality?: string;
  family?: string;
  source?: string;
  equipment?: readonly string[];
  strengthProfile?: { equipmentIds?: readonly string[]; movementPattern?: string };
}

export interface Classificacao {
  readonly padrao: string;
  /** 'palavra' = regra do nome; 'perfil' = padrão de movimento do cadastro; 'categoria' = por modalidade; 'fallback' = genérico. */
  readonly motivo: 'palavra' | 'perfil' | 'categoria' | 'fallback';
}

/**
 * Ids que o classificador pode devolver SEM figura: yoga tem arte própria e
 * 'generico' é o exercício personalizado que não casa com nenhum padrão.
 */
export const PADROES_RESERVADOS: readonly string[] = ['yoga', 'generico'];

const limpar = (texto: string | undefined): string =>
  (texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

type Equip = 'barra' | 'halteres' | 'cabo' | 'maquina' | 'nenhum';

function equipamentoDe(nome: string, ex: ExercicioClassificavel): Equip {
  const ids = ex.strengthProfile?.equipmentIds ?? [];
  if (/halter|kettlebell/.test(nome)) return 'halteres';
  if (/polia|cabo|crossover|corda/.test(nome)) return 'cabo';
  if (/maquina|peck|pec deck|articulad|convergente/.test(nome)) return 'maquina';
  if (/barra|smith|militar/.test(nome)) return 'barra';
  if (ids.includes('dumbbell')) return 'halteres';
  if (ids.includes('cable')) return 'cabo';
  if (ids.includes('barbell') || ids.includes('ez_bar') || ids.includes('smith_machine')) return 'barra';
  if (ids.includes('selectorized_machine') || ids.includes('plate_loaded_machine')) return 'maquina';
  return 'nenhum';
}

interface Regra { readonly teste: RegExp; readonly resolve: (e: Equip, nome: string) => string }
const fixo = (id: string): ((e: Equip) => string) => () => id;

/** Ordem importa: a primeira que casa vence. Escritas sobre o nome sem acento, em minúsculas. */
const REGRAS_FORCA: readonly Regra[] = [
  { teste: /punho/, resolve: (e) => (e === 'barra' ? 'rosca-barra' : e === 'cabo' ? 'rosca-cabo' : 'rosca-halteres') },
  { teste: /(joelhos|pernas) .*na barra|joelhos elevados na barra/, resolve: fixo('elevacao-joelhos-barra') },
  { teste: /suspensao|dead hang|active hang|isometria .*(barra|chin|bracos flexionados)|front lever/, resolve: fixo('suspensao') },
  { teste: /barra fixa|chin-?up|pull-?up|muscle-?up|elevacao escapular na barra|peito a barra/, resolve: (_e, n) => (/assistida na maquina|puxada/.test(n) ? 'puxada-alta' : 'barra-fixa') },
  { teste: /remada australiana/, resolve: fixo('remada-australiana') },
  { teste: /puxada|pulldown|pullover/, resolve: fixo('puxada-alta') },
  { teste: /crucifixo inverso na maquina|face pull|rotacao externa/, resolve: fixo('remada-sentada') },
  { teste: /crucifixo inverso/, resolve: fixo('remada-curvada-halteres') },
  { teste: /remada/, resolve: (e, n) => (/baixa|sentada|maquina|articulada|polia|cabo/.test(n) || e === 'cabo' || e === 'maquina' ? 'remada-sentada' : e === 'halteres' ? 'remada-curvada-halteres' : 'remada-curvada-barra') },
  { teste: /mergulho|paralelas|dips/, resolve: fixo('mergulho') },
  { teste: /flexao pike|parada de maos/, resolve: fixo('flexao-pike') },
  { teste: /flexao.*(parede|inclinada)|inclinada.*flexao/, resolve: fixo('flexao-inclinada') },
  { teste: /flexao|burpee/, resolve: fixo('flexao') },
  { teste: /planche|arch hold|l-sit|prancha/, resolve: fixo('prancha') },
  { teste: /dragon flag|hollow|dead bug|abdominal|crunch|v-up|elevacao de pernas com pausa/, resolve: fixo('abdominal') },
  { teste: /woodchop|rotacao diagonal|pallof/, resolve: fixo('rotacao-tronco') },
  { teste: /encolhimento|fazendeiro/, resolve: fixo('carregada') },
  { teste: /supino fechado/, resolve: fixo('supino-barra') },
  { teste: /supino.*inclinado|inclinado.*supino/, resolve: (e) => (e === 'halteres' ? 'supino-inclinado-halteres' : 'supino-inclinado-barra') },
  { teste: /supino|pressao isometrica de peito/, resolve: (e, n) => (e === 'maquina' || e === 'cabo' || /convergente|articulado/.test(n) ? 'supino-maquina' : e === 'halteres' ? 'supino-halteres' : 'supino-barra') },
  { teste: /crucifixo|peck deck|pec deck|crossover|voador/, resolve: (e) => (e === 'cabo' ? 'crucifixo-cabo' : e === 'maquina' ? 'crucifixo-maquina' : 'crucifixo') },
  { teste: /desenvolvimento/, resolve: (e) => (e === 'barra' ? 'desenvolvimento-barra' : 'desenvolvimento-halteres') },
  { teste: /elevacao lateral/, resolve: fixo('elevacao-lateral') },
  { teste: /elevacao frontal/, resolve: fixo('elevacao-frontal') },
  { teste: /rosca/, resolve: (e) => (e === 'cabo' ? 'rosca-cabo' : e === 'halteres' ? 'rosca-halteres' : 'rosca-barra') },
  { teste: /acima da cabeca/, resolve: fixo('triceps-frances') },
  { teste: /testa/, resolve: fixo('triceps-testa') },
  { teste: /triceps/, resolve: fixo('triceps-polia') },
  { teste: /isometria na parede|wall sit/, resolve: fixo('cadeirinha') },
  { teste: /panturrilha|ponta dos pes/, resolve: (e) => (e === 'halteres' ? 'panturrilha-halteres' : 'panturrilha') },
  { teste: /leg press|hack/, resolve: fixo('leg-press') },
  { teste: /extensora/, resolve: fixo('extensora') },
  { teste: /flexora/, resolve: fixo('flexora') },
  { teste: /abdutora|adutora|abducao|aducao/, resolve: fixo('abducao-quadril') },
  { teste: /coice de gluteo|extensao de quadril/, resolve: fixo('coice-gluteo') },
  { teste: /elevacao pelvica|ponte/, resolve: (e) => (e === 'barra' ? 'elevacao-pelvica-barra' : 'ponte-gluteo') },
  { teste: /romeno|stiff|good morning/, resolve: (e, n) => (e === 'halteres' || /halter/.test(n) ? 'stiff-halteres' : 'stiff-barra') },
  { teste: /terra/, resolve: fixo('terra-barra') },
  { teste: /afundo|avanco|bulgaro|pistol|step-?up|subida no step/, resolve: (e) => (e === 'halteres' ? 'afundo-halteres' : 'afundo') },
  { teste: /agachamento.*(halter|goblet)|goblet/, resolve: fixo('agachamento-halter') },
  { teste: /agachamento.*(barra|smith)/, resolve: fixo('agachamento-barra') },
  { teste: /agachamento|squat/, resolve: fixo('agachamento-livre') },
];

/** Padrão de movimento do cadastro (strengthProfile.movementPattern), quando o nome não bastou. */
const POR_PERFIL: Readonly<Record<string, string>> = {
  horizontal_push: 'supino-barra', vertical_push: 'desenvolvimento-halteres',
  horizontal_pull: 'remada-curvada-barra', vertical_pull: 'puxada-alta',
  elbow_flexion: 'rosca-halteres', elbow_extension: 'triceps-polia', squat: 'agachamento-livre', hinge: 'stiff-barra',
  hip_extension: 'coice-gluteo', hip_abduction: 'abducao-quadril', hip_adduction: 'abducao-quadril',
  knee_extension: 'extensora', knee_flexion: 'flexora', calf_raise: 'panturrilha', trunk_flexion: 'abdominal',
  anti_rotation: 'rotacao-tronco', carry: 'carregada', shrug: 'carregada', isometric_hold: 'prancha',
};

const LUTA_FORMA = /formas|kata|sequencia|kendo|esgrima|espada|wai kru|ram muay/;
const LUTA_SOLO = /jiu|judo|luta olimpica|greco|luta livre|sambo|aikido|sumo|rolagem/;
const LUTA_CHUTE = /chute|taekwondo|capoeira|savate/;

/** Arte marcial pelo nome (que já traz a arte e o formato do treino). */
function padraoDeLuta(nome: string, familia: string): string {
  const texto = `${familia} ${nome}`;
  if (LUTA_FORMA.test(nome)) return 'luta-forma';
  if (LUTA_SOLO.test(texto)) return 'luta-solo';
  if (LUTA_CHUTE.test(texto)) return 'luta-chute';
  return 'luta-soco';
}

function categoriaDe(ex: ExercicioClassificavel): string {
  return ex.category ?? ex.modality ?? 'mixed';
}

export function classificarMovimento(ex: ExercicioClassificavel): Classificacao {
  const categoria = categoriaDe(ex);
  const nome = limpar(`${ex.name ?? ''} ${ex.nameAlternate ?? ''}`);
  const familia = limpar(ex.family);

  if (['strength', 'hypertrophy', 'calisthenics'].includes(categoria)) {
    const equip = equipamentoDe(nome, ex);
    for (const regra of REGRAS_FORCA) if (regra.teste.test(nome)) return { padrao: regra.resolve(equip, nome), motivo: 'palavra' };
    const perfil = ex.strengthProfile?.movementPattern;
    if (perfil && POR_PERFIL[perfil]) return { padrao: POR_PERFIL[perfil], motivo: 'perfil' };
    if (ex.source === 'custom') return { padrao: 'generico', motivo: 'fallback' };
    return { padrao: 'mobilidade', motivo: 'fallback' };
  }
  switch (categoria) {
    case 'running': return { padrao: 'corrida', motivo: 'categoria' };
    case 'cycling': return { padrao: 'pedalada', motivo: 'categoria' };
    case 'swimming': {
      const padrao = /peito/.test(nome) ? 'nado-peito' : /costas/.test(nome) ? 'nado-costas' : /borboleta/.test(nome) ? 'nado-borboleta' : 'nado-crawl';
      return { padrao, motivo: 'categoria' };
    }
    case 'martial_arts': return { padrao: padraoDeLuta(nome, familia), motivo: 'categoria' };
    case 'yoga': return { padrao: 'yoga', motivo: 'categoria' };
    case 'mobility': return { padrao: 'mobilidade', motivo: 'categoria' };
    case 'conditioning': return { padrao: 'condicionamento', motivo: 'categoria' };
    default: return { padrao: 'generico', motivo: 'fallback' };
  }
}

/** Id do padrão de movimento do exercício. Sempre devolve um id (pode ser reservado). */
export function padraoDeMovimento(ex: ExercicioClassificavel): string {
  return classificarMovimento(ex).padrao;
}
