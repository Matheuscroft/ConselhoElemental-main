import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';
import type { NivelVfx } from '@/lib/momentos/nivel-vfx';
import {
  FPS_POR_NIVEL,
  PARTICULAS_MAX,
  corDaMoldura,
  interpolarParametros,
  margemDoNivel,
  nivelEfetivo,
  parametrosDaMoldura,
  particulasDoNivel,
  type ParametrosMoldura,
} from '@/lib/momentos/moldura';
import { AURA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import './moldura-feitico.css';

/**
 * The spell around the open card of the Reel: one WebGL context for the whole
 * Reel, two draws.
 *
 * 1. A quad whose fragment shader measures the distance to the card's rounded
 *    rectangle and glows only outside it. The inside stays alpha 0. From level
 *    2 the same shader also draws the element on the edge (a noise field tied
 *    to that distance): flames, a ribbon of water, arcs of wind, veins of
 *    earth.
 * 2. Up to 192 points orbiting the card. The position lives in the vertex
 *    shader; a point behind the card, or anywhere inside its outline, is
 *    discarded, so the card hides the back half of the orbit and its face is
 *    never covered. Each element's verb bends the orbit.
 *
 * Everything the person can change arrives as a uniform, so a new element, a
 * new level, a conquered day or the rail settling never rebuilds the scene.
 */

/** The card's own corner radius, in CSS px (reel-momentos.css). */
const RAIO_CARTAO = 22;
const TEMPO_ESTATICO = 2.4;

const FUNCAO_CAIXA = `
float sdCaixa(vec2 p, vec2 metade, float raio) {
  vec2 q = abs(p) - metade + vec2(raio);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - raio;
}
`;

const VERTEX_BRILHO = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT_BRILHO = `
precision highp float;
varying vec2 vUv;
uniform vec2 uSize;
uniform vec2 uHalf;
uniform float uMargem;
uniform float uTime;
uniform float uReveal;
uniform float uDraw;
uniform float uExp;
uniform float uVivo;
uniform vec4 uPeso;
uniform vec3 uColour;
${FUNCAO_CAIXA}

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm3(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 3; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s;
}

float fbm2(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 2; i++) {
    s += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return s;
}

// The element drawn on the border, outside the card only. Returns premultiplied
// colour in rgb and its alpha in a. p is in px from the centre, y up; d is the
// distance outside the card's outline.
vec4 bordaViva(vec2 p, float d) {
  vec2 n = p / uHalf;
  float ang = atan(n.y, n.x);
  // 0 at the bottom, growing counter-clockwise round the card.
  float tr = fract(ang / 6.2831853 + 0.25);
  float alto = clamp(p.y / uHalf.y * 0.5 + 0.5, 0.0, 1.0);
  vec3 acc = vec3(0.0);
  float alfa = 0.0;

  // Fire: tongues born on the border, rising, taller at the top.
  if (uPeso.x > 0.003) {
    float H = 6.0 + 30.0 * (0.25 + 0.75 * alto * alto);
    float n1 = fbm3(vec2(p.x * 0.05, p.y * 0.05 - uTime * 1.7));
    float f = clamp((n1 * 1.25 + 0.15 - d / H) * 1.6, 0.0, 1.0);
    float m = smoothstep(0.0, 0.2, uDraw * 1.25 - alto);
    vec3 c = mix(vec3(0.32, 0.03, 0.02), uColour, smoothstep(0.05, 0.5, f));
    c = mix(c, vec3(1.0, 0.95, 0.78), smoothstep(0.62, 1.0, f));
    float a = f * m * 0.95;
    acc += uPeso.x * c * a;
    alfa += uPeso.x * a;
  }

  // Water: a ribbon of 6 to 10px running the perimeter, with caustic highlights.
  if (uPeso.y > 0.003) {
    float larg = 4.5 + 0.9 * sin(tr * 62.831853 - uTime * 2.4);
    float fita = 1.0 - smoothstep(larg - 2.0, larg, abs(d - 8.0));
    float cn = 0.5 + 0.5 * sin(tr * 94.24778 - uTime * 3.0 + 1.8 * sin(d * 0.45 + tr * 25.132742 + uTime * 1.1));
    float caust = pow(1.0 - abs(2.0 * cn - 1.0), 6.0);
    float cabeca = pow(max(0.0, cos((tr - fract(uTime * 0.11)) * 6.2831853)), 16.0);
    float m = smoothstep(0.0, 0.06, uDraw * 1.06 - tr);
    float a = fita * (0.45 + 0.6 * caust + 0.5 * cabeca) * m;
    vec3 c = mix(uColour, vec3(0.9, 1.0, 1.0), clamp(caust * 0.8 + cabeca * 0.6, 0.0, 1.0));
    acc += uPeso.y * c * a;
    alfa += uPeso.y * a;
  }

  // Air: translucent arcs of wind sweeping the border in a spiral.
  if (uPeso.z > 0.003) {
    float s1 = ang * 3.0 + d * 0.42 - uTime * 2.8;
    float s2 = ang * 5.0 - d * 0.3 + uTime * 1.9;
    float arco = pow(0.5 + 0.5 * sin(s1), 10.0) * 0.85 + pow(0.5 + 0.5 * sin(s2), 12.0) * 0.5;
    float modula = 0.6 + 0.4 * sin(ang * 2.0 - uTime * 1.1 + d * 0.1);
    float caida = pow(1.0 - clamp(d / 40.0, 0.0, 1.0), 1.3);
    float giro = fract(ang / 6.2831853 + 0.25 + d * 0.012);
    float m = smoothstep(0.0, 0.2, uDraw * 1.2 - giro);
    float a = arco * modula * caida * m;
    vec3 c = mix(uColour, vec3(1.0), 0.4);
    acc += uPeso.z * c * a;
    alfa += uPeso.z * a;
  }

  // Earth: incandescent veins pulsing out of the border, lifted from below.
  if (uPeso.w > 0.003) {
    vec2 q = p * 0.085;
    float rid = 1.0 - abs(2.0 * fbm2(q + vec2(3.1, 1.7)) - 1.0);
    float veio = pow(rid, 9.0);
    float faixa = 1.0 - smoothstep(3.0, 20.0, d);
    float pulso = 0.5 + 0.5 * sin(uTime * 1.7 + fbm2(q * 0.7) * 9.0);
    float m = smoothstep(0.0, 0.1, uDraw * 1.2 - floor(alto * 5.0) / 5.0);
    float brasa = (1.0 - smoothstep(0.0, 5.0, d)) * 0.25 * pulso;
    float a = (veio * faixa * (0.35 + 0.85 * pulso) + brasa) * m;
    vec3 c = mix(uColour, vec3(1.0, 0.82, 0.4), 0.45 + 0.5 * pulso);
    acc += uPeso.w * c * a;
    alfa += uPeso.w * a;
  }

  return vec4(acc, alfa);
}

void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdCaixa(p, uHalf, ${RAIO_CARTAO.toFixed(1)});
  float fora = smoothstep(0.0, 1.5, d);
  float queda = 1.0 - clamp(d / uMargem, 0.0, 1.0);
  float respira = 0.85 + 0.15 * sin(uTime * 1.1);
  float brilho = fora * queda * queda * 0.35 * respira;
  // A highlight travelling the perimeter once every nine seconds.
  float ang = atan(p.y, p.x);
  float reflexo = pow(max(0.0, cos(ang - uTime * 0.6981)), 10.0);
  brilho += reflexo * fora * (1.0 - smoothstep(0.0, 10.0, d)) * 0.5;
  brilho *= uReveal * (1.0 + uExp * 0.9);

  vec3 soma = uColour * brilho;
  float total = brilho;
  if (uVivo > 0.001) {
    vec4 vivo = bordaViva(p, d);
    float k = uVivo * fora * uReveal * (1.0 + uExp * 0.9) * (1.0 - smoothstep(uMargem - 8.0, uMargem, d));
    soma += vivo.rgb * k;
    total += vivo.a * k;
  }
  gl_FragColor = vec4(soma / max(total, 0.0001), clamp(total, 0.0, 1.0));
}
`;

const VERTEX_PONTOS = `
uniform vec2 uSize;
uniform vec2 uHalf;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uAfast;
uniform float uRise;
uniform float uPx;
uniform float uFlicker;
uniform float uReveal;
uniform float uExp;
uniform float uCount;
uniform float uDpr;
uniform vec4 uVerbo;
uniform float uGiro;
uniform float uCiclo;
attribute vec4 aSeed;
attribute float aIdx;
varying vec2 vPos;
varying float vAlpha;
varying float vBack;
varying float vFase;
void main() {
  float th = aSeed.x * 6.2831853 + uTime * uSpeed * 6.2831853 * (0.6 + aSeed.w * 0.8) * uGiro;
  float vida = fract(aSeed.y + uTime * uRise * 0.012);
  // The verb's own arc: a phase that cycles, with the drift written on it.
  float fase = fract(aSeed.x * 3.7 + aSeed.y + uTime * uCiclo);
  float off = mix(uAfast.x, uAfast.y, vida)
    + sin(uExp * 3.14159) * 26.0 * aSeed.z
    + uVerbo.z * sin(th * 3.0 + uTime * 2.0 + aSeed.z * 6.2831853);
  vec2 c = vec2(cos(th), sin(th));
  // A squarish superellipse, so the orbit hugs the card instead of cutting its corners.
  vec2 pos = vec2(
    sign(c.x) * pow(abs(c.x), 0.25) * (uHalf.x + off),
    sign(c.y) * pow(abs(c.y), 0.25) * (uHalf.y + off)
  );
  float z = sin(th + aSeed.z * 6.2831853);
  pos.y += z * 4.0 + uVerbo.x * fase + uVerbo.y * fase * fase;
  pos.x += uVerbo.w * sin(uTime * (9.0 + aSeed.w * 7.0) + aSeed.z * 40.0) * (0.4 + fase);
  // Born at the corners, spreading to their orbit as the card settles.
  pos = mix(sign(pos) * uHalf, pos, uReveal);
  vPos = pos;
  vFase = fase;
  vBack = z < 0.0 ? 1.0 : 0.0;
  float tw = 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * (2.0 + aSeed.w * 6.0) + aSeed.z * 30.0));
  float borda = sin(3.14159 * vida);
  float arco = uCiclo > 0.0 ? pow(max(sin(3.14159 * fase), 0.0), 0.6) : 1.0;
  float ativa = aIdx < uCount ? 1.0 : 0.0;
  vAlpha = tw * borda * arco * (0.55 + 0.45 * (z * 0.5 + 0.5)) * ativa * uReveal * (1.0 + uExp * 0.6);
  gl_PointSize = uPx * uDpr * (0.75 + 0.5 * aSeed.w) * (1.0 + 0.3 * z) * (1.0 + 0.8 * sin(uExp * 3.14159));
  gl_Position = vec4(pos.x / (uSize.x * 0.5), -pos.y / (uSize.y * 0.5), 0.0, 1.0);
}
`;

const FRAGMENT_PONTOS = `
precision highp float;
uniform vec2 uHalf;
uniform vec3 uColour;
uniform vec4 uPeso;
varying vec2 vPos;
varying float vAlpha;
varying float vBack;
varying float vFase;
${FUNCAO_CAIXA}
void main() {
  // Inside the outline is the card's face: the canvas never covers it.
  vec2 pc = vec2(vPos.x, vPos.y);
  if (sdCaixa(pc, uHalf, ${RAIO_CARTAO.toFixed(1)}) < 1.0) discard;
  float r = length(gl_PointCoord - 0.5);
  float disco = smoothstep(0.5, 0.05, r);
  float a = disco * vAlpha * (1.0 - 0.45 * vBack);
  vec3 cor = mix(uColour, vec3(1.0), 0.35 * (1.0 - vBack));
  // An ember cools as it rises: pale, then the aura, then dark red.
  cor = mix(cor, vec3(1.0, 0.93, 0.72), 0.5 * (1.0 - vFase) * uPeso.x);
  cor = mix(cor, vec3(0.5, 0.06, 0.03), smoothstep(0.55, 1.0, vFase) * uPeso.x);
  gl_FragColor = vec4(cor, a);
}
`;

export interface MolduraFeiticoProps {
  /** The day's leading element; null paints neutral gold. */
  readonly elemento: ElementoDoDia | null;
  /** The level of VFX of the open day (nivel-vfx.ts). */
  readonly nivel: NivelVfx;
  /** The open day has all its cycles done: more particles. */
  readonly completo: boolean;
  /** The rail is moving: the frame is hidden and paused. */
  readonly rolando: boolean;
  /** A card is open (selecionado is inside the window). */
  readonly ativo: boolean;
  /** Changes with each conquered day; 0 is none. */
  readonly conquista: number;
  /** One still frame, no loop, no burst; every level becomes level 1. */
  readonly reduzido: boolean;
}

interface Painel {
  sync: (quem: 'cor' | 'visao' | 'conquista' | 'densidade') => void;
}

const suave = (k: number) => 1 - (1 - k) ** 3;

export default function MolduraFeitico({
  elemento,
  nivel,
  completo,
  rolando,
  ativo,
  conquista,
  reduzido,
}: MolduraFeiticoProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<Painel | null>(null);
  // Reduced motion turns every level into level 1, still.
  const nivelAtivo = nivelEfetivo(nivel, reduzido);
  const propsRef = useRef({ elemento, nivel: nivelAtivo, completo, rolando, ativo, conquista });

  // Declared first: the effects below read the latest props through this ref.
  useEffect(() => {
    propsRef.current = { elemento, nivel: nivelAtivo, completo, rolando, ativo, conquista };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A fresh canvas per mount: a context lost on cleanup (forceContextLoss)
    // can never be reused, and StrictMode or a `reduzido` change runs this again.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      canvas.remove();
      host.dataset.modo = 'simples';
      return;
    }

    let disposed = false;
    let lost = false;
    let frame = 0;
    let visible = true;
    let ultimo = 0;
    let quadroMs = 1000 / FPS_POR_NIVEL[1];
    let tempo = reduzido ? TEMPO_ESTATICO : 0;
    let mostrando = false;
    let corInicio = -1;
    let revelarInicio = -1;
    let desenharInicio = -1;
    let explosaoInicio = -1;
    let paradaTimer = 0;
    let corJaDefinida = false;
    const corDe = new Color();
    const corPara = new Color();
    let paramDe: ParametrosMoldura = parametrosDaMoldura(null, 1);
    let paramPara: ParametrosMoldura = paramDe;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const uniforms = {
      uSize: { value: [196, 245] },
      uHalf: { value: [74, 98.5] },
      uMargem: { value: margemDoNivel(1) },
      uTime: { value: 0 },
      uReveal: { value: reduzido ? 1 : 0 },
      uDraw: { value: 1 },
      uExp: { value: 0 },
      uColour: { value: new Color('#d6b66f') },
      uSpeed: { value: 0.05 },
      uAfast: { value: [4, 18] },
      uRise: { value: 0 },
      uPx: { value: 3 },
      uFlicker: { value: 0.3 },
      uCount: { value: 64 },
      uDpr: { value: dpr },
      uVerbo: { value: [0, 0, 0, 0] },
      uGiro: { value: 1 },
      uCiclo: { value: 0 },
      uVivo: { value: 0 },
      uPeso: { value: [0, 0, 0, 0] },
    };

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const brilhoGeo = new PlaneGeometry(2, 2);
    const brilhoMat = new ShaderMaterial({
      vertexShader: VERTEX_BRILHO,
      fragmentShader: FRAGMENT_BRILHO,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const brilho = new Mesh(brilhoGeo, brilhoMat);
    brilho.frustumCulled = false;
    brilho.renderOrder = 0;
    scene.add(brilho);

    // The same seeds every time: the orbit is a pattern, not a dice roll.
    const sementes = new Float32Array(PARTICULAS_MAX * 4);
    const indices = new Float32Array(PARTICULAS_MAX);
    let estado = 20261109;
    const aleatorio = () => {
      estado = (estado * 1664525 + 1013904223) % 4294967296;
      return estado / 4294967296;
    };
    for (let i = 0; i < PARTICULAS_MAX; i += 1) {
      sementes.set([aleatorio(), aleatorio(), aleatorio(), aleatorio()], i * 4);
      indices[i] = i;
    }
    const pontosGeo = new BufferGeometry();
    pontosGeo.setAttribute('position', new BufferAttribute(new Float32Array(PARTICULAS_MAX * 3), 3));
    pontosGeo.setAttribute('aSeed', new BufferAttribute(sementes, 4));
    pontosGeo.setAttribute('aIdx', new BufferAttribute(indices, 1));
    const pontosMat = new ShaderMaterial({
      vertexShader: VERTEX_PONTOS,
      fragmentShader: FRAGMENT_PONTOS,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const pontos = new Points(pontosGeo, pontosMat);
    pontos.frustumCulled = false;
    pontos.renderOrder = 1;
    scene.add(pontos);

    const draw = () => {
      if (disposed || lost) return;
      uniforms.uTime.value = tempo;
      renderer.render(scene, camera);
      // The canvas only fades in once a frame exists: before it, the browser may show it opaque black.
      if (host.dataset.pronto !== 'true') host.dataset.pronto = 'true';
    };

    const limitar = (valor: number) => Math.min(1, Math.max(0, valor));

    /** Writes a parameter set to the uniforms: the only place a verb or a level reaches the GPU. */
    const aplicar = (p: ParametrosMoldura) => {
      uniforms.uSpeed.value = p.velocidade;
      uniforms.uAfast.value = [p.afastamentoMin, p.afastamentoMax];
      uniforms.uRise.value = p.subida;
      uniforms.uPx.value = p.tamanho;
      uniforms.uFlicker.value = p.cintilar;
      uniforms.uVerbo.value = [p.arrastoLinear, p.arrastoQuadratico, p.ondula, p.tremula];
      uniforms.uGiro.value = p.giro;
      uniforms.uCiclo.value = p.ciclo;
      uniforms.uVivo.value = p.vivo;
      uniforms.uPeso.value = [p.pesoFogo, p.pesoAgua, p.pesoAr, p.pesoTerra];
    };

    /** Advances the tweens; each one is a uniform, never a rebuild. */
    const animar = (agora: number) => {
      if (revelarInicio >= 0) {
        // A day change is a reveal: it arrives, it never passes its target.
        const k = limitar((agora - revelarInicio) / DURATION.reveal);
        uniforms.uReveal.value = suave(k);
        if (k >= 1) revelarInicio = -1;
      }
      if (desenharInicio >= 0) {
        // The element draws its border: the sweep is a settle, it lands and rests.
        const k = limitar((agora - desenharInicio) / DURATION.settle);
        uniforms.uDraw.value = suave(k);
        if (k >= 1) desenharInicio = -1;
      }
      if (corInicio >= 0) {
        // A new colour or element is a settle, blended and never cut.
        const k = limitar((agora - corInicio) / DURATION.settle);
        uniforms.uColour.value.copy(corDe).lerp(corPara, suave(k));
        aplicar(interpolarParametros(paramDe, paramPara, suave(k)));
        if (k >= 1) corInicio = -1;
      }
      if (explosaoInicio >= 0) {
        // The conquest is the one conjure.
        const k = limitar((agora - explosaoInicio) / DURATION.conjure);
        uniforms.uExp.value = k;
        if (k >= 1) {
          explosaoInicio = -1;
          uniforms.uExp.value = 0;
        }
      }
    };

    const laco = (agora: number) => {
      frame = requestAnimationFrame(laco);
      const passou = agora - ultimo;
      // A little slack, or a 60Hz screen would round a 60fps loop down to 30.
      if (passou < quadroMs - 2) return;
      ultimo = agora;
      tempo += Math.min(passou, 50) / 1000;
      animar(agora);
      draw();
    };

    const parar = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    const tocar = () => {
      if (frame || disposed || lost || reduzido || !visible || document.hidden || !mostrando) return;
      ultimo = performance.now();
      frame = requestAnimationFrame(laco);
    };

    /** The level the host was rendered with: CSS and the shader read the same attribute. */
    const nivelDoHost = (): NivelVfx => {
      const n = Number(host.dataset.nivel);
      return n === 2 || n === 3 ? n : 1;
    };

    const medir = () => {
      const largura = canvas.clientWidth;
      const altura = canvas.clientHeight;
      if (!largura || !altura || disposed) return;
      const margem = margemDoNivel(nivelDoHost());
      renderer.setSize(largura, altura, false);
      uniforms.uSize.value = [largura, altura];
      uniforms.uHalf.value = [largura / 2 - margem, altura / 2 - margem];
      uniforms.uMargem.value = margem;
      draw();
    };

    const sync: Painel['sync'] = (quem) => {
      const p = propsRef.current;
      const agora = performance.now();

      if (quem === 'cor') {
        quadroMs = 1000 / FPS_POR_NIVEL[p.nivel];
        paramPara = parametrosDaMoldura(p.elemento, p.nivel);
        corPara.set(corDaMoldura(p.elemento, AURA));
        if (!corJaDefinida || reduzido || !mostrando) {
          aplicar(paramPara);
          paramDe = paramPara;
          uniforms.uColour.value.copy(corPara);
          corInicio = -1;
        } else {
          // From wherever the last blend had got to, not from where it was heading.
          paramDe = {
            velocidade: uniforms.uSpeed.value,
            afastamentoMin: uniforms.uAfast.value[0],
            afastamentoMax: uniforms.uAfast.value[1],
            subida: uniforms.uRise.value,
            tamanho: uniforms.uPx.value,
            cintilar: uniforms.uFlicker.value,
            arrastoLinear: uniforms.uVerbo.value[0],
            arrastoQuadratico: uniforms.uVerbo.value[1],
            ondula: uniforms.uVerbo.value[2],
            tremula: uniforms.uVerbo.value[3],
            giro: uniforms.uGiro.value,
            ciclo: uniforms.uCiclo.value,
            vivo: uniforms.uVivo.value,
            pesoFogo: uniforms.uPeso.value[0],
            pesoAgua: uniforms.uPeso.value[1],
            pesoAr: uniforms.uPeso.value[2],
            pesoTerra: uniforms.uPeso.value[3],
          };
          corDe.copy(uniforms.uColour.value);
          corInicio = agora;
        }
        corJaDefinida = true;
      }

      if (quem === 'densidade') {
        uniforms.uCount.value = particulasDoNivel(p.nivel, p.completo);
        medir();
      }

      if (quem === 'conquista' && p.conquista > 0 && !reduzido && mostrando) {
        explosaoInicio = agora;
      }

      if (quem === 'visao') {
        const deve = p.ativo && !p.rolando;
        if (deve && !mostrando) {
          mostrando = true;
          window.clearTimeout(paradaTimer);
          uniforms.uReveal.value = reduzido ? 1 : 0;
          uniforms.uDraw.value = reduzido ? 1 : 0;
          revelarInicio = reduzido ? -1 : agora;
          desenharInicio = reduzido ? -1 : agora;
          tocar();
        } else if (!deve && mostrando) {
          mostrando = false;
          // The CSS fade takes a feedback beat; the loop stops when it ends.
          window.clearTimeout(paradaTimer);
          paradaTimer = window.setTimeout(parar, DURATION.feedback);
        }
      }

      if (reduzido) draw();
    };
    painelRef.current = { sync };

    const onContextLost = (evento: Event) => {
      evento.preventDefault();
      lost = true;
      parar();
      host.dataset.modo = 'simples';
    };
    const onVisibility = () => (document.hidden ? parar() : tocar());
    const observer = new ResizeObserver(medir);
    const naTela = new IntersectionObserver(([entrada]) => {
      visible = entrada?.isIntersecting ?? true;
      if (visible) tocar();
      else parar();
    });

    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(canvas);
    naTela.observe(canvas);

    host.dataset.pronto = 'false';
    host.dataset.modo = '3d';
    medir();
    sync('cor');
    sync('densidade');
    sync('visao');

    return () => {
      disposed = true;
      parar();
      window.clearTimeout(paradaTimer);
      painelRef.current = null;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      naTela.disconnect();
      brilhoGeo.dispose();
      brilhoMat.dispose();
      pontosGeo.dispose();
      pontosMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, [reduzido]);

  useEffect(() => { painelRef.current?.sync('cor'); }, [elemento, nivelAtivo, reduzido]);
  useEffect(() => { painelRef.current?.sync('densidade'); }, [completo, nivelAtivo, reduzido]);
  useEffect(() => { painelRef.current?.sync('visao'); }, [rolando, ativo, reduzido]);
  useEffect(() => { painelRef.current?.sync('conquista'); }, [conquista, reduzido]);

  return (
    <div
      ref={hostRef}
      className="reel-feitico"
      data-visivel={ativo && !rolando}
      data-nivel={nivelAtivo}
      data-modo="simples"
      aria-hidden="true"
    />
  );
}
