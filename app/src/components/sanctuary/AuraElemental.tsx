import { useEffect, useRef } from 'react';
import {
  AdditiveBlending,
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import type { ZodiacModality } from '@/lib/sanctuary/zodiac';
import './aura-elemental.css';

/**
 * The aura around the character: light that belongs to the person, not to the
 * app. Its colour comes from their sign, its reach from their level.
 *
 * Drawn as one shader over a quad rather than as geometry. An aura is a field,
 * not an object — there is nothing to model, and a fragment shader is both the
 * honest way to express it and the one that costs a single draw call on a
 * phone.
 */

/** How the three modalities move. Cardinal drives, fixed holds, mutable shifts. */
const MOTION: Record<ZodiacModality, { rise: number; turbulence: number; pulse: number }> = {
  cardeal: { rise: 0.34, turbulence: 0.5, pulse: 1.5 },
  fixo: { rise: 0.19, turbulence: 0.3, pulse: 0.9 },
  mutavel: { rise: 0.27, turbulence: 0.85, pulse: 2.1 },
};

const VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/**
 * Brightest alpha the aura can reach (0..1). The soft curve saturates here, so
 * this is the one number to nudge by eye: 0.9 is bright, 0.8 is subtler.
 */
const AURA_PEAK = 0.9;

const FRAGMENT = `
precision highp float;
#define AURA_PEAK ${AURA_PEAK.toFixed(3)}
varying vec2 vUv;
uniform float uTime;
uniform vec3 uColour;
uniform float uScale;
uniform float uRise;
uniform float uTurbulence;
uniform float uPulse;

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

float fbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int octave = 0; octave < 4; octave++) {
    total += noise(p) * amplitude;
    p *= 2.03;
    amplitude *= 0.5;
  }
  return total;
}

void main() {
  // The quad is twice the body on each axis, so the body's own outline sits
  // at d = 1 and the field has room to burn out before the canvas edge --
  // otherwise the glow is cut off in a straight line and reads as a box.
  vec2 p = (vUv - vec2(0.5)) / (vec2(0.25) * uScale);
  float d = length(p);

  // Tongues of light climbing. The second fbm warps the first, which is what
  // keeps them from reading as stripes scrolling past.
  vec2 q = vec2(vUv.x * 3.6, vUv.y * 2.6 - uTime * uRise);
  float warped = fbm(q + fbm(q * 1.9) * uTurbulence);
  float tongues = smoothstep(0.26, 0.74, warped);

  // The aura lives OUTSIDE the silhouette: anything bright behind the body is
  // light the person's own sprite hides, so the shell starts at the outline.
  float shell = smoothstep(0.88, 1.14, d) * (1.0 - smoothstep(1.18, 1.92, d));
  float bloom = (1.0 - smoothstep(0.92, 1.96, d)) * 0.26;

  // Thinner overhead than at the feet, the way heat leaves a body.
  float climb = mix(1.0, 0.32, smoothstep(0.40, 0.92, vUv.y));

  float field = (shell * (0.30 + 1.45 * tongues) + bloom) * climb;
  float breath = 0.88 + 0.12 * sin(uTime * uPulse);

  // Soft tone-mapping instead of a hard clamp: the raw field reaches ~1.95 and
  // clamping flattened everything above 1 into a plateau of one flat colour.
  // The curve keeps a slope near 1 for the weak parts and saturates at AURA_PEAK.
  float a = AURA_PEAK * (1.0 - exp(-1.2 * field * breath));

  // Fade out before the quad's edge so the glow never ends in a straight line.
  vec2 edge = abs(vUv - 0.5) * 2.0;
  a *= (1.0 - smoothstep(0.78, 1.0, edge.x)) * (1.0 - smoothstep(0.78, 1.0, edge.y));

  gl_FragColor = vec4(uColour * a, a);
}
`;

export interface AuraElementalProps {
  /** Hex from the person's sign. */
  readonly colour: string;
  /** Reach, from their level. */
  readonly scale: number;
  readonly modality: ZodiacModality;
  /** Still, for anyone who asked for less movement. */
  readonly reducedMotion?: boolean;
  readonly className?: string;
}

export default function AuraElemental({
  colour,
  scale,
  modality,
  reducedMotion = false,
  className,
}: AuraElementalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<ShaderMaterial['uniforms'] | null>(null);

  /**
   * `data-mode` only tells the stylesheet whether the shader is carrying the
   * aura or the gradient is. Nothing in React reads it, so it is written to
   * the node instead of held in state, and the scene never re-renders to
   * announce that WebGL started.
   */
  const setMode = (mode: '3d' | 'simple') => {
    if (wrapRef.current) wrapRef.current.dataset.mode = mode;
  };

  // The shader is built once; colour, reach and motion arrive as uniforms, so
  // changing a sign or gaining a level never rebuilds the scene.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return;
    }

    let disposed = false;
    let lost = false;
    let frame = 0;
    let visible = true;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        // Neutral until the effect below writes the person's own values, which
        // happens in the same commit, before anything is painted.
        uTime: { value: 0 },
        uColour: { value: new Color('#ffffff') },
        uScale: { value: 1 },
        uRise: { value: MOTION[modality].rise },
        uTurbulence: { value: MOTION[modality].turbulence },
        uPulse: { value: MOTION[modality].pulse },
      },
    });
    uniformsRef.current = material.uniforms;
    const quad = new Mesh(geometry, material);
    // The quad is written straight to clip space by the vertex shader, so it
    // sits on top of the camera in world terms and three would cull it before
    // ever drawing: no error, a healthy context, and an empty canvas.
    quad.frustumCulled = false;
    scene.add(quad);

    const draw = (seconds: number) => {
      if (disposed || lost) return;
      material.uniforms.uTime.value = seconds;
      renderer.render(scene, camera);
    };

    const resize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height || disposed) return;
      renderer.setSize(width, height, false);
      draw(material.uniforms.uTime.value);
    };

    const start = performance.now();
    const loop = (now: number) => {
      draw((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };

    // A still aura is a lit one, not a missing one: reduced motion draws the
    // field once and leaves it there.
    const play = () => {
      if (frame || disposed || lost || reducedMotion || !visible || document.hidden) return;
      frame = requestAnimationFrame(loop);
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      stop();
      setMode('simple');
    };

    const onVisibility = () => (document.hidden ? stop() : play());
    const observer = new ResizeObserver(resize);
    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) play();
      else stop();
    });

    canvas.addEventListener('webglcontextlost', onContextLost);
    document.addEventListener('visibilitychange', onVisibility);
    observer.observe(canvas);
    onScreen.observe(canvas);

    resize();
    setMode('3d');
    if (reducedMotion) draw(0);
    else play();

    return () => {
      disposed = true;
      stop();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      onScreen.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      uniformsRef.current = null;
    };
  }, [modality, reducedMotion]);

  // Colour and reach change far more often than the scene does.
  useEffect(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;
    (uniforms.uColour.value as Color).set(colour);
    uniforms.uScale.value = scale;
  }, [colour, scale]);

  return (
    <div
      ref={wrapRef}
      className={className ? `aura-elemental ${className}` : 'aura-elemental'}
      data-mode="simple"
      aria-hidden="true"
      style={{ '--aura-cor': colour, '--aura-escala': scale } as React.CSSProperties}
    >
      <canvas ref={canvasRef} className="aura-elemental-tela" />
    </div>
  );
}
