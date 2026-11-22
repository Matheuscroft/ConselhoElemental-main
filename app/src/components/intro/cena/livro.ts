import {
  BufferAttribute, DoubleSide, Float32BufferAttribute, Group, Matrix3, Mesh, MeshBasicNodeMaterial, MeshStandardNodeMaterial,
  NormalBlending, Object3D, PlaneGeometry, SRGBColorSpace, NoColorSpace, RepeatWrapping, Texture, TextureLoader, Vector3,
  type BufferGeometry, type Material,
} from 'three/webgpu';
import {
  abs, clamp, color, dot, float, max, mix, mx_fractal_noise_float, normalLocal, normalMap, normalView, positionLocal,
  positionViewDirection, positionWorld, pow, sin, smoothstep, step, texture, uniform, uv, vec2, vec3,
} from 'three/tsl';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { ORDEM_CERIMONIA, type ElementoCerimonia } from '@/lib/intro/cerimonia';
import { COR, ELEMENTO } from './paleta';
import type { Animador } from './anima';
import { easeInOutCubic, easeOutBack, easeOutCubic } from './anima';

const BASE = '/intro/';

/** Page-local frame of the right page: the Seal's centre in the book root's space (three coordinates). */
export const SELO_NA_PAGINA = { x: 0.11, y: 0.0253, z: -0.035, tamanho: 0.148 };

/**
 * Height of the open page above its flat block (metres), by distance from the gutter in the book root's
 * space: a valley at the gutter, a soft belly mid-page, a slight droop at the fore-edge. 0 when closed.
 * Used for the pages (CPU), the Seal decal (TSL twin) and anything that has to sit on the page.
 */
export function alturaDaFolha(x: number, abertura: number): number {
  const u = Math.min(1, Math.max(0, x / 0.207));
  const t = Math.min(1, Math.max(0, x / 0.045)); const vale = 1 - t * t * (3 - 2 * t);
  return abertura * (Math.pow(Math.sin(u * Math.PI), 0.7) * 0.0065 - vale * vale * 0.007);
}

/** Page-local point (metres from the Seal's centre, +y towards the head) → book root space, on the open page. */
export function naPagina(x: number, y: number, acima = 0): Vector3 {
  const X = SELO_NA_PAGINA.x + x;
  return new Vector3(X, SELO_NA_PAGINA.y + alturaDaFolha(X, 1) + acima, SELO_NA_PAGINA.z - y);
}

export interface Livro {
  readonly raiz: Object3D;
  readonly cenario: Object3D;
  /** 0 closed → 1 open (drives the gutter curl and the crack light). */
  readonly abertura: { value: number };
  readonly fresta: { value: number };
  /** Glow of the gold fillets (0..2). */
  readonly linhas: { value: number };
  /** Ink progress per element on the page Seal (0..1) and the glow of each quadrant. */
  readonly tinta: Record<ElementoCerimonia, { value: number }>;
  readonly brilho: Record<ElementoCerimonia, { value: number }>;
  /** Light in each cavity of the clasp head, for the payoff. */
  readonly fecho: Record<ElementoCerimonia, { value: number }>;
  /** World position of named targets, for camera framing and accessible hit areas. */
  pontos(alvo: 'livroFechado' | 'livroAberto' | 'selo' | 'fecho' | 'cabecaFecho' | 'plinto'): Vector3[];
  /** Run the opening: squash, Seal turns, clasp releases, cover opens. Resolves when the cover lands. */
  abrir(anima: Animador, aoEvento?: (e: 'toque' | 'giro' | 'capa' | 'pousou' | 'luz', dur?: number) => void): Promise<void>;
  /** Jump to open instantly (reduced motion / skip-to). */
  abrirJa(): void;
  atualizar(t: number): void;
  dispose(): void;
}

/** Bake each mesh's node transform into float geometry, so shaders get metres in the parent's space. */
function desquantizar(mesh: Mesh) {
  const g = mesh.geometry as BufferGeometry;
  mesh.updateMatrix();
  const m = mesh.matrix.clone();
  const pos = g.getAttribute('position');
  const p = new Float32Array(pos.count * 3);
  const v = new Vector3();
  for (let i = 0; i < pos.count; i += 1) { v.fromBufferAttribute(pos, i).applyMatrix4(m); p.set([v.x, v.y, v.z], i * 3); }
  g.setAttribute('position', new Float32BufferAttribute(p, 3));
  const nor = g.getAttribute('normal');
  if (nor) {
    const nm = new Matrix3().getNormalMatrix(m);
    const n = new Float32Array(nor.count * 3);
    for (let i = 0; i < nor.count; i += 1) { v.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize(); n.set([v.x, v.y, v.z], i * 3); }
    g.setAttribute('normal', new Float32BufferAttribute(n, 3));
  }
  const uvA = g.getAttribute('uv') as BufferAttribute | undefined;
  if (uvA && (uvA.normalized || !(uvA.array instanceof Float32Array))) {
    const u = new Float32Array(uvA.count * 2);
    for (let i = 0; i < uvA.count; i += 1) { u[i * 2] = uvA.getX(i); u[i * 2 + 1] = uvA.getY(i); }
    g.setAttribute('uv', new Float32BufferAttribute(u, 2));
  }
  g.computeBoundingBox(); g.computeBoundingSphere();
  mesh.position.set(0, 0, 0); mesh.quaternion.identity(); mesh.scale.set(1, 1, 1); mesh.updateMatrix();
}

function carregarTextura(loader: TextureLoader, nome: string, srgb: boolean, cozida = false): Promise<Texture> {
  return loader.loadAsync(BASE + nome).then((t) => {
    t.colorSpace = srgb ? SRGBColorSpace : NoColorSpace;
    if (cozida) { t.flipY = false; } // UVs do glTF: mesma convenção das texturas cozidas no Blender
    else { t.wrapS = RepeatWrapping; t.wrapT = RepeatWrapping; }
    t.anisotropy = 4;
    return t;
  });
}

// TSL nodes chain freely; one loose alias keeps the layered compositing readable.
 
type Nodo = any;

const fresnel = (expoente: number) => pow(float(1).sub(clamp(dot(normalView, positionViewDirection), 0, 1)), expoente);

export async function carregarLivro(): Promise<Livro> {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  const tl = new TextureLoader();
  const CONJ = ['couro', 'metal', 'papel'] as const;
  type Conj = (typeof CONJ)[number];
  const [gLivro, gCenario, texPedra, texPedraN, texReg, texTra, texAr, ...cozidas] = await Promise.all([
    loader.loadAsync(BASE + 'livro.glb'), loader.loadAsync(BASE + 'cenario.glb'),
    carregarTextura(tl, 'pedra-base.jpg', true), carregarTextura(tl, 'pedra-normal.jpg', false),
    carregarTextura(tl, 'selo-regioes.png', false), carregarTextura(tl, 'selo-tracos.png', false), carregarTextura(tl, 'selo-ar-relevo.png', false),
    ...CONJ.flatMap((c) => (['base', 'normal', 'orm'] as const).map((k) => carregarTextura(tl, `${c}-${k}.webp`, k === 'base', true))),
  ]);
  const tex = Object.fromEntries(CONJ.map((c, i) => [c, { base: cozidas[i * 3], normal: cozidas[i * 3 + 1], orm: cozidas[i * 3 + 2] }])) as Record<Conj, { base: Texture; normal: Texture; orm: Texture }>;
  const descartaveis: { dispose(): void }[] = [texPedra, texPedraN, texReg, texTra, texAr, ...cozidas];
  const raiz = gLivro.scene.getObjectByName('Book_Root') ?? gLivro.scene;
  // sempre a partir da raiz: ao entrar na cena principal, a raiz sai de gLivro.scene
  const no = (n: string) => {
    const o = raiz.getObjectByName(n);
    if (!o) throw new Error(`Livro sem o nó ${n}`);
    return o;
  };

  const abertura = uniform(0);
  const fresta = uniform(0.6);
  /** Glow of the gold fillets (cover frame, Seal rings, spine): breathes in the poster, flares on the tap. */
  const linhas = uniform(0.7);
  const quatro = () => ({ agua: uniform(0), terra: uniform(0), fogo: uniform(0), ar: uniform(0) });
  const tinta = quatro(), brilho = quatro(), fecho = quatro();

  /* ---------------- materiais cozidos (Blender → texturas) por conjunto ---------------- */
  const cozido = (c: Conj) => {
    const m = new MeshStandardNodeMaterial();
    const orm = texture(tex[c].orm);
    m.colorNode = texture(tex[c].base).rgb;
    m.normalNode = normalMap(texture(tex[c].normal), vec2(1));
    m.roughnessNode = orm.g;
    m.metalnessNode = orm.b;
    m.aoNode = orm.r;
    descartaveis.push(m);
    return m;
  };
  const borda = color(COR.contraluzFria);
  const couro = cozido('couro');
  // couro é fosco: o piso de rugosidade tira o brilho lilás do céu; um toque quente no tom (couro tingido)
  couro.roughnessNode = max(texture(tex.couro.orm).g, 0.82);
  couro.colorNode = texture(tex.couro.base).rgb.mul(color('#ffe2c8')).mul(1.15);
  couro.emissiveNode = borda.mul(fresnel(3)).mul(0.05);
  const metal = cozido('metal');
  // latão, não prata: o tom quente segura o dourado mesmo refletindo o céu índigo
  // pátina: verdete nas cavidades (onde o cozimento deu oclusão), em manchas, fosco e não metálico
  const ormMetal = texture(tex.metal.orm);
  const manchas = mx_fractal_noise_float(positionLocal.mul(260), 3, 2.0, 0.5).mul(0.5).add(0.5);
  const verdete = smoothstep(0.8, 0.4, ormMetal.r).mul(smoothstep(0.38, 0.7, manchas)).mul(0.75);
  metal.colorNode = mix(texture(tex.metal.base).rgb.mul(color('#ffd9a0')).mul(1.1), color('#4f7f6a').mul(0.6), verdete);
  metal.roughnessNode = mix(ormMetal.g, float(0.85), verdete);
  metal.metalnessNode = mix(ormMetal.b, float(0.0), verdete);
  metal.emissiveNode = color(COR.contraluz).mul(fresnel(4)).mul(0.05);
  const ouroLinhas = cozido('metal');
  ouroLinhas.emissiveNode = color('#f0c070').mul(linhas).add(color(COR.contraluz).mul(fresnel(4)).mul(0.05));

  /** Height of the open page above its flat block, in metres, by distance from the gutter: a valley at the
   *  gutter, a soft belly mid-page, a slight droop at the fore-edge (like a real open book). 0 when closed.
   *  Same curve on the CPU (pages: positions and normals) and in TSL (the unlit Seal decal). */
  const curvaFolhaJs = alturaDaFolha;
  const curvaFolha = (x: Nodo): Nodo => {
    const u = clamp(x.div(0.207), 0, 1);
    const vale = float(1).sub(smoothstep(0.0, 0.045, x));
    return abertura.mul(pow(sin(u.mul(Math.PI)), 0.7).mul(0.0065).sub(vale.mul(vale).mul(0.007)));
  };

  /** Paper: baked leaves and gilt edges, warm crack light, and the gutter curl as the book opens. */
  const mkPapel = () => {
    const m = cozido('papel');
    // o ouro das bordas é folha fina, não espelho: menos metal evita o ponto branco duro do reflexo
    m.metalnessNode = texture(tex.papel.orm).b.mul(0.45);
    m.roughnessNode = max(texture(tex.papel.orm).g, 0.42);
    const nLocal = positionLocal; // metres, in the parent's space (geometry was dequantised)
    const ladoFolha = float(1).sub(step(0.9, abs(normalLocal.y)));
    // papel antigo: as margens amarelam e escurecem, e a dobra guarda sombra (só na face das folhas)
    const margem = max(smoothstep(0.165, 0.21, nLocal.x), smoothstep(0.105, 0.141, abs(nLocal.z)));
    const sombraDobra = float(1).sub(smoothstep(0.0, 0.03, nLocal.x));
    // foxing: manchas largas e suaves de pergaminho, mais fortes perto das margens
    const manchasPapel = mx_fractal_noise_float(vec2(nLocal.x, nLocal.z).mul(22), 4, 2.0, 0.55).mul(0.5).add(0.5);
    const foxing = smoothstep(0.45, 0.85, manchasPapel).mul(margem.mul(0.5).add(0.35));
    const envelhece = margem.mul(0.42).add(sombraDobra.mul(0.2)).add(foxing.mul(0.28)).mul(float(1).sub(ladoFolha));
    m.colorNode = mix(texture(tex.papel.base).rgb.mul(color('#fff1d8')).mul(0.88), color(COR.papelSombra).mul(0.6), clamp(envelhece, 0, 1));
    // curva da dobra: o topo afunda perto da lombada conforme o livro abre
    const x = nLocal.x;
    const perto = float(1).sub(smoothstep(0.0, 0.06, x));
    // fresta: as bordas douradas das folhas acendem com o livro fechado; aberto, a luz nasce na dobra
    const alturaMundo = positionWorld.y;
    // a luz passa entre as folhas: os vãos claros do cozimento brilham mais que as folhas
    const folhas = texture(tex.papel.base).r;
    const brilhoFresta = fresta.mul(float(1).sub(abertura)).mul(ladoFolha).mul(smoothstep(0.006, 0.04, alturaMundo)).mul(pow(folhas, 2).mul(2.0).add(0.15));
    const espalha = float(1).sub(smoothstep(0.0, 0.17, x));
    const luzDobra = abertura.mul(fresta).mul(float(1).sub(ladoFolha)).mul(perto.mul(0.22).add(espalha.mul(espalha).mul(0.1)));
    m.emissiveNode = mix(color(COR.ouro), color(COR.poca), 0.5).mul(brilhoFresta.mul(2.4)).add(color(COR.contraluz).mul(luzDobra));
    return m;
  };
  const papelDireita = mkPapel();
  const papelEsquerda = mkPapel();

  /* ---------------- percorre o livro: desquantiza e troca materiais ---------------- */
  const malhas: Mesh[] = [];
  raiz.traverse((o) => { if ((o as Mesh).isMesh) malhas.push(o as Mesh); });
  const conjuntoDe = (mesh: Mesh): Conj => (mesh.userData.conjunto ?? mesh.parent?.userData.conjunto ?? 'couro') as Conj;
  const nomeDe = (mesh: Mesh) => (mesh.userData.name as string | undefined) ?? (mesh.parent && !(mesh.parent as Mesh).isMesh && mesh.parent !== raiz ? mesh.parent.name : mesh.name);
  for (const mesh of malhas) {
    desquantizar(mesh);
    const nome = nomeDe(mesh);
    let mat: Material;
    if (/^(Seal_Relief|Spine_Gilt)/.test(nome)) mat = ouroLinhas;
    else if (/^Pages_Left/.test(nome)) mat = papelEsquerda;
    else if (/^(Pages_Right|PageTemplate)/.test(nome)) mat = papelDireita;
    else mat = { couro, metal, papel: papelDireita }[conjuntoDe(mesh)];
    (mesh.material as Material).dispose?.();
    mesh.material = mat;
    mesh.castShadow = false; mesh.receiveShadow = false;
  }

  /* ---------------- menos chamadas: peças estáticas do mesmo material e do mesmo pivô viram uma malha ---------------- */
  const juntar = (nomes: string[], nome: string) => {
    const pecas = malhas.filter((m) => nomes.includes(nomeDe(m)));
    if (pecas.length < 2) return;
    const pai = pecas[0].parent;
    if (!pai || pecas.some((p) => p.parent !== pai || p.material !== pecas[0].material)) return;
    const geo = mergeGeometries(pecas.map((p) => p.geometry));
    if (!geo) return;
    const unica = new Mesh(geo, pecas[0].material); unica.name = nome;
    pai.add(unica);
    for (const p of pecas) { p.removeFromParent(); p.geometry.dispose(); malhas.splice(malhas.indexOf(p), 1); }
    malhas.push(unica);
  };
  juntar(['Corner_NE', 'Corner_NW', 'Corner_SE', 'Corner_SW'], 'Cantoneiras');
  juntar(['Clasp_Pin', 'Clasp_Strap_V'], 'FechoBase');
  juntar(['Cover_Front'], 'CapaFrente'); // duas primitivas (couro e couro de fundo) com o mesmo material cozido

  /* ---------------- curva das folhas abertas (CPU: 2 × 250 vértices, só enquanto a capa se move) ---------------- */
  const folhas = malhas.filter((m) => /^Pages_(Left|Right)/.test(nomeDe(m))).map((mesh) => {
    const lado = /^Pages_Left/.test(nomeDe(mesh)) ? -1 : 1;
    const pos = mesh.geometry.getAttribute('position') as BufferAttribute;
    const base = Float32Array.from(pos.array as Float32Array);
    let yMin = Infinity, yMax = -Infinity;
    for (let i = 0; i < pos.count; i += 1) { yMin = Math.min(yMin, base[i * 3 + 1]); yMax = Math.max(yMax, base[i * 3 + 1]); }
    // a face "de cima" quando aberto: o topo do bloco direito e a base do esquerdo (que vira para cima)
    const topo: number[] = [];
    for (let i = 0; i < pos.count; i += 1) {
      const y = base[i * 3 + 1];
      if (lado === 1 ? y > yMax - 0.0005 : y < yMin + 0.0005) topo.push(i);
    }
    return { mesh, pos, base, topo, lado };
  });
  let aberturaCurva = -1;
  const curvarFolhas = (a: number) => {
    if (Math.abs(a - aberturaCurva) < 1e-4) return;
    aberturaCurva = a;
    for (const f of folhas) {
      const arr = f.pos.array as Float32Array;
      for (const i of f.topo) arr[i * 3 + 1] = f.base[i * 3 + 1] + curvaFolhaJs(f.base[i * 3], a) * f.lado;
      f.pos.needsUpdate = true;
      f.mesh.geometry.computeVertexNormals();
    }
  };

  /* ---------------- cavidades do fecho: cada uma acende na sua cor no fim ---------------- */
  const nomesCavidade: Record<ElementoCerimonia, string> = { agua: 'Clasp_Cavity_Water', terra: 'Clasp_Cavity_Earth', fogo: 'Clasp_Cavity_Fire', ar: 'Clasp_Cavity_Air' };
  for (const el of ORDEM_CERIMONIA) {
    const o = no(nomesCavidade[el]);
    const mesh = (o as Mesh).isMesh ? (o as Mesh) : (o.children.find((c) => (c as Mesh).isMesh) as Mesh);
    const m = cozido('metal');
    const p = ELEMENTO[el];
    m.colorNode = mix(texture(tex.metal.base).rgb, color(p.tinta), fecho[el]);
    m.emissiveNode = mix(color(p.base), color(p.aura), fecho[el].mul(0.6)).mul(fecho[el].mul(1.6));
    mesh.material = m; descartaveis.push(m);
  }

  /* ---------------- pivô da cabeça do fecho (giro de 16°) ---------------- */
  const cotovelo = no('Clasp_Elbow');
  const corpo = no('Clasp_Body');
  const corpoMesh = (corpo as Mesh).isMesh ? (corpo as Mesh) : (corpo.children.find((c) => (c as Mesh).isMesh) as Mesh);
  corpoMesh.geometry.computeBoundingBox();
  const centroCabeca = corpoMesh.geometry.boundingBox!.getCenter(new Vector3());
  const cabeca = new Group(); cabeca.name = 'CabecaFecho';
  cabeca.position.copy(centroCabeca);
  cotovelo.add(cabeca);
  for (const n of ['Clasp_Body', ...Object.values(nomesCavidade)]) {
    const o = no(n);
    o.traverse((c) => { if ((c as Mesh).isMesh) (c as Mesh).geometry.translate(-centroCabeca.x, -centroCabeca.y, -centroCabeca.z); });
    cabeca.add(o);
  }

  /* ---------------- Selo da página: decalque com tinta por quadrante ---------------- */
  const decalGeo = new PlaneGeometry(SELO_NA_PAGINA.tamanho, SELO_NA_PAGINA.tamanho, 16, 1);
  const decalMat = new MeshBasicNodeMaterial({ transparent: true, depthWrite: false, blending: NormalBlending, side: DoubleSide });
  const u = uv();
  const reg = texture(texReg, u), tra = texture(texTra, u), arr = texture(texAr, u);
  const passo = vec2(0.004, -0.004);
  const relevo = arr.b;
  const relevoDesloc = texture(texAr, u.add(passo)).b;
  const relevoDif = relevo.sub(relevoDesloc);
  const ruido = mx_fractal_noise_float(u.mul(9), 3, 2.0, 0.5).mul(0.5).add(0.5);
  const revela = (p: typeof tinta.agua) => smoothstep(ruido.mul(0.7), ruido.mul(0.7).add(0.22), p.mul(1.25));
  // camadas, de baixo para cima: sombra do sulco, luz do relevo, quatro tintas e quatro traços
  let cor: Nodo = vec3(0, 0, 0);
  let alfa: Nodo = float(0);
  const sobre = (c: Nodo, a: Nodo) => { cor = mix(cor, c, a); alfa = alfa.add(a.mul(float(1).sub(alfa))); };
  sobre(color(COR.tinta), relevo.mul(0.07).add(max(relevoDif.negate(), 0).mul(0.45)));
  sobre(color('#fffaf0'), max(relevoDif, 0).mul(0.35));
  const canais: Record<ElementoCerimonia, { regiao: Nodo; traco: Nodo }> = {
    agua: { regiao: reg.r, traco: tra.r }, terra: { regiao: reg.g, traco: tra.g }, fogo: { regiao: reg.b, traco: tra.b }, ar: { regiao: arr.r, traco: arr.g },
  };
  for (const el of ORDEM_CERIMONIA) {
    const p = ELEMENTO[el];
    const r = revela(tinta[el]);
    const b = brilho[el];
    sobre(mix(color(p.acento), color(p.base), 0.3).add(color(p.aura).mul(b.mul(0.5))), canais[el].regiao.mul(r).mul(0.5));
    sobre(mix(color(p.base), color(p.aura), b.mul(0.6)), canais[el].traco.mul(r).mul(0.95));
  }
  decalMat.colorNode = cor;
  // o decalque acompanha a curva da página direita (o plano gira −90° em X: o z local é o "para cima")
  decalMat.positionNode = positionLocal.add(vec3(0, 0, curvaFolha(positionLocal.x.add(SELO_NA_PAGINA.x))));
  decalMat.opacityNode = clamp(alfa, 0, 1);
  const decal = new Mesh(decalGeo, decalMat);
  decal.name = 'SeloPagina';
  decal.rotation.x = -Math.PI / 2;
  decal.position.set(SELO_NA_PAGINA.x, SELO_NA_PAGINA.y + 0.0004, SELO_NA_PAGINA.z);
  decal.renderOrder = 2;
  raiz.add(decal);
  descartaveis.push(decalGeo, decalMat);

  /* ---------------- cenário: plinto e rochas ---------------- */
  const cenario = gCenario.scene;
  const pedra = new MeshStandardNodeMaterial({ roughness: 0.92, metalness: 0 });
  // a textura dá o desenho da pedra; o token dá a cor (escura, levemente lilás, como no K1a)
  pedra.colorNode = texture(texPedra, uv().mul(2.4)).rgb.mul(color(COR.pedra)).mul(1.9);
  pedra.normalNode = normalMap(texture(texPedraN, uv().mul(2.4)), vec2(1.2));
  descartaveis.push(pedra);
  const rochas: Object3D[] = [];
  cenario.traverse((o) => {
    if ((o as Mesh).isMesh) { ((o as Mesh).material as Material).dispose?.(); (o as Mesh).material = pedra; }
    if (/^Rocha/.test(o.name)) rochas.push(o);
  });
  // rochas flutuantes compostas para o pôster 9:16 (câmera a −112°): pequenas, longe, dentro da névoa,
  // duas à esquerda e duas à direita do livro, como no K1a (a previs as deixava grandes e fora do quadro)
  const COMPOSICAO: Record<string, [number, number, number, number]> = {
    Rocha_A: [1.0, 0.05, -7.3, 0.3], Rocha_B: [3.2, 0.9, -12.8, 0.28], Rocha_C: [5.2, -0.35, -8.6, 0.42], Rocha_D: [8.0, 1.7, -17.4, 0.3],
  };
  for (const r of rochas) {
    const c = COMPOSICAO[r.name]; if (!c) continue;
    r.position.set(c[0], c[1], c[2]); r.scale.multiplyScalar(c[3]);
  }
  const baseRochas = rochas.map((r) => ({ y: r.position.y, ry: r.rotation.y }));

  /* ---------------- consultas e animação ---------------- */
  const pontosDe = (nomes: string[]) => {
    const out: Vector3[] = []; const v = new Vector3();
    for (const n of nomes) {
      const o = raiz.getObjectByName(n); if (!o) continue;
      o.updateWorldMatrix(true, true);
      o.traverse((c) => {
        const mesh = c as Mesh; if (!mesh.isMesh) return;
        const bb = mesh.geometry.boundingBox ?? (mesh.geometry.computeBoundingBox(), mesh.geometry.boundingBox!);
        for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) out.push(v.set(x, y, z).applyMatrix4(mesh.matrixWorld).clone());
      });
    }
    return out;
  };
  const dobradica = no('Book_Hinge'), lombada = no('Spine_Hinge'), pivo = no('Clasp_Pivot');
  const graus = (g: number) => (g * Math.PI) / 180;
  const escalaCorpo = cabeca.scale.clone();

  const definirCapa = (anguloBlender: number) => {
    // three: rotação em z = −θ do Blender (Y do Blender é −Z do three)
    dobradica.rotation.z = -graus(anguloBlender);
    lombada.rotation.z = -graus(Math.max(-90, anguloBlender / 2));
    abertura.value = Math.min(1, Math.max(0, -anguloBlender / 180));
    curvarFolhas(abertura.value);
  };

  return {
    raiz, cenario, abertura, fresta, linhas, tinta, brilho, fecho,
    pontos(alvo) {
      // Caixas analíticas no espaço da raiz (independem da animação), levadas ao mundo.
      raiz.updateWorldMatrix(true, false);
      const caixa = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
        const out: Vector3[] = [];
        for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) out.push(new Vector3(x, y, z).applyMatrix4(raiz.matrixWorld));
        return out;
      };
      const S = SELO_NA_PAGINA, r = S.tamanho / 2;
      switch (alvo) {
        case 'livroFechado': return caixa(-0.012, 0.226, 0, 0.056, -0.15, 0.15);
        case 'livroAberto': return caixa(-0.222, 0.222, 0, 0.03, -0.15, 0.15);
        case 'selo': return caixa(S.x - r, S.x + r, S.y, S.y, S.z - r, S.z + r);
        case 'fecho': return caixa(-0.222, 0.262, 0, 0.03, -0.15, 0.15);
        case 'cabecaFecho': {
          // ao vivo: onde a cabeça está agora (para o alvo de toque acessível)
          cabeca.updateWorldMatrix(true, true);
          return pontosDe(['CabecaFecho']);
        }
        case 'plinto': return caixa(-0.222, 0.262, 0, 0.03, -0.15, 0.15).concat(
          Array.from({ length: 12 }, (_, i) => new Vector3(Math.cos((i / 12) * Math.PI * 2) * 0.27, 0, Math.sin((i / 12) * Math.PI * 2) * 0.27)));
      }
    },
    async abrir(anima, aoEvento) {
      // 1. o toque afunda a cabeça (squash curto)
      aoEvento?.('toque');
      await anima.animar({ de: 0, para: 1, duracao: 0.12, easing: easeOutCubic, aplicar: (v) => cabeca.scale.set(escalaCorpo.x * (1 + 0.04 * v), escalaCorpo.y * (1 - 0.3 * v), escalaCorpo.z * (1 + 0.04 * v)) });
      void anima.animar({ de: 1, para: 0, duracao: 0.18, easing: easeOutBack(2), aplicar: (v) => cabeca.scale.set(escalaCorpo.x * (1 + 0.04 * v), escalaCorpo.y * (1 - 0.3 * v), escalaCorpo.z * (1 + 0.04 * v)) });
      // 2. o Selo gira 16° no sentido da cerimônia e destrava
      aoEvento?.('giro');
      await anima.animar({ de: 0, para: -16, duracao: 0.45, easing: easeOutBack(1.8), aplicar: (g) => { cabeca.rotation.y = graus(g); } });
      // 3. o fecho se solta e se desdobra para a direita (com ultrapassagem)
      void anima.animar({ de: 0, para: 1, duracao: 0.85, easing: easeOutBack(1.2), aplicar: (v) => { pivo.rotation.z = -graus(90 * v); cotovelo.rotation.z = graus(90 * Math.min(1, v * 1.08)); } });
      await anima.esperar(0.45);
      // a luz se guarda enquanto a capa abre
      void anima.animar({ de: fresta.value, para: 0.3, duracao: 0.6, easing: easeInOutCubic, aplicar: (v) => { fresta.value = v; }, chave: 'fresta' });
      // 4. a capa: antecipação, abertura com ultrapassagem, assentamento
      aoEvento?.('capa', 0.18 + 1.25 + 0.3);
      await anima.animar({ de: 0, para: 3, duracao: 0.18, easing: easeOutCubic, aplicar: definirCapa });
      await anima.animar({ de: 3, para: -184, duracao: 1.25, easing: easeInOutCubic, aplicar: definirCapa });
      await anima.animar({ de: -184, para: -180, duracao: 0.3, easing: easeOutCubic, aplicar: definirCapa });
      aoEvento?.('pousou');
      // 5. a luz sobe pela dobra
      aoEvento?.('luz');
      void anima.animar({ de: fresta.value, para: 1, duracao: 1.6, easing: easeInOutCubic, aplicar: (v) => { fresta.value = v; }, chave: 'fresta' });
    },
    abrirJa() {
      cabeca.rotation.y = graus(-16); pivo.rotation.z = -graus(90); cotovelo.rotation.z = graus(90);
      definirCapa(-180); fresta.value = 1;
    },
    atualizar(t) {
      rochas.forEach((r, i) => {
        r.position.y = baseRochas[i].y + Math.sin(t * 0.35 + i * 1.7) * 0.06;
        r.rotation.y = baseRochas[i].ry + t * 0.01 * (i % 2 ? 1 : -1);
      });
    },
    dispose() {
      for (const d of descartaveis) d.dispose();
      for (const mesh of malhas) mesh.geometry.dispose();
      cenario.traverse((o) => { if ((o as Mesh).isMesh) (o as Mesh).geometry.dispose(); });
    },
  };
}

