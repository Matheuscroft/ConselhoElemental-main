import { NeutralToneMapping, PerspectiveCamera, Plane, Raycaster, Scene, Vector2, Vector3, WebGPURenderer } from 'three/webgpu';
import { color, fog, rangeFogFactor } from 'three/tsl';
import { ORCAMENTO, type NivelGrimorio } from '@/lib/intro/qualidade';
import { criarAnimador, easeInOutCubic, type Animador, type Easing } from './anima';
import { enquadrar, PLANOS, type Enquadramento, type NomePlano } from './camera';
import { criarCeu } from './ceu';
import { carregarLivro, SELO_NA_PAGINA, type Livro } from './livro';
import { criarAgua, type GestoAgua } from './agua';
import { criarTerra, type GestoTerra } from './terra';
import { criarLuz } from './luz';
import { COR } from './paleta';
import { criarPos } from './pos';

/**
 * The grimoire's 3D scene. Loaded on demand (its own chunk), created on one canvas, and fully
 * disposed when the ceremony ends. The React shell talks to it only through this controller.
 */

export interface OpcoesGrimorio3D {
  readonly nivel: Exclude<NivelGrimorio, 'C'>;
  readonly lua: { readonly fracao: number; readonly crescente: boolean };
  /** Every frame interval in ms (feeds the frame monitor for the drop to C). */
  readonly aoQuadro?: (intervaloMs: number, visivel: boolean) => void;
  /** The GPU went away (context lost / device lost): the shell drops to the static version. */
  readonly aoPerder?: (motivo: string) => void;
}

export interface PontoTela { readonly x: number; readonly y: number; readonly raio: number }

export interface ControleGrimorio3D {
  readonly backend: 'webgpu' | 'webgl2';
  readonly nivel: 'A' | 'B';
  readonly livro: Livro;
  readonly anima: Animador;
  /** First gesture's 3D (drop, ribbon, splash). */
  readonly agua: GestoAgua;
  /** Second gesture's 3D (stone, fragments, dust). */
  readonly terra: GestoTerra;
  /** Camera tremor, 0..1 (the Earth hold). */
  tremer(intensidade: number): void;
  /** A quadrant wakes without its own 3D yet (or in reduced motion): the ink settles and the quadrant glows. */
  revelarTinta(elemento: 'agua' | 'terra' | 'fogo' | 'ar'): Promise<void>;
  /** Screen position of a point in book root space (for the accessible targets). */
  naTela(p: Vector3): { x: number; y: number };
  irPara(plano: NomePlano, duracao: number, easing?: Easing): Promise<void>;
  /** The whole opening: clasp, cover, camera rising to the open book. */
  abrir(aoEvento?: (e: 'toque' | 'giro' | 'capa' | 'pousou' | 'luz', dur?: number) => void): Promise<void>;
  posicaoNaTela(alvo: 'cabecaFecho' | 'selo'): PontoTela | null;
  /** Finger (client px) → page-local metres on the right page, origin at the Seal's centre. */
  projetarNaPagina(clientX: number, clientY: number): { x: number; y: number } | null;
  /** Page-local metres → client px (to place the accessible hit areas). */
  paginaNaTela(x: number, y: number): { x: number; y: number } | null;
  diagnostico(): { triangulos: number; chamadas: number; backend: string; pixelRatio: number; largura: number; altura: number };
  dispose(): void;
}

export async function criarGrimorio3D(canvas: HTMLCanvasElement, opcoes: OpcoesGrimorio3D): Promise<ControleGrimorio3D> {
  const pedido = opcoes.nivel;
  const renderer = new WebGPURenderer({ canvas, antialias: true, forceWebGL: pedido === 'B', powerPreference: 'high-performance', alpha: false });
  await renderer.init();
  const backendObj = renderer.backend as unknown as { isWebGPUBackend?: boolean };
  const backend: 'webgpu' | 'webgl2' = backendObj.isWebGPUBackend ? 'webgpu' : 'webgl2';
  // Asked for A but the browser has no WebGPU: Three already fell back to WebGL2, so this is B.
  const nivel: 'A' | 'B' = backend === 'webgpu' && pedido === 'A' ? 'A' : 'B';
  const orc = ORCAMENTO[nivel];
  // Neutral (Khronos PBR Neutral): preserva matiz e saturação da paleta; o AgX acinzentava o crepúsculo
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, orc.pixelRatio));

  const cena = new Scene();
  cena.fogNode = fog(color(COR.horizonte), rangeFogFactor(2.5, 40));
  const camera = new PerspectiveCamera(65, 1, 0.01, 800);

  const ceu = criarCeu(orc.nevoaCamadas);
  ceu.definirLua(opcoes.lua.fracao, opcoes.lua.crescente);
  cena.add(ceu.grupo);

  const livro = await carregarLivro();
  cena.add(livro.cenario, livro.raiz);
  const luz = criarLuz(renderer, livro.raiz, orc.poeira);
  const agua = criarAgua(livro);
  const terra = criarTerra(livro);
  let tremor = 0;
  cena.add(luz.grupo);
  cena.environment = luz.ambiente;
  cena.environmentIntensity = 0.7;

  const pos = criarPos(renderer, cena, camera, orc.bloom);
  const anima = criarAnimador();

  /* ---------- câmera: planos resolvidos por proporção ---------- */
  const scratch = new PerspectiveCamera();
  const fontes: Record<NomePlano, () => Vector3[]> = {
    poster: () => livro.pontos('livroFechado'),
    aberto: () => livro.pontos('livroAberto'),
    gesto: () => livro.pontos('selo'),
    conselho: () => livro.pontos('plinto'),
    fecho: () => livro.pontos('cabecaFecho'),
    final: () => livro.pontos('fecho'),
  };
  const cache = new Map<NomePlano, Enquadramento>();
  let aspecto = 1;
  const resolver = (nome: NomePlano): Enquadramento => {
    const hit = cache.get(nome);
    if (hit) return hit;
    // os pontos dependem do estado do livro (aberto ou fechado), então cada plano é resolvido no estado certo
    const pts = fontes[nome]();
    // sem pontos (nó ausente) o enquadramento viraria NaN e a tela ficaria preta: volta ao pôster
    if (!pts.length && nome !== 'poster') return resolver('poster');
    const e = enquadrar(scratch, pts, PLANOS[nome], aspecto);
    cache.set(nome, e);
    return e;
  };
  const atual = { pos: new Vector3(), alvo: new Vector3(), fov: 65 };
  const aplicarCamera = (t: number) => {
    // respiração lenta: a câmera nunca está parada, mas nunca distrai
    const r = 0.0025;
    // tremor da Terra: duas frequências que não se repetem, amplitude de poucos milímetros
    const tr = tremor * 0.0018;
    camera.position.set(
      atual.pos.x + Math.sin(t * 0.21) * r + Math.sin(t * 37.1) * tr,
      atual.pos.y + Math.sin(t * 0.17) * r * 0.6 + Math.sin(t * 29.3 + 1.7) * tr,
      atual.pos.z + Math.cos(t * 0.19) * r + Math.cos(t * 33.7) * tr * 0.6,
    );
    camera.fov = atual.fov; camera.aspect = aspecto; camera.updateProjectionMatrix();
    camera.lookAt(atual.alvo);
  };

  const tamanho = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    aspecto = w / Math.max(1, h);
    cache.clear();
  };
  tamanho();
  const ro = new ResizeObserver(() => { tamanho(); });
  ro.observe(canvas);

  {
    const e = resolver('poster');
    atual.pos.copy(e.pos); atual.alvo.copy(e.alvo); atual.fov = e.fov;
  }

  const irPara = (nome: NomePlano, duracao: number, easing: Easing = easeInOutCubic) => {
    cache.delete(nome);
    const de = { pos: atual.pos.clone(), alvo: atual.alvo.clone(), fov: atual.fov };
    const para = resolver(nome);
    return anima.animar({
      de: 0, para: 1, duracao, easing, chave: 'camera',
      aplicar: (k) => {
        atual.pos.lerpVectors(de.pos, para.pos, k);
        atual.alvo.lerpVectors(de.alvo, para.alvo, k);
        atual.fov = de.fov + (para.fov - de.fov) * k;
      },
    });
  };

  /* ---------- laço ---------- */
  let ultimo = performance.now();
  let rodando = false;
  let perdido = false;
  const quadro = () => {
    const agora = performance.now();
    const dtMs = Math.min(100, agora - ultimo);
    ultimo = agora;
    anima.passo(dtMs / 1000);
    const t = anima.agora;
    livro.atualizar(t);
    agua.atualizar(t);
    terra.atualizar(t);
    luz.fresta.value = livro.fresta.value;
    luz.atualizar(livro.abertura.value);
    aplicarCamera(t);
    pos.render();
    opcoes.aoQuadro?.(dtMs, !document.hidden);
  };
  const iniciar = () => { if (rodando || perdido) return; rodando = true; ultimo = performance.now(); void renderer.setAnimationLoop(quadro); };
  const parar = () => { rodando = false; void renderer.setAnimationLoop(null); };
  const visibilidade = () => (document.hidden ? parar() : iniciar());
  document.addEventListener('visibilitychange', visibilidade);
  const perder = (motivo: string) => { if (perdido) return; perdido = true; parar(); opcoes.aoPerder?.(motivo); };
  const aoPerderGL = (e: Event) => { e.preventDefault(); perder('contexto WebGL perdido'); };
  canvas.addEventListener('webglcontextlost', aoPerderGL);
  const dispositivo = (renderer.backend as unknown as { device?: { lost: Promise<{ reason: string; message: string }> } }).device;
  dispositivo?.lost.then((info: { reason: string; message: string }) => { if (info.reason !== 'destroyed') perder(`GPU perdida: ${info.message}`); });
  iniciar();
  // Bancada de luz (só no servidor de desenvolvimento): afinar ao vivo pelo console, nunca no build.
  const janelaDev = window as unknown as { __grimorioCena?: unknown };
  const bancadaDev = { cena, renderer, camera, luz, ceu, pos, livro };
  if (import.meta.env.DEV) janelaDev.__grimorioCena = bancadaDev;

  /* ---------- consultas de tela ---------- */
  const v = new Vector3();
  const paraTela = (p: Vector3) => {
    v.copy(p).project(camera);
    const r = canvas.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  };
  const ray = new Raycaster();
  const ndc = new Vector2();
  const planoPagina = new Plane(new Vector3(0, 1, 0), 0);
  const origemSelo = () => {
    livro.raiz.updateWorldMatrix(true, false);
    return new Vector3(SELO_NA_PAGINA.x, SELO_NA_PAGINA.y, SELO_NA_PAGINA.z).applyMatrix4(livro.raiz.matrixWorld);
  };

  return {
    backend, nivel, livro, anima, irPara, agua, terra,
    tremer(v) { tremor = Math.max(0, Math.min(1, v)); },
    async revelarTinta(el) {
      void anima.animar({ de: 0, para: 1, duracao: 0.6, easing: easeInOutCubic, aplicar: (k) => { livro.brilho[el].value = k; } });
      await anima.animar({ de: 0, para: 1, duracao: 1.3, atraso: 0.1, easing: easeInOutCubic, aplicar: (k) => { livro.tinta[el].value = k; } });
      await anima.animar({ de: 1, para: 0.35, duracao: 0.8, easing: easeInOutCubic, aplicar: (k) => { livro.brilho[el].value = k; } });
    },
    naTela(p) {
      livro.raiz.updateWorldMatrix(true, false);
      return paraTela(p.clone().applyMatrix4(livro.raiz.matrixWorld));
    },
    async abrir(aoEvento) {
      const abrindo = livro.abrir(anima, aoEvento);
      // a câmera espera o fecho soltar e sobe para o livro aberto enquanto a capa gira
      await anima.esperar(0.9);
      const subida = irPara('aberto', 2.2);
      await Promise.all([abrindo, subida]);
    },
    posicaoNaTela(alvo) {
      const pts = livro.pontos(alvo === 'cabecaFecho' ? 'cabecaFecho' : 'selo');
      if (!pts.length) return null;
      const centro = pts.reduce((a, p) => a.add(p), new Vector3()).multiplyScalar(1 / pts.length);
      const c = paraTela(centro);
      let raio = 0;
      for (const p of pts) { const s = paraTela(p); raio = Math.max(raio, Math.hypot(s.x - c.x, s.y - c.y)); }
      return { x: c.x, y: c.y, raio: raio * 0.7 };
    },
    projetarNaPagina(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      ndc.set(((clientX - r.left) / r.width) * 2 - 1, -(((clientY - r.top) / r.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const o = origemSelo();
      planoPagina.set(new Vector3(0, 1, 0), -o.y);
      const hit = ray.ray.intersectPlane(planoPagina, new Vector3());
      if (!hit) return null;
      return { x: hit.x - o.x, y: -(hit.z - o.z) };
    },
    paginaNaTela(x, y) {
      const o = origemSelo();
      return paraTela(new Vector3(o.x + x, o.y, o.z - y));
    },
    diagnostico() {
      const info = renderer.info.render as unknown as { triangles: number; drawCalls?: number; calls?: number };
      return {
        triangulos: info.triangles, chamadas: info.drawCalls ?? info.calls ?? 0, backend,
        pixelRatio: renderer.getPixelRatio(), largura: canvas.width, altura: canvas.height,
      };
    },
    dispose() {
      parar();
      if (import.meta.env.DEV && janelaDev.__grimorioCena === bancadaDev) delete janelaDev.__grimorioCena;
      ro.disconnect();
      document.removeEventListener('visibilitychange', visibilidade);
      canvas.removeEventListener('webglcontextlost', aoPerderGL);
      anima.limpar();
      pos.dispose(); agua.dispose(); terra.dispose(); livro.dispose(); luz.dispose(); ceu.dispose();
      renderer.dispose();
    },
  };
}
