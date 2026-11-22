import {
  AdditiveBlending, BackSide, Color, DirectionalLight, DoubleSide, Group, HemisphereLight, Mesh, MeshBasicNodeMaterial, Object3D,
  PlaneGeometry, PMREMGenerator, PointLight, Scene, SphereGeometry, Sprite, SpriteNodeMaterial, type WebGPURenderer, type Texture,
  BufferGeometry, Float32BufferAttribute,
} from 'three/webgpu';
import {
  abs, color, float, fract, hash, instanceIndex, length, mix, normalize, positionLocal, pow, sin, smoothstep, time, uniform, uv,
  vec3, mx_noise_float, vec2, max,
} from 'three/tsl';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { COR } from './paleta';

/**
 * Light of the grimoire. One warm source only: the crack of the book (the "fresta"). Everything else
 * is cool dusk: a lavender backlight that rims the silhouettes, a low lilac fill, the Moon.
 * No real-time shadow maps (they cost too much on a phone): a soft contact shadow sits under the
 * book, and the rays are additive cards, the same cheap trick the previs used.
 */

export interface Luz {
  readonly grupo: Group;
  /** Warm crack light, 0..1.2 (pôster ≈ 0.6, aberta ≈ 1, gestos ≈ 0.8, fecho ≈ 0.4). */
  readonly fresta: { value: number };
  /** Ray cards' strength. */
  readonly raios: { value: number };
  /** Where the crack light lives (follows the spine when closed, the gutter when open). */
  readonly origemRaios: Object3D;
  readonly ambiente: Texture;
  /** Called every frame with the opening (0 closed → 1 open) to move the warm light. */
  atualizar(abertura: number): void;
  dispose(): void;
}

export function criarLuz(renderer: WebGPURenderer, raizLivro: Object3D, poeiraN: number): Luz {
  const grupo = new Group(); grupo.name = 'Luz';
  const descartaveis: { dispose(): void }[] = [];
  const fresta = uniform(0.6);
  const raios = uniform(1);
  // com o livro aberto o papel claro reflete muito mais que o couro: raios e halo baixam junto
  const atenuaAberto = uniform(1);

  // ---------- rig ----------
  // céu índigo escuro em cima, chão de pedra morna embaixo: o ambiente só segura as sombras
  const hemi = new HemisphereLight(new Color('#2a2450'), new Color('#1c130d'), 0.8);
  // contraluz fria por trás e à direita: recorta a silhueta do livro e a borda do plinto
  const contraluz = new DirectionalLight(new Color(COR.contraluzFria), 1.8);
  contraluz.position.set(1.2, 1.2, -1.8);
  const lua = new DirectionalLight(new Color(COR.lua), 0.15);
  lua.position.set(2.5, 1.2, -1.5);
  const preenchimento = new DirectionalLight(new Color(COR.nevoa), 0.12);
  preenchimento.position.set(-1.2, 0.6, 1.2);
  // a fresta vista de fora: a luz que escapa por trás do livro doura as arestas e o fundo do plinto
  const chaveQuente = new DirectionalLight(new Color(COR.poca), 1.6);
  chaveQuente.position.set(-0.9, 1.5, -1.4);
  // a fresta por dentro: escapa pelas bordas das folhas e acende a pedra em volta (sem sombra: é barata)
  const quente = new PointLight(new Color(COR.poca), 0.1, 0.7, 2);
  const poca = new PointLight(new Color(COR.poca), 0.05, 0.5, 2);
  poca.position.set(0.0, 0.05, 0.2);
  grupo.add(hemi, contraluz, lua, preenchimento, chaveQuente);
  raizLivro.add(quente, poca);

  // ---------- ambiente para os metais (gerado uma vez) ----------
  const envScene = new Scene();
  const envGeo = new SphereGeometry(10, 32, 16);
  const envMat = new MeshBasicNodeMaterial({ side: BackSide });
  const d = normalize(positionLocal);
  const base = mix(color('#24170c'), color('#2a2450'), smoothstep(-0.25, 0.6, d.y));
  // os metais refletem a fresta (quente, atrás e acima) e a contraluz (fria, atrás à direita)
  const manchaQuente = pow(max(d.dot(normalize(vec3(-0.3, 0.55, -0.8))), 0), 4).mul(2.0);
  const manchaFria = pow(max(d.dot(normalize(vec3(0.6, 0.5, -0.6))), 0), 8).mul(0.9);
  envMat.colorNode = base.add(color(COR.poca).mul(manchaQuente)).add(color(COR.contraluzFria).mul(manchaFria));
  envScene.add(new Mesh(envGeo, envMat));
  const pmrem = new PMREMGenerator(renderer);
  const alvo = pmrem.fromScene(envScene, 0.02);
  pmrem.dispose(); envGeo.dispose(); envMat.dispose();
  const ambiente = alvo.texture;
  descartaveis.push(alvo);

  // ---------- sombra de contato (radial, macia) ----------
  const sombraGeo = new PlaneGeometry(0.5, 0.42);
  const sombraMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false });
  const q = uv().sub(0.5).mul(vec2(2.0, 2.0));
  sombraMat.colorNode = color('#07050a');
  sombraMat.opacityNode = smoothstep(1.0, 0.25, length(q)).mul(0.55);
  const sombra = new Mesh(sombraGeo, sombraMat);
  sombra.rotation.x = -Math.PI / 2;
  sombra.position.set(0.11, 0.0006, 0);
  raizLivro.add(sombra);
  descartaveis.push(sombraGeo, sombraMat);

  // ---------- raios: leque de cartões aditivos a partir da fresta ----------
  const origemRaios = new Group(); origemRaios.name = 'OrigemRaios';
  raizLivro.add(origemRaios);
  const cartao = new BufferGeometry();
  cartao.setAttribute('position', new Float32BufferAttribute([-0.06, 0, 0, 0.06, 0, 0, 1, 1, 0, -1, 1, 0], 3));
  cartao.setAttribute('uv', new Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  cartao.setIndex([0, 1, 2, 0, 2, 3]);
  const raioMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide, fog: false });
  const u = uv().x, v = uv().y;
  const lateral = float(1).sub(abs(u.mul(2).sub(1)));
  const comprimento = pow(float(1).sub(v), 1.8);
  const tremula = mx_noise_float(vec2(u.mul(1.2).add(time.mul(0.08)), v.mul(1.5).sub(time.mul(0.04)))).mul(0.3).add(0.8);
  const nasce = smoothstep(0.0, 0.06, v);
  raioMat.colorNode = mix(color(COR.poca), color(COR.ouro), v).mul(pow(lateral, 2.5).mul(comprimento).mul(nasce).mul(tremula).mul(0.2).mul(raios).mul(fresta).mul(atenuaAberto));
  // leque nascendo atrás do livro: o próprio livro esconde o ponto de convergência
  const leque = [-42, -30, -19, -9, 1, 11, 22, 34];
  // os 8 cartões viram uma geometria só (1 chamada): cada cópia leva a sua transformação
  const pecas = leque.map((ang, i) => {
    const o = new Object3D();
    const L = 0.9 + ((i * 37) % 10) / 14;
    o.scale.set(0.16 + ((i * 13) % 7) / 30, L, 1);
    o.rotation.set(0, 0, (ang * Math.PI) / 180);
    o.rotateX(((i % 3) - 1) * 0.2);
    o.updateMatrix();
    return cartao.clone().applyMatrix4(o.matrix);
  });
  const lequeGeo = mergeGeometries(pecas);
  for (const g of pecas) g.dispose();
  const feixes = new Mesh(lequeGeo ?? cartao, raioMat);
  feixes.renderOrder = 5;
  feixes.frustumCulled = false;
  origemRaios.add(feixes);
  if (lequeGeo) descartaveis.push(lequeGeo);
  descartaveis.push(cartao, raioMat);
  // halo da fonte: o brilho quente atrás da cabeceira de onde os raios parecem sair
  const haloGeo = new PlaneGeometry(1, 1);
  const haloMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false });
  const rh = length(uv().sub(0.5)).mul(2);
  haloMat.colorNode = mix(color(COR.contraluz), color(COR.poca), smoothstep(0.0, 0.5, rh)).mul(pow(float(1).sub(rh.min(1)), 3).mul(0.55).mul(fresta).mul(raios).mul(atenuaAberto));
  const halo = new Mesh(haloGeo, haloMat);
  halo.scale.setScalar(0.5);
  halo.renderOrder = 4;
  halo.onBeforeRender = (_r, _s, cam) => { halo.quaternion.copy(cam.quaternion); };
  origemRaios.add(halo);
  descartaveis.push(haloGeo, haloMat);

  // ---------- poeira de luz em três distâncias (sprites instanciados, movimento analítico) ----------
  if (poeiraN > 0) {
    const poeiraMat = new SpriteNodeMaterial({ transparent: true, depthWrite: false, blending: AdditiveBlending, fog: false });
    const i = float(instanceIndex);
    const s1 = hash(i), s2 = hash(i.add(17.31)), s3 = hash(i.add(41.7)), s4 = hash(i.add(73.1));
    const subida = fract(time.mul(float(0.012).add(s2.mul(0.02))).add(s3));
    // a poeira vive dentro da luz: nasce no livro, sobe pelo leque de raios (atrás e para a lombada)
    const camada = s4.mul(3).floor(); // 0 perto do livro, 1 meio, 2 alto e espalhado
    const espalha = float(0.22).add(camada.mul(0.12));
    const pos = vec3(
      s1.sub(0.5).mul(espalha).add(0.09).sub(subida.mul(0.12)).add(sin(time.mul(0.25).add(s1.mul(6.28))).mul(0.01)),
      subida.mul(0.5).add(0.03),
      s2.sub(0.5).mul(espalha.mul(0.8)).sub(0.06).sub(subida.mul(0.12)),
    );
    poeiraMat.positionNode = pos;
    poeiraMat.scaleNode = float(0.001).add(s3.mul(0.0016)).mul(float(1).add(camada.mul(0.3)));
    const brilho = smoothstep(0.0, 0.12, subida).mul(smoothstep(1.0, 0.5, subida)).mul(sin(time.mul(2.0).add(s1.mul(40))).mul(0.3).add(0.7));
    const disco = smoothstep(0.5, 0.0, length(uv().sub(0.5)));
    poeiraMat.colorNode = mix(color(COR.poca), color(COR.ouro), s4).mul(brilho).mul(disco).mul(float(1.0).add(fresta.mul(2.0)));
    poeiraMat.opacityNode = disco.mul(brilho);
    const poeira = new Sprite(poeiraMat);
    poeira.count = poeiraN;
    poeira.frustumCulled = false;
    poeira.renderOrder = 6;
    raizLivro.add(poeira);
    descartaveis.push(poeiraMat);
  }

  return {
    grupo, fresta, raios, origemRaios, ambiente,
    atualizar(abertura) {
      // fechado: a luz vaza pela lombada (x≈0, alto); aberto: nasce na dobra e sobe
      // fechado: no meio do bloco de folhas (a pedra em volta acende); aberto: sobe da dobra
      // aberto, o papel (albedo ≈ 0,75) reflete ~20× o couro: a luz faz o papel de exposição e baixa
      const fechado = 1 - abertura;
      quente.position.set(0.11 * fechado, 0.026 + abertura * 0.09, -0.02 * abertura);
      // luz física: difuso = irradiância × albedo / π; com couro de albedo baixo, a fresta precisa ser forte
      quente.intensity = (0.25 + fresta.value * 0.9) * fechado * fechado; // aberto, a luz da dobra é emissiva (sem mancha redonda)
      // a poça só existe com o livro aberto (luz caindo da dobra para a pedra da frente)
      poca.intensity = abertura * (0.03 + fresta.value * 0.08);
      chaveQuente.intensity = (1.2 + fresta.value * 6.0) * (1 - 0.82 * abertura);
      atenuaAberto.value = 1 - 0.55 * abertura;
      // fechado: o leque nasce atrás do livro, inclinado para a lombada; aberto: nasce atrás da cabeceira e sobe
      origemRaios.position.set(0.03 * fechado, 0.03 - 0.02 * abertura, -0.13 - 0.03 * abertura);
      origemRaios.rotation.set(-0.35 * fechado - 0.3 * abertura, 0, 0.3 * fechado);
    },
    dispose() { for (const x of descartaveis) x.dispose(); },
  };
}
