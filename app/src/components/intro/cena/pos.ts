import { RenderPipeline, type Camera, type Scene, type WebGPURenderer } from 'three/webgpu';
import { float, hash, length, pass, screenCoordinate, screenUV, smoothstep, time, uniform, vec2, vec3, vec4 } from 'three/tsl';
import { bloom } from 'three/addons/tsl/display/BloomNode.js';

/**
 * The minimum post the brief allows: a soft bloom (only the crack light and the elements should
 * bloom), a gentle vignette that keeps the eye on the book, and a fine film grain that breaks
 * banding in the dark gradients. Tone mapping (AgX) and the sRGB conversion happen in the output.
 */

export interface Pos {
  render(): void;
  /** 0..1.5: bloom strength, animated by the ceremony (peaks at the Seal). */
  readonly bloomForca: { value: number };
  dispose(): void;
}

export function criarPos(renderer: WebGPURenderer, cena: Scene, camera: Camera, comBloom: boolean): Pos {
  const pipeline = new RenderPipeline(renderer);
  const cenaPass = pass(cena, camera);
  const cor = cenaPass.getTextureNode('output');
  const bloomForca = uniform(0.55);
   
  let saida: any = cor;
  let bloomNode: ReturnType<typeof bloom> | null = null;
  if (comBloom) {
    // limiar alto: só a fresta, os filetes e os elementos florescem; o papel claro não
    bloomNode = bloom(cor, 0.55, 0.42, 0.88);
    bloomNode.strength.value = 0.55;
    saida = cor.add(bloomNode.mul(bloomForca.div(0.55)));
  }
  const centro = screenUV.sub(0.5).mul(vec2(1.0, 1.25));
  const vinheta = smoothstep(0.95, 0.35, length(centro)).mul(0.28).add(0.72);
  // grão por pixel inteiro (um hash de combinação linear de UV vira faixas diagonais); muda 24×/s
  const px = screenCoordinate.xy.floor();
  const quadro = time.mul(24).floor().mod(64);
  const grao = hash(px.x.add(px.y.mul(4099)).add(quadro.mul(7919))).sub(0.5).mul(0.022);
  pipeline.outputNode = vec4(saida.rgb.mul(vinheta).add(vec3(grao)).max(float(0)), 1);
  return {
    bloomForca,
    render() { pipeline.render(); },
    dispose() { bloomNode?.dispose(); cenaPass.dispose(); pipeline.dispose(); },
  };
}
