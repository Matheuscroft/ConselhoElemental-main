/**
 * Padrões de movimento de corrida, ciclismo, natação, artes marciais e
 * condicionamento. Correr, pedalar e nadar são CICLOS (`modo: 'ciclo'`): o
 * tempo só avança, a manivela e os braços nunca giram para trás. Golpes e
 * chutes vão e voltam como os de força.
 */

import type { Equipamento, Junta, PadraoDef, Pose, Quadro } from './figura-tipos';
import { PROPORCOES, Y_CONTATO, esqueletoDe } from './figura-rig';
import { BICI, type PadraoExtra } from './figura-desenho';
import {
  DEG, RAD, ancorar, espelhados, ik, juntas, lerp, movimento, pernasEspelhadas, poseDeApoios, r2, ombroNaLinha,
  type Ancora, type Chave,
} from './figura-padroes-forca';

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

/** Quadros de um ciclo: de u = 0 a u = 1, e o último quadro é igual ao primeiro. */
function ciclo(n: number, f: (u: number) => Pose): Quadro[] {
  const saida: Quadro[] = [];
  for (let i = 0; i <= n; i++) saida.push({ t: i / n, pose: f(i / n) });
  return saida;
}

const sen = (graus: number): number => Math.sin(graus * RAD);
const cos = (graus: number): number => Math.cos(graus * RAD);

/** IK da perna: do quadril ao tornozelo, com o joelho para a frente. Devolve [coxa, canela]. */
function ikPerna(qx: number, qy: number, ax: number, ay: number): [number, number] {
  const L1 = PROPORCOES.coxa, L2 = PROPORCOES.canela;
  const dx = ax - qx, dy = ay - qy;
  const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(L1 - L2) + 0.05), L1 + L2 - 0.05);
  const theta = Math.atan2(dx, dy);
  const alfa = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  let melhor = theta + alfa, kx = -Infinity;
  for (const c of [theta + alfa, theta - alfa]) {
    const x = qx + L1 * Math.sin(c);
    if (x > kx) { kx = x; melhor = c; }
  }
  const jx = qx + L1 * Math.sin(melhor), jy = qy + L1 * Math.cos(melhor);
  return [r2(melhor * DEG), r2(Math.atan2(ax - jx, ay - jy) * DEG)];
}

/** Interpolação periódica suave (cosseno) entre chaves [u, valor]; a última chave repete a primeira. */
function periodica(chaves: readonly (readonly [number, number])[], u: number): number {
  for (let i = 0; i < chaves.length - 1; i++) {
    const [u0, v0] = chaves[i], [u1, v1] = chaves[i + 1];
    if (u >= u0 && u <= u1) {
      const k = (u - u0) / (u1 - u0 || 1);
      return v0 + (v1 - v0) * (0.5 - 0.5 * Math.cos(Math.PI * k));
    }
  }
  return chaves[chaves.length - 1][1];
}

/* ------------------------------------------------------------------ */
/* Corrida                                                             */
/* ------------------------------------------------------------------ */

/** Passada de lado, "esteira": o quadril fica no lugar, o pé de apoio corre para trás, os braços balançam em oposição às pernas. */
function passo(u: number): Pose {
  const fase = u * 360;
  const perna = (f: number): [number, number] => {
    const c = 8 + 32 * sen(f);
    const flexao = 12 + 70 * Math.pow(0.5 + 0.5 * cos(f - 17), 2);
    return [c, c - flexao];
  };
  const [cE, kE] = perna(fase), [cD, kD] = perna(fase + 180);
  const bE = 8 - 38 * sen(fase), bD = 8 + 38 * sen(fase);
  return ancorar(juntas({ t: 9, p: 12, bE, aE: bE + 88, bD, aD: bD + 88, cE, kE, cD, kD }), { x: 'quadril', y: 'pes' }, 46, undefined, 'lado');
}
padrao('corrida', 'Corrida', 'lado', 'nenhum', 1.1, ciclo(24, passo), { modo: 'ciclo' });

/* ------------------------------------------------------------------ */
/* Pedalada                                                            */
/* ------------------------------------------------------------------ */

const QUADRIL_BIKE = { x: 40, y: 49.5 };
const TRONCO_BIKE = 52;
const OMBRO_BIKE = {
  x: QUADRIL_BIKE.x + (PROPORCOES.tronco - PROPORCOES.descidaOmbro) * sen(TRONCO_BIKE),
  y: QUADRIL_BIKE.y - (PROPORCOES.tronco - PROPORCOES.descidaOmbro) * cos(TRONCO_BIKE),
};
const [bracoBike, antebracoBike] = ik(OMBRO_BIKE, { x: BICI.guidao.x + 0.5, y: BICI.guidao.y - 0.5 }, 'baixo');

/** A manivela gira SEMPRE para a frente (sentido horário na tela): o ângulo só cresce de 0 a 360. */
function pedal(u: number): Pose {
  const R = 6.5, th = u * 360;
  const tornozelo = (graus: number): [number, number] => [
    BICI.bb.x + R * sen(graus) - 3.2, BICI.bb.y - R * cos(graus) - 3.4,
  ];
  const [axE, ayE] = tornozelo(th), [axD, ayD] = tornozelo(th + 180);
  const [cE, kE] = ikPerna(QUADRIL_BIKE.x, QUADRIL_BIKE.y, axE, ayE);
  const [cD, kD] = ikPerna(QUADRIL_BIKE.x, QUADRIL_BIKE.y, axD, ayD);
  return {
    raiz: { x: QUADRIL_BIKE.x, y: QUADRIL_BIKE.y },
    ang: juntas({ t: TRONCO_BIKE, p: 64, b: bracoBike, a: antebracoBike, cE, kE, cD, kD }),
  };
}
padrao('pedalada', 'Pedalada', 'lado', 'bicicleta', 1.5, ciclo(32, pedal), { modo: 'ciclo' });

/* ------------------------------------------------------------------ */
/* Natação                                                             */
/* ------------------------------------------------------------------ */

const AGUA = 57;
const NADO_X = 47;
const ANCORA_NADO: Ancora = { x: 'quadril', y: 'quadril' };

/** Braço do crawl: o ângulo só DIMINUI (de trás, por cima da água, à frente, e puxa por baixo); o cotovelo dobra na recuperação. */
function bracoCrawl(graus: number, dobra: number): [number, number] {
  const m = ((graus % 360) + 360) % 360;
  const recuperando = m >= 90 && m <= 270 ? Math.sin(((m - 90) / 180) * Math.PI) : 0;
  return [graus, graus + dobra * recuperando + 8];
}

function crawl(u: number): Pose {
  const th = 270 - 360 * u;
  const [bE, aE] = bracoCrawl(th, 62), [bD, aD] = bracoCrawl(th + 180, 62);
  const batida = u * 360 * 3;
  const cE = -88 + 14 * sen(batida), cD = -88 - 14 * sen(batida);
  return ancorar(juntas({
    t: 90, p: 104 - 4 * sen(u * 360), bE, aE, bD, aD, cE, kE: cE - 12, cD, kD: cD - 12,
  }), ANCORA_NADO, NADO_X, 60.5 + 0.8 * sen(u * 720), 'lado');
}
padrao('nado-crawl', 'Nado crawl', 'lado', 'nenhum', 2, ciclo(24, crawl), { chao: false, modo: 'ciclo', extra: { agua: AGUA } });

function costas(u: number): Pose {
  const th = 270 - 360 * u;
  const [bE, aE] = bracoCrawl(th, 6), [bD, aD] = bracoCrawl(th + 180, 6);
  const batida = u * 360 * 3;
  const cE = -90 + 12 * sen(batida), cD = -90 - 12 * sen(batida);
  return ancorar(juntas({
    t: 88, p: 84, bE, aE: aE - 8, bD, aD: aD - 8, cE, kE: cE - 10, cD, kD: cD - 10,
  }), ANCORA_NADO, NADO_X, 59 + 0.7 * sen(u * 720), 'lado');
}
padrao('nado-costas', 'Nado costas', 'lado', 'nenhum', 2.2, ciclo(24, costas), { chao: false, modo: 'ciclo', extra: { agua: AGUA - 1 } });

function borboleta(u: number): Pose {
  const th = 270 - 360 * u;
  const [b, a] = bracoCrawl(th, 30);
  const onda = u * 720;
  const c = -86 + 22 * sen(onda - 70);
  return ancorar(juntas({
    t: 90 - 9 * sen(onda), p: 98 + 9 * sen(onda), b, a, c, k: c - 14,
  }), ANCORA_NADO, NADO_X, 60 - 3.2 * sen(onda + 90), 'lado');
}
padrao('nado-borboleta', 'Nado borboleta', 'lado', 'nenhum', 2, ciclo(30, borboleta), { chao: false, modo: 'ciclo', extra: { agua: AGUA } });

/** Peito: puxada curta com os braços, pernas encolhem e chutam em "sapo"; depois desliza. */
const PEITO_BRACO: ReadonlyArray<readonly [number, number]> = [[0, 92], [0.18, 70], [0.38, 22], [0.58, 40], [0.74, 92], [1, 92]];
const PEITO_ANTEBRACO: ReadonlyArray<readonly [number, number]> = [[0, 92], [0.18, 78], [0.38, 118], [0.58, 100], [0.74, 92], [1, 92]];
const PEITO_COXA: ReadonlyArray<readonly [number, number]> = [[0, -88], [0.34, -88], [0.5, -52], [0.62, -78], [0.76, -88], [1, -88]];
const PEITO_CANELA: ReadonlyArray<readonly [number, number]> = [[0, -90], [0.34, -90], [0.5, -128], [0.62, -100], [0.76, -90], [1, -90]];
function peito(u: number): Pose {
  return ancorar(juntas({
    t: 90, p: 96 - 14 * Math.max(0, sen(u * 360 - 30)),
    b: periodica(PEITO_BRACO, u), a: periodica(PEITO_ANTEBRACO, u),
    c: periodica(PEITO_COXA, u), k: periodica(PEITO_CANELA, u),
  }), ANCORA_NADO, NADO_X, 61 - 2 * sen(u * 360 + 40), 'lado');
}
padrao('nado-peito', 'Nado peito', 'lado', 'nenhum', 2.4, ciclo(24, peito), { chao: false, modo: 'ciclo', extra: { agua: AGUA } });

/* ------------------------------------------------------------------ */
/* Lutas                                                               */
/* ------------------------------------------------------------------ */

const POSTURA = { cE: 20, kE: 6, cD: -24, kD: -38 } as const;
const GUARDA = { bE: 28, aE: 162, bD: 22, aD: 170 } as const;
const NO_CHAO_E: Ancora = { x: 'peE', y: 'pes' };

/** Jab, direto e esquiva, em ciclo: a guarda volta entre os golpes. */
const GOLPES: Chave[] = [
  { x: 52, a: { t: 8, p: 8, ...GUARDA, ...POSTURA } },
  { x: 52, a: { t: 15, p: 10, ...GUARDA, bE: 90, aE: 90, ...POSTURA } },
  { x: 52, a: { t: 8, p: 8, ...GUARDA, ...POSTURA } },
  { x: 52, a: { t: 26, p: 14, ...GUARDA, bD: 92, aD: 92, cE: 22, kE: 6, cD: -18, kD: -30 } },
  { x: 52, a: { t: 8, p: 8, ...GUARDA, ...POSTURA } },
  { x: 52, a: { t: 30, p: 26, ...GUARDA, cE: 40, kE: 6, cD: -16, kD: -56 } },
  { x: 52, a: { t: 8, p: 8, ...GUARDA, ...POSTURA } },
];
padrao('luta-soco', 'Boxe: jab, direto e esquiva', 'lado', 'luvas', 2.6, movimento(NO_CHAO_E, GOLPES, { passos: 4 }), { modo: 'ciclo' });

/** Chute frontal: da guarda ao joelho alto e à perna estendida, em equilíbrio numa perna só. */
padrao('luta-chute', 'Chute frontal', 'lado', 'nenhum', 2.4, movimento({ x: 'peD', y: 'pes' }, [
  { x: 46, a: { t: 6, p: 6, ...GUARDA, cE: 14, kE: 4, cD: -14, kD: -26 } },
  { x: 46, a: { t: -4, p: 4, bE: 30, aE: 150, bD: 40, aD: 130, cE: 98, kE: 16, cD: -4, kD: -5 } },
  { x: 46, a: { t: -14, p: 2, bE: 38, aE: 140, bD: 60, aD: 120, cE: 92, kE: 90, cD: -2, kD: -4 } },
], { passos: 5 }));

/** Luta de solo: da base à entrada (nível baixo) e ao sprawl, de bruços sobre as mãos. */
const BASE: Pose = ancorar(juntas({ t: 10, p: 8, bE: 30, aE: 155, bD: 24, aD: 165, cE: 22, kE: 4, cD: -22, kD: -34 }), { x: 'quadril', y: 'pes' }, 44, undefined, 'lado');
const ENTRADA: Pose = ancorar(juntas({ t: 52, p: 40, bE: 70, aE: 100, bD: 62, aD: 92, cE: 62, kE: -10, cD: -40, kD: -70 }), { x: 'quadril', y: 'pes' }, 52, undefined, 'lado');
const SPRAWL_A = { x: 12, y: Y_CONTATO - 3.6 };
const SPRAWL_S = ombroNaLinha(SPRAWL_A, 13);
const SPRAWL: Pose = poseDeApoios(SPRAWL_A, SPRAWL_S, { x: SPRAWL_S.x + 3, y: Y_CONTATO }, 'tras', 70);
function entre(a: Pose, b: Pose, u: number): Pose {
  const ang = {} as Record<Junta, number>;
  for (const j of Object.keys(a.ang) as Junta[]) ang[j] = r2(lerp(a.ang[j], b.ang[j], u));
  return { raiz: { x: r2(lerp(a.raiz.x, b.raiz.x, u)), y: r2(lerp(a.raiz.y, b.raiz.y, u)) }, ang };
}
/** Apoia a pose no chão: o ponto mais baixo (pés ou mãos) volta a tocá-lo, para a mistura linear não afundar o corpo. */
function apoiar(pose: Pose): Pose {
  const sk = esqueletoDe(pose, 'lado');
  const baixo = Math.max(sk.peE.y, sk.peD.y, sk.pontaE.y, sk.pontaD.y, sk.maoE.y, sk.maoD.y);
  return { raiz: { x: pose.raiz.x, y: r2(pose.raiz.y + (Y_CONTATO - baixo)) }, ang: pose.ang };
}
function solo(): Quadro[] {
  const saida: Quadro[] = [];
  const trechos: [Pose, Pose][] = [[BASE, ENTRADA], [ENTRADA, SPRAWL]];
  const passos = 6;
  trechos.forEach(([a, b], i) => {
    for (let k = 0; k < passos; k++) saida.push({ t: (i * passos + k) / (trechos.length * passos), pose: apoiar(entre(a, b, k / passos)) });
  });
  saida.push({ t: 1, pose: SPRAWL });
  return saida;
}
padrao('luta-solo', 'Luta de solo: entrada e sprawl', 'lado', 'nenhum', 2.8, solo());

/** Forma (kata): da postura com os punhos na cintura, ao bloqueio baixo e ao soco, em postura longa. */
const KATA = { cE: 70, kE: -8, cD: -40, kD: -40 } as const;
padrao('luta-forma', 'Forma (kata): bloqueio e soco', 'lado', 'nenhum', 3, movimento(NO_CHAO_E, [
  { x: 50, a: { t: 0, p: 0, bE: -14, aE: 150, bD: -14, aD: 150, ...KATA } },
  { x: 50, a: { t: 4, p: 4, bE: 42, aE: 62, bD: -14, aD: 150, ...KATA } },
  { x: 50, a: { t: 6, p: 6, bE: -14, aE: 150, bD: 90, aD: 90, ...KATA } },
], { passos: 5 }));

/* ------------------------------------------------------------------ */
/* Condicionamento                                                     */
/* ------------------------------------------------------------------ */

padrao('condicionamento', 'Polichinelo', 'frente', 'nenhum', 1.2, movimento({ x: 'quadril', y: 'pes' }, [
  { x: 50, a: { t: 0, p: 0, ...espelhados(-6, -6), ...pernasEspelhadas(-2, -2) } },
  { x: 50, y: Y_CONTATO - 3, a: { t: 0, p: 0, ...espelhados(-166, -170), ...pernasEspelhadas(-20, -20) } },
], { vista: 'frente', passos: 5 }));

export const PADROES_CARDIO_LUTA: readonly PadraoDef[] = lista;
export const EXTRAS_CARDIO_LUTA: Readonly<Record<string, PadraoExtra>> = extras;
