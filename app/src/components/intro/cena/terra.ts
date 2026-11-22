import {
  AdditiveBlending, DodecahedronGeometry, Group, Mesh, MeshStandardNodeMaterial, Sprite, SpriteNodeMaterial, Vector3, type Object3D,
} from 'three/webgpu';
import {
  clamp, color, dot, float, hash, instanceIndex, length, mix, normalView, positionLocal, positionViewDirection, pow, smoothstep,
  sin, time, uniform, uv, vec3, mx_noise_float, cos,
} from 'three/tsl';
import { ELEMENTO, COR } from './paleta';
import { naPagina, type Livro } from './livro';
import { easeInOutSine, easeOutBack, easeOutCubic, type Animador } from './anima';

/**
 * Earth, the second gesture: a faceted stone sits in the Earth quadrant. Holding it raises it, the
 * fragments around it climb with it, dust lifts and the ground trembles; letting go early lets them sink
 * back. When the hold completes they drop with a thud and sink into the paper as the green ink settles.
 */

export interface GestoTerra {
  readonly grupo: Object3D;
  mostrar(): void;
  /** Hold progress (0..1) and whether the finger is on the stone. */
  definir(progresso: number, segurando: boolean): void;
  concluir(anima: Animador): Promise<void>;
  posicaoPedra(): Vector3;
  /** Page-local centre of the stone (metres from the Seal's centre), for the hit test. */
  readonly centro: { readonly x: number; readonly y: number };
  atualizar(t: number): void;
  dispose(): void;
}

/** Centre of the Earth quadrant on the page (upper right of the Seal). */
const CENTRO = { x: 0.031, y: 0.031 };
const FRAGMENTOS = [
  { x: -0.016, y: 0.006, r: 0.0042, h: 0.010, giro: 1.3 },
  { x: 0.014, y: -0.012, r: 0.0036, h: 0.013, giro: -1.7 },
  { x: 0.012, y: 0.015, r: 0.0030, h: 0.016, giro: 2.1 },
  { x: -0.008, y: -0.017, r: 0.0026, h: 0.009, giro: -1.1 },
  { x: 0.020, y: 0.002, r: 0.0022, h: 0.018, giro: 1.9 },
];

export function criarTerra(livro: Livro): GestoTerra {
  const p = ELEMENTO.terra;
  const grupo = new Group(); grupo.name = 'Terra'; grupo.visible = false;
  livro.raiz.add(grupo);
  const descartaveis: { dispose(): void }[] = [];
  const segura = uniform(0);
  const sobe = uniform(0);
  const poeiraT = uniform(0);

  /* ---------- pedra: facetada, cinza-musgo, com veios que acendem verdes quando segurada ---------- */
  const mat = new MeshStandardNodeMaterial({ flatShading: true, roughness: 0.86, metalness: 0 });
  const veio = smoothstep(0.62, 0.82, mx_noise_float(positionLocal.mul(260)).mul(0.5).add(0.5));
  mat.colorNode = mix(color(COR.pedra), color(p.base), 0.45).mul(mx_noise_float(positionLocal.mul(90)).mul(0.18).add(0.92));
  const borda = pow(float(1).sub(clamp(dot(normalView, positionViewDirection), 0, 1)), 2.2);
  mat.emissiveNode = color(p.aura).mul(veio.mul(0.9).add(borda.mul(0.35))).mul(segura.mul(0.7).add(sobe.mul(0.5)));
  descartaveis.push(mat);

  const geoGrande = new DodecahedronGeometry(0.0085, 0);
  const pedra = new Mesh(geoGrande, mat);
  pedra.scale.set(1.15, 0.8, 1); pedra.rotation.set(0.3, 0.6, 0.15);
  grupo.add(pedra);
  descartaveis.push(geoGrande);
  const base = naPagina(CENTRO.x, CENTRO.y, 0.004);

  const geoFrag = new DodecahedronGeometry(1, 0);
  descartaveis.push(geoFrag);
  const frags = FRAGMENTOS.map((f, i) => {
    const m = new Mesh(geoFrag, mat);
    m.scale.set(f.r * 1.2, f.r * 0.85, f.r);
    m.rotation.set(i * 0.7, i * 1.3, i * 0.4);
    grupo.add(m);
    return { m, f, base: naPagina(CENTRO.x + f.x, CENTRO.y + f.y, f.r * 0.6) };
  });

  /* ---------- poeira: sobe do pé das pedras com o esforço, e estoura no baque ---------- */
  const poeiraMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const i = float(instanceIndex);
  const a = hash(i).mul(Math.PI * 2), d = hash(i.add(3.3)).mul(0.022).add(0.004), vs = hash(i.add(9.1));
  const fase = time.mul(vs.mul(0.4).add(0.25)).add(hash(i.add(5.5))).fract();
  poeiraMat.positionNode = vec3(cos(a).mul(d).mul(float(1).add(poeiraT)), fase.mul(0.02).mul(sobe.add(poeiraT.mul(2))), sin(a).mul(d).mul(float(1).add(poeiraT)));
  poeiraMat.scaleNode = float(0.0026).mul(vs.mul(0.6).add(0.6));
  const disco = smoothstep(0.5, 0.0, length(uv().sub(0.5)));
  poeiraMat.colorNode = mix(color('#c8b89a'), color(p.acento), 0.3).mul(disco).mul(float(1).sub(fase)).mul(sobe.mul(0.35).add(poeiraT.mul(0.9)));
  const poeira = new Sprite(poeiraMat); poeira.count = 40; poeira.frustumCulled = false; poeira.renderOrder = 6;
  poeira.position.copy(naPagina(CENTRO.x, CENTRO.y, 0.001));
  grupo.add(poeira);
  descartaveis.push(poeiraMat);

  let prog = 0, t0 = 0, afundar = 0;
  const colocar = (t: number) => {
    const k = prog;
    const treme = segura.value > 0.5 ? Math.sin(t * 41) * 0.0004 * k : 0;
    pedra.position.set(base.x + treme, base.y + k * 0.014 - afundar * 0.012, base.z);
    pedra.rotation.y = 0.6 + k * 0.5;
    const esc = 1 - afundar;
    pedra.scale.set(1.15 * esc, 0.8 * esc, esc);
    for (const { m, f, base: b } of frags) {
      const atraso = Math.max(0, Math.min(1, k * 1.35 - 0.15));
      m.position.set(b.x + f.x * 0.25 * atraso, b.y + f.h * atraso - afundar * 0.01, b.z - f.y * 0.25 * atraso);
      m.rotation.y = t0 + f.giro * atraso;
      m.scale.set(f.r * 1.2 * esc, f.r * 0.85 * esc, f.r * esc);
    }
  };

  return {
    grupo,
    centro: CENTRO,
    mostrar() {
      grupo.visible = true; prog = 0; afundar = 0; sobe.value = 0; segura.value = 0; poeiraT.value = 0; colocar(0);
    },
    definir(k, seg) { prog = k; sobe.value = k; segura.value = seg ? 1 : 0; },
    async concluir(anima) {
      segura.value = 0;
      // as pedras caem com o baque (ultrapassam e assentam), a poeira estoura
      const alto = prog;
      void anima.animar({ de: 0, para: 1, duracao: 0.7, easing: easeOutCubic, aplicar: (k) => { poeiraT.value = Math.sin(k * Math.PI); } });
      await anima.animar({ de: alto, para: 0.15, duracao: 0.22, easing: (x) => x * x, aplicar: (k) => { prog = k; } });
      await anima.animar({ de: 0.15, para: 0.3, duracao: 0.28, easing: easeOutBack(1.6), aplicar: (k) => { prog = k; } });
      // a tinta verde assenta e as pedras afundam no papel
      void anima.animar({ de: 0, para: 1, duracao: 0.6, easing: easeOutCubic, aplicar: (k) => { livro.brilho.terra.value = k; } });
      void anima.animar({ de: 0, para: 1, duracao: 1.3, atraso: 0.1, easing: easeInOutSine, aplicar: (k) => { livro.tinta.terra.value = k; } });
      await anima.animar({ de: 0, para: 1, duracao: 1.1, atraso: 0.2, easing: easeInOutSine, aplicar: (k) => { afundar = k; sobe.value = 0.3 * (1 - k); } });
      await anima.animar({ de: 1, para: 0.35, duracao: 0.8, easing: easeInOutSine, aplicar: (k) => { livro.brilho.terra.value = k; } });
      grupo.visible = false;
    },
    posicaoPedra: () => pedra.position.clone(),
    atualizar(t) { if (grupo.visible) { t0 = t * 0.1; colocar(t); } },
    dispose() { for (const d of descartaveis) d.dispose(); grupo.removeFromParent(); },
  };
}
