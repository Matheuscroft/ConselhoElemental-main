/**
 * GLSL for the Sanctuary's four orbs. Every program is the same source built
 * with `#define ELEM n` (1 fire, 2 water, 3 air, anything else earth), so each
 * element has its own surface and its own particles without branching at run
 * time. Output is premultiplied alpha, to match a canvas with
 * `premultipliedAlpha: true`, and colours are written as sRGB (no colour management).
 *
 * Geometry: a quad centred on the orb. `vP` is the position in "art units":
 * the 1254px artwork spans -0.5..0.5, and the quad is K times larger so the
 * halo has room. The sphere body is the disc of radius R inside the art.
 */

/** The quad is this many times the artwork's side; the halo lives in the margin. */
export const MARGEM_DO_QUAD = 1.9;
/** Radius of the sphere body, in art units (the art's side is 1). */
export const RAIO_DA_ESFERA = 0.41;

export function comElemento(fonte: string, codigo: number): string {
  return `#define ELEM ${codigo}\n${fonte}`;
}

export const ORBE_VERTEX = /* glsl */ `
uniform vec2 uTela;
uniform vec2 uCentro;
uniform float uArt;
varying vec2 vP;

void main() {
  vP = position.xy * ${MARGEM_DO_QUAD.toFixed(2)};
  vec2 px = uCentro + vec2(position.x, -position.y) * uArt * ${MARGEM_DO_QUAD.toFixed(2)};
  gl_Position = vec4(px.x / uTela.x * 2.0 - 1.0, 1.0 - px.y / uTela.y * 2.0, 0.0, 1.0);
}
`;

const RUIDO = /* glsl */ `
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.7);
    a *= 0.5;
  }
  return v / 0.875;
}
`;

export const ESFERA_FRAGMENT = /* glsl */ `
uniform sampler2D uTex;
uniform float uTemTex;
uniform float uT;
uniform vec3 uCor;
uniform vec3 uBrilho;
uniform vec3 uNevoa;
uniform float uProf;
uniform float uFoco;
varying vec2 vP;

#define R ${RAIO_DA_ESFERA.toFixed(2)}
${RUIDO}

void main() {
  vec2 p = vP;
  vec2 q = p / R;
  float r = length(q);
  float r2 = r * r;
  float t = uT;
  // 1 in the middle of the disc, 0 at its edge: surface motion never reaches the outline.
  float inner = 1.0 - smoothstep(0.55, 0.97, r);

  vec2 d = vec2(0.0);
#if ELEM == 1
  vec2 f = q * 2.2 + vec2(0.0, -t * 0.55);
  d = (vec2(fbm(f), fbm(f + vec2(5.2, 1.3))) - 0.5) * 0.05;
  d.y += 0.006 * sin(t * 2.0 + q.x * 5.0);
#elif ELEM == 2
  d = vec2(sin(q.y * 6.0 + t * 1.1), cos(q.x * 6.0 + t * 0.9)) * 0.006;
  d += (vec2(vnoise(q * 3.0 + t * 0.25), vnoise(q * 3.0 + 7.0 - t * 0.2)) - 0.5) * 0.024;
  d -= p * 0.06 * (1.0 - r2);
#elif ELEM == 3
  float giro = (0.12 * sin(t * 0.45) + t * 0.06) * (1.0 - min(r, 1.0));
  mat2 rot = mat2(cos(giro), -sin(giro), sin(giro), cos(giro));
  d = rot * p - p;
  d += (vec2(fbm(q * 2.0 + t * 0.15), fbm(q * 2.0 + 3.1 - t * 0.12)) - 0.5) * 0.024;
#else
  d = (vec2(vnoise(q * 5.0 + t * 0.05), vnoise(q * 5.0 + 9.0 - t * 0.04)) - 0.5) * 0.008;
#endif

  vec2 uv = p + d * inner + 0.5;
  vec2 dentro = step(vec2(0.0), uv) * step(uv, vec2(1.0));

  // Albedo: the artwork (stored premultiplied) or, if it never loaded, a procedural sphere.
  vec3 col;
  float a;
  if (uTemTex > 0.5) {
    vec4 tx = texture2D(uTex, uv);
    a = tx.a * dentro.x * dentro.y;
    col = tx.rgb / max(tx.a, 0.001);
  } else {
    float body = 1.0 - smoothstep(0.96, 1.0, r);
    float n = fbm(q * 3.0 + t * 0.1);
    float nz0 = sqrt(max(0.0, 1.0 - r2));
#if ELEM == 1
    col = mix(vec3(0.75, 0.18, 0.04), vec3(1.0, 0.82, 0.3), nz0 * (0.6 + 0.6 * n));
#elif ELEM == 2
    col = mix(vec3(0.03, 0.22, 0.5), vec3(0.45, 0.88, 1.0), nz0 * (0.5 + 0.7 * n));
#elif ELEM == 3
    col = mix(vec3(0.5, 0.62, 0.72), vec3(0.95, 0.99, 1.0), nz0 * (0.6 + 0.5 * n));
#else
    col = mix(vec3(0.2, 0.16, 0.12), vec3(0.62, 0.5, 0.36), nz0 * (0.5 + 0.7 * n));
#endif
    a = body;
  }

  // Sphere normal rebuilt from the position; outside the disc it clamps to the silhouette.
  vec2 nq = r > 1.0 ? q / r : q;
  float nz = sqrt(max(0.0, 1.0 - dot(nq, nq)));
  vec3 n = vec3(nq, nz);
  vec3 L = normalize(vec3(-0.55, 0.6, 0.65));
  float lam = dot(n, L) * 0.5 + 0.5;
  col *= 0.8 + 0.4 * lam;

  float corpo = 1.0 - smoothstep(1.0, 1.2, r);
  float fres = pow(1.0 - nz, 2.2);
  float rim = fres * (0.32 + 0.95 * uFoco + 0.25 * max(uProf, 0.0)) * corpo;

  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float spec = pow(max(dot(n, H), 0.0), 52.0) * corpo;

  vec3 emis = vec3(0.0);
#if ELEM == 1
  float heat = fbm(q * 3.0 + vec2(0.0, -t * 0.8));
  float pulso = 0.5 + 0.5 * sin(t * 1.9 + heat * 6.0);
  float lum = dot(col, vec3(0.3, 0.59, 0.11));
  emis = uBrilho * heat * heat * pulso * 0.6 * inner * (0.4 + lum);
  col *= 1.0 + 0.1 * sin(t * 2.6);
  spec *= 0.35;
#elif ELEM == 2
  float c1 = 1.0 - abs(vnoise(q * 4.5 + vec2(t * 0.22, -t * 0.17)) * 2.0 - 1.0);
  float c2 = 1.0 - abs(vnoise(q * 5.8 + vec2(-t * 0.19, t * 0.25) + 4.0) * 2.0 - 1.0);
  float caus = pow(c1, 10.0) + pow(c2, 10.0) * 0.7;
  emis = vec3(0.6, 0.95, 1.0) * caus * 0.5 * inner;
  spec *= 0.8;
  spec += pow(max(dot(n, normalize(vec3(0.5, -0.4, 0.8))), 0.0), 90.0) * 0.25 * corpo;
#elif ELEM == 3
  float ang = atan(q.y, q.x);
  float s = ang * 3.0 + log(max(r, 0.05)) * 6.0 - t * 0.9;
  float fio = pow(0.5 + 0.5 * sin(s + 2.0 * fbm(q * 2.5 + t * 0.1)), 6.0);
  emis = vec3(0.88, 0.96, 1.0) * fio * 0.5 * inner * smoothstep(0.1, 0.35, r);
  spec *= 0.5;
#else
  float v = fbm(q * 3.2 + 1.7);
  float veio = pow(1.0 - abs(v * 2.0 - 1.0), 6.0);
  float lento = 0.55 + 0.45 * sin(t * 0.5 + v * 5.0);
  emis = vec3(1.0, 0.78, 0.3) * veio * lento * 0.9 * inner;
  spec *= 0.2;
#endif

  col += uCor * rim + vec3(1.0, 0.97, 0.92) * spec * 0.4;

  // Depth: behind is dimmer, paler and hazier; in front is brighter. Never hidden.
  float tras = clamp(-uProf, 0.0, 1.0);
  float frente = clamp(uProf, 0.0, 1.0);
  col *= 1.0 - 0.3 * tras + 0.1 * frente;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(vec3(luma), col, 1.0 - 0.38 * tras + 0.08 * frente);
  col = mix(col, uNevoa, 0.2 * tras);
  emis *= 1.0 - 0.5 * tras;

  vec3 rgb = (col + emis) * a;
  rgb = min(rgb, vec3(a));
  gl_FragColor = vec4(rgb, a);
}
`;

export const HALO_FRAGMENT = /* glsl */ `
uniform float uT;
uniform vec3 uCor;
uniform vec3 uBrilho;
uniform float uProf;
uniform float uFoco;
uniform float uCarga;
varying vec2 vP;

#define R ${RAIO_DA_ESFERA.toFixed(2)}

void main() {
  float d = length(vP) / R;
  float h = exp(-max(d - 0.75, 0.0) * 2.1);
  h *= 1.0 - smoothstep(1.5, 2.3, d);
  float pulso = uCarga * (0.5 + 0.5 * sin(uT * 1.4));
  float k = 0.3 + 0.55 * uFoco + 0.16 * max(uProf, 0.0) - 0.1 * max(-uProf, 0.0) + 0.55 * pulso;
  k *= 1.0 + 0.08 * sin(uT * 0.9);
#if ELEM != 1
  k *= 1.45;
#endif
  vec3 rgb = mix(uCor, uBrilho, 0.55) * h * max(k, 0.0);
  gl_FragColor = vec4(rgb, max(rgb.r, max(rgb.g, rgb.b)));
}
`;

export const PARTICULA_VERTEX = /* glsl */ `
attribute vec4 aSeed;
uniform vec2 uTela;
uniform vec2 uCentro;
uniform float uArt;
uniform float uT;
uniform float uEsc;
uniform float uProf;
uniform float uFoco;
varying float vA;

#define TAU 6.28318

float fr(float x) { return x - floor(x); }

void main() {
  float t = uT;
  float s0 = aSeed.x;
  float s1 = aSeed.y;
  float s2 = aSeed.z;
  float s3 = aSeed.w;
  vec2 o;
  float a;
  float sz;
#if ELEM == 1
  float f = fr(s0 + t * (0.1 + 0.12 * s1));
  o = vec2((s2 - 0.5) * 0.75 + sin(t * 1.7 + s3 * TAU) * 0.05 * f, -0.22 + f * 0.95);
  a = sin(3.14159 * f);
  sz = mix(1.0, 0.35, f) * (0.6 + 0.8 * s3);
#elif ELEM == 2
  float f = fr(s0 + t * (0.05 + 0.06 * s1));
  o = vec2((s2 - 0.5) * 0.8 + sin(t * 1.1 + s3 * TAU) * 0.04, -0.45 + f * 0.95);
  a = sin(3.14159 * f) * 0.9;
  sz = 0.8 + 1.2 * s3;
#elif ELEM == 3
  float ang = s2 * TAU + t * (0.45 + 0.5 * s1);
  float rad = 0.52 + 0.14 * s3 + 0.06 * sin(t * 0.8 + s0 * TAU);
  o = vec2(cos(ang) * rad, sin(ang) * rad * 0.42 + (s0 - 0.5) * 0.3);
  a = 0.35 + 0.4 * (0.5 + 0.5 * sin(ang));
  sz = 0.5 + 0.7 * s1;
#else
  float ang = s2 * TAU + t * 0.08 * (0.5 + s1);
  float rad = 0.52 + 0.22 * s3;
  o = vec2(cos(ang) * rad, sin(ang) * rad * 0.8);
  float tw = 0.5 + 0.5 * sin(t * (1.0 + s1 * 1.5) + s0 * 20.0);
  a = 0.25 + 0.75 * tw * tw;
  sz = 0.5 + 0.7 * s1;
#endif
  vec2 px = uCentro + vec2(o.x, -o.y) * uArt;
  gl_Position = vec4(px.x / uTela.x * 2.0 - 1.0, 1.0 - px.y / uTela.y * 2.0, 0.0, 1.0);
  gl_PointSize = max(1.0, sz * uArt * 0.085 * uEsc * (0.9 + 0.3 * max(uProf, 0.0)));
  vA = a * (1.0 - 0.35 * clamp(-uProf, 0.0, 1.0)) * (0.7 + 0.5 * uFoco);
}
`;

export const PARTICULA_FRAGMENT = /* glsl */ `
uniform vec3 uBrilho;
varying float vA;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float suave = 1.0 - d;
  if (suave <= 0.0) discard;
  float g = suave * suave;
  float nucleo = pow(suave, 6.0);
#if ELEM == 2
  float anel = smoothstep(0.5, 0.78, d) * (1.0 - smoothstep(0.78, 1.0, d));
  g = g * 0.25 + anel * 0.8;
#endif
  vec3 col = mix(uBrilho, vec3(1.0), nucleo * 0.7);
  float k = clamp((g + nucleo) * vA, 0.0, 1.0);
  gl_FragColor = vec4(col * k, k);
}
`;
