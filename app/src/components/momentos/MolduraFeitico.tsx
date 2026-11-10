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
import {
  MARGEM_PX,
  PARTICULAS,
  PARTICULAS_DIA_COMPLETO,
  configDoElemento,
  corDaMoldura,
} from '@/lib/momentos/moldura';
import { AURA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import './moldura-feitico.css';

/**
 * The spell around the open card of the Reel: one WebGL context for the whole
 * Reel, two draws.
 *
 * 1. A quad whose fragment shader measures the distance to the card's rounded
 *    rectangle and glows only outside it. The inside stays alpha 0.
 * 2. Up to 96 points orbiting the card. The position lives in the vertex
 *    shader; a point behind the card, or anywhere inside its outline, is
 *    discarded, so the card hides the back half of the orbit and its face is
 *    never covered.
 *
 * Everything the person can change arrives as a uniform, so a new element, a
 * conquered day or the rail settling never rebuilds the scene.
 */

/** The card's own corner radius, in CSS px (reel-momentos.css). */
const RAIO_CARTAO = 22;
const QUADRO_MS = 1000 / 30;
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
uniform float uTime;
uniform float uReveal;
uniform float uExp;
uniform vec3 uColour;
${FUNCAO_CAIXA}
void main() {
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdCaixa(p, uHalf, ${RAIO_CARTAO.toFixed(1)});
  float fora = smoothstep(0.0, 1.5, d);
  float queda = 1.0 - clamp(d / ${MARGEM_PX.toFixed(1)}, 0.0, 1.0);
  float respira = 0.85 + 0.15 * sin(uTime * 1.1);
  float brilho = fora * queda * queda * 0.35 * respira;
  // A highlight travelling the perimeter once every nine seconds.
  float ang = atan(p.y, p.x);
  float reflexo = pow(max(0.0, cos(ang - uTime * 0.6981)), 10.0);
  brilho += reflexo * fora * (1.0 - smoothstep(0.0, 10.0, d)) * 0.5;
  brilho *= uReveal * (1.0 + uExp * 0.9);
  gl_FragColor = vec4(uColour, clamp(brilho, 0.0, 1.0));
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
attribute vec4 aSeed;
attribute float aIdx;
varying vec2 vPos;
varying float vAlpha;
varying float vBack;
void main() {
  float th = aSeed.x * 6.2831853 + uTime * uSpeed * 6.2831853 * (0.6 + aSeed.w * 0.8);
  float vida = fract(aSeed.y + uTime * uRise * 0.012);
  float off = mix(uAfast.x, uAfast.y, vida) + sin(uExp * 3.14159) * 26.0 * aSeed.z;
  vec2 c = vec2(cos(th), sin(th));
  // A squarish superellipse, so the orbit hugs the card instead of cutting its corners.
  vec2 pos = vec2(
    sign(c.x) * pow(abs(c.x), 0.25) * (uHalf.x + off),
    sign(c.y) * pow(abs(c.y), 0.25) * (uHalf.y + off)
  );
  float z = sin(th + aSeed.z * 6.2831853);
  pos.y += z * 4.0;
  // Born at the corners, spreading to their orbit as the card settles.
  pos = mix(sign(pos) * uHalf, pos, uReveal);
  vPos = pos;
  vBack = z < 0.0 ? 1.0 : 0.0;
  float tw = 1.0 - uFlicker * (0.5 + 0.5 * sin(uTime * (2.0 + aSeed.w * 6.0) + aSeed.z * 30.0));
  float borda = sin(3.14159 * vida);
  float ativa = aIdx < uCount ? 1.0 : 0.0;
  vAlpha = tw * borda * (0.55 + 0.45 * (z * 0.5 + 0.5)) * ativa * uReveal * (1.0 + uExp * 0.6);
  gl_PointSize = uPx * uDpr * (0.75 + 0.5 * aSeed.w) * (1.0 + 0.3 * z) * (1.0 + 0.8 * sin(uExp * 3.14159));
  gl_Position = vec4(pos.x / (uSize.x * 0.5), -pos.y / (uSize.y * 0.5), 0.0, 1.0);
}
`;

const FRAGMENT_PONTOS = `
precision highp float;
uniform vec2 uHalf;
uniform vec3 uColour;
varying vec2 vPos;
varying float vAlpha;
varying float vBack;
${FUNCAO_CAIXA}
void main() {
  // Inside the outline is the card's face: the canvas never covers it.
  vec2 pc = vec2(vPos.x, vPos.y);
  if (sdCaixa(pc, uHalf, ${RAIO_CARTAO.toFixed(1)}) < 1.0) discard;
  float r = length(gl_PointCoord - 0.5);
  float disco = smoothstep(0.5, 0.05, r);
  float a = disco * vAlpha * (1.0 - 0.45 * vBack);
  gl_FragColor = vec4(mix(uColour, vec3(1.0), 0.35 * (1.0 - vBack)), a);
}
`;

export interface MolduraFeiticoProps {
  /** The day's leading element; null paints neutral gold. */
  readonly elemento: ElementoDoDia | null;
  /** The open day has all its cycles done: more particles. */
  readonly completo: boolean;
  /** The rail is moving: the frame is hidden and paused. */
  readonly rolando: boolean;
  /** A card is open (selecionado is inside the window). */
  readonly ativo: boolean;
  /** Changes with each conquered day; 0 is none. */
  readonly conquista: number;
  /** One still frame, no loop, no burst. */
  readonly reduzido: boolean;
}

interface Painel {
  sync: (quem: 'cor' | 'visao' | 'conquista' | 'densidade') => void;
}

const suave = (k: number) => 1 - (1 - k) ** 3;

export default function MolduraFeitico({
  elemento,
  completo,
  rolando,
  ativo,
  conquista,
  reduzido,
}: MolduraFeiticoProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const painelRef = useRef<Painel | null>(null);
  const propsRef = useRef({ elemento, completo, rolando, ativo, conquista });

  // Declared first: the effects below read the latest props through this ref.
  useEffect(() => {
    propsRef.current = { elemento, completo, rolando, ativo, conquista };
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
    let tempo = reduzido ? TEMPO_ESTATICO : 0;
    let mostrando = false;
    let corInicio = -1;
    let revelarInicio = -1;
    let explosaoInicio = -1;
    let paradaTimer = 0;
    let corJaDefinida = false;
    const corDe = new Color();
    const corPara = new Color();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);

    const uniforms = {
      uSize: { value: [196, 245] },
      uHalf: { value: [74, 98.5] },
      uTime: { value: 0 },
      uReveal: { value: reduzido ? 1 : 0 },
      uExp: { value: 0 },
      uColour: { value: new Color('#d6b66f') },
      uSpeed: { value: 0.05 },
      uAfast: { value: [4, 18] },
      uRise: { value: 0 },
      uPx: { value: 3 },
      uFlicker: { value: 0.3 },
      uCount: { value: PARTICULAS },
      uDpr: { value: dpr },
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

    // The same 96 seeds every time: the orbit is a pattern, not a dice roll.
    const sementes = new Float32Array(PARTICULAS_DIA_COMPLETO * 4);
    const indices = new Float32Array(PARTICULAS_DIA_COMPLETO);
    let estado = 20261109;
    const aleatorio = () => {
      estado = (estado * 1664525 + 1013904223) % 4294967296;
      return estado / 4294967296;
    };
    for (let i = 0; i < PARTICULAS_DIA_COMPLETO; i += 1) {
      sementes.set([aleatorio(), aleatorio(), aleatorio(), aleatorio()], i * 4);
      indices[i] = i;
    }
    const pontosGeo = new BufferGeometry();
    pontosGeo.setAttribute('position', new BufferAttribute(new Float32Array(PARTICULAS_DIA_COMPLETO * 3), 3));
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
    };

    const limitar = (valor: number) => Math.min(1, Math.max(0, valor));

    /** Advances the three tweens; each one is a uniform, never a rebuild. */
    const animar = (agora: number) => {
      if (revelarInicio >= 0) {
        const k = limitar((agora - revelarInicio) / DURATION.reveal);
        uniforms.uReveal.value = suave(k);
        if (k >= 1) revelarInicio = -1;
      }
      if (corInicio >= 0) {
        const k = limitar((agora - corInicio) / DURATION.settle);
        uniforms.uColour.value.copy(corDe).lerp(corPara, suave(k));
        if (k >= 1) corInicio = -1;
      }
      if (explosaoInicio >= 0) {
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
      if (passou < QUADRO_MS) return;
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

    const medir = () => {
      const largura = canvas.clientWidth;
      const altura = canvas.clientHeight;
      if (!largura || !altura || disposed) return;
      renderer.setSize(largura, altura, false);
      uniforms.uSize.value = [largura, altura];
      uniforms.uHalf.value = [largura / 2 - MARGEM_PX, altura / 2 - MARGEM_PX];
      draw();
    };

    const sync: Painel['sync'] = (quem) => {
      const p = propsRef.current;
      const agora = performance.now();

      if (quem === 'cor') {
        const config = configDoElemento(p.elemento);
        uniforms.uSpeed.value = config.velocidade;
        uniforms.uAfast.value = [config.afastamento[0], config.afastamento[1]];
        uniforms.uRise.value = config.subida;
        uniforms.uPx.value = config.tamanho;
        uniforms.uFlicker.value = config.cintilar;
        corPara.set(corDaMoldura(p.elemento, AURA));
        if (!corJaDefinida || reduzido || !mostrando) {
          uniforms.uColour.value.copy(corPara);
          corInicio = -1;
        } else {
          corDe.copy(uniforms.uColour.value);
          corInicio = agora;
        }
        corJaDefinida = true;
      }

      if (quem === 'densidade') {
        uniforms.uCount.value = p.completo ? PARTICULAS_DIA_COMPLETO : PARTICULAS;
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
          revelarInicio = reduzido ? -1 : agora;
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

  useEffect(() => { painelRef.current?.sync('cor'); }, [elemento, reduzido]);
  useEffect(() => { painelRef.current?.sync('densidade'); }, [completo, reduzido]);
  useEffect(() => { painelRef.current?.sync('visao'); }, [rolando, ativo, reduzido]);
  useEffect(() => { painelRef.current?.sync('conquista'); }, [conquista, reduzido]);

  return (
    <div
      ref={hostRef}
      className="reel-feitico"
      data-visivel={ativo && !rolando}
      data-modo="simples"
      aria-hidden="true"
    />
  );
}
