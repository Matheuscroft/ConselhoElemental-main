import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import {
  ANEL,
  CURVA_DO_ANEL,
  pixelRatioMaximo,
  pontoDoAnel,
  quantidadeDeParticulas,
  tabelaDoAnel,
} from '@/lib/cerimonia/nivel';
import {
  EXPLOSAO_VERTEX,
  FAISCAS_VERTEX,
  ONDAS_FRAGMENT,
  ONDAS_VERTEX,
  PARTICULA_FRAGMENT,
  PONTA_VERTEX,
} from './ascensao-shaders';

/**
 * The WebGL half of the "Ascension" (loaded with `import()` only when the
 * ceremony opens, so three never reaches the entry bundle). One transparent
 * canvas over the CSS background draws, in a handful of draw calls: the sparks
 * that spiral off the tip of the ring, the burst that flies into the seal, the
 * glowing tip and the shock rings on the floor.
 *
 * It owns no clock. The component's loop calls `desenhar(ms, fracao)` once per
 * frame, so a hidden tab stops it for free. Buffers are filled once; a frame
 * only writes uniforms.
 */

export interface LayoutDaAscensao {
  /** The viewport, in CSS px. */
  readonly largura: number;
  readonly altura: number;
  /** The ring's centre and radii on screen, in CSS px. */
  readonly anel: { readonly x: number; readonly y: number; readonly rx: number; readonly ry: number };
  /** Where the burst flies to: the centre of the seal, in CSS px. */
  readonly alvo: { readonly x: number; readonly y: number };
}

export interface OpcoesDaAscensao {
  /** Where the canvas is appended. */
  readonly palco: HTMLElement;
  /** The colour of the element that lights the scene, as `#rrggbb`. */
  readonly cor: string;
  /** Where the ring starts filling from (0..1). */
  readonly fracaoAntes: number;
  /** Called if the browser takes the GL context away; the caller falls back to CSS. */
  readonly aoPerder: () => void;
}

export interface CenaDaAscensao {
  medir(layout: LayoutDaAscensao): void;
  /** `ms`: scene clock; `fracao`: how full the ring is right now (0..1). */
  desenhar(ms: number, fracao: number): void;
  desmontar(): void;
}

const FOV = 40;
/** Share of the particles that are sparks off the tip; the rest is the burst. */
const PARTE_DAS_FAISCAS = 0.6;

function sementes(quantidade: number): Float32Array {
  const dados = new Float32Array(quantidade * 4);
  for (let i = 0; i < dados.length; i += 1) dados[i] = Math.random();
  return dados;
}

function geometriaDePontos(quantidade: number): BufferGeometry {
  const geometria = new BufferGeometry();
  geometria.setAttribute('position', new BufferAttribute(new Float32Array(quantidade * 3), 3));
  geometria.setAttribute('aSeed', new BufferAttribute(sementes(quantidade), 4));
  return geometria;
}

export function criarCenaDaAscensao(opcoes: OpcoesDaAscensao): CenaDaAscensao | null {
  let renderer: WebGLRenderer;
  const canvas = document.createElement('canvas');
  canvas.className = 'cn-asc__canvas';
  canvas.setAttribute('aria-hidden', 'true');
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
  opcoes.palco.appendChild(canvas);

  const aoPerder = (evento: Event) => {
    evento.preventDefault();
    opcoes.aoPerder();
  };
  canvas.addEventListener('webglcontextlost', aoPerder);

  const largura0 = typeof window === 'undefined' ? 390 : window.innerWidth;
  const total = quantidadeDeParticulas(largura0);
  const nFaiscas = Math.round(total * PARTE_DAS_FAISCAS);
  const nExplosao = total - nFaiscas;

  const cena = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 1, 4000);
  // The shaders write sRGB straight to the canvas, so the colour stays as typed (no colour management).
  const hex = Number.parseInt(opcoes.cor.replace('#', ''), 16) || 0xffffff;

  // Uniforms shared by every material, so a frame writes each one once.
  const tela = { value: new Vector2(390, 844) };
  const centro = { value: new Vector2(195, 600) };
  const raios = { value: new Vector2(190, 27) };
  const esc = { value: 1 };
  const dist = { value: 1000 };
  const tempo = { value: 0 };
  const corU = { value: new Vector3(((hex >> 16) & 255) / 255, ((hex >> 8) & 255) / 255, (hex & 255) / 255) };
  const lut = { value: tabelaDoAnel(64) };
  const fecha = { value: ANEL.fecha };

  const comuns = { uT: tempo, uTela: tela, uCentro: centro, uR: raios, uEsc: esc, uDist: dist, uLut: lut, uCor: corU };
  const preencher = {
    uFill: { value: new Vector3(ANEL.entrada, ANEL.preenche, opcoes.fracaoAntes) },
    uCurva: { value: new Vector2(CURVA_DO_ANEL.reta, CURVA_DO_ANEL.quadrada) },
  };
  const alvo = { value: new Vector2(195, 150) };

  const aditivo = { transparent: true, depthTest: false, depthWrite: false, blending: AdditiveBlending } as const;

  const geoFaiscas = geometriaDePontos(nFaiscas);
  const matFaiscas = new ShaderMaterial({
    ...aditivo,
    vertexShader: FAISCAS_VERTEX,
    fragmentShader: PARTICULA_FRAGMENT,
    uniforms: { ...comuns, ...preencher },
  });
  const faiscas = new Points(geoFaiscas, matFaiscas);
  faiscas.frustumCulled = false;

  const geoExplosao = geometriaDePontos(nExplosao);
  const matExplosao = new ShaderMaterial({
    ...aditivo,
    vertexShader: EXPLOSAO_VERTEX,
    fragmentShader: PARTICULA_FRAGMENT,
    uniforms: { ...comuns, uClose: fecha, uConv: { value: ANEL.convergencia }, uAlvo: alvo },
  });
  const explosao = new Points(geoExplosao, matExplosao);
  explosao.frustumCulled = false;

  const geoPonta = new BufferGeometry();
  geoPonta.setAttribute('position', new BufferAttribute(new Float32Array(3), 3));
  const ponta = { value: new Vector2(195, 600) };
  const tamPonta = { value: 30 };
  const intensidade = { value: 0 };
  const matPonta = new ShaderMaterial({
    ...aditivo,
    vertexShader: PONTA_VERTEX,
    fragmentShader: PARTICULA_FRAGMENT,
    uniforms: { uTela: tela, uEsc: esc, uDist: dist, uCor: corU, uPonta: ponta, uTam: tamPonta, uIntens: intensidade },
  });
  const pontaPontos = new Points(geoPonta, matPonta);
  pontaPontos.frustumCulled = false;

  const geoOndas = new PlaneGeometry(1, 1);
  const quad = { value: new Vector2(390, 240) };
  const fracaoU = { value: 0 };
  const matOndas = new ShaderMaterial({
    ...aditivo,
    vertexShader: ONDAS_VERTEX,
    fragmentShader: ONDAS_FRAGMENT,
    uniforms: { uT: tempo, uTela: tela, uCentro: centro, uQuad: quad, uR: raios, uCor: corU, uClose: fecha, uFracao: fracaoU },
  });
  const ondas = new Mesh(geoOndas, matOndas);
  ondas.frustumCulled = false;

  // Back to front: the floor, then the particles, then the tip on top.
  ondas.renderOrder = 0;
  faiscas.renderOrder = 1;
  explosao.renderOrder = 2;
  pontaPontos.renderOrder = 3;
  cena.add(ondas, faiscas, explosao, pontaPontos);

  const reutilizado = { x: 0, y: 0 };
  let vivo = true;

  const medir = (layout: LayoutDaAscensao) => {
    if (!vivo || layout.largura <= 0 || layout.altura <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, pixelRatioMaximo(layout.largura));
    renderer.setPixelRatio(dpr);
    renderer.setSize(layout.largura, layout.altura, false);
    camera.aspect = layout.largura / layout.altura;
    const d = layout.altura / 2 / Math.tan((FOV * Math.PI) / 360);
    camera.position.set(0, 0, d);
    camera.far = d * 4;
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    tela.value.set(layout.largura, layout.altura);
    centro.value.set(layout.anel.x, layout.anel.y);
    raios.value.set(layout.anel.rx, layout.anel.ry);
    quad.value.set(layout.largura, layout.anel.rx * 1.3);
    alvo.value.set(layout.alvo.x, layout.alvo.y);
    esc.value = dpr;
    dist.value = d;
  };

  const desenhar = (ms: number, fracao: number) => {
    if (!vivo) return;
    tempo.value = ms;
    fracaoU.value = fracao;
    // The tip: runs round the ring while it fills, then flares at the top as it closes.
    const depois = ms - ANEL.fecha;
    pontoDoAnel(lut.value, depois >= 0 ? 1 : fracao, reutilizado);
    ponta.value.set(centro.value.x + reutilizado.x * raios.value.x, centro.value.y + reutilizado.y * raios.value.y);
    if (ms < ANEL.entrada) {
      intensidade.value = 0;
    } else if (depois < 0) {
      intensidade.value = Math.min(1, (ms - ANEL.entrada) / 200);
      tamPonta.value = 30 + 6 * Math.sin(ms * 0.025);
    } else {
      intensidade.value = Math.max(0, 1 - depois / 500) * 1.6;
      tamPonta.value = 30 + 60 * Math.min(1, depois / 220);
    }
    renderer.render(cena, camera);
  };

  const desmontar = () => {
    if (!vivo) return;
    vivo = false;
    canvas.removeEventListener('webglcontextlost', aoPerder);
    geoFaiscas.dispose();
    geoExplosao.dispose();
    geoPonta.dispose();
    geoOndas.dispose();
    matFaiscas.dispose();
    matExplosao.dispose();
    matPonta.dispose();
    matOndas.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };

  return { medir, desenhar, desmontar };
}
