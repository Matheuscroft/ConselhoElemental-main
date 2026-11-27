import {
  Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene, SRGBColorSpace, ACESFilmicToneMapping,
  Vector2, WebGLRenderer, type Texture,
} from 'three';

/**
 * One WebGL context for every glass key of the page. Each key owns a 2D canvas; a frame of a key is rendered here, in a
 * corner of this shared (never attached) canvas, and copied over. A page with eight keys costs one context, not eight.
 */
export interface Compartilhado {
  readonly renderizador: WebGLRenderer;
  readonly ambiente: Texture;
  /** Makes sure the shared canvas can hold a key of this size (in device pixels). */
  garantir(largura: number, altura: number): void;
}

let unico: Compartilhado | null | undefined;
const medida = new Vector2();

/** A room of dark walls and a few soft panels in colour: what the glass reflects and bends (violet, cyan, rose, warm). */
function construirAmbiente(renderizador: WebGLRenderer): Texture {
  const cena = new Scene();
  cena.background = new Color(0x05060c);
  const painel = (cor: number, forca: number, w: number, h: number, x: number, y: number, z: number) => {
    const material = new MeshBasicMaterial({ color: new Color(cor).multiplyScalar(forca), side: DoubleSide });
    const malha = new Mesh(new PlaneGeometry(w, h), material);
    malha.position.set(x, y, z);
    malha.lookAt(0, 0, 0);
    cena.add(malha);
  };
  painel(0xb9a9ff, 2.4, 10, 3, -6, 7, 5);        // big white softbox, upper left
  painel(0x6a4dff, 6, 4, 10, 9, 1, 2);          // violet panel on the right: the rim light of the reference
  painel(0x3fd0ff, 4.5, 10, 3, 0, -8, 3);       // cyan panel below
  painel(0xff4fa8, 3, 4, 8, -9, -1, 1);      // rose panel on the left
  painel(0xff7a3a, 2, 2.5, 2.5, -4, -6, -3);   // a small warm panel behind
  painel(0x8a6bff, 2.5, 12, 0.6, 0, 9, 0);       // a thin white strip above
  const gerador = new PMREMGenerator(renderizador);
  const textura = gerador.fromScene(cena, 0.02).texture;
  gerador.dispose();
  return textura;
}

export function obterCompartilhado(): Compartilhado | null {
  if (unico !== undefined) return unico;
  try {
    const canvas = document.createElement('canvas');
    const renderizador = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    renderizador.setClearColor(0x000000, 0);
    renderizador.outputColorSpace = SRGBColorSpace;
    renderizador.toneMapping = ACESFilmicToneMapping;
    renderizador.toneMappingExposure = 1.05;
    renderizador.setPixelRatio(1);
    renderizador.setSize(16, 16, false);
    const ambiente = construirAmbiente(renderizador);
    unico = {
      renderizador, ambiente,
      garantir(largura, altura) {
        const atual = renderizador.getSize(medida);
        if (largura > atual.x || altura > atual.y) renderizador.setSize(Math.max(largura, atual.x), Math.max(altura, atual.y), false);
      },
    };
  } catch {
    unico = null;
  }
  return unico;
}
