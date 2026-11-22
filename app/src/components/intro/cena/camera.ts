import { PerspectiveCamera, Vector3 } from 'three/webgpu';

/**
 * Camera shots from the Blender previs, re-solved for whatever screen the phone has.
 *
 * A shot says: look at these points from this azimuth and elevation, with this lens, so that they
 * take this fraction of the screen WIDTH and sit at this height. Solving it per aspect ratio keeps the
 * book at the same share of a 390 × 844 iPhone, an iPhone SE or a 20:9 Android, instead of cropping a
 * 9:16 frame.
 */

export interface Plano {
  /** Azimuth and elevation in degrees, Blender convention (az in the ground plane, el above it). */
  readonly az: number;
  readonly el: number;
  /** Vertical field of view in degrees (portrait). */
  readonly fov: number;
  /** Fraction of the screen width the points should span. */
  readonly largura: number;
  /** Where the centre of the points sits, 0 = bottom, 1 = top. */
  readonly centroV: number;
}

export interface Enquadramento { readonly pos: Vector3; readonly alvo: Vector3; readonly fov: number }

const tmp = new Vector3();

export function direcao(az: number, el: number): Vector3 {
  const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180;
  // Blender (x, y, z) → three (x, z, -y)
  return new Vector3(Math.cos(e) * Math.cos(a), Math.sin(e), -Math.cos(e) * Math.sin(a)).normalize();
}

/** Solve a shot for the current aspect ratio. Pure apart from the scratch camera. */
export function enquadrar(camera: PerspectiveCamera, pontos: readonly Vector3[], plano: Plano, aspecto: number): Enquadramento {
  const centro = pontos.reduce((acc, p) => acc.add(p), new Vector3()).multiplyScalar(1 / pontos.length);
  const alvo = centro.clone();
  const dir = direcao(plano.az, plano.el);
  let d = 1;
  camera.fov = plano.fov; camera.aspect = aspecto; camera.near = 0.01; camera.far = 800;
  camera.updateProjectionMatrix();
  for (let i = 0; i < 40; i += 1) {
    camera.position.copy(alvo).addScaledVector(dir, d);
    camera.lookAt(alvo);
    camera.updateMatrixWorld(true);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pontos) {
      tmp.copy(p).project(camera);
      const x = (tmp.x + 1) / 2, y = (tmp.y + 1) / 2;
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    const w = Math.max(1e-4, maxX - minX);
    d *= (w / plano.largura) ** 0.8;
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
    alvo.addScaledVector(right, (cx - 0.5) * d * 0.6).addScaledVector(up, (cy - plano.centroV) * d * 0.6);
  }
  camera.position.copy(alvo).addScaledVector(dir, d);
  return { pos: camera.position.clone(), alvo, fov: plano.fov };
}

/** The shots, from the previs (blender/scripts/previs_anim.py), tuned for 390 × 844. */
export const PLANOS = {
  poster: { az: -112, el: 30, fov: 72, largura: 0.9, centroV: 0.36 },
  aberto: { az: -100, el: 48, fov: 70, largura: 0.96, centroV: 0.44 },
  // Gesture shot: the circle sits high (≈ 40% from the top) so the instruction below never lands on paper.
  gesto: { az: -98, el: 44, fov: 73.7, largura: 0.7, centroV: 0.6 },
  conselho: { az: -112, el: 22, fov: 78.6, largura: 0.84, centroV: 0.38 },
  fecho: { az: -70, el: 40, fov: 60, largura: 0.42, centroV: 0.5 },
  final: { az: -100, el: 27, fov: 80, largura: 0.9, centroV: 0.36 },
} as const satisfies Record<string, Plano>;

export type NomePlano = keyof typeof PLANOS;
