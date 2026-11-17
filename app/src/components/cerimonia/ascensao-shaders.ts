/**
 * GLSL of the "Ascension": the sparks that are born at the tip of the ring and
 * spiral upwards, the burst that flies into the seal, the tip itself and the
 * shock rings on the floor.
 *
 * Nothing here is simulated on the CPU. Every particle is a pure function of
 * the scene clock `uT` (milliseconds since the scene mounted) and of four
 * random seeds drawn once, so a frame costs a handful of uniforms and no
 * allocation. World units are CSS pixels, the camera sits where the z = 0 plane
 * maps one to one onto the screen, and `z` only adds depth: parallax and the
 * size falling off with distance.
 */

/** Shared by the particle vertex shaders: the world, the ring and the clock. */
const COMUM = /* glsl */ `
uniform float uT;
uniform vec2 uTela;
uniform vec2 uCentro;
uniform vec2 uR;
uniform float uEsc;
uniform float uDist;
uniform vec2 uLut[65];
attribute vec4 aSeed;
varying vec3 vCor;
varying float vA;

float sorte(float x) { return fract(sin(x * 127.1 + 311.7) * 43758.5453); }

vec3 mundo(vec2 px, float z) { return vec3(px.x - uTela.x * 0.5, uTela.y * 0.5 - px.y, z); }

// A point of the ring (unit coordinates, y down) at a fraction 0..1 of its length.
vec2 anel(float f) {
  float x = clamp(f, 0.0, 1.0) * 64.0;
  int i = int(min(floor(x), 63.0));
  return mix(uLut[i], uLut[i + 1], x - float(i));
}

void esconder() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  gl_PointSize = 0.0;
  vA = 0.0;
  vCor = vec3(0.0);
}
`;

const QUENTE = /* glsl */ `vec3(1.0, 0.95, 0.82)`;

/**
 * The sparks: born at the tip while it runs round the ring (the ring fills at
 * `uFill.z .. 1` along the same curve as the SVG), each rising in a spiral
 * with a light gravity. Their cycles are random, and the birth rate grows as
 * the fill speeds up.
 */
export const FAISCAS_VERTEX = /* glsl */ `
${COMUM}
uniform vec3 uFill;   // x: instant the fill starts (ms), y: how long it lasts, z: fraction it starts from
uniform vec2 uCurva;  // the fill curve: straight part, squared part
uniform vec3 uCor;

void main() {
  float P = 650.0 + 700.0 * aSeed.z;
  float O = aSeed.x * P;
  float k = floor((uT - uFill.x - O) / P);
  float tb = uFill.x + O + k * P;
  float idade = uT - tb;
  float vida = idade / (0.85 * P);
  float tn = clamp((tb - uFill.x) / uFill.y, 0.0, 1.0);
  float gate = mix(0.3, 1.0, tn);
  bool vivo = k >= 0.0 && tb <= uFill.x + uFill.y && vida < 1.0 && sorte(aSeed.y * 57.3 + k * 19.17) < gate;
  if (!vivo) { esconder(); return; }

  float a = idade * 0.001;
  float f = uFill.z + (1.0 - uFill.z) * (uCurva.x * tn + uCurva.y * tn * tn);
  vec2 base = uCentro + anel(f) * uR;

  // Spiral around a vertical axis through the birth point, rising and slowing.
  float fase = aSeed.w * 6.2831 + a * (5.0 + 5.0 * aSeed.y);
  float raio = (6.0 + 26.0 * aSeed.y) * (0.2 + a);
  float subida = (80.0 + 120.0 * aSeed.z) * a - 70.0 * a * a;
  vec2 p = base + vec2(sin(fase) * raio, -subida);
  float z = cos(fase) * raio;
  // Turbulence: two incommensurable waves, stronger as the spark ages.
  p += vec2(sin(a * 11.0 + aSeed.x * 40.0), cos(a * 9.0 + aSeed.w * 40.0)) * 5.0 * a;

  vec4 mv = modelViewMatrix * vec4(mundo(p, z), 1.0);
  gl_Position = projectionMatrix * mv;
  float tam = (3.0 + 7.0 * aSeed.y * aSeed.y) * (0.3 + 0.7 * (1.0 - vida)) * (0.82 + 0.18 * sin(idade * 0.04 + aSeed.x * 30.0));
  gl_PointSize = clamp(tam * uEsc * uDist / (-mv.z), 1.0, 96.0);
  vCor = mix(${QUENTE}, uCor, smoothstep(0.0, 0.45, vida));
  vA = smoothstep(0.0, 0.08, vida) * pow(1.0 - vida, 0.6);
}
`;

/**
 * The burst when the ring closes: from random points of the ring the
 * particles shoot up and out, then curve in, spinning, and converge on the seal
 * (`uAlvo`) to arrive together at `uConv`.
 */
export const EXPLOSAO_VERTEX = /* glsl */ `
${COMUM}
uniform float uClose;
uniform float uConv;  // ms the flight to the seal takes
uniform vec2 uAlvo;
uniform vec3 uCor;

void main() {
  float a = (uT - uClose) * 0.001;
  float chegada = uConv * 0.001 * (0.78 + 0.22 * aSeed.w);
  if (a < 0.0 || a > chegada) { esconder(); return; }

  vec2 pr = anel(aSeed.x);
  vec2 p0 = uCentro + pr * uR;
  float vSobe = 150.0 + 330.0 * aSeed.y;
  float vx = pr.x * (90.0 + 170.0 * aSeed.z);
  float vz = (aSeed.w - 0.5) * 320.0;
  float tc = 0.30 + 0.30 * aSeed.z;
  float ac = min(a, tc);
  vec2 pf = p0 + vec2(vx * ac * (1.0 - 0.3 * ac), -(vSobe * ac - 130.0 * ac * ac));
  float zf = vz * ac;

  float s = clamp((a - tc) / (chegada - tc), 0.0, 1.0);
  float e = s * s;
  vec2 d = uAlvo - pf;
  vec2 perp = vec2(-d.y, d.x) / max(length(d), 1.0);
  float giro = sin(s * 3.14159) * (1.0 - e) * (40.0 + 80.0 * aSeed.y) * (aSeed.x < 0.5 ? 1.0 : -1.0);
  vec2 p = mix(pf, uAlvo, e) + perp * giro;
  float z = mix(zf, 0.0, e);

  vec4 mv = modelViewMatrix * vec4(mundo(p, z), 1.0);
  gl_Position = projectionMatrix * mv;
  float tam = (4.0 + 8.0 * aSeed.y) * (1.0 - 0.55 * e) * (0.85 + 0.15 * sin(a * 30.0 + aSeed.x * 20.0));
  gl_PointSize = clamp(tam * uEsc * uDist / (-mv.z), 1.0, 96.0);
  vec3 ouro = vec3(1.0, 0.86, 0.5);
  vCor = mix(mix(${QUENTE}, uCor, smoothstep(0.0, 0.4, a)), ouro, e);
  vA = smoothstep(0.0, 0.05, a) * (1.0 - smoothstep(0.85, 1.0, s));
}
`;

/** A soft round sprite: a white-hot core, a halo of the point's colour. Additive. */
export const PARTICULA_FRAGMENT = /* glsl */ `
varying vec3 vCor;
varying float vA;

void main() {
  vec2 c = gl_PointCoord * 2.0 - 1.0;
  float d = dot(c, c);
  if (d > 1.0) discard;
  float nucleo = exp(-d * 7.0);
  float halo = (1.0 - d) * (1.0 - d);
  vec3 cor = mix(vCor, vec3(1.0, 0.97, 0.88), nucleo * 0.85);
  gl_FragColor = vec4(cor, (nucleo + 0.5 * halo) * vA);
}
`;

/** The glowing tip that runs round the ring: one big point at `uPonta`. */
export const PONTA_VERTEX = /* glsl */ `
uniform vec2 uTela;
uniform vec2 uPonta;
uniform float uTam;
uniform float uEsc;
uniform float uDist;
uniform float uIntens;
varying vec3 vCor;
varying float vA;
uniform vec3 uCor;

void main() {
  vec4 mv = modelViewMatrix * vec4(uPonta.x - uTela.x * 0.5, uTela.y * 0.5 - uPonta.y, 0.0, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = clamp(uTam * uEsc * uDist / (-mv.z), 1.0, 128.0) * step(0.001, uIntens);
  vCor = uCor;
  vA = uIntens;
}
`;

/** The quad that holds the shock rings: it only draws the ellipses, so it is thin. */
export const ONDAS_VERTEX = /* glsl */ `
uniform vec2 uTela;
uniform vec2 uCentro;
uniform vec2 uQuad;
varying vec2 vPx;

void main() {
  vPx = position.xy * uQuad;
  vec2 mundo = vec2(uCentro.x - uTela.x * 0.5, uTela.y * 0.5 - uCentro.y) + vPx;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(mundo, 0.0, 1.0);
}
`;

/**
 * Three rings of shock expanding on the floor in the ring's own perspective
 * (the same 7 : 1 ellipse), the glow the filled ring pours on the floor, and
 * the flare at the instant it closes.
 */
export const ONDAS_FRAGMENT = /* glsl */ `
uniform float uT;
uniform float uClose;
uniform vec2 uR;
uniform vec3 uCor;
uniform float uFracao;
varying vec2 vPx;

void main() {
  float depois = (uT - uClose) * 0.001;
  float acc = 0.0;
  for (int i = 0; i < 3; i++) {
    float tau = depois - float(i) * 0.14;
    float pr = tau / 0.95;
    if (tau > 0.0 && pr < 1.0) {
      float s = 1.0 + 3.1 * (1.0 - pow(1.0 - pr, 3.0));
      float d = length(vPx / (uR * s));
      float larg = 0.1 + 0.06 * pr;
      float q = (d - 1.0) / larg;
      float linha = exp(-q * q);
      acc += linha * pow(1.0 - pr, 1.4) * (1.0 - 0.2 * float(i));
    }
  }
  float d1 = length(vPx / (uR * 1.15));
  float chao = (1.0 - smoothstep(0.0, 1.0, d1)) * uFracao * 0.22;
  float clarao = clamp(1.0 - depois * 1.4, 0.0, 1.0) * step(0.0, depois);
  chao += clarao * (1.0 - smoothstep(0.0, 1.0, d1)) * 0.8;
  vec3 cor = uCor * (acc * 1.2 + chao) + vec3(1.0, 0.95, 0.85) * acc * acc * 0.6;
  gl_FragColor = vec4(cor, clamp(acc + chao, 0.0, 1.0));
}
`;
