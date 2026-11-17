/**
 * Ilustração humana: transforma o esqueleto (figura-rig.ts) em formas
 * preenchidas e afiladas: pele em dois tons, regata e short na cor do elemento,
 * cabelo curto, tênis, e os músculos-alvo acesos por uma camada de brilho.
 *
 * Tudo é entregue a uma `Pincel` como linhas, círculos e CAMINHOS (strings de
 * `d`). A ordem e a quantidade de primitivas dependem só do padrão, nunca da
 * pose, para o componente criar os elementos uma vez e só reescrever atributos.
 */

import { PROPORCOES, type Esqueleto, type Pt } from './figura-rig';
import type { PadraoDef, Pose } from './figura-tipos';

export type Classe =
  | 'pele' | 'pele-d' | 'camisa' | 'short' | 'short-d' | 'cabelo' | 'tenis' | 'sola' | 'orelha' | 'detalhe'
  | 'musculo' | 'musculo-d' | 'sombra'
  | 'equip' | 'equipcheio' | 'placa' | 'placa-d' | 'estofado' | 'apoio' | 'chao' | 'agua';

/** Quem recebe o desenho: ou só conta as primitivas, ou grava as coordenadas. */
export interface Pincel {
  l(c: Classe, w: number, x1: number, y1: number, x2: number, y2: number): void;
  c(c: Classe, w: number, cx: number, cy: number, r: number): void;
  p(c: Classe, d: string): void;
}

export interface Primitiva { readonly k: 'l' | 'c' | 'p'; readonly c: Classe; readonly w: number }

/** Regiões musculares que a ilustração sabe acender. */
export const REGIOES_MUSCULARES = [
  'peitoral', 'costas', 'ombros', 'biceps', 'triceps', 'antebraco', 'abdomen', 'gluteos', 'quadriceps', 'posteriores', 'panturrilha',
] as const;
export type RegiaoMuscular = typeof REGIOES_MUSCULARES[number];

const RAD = Math.PI / 180;
const f2 = (v: number): string => String(Math.round(v * 100) / 100);

/* ------------------------------------------------------------------ */
/* Contornos suaves (Catmull-Rom fechado vira Béziers cúbicas)          */
/* ------------------------------------------------------------------ */

class Contorno {
  n = 0;
  readonly x = new Float64Array(48);
  readonly y = new Float64Array(48);
  reset(): this { this.n = 0; return this; }
  add(x: number, y: number): this { this.x[this.n] = x; this.y[this.n] = y; this.n++; return this; }
  caminho(): string {
    const n = this.n, X = this.x, Y = this.y;
    let d = `M${f2(X[0])} ${f2(Y[0])}`;
    for (let i = 0; i < n; i++) {
      const i0 = (i - 1 + n) % n, i1 = i, i2 = (i + 1) % n, i3 = (i + 2) % n;
      const c1x = X[i1] + (X[i2] - X[i0]) / 6, c1y = Y[i1] + (Y[i2] - Y[i0]) / 6;
      const c2x = X[i2] - (X[i3] - X[i1]) / 6, c2y = Y[i2] - (Y[i3] - Y[i1]) / 6;
      d += `C${f2(c1x)} ${f2(c1y)} ${f2(c2x)} ${f2(c2y)} ${f2(X[i2])} ${f2(Y[i2])}`;
    }
    return `${d}Z`;
  }
}
const K = new Contorno();

/** Membro afilado em volta do osso A→B. Larguras "frente" e "trás" em A, no meio (tm) e em B. */
function membro(
  pn: Pincel, c: Classe, a: Pt, b: Pt,
  fa: number, ba: number, fm: number, bm: number, fb: number, bb: number, tm: number,
): void {
  const dx = b.x - a.x, dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L, uy = dy / L;
  const nx = uy, ny = -ux; // lado "da frente" (para um osso que aponta para baixo, o lado +x)
  const mx = a.x + dx * tm, my = a.y + dy * tm;
  K.reset()
    .add(a.x - ux * (fa + ba) * 0.28, a.y - uy * (fa + ba) * 0.28)
    .add(a.x + nx * fa, a.y + ny * fa)
    .add(mx + nx * fm, my + ny * fm)
    .add(b.x + nx * fb, b.y + ny * fb)
    .add(b.x + ux * (fb + bb) * 0.28, b.y + uy * (fb + bb) * 0.28)
    .add(b.x - nx * bb, b.y - ny * bb)
    .add(mx - nx * bm, my - ny * bm)
    .add(a.x - nx * ba, a.y - ny * ba);
  pn.p(c, K.caminho());
}

/** Meia-lente ao longo do osso (um músculo num lado só, ou dos dois lados se `lado` for 0). */
function lente(pn: Pincel, c: Classe, a: Pt, b: Pt, t0: number, t1: number, lado: -1 | 0 | 1, w: number): void {
  if (w <= 0) { pn.p(c, ''); return; }
  const dx = b.x - a.x, dy = b.y - a.y;
  const L = Math.hypot(dx, dy) || 1;
  const nx = dy / L, ny = -dx / L;
  const p0x = a.x + dx * t0, p0y = a.y + dy * t0, p1x = a.x + dx * t1, p1y = a.y + dy * t1;
  const mx = (p0x + p1x) / 2, my = (p0y + p1y) / 2;
  if (lado === 0) {
    K.reset().add(p0x, p0y).add(mx + nx * w, my + ny * w).add(p1x, p1y).add(mx - nx * w, my - ny * w);
  } else {
    K.reset().add(p0x + nx * lado * w * 0.25, p0y + ny * lado * w * 0.25)
      .add(mx + nx * lado * w, my + ny * lado * w)
      .add(p1x + nx * lado * w * 0.25, p1y + ny * lado * w * 0.25)
      .add(mx + nx * lado * w * 0.1, my + ny * lado * w * 0.1);
  }
  pn.p(c, K.caminho());
}

/** Perfil contínuo ao longo de um eixo: `S` posições (0..1 do comprimento), `F` e `B` meias-larguras de cada lado. */
function perfil(
  pn: Pincel, c: Classe, ox: number, oy: number, ux: number, uy: number, nx: number, ny: number, L: number,
  S: readonly number[], F: readonly number[], B: readonly number[],
): void {
  K.reset();
  for (let i = 0; i < S.length; i++) K.add(ox + ux * L * S[i] + nx * F[i], oy + uy * L * S[i] + ny * F[i]);
  for (let i = S.length - 1; i >= 0; i--) K.add(ox + ux * L * S[i] - nx * B[i], oy + uy * L * S[i] - ny * B[i]);
  pn.p(c, K.caminho());
}

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

/** Tênis: bota baixa em volta do tornozelo, apontando para `f` (unitário). */
function tenis(pn: Pincel, sk: Esqueleto, pe: Pt, ponta: Pt, frente: boolean, esquerda: boolean): void {
  let fx = ponta.x - pe.x, fy = ponta.y - pe.y;
  const n = Math.hypot(fx, fy) || 1;
  fx /= n; fy /= n;
  let qx = -fy, qy = fx; // do dorso para a sola
  if (frente) { fx = esquerda ? -1 : 1; fy = 0; qx = 0; qy = 1; }
  const L = PROPORCOES.pe;
  K.reset()
    .add(pe.x - fx * 2.6 - qx * 2.6, pe.y - fy * 2.6 - qy * 2.6)
    .add(pe.x + fx * 1.2 - qx * 2.5, pe.y + fy * 1.2 - qy * 2.5)
    .add(pe.x + fx * (L + 1.2) - qx * 0.4, pe.y + fy * (L + 1.2) - qy * 0.4)
    .add(pe.x + fx * (L + 1.7) + qx * 1.5, pe.y + fy * (L + 1.7) + qy * 1.5)
    .add(pe.x + fx * (L * 0.5) + qx * 2.1, pe.y + fy * (L * 0.5) + qy * 2.1)
    .add(pe.x - fx * 2.8 + qx * 2.1, pe.y - fy * 2.8 + qy * 2.1);
  pn.p('tenis', K.caminho());
  pn.l('sola', 1.1, pe.x - fx * 2.7 + qx * 2, pe.y - fy * 2.7 + qy * 2, pe.x + fx * (L + 1.6) + qx * 1.5, pe.y + fy * (L + 1.6) + qy * 1.5);
  void sk;
}

/** Cabeça: oval com nariz e queixo (perfil) ou oval simples (frente), orelha e cabelo curto. */
function cabeca(pn: Pincel, pose: Pose, sk: Esqueleto, frente: boolean): void {
  const p = pose.ang.pescoco * RAD;
  const ux = Math.sin(p), uy = -Math.cos(p); // eixo do pescoço, para cima
  const vx = Math.cos(p), vy = Math.sin(p);  // para onde o rosto aponta
  const cx = sk.cabeca.x, cy = sk.cabeca.y;
  const rx = frente ? 3.9 : 3.7, ry = PROPORCOES.cabecaR;
  const pt = (lv: number, lu: number): [number, number] => [cx + vx * lv + ux * lu, cy + vy * lv + uy * lu];
  // Cabelo atrás (o contorno da cabeça é pintado depois, por cima só da testa/rosto).
  const base = frente ? 0 : 1;
  K.reset();
  for (let g = 20; g <= 200; g += 15) {
    const a = g * RAD;
    const [x, y] = pt(rx * 1.1 * Math.cos(a), ry * 1.1 * Math.sin(a));
    K.add(x, y);
  }
  for (let g = 200; g >= 20; g -= 15) {
    const a = g * RAD;
    const [x, y] = pt(base * 1.4 + rx * 0.78 * Math.cos(a), ry * 0.72 * Math.sin(a) - 0.9 - (frente ? 0.3 : 0));
    K.add(x, y);
  }
  const cabelo = K.caminho();
  // Rosto.
  K.reset();
  for (let g = 0; g < 360; g += 24) {
    const a = g * RAD;
    let r = 1;
    if (!frente) {
      const d1 = (((g + 8 + 540) % 360) - 180) / 11; // nariz, em torno de -8 graus (g = 352)
      const d2 = (((g + 70 + 540) % 360) - 180) / 15; // queixo, em torno de -70 graus
      r += 0.26 * Math.exp(-d1 * d1) + 0.12 * Math.exp(-d2 * d2);
    }
    const [x, y] = pt(rx * r * Math.cos(a), ry * Math.sin(a));
    K.add(x, y);
  }
  pn.p('pele', K.caminho());
  pn.p('cabelo', cabelo);
  const [ox, oy] = pt(-0.9, -0.5);
  pn.c('orelha', 1, ox, oy, 1.15);
  if (frente) {
    const [ex, ey] = pt(rx * 0.98, -0.4);
    pn.c('orelha', 1, ex, ey, 1.0);
  }
}

/* ------------------------------------------------------------------ */
/* O corpo                                                             */
/* ------------------------------------------------------------------ */

const pontos = (sk: Esqueleto, e: boolean): { om: Pt; co: Pt; ma: Pt; qd: Pt; jo: Pt; pe: Pt; po: Pt } => (e
  ? { om: sk.ombroE, co: sk.cotoveloE, ma: sk.maoE, qd: sk.quadrilE, jo: sk.joelhoE, pe: sk.peE, po: sk.pontaE }
  : { om: sk.ombroD, co: sk.cotoveloD, ma: sk.maoD, qd: sk.quadrilD, jo: sk.joelhoD, pe: sk.peD, po: sk.pontaD });

const lerpPt = (a: Pt, b: Pt, t: number, saida: Pt): Pt => { saida.x = a.x + (b.x - a.x) * t; saida.y = a.y + (b.y - a.y) * t; return saida; };
const TMP: Pt = { x: 0, y: 0 };
const TMP2: Pt = { x: 0, y: 0 };

/** O membro inteiro (perna ou braço) de um lado, com músculos, na ordem de pintura. */
function perna(pn: Pincel, sk: Esqueleto, e: boolean, frente: boolean, ativos: ReadonlySet<string> | undefined): void {
  const { qd, jo, pe, po } = pontos(sk, e);
  const pele: Classe = e || frente ? 'pele' : 'pele-d';
  const mus: Classe = e || frente ? 'musculo' : 'musculo-d';
  const sh: Classe = e || frente ? 'short' : 'short-d';
  if (frente) membro(pn, pele, qd, jo, 4.4, 4.4, 4.5, 4.5, 2.9, 2.9, 0.35);
  else membro(pn, pele, qd, jo, 4.1, 4.6, 4.4, 4.7, 2.8, 2.8, 0.35);
  // short cobre a metade de cima da coxa
  lerpPt(qd, jo, 0.54, TMP);
  if (frente) membro(pn, sh, qd, TMP, 4.9, 4.9, 4.9, 4.9, 4.7, 4.7, 0.5);
  else membro(pn, sh, qd, TMP, 4.5, 5.2, 4.7, 5.2, 4.4, 4.9, 0.5);
  lente(pn, mus, qd, jo, 0.3, 0.96, frente ? 0 : 1, ativos?.has('quadriceps') ? (frente ? 2.3 : 3.5) : 0);
  lente(pn, mus, qd, jo, 0.3, 0.96, frente ? 0 : -1, ativos?.has('posteriores') ? (frente ? 2.3 : 3.7) : 0);
  if (frente) membro(pn, pele, jo, pe, 2.9, 2.9, 3.0, 3.0, 1.8, 1.8, 0.3);
  else membro(pn, pele, jo, pe, 2.8, 2.7, 2.7, 3.5, 1.7, 1.7, 0.3);
  lente(pn, mus, jo, pe, 0.1, 0.7, frente ? 0 : -1, ativos?.has('panturrilha') ? (frente ? 1.9 : 3.1) : 0);
  tenis(pn, sk, pe, po, frente, e);
}

function braco(pn: Pincel, sk: Esqueleto, e: boolean, frente: boolean, segura: boolean, ativos: ReadonlySet<string> | undefined): void {
  const { om, co, ma } = pontos(sk, e);
  const pele: Classe = e || frente ? 'pele' : 'pele-d';
  const mus: Classe = e || frente ? 'musculo' : 'musculo-d';
  if (frente) membro(pn, pele, om, co, 3.2, 3.2, 3.4, 3.4, 2.3, 2.3, 0.3);
  else membro(pn, pele, om, co, 3.2, 3.0, 3.5, 3.0, 2.2, 2.2, 0.32);
  lente(pn, mus, om, co, 0.2, 0.86, frente ? 0 : 1, ativos?.has('biceps') ? (frente ? 1.9 : 3) : 0);
  lente(pn, mus, om, co, 0.2, 0.86, frente ? 0 : -1, ativos?.has('triceps') ? (frente ? 1.9 : 2.8) : 0);
  if (frente) membro(pn, pele, co, ma, 2.3, 2.3, 2.6, 2.6, 1.5, 1.5, 0.3);
  else membro(pn, pele, co, ma, 2.3, 2.1, 2.6, 2.3, 1.5, 1.5, 0.3);
  lente(pn, mus, co, ma, 0.1, 0.8, 0, ativos?.has('antebraco') ? 2.2 : 0);
  // mão: punho fechado quando segura algo
  const dx = ma.x - co.x, dy = ma.y - co.y, L = Math.hypot(dx, dy) || 1;
  pn.c(pele, 1, ma.x + (dx / L) * 0.9, ma.y + (dy / L) * 0.9, segura ? 2.5 : 2.1);
  if (ativos?.has('ombros')) pn.c(mus, 1, om.x, om.y, frente ? 3.2 : 3.4); else pn.c(mus, 1, om.x, om.y, 0);
}

function troncoLado(pn: Pincel, pose: Pose, sk: Esqueleto, ativos: ReadonlySet<string> | undefined): void {
  const h = sk.quadril, n = sk.pescoco;
  const L = Math.hypot(n.x - h.x, n.y - h.y) || 1;
  const ux = (n.x - h.x) / L, uy = (n.y - h.y) / L;
  const t = pose.ang.tronco * RAD;
  const nx = Math.cos(t), ny = Math.sin(t); // lado da frente do corpo
  perfil(pn, 'pele', h.x, h.y, ux, uy, nx, ny, L,
    [-0.1, 0.06, 0.3, 0.55, 0.8, 0.96, 1.05], [2.5, 3.5, 3.2, 4.7, 4.4, 2.6, 1.6], [3.5, 4.6, 3.3, 4.1, 3.8, 2.4, 1.6]);
  // músculos do tronco
  const sobre = (c: Classe, s0: number, s1: number, lado: 1 | -1, w: number): void => {
    const a: Pt = { x: h.x + ux * L * s0, y: h.y + uy * L * s0 }, b: Pt = { x: h.x + ux * L * s1, y: h.y + uy * L * s1 };
    // o "lado da frente" do tronco é (nx, ny); `lente` usa a normal (dy, -dx)/L = (uy, -ux): mesmo sentido para t = 0
    lente(pn, c, a, b, 0, 1, (lado * (uy * nx - ux * ny >= 0 ? 1 : -1)) as 1 | -1, w);
  };
  sobre('musculo', 0.5, 0.92, 1, ativos?.has('peitoral') ? 3.8 : 0);
  sobre('musculo', 0.12, 0.5, 1, ativos?.has('abdomen') ? 3.0 : 0);
  sobre('musculo', 0.42, 0.94, -1, ativos?.has('costas') || ativos?.has('ombros') ? 3.6 : 0);
  // regata
  perfil(pn, 'camisa', h.x, h.y, ux, uy, nx, ny, L,
    [0.02, 0.28, 0.55, 0.8, 0.95], [4.0, 3.8, 5.2, 4.9, 3.1], [5.0, 3.9, 4.6, 4.3, 2.9]);
  pn.l('detalhe', 0.7, h.x + ux * L * 0.05 + nx * 3.9, h.y + uy * L * 0.05 + ny * 3.9, h.x + ux * L * 0.05 - nx * 5.0, h.y + uy * L * 0.05 - ny * 5.0);
  // short: bacia
  perfil(pn, 'short', h.x, h.y, ux, uy, nx, ny, L,
    [-0.16, 0.0, 0.12, 0.22], [3.8, 4.2, 3.9, 3.5], [5.0, 5.2, 4.7, 4.2]);
  sobre('musculo', -0.12, 0.2, -1, ativos?.has('gluteos') ? 4.6 : 0);
}

function troncoFrente(pn: Pincel, pose: Pose, sk: Esqueleto, ativos: ReadonlySet<string> | undefined): void {
  const h = sk.quadril, n = sk.pescoco;
  const L = Math.hypot(n.x - h.x, n.y - h.y) || 1;
  const ux = (n.x - h.x) / L, uy = (n.y - h.y) / L;
  const t = pose.ang.tronco * RAD;
  const nx = Math.cos(t), ny = Math.sin(t);
  perfil(pn, 'pele', h.x, h.y, ux, uy, nx, ny, L,
    [-0.1, 0.08, 0.35, 0.6, 0.85, 1.0, 1.05], [4.3, 5.0, 4.0, 5.4, 7.2, 3.2, 1.8], [4.3, 5.0, 4.0, 5.4, 7.2, 3.2, 1.8]);
  const ao = (s: number): Pt => ({ x: h.x + ux * L * s, y: h.y + uy * L * s });
  const peito = ao(0.5), peitoTopo = ao(0.9);
  lente(pn, 'musculo', peito, peitoTopo, 0, 1, 0, ativos?.has('peitoral') ? 5.2 : 0);
  lente(pn, 'musculo', ao(0.1), ao(0.5), 0, 1, 0, ativos?.has('abdomen') ? 3.6 : 0);
  lente(pn, 'musculo', ao(0.45), ao(0.95), 0, 1, 0, ativos?.has('costas') ? 6.0 : 0);
  perfil(pn, 'camisa', h.x, h.y, ux, uy, nx, ny, L,
    [0.06, 0.35, 0.6, 0.85, 0.97], [5.3, 4.4, 5.8, 7.6, 3.4], [5.3, 4.4, 5.8, 7.6, 3.4]);
  pn.l('detalhe', 0.7, h.x + ux * L * 0.08 + nx * 5.2, h.y + uy * L * 0.08 + ny * 5.2, h.x + ux * L * 0.08 - nx * 5.2, h.y + uy * L * 0.08 - ny * 5.2);
  perfil(pn, 'short', h.x, h.y, ux, uy, nx, ny, L,
    [-0.14, 0.0, 0.1, 0.2], [5.6, 5.9, 5.5, 5.0], [5.6, 5.9, 5.5, 5.0]);
  lente(pn, 'musculo', ao(-0.08), ao(0.14), 0, 1, 0, ativos?.has('gluteos') ? 5.4 : 0);
}

/**
 * O atleta inteiro, de trás para a frente. `segura`: as mãos fecham em punho
 * (há equipamento). `ativos`: regiões musculares a acender.
 */
export function ilustrar(p: PadraoDef, pose: Pose, sk: Esqueleto, pn: Pincel, segura: boolean, ativos?: ReadonlySet<string>): void {
  if (p.vista === 'lado') {
    perna(pn, sk, false, false, ativos);
    braco(pn, sk, false, false, segura, ativos);
    troncoLado(pn, pose, sk, ativos);
    membro(pn, 'pele', sk.pescoco, lerpPt(sk.pescoco, sk.cabeca, 0.85, TMP2), 2.5, 2.3, 2.4, 2.2, 2.4, 2.2, 0.5);
    cabeca(pn, pose, sk, false);
    perna(pn, sk, true, false, ativos);
    braco(pn, sk, true, false, segura, ativos);
  } else {
    perna(pn, sk, true, true, ativos);
    perna(pn, sk, false, true, ativos);
    troncoFrente(pn, pose, sk, ativos);
    membro(pn, 'pele', sk.pescoco, lerpPt(sk.pescoco, sk.cabeca, 0.85, TMP2), 2.6, 2.6, 2.4, 2.4, 2.4, 2.4, 0.5);
    cabeca(pn, pose, sk, true);
    braco(pn, sk, true, true, segura, ativos);
    braco(pn, sk, false, true, segura, ativos);
  }
}

/**
 * Contact shadow on the floor. It used to sit under the single lowest point, which
 * hopped from one foot to the other (a jump of tens of pixels in one frame) in
 * running, kicks and lunges. Now every point near the floor pulls the shadow
 * toward itself with a smooth weight, so it glides, and it widens with the spread.
 */
export function sombraNoChao(pn: Pincel, sk: Esqueleto, chao: number): void {
  // Média ponderada contínua (peso cai com a altura do ponto): sem trocas de "ponto mais baixo".
  const pontos = [sk.peE, sk.peD, sk.pontaE, sk.pontaD, sk.maoE, sk.maoD, sk.joelhoE, sk.joelhoD, sk.quadril];
  let peso = 0.001, x = sk.quadril.x * 0.001, xx = sk.quadril.x * sk.quadril.x * 0.001;
  for (const q of pontos) {
    const w = Math.exp(-Math.max(0, chao - q.y) / 6);
    peso += w; x += w * q.x; xx += w * q.x * q.x;
  }
  const cx = x / peso;
  const dispersao = Math.sqrt(Math.max(0, xx / peso - cx * cx));
  const a = 9 + Math.min(dispersao, 16) * 0.7, b = 1.7, cy = chao + 0.4;
  pn.p('sombra', `M${f2(cx - a)} ${f2(cy)}A${a} ${b} 0 1 0 ${f2(cx + a)} ${f2(cy)}A${a} ${b} 0 1 0 ${f2(cx - a)} ${f2(cy)}Z`);
}
