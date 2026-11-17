/**
 * Padrões de movimento de musculação e calistenia: cada um é um loop curto de
 * poses de UMA figura desenhada. O que o exercício "parece" é o padrão, não o
 * aparelho: um agachamento é um agachamento com ou sem barra.
 *
 * As poses são escritas por ângulos absolutos (ver figura-tipos.ts) e
 * POSICIONADAS por `movimento`: cada chave declara onde um ponto fica (o pé
 * mais baixo no chão, as mãos na barra, o quadril no banco) e a raiz é
 * calculada para isso. Entre duas chaves o `movimento` gera quadros
 * intermediários também ancorados, para o pé não "patinar" na interpolação
 * linear de ângulos. O contrato pede "pelo menos dois quadros"; aqui cada padrão
 * tem 2 a 4 chaves escritas à mão e alguns quadros gerados entre elas.
 *
 * Quando as mãos E os pés estão plantados (flexão, prancha, remada australiana,
 * pike) as duas âncoras não cabem num ângulo escrito à mão: `poseDeApoios`
 * resolve o corpo reto entre o pé e o ombro e `ik` fecha o braço até a mão.
 */

import type { Equipamento, Junta, PadraoDef, Pose, Quadro } from './figura-tipos';
import { CHAO, PROPORCOES, Y_CONTATO, esqueletoDe, type NomeDePonto, type Pt } from './figura-rig';
import type { PadraoExtra } from './figura-desenho';

/* ------------------------------------------------------------------ */
/* Escrita de poses                                                    */
/* ------------------------------------------------------------------ */

/** Atalhos: sem sufixo vale para os dois lados; com E ou D, só para aquele lado. */
export interface Ang {
  t?: number; p?: number;
  b?: number; a?: number; bE?: number; aE?: number; bD?: number; aD?: number;
  c?: number; k?: number; cE?: number; kE?: number; cD?: number; kD?: number;
}

export const juntas = (o: Ang): Record<Junta, number> => ({
  tronco: o.t ?? 0,
  pescoco: o.p ?? 0,
  bracoE: o.bE ?? o.b ?? 0,
  antebracoE: o.aE ?? o.a ?? 0,
  bracoD: o.bD ?? o.b ?? 0,
  antebracoD: o.aD ?? o.a ?? 0,
  coxaE: o.cE ?? o.c ?? 0,
  canelaE: o.kE ?? o.k ?? 0,
  coxaD: o.cD ?? o.c ?? 0,
  canelaD: o.kD ?? o.k ?? 0,
});

/** Braços em vista frontal: o lado D espelha o E. */
export const espelhados = (bE: number, aE: number): Ang => ({ bE, aE, bD: -bE, aD: -aE });
/** Pernas em vista frontal: o lado D espelha o E. */
export const pernasEspelhadas = (cE: number, kE: number): Ang => ({ cE, kE, cD: -cE, kD: -kE });

const JUNTAS_LISTA: readonly Junta[] = [
  'tronco', 'pescoco', 'bracoE', 'antebracoE', 'bracoD', 'antebracoD', 'coxaE', 'canelaE', 'coxaD', 'canelaD',
];

/** Onde a pose é fixada: o ponto de `x` fica na abscissa da chave; o de `y`, na ordenada (ou o pé mais baixo no chão). */
export interface Ancora { readonly x: NomeDePonto; readonly y: NomeDePonto | 'pes' }

/** Uma pose-chave: ângulos e os valores de ancoragem (`x`; `y` é opcional para 'pes'). */
export interface Chave { readonly a: Ang; readonly x: number; readonly y?: number; /** Instante da chave (0..1); padrão: espaçadas por igual. */ readonly t?: number }

export interface OpcoesMovimento {
  readonly vista?: 'lado' | 'frente';
  readonly passos?: number;
  /** Deitado de costas: o tronco é inclinado até o ombro tocar o chão (ignora `t` das chaves). */
  readonly ombroNoChao?: boolean;
}

export const r2 = (v: number): number => Math.round(v * 100) / 100;
export const RAD = Math.PI / 180;
export const DEG = 180 / Math.PI;

export function ancorar(ang: Record<Junta, number>, anc: Ancora, x: number, y: number | undefined, vista: 'lado' | 'frente'): Pose {
  const sk = esqueletoDe({ raiz: { x: 0, y: 0 }, ang }, vista);
  const dx = x - sk[anc.x].x;
  const dy = anc.y === 'pes'
    ? (y ?? Y_CONTATO) - Math.max(sk.peE.y, sk.peD.y)
    : (y ?? 0) - sk[anc.y].y;
  return { raiz: { x: r2(dx), y: r2(dy) }, ang };
}

function posicionar(ang: Record<Junta, number>, anc: Ancora, x: number, y: number | undefined, vista: 'lado' | 'frente', ombroNoChao: boolean): Pose {
  if (!ombroNoChao) return ancorar(ang, anc, x, y, vista);
  const alvo = CHAO - 2.7;
  let lo = -180, hi = -90;
  for (let i = 0; i < 40; i++) {
    const meio = (lo + hi) / 2;
    const teste = ancorar({ ...ang, tronco: meio }, anc, x, y, vista);
    const sk = esqueletoDe(teste, vista);
    // Mais perto de -180, mais o ombro desce: cresce y.
    if (sk.ombroE.y > alvo) lo = meio; else hi = meio;
  }
  return ancorar({ ...ang, tronco: r2((lo + hi) / 2) }, anc, x, y, vista);
}

export function movimento(anc: Ancora, chaves: readonly Chave[], opcoes: OpcoesMovimento = {}): Quadro[] {
  const vista = opcoes.vista ?? 'lado';
  const passos = opcoes.passos ?? 4;
  const ombro = opcoes.ombroNoChao ?? false;
  const n = chaves.length;
  const saida: Quadro[] = [];
  for (let i = 0; i < n; i++) {
    const a = chaves[i];
    const angA = juntas(a.a);
    const tA = a.t ?? i / (n - 1);
    saida.push({ t: tA, pose: posicionar(angA, anc, a.x, a.y, vista, ombro) });
    if (i === n - 1) break;
    const b = chaves[i + 1];
    const angB = juntas(b.a);
    const tB = b.t ?? (i + 1) / (n - 1);
    for (let k = 1; k < passos; k++) {
      const u = k / passos;
      const ang = {} as Record<Junta, number>;
      for (const j of JUNTAS_LISTA) ang[j] = r2(angA[j] + (angB[j] - angA[j]) * u);
      const y = a.y === undefined && b.y === undefined ? undefined : (a.y ?? Y_CONTATO) + ((b.y ?? Y_CONTATO) - (a.y ?? Y_CONTATO)) * u;
      saida.push({ t: tA + (tB - tA) * u, pose: posicionar(ang, anc, a.x + (b.x - a.x) * u, y, vista, ombro) });
    }
  }
  return saida;
}

/* ------------------------------------------------------------------ */
/* Corpo apoiado em mãos e pés                                         */
/* ------------------------------------------------------------------ */

export type LadoDoCotovelo = 'tras' | 'cima' | 'baixo' | 'frente';

/** Cinemática inversa do braço: do ombro até a mão. Devolve [braço, antebraço] em graus. */
export function ik(ombro: Pt, mao: Pt, cotovelo: LadoDoCotovelo): [number, number] {
  const L1 = PROPORCOES.braco, L2 = PROPORCOES.antebraco;
  const dx = mao.x - ombro.x, dy = mao.y - ombro.y;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(L1 - L2) + 0.05), L1 + L2 - 0.05);
  const theta = Math.atan2(dx, dy);
  const alfa = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  let melhor = 0, custo = Infinity;
  for (const b of [theta + alfa, theta - alfa]) {
    const ex = ombro.x + L1 * Math.sin(b), ey = ombro.y + L1 * Math.cos(b);
    const c = cotovelo === 'tras' ? ex : cotovelo === 'frente' ? -ex : cotovelo === 'cima' ? ey : -ey;
    if (c < custo) { custo = c; melhor = b; }
  }
  const ex = ombro.x + L1 * Math.sin(melhor), ey = ombro.y + L1 * Math.cos(melhor);
  return [r2(melhor * DEG), r2(Math.atan2(mao.x - ex, mao.y - ey) * DEG)];
}

export const PERNA = PROPORCOES.coxa + PROPORCOES.canela;
export const TRONCO_ATE_OMBRO = PROPORCOES.tronco - PROPORCOES.descidaOmbro;

/**
 * Corpo com pernas retas, do tornozelo `A` ao ombro `S` (o quadril é a dobra
 * entre os dois: reto se a distância for a soma dos segmentos, em "pike" se menor)
 * e o braço fechado até a mão `H`.
 */
export function poseDeApoios(A: Pt, S: Pt, H: Pt, cotovelo: LadoDoCotovelo, pescoco: number, extra: Ang = {}): Pose {
  const d = Math.min(Math.hypot(S.x - A.x, S.y - A.y), PERNA + TRONCO_ATE_OMBRO - 0.01);
  const ux = (S.x - A.x) / (d || 1), uy = (S.y - A.y) / (d || 1);
  const a = (PERNA * PERNA - TRONCO_ATE_OMBRO * TRONCO_ATE_OMBRO + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(PERNA * PERNA - a * a, 0));
  const c1 = { x: A.x + a * ux + h * uy, y: A.y + a * uy - h * ux };
  const c2 = { x: A.x + a * ux - h * uy, y: A.y + a * uy + h * ux };
  const quadril = c1.y < c2.y ? c1 : c2;
  const t = Math.atan2(S.x - quadril.x, -(S.y - quadril.y)) * DEG;
  const perna = Math.atan2(A.x - quadril.x, A.y - quadril.y) * DEG;
  const [b, ante] = ik(S, H, cotovelo);
  return {
    raiz: { x: r2(quadril.x), y: r2(quadril.y) },
    ang: juntas({ t, p: pescoco, b, a: ante, c: perna, k: perna, ...extra }),
  };
}

/** Amostra `n` poses de uma família contínua (parâmetro `u` de 0 a 1). */
export function amostrar(n: number, f: (u: number) => Pose): Quadro[] {
  const saida: Quadro[] = [];
  for (let i = 0; i < n; i++) saida.push({ t: i / (n - 1), pose: f(i / (n - 1)) });
  return saida;
}

export const lerp = (a: number, b: number, u: number): number => a + (b - a) * u;

/** Ponto do ombro a `fracao` do comprimento total do corpo, na linha que sai do tornozelo com elevação `alfa` (graus). */
export const ombroNaLinha = (A: Pt, alfa: number, fracao = 1): Pt => ({
  x: A.x + (PERNA + TRONCO_ATE_OMBRO) * fracao * 0.9999 * Math.cos(alfa * RAD),
  y: A.y - (PERNA + TRONCO_ATE_OMBRO) * fracao * 0.9999 * Math.sin(alfa * RAD),
});

/* ------------------------------------------------------------------ */
/* Registro local                                                      */
/* ------------------------------------------------------------------ */

const lista: PadraoDef[] = [];
const extras: Record<string, PadraoExtra> = {};

function padrao(
  id: string, rotulo: string, vista: 'lado' | 'frente', equipamento: Equipamento, duracaoS: number,
  quadros: Quadro[], opcoes: { chao?: boolean; apoio?: PadraoDef['apoio']; extra?: PadraoExtra; modo?: PadraoDef['modo'] } = {},
): PadraoDef {
  const def: PadraoDef = { id, rotulo, vista, equipamento, duracaoS, quadros, chao: opcoes.chao, apoio: opcoes.apoio, modo: opcoes.modo };
  lista.push(def);
  if (opcoes.extra) extras[id] = opcoes.extra;
  return def;
}

/** Mesmos quadros, outro aparelho. */
function variante(base: PadraoDef, id: string, rotulo: string, equipamento: Equipamento, extra?: PadraoExtra): PadraoDef {
  const def: PadraoDef = { ...base, id, rotulo, equipamento };
  lista.push(def);
  const herdado = extras[base.id];
  if (extra || herdado) extras[id] = { ...herdado, ...extra };
  return def;
}

const NO_CHAO: Ancora = { x: 'peE', y: 'pes' };
const NO_BANCO: Ancora = { x: 'quadril', y: 'pes' };
const NA_BARRA: Ancora = { x: 'maoE', y: 'maoE' };
const Y_BARRA = 14;

/* ------------------------------------------------------------------ */
/* Empurrar                                                            */
/* ------------------------------------------------------------------ */

/** Deitado de costas com os pés no chão (cabeça à esquerda): tronco horizontal, cabeça apoiada. */
const DEITADO = { t: -90, p: -72, c: 75, k: -15 } as const;

const supinoBarra = padrao('supino-barra', 'Supino reto com barra', 'lado', 'barra', 2.6, movimento(NO_BANCO, [
  { x: 62, a: { ...DEITADO, b: 78, a: 180 } },
  { x: 62, a: { ...DEITADO, b: 180, a: 180 } },
]), { apoio: 'banco-deitado' });
variante(supinoBarra, 'supino-halteres', 'Supino reto com halteres', 'halteres');

const SUPINO_INCLINADO = { t: -50, p: -40, c: 82, k: -8 } as const;
const supinoInclinadoBarra = padrao('supino-inclinado-barra', 'Supino inclinado com barra', 'lado', 'barra', 2.6, movimento(NO_BANCO, [
  { x: 60, a: { ...SUPINO_INCLINADO, b: 62, a: 180 } },
  { x: 60, a: { ...SUPINO_INCLINADO, b: 178, a: 180 } },
]), { apoio: 'banco-deitado' });
variante(supinoInclinadoBarra, 'supino-inclinado-halteres', 'Supino inclinado com halteres', 'halteres');

const supinoMaquina = padrao('supino-maquina', 'Supino na máquina', 'lado', 'maquina', 2.6, movimento(NO_BANCO, [
  { x: 40, a: { t: -6, p: 0, c: 86, k: -4, b: 30, a: 178 } },
  { x: 40, a: { t: -6, p: 0, c: 86, k: -4, b: 88, a: 90 } },
]));
void supinoMaquina;

/** Flexão: ombro desce em arco em torno do pé; a mão fica plantada. */
const FLEXAO_A: Pt = { x: 18, y: Y_CONTATO - 3.6 };
const alturaDoBraco = PROPORCOES.braco + PROPORCOES.antebraco;
const alfaTopo = Math.asin((FLEXAO_A.y - (Y_CONTATO - alturaDoBraco)) / (PERNA + TRONCO_ATE_OMBRO)) * DEG;
const FLEXAO_H: Pt = { x: ombroNaLinha(FLEXAO_A, alfaTopo).x, y: Y_CONTATO };

padrao('flexao', 'Flexão de braços', 'lado', 'nenhum', 2.4, amostrar(9, (u) => poseDeApoios(
  FLEXAO_A, ombroNaLinha(FLEXAO_A, lerp(alfaTopo, 7, u)), FLEXAO_H, 'tras', lerp(86, 100, u),
)));

/** Flexão inclinada: mãos num apoio alto (banco, parede). */
const ALTURA_BANCO = 14;
const INCL_A: Pt = { x: 12, y: Y_CONTATO };
const inclH0 = Y_CONTATO - ALTURA_BANCO;
const alfaInclTopo = Math.asin((INCL_A.y - (inclH0 - alturaDoBraco)) / (PERNA + TRONCO_ATE_OMBRO)) * DEG;
const INCL_H: Pt = { x: ombroNaLinha(INCL_A, alfaInclTopo).x, y: inclH0 };
padrao('flexao-inclinada', 'Flexão inclinada', 'lado', 'nenhum', 2.4, amostrar(9, (u) => poseDeApoios(
  INCL_A, ombroNaLinha(INCL_A, lerp(alfaInclTopo, alfaInclTopo - 17, u)), INCL_H, 'tras', lerp(66, 76, u),
)), { extra: { suporteMaos: 'banco' } });

/** Flexão pike: quadril alto, a cabeça desce entre as mãos. */
const PIKE_A: Pt = { x: 14, y: Y_CONTATO };
const PIKE_H: Pt = { x: 48, y: Y_CONTATO };
padrao('flexao-pike', 'Flexão pike', 'lado', 'nenhum', 2.6, amostrar(9, (u) => poseDeApoios(
  PIKE_A, { x: lerp(PIKE_H.x, PIKE_H.x + 9, u), y: lerp(Y_CONTATO - 22, Y_CONTATO - 11, u) }, PIKE_H, 'tras', lerp(100, 130, u),
)));

/** Crucifixo (voador): braços abrem no plano do peito, cotovelos levemente dobrados. */
const FRENTE_EM_PE = { t: 0, p: 0, ...pernasEspelhadas(-4, -4) } as const;
const crucifixo = padrao('crucifixo', 'Crucifixo (voador)', 'frente', 'halteres', 2.4, movimento(NO_CHAO, [
  { x: 50, a: { ...FRENTE_EM_PE, ...espelhados(-98, -120) } },
  { x: 50, a: { ...FRENTE_EM_PE, ...espelhados(-62, 80) } },
], { vista: 'frente' }));
variante(crucifixo, 'crucifixo-cabo', 'Crucifixo no cabo', 'cabo', { ancoraCabo: { x: 50, y: 16 }, cabos: 'cruzado' });
variante(crucifixo, 'crucifixo-maquina', 'Voador na máquina', 'maquina', { semEncosto: false });

/** Desenvolvimento: da altura dos ombros até os braços estendidos acima da cabeça. */
const desenvolvimentoHalteres = padrao('desenvolvimento-halteres', 'Desenvolvimento com halteres', 'frente', 'halteres', 2.8, movimento(NO_CHAO, [
  { x: 50, a: { ...FRENTE_EM_PE, ...espelhados(-96, -178) } },
  { x: 50, a: { ...FRENTE_EM_PE, ...espelhados(-166, -176) } },
], { vista: 'frente' }));
void desenvolvimentoHalteres;

padrao('desenvolvimento-barra', 'Desenvolvimento com barra', 'lado', 'barra', 2.8, movimento(NO_CHAO, [
  { x: 44, a: { t: 0, p: 0, b: 36, a: 176, c: 2, k: 0 } },
  { x: 44, a: { t: 0, p: 8, b: 172, a: 180, c: 2, k: 0 } },
]));

/** Elevação lateral: braços sobem pelos lados até a altura dos ombros. */
padrao('elevacao-lateral', 'Elevação lateral', 'frente', 'halteres', 2.6, movimento(NO_CHAO, [
  { x: 50, a: { ...FRENTE_EM_PE, ...espelhados(-9, -9) } },
  { x: 50, a: { ...FRENTE_EM_PE, ...espelhados(-84, -92) } },
], { vista: 'frente' }));

padrao('elevacao-frontal', 'Elevação frontal', 'lado', 'halteres', 2.6, movimento(NO_CHAO, [
  { x: 42, a: { t: 0, p: 0, b: 4, a: 4, c: 0, k: 0 } },
  { x: 42, a: { t: -2, p: 0, b: 88, a: 92, c: 0, k: 0 } },
]));

/* ------------------------------------------------------------------ */
/* Tríceps e bíceps                                                    */
/* ------------------------------------------------------------------ */

padrao('triceps-polia', 'Tríceps na polia', 'lado', 'cabo', 2.2, movimento(NO_CHAO, [
  { x: 40, a: { t: 8, p: 4, b: 2, a: 118, c: 2, k: 0 } },
  { x: 40, a: { t: 8, p: 4, b: 4, a: 8, c: 2, k: 0 } },
]));

const trTesta = padrao('triceps-testa', 'Tríceps testa', 'lado', 'barra', 2.6, movimento(NO_BANCO, [
  { x: 62, a: { ...DEITADO, b: 182, a: 182 } },
  { x: 62, a: { ...DEITADO, b: 182, a: 262 } },
]), { apoio: 'banco-deitado' });
void trTesta;

padrao('triceps-frances', 'Tríceps acima da cabeça', 'lado', 'halteres', 2.6, movimento(NO_CHAO, [
  { x: 42, a: { t: 0, p: 0, b: 140, a: 142, c: 0, k: 0 } },
  { x: 42, a: { t: 0, p: 0, b: 140, a: 305, c: 0, k: 0 } },
]));

padrao('mergulho', 'Mergulho nas paralelas', 'lado', 'barra-fixa', 2.6, movimento(NA_BARRA, [
  { x: 50, y: 46, a: { t: 20, p: 14, b: 0, a: 0, c: -6, k: -80 } },
  { x: 50, y: 46, a: { t: 32, p: 26, b: -84, a: 24, c: 4, k: -80 } },
]), { chao: false });

const roscaBarra = padrao('rosca-barra', 'Rosca direta', 'lado', 'barra', 2.4, movimento(NO_CHAO, [
  { x: 42, a: { t: 0, p: 0, b: 3, a: 6, c: 0, k: 0 } },
  { x: 42, a: { t: -3, p: 0, b: 12, a: 142, c: 0, k: 0 } },
]));
variante(roscaBarra, 'rosca-halteres', 'Rosca com halteres', 'halteres');
variante(roscaBarra, 'rosca-cabo', 'Rosca no cabo', 'cabo', { ancoraCabo: { x: 92, y: CHAO - 8 } });

/* ------------------------------------------------------------------ */
/* Puxar                                                               */
/* ------------------------------------------------------------------ */

const HINGE = { t: 62, p: 36, c: 22, k: -4 } as const;
const remadaCurvada = padrao('remada-curvada-barra', 'Remada curvada com barra', 'lado', 'barra', 2.4, movimento(NO_CHAO, [
  { x: 36, a: { ...HINGE, b: 2, a: 2 } },
  { x: 36, a: { ...HINGE, b: -50, a: -6 } },
]));
variante(remadaCurvada, 'remada-curvada-halteres', 'Remada curvada com halteres', 'halteres');

padrao('remada-sentada', 'Remada sentada no cabo', 'lado', 'cabo', 2.4, movimento(NO_BANCO, [
  { x: 36, a: { t: 14, p: 8, b: 78, a: 82, c: 76, k: 46 } },
  { x: 36, a: { t: -4, p: 0, b: -40, a: 14, c: 76, k: 46 } },
]), { apoio: 'banco-deitado', extra: { semEncosto: true, ancoraCabo: { x: 96, y: CHAO - 18 } } });

/** Remada australiana: corpo reto sob a barra, os calcanhares no chão. */
const AUS_A: Pt = { x: 90, y: Y_CONTATO };
const AUS_H: Pt = { x: 90 - 51.1, y: 52 };
padrao('remada-australiana', 'Remada australiana', 'lado', 'barra-fixa', 2.6, amostrar(9, (u) => poseDeApoios(
  AUS_A, ombroNaLinha(AUS_A, lerp(166, 150, u)), AUS_H, 'baixo', lerp(-72, -66, u),
)), { apoio: 'barra-acima' });

padrao('puxada-alta', 'Puxada alta', 'lado', 'cabo', 2.6, movimento(NO_BANCO, [
  { x: 32, a: { t: -8, p: -2, b: 168, a: 176, c: 86, k: 4 } },
  { x: 32, a: { t: -14, p: -4, b: 14, a: 178, c: 86, k: 4 } },
]), { apoio: 'banco-deitado', extra: { semEncosto: true } });

const barraFixa = padrao('barra-fixa', 'Barra fixa', 'lado', 'barra-fixa', 2.8, movimento(NA_BARRA, [
  { x: 50, y: Y_BARRA, a: { t: 0, p: 0, b: 142, a: 152, c: 10, k: -52 } },
  { x: 50, y: Y_BARRA, a: { t: -8, p: -4, b: 52, a: 178, c: 6, k: -66 } },
]), { chao: false, apoio: 'barra-acima' });
void barraFixa;

padrao('suspensao', 'Suspensão na barra', 'lado', 'barra-fixa', 3.2, movimento(NA_BARRA, [
  { x: 50, y: Y_BARRA, a: { t: 2, p: 0, b: 142, a: 152, c: 8, k: -46 } },
  { x: 50, y: Y_BARRA, a: { t: -2, p: 0, b: 142, a: 152, c: -4, k: -56 } },
]), { chao: false, apoio: 'barra-acima' });

/* ------------------------------------------------------------------ */
/* Pernas                                                              */
/* ------------------------------------------------------------------ */

padrao('agachamento-livre', 'Agachamento livre', 'lado', 'nenhum', 3, movimento(NO_CHAO, [
  { x: 42, a: { b: 90, a: 90 } },
  { x: 42, a: { t: 42, p: 10, b: 90, a: 90, c: 97, k: -38 } },
]));

const agachamentoBarra = padrao('agachamento-barra', 'Agachamento com barra', 'lado', 'barra', 3, movimento(NO_CHAO, [
  { x: 42, a: { b: -30, a: 170 } },
  { x: 42, a: { t: 48, p: 18, b: -30, a: 170, c: 100, k: -38 } },
]));
void agachamentoBarra;

padrao('agachamento-halter', 'Agachamento com halter (goblet)', 'lado', 'halteres', 3, movimento(NO_CHAO, [
  { x: 42, a: { b: 12, a: 165 } },
  { x: 42, a: { t: 26, p: 8, b: 12, a: 165, c: 106, k: -34 } },
]));

padrao('leg-press', 'Leg press', 'lado', 'maquina', 2.8, movimento({ x: 'quadril', y: 'quadril' }, [
  { x: 38, y: 62, a: { t: -50, p: -50, b: 50, a: 50, c: 133, k: 131 } },
  { x: 38, y: 62, a: { t: -50, p: -50, b: 50, a: 50, c: 150, k: 70 } },
]), { extra: { placaPes: 133, anguloPe: 133 } });

const afundo = padrao('afundo', 'Afundo', 'lado', 'nenhum', 3, movimento(NO_CHAO, [
  { x: 52, a: { t: 0, p: 0, b: 6, a: 6, cE: 15, kE: 0, cD: -15, kD: -18 } },
  { x: 52, a: { t: 2, p: 0, b: 6, a: 6, cE: 85, kE: -5, cD: -25, kD: -95 } },
]));
variante(afundo, 'afundo-halteres', 'Afundo com halteres', 'halteres');

/* ------------------------------------------------------------------ */
/* Dobradiça de quadril                                                */
/* ------------------------------------------------------------------ */

padrao('terra-barra', 'Levantamento terra', 'lado', 'barra', 3, movimento(NO_CHAO, [
  { x: 52, a: { t: 66, p: 40, b: 4, a: 4, c: 74, k: -18 } },
  { x: 52, a: { t: 0, p: 0, b: 2, a: 2, c: 0, k: 0 } },
]));

const stiff = padrao('stiff-barra', 'Stiff com barra', 'lado', 'barra', 3, movimento(NO_CHAO, [
  { x: 40, a: { t: 0, p: 0, b: 2, a: 2, c: 0, k: 0 } },
  { x: 40, a: { t: 72, p: 42, b: 0, a: 0, c: 30, k: -5 } },
]));
variante(stiff, 'stiff-halteres', 'Stiff com halteres', 'halteres');

/* ------------------------------------------------------------------ */
/* Glúteos e panturrilha                                               */
/* ------------------------------------------------------------------ */

const ponte = padrao('ponte-gluteo', 'Elevação pélvica no chão', 'lado', 'nenhum', 2.6, movimento(NO_CHAO, [
  { x: 78, a: { t: -90, p: -78, b: 90, a: 90, c: 135, k: 36 } },
  { x: 78, a: { t: -125, p: -58, b: 90, a: 90, c: 94, k: 37 } },
]));

const panturrilha = padrao('panturrilha', 'Elevação de panturrilha', 'lado', 'nenhum', 2.2, movimento(NO_CHAO, [
  { x: 44, y: Y_CONTATO, a: { t: 0, p: 0, b: 2, a: 8, c: 0, k: 0 } },
  { x: 46, y: Y_CONTATO - 4, a: { t: 0, p: 0, b: 2, a: 8, c: 6, k: 6 } },
]));

variante(ponte, 'elevacao-pelvica-barra', 'Elevação pélvica com barra', 'barra');
variante(panturrilha, 'panturrilha-halteres', 'Panturrilha com halteres', 'halteres');

padrao('coice-gluteo', 'Extensão de quadril (coice)', 'lado', 'nenhum', 2.4, movimento({ x: 'peD', y: 'pes' }, [
  { x: 48, a: { t: 14, p: 8, b: 50, a: 50, cE: 0, kE: 0, cD: 0, kD: 0 } },
  { x: 48, a: { t: 18, p: 10, b: 50, a: 50, cE: -34, kE: -42, cD: 0, kD: 0 } },
]));

padrao('extensora', 'Cadeira extensora', 'lado', 'maquina', 2.4, movimento({ x: 'quadril', y: 'quadril' }, [
  { x: 40, y: 69.6, a: { t: -5, p: 0, b: 30, a: 60, c: 88, k: 4 } },
  { x: 40, y: 69.6, a: { t: -5, p: 0, b: 30, a: 60, c: 88, k: 84 } },
]));
variante(lista[lista.length - 1], 'flexora', 'Mesa flexora', 'maquina');

padrao('abducao-quadril', 'Abdução de quadril', 'frente', 'nenhum', 2.4, movimento({ x: 'peD', y: 'pes' }, [
  { x: 56, a: { t: 0, p: 0, ...espelhados(-8, -8), cE: -2, kE: -2, cD: 2, kD: 2 } },
  { x: 56, a: { t: 3, p: 0, ...espelhados(-8, -8), cE: -36, kE: -36, cD: 2, kD: 2 } },
], { vista: 'frente' }));

padrao('carregada', 'Caminhada com carga', 'lado', 'halteres', 2.4, movimento({ x: 'quadril', y: 'pes' }, [
  { x: 44, a: { t: 0, p: 0, b: 0, a: 0, cE: 16, kE: 0, cD: -16, kD: -22 } },
  { x: 44, a: { t: 0, p: 0, b: 0, a: 0, cE: -16, kE: -22, cD: 16, kD: 0 } },
]));

padrao('cadeirinha', 'Isometria na parede', 'lado', 'nenhum', 3.2, movimento(NO_BANCO, [
  { x: 46, a: { t: 0, p: 0, b: 40, a: 72, c: 90, k: 0 } },
  { x: 46, a: { t: 0, p: 0, b: 40, a: 72, c: 94, k: 3 } },
]), { extra: { paredeAtras: true } });

/* ------------------------------------------------------------------ */
/* Tronco                                                              */
/* ------------------------------------------------------------------ */

padrao('abdominal', 'Abdominal', 'lado', 'nenhum', 2.2, movimento(NO_CHAO, [
  { x: 78, a: { t: -90, p: -76, b: -150, a: 20, c: 135, k: 36 } },
  { x: 78, a: { t: -52, p: -48, b: -150, a: 20, c: 135, k: 36 } },
]));

padrao('elevacao-joelhos-barra', 'Elevação de joelhos na barra', 'lado', 'barra-fixa', 2.6, movimento(NA_BARRA, [
  { x: 50, y: Y_BARRA, a: { t: 0, p: 0, b: 142, a: 152, c: 6, k: -8 } },
  { x: 50, y: Y_BARRA, a: { t: -14, p: -6, b: 142, a: 152, c: 98, k: 14 } },
]), { chao: false, apoio: 'barra-acima' });

/** Prancha: o corpo é uma linha reta sobre os antebraços e a ponta dos pés; o quadril respira. */
const PRANCHA_A: Pt = { x: 14, y: Y_CONTATO - 3.6 };
const PRANCHA_S: Pt = { x: 14 + 51.6, y: Y_CONTATO - 11.5 };
const PRANCHA_H: Pt = { x: PRANCHA_S.x + 10.5, y: Y_CONTATO };
padrao('prancha', 'Prancha isométrica', 'lado', 'nenhum', 3.2, amostrar(5, (u) => poseDeApoios(
  PRANCHA_A, { x: PRANCHA_S.x - lerp(0, 1.5, u), y: PRANCHA_S.y - lerp(0, 0.6, u) }, PRANCHA_H, 'baixo', lerp(88, 92, u),
)));

/** Lenhador no cabo, visto de lado: das mãos altas atrás para baixo, à frente, com o tronco dobrando. */
padrao('rotacao-tronco', 'Rotação de tronco (lenhador)', 'lado', 'cabo', 2.4, movimento(NO_CHAO, [
  { x: 40, a: { t: -4, p: -6, b: 196, a: 190, c: 4, k: 2 } },
  { x: 40, a: { t: 44, p: 30, b: 36, a: 34, c: 22, k: -6 } },
]), { extra: { ancoraCabo: { x: 8, y: 6 } } });

padrao('mobilidade', 'Mobilidade e alongamento', 'frente', 'nenhum', 3.4, movimento(NO_CHAO, [
  { x: 50, a: { t: 0, p: 0, ...espelhados(-8, -8), ...pernasEspelhadas(-3, -3) } },
  { x: 50, a: { t: 13, p: 8, ...espelhados(-170, -176), ...pernasEspelhadas(-3, -3) } },
], { vista: 'frente' }));

export const PADROES_FORCA: readonly PadraoDef[] = lista;
export const EXTRAS_FORCA: Readonly<Record<string, PadraoExtra>> = extras;

