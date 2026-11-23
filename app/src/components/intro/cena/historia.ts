import {
  AdditiveBlending, Group, Mesh, MeshBasicNodeMaterial, PlaneGeometry, Sprite, SpriteNodeMaterial,
} from 'three/webgpu';
import {
  color, cos, float, fract, hash, instanceIndex, length, mix, positionGeometry, pow, screenUV, sin, smoothstep, uniform, uv, vec2, vec3, vec4,
} from 'three/tsl';
import { COR } from './paleta';

/**
 * "Entrar na história": the closing transition's own light, kept to two draw calls.
 * - A full-screen additive quad (clip space): the crack's warm light, opening from the centre of the Seal and
 *   washing the page until the screen is light.
 * - A handful of instanced light motes in camera space that rush past the lens (the sense of speed). Their
 *   motion is analytic in the vertex stage (one time uniform), so the CPU does nothing per mote.
 * Both live on a group attached to the camera; the scene drives the uniforms and the camera dolly.
 */
export interface Historia {
  readonly grupo: Group;
  /** 0..1: the light's reach and strength. */
  readonly clarao: { value: number };
  /** 0..1: how many motes show and how fast they rush. */
  readonly velocidade: { value: number };
  /** Screen aspect (w/h), so the light opens as a circle. */
  readonly aspecto: { value: number };
  atualizar(dt: number): void;
  dispose(): void;
}

const N_MOTAS = 56;

export function criarHistoria(nMotas = N_MOTAS): Historia {
  const grupo = new Group(); grupo.name = 'Historia'; grupo.visible = false;
  const clarao = uniform(0);
  const velocidade = uniform(0);
  const aspecto = uniform(0.46);
  const tempo = uniform(0);

  /* ---------- clarão: quad em espaço de recorte, aditivo, sem profundidade ---------- */
  const quadGeo = new PlaneGeometry(2, 2);
  const quadMat = new MeshBasicNodeMaterial({ transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending, fog: false });
  quadMat.vertexNode = vec4(positionGeometry.xy, 0, 1);
  const d = length(screenUV.sub(vec2(0.5, 0.5)).mul(vec2(aspecto, 1)));
  // o raio cresce com o clarão; no pico (1) passa das bordas e a tela inteira fica clara
  const raio = clarao.mul(clarao).mul(1.15).add(0.04);
  const disco = smoothstep(raio, raio.mul(0.15), d);
  const quente = mix(color(COR.poca), color(COR.contraluz), smoothstep(0.0, 0.7, clarao));
  quadMat.colorNode = quente.mul(disco.mul(clarao.mul(2.4)).add(pow(clarao, 3).mul(1.6)));
  const quad = new Mesh(quadGeo, quadMat);
  quad.frustumCulled = false; quad.renderOrder = 999;
  grupo.add(quad);

  /* ---------- motas de luz que passam pela lente ---------- */
  const motaMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: AdditiveBlending, fog: false });
  const i = float(instanceIndex);
  const ang = hash(i.add(1.3)).mul(Math.PI * 2);
  const rad = hash(i.add(7.1)).mul(0.24).add(0.035);
  const fase = fract(hash(i.add(3.7)).add(tempo.mul(hash(i.add(9.9)).mul(0.5).add(0.75))));
  const z = mix(float(-0.95), float(-0.04), fase.mul(fase));
  motaMat.positionNode = vec3(cos(ang).mul(rad), sin(ang).mul(rad), z);
  // alongadas na direção do centro para fora: rastro de velocidade
  motaMat.rotationNode = ang;
  motaMat.scaleNode = vec2(float(0.0035).add(velocidade.mul(0.012)).mul(fase.mul(0.8).add(0.2)), float(0.0012));
  const rm = length(uv().sub(0.5)).mul(2);
  const vis = smoothstep(0.0, 0.15, fase).mul(smoothstep(1.0, 0.8, fase)).mul(hash(i.add(5.5)).lessThan(velocidade.mul(1.1)).select(1, 0));
  motaMat.colorNode = mix(color(COR.poca), color('#fff4dc'), fase).mul(pow(float(1).sub(rm.min(1)), 2)).mul(vis.mul(velocidade).mul(2.2));
  const motas = new Sprite(motaMat);
  motas.count = nMotas; motas.frustumCulled = false; motas.renderOrder = 998;
  grupo.add(motas);

  return {
    grupo, clarao, velocidade, aspecto,
    atualizar(dt) {
      if (!grupo.visible) return;
      // as motas andam mais rápido quanto mais rápida a câmera
      tempo.value += dt * (0.25 + velocidade.value * 1.6);
    },
    dispose() { quadGeo.dispose(); quadMat.dispose(); motaMat.dispose(); grupo.removeFromParent(); },
  };
}
