import {
  HalfFloatType, LinearFilter, Mesh, MeshBasicNodeMaterial, NoBlending, OrthographicCamera, PlaneGeometry, RenderTarget,
  RepeatWrapping, ClampToEdgeWrapping, Scene, UnsignedByteType, type Texture, type WebGPURenderer,
} from 'three/webgpu';

/**
 * Bakes a procedural look into a texture, once, at the opening.
 *
 * The sky dome, the three ridges and the mist were fractal noise evaluated per pixel on every frame
 * (about twenty noise lookups per covered pixel, with a lot of overdraw): fine on a desktop GPU, but it
 * kept a phone at ~25 fps. None of it moves meaningfully during the ceremony, so it is drawn once into
 * a render target and then only sampled.
 *
 * `cor` and `alfa` are TSL nodes of the quad's own `uv()`. The target is not tone mapped or colour
 * converted (three only does that on the screen), so the stored values are the working-space values the
 * live material would have produced.
 */
export interface OpcoesAssar {
  readonly largura: number;
  readonly altura: number;
  /** 8-bit is enough for masks and soft clouds; half float for dark colours that would band. */
  readonly precisao: 'meia' | 'oito';
  /** Wrap horizontally (the sphere's longitude). */
  readonly repetirU?: boolean;
}

type NoCor = NonNullable<MeshBasicNodeMaterial['colorNode']>;
type NoAlfa = NonNullable<MeshBasicNodeMaterial['opacityNode']>;

export function assar(renderer: WebGPURenderer, cor: NoCor, alfa: NoAlfa, o: OpcoesAssar): { textura: Texture; dispose(): void } {
  const alvo = new RenderTarget(o.largura, o.altura, {
    type: o.precisao === 'meia' ? HalfFloatType : UnsignedByteType,
    depthBuffer: false,
    generateMipmaps: false,
    minFilter: LinearFilter,
    magFilter: LinearFilter,
  });
  alvo.texture.wrapS = o.repetirU ? RepeatWrapping : ClampToEdgeWrapping;
  alvo.texture.wrapT = ClampToEdgeWrapping;

  const geo = new PlaneGeometry(2, 2);
  const mat = new MeshBasicNodeMaterial({ transparent: true, blending: NoBlending, depthTest: false, depthWrite: false, fog: false, toneMapped: false });
  mat.colorNode = cor;
  mat.opacityNode = alfa;
  const cena = new Scene();
  cena.add(new Mesh(geo, mat));
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const antes = renderer.getRenderTarget();
  renderer.setRenderTarget(alvo);
  renderer.render(cena, camera);
  renderer.setRenderTarget(antes);

  geo.dispose(); mat.dispose();
  return { textura: alvo.texture, dispose() { alvo.dispose(); } };
}
