import {
  AdditiveBlending, BufferGeometry, DoubleSide, Float32BufferAttribute, Group, InstancedBufferAttribute, Mesh, MeshBasicNodeMaterial,
  NormalBlending, PlaneGeometry, Sprite, SpriteNodeMaterial, Vector3, type Object3D,
} from 'three/webgpu';
import {
  abs, clamp, color, exp, float, instancedDynamicBufferAttribute, length, max, mix, mx_noise_float, pow, sin, smoothstep, time,
  uniform, uv, vec2, vec3,
} from 'three/tsl';
import { TRACO_FOGO } from '@/lib/intro/gestos';
import { ELEMENTO } from './paleta';
import { naPagina, type Livro } from './livro';
import { easeInOutSine, easeOutBack, easeOutCubic, type Animador } from './anima';

/**
 * Fire, the third gesture: a charred line of light lies unlit at the top of the Fire quadrant, an ember
 * glowing at its inner end. A fast stroke along it throws sparks from the finger; if it counts, fire runs
 * the line in the direction of the stroke, a two-tipped flame flares under it and burns down to embers
 * while the copper ink settles. A slow or short stroke only fizzles.
 */

export interface GestoFogo {
  readonly grupo: Object3D;
  mostrar(): void;
  /** Sparks at a page point (metres from the Seal's centre), stronger with `forca` (0..1). */
  faisca(x: number, y: number, forca: number): void;
  /** A stroke that did not light: the sparks die, the ember winks. */
  falhar(): void;
  /** Light the line from the side the stroke came from, flare the flame, settle the ink. */
  acender(anima: Animador, direcao: -1 | 0 | 1, aoChama?: () => void): Promise<void>;
  posicaoBrasa(): Vector3;
  atualizar(t: number, dt: number): void;
  dispose(): void;
}

// TSL encadeia livremente; um apelido solto mantém legíveis as misturas de tipos (como em livro.ts)
 
type Nodo = any;

const N_FAISCAS = 28;
const CHAMA = { x: 0.035, y: -0.04 };

export function criarFogo(livro: Livro): GestoFogo {
  const p = ELEMENTO.fogo;
  const grupo = new Group(); grupo.name = 'Fogo'; grupo.visible = false;
  livro.raiz.add(grupo);
  const descartaveis: { dispose(): void }[] = [];
  const frente = uniform(0); // 0..1: até onde o fogo correu pelo fio
  const sentido = uniform(1);
  const brasa = uniform(1);
  const calor = uniform(0); // brilho do fio aceso, cai para brasa
  const chamaK = uniform(0);

  /* ---------- o fio: carvão com brasas tênues; aceso, corre fogo na direção do risco ---------- */
  const PASSOS = 40, LARG = 0.0026;
  const pos: number[] = [], uvs: number[] = [], idx: number[] = [];
  const dx = TRACO_FOGO.ate.x - TRACO_FOGO.de.x, dy = TRACO_FOGO.ate.y - TRACO_FOGO.de.y;
  const L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i <= PASSOS; i += 1) {
    const k = i / PASSOS;
    for (const lado of [-1, 1]) {
      const v = naPagina(TRACO_FOGO.de.x + dx * k + nx * lado * LARG / 2, TRACO_FOGO.de.y + dy * k + ny * lado * LARG / 2, 0.0007);
      pos.push(v.x, v.y, v.z); uvs.push(k, lado < 0 ? 0 : 1);
    }
    if (i < PASSOS) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const fioGeo = new BufferGeometry();
  fioGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  fioGeo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  fioGeo.setIndex(idx);
  const fioMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: DoubleSide, blending: NormalBlending });
  const u = uv().x, v = uv().y;
  const atravessa = float(1).sub(abs(v.mul(2).sub(1)));
  const ao = mix(u, float(1).sub(u), step01(sentido)); // posição medida a partir do lado onde o risco começou
  const aceso = smoothstep(frente, frente.sub(0.08), ao);
  const lingua = mx_noise_float(vec2(u.mul(30).sub(time.mul(5)), v.mul(3))).mul(0.5).add(0.5);
  const centelhas = smoothstep(0.78, 0.95, mx_noise_float(vec2(u.mul(60), time.mul(1.3))).mul(0.5).add(0.5));
  const carvao: Nodo = color('#2a1a14');
  const fogoCor = mix(color('#c2410c'), color('#ffd28a'), atravessa.mul(lingua));
  fioMat.colorNode = mix(carvao.add(color(p.aura).mul(centelhas.mul(0.35).mul(brasa))), fogoCor.mul(calor.mul(1.6).add(0.4)), aceso);
  fioMat.opacityNode = smoothstep(0.0, 0.6, atravessa).mul(0.9);
  const fio = new Mesh(fioGeo, fioMat); fio.renderOrder = 3;
  grupo.add(fio);
  descartaveis.push(fioGeo, fioMat);

  /* ---------- a brasa no começo do fio: o convite e o alvo do toque ---------- */
  const brasaMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const rb = length(uv().sub(0.5)).mul(2);
  const pulso = sin(time.mul(3.1)).mul(0.3).add(0.7).mul(sin(time.mul(7.7)).mul(0.12).add(0.88));
  brasaMat.colorNode = mix(color('#ffcf7a'), color(p.aura), smoothstep(0.0, 0.45, rb)).mul(pow(float(1).sub(rb.min(1)), 2.4)).mul(pulso.mul(brasa).mul(1.4));
  const brasaS = new Sprite(brasaMat); brasaS.scale.setScalar(0.016); brasaS.renderOrder = 5;
  const pontoBrasa = naPagina(TRACO_FOGO.de.x, TRACO_FOGO.de.y, 0.0016);
  brasaS.position.copy(pontoBrasa);
  grupo.add(brasaS);
  descartaveis.push(brasaMat);

  /* ---------- faíscas: pool reaproveitado, posição e vida escritas na CPU a cada quadro ---------- */
  const dados = new Float32Array(N_FAISCAS * 4); // x, y, z, vida (0..1)
  const atrib = new InstancedBufferAttribute(dados, 4);
  const vel = new Float32Array(N_FAISCAS * 3);
  const faiscaMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const inst: Nodo = instancedDynamicBufferAttribute(atrib, 'vec4');
  const vida = inst.w;
  faiscaMat.positionNode = vec3(inst.x, inst.y, inst.z);
  faiscaMat.scaleNode = float(0.0016).mul(vida.mul(0.7).add(0.3));
  const disco = smoothstep(0.5, 0.0, length(uv().sub(0.5)));
  faiscaMat.colorNode = mix(color(p.aura), color('#fff0c8'), vida).mul(disco).mul(vida.mul(2.2));
  faiscaMat.opacityNode = disco.mul(vida);
  const faiscas = new Sprite(faiscaMat); faiscas.count = N_FAISCAS; faiscas.frustumCulled = false; faiscas.renderOrder = 6;
  grupo.add(faiscas);
  descartaveis.push(faiscaMat);
  let proxima = 0;

  /* ---------- a chama de duas pontas: cartão que encara a câmera, acende e baixa a brasa ---------- */
  const chamaGeo = new PlaneGeometry(1, 1.4);
  // mistura normal: aditiva sobre o papel creme a chama lavava para rosa-claro
  const chamaMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: NormalBlending, side: DoubleSide });
  const cu = uv().x.sub(0.5), cv = uv().y;
  const torce = mx_noise_float(vec2(cv.mul(3).sub(time.mul(2.4)), time.mul(0.7))).mul(0.12).mul(cv);
  const xs = abs(cu.add(torce));
  const largura = float(0.42).mul(pow(float(1).sub(cv), 0.8)).mul(smoothstep(0.0, 0.18, cv).mul(0.5).add(0.5));
  const corpo = smoothstep(largura, largura.mul(0.55), xs);
  const pontas = smoothstep(0.08, 0.0, abs(xs.sub(0.12)).add(max(cv.sub(0.75), 0).mul(0.0)));
  const forma = clamp(corpo.add(pontas.mul(smoothstep(0.55, 0.85, cv)).mul(0.6)), 0, 1).mul(smoothstep(1.0, 0.7, cv));
  const nucleo = exp(xs.mul(-9)).mul(float(1).sub(cv));
  // borda cobre-escura → laranja → núcleo amarelo quente; brilho acima de 1 para o bloom pegar o miolo
  const borda = smoothstep(0.0, 0.6, corpo);
  chamaMat.colorNode = mix(mix(color('#a8360a'), color(p.aura), borda), color('#ffe2a0'), nucleo).mul(float(1.2).add(nucleo.mul(1.4)));
  chamaMat.opacityNode = forma.mul(chamaK).mul(0.95);
  const chama = new Mesh(chamaGeo, chamaMat); chama.renderOrder = 7; chama.visible = false;
  const pontoChama = naPagina(CHAMA.x, CHAMA.y, 0.0);
  chama.onBeforeRender = (_r, _s, cam) => {
    // gira só em volta do eixo vertical: a chama fica de pé sobre o papel
    const ang = Math.atan2(cam.position.x - chama.getWorldPosition(new Vector3()).x, cam.position.z - chama.getWorldPosition(new Vector3()).z);
    chama.rotation.set(0, ang, 0);
  };
  grupo.add(chama);
  descartaveis.push(chamaGeo, chamaMat);
  const halo = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const rh = length(uv().sub(0.5)).mul(2);
  halo.colorNode = color(p.aura).mul(pow(float(1).sub(rh.min(1)), 2.5)).mul(chamaK.mul(0.55));
  const haloS = new Sprite(halo); haloS.renderOrder = 6; haloS.visible = false;
  grupo.add(haloS);
  descartaveis.push(halo);

  const colocarChama = (k: number) => {
    const alt = 0.026 * k;
    chama.scale.set(alt * 0.75, alt, 1);
    chama.position.set(pontoChama.x, pontoChama.y + alt * 0.62, pontoChama.z);
    haloS.visible = chama.visible;
    haloS.scale.setScalar(0.05 * Math.max(0.3, k));
    haloS.position.set(pontoChama.x, pontoChama.y + alt * 0.4, pontoChama.z);
  };

  return {
    grupo,
    mostrar() {
      grupo.visible = true; frente.value = 0; calor.value = 0; brasa.value = 1; chamaK.value = 0; chama.visible = false;
      dados.fill(0); atrib.needsUpdate = true;
    },
    faisca(x, y, forca) {
      const n = 1 + Math.round(forca * 3);
      const w = naPagina(x, y, 0.002);
      for (let k = 0; k < n; k += 1) {
        const i = proxima; proxima = (proxima + 1) % N_FAISCAS;
        dados[i * 4] = w.x; dados[i * 4 + 1] = w.y; dados[i * 4 + 2] = w.z; dados[i * 4 + 3] = 1;
        const a = Math.random() * Math.PI * 2, r = 0.05 + Math.random() * 0.12 * (0.4 + forca);
        vel[i * 3] = Math.cos(a) * r; vel[i * 3 + 1] = 0.06 + Math.random() * 0.12 * (0.5 + forca); vel[i * 3 + 2] = Math.sin(a) * r;
      }
    },
    falhar() {
      // a brasa pisca: um sopro de vida que se apaga
      brasa.value = 1.6;
    },
    async acender(anima, direcao, aoChama) {
      sentido.value = direcao === -1 ? -1 : 1;
      void anima.animar({ de: 1, para: 0, duracao: 0.3, aplicar: (k) => { brasa.value = k; } });
      // o fogo corre o fio, a chama sobe com ultrapassagem
      await anima.animar({ de: 0, para: 1.1, duracao: 0.38, easing: easeOutCubic, aplicar: (k) => { frente.value = k; calor.value = Math.min(1, k); } });
      chama.visible = true;
      aoChama?.();
      await anima.animar({ de: 0, para: 1, duracao: 0.45, easing: easeOutBack(1.8), aplicar: (k) => { chamaK.value = k; colocarChama(k); } });
      // a tinta cobre-alaranjada assenta enquanto a chama baixa a brasa
      void anima.animar({ de: 0, para: 1, duracao: 0.6, easing: easeOutCubic, aplicar: (k) => { livro.brilho.fogo.value = k; } });
      void anima.animar({ de: 0, para: 1, duracao: 1.3, atraso: 0.3, easing: easeInOutSine, aplicar: (k) => { livro.tinta.fogo.value = k; } });
      await anima.esperar(0.5);
      await anima.animar({ de: 1, para: 0, duracao: 1.1, easing: easeInOutSine, aplicar: (k) => { chamaK.value = k; colocarChama(0.4 + 0.6 * k); calor.value = 0.25 + 0.75 * k; } });
      chama.visible = false; haloS.visible = false;
      await anima.animar({ de: 1, para: 0.35, duracao: 0.8, easing: easeInOutSine, aplicar: (k) => { livro.brilho.fogo.value = k; calor.value = 0.25 * (k - 0.35) / 0.65; } });
      grupo.visible = false;
    },
    posicaoBrasa: () => pontoBrasa.clone(),
    atualizar(_t, dt) {
      if (!grupo.visible) return;
      if (brasa.value > 1) brasa.value = Math.max(1, brasa.value - dt * 2.5);
      let vivo = false;
      for (let i = 0; i < N_FAISCAS; i += 1) {
        const l = dados[i * 4 + 3];
        if (l <= 0) continue;
        vivo = true;
        vel[i * 3 + 1] -= 0.55 * dt; // gravidade suave (estamos na escala de centímetros)
        dados[i * 4] += vel[i * 3] * dt; dados[i * 4 + 1] = Math.max(dados[i * 4 + 1] + vel[i * 3 + 1] * dt, pontoBrasa.y - 0.004); dados[i * 4 + 2] += vel[i * 3 + 2] * dt;
        dados[i * 4 + 3] = Math.max(0, l - dt * 2.2);
      }
      if (vivo) atrib.needsUpdate = true;
    },
    dispose() { for (const d of descartaveis) d.dispose(); grupo.removeFromParent(); },
  };
}

/** 1 when the stroke ran backwards (sentido = −1), 0 otherwise. */
 
function step01(s: any) {
  return smoothstep(0.0, -0.5, s);
}
