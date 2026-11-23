import { AdditiveBlending, Sprite, SpriteNodeMaterial } from 'three/webgpu';
import { color, float, length, pow, uniform, uv } from 'three/tsl';
import { COR } from './paleta';
import { alturaDaFolha, SELO_NA_PAGINA, type Livro } from './livro';

/**
 * Contact light: the instant a finger lands on the page, a small warm glow blooms under it, before any gesture
 * logic runs, so the page answers on the very next frame. One sprite, no allocation per frame.
 */
export interface Toque {
  /** Light the glow at a page point (page-local metres, origin at the Seal). */
  tocar(x: number, y: number): void;
  /** Follow the finger while it moves (no new flare). */
  seguir(x: number, y: number): void;
  atualizar(dt: number): void;
  dispose(): void;
}

export function criarToque(livro: Livro): Toque {
  const k = uniform(0);
  const mat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false });
  const r = length(uv().sub(0.5)).mul(2);
  mat.colorNode = color(COR.contraluz).mul(pow(float(1).sub(r.min(1)), 2.4)).mul(k.mul(1.3));
  const s = new Sprite(mat);
  s.visible = false; s.renderOrder = 9; s.frustumCulled = false; s.scale.setScalar(0.014);
  livro.raiz.add(s);
  let vida = 0;
  let segurando = false;
  // o mesmo que naPagina(), sem alocar: o dedo move isto a cada quadro
  const colocar = (x: number, y: number) => {
    const X = SELO_NA_PAGINA.x + x;
    s.position.set(X, SELO_NA_PAGINA.y + alturaDaFolha(X, 1) + 0.002, SELO_NA_PAGINA.z - y);
  };
  return {
    tocar(x, y) { colocar(x, y); vida = 1; segurando = true; s.visible = true; k.value = 1; s.scale.setScalar(0.012); },
    seguir(x, y) { if (s.visible) colocar(x, y); },
    atualizar(dt) {
      if (!s.visible) return;
      // brilho pleno no contato; depois apaga em ~0,45 s e se abre um pouco (a resposta, não um enfeite)
      vida -= dt / (segurando ? 0.9 : 0.45);
      if (vida <= 0) { s.visible = false; k.value = 0; segurando = false; return; }
      k.value = vida * vida;
      s.scale.setScalar(0.012 + (1 - vida) * 0.016);
      if (vida < 0.5) segurando = false;
    },
    dispose() { s.removeFromParent(); mat.dispose(); },
  };
}
