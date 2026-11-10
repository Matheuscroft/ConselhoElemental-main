import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';
import {
  ATRASO_MAXIMO_S,
  DOBRA_S,
  DPR_MAXIMO_DOBRA,
  INDICE_DO_ELEMENTO,
  PARTICULAS_DOBRA_CONQUISTA,
  alcanceDaDobra,
  particulasDaDobra,
  type TipoDeDobra,
} from '@/lib/momentos/moldura';
import { AURA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import './moldura-feitico.css';

/**
 * Level 3 only: particles that leave the card and cross the page.
 *
 * One WebGL canvas, in a portal on document.body, as big as the window,
 * `pointer-events: none` and under the dialogs. It draws only during a leap
 * (about 1.4s) and rests the rest of the time: nothing is rendered, and the
 * layer is hidden. A leap starts when the rail settles on a new day, on the
 * day's conquest, or when the open card is tapped.
 *
 * The position of every particle is a closed form of the time since the leap
 * began and of the card's rectangle on screen (both uniforms), computed in the
 * vertex shader: no CPU work per particle. `posicaoNaDobra` in moldura.ts is
 * the same arithmetic, so it can be tested without a GPU.
 */

const VERTEX = `
uniform vec2 uVp;
uniform vec2 uCentro;
uniform vec2 uMeia;
uniform float uT;
uniform float uForca;
uniform float uAmp;
uniform float uTodos;
uniform float uEl;
uniform float uPx;
uniform float uDpr;
uniform vec4 uSalt;
uniform vec3 uCorFogo;
uniform vec3 uCorAgua;
uniform vec3 uCorAr;
uniform vec3 uCorTerra;
attribute vec4 aSeed;
attribute float aIdx;
varying vec3 vCor;
varying float vAlpha;
varying vec2 vDir;
varying float vStretch;
varying float vEl;
varying float vSpin;

const float DOBRA = ${DOBRA_S.toFixed(2)};
const float ATRASO = ${ATRASO_MAXIMO_S.toFixed(2)};
const float G_AGUA = 620.0;
const float G_TERRA = 1500.0;
const float REST_TERRA = 0.35;

// Upper half of the outline: the top edge and the top half of each side.
vec3 bordaSuperior(float s) {
  float w = uMeia.x * 2.0;
  float h = uMeia.y * 2.0;
  float k = s * (w + h);
  if (k < w) return vec3(-uMeia.x + k, -uMeia.y, 0.0);
  if (k < w + h * 0.5) return vec3(uMeia.x, -uMeia.y + (k - w), 1.0);
  return vec3(-uMeia.x, -uMeia.y + (k - w - h * 0.5), -1.0);
}

vec2 bordaInteira(float s) {
  float w = uMeia.x * 2.0;
  float h = uMeia.y * 2.0;
  float k = s * 2.0 * (w + h);
  if (k < w) return vec2(-uMeia.x + k, -uMeia.y);
  if (k < w + h) return vec2(uMeia.x, -uMeia.y + (k - w));
  if (k < 2.0 * w + h) return vec2(uMeia.x - (k - w - h), uMeia.y);
  return vec2(-uMeia.x, uMeia.y - (k - 2.0 * w - h));
}

// Mirrors posicaoNaDobra in moldura.ts. px from the card's centre, y down.
vec2 posicao(float el, vec4 sd, float t, out vec2 origem) {
  float u = max(t - sd.w * ATRASO, 0.0);
  if (el > 1.5 && el < 2.5) {
    vec2 o = bordaInteira(sd.x);
    origem = o;
    float th = atan(o.y, o.x) + u * (6.0 + 3.0 * sd.z);
    float r = (length(o) + 220.0 * (0.4 + sd.z) * pow(max(u, 0.0001), 1.3)) * (1.0 + 0.12 * sin(th * 3.0 + u * 9.0));
    return vec2(cos(th), sin(th)) * r;
  }
  vec3 b = bordaSuperior(sd.x);
  vec2 o = b.xy;
  origem = o;
  if (el < 0.5) {
    float ang = (sd.y - 0.5) * 2.0 + b.z * 0.7;
    float vel = 170.0 + 160.0 * sd.z;
    return vec2(
      o.x + sin(ang) * vel * u + 14.0 * sin(u * 9.0 + sd.z * 17.0) * u,
      o.y - (cos(ang) * vel * u + 120.0 * u * u)
    );
  }
  if (el < 1.5) {
    float ang = (sd.y - 0.5) * 1.4 + b.z * 0.6;
    float vel = 330.0 + 180.0 * sd.z;
    return vec2(o.x + sin(ang) * vel * u, o.y - cos(ang) * vel * u + 0.5 * G_AGUA * u * u);
  }
  float ang = (sd.y - 0.5) * 1.2 + b.z * 0.9;
  float vel = 230.0 + 150.0 * sd.z;
  float sub = cos(ang) * vel;
  float lado = sin(ang) * vel;
  float chao = uMeia.y;
  float tb = (sub + sqrt(max(sub * sub - 2.0 * G_TERRA * (o.y - chao), 0.0))) / G_TERRA;
  if (u < tb) {
    return vec2(o.x + lado * u, o.y - sub * u + 0.5 * G_TERRA * u * u);
  }
  float w = u - tb;
  float quica = -REST_TERRA * (-sub + G_TERRA * tb);
  return vec2(o.x + lado * tb + lado * 0.5 * w, min(chao + quica * w + 0.5 * G_TERRA * w * w, chao));
}

void main() {
  vec4 sd = fract(aSeed + uSalt);
  float el = uTodos > 0.5 ? mod(aIdx, 4.0) : uEl;
  vec2 origem;
  vec2 outra;
  vec2 rel = posicao(el, sd, uT, origem);
  vec2 rel2 = posicao(el, sd, uT + 0.025, outra);
  // The reach of the leap: it blooms from the card; only the conquest overshoots.
  rel = origem + (rel - origem) * uForca;
  rel2 = origem + (rel2 - origem) * uForca;

  float inicio = sd.w * ATRASO;
  float u = max(uT - inicio, 0.0);
  float fase = clamp(u / (DOBRA - ATRASO), 0.0, 1.0);
  float saiu = uT > inicio ? 1.0 : 0.0;
  float saida = el > 2.5 ? smoothstep(0.8, 1.0, fase) : smoothstep(0.6, 1.0, fase);
  float env = smoothstep(0.0, 0.06, fase) * (1.0 - saida);

  vec2 v = rel2 - rel;
  float vel = length(v) / 0.025;
  vDir = vel > 0.01 ? v / length(v) : vec2(0.0, 1.0);
  float esticar = el < 0.5 ? 0.6 : (el < 1.5 ? 1.0 : (el < 2.5 ? 0.8 : 0.0));
  vStretch = 1.0 + min(vel / 260.0, 3.0) * esticar;
  vEl = el;
  vSpin = u * 7.0 + sd.y * 6.2831853;

  vec3 cor;
  if (el < 0.5) {
    // An ember cools as it flies: pale, then the aura, then dark red.
    cor = mix(vec3(1.0, 0.93, 0.72), uCorFogo, smoothstep(0.0, 0.4, fase));
    cor = mix(cor, vec3(0.62, 0.1, 0.04), 0.8 * smoothstep(0.6, 1.0, fase));
  } else if (el < 1.5) {
    cor = mix(uCorAgua, vec3(0.9, 1.0, 1.0), 0.35 * (1.0 - fase));
  } else if (el < 2.5) {
    cor = mix(uCorAr, vec3(1.0), 0.4);
  } else {
    cor = mix(uCorTerra, vec3(1.0, 0.78, 0.35), 0.45);
  }
  vCor = cor;
  vAlpha = env * saiu * uAmp * (0.6 + 0.4 * sd.z);

  float tamanho = uPx * uDpr * (0.8 + 0.6 * sd.z) * (1.0 - 0.35 * fase) * (el > 2.5 ? 2.3 : vStretch);
  gl_PointSize = tamanho;

  vec2 tela = uCentro + rel;
  gl_Position = vec4(tela.x / uVp.x * 2.0 - 1.0, 1.0 - tela.y / uVp.y * 2.0, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;
varying vec3 vCor;
varying float vAlpha;
varying vec2 vDir;
varying float vStretch;
varying float vEl;
varying float vSpin;
void main() {
  vec2 pc = gl_PointCoord - 0.5;
  float forma;
  if (vEl > 2.5) {
    // A shard of stone: a thin diamond, turning as it flies.
    float cs = cos(vSpin);
    float sn = sin(vSpin);
    vec2 q = vec2(cs * pc.x - sn * pc.y, sn * pc.x + cs * pc.y);
    forma = 1.0 - smoothstep(0.2, 0.34, abs(q.x) + abs(q.y) * 1.8);
  } else {
    // A streak: stretched along the velocity, thin across it.
    vec2 q = vec2(dot(pc, vDir), dot(pc, vec2(-vDir.y, vDir.x)));
    float r = length(vec2(q.x, q.y * vStretch));
    forma = smoothstep(0.5, 0.08, r);
  }
  gl_FragColor = vec4(vCor, forma * vAlpha);
}
`;

export interface DisparoDeDobra {
  /** Grows with each leap; 0 is none. */
  readonly n: number;
  readonly tipo: TipoDeDobra;
}

export interface DobraTelaCheiaProps {
  /** The open day's element; a day without one only leaps on a conquest. */
  readonly elemento: ElementoDoDia | null;
  readonly disparo: DisparoDeDobra;
  /** The open card's rectangle on screen, measured at the moment a leap starts. */
  readonly medirOrigem: () => DOMRect | null;
}

interface Painel {
  iniciar: (tipo: TipoDeDobra) => void;
}

export default function DobraTelaCheia({ elemento, disparo, medirOrigem }: DobraTelaCheiaProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<Painel | null>(null);
  const propsRef = useRef({ elemento, medirOrigem });

  useEffect(() => {
    propsRef.current = { elemento, medirOrigem };
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // A fresh canvas per mount (StrictMode mounts twice); a lost context never comes back.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      // No WebGL: nothing happens, and nothing is shown.
      canvas.remove();
      return;
    }
    renderer.setClearColor(0x000000, 0);

    let disposed = false;
    let lost = false;
    let ativa = false;
    let frame = 0;
    let inicio = 0;
    let tipoAtual: TipoDeDobra = 'troca';
    let largura = 0;
    let altura = 0;
    let dprAtual = 0;

    const uniforms = {
      uVp: { value: [1, 1] },
      uCentro: { value: [0, 0] },
      uMeia: { value: [74, 98.5] },
      uT: { value: 0 },
      uForca: { value: 1 },
      uAmp: { value: 1 },
      uTodos: { value: 0 },
      uEl: { value: 0 },
      uPx: { value: 3.8 },
      uDpr: { value: 1 },
      uSalt: { value: [0, 0, 0, 0] },
      uCorFogo: { value: new Color(AURA.fogo) },
      uCorAgua: { value: new Color(AURA.agua) },
      uCorAr: { value: new Color(AURA.ar) },
      uCorTerra: { value: new Color(AURA.terra) },
    };

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // The same seeds every time; each leap adds its own salt on the GPU.
    const total = PARTICULAS_DOBRA_CONQUISTA;
    const sementes = new Float32Array(total * 4);
    const indices = new Float32Array(total);
    let estado = 20261110;
    const aleatorio = () => {
      estado = (estado * 1664525 + 1013904223) % 4294967296;
      return estado / 4294967296;
    };
    for (let i = 0; i < total; i += 1) {
      sementes.set([aleatorio(), aleatorio(), aleatorio(), aleatorio()], i * 4);
      indices[i] = i;
    }
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(new Float32Array(total * 3), 3));
    geo.setAttribute('aSeed', new BufferAttribute(sementes, 4));
    geo.setAttribute('aIdx', new BufferAttribute(indices, 1));
    const mat = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const pontos = new Points(geo, mat);
    pontos.frustumCulled = false;
    scene.add(pontos);

    const dimensionar = (vw: number, vh: number) => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_MAXIMO_DOBRA);
      if (vw === largura && vh === altura && dpr === dprAtual) return;
      largura = vw;
      altura = vh;
      dprAtual = dpr;
      renderer.setPixelRatio(dpr);
      renderer.setSize(vw, vh, false);
      uniforms.uVp.value = [vw, vh];
      uniforms.uDpr.value = dpr;
    };

    const encerrar = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      ativa = false;
      host.dataset.ativa = 'false';
      if (!disposed && !lost) renderer.clear();
    };

    const laco = (agora: number) => {
      const t = Math.max(0, (agora - inicio) / 1000);
      if (t >= DOBRA_S || document.hidden || disposed || lost) {
        encerrar();
        return;
      }
      frame = requestAnimationFrame(laco);
      // The conquest opens in a conjure and passes its reach; a day change opens in a reveal and does not.
      const abre = tipoAtual === 'conquista' ? DURATION.conjure : DURATION.reveal;
      uniforms.uForca.value = alcanceDaDobra(tipoAtual, Math.min(1, (t * 1000) / abre));
      uniforms.uT.value = t;
      renderer.render(scene, camera);
    };

    const iniciar: Painel['iniciar'] = (tipo) => {
      if (disposed || lost || document.hidden) return;
      // A leap in course finishes; only the conquest interrupts it.
      if (ativa && tipo !== 'conquista') return;
      const { elemento: atual, medirOrigem: medir } = propsRef.current;
      const todos = tipo === 'conquista';
      if (!todos && !atual) return;
      const rect = medir();
      if (!rect || rect.width < 8 || rect.height < 8) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // A card that is off screen has nothing to throw.
      if (rect.bottom <= 0 || rect.top >= vh || rect.right <= 0 || rect.left >= vw) return;

      dimensionar(vw, vh);
      uniforms.uCentro.value = [rect.left + rect.width / 2, rect.top + rect.height / 2];
      uniforms.uMeia.value = [rect.width / 2, rect.height / 2];
      uniforms.uEl.value = atual ? INDICE_DO_ELEMENTO[atual] : 0;
      uniforms.uTodos.value = todos ? 1 : 0;
      uniforms.uAmp.value = todos ? 1 : 0.9;
      uniforms.uSalt.value = [Math.random(), Math.random(), Math.random(), Math.random()];
      uniforms.uT.value = 0;
      uniforms.uForca.value = alcanceDaDobra(tipo, 0);
      geo.setDrawRange(0, particulasDaDobra(tipo));

      tipoAtual = tipo;
      inicio = performance.now();
      ativa = true;
      host.dataset.ativa = 'true';
      if (!frame) frame = requestAnimationFrame(laco);
    };
    painelRef.current = { iniciar };

    const onContextLost = (evento: Event) => {
      evento.preventDefault();
      lost = true;
      encerrar();
    };
    const onVisibility = () => {
      if (document.hidden) encerrar();
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      painelRef.current = null;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  const { n, tipo } = disparo;
  useEffect(() => {
    if (n > 0) painelRef.current?.iniciar(tipo);
  }, [n, tipo]);

  return createPortal(
    <div ref={hostRef} className="reel-dobra" data-ativa="false" aria-hidden="true" />,
    document.body,
  );
}
