import { useEffect, useRef } from 'react';
import { MoonDisc } from '@/components/temporal/celestial/MoonDisc';
import { lunarLightDirection } from '@/components/temporal/celestial/lunar-presentation';
import { luzDaLua } from '@/lib/temporal/ceu-dos-ciclos';

/**
 * The Moon button's sky: one quad, one fragment shader, drawn once. The Moon
 * does not move, only its phase does, so there is no loop: the scene redraws
 * when the day, the hemisphere or the size changes and sleeps otherwise.
 *
 * three.js is imported on demand so Ciclos does not carry it. The CSS fallback
 * (sky, halo and MoonDisc under the canvas) is what shows while it loads, and
 * for good if WebGL is missing or the context is lost.
 */

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform vec2 uCentro;
uniform float uRaio;
uniform vec3 uLuz;
uniform float uHalo;
uniform float uEstrelas;
uniform float uTerra;
uniform float uSul;
uniform float uLimbo;
uniform float uNebulosa;
uniform float uLado;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// Two octaves are enough for maria at 50px of disc.
float fbm(vec2 p) {
  return noise(p) * 0.65 + noise(p * 2.07) * 0.35;
}

void main() {
  // Pixels from the top-left corner, in CSS px, whatever the pixel ratio.
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec3 col = mix(vec3(9.0, 13.0, 26.0), vec3(20.0, 27.0, 39.0), p.y / uRes.y) / 255.0;

  float dm = length(p - uCentro);

  // Nebula veil: a faint cold wash, easiest to see around a new moon.
  float veu = smoothstep(0.42, 0.9, fbm(p / 34.0 + vec2(5.3, 2.1)));
  col += vec3(0.07, 0.12, 0.27) * veu * uNebulosa * 0.9;

  // Stars on a 14px grid, a third of the cells, fewer as the Moon fills.
  vec2 cell = floor(p / 14.0);
  if (hash(cell) < 0.35) {
    vec2 at = (cell + vec2(hash(cell + 1.3), hash(cell + 7.1))) * 14.0;
    float r = mix(0.6, 1.2, hash(cell + 3.7));
    float star = smoothstep(r + 0.5, r - 0.2, length(p - at));
    float away = smoothstep(uRaio, uRaio * 3.0, dm);
    col += vec3(0.85, 0.9, 1.0) * star * (0.5 + 0.5 * hash(cell + 9.2)) * uEstrelas * away;
  }

  // Halo outside the limb.
  float halo = uHalo * exp(-max(dm - uRaio, 0.0) / (0.55 * uRaio));
  col += vec3(196.0, 210.0, 240.0) / 255.0 * halo * 0.55;
  // A thin cold ring hugging the limb, present in every phase.
  float fino = uHalo * exp(-max(dm - uRaio, 0.0) / 2.5) * smoothstep(uRaio - 1.0, uRaio + 0.5, dm);
  col += vec3(150.0, 190.0, 255.0) / 255.0 * fino * 0.35;

  if (dm < uRaio + 1.0) {
    vec2 n = (p - uCentro) / uRaio;
    n.y = -n.y;
    float z = sqrt(max(0.0, 1.0 - dot(n, n)));
    vec3 normal = vec3(n, z);
    float ndl = dot(normal, uLuz);
    float lit = smoothstep(-0.03, 0.12, ndl);

    // Maria: the dark patches, rotated half a turn in the south.
    float mare = smoothstep(0.45, 0.62, fbm(normal.xy * (uSul > 0.5 ? -2.2 : 2.2) + vec2(3.1, 1.7)));
    vec3 albedo = mix(1.0, 0.78, mare) * vec3(0.839, 0.835, 0.812);

    vec3 sun = albedo * (0.7 + 0.3 * clamp(ndl, 0.0, 1.0));
    // Earthshine: blue, and the maria stay readable through the albedo.
    vec3 dark = mix(vec3(0.125, 0.15, 0.2) * 0.8, albedo * vec3(88.0, 124.0, 196.0) / 255.0, clamp(uTerra * 3.6, 0.0, 0.85));
    vec3 disc = mix(dark, sun, lit);

    // Limb: a Fresnel rim on the sunward edge, never off, so a new moon still reads as a moon.
    float rim = pow(1.0 - z, 2.2);
    float lado = smoothstep(-0.25, 0.75, n.x * uLado / max(length(n), 0.001));
    disc += vec3(0.78, 0.85, 0.98) * rim * lado * uLimbo * 0.85;

    col = mix(col, disc, smoothstep(uRaio + 0.5, uRaio - 0.5, dm));
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

/** [left %, top %, delay factor, cycle factor]: kept clear of the disc at the right. */
const ESTRELAS: ReadonlyArray<readonly [number, number, number, number]> = [
  [8, 14, 0, 5], [21, 40, 2.3, 6], [34, 12, 4.1, 4.5], [47, 34, 1.2, 7],
  [57, 10, 3.4, 5.5], [14, 28, 5.2, 6.5], [40, 24, 0.7, 4],
];

export interface LuaTelaProps {
  readonly phaseAngle: number;
  readonly illuminated: number;
  readonly waxing: boolean;
  readonly south: boolean;
}

/** Disc placement from the right edge and top, in CSS px: phone, then 768px up. */
function astro(width: number) {
  const largo = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  return largo
    ? { x: width - 52, y: 36, raio: 30 }
    : { x: width - 38, y: 32, raio: 26 };
}

export function LuaTela({ phaseAngle, illuminated, waxing, south }: LuaTelaProps) {
  const janelaRef = useRef<HTMLDivElement>(null);
  const entradaRef = useRef({ phaseAngle, illuminated, waxing, south });
  const redesenharRef = useRef<(() => void) | null>(null);

  entradaRef.current = { phaseAngle, illuminated, waxing, south };

  // The scene is built once; every later change is a uniform write and one draw.
  useEffect(() => {
    const janela = janelaRef.current;
    if (!janela) return undefined;

    let cancelado = false;
    let limpar = () => {};
    const modo = (valor: '3d' | 'simple') => {
      if (janelaRef.current) janelaRef.current.dataset.modo = valor;
    };

    void import('three').then((THREE) => {
      if (cancelado) return;

      // A fresh canvas per run: forceContextLoss() on cleanup leaves the old one
      // without a context, and StrictMode would hand that same node back to three.
      const canvas = document.createElement('canvas');
      canvas.className = 'ceu-tela';
      canvas.setAttribute('aria-hidden', 'true');
      janela.appendChild(canvas);

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: false, powerPreference: 'low-power' });
      } catch {
        canvas.remove();
        return;
      }

      let perdido = false;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uCentro: { value: new THREE.Vector2(0, 0) },
          uRaio: { value: 26 },
          uLuz: { value: new THREE.Vector3(0, 0, 1) },
          uHalo: { value: 0.1 },
          uEstrelas: { value: 1 },
          uTerra: { value: 0 },
          uSul: { value: 0 },
          uLimbo: { value: 1 },
          uNebulosa: { value: 1 },
          uLado: { value: 1 },
        },
      });
      const quad = new THREE.Mesh(geometry, material);
      // Written straight to clip space, so three would cull it otherwise.
      quad.frustumCulled = false;
      scene.add(quad);

      const desenhar = () => {
        const largura = canvas.clientWidth;
        const altura = canvas.clientHeight;
        if (cancelado || perdido || !largura || !altura) return;

        const entrada = entradaRef.current;
        const luz = luzDaLua(entrada, entrada.south);
        const [lx, ly, lz] = lunarLightDirection(entrada.phaseAngle, entrada.waxing);
        const sinal = entrada.south ? -1 : 1;
        const lugar = astro(largura);

        renderer.setSize(largura, altura, false);
        const u = material.uniforms;
        (u.uRes.value as InstanceType<typeof THREE.Vector2>).set(largura, altura);
        (u.uCentro.value as InstanceType<typeof THREE.Vector2>).set(lugar.x, lugar.y);
        u.uRaio.value = lugar.raio;
        (u.uLuz.value as InstanceType<typeof THREE.Vector3>).set(lx * sinal, ly * sinal, lz);
        u.uHalo.value = luz.halo;
        u.uEstrelas.value = luz.estrelas;
        u.uTerra.value = luz.terra;
        u.uSul.value = entrada.south ? 1 : 0;
        u.uLimbo.value = luz.limbo;
        u.uNebulosa.value = luz.nebulosa;
        u.uLado.value = luz.lado === 90 ? 1 : -1;
        renderer.render(scene, camera);
        modo('3d');
      };

      const aoPerder = (evento: Event) => {
        evento.preventDefault();
        perdido = true;
        modo('simple');
      };
      const observador = new ResizeObserver(desenhar);
      canvas.addEventListener('webglcontextlost', aoPerder);
      observador.observe(canvas);
      redesenharRef.current = desenhar;
      desenhar();

      limpar = () => {
        redesenharRef.current = null;
        canvas.removeEventListener('webglcontextlost', aoPerder);
        observador.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    });

    return () => {
      cancelado = true;
      limpar();
    };
  }, []);

  useEffect(() => {
    redesenharRef.current?.();
  }, [phaseAngle, illuminated, waxing, south]);

  const luz = luzDaLua({ illuminated, waxing }, south);

  return (
    <div
      ref={janelaRef}
      className="ceu-janela"
      data-modo="simple"
      aria-hidden="true"
      style={{ '--lua-halo': luz.halo.toFixed(3), '--lua-estrelas': luz.estrelas.toFixed(3) } as React.CSSProperties}
    >
      <div className="ceu-fundo ceu-fundo-lua">
        <span className="ceu-lua-disco"><MoonDisc phaseAngle={phaseAngle} waxing={waxing} south={south} /></span>
      </div>
      {/* Twinkle: a few CSS stars over the one-shot shader; the CSS stops them for reduced motion. */}
      <div className="ceu-estrelas">
        {ESTRELAS.map((e, i) => (
          <span key={i} className="ceu-estrela" style={{ left: `${e[0]}%`, top: `${e[1]}%`, '--e-atraso': `${e[2]}`, '--e-ciclo': `${e[3]}` } as React.CSSProperties} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
