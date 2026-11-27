import {
  CanvasTexture, Color, DirectionalLight, Group, LinearFilter, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PerspectiveCamera,
  Scene, SRGBColorSpace, type Texture,
} from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { Compartilhado } from './compartilhado';

/**
 * The glass keycap, as a scene: a rounded glass shell that bends and splits the light (transmission, dispersion and a
 * thin-film iridescence), and inside it, against the back, a dark plate that carries the label sunk into it, with a
 * soft highlight. It turns toward the pointer on springs and sinks when pressed.
 */
export type EstadoDaTecla = 'normal' | 'feito' | 'bloqueado';

export interface OpcoesDaTecla {
  readonly largura: number;   // world units, the key is 1 tall
  readonly rotulo: string;
  readonly tom: string;       // css colour of the element: it lights the plate when the key is done or next
  readonly estado: EstadoDaTecla;
}

export interface Tecla {
  readonly cena: Scene;
  readonly camera: PerspectiveCamera;
  /** Aims the key: x and y in -1..1, where the pointer is relative to the key. */
  mirar(x: number, y: number): void;
  apertar(valor: boolean): void;
  definir(opcoes: Partial<Pick<OpcoesDaTecla, 'rotulo' | 'tom' | 'estado'>>): void;
  /** Advances the springs by `dt` seconds; true while it is still moving. */
  passo(dt: number, tempo: number, flutuar: boolean): boolean;
  ajustar(proporcao: number): void;
  descartar(): void;
}

/** The canvas is larger than the key (see vitro-key.css) so a turned key is never cut: these are how much larger. */
export const MARGEM = { altura: 1.6, largura: 1.26 } as const;
const ALTURA = 1;
const PROFUNDIDADE = 0.56;
const RAIO = 0.14;
/** The pose it rests in: turned enough to show its side, as in the reference. */
const POSE = { x: 0.2, y: -0.3 };
/** A wide key turns less: its far end would stretch too much in perspective. */
const reducao = (largura: number) => 1 / Math.max(1, largura * 0.55);

/** The face of the plate: dark plum, the label sunk (a lighter ring under it, a darker one over it) and a soft highlight. */
function pintarFace(rotulo: string, largura: number, tom: string, aceso: number): CanvasTexture {
  const escala = 160;
  const w = Math.round((largura - 0.3) * escala), h = Math.round((ALTURA - 0.3) * escala);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const c = canvas.getContext('2d')!;
  const fundo = c.createLinearGradient(0, 0, w, h);
  fundo.addColorStop(0, '#1c1020'); fundo.addColorStop(1, '#0f0a14');
  c.fillStyle = fundo; c.fillRect(0, 0, w, h);
  // the light of the element, when the key is lit
  if (aceso > 0) {
    const brilho = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.6);
    brilho.addColorStop(0, tom); brilho.addColorStop(1, 'rgba(0,0,0,0)');
    c.globalAlpha = 0.55 * aceso; c.fillStyle = brilho; c.fillRect(0, 0, w, h); c.globalAlpha = 1;
  }
  // the plate is cut into the surface: a dark inner shadow on the top and left edges, a faint lip on the bottom and right
  const borda = Math.min(w, h) * 0.12;
  for (const [x0, y0, x1, y1, rx, ry, rw, rh, alfa] of [
    [0, 0, 0, borda, 0, 0, w, borda, 0.6], [0, 0, borda, 0, 0, 0, borda, h, 0.5],
    [0, h, 0, h - borda, 0, h - borda, w, borda, 0.18], [w, 0, w - borda, 0, w - borda, 0, borda, h, 0.14],
  ] as const) {
    const g = c.createLinearGradient(x0, y0, x1, y1);
    const luz = alfa < 0.3;
    g.addColorStop(0, luz ? `rgba(255,255,255,${alfa})` : `rgba(0,0,0,${alfa})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(rx, ry, rw, rh);
  }
  // the highlight, upper right
  const spot = c.createRadialGradient(w * 0.78, h * 0.18, 0, w * 0.78, h * 0.18, Math.min(w, h) * 0.8);
  spot.addColorStop(0, 'rgba(255,255,255,.85)'); spot.addColorStop(0.45, 'rgba(255,255,255,.22)'); spot.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = spot; c.fillRect(0, 0, w, h);
  // the label, sunk: a dark cut, a bright lip under it, then the letters
  const texto = rotulo.toUpperCase();
  const tamanho = Math.min(h * 0.44, (w * 0.84) / Math.max(1.2, texto.length * 0.66));
  c.font = `800 ${tamanho}px Inter, system-ui, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const x = w / 2, y = h / 2 + h * 0.02;
  c.fillStyle = 'rgba(255,255,255,.18)'; c.fillText(texto, x, y + 2.2);
  c.fillStyle = 'rgba(0,0,0,.55)'; c.fillText(texto, x, y - 1.6);
  c.fillStyle = '#f4f1fa'; c.fillText(texto, x, y);
  const textura = new CanvasTexture(canvas);
  textura.colorSpace = SRGBColorSpace; textura.minFilter = LinearFilter; textura.anisotropy = 4;
  return textura;
}

export function criarTecla(compartilhado: Compartilhado, inicio: OpcoesDaTecla): Tecla {
  const { largura } = inicio;
  let { rotulo, tom, estado } = inicio;
  const cena = new Scene();
  cena.environment = compartilhado.ambiente;
  cena.environmentIntensity = 1.15;
  const camera = new PerspectiveCamera(22, (largura * MARGEM.largura) / (ALTURA * MARGEM.altura), 0.1, 50);

  const grupo = new Group();
  cena.add(grupo);

  const vidro = new MeshPhysicalMaterial({
    color: new Color(0xffffff), roughness: 0.05, metalness: 0, transmission: 1, thickness: 0.8, ior: 1.62, dispersion: 9,
    iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [140, 1000], clearcoat: 1, clearcoatRoughness: 0.04,
    attenuationColor: new Color(0xd4ccff), attenuationDistance: 40, envMapIntensity: 1.7, sheen: 1, sheenColor: new Color(0x6f4dff), sheenRoughness: 0.35, specularIntensity: 1,
  });
  const casca = new Mesh(new RoundedBoxGeometry(largura, ALTURA, PROFUNDIDADE, 1, RAIO), vidro);
  grupo.add(casca);

  const materialPlaca = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05, envMapIntensity: 0.25, emissive: new Color(tom), emissiveIntensity: 0 });
  const lateral = new MeshStandardMaterial({ color: 0x120b16, roughness: 0.6, metalness: 0.1 });
  let textura: Texture = pintarFace(rotulo, largura, tom, 0);
  materialPlaca.map = textura;
  const placa = new Mesh(new RoundedBoxGeometry(largura - 0.24, ALTURA - 0.24, 0.03, 3, 0.03), [lateral, lateral, lateral, lateral, materialPlaca, lateral] as never);
  placa.position.z = PROFUNDIDADE / 2 + 0.012;
  placa.renderOrder = 5;
  materialPlaca.transparent = true;
  grupo.add(placa);

  const luz = new DirectionalLight(0xffffff, 1.4);
  luz.position.set(-2, 3, 4);
  cena.add(luz);

  // springs: where the key is aimed, how far it is pressed
  const alvo = { x: 0, y: 0 };
  const atual = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0 };
  let apertada = false;
  let aceso = 0, acesoAlvo = estado === 'feito' ? 1 : 0;

  const posicionarCamera = (proporcao: number) => {
    camera.aspect = proporcao;
    const meia = Math.tan((camera.fov * Math.PI) / 360);
    const paraAltura = (ALTURA * MARGEM.altura * 1.16) / (2 * meia);
    const paraLargura = (largura * MARGEM.largura * 1.16) / (2 * meia * proporcao);
    camera.position.set(0, 0, Math.max(paraAltura, paraLargura));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };
  posicionarCamera((largura * MARGEM.largura) / (ALTURA * MARGEM.altura));

  const refazerFace = () => {
    textura.dispose();
    textura = pintarFace(rotulo, largura, tom, aceso);
    materialPlaca.map = textura; materialPlaca.needsUpdate = true;
  };

  const mola = (pos: number, vel: number, alvo_: number, rigidez: number, amortecimento: number, dt: number): [number, number] => {
    const aceleracao = (alvo_ - pos) * rigidez - vel * amortecimento;
    const nova = vel + aceleracao * dt;
    return [pos + nova * dt, nova];
  };

  return {
    cena, camera,
    mirar(x, y) { alvo.x = y * 0.62 * Math.min(1, reducao(largura) * 1.5); alvo.y = x * 0.78 * reducao(largura); },
    apertar(valor) { apertada = valor; },
    definir(op) {
      let refazer = false;
      if (op.rotulo !== undefined && op.rotulo !== rotulo) { rotulo = op.rotulo; refazer = true; }
      if (op.tom !== undefined && op.tom !== tom) { tom = op.tom; materialPlaca.emissive.set(tom); refazer = true; }
      if (op.estado !== undefined) {
        estado = op.estado; acesoAlvo = estado === 'feito' ? 1 : 0;
        vidro.transmission = estado === 'bloqueado' ? 0.55 : 1; vidro.roughness = estado === 'bloqueado' ? 0.35 : 0.05;
      }
      if (refazer) refazerFace();
    },
    passo(dt, tempo, flutuar) {
      const d = Math.min(dt, 1 / 30);
      const balanco = flutuar && estado !== 'bloqueado' ? { x: Math.sin(tempo * 0.9) * 0.06, y: Math.cos(tempo * 0.7) * 0.09 } : { x: 0, y: 0 };
      [atual.x, atual.vx] = mola(atual.x, atual.vx, alvo.x + balanco.x, 90, 13, d);
      [atual.y, atual.vy] = mola(atual.y, atual.vy, alvo.y + balanco.y, 90, 13, d);
      const baixo = apertada ? 0.2 : estado === 'feito' ? 0.1 : 0;
      [atual.z, atual.vz] = mola(atual.z, atual.vz, baixo, apertada ? 260 : 140, apertada ? 26 : 11, d);
      grupo.rotation.x = atual.x + POSE.x * Math.min(1, reducao(largura) * 1.4); grupo.rotation.y = atual.y + POSE.y * reducao(largura);
      grupo.position.z = -atual.z;
      grupo.scale.setScalar(1 - atual.z * 0.18);
      // the light of the element rises and falls toward its target
      const antes = aceso;
      aceso += (acesoAlvo - aceso) * Math.min(1, d * 6);
      if (Math.abs(aceso - antes) > 0.004) { materialPlaca.emissiveIntensity = aceso * 0.55; if (Math.abs(aceso - acesoAlvo) < 0.02 || Math.abs(aceso - antes) > 0.02) refazerFace(); }
      const movendo = Math.abs(atual.vx) + Math.abs(atual.vy) + Math.abs(atual.vz) > 0.004
        || Math.abs(atual.x - alvo.x) > 0.002 || Math.abs(atual.y - alvo.y) > 0.002 || Math.abs(atual.z - baixo) > 0.002
        || Math.abs(aceso - acesoAlvo) > 0.01;
      return movendo || flutuar;
    },
    ajustar(proporcao) { posicionarCamera(proporcao); },
    descartar() {
      casca.geometry.dispose(); placa.geometry.dispose(); vidro.dispose(); materialPlaca.dispose(); lateral.dispose(); textura.dispose();
    },
  };
}
