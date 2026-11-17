/**
 * Motor de desenho das figuras de exercício: cinemática direta pura.
 *
 * Nada aqui toca o DOM nem o React. Dado um `Pose` (ângulos ABSOLUTOS, ver
 * figura-tipos.ts) e as proporções do corpo, `resolver` devolve onde está cada
 * junta; `amostrarQuadros` interpola os quadros de um padrão; `desenhar` conta
 * à `Pincel` (linhas e círculos) o que deve ser traçado, e o componente decide
 * se isso vira atributos de SVG por ref (animação) ou props de React (estático).
 *
 * Convenções fixadas além do contrato (todas medidas no espaço 100 x 100):
 *  - O chão fica em `CHAO`. O tornozelo de um pé apoiado e chato fica em
 *    `Y_CONTATO` (um pouco acima do chão, para a espessura do traço encostar).
 *    Mãos apoiadas (flexão, prancha) também usam `Y_CONTATO`.
 *  - Pé: no modo 'lado' ele aponta para a direita. Se o tornozelo está elevado
 *    até `COMPRIMENTO_PE`, a ponta do pé toca o chão (calcanhar levantado:
 *    panturrilha, prancha, perna de trás do afundo). Mais alto que isso, o pé
 *    fica relaxado, perpendicular à canela.
 *  - Modo 'frente': a junta com sufixo E fica à ESQUERDA da tela (ombro em
 *    x - larguraOmbro) e D à direita; nenhum lado é escurecido. Os pés apontam
 *    para fora.
 *  - Quadril/ombro em 'lado' coincidem (E e D saem do mesmo ponto).
 *  - O tronco é medido do quadril à base do pescoço; o ombro fica 1,8 abaixo.
 */

import type { Junta, PadraoDef, Pose, Quadro } from './figura-tipos';

/* ------------------------------------------------------------------ */
/* Medidas                                                             */
/* ------------------------------------------------------------------ */

export const CHAO = 88;
export const ALTURA_TORNOZELO = 1.3;
export const Y_CONTATO = CHAO - ALTURA_TORNOZELO;

export interface Proporcoes {
  readonly tronco: number;
  readonly pescoco: number;
  readonly cabecaR: number;
  readonly braco: number;
  readonly antebraco: number;
  readonly coxa: number;
  readonly canela: number;
  readonly pe: number;
  readonly larguraOmbro: number;
  readonly larguraQuadril: number;
  readonly descidaOmbro: number;
}

export const PROPORCOES: Proporcoes = {
  tronco: 21,
  pescoco: 6.9,
  cabecaR: 4.7,
  braco: 11.5,
  antebraco: 10.5,
  coxa: 17,
  canela: 16.5,
  pe: 4.6,
  larguraOmbro: 6.6,
  larguraQuadril: 3.8,
  descidaOmbro: 1.8,
};

export const COMPRIMENTO_PE = PROPORCOES.pe;

/* ------------------------------------------------------------------ */
/* Tipos de trabalho                                                   */
/* ------------------------------------------------------------------ */

export interface Pt { x: number; y: number }

export interface Esqueleto {
  quadril: Pt; quadrilE: Pt; quadrilD: Pt;
  pescoco: Pt; cabeca: Pt;
  ombroE: Pt; ombroD: Pt;
  cotoveloE: Pt; cotoveloD: Pt;
  maoE: Pt; maoD: Pt;
  joelhoE: Pt; joelhoD: Pt;
  peE: Pt; peD: Pt;
  pontaE: Pt; pontaD: Pt;
}

export type NomeDePonto = keyof Esqueleto;

export interface PoseMutavel {
  raiz: { x: number; y: number };
  ang: Record<Junta, number>;
}

export const JUNTAS: readonly Junta[] = [
  'tronco', 'pescoco', 'bracoE', 'antebracoE', 'bracoD', 'antebracoD',
  'coxaE', 'canelaE', 'coxaD', 'canelaD',
];

const pt = (): Pt => ({ x: 0, y: 0 });

export function criarEsqueleto(): Esqueleto {
  return {
    quadril: pt(), quadrilE: pt(), quadrilD: pt(), pescoco: pt(), cabeca: pt(),
    ombroE: pt(), ombroD: pt(), cotoveloE: pt(), cotoveloD: pt(), maoE: pt(), maoD: pt(),
    joelhoE: pt(), joelhoD: pt(), peE: pt(), peD: pt(), pontaE: pt(), pontaD: pt(),
  };
}

export function criarPose(): PoseMutavel {
  return {
    raiz: { x: 0, y: 0 },
    ang: { tronco: 0, pescoco: 0, bracoE: 0, antebracoE: 0, bracoD: 0, antebracoD: 0, coxaE: 0, canelaE: 0, coxaD: 0, canelaD: 0 },
  };
}

/* ------------------------------------------------------------------ */
/* Cinemática direta                                                   */
/* ------------------------------------------------------------------ */

const RAD = Math.PI / 180;

function pe(
  ax: number, ay: number, canelaGraus: number, lado: boolean, esquerda: boolean,
  tornozelo: Pt, ponta: Pt, pr: Proporcoes, anguloPe?: number,
): void {
  tornozelo.x = ax; tornozelo.y = ay;
  const L = pr.pe;
  if (!lado) {
    ponta.x = ax + (esquerda ? -L * 0.8 : L * 0.8);
    ponta.y = ay;
    return;
  }
  const elevado = Y_CONTATO - ay;
  if (elevado <= 0.5) {
    ponta.x = ax + L; ponta.y = ay;
  } else if (elevado < L * 0.98) {
    ponta.x = ax + Math.sqrt(L * L - elevado * elevado); ponta.y = Y_CONTATO;
  } else {
    const s = (anguloPe ?? canelaGraus) * RAD;
    ponta.x = ax + L * Math.cos(s); ponta.y = ay - L * Math.sin(s);
  }
}

/** Resolve todas as juntas. `saida` é reutilizada: não aloca. */
export function resolver(p: Pose, vista: 'lado' | 'frente', o: Esqueleto, pr: Proporcoes = PROPORCOES, anguloPe?: number): Esqueleto {
  const { x, y } = p.raiz;
  const a = p.ang;
  const lado = vista === 'lado';
  const st = Math.sin(a.tronco * RAD), ct = Math.cos(a.tronco * RAD);
  o.quadril.x = x; o.quadril.y = y;
  o.pescoco.x = x + pr.tronco * st; o.pescoco.y = y - pr.tronco * ct;
  const sx = x + (pr.tronco - pr.descidaOmbro) * st, sy = y - (pr.tronco - pr.descidaOmbro) * ct;
  const sp = Math.sin(a.pescoco * RAD), cp = Math.cos(a.pescoco * RAD);
  o.cabeca.x = o.pescoco.x + pr.pescoco * sp; o.cabeca.y = o.pescoco.y - pr.pescoco * cp;

  if (lado) {
    o.ombroE.x = o.ombroD.x = sx; o.ombroE.y = o.ombroD.y = sy;
    o.quadrilE.x = o.quadrilD.x = x; o.quadrilE.y = o.quadrilD.y = y;
  } else {
    const w = pr.larguraOmbro, h = pr.larguraQuadril;
    o.ombroE.x = sx - w * ct; o.ombroE.y = sy - w * st;
    o.ombroD.x = sx + w * ct; o.ombroD.y = sy + w * st;
    o.quadrilE.x = x - h * ct; o.quadrilE.y = y - h * st;
    o.quadrilD.x = x + h * ct; o.quadrilD.y = y + h * st;
  }

  let g = a.bracoE * RAD;
  o.cotoveloE.x = o.ombroE.x + pr.braco * Math.sin(g); o.cotoveloE.y = o.ombroE.y + pr.braco * Math.cos(g);
  g = a.antebracoE * RAD;
  o.maoE.x = o.cotoveloE.x + pr.antebraco * Math.sin(g); o.maoE.y = o.cotoveloE.y + pr.antebraco * Math.cos(g);
  g = a.bracoD * RAD;
  o.cotoveloD.x = o.ombroD.x + pr.braco * Math.sin(g); o.cotoveloD.y = o.ombroD.y + pr.braco * Math.cos(g);
  g = a.antebracoD * RAD;
  o.maoD.x = o.cotoveloD.x + pr.antebraco * Math.sin(g); o.maoD.y = o.cotoveloD.y + pr.antebraco * Math.cos(g);

  g = a.coxaE * RAD;
  o.joelhoE.x = o.quadrilE.x + pr.coxa * Math.sin(g); o.joelhoE.y = o.quadrilE.y + pr.coxa * Math.cos(g);
  g = a.canelaE * RAD;
  const aex = o.joelhoE.x + pr.canela * Math.sin(g), aey = o.joelhoE.y + pr.canela * Math.cos(g);
  pe(aex, aey, a.canelaE, lado, true, o.peE, o.pontaE, pr, anguloPe);
  g = a.coxaD * RAD;
  o.joelhoD.x = o.quadrilD.x + pr.coxa * Math.sin(g); o.joelhoD.y = o.quadrilD.y + pr.coxa * Math.cos(g);
  g = a.canelaD * RAD;
  const adx = o.joelhoD.x + pr.canela * Math.sin(g), ady = o.joelhoD.y + pr.canela * Math.cos(g);
  pe(adx, ady, a.canelaD, lado, false, o.peD, o.pontaD, pr, anguloPe);
  return o;
}

/* ------------------------------------------------------------------ */
/* Tempo, easing e interpolação                                         */
/* ------------------------------------------------------------------ */

export const easeInOutSine = (u: number): number => 0.5 - 0.5 * Math.cos(Math.PI * u);

/** Fração do tempo parada em cada extremo do movimento (o olho lê a pausa como controle). */
export const PAUSA_NO_EXTREMO = 0.07;

/**
 * Posição 0..1 ao longo de UMA metade do loop. O loop completo (`duracaoS`)
 * vai e volta (ping-pong), com uma pequena pausa em cada extremo.
 */
export function posicaoNoLoop(tempoS: number, duracaoS: number): number {
  const ciclo = ((tempoS % duracaoS) + duracaoS) % duracaoS / duracaoS;
  const q = ciclo < 0.5 ? ciclo * 2 : (1 - ciclo) * 2;
  const t = (q - PAUSA_NO_EXTREMO) / (1 - 2 * PAUSA_NO_EXTREMO);
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

/** Tempo (em segundos) em que o loop está exatamente na posição `t` indo para a frente. */
export const tempoDaPosicao = (t: number, duracaoS: number): number => (PAUSA_NO_EXTREMO + t * (1 - 2 * PAUSA_NO_EXTREMO)) * duracaoS * 0.5;

export function interpolarPose(a: Pose, b: Pose, u: number, o: PoseMutavel): PoseMutavel {
  o.raiz.x = a.raiz.x + (b.raiz.x - a.raiz.x) * u;
  o.raiz.y = a.raiz.y + (b.raiz.y - a.raiz.y) * u;
  for (let i = 0; i < JUNTAS.length; i++) {
    const j = JUNTAS[i];
    o.ang[j] = a.ang[j] + (b.ang[j] - a.ang[j]) * u;
  }
  return o;
}

/**
 * Pose do padrão na posição `t` (0..1 de uma metade do loop). O easing é um só,
 * sobre o percurso inteiro (suave nas pontas, contínuo no meio); entre quadros
 * vizinhos a interpolação é linear nos ângulos. Os quadros intermediários são
 * densos o bastante para que isso leia como um movimento só.
 */
export function amostrarQuadros(quadros: readonly Quadro[], t: number, o: PoseMutavel, suave = true): PoseMutavel {
  const n = quadros.length;
  const lim = t < 0 ? 0 : t > 1 ? 1 : t;
  const e = suave ? easeInOutSine(lim) : lim;
  if (e <= quadros[0].t) return interpolarPose(quadros[0].pose, quadros[0].pose, 0, o);
  if (e >= quadros[n - 1].t) return interpolarPose(quadros[n - 1].pose, quadros[n - 1].pose, 0, o);
  let i = 0;
  while (i < n - 2 && e > quadros[i + 1].t) i++;
  const a = quadros[i], b = quadros[i + 1];
  return interpolarPose(a.pose, b.pose, (e - a.t) / (b.t - a.t || 1), o);
}

/** Posição 0..1 num ciclo contínuo: volta ao início sem inverter, sem pausa e sem easing. */
export function posicaoNoCiclo(tempoS: number, duracaoS: number): number {
  return (((tempoS % duracaoS) + duracaoS) % duracaoS) / duracaoS;
}

/** A posição do padrão no tempo `tempoS`, respeitando o modo do loop. */
export const posicaoDoPadrao = (p: PadraoDef, tempoS: number): number =>
  p.modo === 'ciclo' ? posicaoNoCiclo(tempoS, p.duracaoS) : posicaoNoLoop(tempoS, p.duracaoS);

/** Pose do padrão na posição `t`, com o easing certo para o modo. */
export const amostrarPadrao = (p: PadraoDef, t: number, o: PoseMutavel): PoseMutavel =>
  amostrarQuadros(p.quadros, t, o, p.modo !== 'ciclo');

/* ------------------------------------------------------------------ */
/* O que desenhar                                                      */
/* ------------------------------------------------------------------ */

/** Esqueleto de uma pose já posicionada (para validações e ferramentas). Aloca. */
export function esqueletoDe(pose: Pose, vista: 'lado' | 'frente', anguloPe?: number): Esqueleto {
  return resolver(pose, vista, criarEsqueleto(), PROPORCOES, anguloPe);
}
