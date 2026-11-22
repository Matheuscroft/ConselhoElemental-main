import {
  AdditiveBlending, DoubleSide, Group, Mesh, MeshBasicNodeMaterial, RingGeometry, Sprite, SpriteNodeMaterial, Vector3, type Object3D,
} from 'three/webgpu';
import { color, float, length, pow, smoothstep, uniform, uv } from 'three/tsl';
import { ORDEM_CERIMONIA } from '@/lib/intro/cerimonia';
import { COR } from './paleta';
import { naPagina, type Livro } from './livro';
import { easeInOutCubic, easeInOutSine, easeOutCubic, type Animador } from './anima';

/**
 * The Council, the payoff of the four gestures: the quadrants flare together, a gold ring lifts off the page
 * Seal and opens, then the light travels from the Seal down to the clasp, whose four cavities light in the
 * ceremony's order. Timings match the `selo.completo` cue (cavities at 1.4 s + 0.22 s each).
 */

export const TEMPOS_CONSELHO = { anel: 0, viagem: 0.75, cavidades: 1.4, passo: 0.22, fim: 2.9 } as const;

export interface Conselho {
  readonly grupo: Object3D;
  /** Run the whole payoff; `cabeca` is the clasp head's position in book root space. */
  executar(anima: Animador, cabeca: Vector3): Promise<void>;
  dispose(): void;
}

export function criarConselho(livro: Livro): Conselho {
  const grupo = new Group(); grupo.name = 'Conselho';
  livro.raiz.add(grupo);
  const descartaveis: { dispose(): void }[] = [];

  /* ---------- anel de ouro que sobe do Selo da página ---------- */
  const anelK = uniform(0);
  const anelGeo = new RingGeometry(0.068, 0.0745, 96, 1);
  const anelMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide });
  anelMat.colorNode = color(COR.ouro).mul(float(1.6)).mul(float(1).sub(anelK));
  const anel = new Mesh(anelGeo, anelMat);
  anel.rotation.x = -Math.PI / 2; anel.visible = false; anel.renderOrder = 7;
  const centroSelo = naPagina(0, 0, 0.001);
  anel.position.copy(centroSelo);
  grupo.add(anel);
  descartaveis.push(anelGeo, anelMat);

  /* ---------- a luz que viaja do Selo ao fecho ---------- */
  const luzK = uniform(0);
  const luzMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending });
  const r = length(uv().sub(0.5)).mul(2);
  luzMat.colorNode = color(COR.contraluz).mul(pow(float(1).sub(r.min(1)), 2.6)).mul(smoothstep(0.0, 0.15, luzK).mul(smoothstep(1.0, 0.85, luzK)).mul(2.2));
  const luz = new Sprite(luzMat); luz.scale.setScalar(0.045); luz.visible = false; luz.renderOrder = 8;
  grupo.add(luz);
  descartaveis.push(luzMat);

  return {
    grupo,
    async executar(anima, cabeca) {
      // 1. os quatro quadrantes acendem juntos, o anel de ouro sobe e se abre
      for (const el of ORDEM_CERIMONIA) void anima.animar({ de: livro.brilho[el].value, para: 1, duracao: 0.5, easing: easeOutCubic, aplicar: (k) => { livro.brilho[el].value = k; } });
      anel.visible = true;
      void anima.animar({
        de: 0, para: 1, duracao: 1.1, easing: easeOutCubic,
        aplicar: (k) => { anelK.value = k; anel.position.set(centroSelo.x, centroSelo.y + 0.03 * k, centroSelo.z); anel.scale.setScalar(1 + 0.45 * k); },
      });
      await anima.esperar(TEMPOS_CONSELHO.viagem);
      // 2. a luz desce do Selo ao fecho num arco
      luz.visible = true;
      const de = centroSelo.clone().add(new Vector3(0, 0.012, 0));
      const meio = de.clone().lerp(cabeca, 0.5).add(new Vector3(0, 0.05, 0));
      const b = new Vector3();
      await anima.animar({
        de: 0, para: 1, duracao: TEMPOS_CONSELHO.cavidades - TEMPOS_CONSELHO.viagem, easing: easeInOutSine,
        aplicar: (k) => {
          luzK.value = k;
          const u = 1 - k;
          b.set(0, 0, 0).addScaledVector(de, u * u).addScaledVector(meio, 2 * u * k).addScaledVector(cabeca, k * k);
          luz.position.copy(b);
        },
      });
      luz.visible = false; anel.visible = false;
      // 3. as cavidades do fecho acendem na ordem da cerimônia; os quadrantes voltam ao repouso
      ORDEM_CERIMONIA.forEach((el, i) => {
        void anima.animar({ de: 0, para: 1, duracao: 0.5, atraso: i * TEMPOS_CONSELHO.passo, easing: easeOutCubic, aplicar: (k) => { livro.fecho[el].value = k; } });
        void anima.animar({ de: 1, para: 0.35, duracao: 0.9, atraso: 0.2 + i * TEMPOS_CONSELHO.passo, easing: easeInOutCubic, aplicar: (k) => { livro.brilho[el].value = k; } });
      });
      await anima.esperar(TEMPOS_CONSELHO.fim - TEMPOS_CONSELHO.cavidades);
    },
    dispose() { for (const d of descartaveis) d.dispose(); grupo.removeFromParent(); },
  };
}
