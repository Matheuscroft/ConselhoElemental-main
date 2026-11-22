import {
  AdditiveBlending, BufferGeometry, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicNodeMaterial, NormalBlending,
  PlaneGeometry, SphereGeometry, Sprite, SpriteNodeMaterial, type Object3D,
} from 'three/webgpu';
import {
  abs, clamp, color, cos, dot, exp, float, hash, instanceIndex, length, max, mix, mx_noise_float, normalize, normalView,
  positionViewDirection, pow, sin, smoothstep, time, uniform, uv, vec2, vec3,
} from 'three/tsl';
import { ARCO_AGUA, pontoNoArco } from '@/lib/intro/gestos';
import { ELEMENTO } from './paleta';
import { naPagina, type Livro } from './livro';
import { easeInOutSine, easeOutCubic, type Animador } from './anima';

/**
 * Water, the first gesture: a glass drop waits at the start of the groove and breathes (the invitation);
 * the finger drags it along the arc and a ribbon of water flows behind it; at the end it splashes and the
 * blue ink settles into the Water quadrant of the page Seal. Everything sits on the open page (book root
 * space), so it rides the same curve as the paper.
 */

export interface GestoAgua {
  readonly grupo: Object3D;
  /** The drop appears at the start of the groove and starts inviting. */
  mostrar(): void;
  /** Progress along the groove (0..1) and whether the finger holds the drop. */
  definir(progresso: number, pegando: boolean): void;
  /** Splash, ribbon sinks into the paper, ink fills the quadrant. Resolves when it settles. */
  concluir(anima: Animador): Promise<void>;
  /** The touch alternative: the drop runs the groove by itself, then concludes. */
  automatico(anima: Animador, aoProgresso?: (p: number, velocidade: number) => void): Promise<void>;
  /** Screen-independent position of the drop, in book root space (for the accessible target). */
  posicaoGota(): import('three/webgpu').Vector3;
  atualizar(t: number): void;
  dispose(): void;
}

const PASSOS = 96;
const LARGURA = 0.0062;

export function criarAgua(livro: Livro): GestoAgua {
  const p = ELEMENTO.agua;
  const grupo = new Group(); grupo.name = 'Agua'; grupo.visible = false;
  livro.raiz.add(grupo);
  const descartaveis: { dispose(): void }[] = [];

  const progresso = uniform(0);
  const pegando = uniform(0);
  const assenta = uniform(0); // 0 fita viva → 1 fita absorvida pela página
  const respingo = uniform(0); // 0..1 tempo do respingo
  const convite = uniform(1);

  /* ---------- fita: tira ao longo do arco, deitada na página curva ---------- */
  const pos: number[] = [], uvs: number[] = [], idx: number[] = [];
  for (let i = 0; i <= PASSOS; i += 1) {
    const k = i / PASSOS;
    const c = pontoNoArco(ARCO_AGUA, k);
    const r = Math.hypot(c.x, c.y);
    for (const lado of [-1, 1]) {
      const rr = r + (lado * LARGURA) / 2;
      const v = naPagina((c.x / r) * rr, (c.y / r) * rr, 0.0009);
      pos.push(v.x, v.y, v.z);
      uvs.push(k, lado < 0 ? 0 : 1);
    }
    if (i < PASSOS) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const fitaGeo = new BufferGeometry();
  fitaGeo.setAttribute('position', new Float32BufferAttribute(pos, 3));
  fitaGeo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  fitaGeo.setIndex(idx);
  const fitaMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: DoubleSide, blending: NormalBlending });
  const u = uv().x, v = uv().y;
  const atravessa = float(1).sub(abs(v.mul(2).sub(1)));
  const corre = mx_noise_float(vec2(u.mul(46).sub(time.mul(2.6)), v.mul(2.5))).mul(0.5).add(0.5);
  const brilhos = smoothstep(0.72, 0.95, mx_noise_float(vec2(u.mul(120).sub(time.mul(4.2)), v.mul(4))).mul(0.5).add(0.5));
  const ate = smoothstep(progresso.add(0.004), progresso.sub(0.012), u); // só até onde a gota chegou
  const cauda = smoothstep(0.0, 0.05, u);
  const cabeca = exp(abs(u.sub(progresso)).mul(-55));
  fitaMat.colorNode = mix(color(p.base), color(p.acento), corre.mul(0.55).add(cabeca.mul(0.45)))
    .add(color('#ffffff').mul(brilhos.mul(0.35)))
    .mul(float(1).sub(assenta.mul(0.35)));
  fitaMat.opacityNode = smoothstep(0.0, 0.55, atravessa).mul(ate).mul(cauda).mul(float(0.92).sub(assenta.mul(0.92)));
  const fita = new Mesh(fitaGeo, fitaMat); fita.renderOrder = 3;
  grupo.add(fita);
  descartaveis.push(fitaGeo, fitaMat);

  /* ---------- gota: vidro com núcleo azul, aro claro e um brilho pontual ---------- */
  const gotaGeo = new SphereGeometry(0.0058, 24, 16);
  const gotaMat = new MeshBasicNodeMaterial({ transparent: true });
  const fr = pow(float(1).sub(clamp(dot(normalView, positionViewDirection), 0, 1)), 1.6);
  const brilho = pow(max(dot(normalView, normalize(vec3(-0.45, 0.65, 0.6))), 0), 36);
  gotaMat.colorNode = mix(color(p.base), color(p.acento), fr).add(color('#ffffff').mul(brilho.mul(1.4))).add(color(p.aura).mul(pegando.mul(0.25)));
  gotaMat.opacityNode = mix(float(0.78), float(1), fr);
  const gota = new Mesh(gotaGeo, gotaMat); gota.renderOrder = 4;
  gota.scale.set(1, 0.72, 1); // gota pousada, achatada
  grupo.add(gota);
  descartaveis.push(gotaGeo, gotaMat);

  /* ---------- aura da gota: respira enquanto convida, acende quando pega ---------- */
  const auraMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const ra = length(uv().sub(0.5)).mul(2);
  const respira = sin(time.mul(2.4)).mul(0.5).add(0.5);
  auraMat.colorNode = color(p.aura).mul(pow(float(1).sub(ra.min(1)), 2.2)).mul(convite.mul(respira.mul(0.5).add(0.35)).add(pegando.mul(0.7)));
  const aura = new Sprite(auraMat); aura.scale.setScalar(0.034); aura.renderOrder = 5;
  grupo.add(aura);
  descartaveis.push(auraMat);

  /* ---------- respingo: anel que abre e gotículas em parábola ---------- */
  const fim = pontoNoArco(ARCO_AGUA, 1);
  const pontoFim = naPagina(fim.x, fim.y, 0.0012);
  const anelGeo = new PlaneGeometry(1, 1);
  const anelMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide });
  const ru = length(uv().sub(0.5)).mul(2);
  const raio = easeAnel(respingo);
  anelMat.colorNode = color(p.aura).mul(exp(abs(ru.sub(raio)).mul(-28))).mul(float(1).sub(respingo)).mul(1.2);
  const anel = new Mesh(anelGeo, anelMat);
  anel.rotation.x = -Math.PI / 2; anel.position.copy(pontoFim); anel.scale.setScalar(0.07); anel.visible = false; anel.renderOrder = 6;
  grupo.add(anel);
  descartaveis.push(anelGeo, anelMat);

  const gotasMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const i = float(instanceIndex);
  const ang = hash(i).mul(Math.PI * 2);
  const vel = hash(i.add(7.1)).mul(0.5).add(0.5);
  const s = respingo;
  gotasMat.positionNode = vec3(
    cos(ang).mul(vel).mul(s).mul(0.03),
    s.mul(vel).mul(0.03).sub(s.mul(s).mul(0.034)),
    sin(ang).mul(vel).mul(s).mul(0.03),
  );
  gotasMat.scaleNode = float(0.0022).mul(float(1).sub(s.mul(0.6)));
  gotasMat.colorNode = color(p.acento).mul(smoothstep(0.5, 0.0, length(uv().sub(0.5)))).mul(float(1).sub(s)).mul(1.4);
  const gotas = new Sprite(gotasMat); gotas.count = 14; gotas.position.copy(pontoFim); gotas.visible = false; gotas.frustumCulled = false; gotas.renderOrder = 6;
  grupo.add(gotas);
  descartaveis.push(gotasMat);

  let prog = 0;
  let vivo = true;
  const colocarGota = (k: number, t = 0) => {
    const c = pontoNoArco(ARCO_AGUA, k);
    const balanco = pegando.value > 0.5 ? 0.0016 : 0.0008 + Math.sin(t * 2.4) * 0.0006;
    const w = naPagina(c.x, c.y, 0.0042 + balanco);
    gota.position.copy(w); aura.position.copy(w);
  };

  return {
    grupo,
    mostrar() {
      grupo.visible = true; vivo = true; prog = 0;
      progresso.value = 0; assenta.value = 0; respingo.value = 0; convite.value = 1; pegando.value = 0;
      gota.visible = true; aura.visible = true; fita.visible = true;
      colocarGota(0);
    },
    definir(k, pega) {
      prog = Math.max(prog, k);
      progresso.value = prog;
      pegando.value = pega ? 1 : 0;
      convite.value = prog > 0 || pega ? 0.25 : 1;
    },
    async concluir(anima) {
      prog = 1; progresso.value = 1; pegando.value = 0; convite.value = 0;
      anel.visible = true; gotas.visible = true;
      // a gota afunda no fim do sulco enquanto o respingo abre
      void anima.animar({ de: 1, para: 0, duracao: 0.25, easing: easeOutCubic, aplicar: (k) => { gota.scale.set(k, 0.72 * k, k); aura.scale.setScalar(0.034 * (0.6 + 0.4 * k)); } });
      void anima.animar({ de: 0, para: 1, duracao: 0.75, easing: easeOutCubic, aplicar: (k) => { respingo.value = k; } });
      // a tinta azul assenta no quadrante e a fita é absorvida pelo papel
      void anima.animar({ de: 0, para: 1, duracao: 0.6, atraso: 0.2, easing: easeOutCubic, aplicar: (k) => { livro.brilho.agua.value = k; } });
      void anima.animar({ de: 0, para: 1, duracao: 1.3, atraso: 0.15, easing: easeInOutSine, aplicar: (k) => { livro.tinta.agua.value = k; assenta.value = k; } });
      await anima.esperar(1.5);
      await anima.animar({ de: 1, para: 0.35, duracao: 0.8, easing: easeInOutSine, aplicar: (k) => { livro.brilho.agua.value = k; } });
      gota.visible = false; aura.visible = false; anel.visible = false; gotas.visible = false; fita.visible = false;
      vivo = false;
    },
    async automatico(anima, aoProgresso) {
      pegando.value = 1; convite.value = 0.25;
      let anterior = prog;
      await anima.animar({
        de: prog, para: 1, duracao: 1.7 * (1 - prog) + 0.2, easing: easeInOutSine,
        aplicar: (k) => {
          prog = k; progresso.value = k;
          aoProgresso?.(k, Math.max(0, k - anterior) * 60);
          anterior = k;
        },
      });
      aoProgresso?.(1, 0);
    },
    posicaoGota: () => gota.position.clone(),
    atualizar(t) {
      if (!vivo || !grupo.visible) return;
      if (gota.visible) colocarGota(prog, t);
    },
    dispose() { for (const d of descartaveis) d.dispose(); grupo.removeFromParent(); },
  };
}

/** Ring radius over the splash time: fast out, then slow (0..0.9 of the plane). */
 
function easeAnel(k: any) {
  return float(1).sub(pow(float(1).sub(k), 3)).mul(0.9);
}
