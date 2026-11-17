import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  DataTexture,
  Texture,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { ACENTO, type ElementoId } from '@/lib/design/palette';
import type { CriarCenaOrbes, OrbeEstado } from './orbes-tipos';
import {
  criarMedidor,
  escalaVisual,
  limitar,
  ordenarPorProfundidade,
  pixelRatioDasOrbes,
} from './orbes-medidor';
import {
  comElemento,
  ESFERA_FRAGMENT,
  HALO_FRAGMENT,
  ORBE_VERTEX,
  PARTICULA_FRAGMENT,
  PARTICULA_VERTEX,
} from './orbes-shaders';

/**
 * One transparent WebGL canvas that draws the Sanctuary's orbs: the artwork as
 * albedo under a fake-sphere shading (rim in the element's colour, soft
 * specular, a living surface), an additive halo behind each one and ~24
 * particles drifting around it. It owns no loop: the page calls `atualizar`.
 * Loaded with `import()`, so three never reaches the entry bundle.
 *
 * Tunables, in one place.
 */
export const AJUSTES = {
  /** Resting size of one orb's artwork, as a share of the canvas width. */
  fracaoDoTamanho: 0.26,
  particulasPorOrbe: 24,
  /** Fixed clock for the still frame used under reduced motion. */
  tempoEstatico: 7.3,
} as const;

/** Per element: shader code, a hotter colour for halo/particles/emission (the rim uses the palette accent). */
const ELEMENTO: Record<ElementoId, { codigo: number; brilho: readonly [number, number, number] }> = {
  fogo: { codigo: 1, brilho: [1.0, 0.45, 0.12] },
  agua: { codigo: 2, brilho: [0.25, 0.75, 1.0] },
  ar: { codigo: 3, brilho: [0.8, 0.92, 1.0] },
  terra: { codigo: 4, brilho: [0.95, 0.78, 0.35] },
};

const MAX_ORBES = 4;
const CAMPOS = 6;

function rgb(hex: string): Vector3 {
  const n = Number.parseInt(hex.replace('#', ''), 16) || 0xffffff;
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function temWebGL(): boolean {
  try {
    const sonda = document.createElement('canvas');
    const gl = (sonda.getContext('webgl2') || sonda.getContext('webgl')) as WebGLRenderingContext | null;
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

interface Orbe {
  readonly elemento: ElementoId;
  readonly centro: { value: Vector2 };
  readonly arte: { value: number };
  readonly prof: { value: number };
  readonly foco: { value: number };
  readonly carga: { value: number };
  readonly temTex: { value: number };
  readonly halo: Mesh;
  readonly esfera: Mesh;
  readonly pontos: Points;
}

export const criarCenaOrbes: CriarCenaOrbes = (canvas, opcoes) => {
  if (typeof document === 'undefined' || !temWebGL()) return null;
  const elementos = opcoes.elementos.slice(0, MAX_ORBES);
  if (elementos.length === 0) return null;

  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = true;

  const reduzido = opcoes.reduzido;
  let vivo = true;
  let degradado = false;
  let sujo = true;

  const degradar = () => {
    if (degradado) return;
    degradado = true;
    opcoes.aoDegradar?.();
  };
  const aoPerder = (evento: Event) => {
    evento.preventDefault();
    degradar();
  };
  canvas.addEventListener('webglcontextlost', aoPerder);

  const cena = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // Uniforms shared by every material.
  const tela = { value: new Vector2(390, 390) };
  const tempo = { value: 0 as number };
  tempo.value = AJUSTES.tempoEstatico;
  const esc = { value: 1 };
  const nevoa = { value: new Vector3(0.42, 0.5, 0.62) };

  const geoQuad = new PlaneGeometry(1, 1);
  const geometrias: BufferGeometry[] = [geoQuad];
  const materiais: ShaderMaterial[] = [];
  const texturas: Texture[] = [];
  const orbes: Orbe[] = [];

  const mistura = { transparent: true, depthTest: false, depthWrite: false, premultipliedAlpha: true } as const;
  const textura0 = new DataTexture(new Uint8Array(4), 1, 1);
  textura0.needsUpdate = true;

  elementos.forEach((elemento) => {
    const { codigo, brilho } = ELEMENTO[elemento];
    const centro = { value: new Vector2(0, 0) };
    const arte = { value: 100 };
    const prof = { value: 0 };
    const foco = { value: 0 };
    const carga = { value: 0 };
    const temTex = { value: 0 };
    const cor = { value: rgb(ACENTO[elemento]) };
    const brilhoU = { value: new Vector3(brilho[0], brilho[1], brilho[2]) };
    const uTex = { value: textura0 as Texture };

    const comuns = { uT: tempo, uTela: tela, uCentro: centro, uArt: arte, uProf: prof, uFoco: foco, uBrilho: brilhoU };

    const matEsfera = new ShaderMaterial({
      ...mistura,
      vertexShader: ORBE_VERTEX,
      fragmentShader: comElemento(ESFERA_FRAGMENT, codigo),
      uniforms: { ...comuns, uCor: cor, uNevoa: nevoa, uTex, uTemTex: temTex },
    });
    const matHalo = new ShaderMaterial({
      ...mistura,
      blending: AdditiveBlending,
      vertexShader: ORBE_VERTEX,
      fragmentShader: comElemento(HALO_FRAGMENT, codigo),
      uniforms: { ...comuns, uCor: cor, uCarga: carga },
    });
    const matPontos = new ShaderMaterial({
      ...mistura,
      blending: AdditiveBlending,
      vertexShader: comElemento(PARTICULA_VERTEX, codigo),
      fragmentShader: comElemento(PARTICULA_FRAGMENT, codigo),
      uniforms: { ...comuns, uEsc: esc },
    });
    materiais.push(matEsfera, matHalo, matPontos);

    const n = AJUSTES.particulasPorOrbe;
    const geoPontos = new BufferGeometry();
    geoPontos.setAttribute('position', new BufferAttribute(new Float32Array(n * 3), 3));
    const sementes = new Float32Array(n * 4);
    for (let i = 0; i < sementes.length; i += 1) sementes[i] = Math.random();
    geoPontos.setAttribute('aSeed', new BufferAttribute(sementes, 4));
    geometrias.push(geoPontos);

    const halo = new Mesh(geoQuad, matHalo);
    const esfera = new Mesh(geoQuad, matEsfera);
    const pontos = new Points(geoPontos, matPontos);
    for (const objeto of [halo, esfera, pontos]) {
      objeto.frustumCulled = false;
      objeto.visible = false;
      cena.add(objeto);
    }

    const orbe: Orbe = { elemento, centro, arte, prof, foco, carga, temTex, halo, esfera, pontos };
    orbes.push(orbe);

    // The artwork loads once; if it fails the element keeps its procedural sphere.
    new TextureLoader().load(
      `/sanctuary/elements/${elemento}-v1.webp`,
      (t) => {
        if (!vivo) {
          t.dispose();
          return;
        }
        t.premultiplyAlpha = true;
        t.needsUpdate = true;
        texturas.push(t);
        uTex.value = t;
        temTex.value = 1;
        sujo = true;
        // Under reduced motion nobody calls again until something changes: redraw the last frame ourselves.
        if (reduzido) desenhar();
      },
      undefined,
      () => {
        temTex.value = 0;
      },
    );
  });

  // The last state we drew, to know whether a still frame needs redrawing.
  const ultimo = new Float64Array(MAX_ORBES * CAMPOS);
  const presente = new Uint8Array(MAX_ORBES);
  const profundidades = new Float64Array(MAX_ORBES);
  const ordem = new Int8Array(MAX_ORBES);
  const medidor = criarMedidor();
  let largura = 0;
  let altura = 0;

  const redimensionar = () => {
    if (!vivo) return;
    const l = canvas.clientWidth;
    const a = canvas.clientHeight;
    if (l <= 0 || a <= 0) return;
    const dpr = pixelRatioDasOrbes(l, typeof window === 'undefined' ? 1 : window.devicePixelRatio);
    renderer.setPixelRatio(dpr);
    renderer.setSize(l, a, false);
    largura = l;
    altura = a;
    tela.value.set(l, a);
    esc.value = dpr;
    sujo = true;
  };
  redimensionar();

  function desenhar() {
    if (!vivo || degradado || largura <= 0) return;
    let visiveis = 0;
    for (let i = 0; i < orbes.length; i += 1) {
      const orbe = orbes[i];
      const ligado = presente[i] === 1;
      orbe.halo.visible = ligado;
      orbe.esfera.visible = ligado;
      orbe.pontos.visible = ligado;
      if (!ligado) continue;
      profundidades[i] = ultimo[i * CAMPOS + 3];
      ordem[visiveis] = i;
      visiveis += 1;
    }
    ordenarPorProfundidade(ordem, profundidades, visiveis);
    for (let rank = 0; rank < visiveis; rank += 1) {
      const orbe = orbes[ordem[rank]];
      orbe.halo.renderOrder = rank * 3;
      orbe.esfera.renderOrder = rank * 3 + 1;
      orbe.pontos.renderOrder = rank * 3 + 2;
    }
    renderer.render(cena, camera);
  }

  const atualizar = (estados: readonly OrbeEstado[], segundos: number) => {
    if (!vivo || degradado) return;
    if (typeof document !== 'undefined' && document.hidden) return;

    if (!reduzido && medidor.amostrar(segundos)) {
      degradar();
      return;
    }

    let mudou = sujo;
    for (let i = 0; i < orbes.length; i += 1) presente[i] = 0;
    for (let e = 0; e < estados.length; e += 1) {
      const estado = estados[e];
      let i = -1;
      for (let k = 0; k < orbes.length; k += 1) {
        if (orbes[k].elemento === estado.elemento) {
          i = k;
          break;
        }
      }
      if (i < 0) continue;
      presente[i] = 1;
      const base = i * CAMPOS;
      const foco = limitar(estado.foco, 0, 1);
      const carga = limitar(estado.carga, 0, 1);
      const prof = limitar(estado.profundidade, -1, 1);
      if (
        ultimo[base] !== estado.x ||
        ultimo[base + 1] !== estado.y ||
        ultimo[base + 2] !== estado.escala ||
        ultimo[base + 3] !== prof ||
        ultimo[base + 4] !== foco ||
        ultimo[base + 5] !== carga
      ) {
        mudou = true;
        ultimo[base] = estado.x;
        ultimo[base + 1] = estado.y;
        ultimo[base + 2] = estado.escala;
        ultimo[base + 3] = prof;
        ultimo[base + 4] = foco;
        ultimo[base + 5] = carga;
      }
      const orbe = orbes[i];
      orbe.centro.value.set(estado.x * largura, estado.y * altura);
      orbe.arte.value = AJUSTES.fracaoDoTamanho * largura * escalaVisual(estado.escala, foco);
      orbe.prof.value = prof;
      orbe.foco.value = foco;
      orbe.carga.value = carga;
    }

    if (reduzido) {
      if (!mudou) return;
      tempo.value = AJUSTES.tempoEstatico;
    } else {
      tempo.value = segundos;
    }
    sujo = false;
    desenhar();
  };

  const parar = () => {
    if (!vivo) return;
    vivo = false;
    canvas.removeEventListener('webglcontextlost', aoPerder);
    for (const geometria of geometrias) geometria.dispose();
    for (const material of materiais) material.dispose();
    for (const textura of texturas) textura.dispose();
    textura0.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  return { atualizar, redimensionar, parar };
};
