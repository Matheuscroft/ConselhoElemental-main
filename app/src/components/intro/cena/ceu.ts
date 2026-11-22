import {
  BackSide, DoubleSide, Group, Mesh, MeshBasicNodeMaterial, NormalBlending, PlaneGeometry, SphereGeometry, AdditiveBlending,
} from 'three/webgpu';
import {
  abs, atan, clamp, color, dot, exp, float, floor, fract, hash, length, mix, mx_fractal_noise_float, normalize, positionLocal, pow,
  sin, smoothstep, sqrt, time, uniform, uv, vec2, vec3, max,
} from 'three/tsl';
import { COR } from './paleta';

/**
 * The third plane: dusk sky, the valley's ridges, the river of mist and the Moon. All procedural
 * (zero texture bytes) and cheap: a sky dome, a few cards and a sprite. Atmospheric perspective comes
 * from colour, not geometry: the further a ridge, the closer it is to the lavender of the mist.
 */

export interface Ceu {
  readonly grupo: Group;
  /** 0..1 lit fraction and whether waxing, from the real lunar snapshot. */
  definirLua(fracao: number, crescente: boolean): void;
  /** Overall intensity of the valley light (the glow near the horizon), 0..1. */
  readonly brilhoHorizonte: { value: number };
  dispose(): void;
}

export function criarCeu(qualidadeNevoa: number): Ceu {
  const grupo = new Group();
  grupo.name = 'Ceu';
  const descartaveis: { dispose(): void }[] = [];
  const brilhoHorizonte = uniform(1);

  /* ---------- cúpula: gradiente, estrelas, brilho baixo ---------- */
  const domoGeo = new SphereGeometry(500, 48, 24);
  const domoMat = new MeshBasicNodeMaterial({ side: BackSide, depthWrite: false, fog: false });
  const dir = normalize(positionLocal);
  const altura = dir.y;
  const gradiente = mix(color(COR.horizonte), color(COR.noite), smoothstep(-0.01, 0.3, altura));
  // nuvens: faixas de ruído esticadas na horizontal, escuras, com a borda de baixo tocada pelo lilás do vale
  const azimute = atan(dir.x, dir.z);
  const nc = vec2(azimute.mul(2.2), altura.mul(10));
  const nuvemA = mx_fractal_noise_float(vec3(nc.x, nc.y, time.mul(0.004)), 5, 2.0, 0.55).mul(0.5).add(0.5);
  const nuvemB = mx_fractal_noise_float(vec3(nc.x, nc.y.add(0.35), time.mul(0.004)), 5, 2.0, 0.55).mul(0.5).add(0.5);
  const faixaNuvem = smoothstep(0.02, 0.1, altura).mul(smoothstep(0.7, 0.2, altura));
  const densidade = smoothstep(0.48, 0.72, nuvemA).mul(faixaNuvem);
  const bordaNuvem = clamp(nuvemA.sub(nuvemB).mul(4), 0, 1).mul(faixaNuvem).mul(float(1).sub(densidade.mul(0.5)));
  // brilho do horizonte, mais forte do lado da lua (direita) e muito suave
  const ladoLua = clamp(dot(dir, vec3(0.57, 0.0, -0.82)), 0, 1);
  const halo = exp(abs(altura).mul(-14)).mul(0.22).add(pow(ladoLua, 6).mul(exp(abs(altura).mul(-6))).mul(0.12)).mul(brilhoHorizonte);
  // estrelas: uma por célula, redondas, só acima do horizonte, com cintilação lenta
  const grade = dir.mul(170);
  const celula = floor(grade);
  const sorte = hash(dot(celula, vec3(12.9898, 78.233, 37.719)));
  const local = fract(grade).sub(0.5);
  const ponto = smoothstep(0.22, 0.0, length(local));
  const visivel = smoothstep(0.06, 0.3, altura);
  const cintila = sin(time.mul(1.3).add(sorte.mul(60))).mul(0.35).add(0.65);
  const estrela = ponto.mul(smoothstep(0.9965, 0.9992, sorte)).mul(visivel).mul(cintila).mul(0.85).mul(float(1).sub(densidade));
  const comNuvens = mix(gradiente, color('#0b0918'), densidade.mul(0.75)).add(color(COR.horizonteQuente).mul(bordaNuvem.mul(0.22)));
  domoMat.colorNode = comNuvens.add(color(COR.horizonteQuente).mul(halo)).add(vec3(estrela));
  const domo = new Mesh(domoGeo, domoMat);
  domo.renderOrder = -10;
  grupo.add(domo);
  descartaveis.push(domoGeo, domoMat);

  /* ---------- cristas em três camadas (cartões com silhueta por ruído) ---------- */
  const camadas = [
    { dist: 170, largura: 900, base: -14, altura: 34, cor: COR.cristaLonge, freq: 3.2, semente: 11, aspereza: 0.55, nevoa: 0.55 },
    { dist: 78, largura: 420, base: -15, altura: 20, cor: COR.cristaMeio, freq: 4.5, semente: 23, aspereza: 0.65, nevoa: 0.35 },
    { dist: 30, largura: 170, base: -10, altura: 9, cor: COR.cristaPerto, freq: 6.5, semente: 37, aspereza: 0.75, nevoa: 0.18 },
  ];
  camadas.forEach((c, i) => {
    // o cartão desce bem abaixo da base e some na névoa: vista de cima, a borda reta não aparece
    const geo = new PlaneGeometry(c.largura, c.altura * 2.2);
    const mat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: DoubleSide, fog: false, blending: NormalBlending });
    const u = uv().x, v = uv().y;
    const perfil = mx_fractal_noise_float(vec2(u.mul(c.freq), float(c.semente)), 5, 2.0, c.aspereza).mul(0.5).add(0.5);
    const picos = pow(perfil, 1.6).mul(0.62).add(0.18);
    const aresta = 0.004 + i * 0.002;
    const solido = smoothstep(picos.add(aresta), picos.sub(aresta), v);
    // base some na névoa (perspectiva atmosférica) e o topo recebe uma borda clara de contraluz
    // rocha opaca com veios verticais; a névoa só come a base (antes a crista parecia papel translúcido)
    // silhueta sempre mais escura que o céu (perto mais escura, longe mais clara); a névoa só come a base
    const escuro = [0.62, 0.48, 0.36][i];
    const corBase = mix(color(c.cor).mul(escuro), color(COR.nevoa).mul(0.7), float(c.nevoa * 0.5).add(smoothstep(0.35, 0.0, v).mul(0.4)));
    const veios = mx_fractal_noise_float(vec2(u.mul(c.freq * 14), v.mul(5).add(c.semente)), 3, 2.0, 0.5).mul(0.5).add(0.5);
    // borda de contraluz larga e suave (um fio fino lia como linha desenhada)
    const bordaLuz = smoothstep(picos.sub(0.06), picos, v).mul(0.12);
    mat.colorNode = corBase.mul(veios.mul(0.3).add(0.85)).add(color(COR.contraluzFria).mul(bordaLuz));
    mat.opacityNode = solido.mul(smoothstep(0.0, 0.18, v));
    const m = new Mesh(geo, mat);
    m.position.set(i === 0 ? 40 : i === 1 ? 10 : -6, c.base + c.altura * 1.1 - c.altura * 2.2 / 2 + c.altura * 0.2, -c.dist);
    m.renderOrder = -9 + i;
    grupo.add(m);
    descartaveis.push(geo, mat);
  });

  /* ---------- névoa: rio no fundo do vale e faixas (2–3 conforme o nível) ---------- */
  const nevoas = [
    { tipo: 'rio' as const, y: -13, dist: 120, w: 700, h: 320 },
    { tipo: 'faixa' as const, y: -8.5, dist: 52, w: 420, h: 16 },
    { tipo: 'faixa' as const, y: -5.5, dist: 24, w: 160, h: 8 },
  ].slice(0, Math.max(0, qualidadeNevoa));
  nevoas.forEach((n, i) => {
    const geo = new PlaneGeometry(n.w, n.h);
    const mat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: DoubleSide, fog: false, blending: NormalBlending });
    const u = uv().x, v = uv().y;
    const deriva = time.mul(0.004 + i * 0.002);
    const ruido = mx_fractal_noise_float(vec2(u.mul(n.tipo === 'rio' ? 6 : 9).add(deriva), v.mul(n.tipo === 'rio' ? 4 : 1.5).add(i * 3.1)), 4, 2.0, 0.5).mul(0.5).add(0.5);
    const perfil = n.tipo === 'rio'
      ? smoothstep(0.0, 0.25, v).mul(smoothstep(1.0, 0.55, v))
      : pow(sin(v.mul(Math.PI)), 2.0);
    const op = perfil.mul(smoothstep(0.32, 0.78, ruido)).mul(n.tipo === 'rio' ? 0.42 : 0.2);
    mat.colorNode = mix(color(COR.nevoa), color(COR.nevoaClara), ruido.mul(0.5));
    mat.opacityNode = op;
    const m = new Mesh(geo, mat);
    if (n.tipo === 'rio') { m.rotation.x = -Math.PI / 2; m.position.set(0, n.y, -n.dist); }
    else m.position.set(0, n.y, -n.dist);
    m.renderOrder = -6 + i;
    grupo.add(m);
    descartaveis.push(geo, mat);
  });

  /* ---------- lua: ponto de luz no horizonte, com a fase real ---------- */
  const fracao = uniform(0.5), crescente = uniform(1);
  const luaGeo = new PlaneGeometry(1, 1);
  const luaMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, fog: false, blending: AdditiveBlending });
  const p = uv().sub(0.5).mul(2);
  const r = length(p);
  const disco = smoothstep(0.42, 0.38, r);
  // terminador: para cada linha do disco, o limite iluminado desliza com a fração (crescente acende à direita)
  const meiaCorda = sqrt(max(float(0.16).sub(p.y.mul(p.y)), 0));
  const xs = p.x.mul(crescente.mul(2).sub(1));
  const limite = float(1).sub(fracao.mul(2)).mul(meiaCorda);
  const iluminado = smoothstep(limite.sub(0.02), limite.add(0.02), xs);
  const halo2 = exp(r.mul(-3.2)).mul(0.5);
  luaMat.colorNode = color(COR.lua).mul(disco.mul(iluminado.mul(0.95).add(0.05)).add(halo2));
  luaMat.opacityNode = clamp(disco.add(halo2), 0, 1);
  const lua = new Mesh(luaGeo, luaMat);
  lua.scale.setScalar(9);
  lua.position.set(150, 36, -211); // alto à direita no pôster 9:16, como no K1a
  lua.renderOrder = -8;
  lua.onBeforeRender = (_r, _s, cam) => { lua.quaternion.copy(cam.quaternion); };
  grupo.add(lua);
  descartaveis.push(luaGeo, luaMat);

  return {
    grupo,
    brilhoHorizonte,
    definirLua(f, cresc) { fracao.value = f; crescente.value = cresc ? 1 : 0; },
    dispose() { for (const d of descartaveis) d.dispose(); },
  };
}
