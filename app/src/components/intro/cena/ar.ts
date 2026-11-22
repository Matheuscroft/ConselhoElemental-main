import {
  AdditiveBlending, BufferAttribute, DoubleSide, Group, Mesh, MeshStandardNodeMaterial, PlaneGeometry, Sprite, SpriteNodeMaterial, Vector3,
  type Object3D,
} from 'three/webgpu';
import {
  attribute, clamp, color, float, frontFacing, hash, instanceIndex, length, mix, mx_noise_float, positionLocal, select, sin, cos, smoothstep,
  uniform, uv, vec3,
} from 'three/tsl';
import { COR, ELEMENTO } from './paleta';
import { alturaDaFolha, SELO_NA_PAGINA, type Livro } from './livro';
import { easeInOutSine, easeOutBack, easeOutCubic, type Animador } from './anima';

/**
 * Air, the fourth gesture: the lower outer corner of the right page lifts as the finger pulls up, curling
 * round a cylinder whose fold line walks in from the corner. Let go past the threshold and the wind
 * finishes it: the corner rises, lilac wisps fly from it to the Air quadrant, the corner settles back and the
 * lilac ink settles. Let go too early and it falls back flat. The flap is invisible at rest (the page itself
 * is the corner), so nothing doubles the paper until it moves.
 */

export interface GestoAr {
  readonly grupo: Object3D;
  /** Page-local corner (metres from the Seal's centre). */
  readonly canto: { readonly x: number; readonly y: number };
  mostrar(): void;
  /** Lift (0..1). */
  definir(progresso: number): void;
  /** Released too early: the corner falls back flat. */
  cair(anima: Animador): Promise<void>;
  /** The wind finishes: lift, wisps, settle, ink. `aoVento` fires as the wisps leave. */
  concluir(anima: Animador, aoVento?: () => void): Promise<void>;
  posicaoCanto(): Vector3;
  atualizar(t: number): void;
  dispose(): void;
}

const TAM = 0.07;
const DIV = 18;
/** Lower outer corner of the right page (page-local): fore-edge x, tail y (after the page inset). */
const CANTO = { x: 0.2106 - SELO_NA_PAGINA.x, y: -(0.1411 - SELO_NA_PAGINA.z) };
const ALVO_AR = { x: -0.031, y: -0.031 };

export function criarAr(livro: Livro): GestoAr {
  const p = ELEMENTO.ar;
  const grupo = new Group(); grupo.name = 'Ar'; grupo.visible = false;
  livro.raiz.add(grupo);
  const descartaveis: { dispose(): void }[] = [];
  const vento = uniform(0);
  const levanta = uniform(0);

  /* ---------- a aba: quadrado de papel no canto, curvado por um cilindro na CPU ---------- */
  const geo = new PlaneGeometry(1, 1, DIV, DIV);
  const pos = geo.getAttribute('position') as BufferAttribute;
  // altura de cada vértice acima da página: só o que se ergue aparece (a parte deitada deixa ver a página real)
  const alturas = new BufferAttribute(new Float32Array(pos.count), 1);
  geo.setAttribute('altura', alturas);
  // coordenadas de página de cada vértice (o quadrado vai de canto−TAM até o canto)
  const pag = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i += 1) {
    pag[i * 2] = CANTO.x - TAM + (pos.getX(i) + 0.5) * TAM;
    pag[i * 2 + 1] = CANTO.y + (pos.getY(i) + 0.5) * TAM;
  }
  const mat = new MeshStandardNodeMaterial({ side: DoubleSide, roughness: 0.9, metalness: 0, transparent: true });
  const fibra = mx_noise_float(positionLocal.mul(900)).mul(0.04).add(0.96);
  const frente = mix(color(COR.papel), color(COR.papelSombra), 0.55).mul(fibra).mul(0.86);
  const verso = mix(color(COR.papel), color(COR.papelSombra), 0.25).mul(fibra).mul(0.95);
  mat.colorNode = select(frontFacing, frente, verso);
  mat.emissiveNode = color(p.aura).mul(levanta.mul(0.06));
  mat.opacityNode = smoothstep(0.0003, 0.0022, attribute('altura', 'float')).mul(smoothstep(0.0, 0.03, levanta));
  const aba = new Mesh(geo, mat); aba.renderOrder = 4; aba.visible = false;
  grupo.add(aba);
  descartaveis.push(geo, mat);

  const e1 = { x: Math.SQRT1_2, y: -Math.SQRT1_2 }; // de dentro da página para o canto
  let prog = 0, oscila = 0;
  const curvar = (k: number, t: number) => {
    const s = 0.006 + k * 0.055 + Math.sin(t * 9) * 0.0012 * oscila * k;
    const R = 0.004 + k * 0.01;
    const F = { x: CANTO.x - s * e1.x, y: CANTO.y - s * e1.y };
    const arr = pos.array as Float32Array;
    for (let i = 0; i < pos.count; i += 1) {
      let x = pag[i * 2], y = pag[i * 2 + 1];
      const xp = (x - F.x) * e1.x + (y - F.y) * e1.y;
      let sobe = 0;
      if (xp > 0) {
        const th = xp / R;
        const plano = th <= Math.PI ? R * Math.sin(th) : -(xp - Math.PI * R);
        sobe = th <= Math.PI ? R * (1 - Math.cos(th)) : 2 * R;
        x += (plano - xp) * e1.x; y += (plano - xp) * e1.y;
      }
      const X = SELO_NA_PAGINA.x + x;
      (alturas.array as Float32Array)[i] = sobe;
      arr[i * 3] = X;
      arr[i * 3 + 1] = SELO_NA_PAGINA.y + alturaDaFolha(X, 1) + 0.0005 + sobe;
      arr[i * 3 + 2] = SELO_NA_PAGINA.z - y;
    }
    pos.needsUpdate = true; alturas.needsUpdate = true;
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
  };

  /* ---------- fiapos de vento: do canto ao quadrante do Ar, em espiral ---------- */
  const fiapoMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const i = float(instanceIndex);
  const atraso = hash(i).mul(0.45);
  const tt = clamp(vento.sub(atraso).div(0.55), 0, 1);
  const c0 = vec3(SELO_NA_PAGINA.x + CANTO.x, SELO_NA_PAGINA.y + 0.004, SELO_NA_PAGINA.z - CANTO.y);
  const c2 = vec3(SELO_NA_PAGINA.x + ALVO_AR.x, SELO_NA_PAGINA.y + 0.003, SELO_NA_PAGINA.z - ALVO_AR.y);
  const c1 = c0.add(c2).mul(0.5).add(vec3(0.01, 0.035, 0.01));
  const um = float(1).sub(tt);
  const bez = c0.mul(um.mul(um)).add(c1.mul(um.mul(tt).mul(2))).add(c2.mul(tt.mul(tt)));
  const giro = tt.mul(9).add(hash(i.add(2.2)).mul(6.28));
  const raio = float(0.006).mul(sin(tt.mul(Math.PI)));
  fiapoMat.positionNode = bez.add(vec3(cos(giro).mul(raio), sin(giro.mul(0.7)).mul(raio).mul(0.6), sin(giro).mul(raio)));
  fiapoMat.scaleNode = float(0.0034).mul(sin(tt.mul(Math.PI)).mul(0.7).add(0.3));
  const disco = smoothstep(0.5, 0.0, length(uv().sub(0.5)));
  fiapoMat.colorNode = mix(color(p.aura), color(p.acento), hash(i.add(4.4))).mul(disco).mul(sin(tt.mul(Math.PI))).mul(1.5);
  const fiapos = new Sprite(fiapoMat); fiapos.count = 16; fiapos.frustumCulled = false; fiapos.visible = false; fiapos.renderOrder = 6;
  grupo.add(fiapos);
  descartaveis.push(fiapoMat);

  let t0 = 0;
  const canto = new Vector3(SELO_NA_PAGINA.x + CANTO.x - 0.008, SELO_NA_PAGINA.y + alturaDaFolha(SELO_NA_PAGINA.x + CANTO.x, 1), SELO_NA_PAGINA.z - CANTO.y - 0.008);

  return {
    grupo,
    canto: CANTO,
    mostrar() { grupo.visible = true; prog = 0; levanta.value = 0; vento.value = 0; aba.visible = false; fiapos.visible = false; },
    definir(k) {
      prog = Math.max(0, Math.min(1, k)); levanta.value = prog; oscila = 1;
      aba.visible = prog > 0.005;
      if (aba.visible) curvar(prog, t0);
    },
    async cair(anima) {
      oscila = 0;
      await anima.animar({ de: prog, para: 0, duracao: 0.35 + prog * 0.3, easing: easeOutBack(1.3), aplicar: (k) => { prog = Math.max(0, k); levanta.value = prog; aba.visible = prog > 0.005; if (aba.visible) curvar(prog, t0); } });
    },
    async concluir(anima, aoVento) {
      oscila = 0;
      // o vento termina o gesto: a ponta sobe inteira, os fiapos partem, a ponta assenta
      await anima.animar({ de: prog, para: 1, duracao: 0.3 + (1 - prog) * 0.3, easing: easeOutCubic, aplicar: (k) => { prog = k; levanta.value = k; aba.visible = true; curvar(k, t0); } });
      fiapos.visible = true; aoVento?.();
      void anima.animar({ de: 0, para: 1, duracao: 1.2, easing: easeInOutSine, aplicar: (k) => { vento.value = k; } });
      await anima.esperar(0.25);
      void anima.animar({ de: 1, para: 0, duracao: 0.7, easing: easeOutBack(1.4), aplicar: (k) => { prog = Math.max(0, k); levanta.value = prog; aba.visible = prog > 0.005; if (aba.visible) curvar(prog, t0); } });
      await anima.esperar(0.45);
      void anima.animar({ de: 0, para: 1, duracao: 0.6, easing: easeOutCubic, aplicar: (k) => { livro.brilho.ar.value = k; } });
      await anima.animar({ de: 0, para: 1, duracao: 1.3, easing: easeInOutSine, aplicar: (k) => { livro.tinta.ar.value = k; } });
      await anima.animar({ de: 1, para: 0.35, duracao: 0.8, easing: easeInOutSine, aplicar: (k) => { livro.brilho.ar.value = k; } });
      fiapos.visible = false; grupo.visible = false;
    },
    posicaoCanto: () => canto.clone(),
    atualizar(t) { t0 = t; if (grupo.visible && aba.visible && oscila > 0 && prog > 0) curvar(prog, t); },
    dispose() { for (const d of descartaveis) d.dispose(); grupo.removeFromParent(); },
  };
}
