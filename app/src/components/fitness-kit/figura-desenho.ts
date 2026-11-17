/**
 * Monta a cena de uma figura: chão, sombra, equipamento atrás, o atleta
 * (figura-ilustracao.ts) e o equipamento que as mãos seguram por cima.
 *
 * Duas escritas da mesma cena: `primitivasDe` só conta as primitivas (o
 * componente cria os elementos uma vez) e `preencherGeometria` grava as
 * coordenadas de um instante, sem alocar além das strings dos caminhos.
 */

import { CHAO, PROPORCOES, amostrarPadrao, criarEsqueleto, criarPose, resolver, type Esqueleto, type Pt } from './figura-rig';
import { ilustrar, sombraNoChao, type Classe, type Pincel, type Primitiva } from './figura-ilustracao';
import type { PadraoDef, Pose } from './figura-tipos';

const RAD = Math.PI / 180;

/** Detalhes de cena de cada padrão que o contrato não cobre (onde fica a polia, etc.). */
export interface PadraoExtra {
  /** Onde a polia está (espaço 100 x 100). Em vista 'frente' vale a altura; as polias ficam nas bordas. */
  readonly ancoraCabo?: Pt;
  /** Em vista 'frente' com cabo: 'cruzado' puxa de duas polias (uma em cada borda); sem isso, uma polia só em `ancoraCabo`. */
  readonly cabos?: 'cruzado';
  /** Ângulo (graus, 0 = para baixo) dos trilhos do leg press; desenha a placa dos pés perpendicular a eles. */
  readonly placaPes?: number;
  /** Ângulo absoluto do pé quando ele está solto no ar (pé chato numa placa inclinada). */
  readonly anguloPe?: number;
  /** Desenha uma parede atrás das costas (cadeirinha). */
  readonly paredeAtras?: boolean;
  /** Banco/máquina sem encosto (só o assento). */
  readonly semEncosto?: boolean;
  /** O que apoia as mãos (flexão inclinada, mergulho). */
  readonly suporteMaos?: 'banco' | 'parede' | 'paralelas';
  /** Altura (y) da linha d'água da natação. */
  readonly agua?: number;
}

/** Geometria de um instante: 4 números por primitiva (linhas e círculos) e as strings dos caminhos. */
export interface Geometria { g: Float64Array; d: string[] }
export const criarGeometria = (n: number): Geometria => ({ g: new Float64Array(n * 4), d: new Array<string>(n).fill('') });

class PincelColetor implements Pincel {
  readonly lista: Primitiva[] = [];
  l(c: Classe, w: number): void { this.lista.push({ k: 'l', c, w }); }
  c(c: Classe, w: number): void { this.lista.push({ k: 'c', c, w }); }
  p(c: Classe): void { this.lista.push({ k: 'p', c, w: 0 }); }
}

class PincelGravador implements Pincel {
  geo: Geometria = criarGeometria(0);
  i = 0;
  l(_c: Classe, _w: number, x1: number, y1: number, x2: number, y2: number): void {
    const g = this.geo.g, o = this.i * 4;
    g[o] = x1; g[o + 1] = y1; g[o + 2] = x2; g[o + 3] = y2; this.i++;
  }
  c(_c: Classe, _w: number, cx: number, cy: number, r: number): void {
    const g = this.geo.g, o = this.i * 4;
    g[o] = cx; g[o + 1] = cy; g[o + 2] = r; g[o + 3] = 0; this.i++;
  }
  p(_c: Classe, d: string): void { this.geo.d[this.i] = d; this.i++; }
}

/** A bicicleta de lado: quadro e rodas fixos; só a manivela, os pedais e os raios giram. */
export const BICI = {
  bb: { x: 48, y: 74 } as Pt,
  roda: 13,
  traseira: { x: 28, y: 75 } as Pt,
  dianteira: { x: 68, y: 75 } as Pt,
  selim: { x: 41, y: 53 } as Pt,
  guidao: { x: 62, y: 50 } as Pt,
  /** Do tornozelo ao pedal (o pé pisa um pouco à frente e abaixo do tornozelo). */
  pedalParaTornozelo: { x: 3.2, y: 3.4 } as Pt,
};

/** Raio da anilha vista de lado (a barra apoiada no chão tem as mãos a este raio do chão). */
export const PLACA_R = 6.2;

const f2 = (v: number): string => String(Math.round(v * 100) / 100);

function hexagono(pn: Pincel, c: Classe, cx: number, cy: number, r: number): void {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = (k * 60 + 30) * RAD;
    d += `${k ? 'L' : 'M'}${f2(cx + r * Math.cos(a))} ${f2(cy + r * Math.sin(a))}`;
  }
  pn.p(c, `${d}Z`);
}

function suporteBanco(sk: Esqueleto, pose: Pose, pn: Pincel, extra?: PadraoExtra): void {
  const t = pose.ang.tronco * RAD;
  const ux = Math.sin(t), uy = -Math.cos(t);
  const nx = -Math.cos(t), ny = -Math.sin(t);
  const h = sk.quadril, n = sk.pescoco;
  pn.l('apoio', 1.8, h.x + 2, h.y + 5.4, h.x + 2, CHAO - 0.9);
  pn.l('apoio', 1.8, h.x - 6, CHAO - 0.9, h.x + 10, CHAO - 0.9);
  if (extra?.semEncosto) {
    pn.l('estofado', 4.6, h.x - 9, h.y + 4.6, h.x + 8, h.y + 4.6);
  } else {
    pn.l('estofado', 4.6, h.x + nx * 4.4 - ux * 4, h.y + ny * 4.4 - uy * 4, n.x + nx * 4.4 + ux * 10, n.y + ny * 4.4 + uy * 10);
    pn.l('estofado', 4.6, h.x + nx * 4.4 - ux * 4, h.y + ny * 4.4 - uy * 4, h.x + 9, h.y + 4.6);
  }
}

const MEDIA: Pt = { x: 0, y: 0 };
function maosMedias(sk: Esqueleto): Pt {
  MEDIA.x = (sk.maoE.x + sk.maoD.x) * 0.5;
  MEDIA.y = (sk.maoE.y + sk.maoD.y) * 0.5;
  return MEDIA;
}

function bicicleta(sk: Esqueleto, pn: Pincel): void {
  const { bb, roda, traseira, dianteira, selim, guidao } = BICI;
  // Raios: giram com a manivela (3 voltas da roda por volta do pedal: inteiro, para o ângulo não saltar quando o pedal passa de 180 para -180 graus).
  const giro = Math.atan2(sk.peE.x + BICI.pedalParaTornozelo.x - bb.x, bb.y - (sk.peE.y + BICI.pedalParaTornozelo.y)) * 3;
  const rr = roda - 1.2;
  for (const c of [traseira, dianteira]) {
    pn.c('equip', 1.7, c.x, c.y, roda);
    pn.l('apoio', 0.7, c.x - rr * Math.sin(giro), c.y + rr * Math.cos(giro), c.x + rr * Math.sin(giro), c.y - rr * Math.cos(giro));
    pn.l('apoio', 0.7, c.x - rr * Math.cos(giro), c.y - rr * Math.sin(giro), c.x + rr * Math.cos(giro), c.y + rr * Math.sin(giro));
  }
  pn.l('equip', 1.5, bb.x, bb.y, selim.x, selim.y);
  pn.l('equip', 1.5, selim.x, selim.y, guidao.x - 1, guidao.y);
  pn.l('equip', 1.5, bb.x, bb.y, guidao.x - 1, guidao.y + 1);
  pn.l('equip', 1.5, guidao.x - 1, guidao.y, dianteira.x, dianteira.y);
  pn.l('equip', 1.3, bb.x, bb.y, traseira.x, traseira.y);
  pn.l('equip', 1.3, selim.x, selim.y, traseira.x, traseira.y);
  pn.l('estofado', 2.4, selim.x - 3.5, selim.y - 0.6, selim.x + 2, selim.y - 0.6);
  pn.l('equip', 1.4, guidao.x - 1, guidao.y, guidao.x + 2.5, guidao.y - 2.5);
  pn.l('equip', 1.3, bb.x, bb.y, sk.peD.x + 1.5, sk.peD.y + 1.5);
  pn.l('equip', 1.3, bb.x, bb.y, sk.peE.x + 1.5, sk.peE.y + 1.5);
}

function equipamentoAtras(p: PadraoDef, sk: Esqueleto, pose: Pose, pn: Pincel, extra?: PadraoExtra): void {
  const m = maosMedias(sk);
  if (extra?.agua !== undefined) {
    pn.l('agua', 0.9, 4, extra.agua, 96, extra.agua);
    pn.l('agua', 0.6, 14, extra.agua + 3.6, 86, extra.agua + 3.6);
  }
  if (p.equipamento === 'banco' || p.apoio === 'banco-deitado') suporteBanco(sk, pose, pn, extra);
  if (p.equipamento === 'maquina') {
    suporteBanco(sk, pose, pn, extra);
    if (extra?.placaPes !== undefined) {
      const s = extra.placaPes * RAD;
      const dx = Math.sin(s), dy = Math.cos(s);
      const fx = Math.cos(s), fy = -Math.sin(s);
      const cx = sk.peE.x + dx * 3, cy = sk.peE.y + dy * 3;
      pn.l('estofado', 2.6, cx - fx * 8, cy - fy * 8, cx + fx * 8, cy + fy * 8);
      pn.l('apoio', 1.2, cx, cy, cx - dx * 40, cy - dy * 40);
    }
  }
  if (p.equipamento === 'barra-fixa') {
    if (p.apoio === 'barra-acima') {
      pn.l('apoio', 1, m.x - 16, m.y, m.x - 16, 2);
      pn.l('apoio', 1, m.x + 16, m.y, m.x + 16, 2);
      pn.l('equip', 2.1, m.x - 16, m.y, m.x + 16, m.y);
    } else {
      pn.l('apoio', 1.6, m.x, m.y + 3.6, m.x, CHAO - 0.9);
      pn.l('equip', 2.1, m.x - 8, m.y + 2.6, m.x + 8, m.y + 2.6);
    }
  }
  if (extra?.paredeAtras) pn.l('apoio', 2.4, sk.quadril.x - 6, 18, sk.quadril.x - 6, CHAO);
  if (extra?.suporteMaos === 'banco') {
    pn.l('apoio', 1.8, sk.maoE.x + 1, sk.maoE.y + 5, sk.maoE.x + 1, CHAO - 0.9);
    pn.l('estofado', 4.6, sk.maoE.x - 8, sk.maoE.y + 4.2, sk.maoE.x + 9, sk.maoE.y + 4.2);
  } else if (extra?.suporteMaos === 'parede') {
    pn.l('apoio', 2.2, sk.maoE.x + 2.6, sk.maoE.y - 40, sk.maoE.x + 2.6, CHAO);
  } else if (extra?.suporteMaos === 'paralelas') {
    pn.l('apoio', 1.6, sk.maoE.x, sk.maoE.y + 4, sk.maoE.x, CHAO - 0.9);
    pn.l('equip', 2.1, sk.maoE.x - 9, sk.maoE.y + 2.8, sk.maoE.x + 9, sk.maoE.y + 2.8);
  }
  if (p.equipamento === 'argolas') {
    pn.l('apoio', 0.9, sk.maoE.x, 2, sk.maoE.x, sk.maoE.y);
    pn.l('apoio', 0.9, sk.maoD.x, 2, sk.maoD.x, sk.maoD.y);
  }
  if (p.equipamento === 'bicicleta') bicicleta(sk, pn);
}

function equipamentoFrente(p: PadraoDef, sk: Esqueleto, pn: Pincel, extra?: PadraoExtra): void {
  const lado = p.vista === 'lado';
  const m = maosMedias(sk);
  switch (p.equipamento) {
    case 'barra':
      if (lado) {
        pn.c('placa-d', 0.8, m.x + 1.5, m.y - 0.9, PLACA_R);
        pn.c('placa', 1.2, m.x, m.y, PLACA_R);
        pn.c('equip', 0.7, m.x, m.y, PLACA_R * 0.62);
        pn.c('equipcheio', 1, m.x, m.y, 1.4);
      } else {
        pn.l('equip', 1.8, m.x - 20, m.y, m.x + 20, m.y);
        for (const s of [-1, 1]) {
          pn.l('placa', 3.2, m.x + s * 17, m.y - 5.6, m.x + s * 17, m.y + 5.6);
          pn.l('placa', 2.6, m.x + s * 14.2, m.y - 4.4, m.x + s * 14.2, m.y + 4.4);
        }
      }
      break;
    case 'halteres':
      if (lado) {
        hexagono(pn, 'placa-d', sk.maoD.x + 0.8, sk.maoD.y - 0.4, 3.7);
        hexagono(pn, 'placa', sk.maoE.x, sk.maoE.y, 3.7);
        pn.c('equipcheio', 1, sk.maoE.x, sk.maoE.y, 1);
      } else {
        for (const h of [sk.maoE, sk.maoD]) {
          pn.l('equip', 1.4, h.x - 4, h.y, h.x + 4, h.y);
          pn.l('placa', 3.6, h.x - 3.6, h.y - 3.2, h.x - 3.6, h.y + 3.2);
          pn.l('placa', 3.6, h.x + 3.6, h.y - 3.2, h.x + 3.6, h.y + 3.2);
        }
      }
      break;
    case 'cabo': {
      const a = extra?.ancoraCabo ?? { x: m.x, y: 6 };
      if (lado || extra?.cabos !== 'cruzado') {
        pn.l('equip', 0.9, m.x, m.y, a.x, a.y);
        pn.c('placa', 1, a.x, a.y, 2.4);
      } else {
        pn.l('equip', 0.9, sk.maoE.x, sk.maoE.y, 4, a.y);
        pn.l('equip', 0.9, sk.maoD.x, sk.maoD.y, 96, a.y);
        pn.c('placa', 1, 4, a.y, 2.4);
        pn.c('placa', 1, 96, a.y, 2.4);
      }
      break;
    }
    case 'bola':
      pn.c('placa', 1.2, m.x, m.y - 1, 7);
      pn.c('equip', 0.7, m.x, m.y - 1, 4.2);
      break;
    case 'luvas':
      pn.c('camisa', 1, sk.maoD.x, sk.maoD.y, 3.5);
      pn.c('camisa', 1, sk.maoE.x, sk.maoE.y, 3.9);
      pn.c('detalhe', 0.8, sk.maoE.x - 0.6, sk.maoE.y - 0.4, 1.6);
      break;
    case 'corda':
      pn.l('equip', 1.3, sk.maoE.x, sk.maoE.y, sk.maoE.x + 24, sk.maoE.y + 6);
      pn.l('equip', 1.3, sk.maoD.x, sk.maoD.y, sk.maoD.x + 24, sk.maoD.y - 2);
      break;
    default:
      break;
  }
}

/**
 * Conta ao pincel, de trás para a frente, tudo o que forma a figura. A ordem e
 * a quantidade de primitivas NÃO dependem da pose nem dos músculos.
 */
export function desenhar(p: PadraoDef, pose: Pose, sk: Esqueleto, pn: Pincel, extra?: PadraoExtra, ativos?: ReadonlySet<string>): void {
  if (p.chao !== false) {
    pn.l('chao', 1, -80, CHAO, 180, CHAO);
    sombraNoChao(pn, sk, CHAO);
  }
  equipamentoAtras(p, sk, pose, pn, extra);
  ilustrar(p, pose, sk, pn, p.equipamento !== 'nenhum', ativos);
  equipamentoFrente(p, sk, pn, extra);
}

const cachePrimitivas = new WeakMap<PadraoDef, readonly Primitiva[]>();
const PROVA_POSE = criarPose();
const PROVA_ESQ = criarEsqueleto();

/** Lista (e guarda) as primitivas de um padrão: o que o componente renderiza uma vez. */
export function primitivasDe(p: PadraoDef, extra?: PadraoExtra): readonly Primitiva[] {
  const guardado = cachePrimitivas.get(p);
  if (guardado) return guardado;
  const coletor = new PincelColetor();
  amostrarPadrao(p, 0.5, PROVA_POSE);
  resolver(PROVA_POSE, p.vista, PROVA_ESQ, PROPORCOES, extra?.anguloPe);
  desenhar(p, PROVA_POSE, PROVA_ESQ, coletor, extra);
  cachePrimitivas.set(p, coletor.lista);
  return coletor.lista;
}

const CENA_POSE = criarPose();
const CENA_ESQ = criarEsqueleto();
const GRAVADOR = new PincelGravador();

/** Grava a figura na posição `t` do loop (0..1) em `geo`. `ativos`: músculos a acender. */
export function preencherGeometria(
  p: PadraoDef, t: number, geo: Geometria, extra?: PadraoExtra, ativos?: ReadonlySet<string>,
): Geometria {
  amostrarPadrao(p, t, CENA_POSE);
  resolver(CENA_POSE, p.vista, CENA_ESQ, PROPORCOES, extra?.anguloPe);
  GRAVADOR.geo = geo; GRAVADOR.i = 0;
  desenhar(p, CENA_POSE, CENA_ESQ, GRAVADOR, extra, ativos);
  return geo;
}

/* ------------------------------------------------------------------ */
/* Enquadramento automático                                            */
/* ------------------------------------------------------------------ */

export interface Retangulo { readonly x: number; readonly y: number; readonly w: number; readonly h: number }

/** Passos de t amostrados para achar os limites (as poses extremas estão nos quadros; isto cobre o meio). */
const AMOSTRAS_DO_ENQUADRAMENTO = 48;
/** Margem em volta dos limites: 10% de cada lado. */
const FATOR_DA_MARGEM = 1.2;
/** Respiro entre o chão e a borda de baixo, em fração da altura do quadro. */
const RESPIRO_DO_CHAO = 0.07;

const NUMEROS = /-?\d+(?:\.\d+)?/g;
const cacheLimites = new WeakMap<PadraoDef, Retangulo>();

/**
 * O menor retângulo que contém TODAS as poses do loop: corpo, equipamento,
 * chão e sombra. Calculado uma vez por padrão. A linha do chão e a da água
 * atravessam o quadro de propósito e só contam na altura, não na largura.
 */
export function limitesDoPadrao(p: PadraoDef, extra?: PadraoExtra): Retangulo {
  const guardado = cacheLimites.get(p);
  if (guardado) return guardado;
  const prims = primitivasDe(p, extra);
  const geo = criarGeometria(prims.length);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const ponto = (x: number, y: number, folga: number): void => {
    if (x - folga < x0) x0 = x - folga;
    if (x + folga > x1) x1 = x + folga;
    if (y - folga < y0) y0 = y - folga;
    if (y + folga > y1) y1 = y + folga;
  };
  for (let i = 0; i <= AMOSTRAS_DO_ENQUADRAMENTO; i++) {
    preencherGeometria(p, i / AMOSTRAS_DO_ENQUADRAMENTO, geo, extra);
    prims.forEach((pr, k) => {
      const o = k * 4;
      if (pr.k === 'l') {
        if (pr.c === 'chao' || pr.c === 'agua') { y0 = Math.min(y0, geo.g[o + 1]); y1 = Math.max(y1, geo.g[o + 1] + (pr.c === 'agua' ? 0 : 1.5)); return; }
        ponto(geo.g[o], geo.g[o + 1], pr.w / 2);
        ponto(geo.g[o + 2], geo.g[o + 3], pr.w / 2);
      } else if (pr.k === 'c') {
        ponto(geo.g[o], geo.g[o + 1], geo.g[o + 2] + pr.w / 2);
      } else if (pr.c !== 'sombra' && geo.d[k]) {
        const n = geo.d[k].match(NUMEROS);
        if (n) for (let j = 0; j + 1 < n.length; j += 2) ponto(Number(n[j]), Number(n[j + 1]), 0);
      }
    });
  }
  if (p.chao !== false) y1 = Math.max(y1, CHAO + 2.2);
  const r = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  cacheLimites.set(p, r);
  return r;
}

const cacheQuadros = new WeakMap<PadraoDef, Map<number, Retangulo>>();

/**
 * O viewBox da figura para um contêiner de proporção `aspecto` (largura/altura):
 * os limites mais 10% de margem, centrados e na proporção do contêiner, para a
 * figura encher o cartão. Padrões com chão apoiam o chão num respiro fixo da
 * borda de baixo; os demais (suspensos, na água) ficam centrados.
 */
export function enquadramentoDe(p: PadraoDef, extra: PadraoExtra | undefined, aspecto: number): Retangulo {
  let porAspecto = cacheQuadros.get(p);
  if (!porAspecto) { porAspecto = new Map(); cacheQuadros.set(p, porAspecto); }
  const guardado = porAspecto.get(aspecto);
  if (guardado) return guardado;
  const b = limitesDoPadrao(p, extra);
  const w = Math.max(b.w * FATOR_DA_MARGEM, b.h * FATOR_DA_MARGEM * aspecto);
  const h = w / aspecto;
  const cx = b.x + b.w / 2;
  const yChao = CHAO + RESPIRO_DO_CHAO * h - h;
  const y = p.chao !== false ? Math.min(Math.max(yChao, b.y + b.h - h), b.y) : b.y + b.h / 2 - h / 2;
  const r = { x: cx - w / 2, y, w, h };
  porAspecto.set(aspecto, r);
  return r;
}
