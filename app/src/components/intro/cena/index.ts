import { NeutralToneMapping, PerspectiveCamera, Plane, Raycaster, Scene, Vector2, Vector3, WebGPURenderer, type Object3D } from 'three/webgpu';
import { color, fog, rangeFogFactor } from 'three/tsl';
import { ORCAMENTO, type NivelGrimorio } from '@/lib/intro/qualidade';
import { criarRitmo, ESCALAS, type Estatisticas, type HzForcado, type Ritmo } from '@/lib/intro/ritmo';
import { criarAnimador, easeInOutCubic, easeInQuad, easeOutCubic, type Animador, type Easing } from './anima';
import { enquadrar, PLANOS, type Enquadramento, type NomePlano } from './camera';
import { criarCeu } from './ceu';
import { carregarLivro, SELO_NA_PAGINA, type Livro } from './livro';
import { criarAgua, type GestoAgua } from './agua';
import { criarTerra, type GestoTerra } from './terra';
import { criarFogo, type GestoFogo } from './fogo';
import { criarAr, type GestoAr } from './ar';
import { criarConselho } from './conselho';
import { criarLuz } from './luz';
import { COR } from './paleta';
import { criarPos } from './pos';
import { criarToque, type Toque } from './toque';
import { criarHistoria } from './historia';
import { TEMPOS_HISTORIA } from './tempos';

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
  /** Laboratory: force the paced rate (null = measured). */
  readonly hz?: HzForcado;
}

export { TEMPOS_HISTORIA } from './tempos';

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
  /** Third gesture's 3D (charred line, ember, sparks, flame). */
  readonly fogo: GestoFogo;
  /** Fourth gesture's 3D (page corner flap, wisps). */
  readonly ar: GestoAr;
  /** The payoff: quadrants flare, gold ring lifts, light travels to the clasp, cavities light (≈ 2.9 s). */
  conselho(): Promise<void>;
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
  diagnostico(): { triangulos: number; chamadas: number; backend: string; pixelRatio: number; largura: number; altura: number; ritmo: Estatisticas };
  /** Frame pacing and quality (measured): the shell reads it, the laboratory shows it. */
  readonly ritmo: Ritmo;
  /** Run `fn` at the start of every rendered frame, before anything moves or draws (input is applied here). Returns the unsubscribe. */
  antesDoQuadro(fn: (agora: number, dt: number) => void): () => void;
  /** Contact light under the finger (page-local metres). */
  readonly toque: Toque;
  /** Scene clock speed (1 = normal; the laboratory's slow motion, a tap's speed-up). */
  escalaTempo(v: number): void;
  /** The closing transition: the camera dives into the Seal, the crack light opens and washes the screen. */
  entrarNaHistoria(op: { aoCobrir: () => void; aoPico: () => void }): Promise<void>;
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
  const fogo = criarFogo(livro);
  const ar = criarAr(livro);
  const conselho = criarConselho(livro);
  let tremor = 0;
  cena.add(luz.grupo);
  cena.environment = luz.ambiente;
  cena.environmentIntensity = 0.7;

  const pos = criarPos(renderer, cena, camera, orc.bloom);
  const anima = criarAnimador();
  const toque = criarToque(livro);
  const historia = criarHistoria(nivel === 'A' ? 56 : 32);
  // a transição vive presa à câmera; a câmera precisa estar na cena para os filhos desenharem
  camera.add(historia.grupo); cena.add(camera);
  const ritmo = criarRitmo();
  ritmo.forcar(opcoes.hz ?? null);
  const pixelBase = Math.min(window.devicePixelRatio || 1, orc.pixelRatio);
  ritmo.aoEscalar = (e) => {
    // primeiro pixels, depois partículas: nunca abaixo de 1 px de CSS por pixel
    renderer.setPixelRatio(Math.max(1, pixelBase * ESCALAS[e].pixel));
    luz.densidade(ESCALAS[e].particulas);
  };
  let escalaT = 1;
  const passos = new Set<(agora: number, dt: number) => void>();

  /* ---------- câmera: planos resolvidos por proporção ---------- */
  const scratch = new PerspectiveCamera();
  const fontes: Record<NomePlano, () => Vector3[]> = {
    poster: () => livro.pontos('livroFechado'),
    aberto: () => livro.pontos('livroAberto'),
    gesto: () => livro.pontos('selo'),
    gestoAr: () => { livro.raiz.updateWorldMatrix(true, false); return [...livro.pontos('selo'), ar.posicaoCanto().applyMatrix4(livro.raiz.matrixWorld)]; },
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
  let respiro = 1;
  const aplicarCamera = (t: number) => {
    // respiração lenta: a câmera nunca está parada, mas nunca distrai (some no mergulho, perto do papel)
    const r = 0.0025 * respiro;
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

  // o retângulo do canvas só muda no redimensionamento: lido aqui, nunca durante o gesto (sem leitura de layout)
  const rect = { left: 0, top: 0, width: 1, height: 1 };
  const medirRect = () => { const r = canvas.getBoundingClientRect(); rect.left = r.left; rect.top = r.top; rect.width = r.width || 1; rect.height = r.height || 1; };
  const tamanho = () => {
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    aspecto = w / Math.max(1, h);
    historia.aspecto.value = aspecto;
    cache.clear();
    medirRect();
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
  let rodando = false;
  let perdido = false;
  // o carimbo do rAF (não performance.now()): todo movimento anda por tempo real, nunca por contagem de quadros
  const quadro = (carimbo?: number) => {
    const agora = carimbo ?? performance.now();
    const dtMs = ritmo.tick(agora, !document.hidden);
    if (dtMs < 0) return; // ritmo uniforme: este tick fica sem quadro
    const custo0 = performance.now();
    // a entrada do dedo entra primeiro, antes de qualquer movimento ou desenho deste quadro
    for (const fn of passos) fn(agora, dtMs);
    anima.passo((dtMs / 1000) * escalaT);
    toque.atualizar(dtMs / 1000);
    historia.atualizar((dtMs / 1000) * escalaT);
    const t = anima.agora;
    livro.atualizar(t);
    agua.atualizar(t);
    terra.atualizar(t);
    fogo.atualizar(t, dtMs / 1000);
    ar.atualizar(t);
    luz.fresta.value = livro.fresta.value;
    luz.atualizar(livro.abertura.value);
    aplicarCamera(t);
    pos.render();
    ritmo.custo(performance.now() - custo0);
    opcoes.aoQuadro?.(dtMs, !document.hidden);
  };
  /* ---------- aquecimento: compila todo shader e sobe toda textura agora, sob o pôster ----------
   * Os efeitos dos gestos e da transição nascem escondidos; sem isto, o primeiro gesto de cada elemento
   * compilaria o seu material no meio do toque (o "engasgo de primeira vez"). Dois quadros com tudo visível,
   * sem recorte de frustum, e o estado volta exatamente como estava. O pôster cobre o canvas até a cena ficar pronta. */
  {
    const t0 = performance.now();
    const escondidos: Object3D[] = [], recortados: Object3D[] = [];
    cena.traverse((o) => {
      if (!o.visible) { escondidos.push(o); o.visible = true; }
      if (o.frustumCulled) { recortados.push(o); o.frustumCulled = false; }
    });
    aplicarCamera(0);
    try { pos.render(); pos.render(); } catch (erro) { console.warn('[grimório] aquecimento', erro); }
    for (const o of escondidos) o.visible = false;
    for (const o of recortados) o.frustumCulled = true;
    if (import.meta.env.DEV) console.info(`[grimório] aquecimento: ${Math.round(performance.now() - t0)} ms (${escondidos.length} objetos escondidos compilados)`);
  }
  const iniciar = () => { if (rodando || perdido) return; rodando = true; void renderer.setAnimationLoop(quadro); };
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
    return { x: rect.left + ((v.x + 1) / 2) * rect.width, y: rect.top + ((1 - v.y) / 2) * rect.height };
  };
  const ray = new Raycaster();
  const ndc = new Vector2();
  const planoPagina = new Plane(new Vector3(0, 1, 0), 0);
  const cima = new Vector3(0, 1, 0);
  const origem = new Vector3();
  const acerto = new Vector3();
  /** The Seal's centre in world space (a shared scratch vector: copy it if you keep it). */
  const origemSelo = () => {
    livro.raiz.updateWorldMatrix(true, false);
    return origem.set(SELO_NA_PAGINA.x, SELO_NA_PAGINA.y, SELO_NA_PAGINA.z).applyMatrix4(livro.raiz.matrixWorld);
  };

  return {
    backend, nivel, livro, anima, irPara, agua, terra, fogo, ar,
    async conselho() {
      // a cabeça do fecho, no espaço da raiz do livro (os pontos vêm no mundo)
      const pts = livro.pontos('cabecaFecho');
      const centro = pts.reduce((a, p) => a.add(p), new Vector3()).multiplyScalar(1 / Math.max(1, pts.length));
      livro.raiz.updateWorldMatrix(true, false);
      const local = centro.applyMatrix4(livro.raiz.matrixWorld.clone().invert());
      await conselho.executar(anima, local);
    },
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
      ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -(((clientY - rect.top) / rect.height) * 2 - 1));
      ray.setFromCamera(ndc, camera);
      const o = origemSelo();
      planoPagina.set(cima, -o.y);
      const hit = ray.ray.intersectPlane(planoPagina, acerto);
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
        pixelRatio: renderer.getPixelRatio(), largura: canvas.width, altura: canvas.height, ritmo: ritmo.estatisticas(),
      };
    },
    ritmo, toque,
    antesDoQuadro(fn) { passos.add(fn); return () => { passos.delete(fn); }; },
    escalaTempo(v) { escalaT = Math.max(0.05, v); },
    async entrarNaHistoria({ aoCobrir, aoPico }) {
      // o mergulho: a câmera avança pela linha de visão até 1,6 cm do Selo, acelerando, e a lente fecha um pouco
      // o centro real do Selo (os pontos do próprio decalque, no mundo), não o ponto nominal da página
      const pts = livro.pontos('selo');
      const selo = pts.length ? pts.reduce((a, p) => a.add(p), new Vector3()).multiplyScalar(1 / pts.length) : origemSelo().clone();
      const de = { pos: atual.pos.clone(), alvo: atual.alvo.clone(), fov: atual.fov };
      const dir = de.pos.clone().sub(selo).normalize();
      const fim = selo.clone().addScaledVector(dir, 0.022);
      const T = TEMPOS_HISTORIA;
      historia.grupo.visible = true;
      void anima.animar({
        de: 0, para: 1, duracao: T.mergulho, easing: easeInQuad, chave: 'camera',
        aplicar: (k) => {
          atual.pos.lerpVectors(de.pos, fim, k);
          // o olhar centra o Selo cedo (no primeiro terço), antes de a câmera acelerar
          atual.alvo.lerpVectors(de.alvo, selo, easeOutCubic(Math.min(1, k * 4)));
          atual.fov = de.fov + (48 - de.fov) * k;
          respiro = 1 - k;
        },
      });
      // a luz da fresta sobe e os quatro quadrantes acendem juntos; o bloom acompanha
      void anima.animar({ de: livro.fresta.value, para: 1.2, duracao: 1.2, easing: easeOutCubic, chave: 'fresta', aplicar: (k) => { livro.fresta.value = k; } });
      for (const el of ['agua', 'terra', 'fogo', 'ar'] as const) void anima.animar({ de: livro.brilho[el].value, para: 1, duracao: 0.9, easing: easeOutCubic, aplicar: (k) => { livro.brilho[el].value = k; } });
      void anima.animar({ de: pos.bloomForca.value, para: 1.5, duracao: 1.6, easing: easeInQuad, aplicar: (k) => { pos.bloomForca.value = k; } });
      void anima.animar({ de: 0, para: 1, duracao: 1.5, atraso: 0.2, easing: easeInQuad, aplicar: (k) => { historia.velocidade.value = k; } });
      // a luz abre a partir do Selo (já no centro) e só cobre a tela inteira no pico, sem patamar de branco
      void anima.animar({ de: 0, para: 1, duracao: T.pico - 0.55, atraso: 0.55, easing: (t) => t * t * t, aplicar: (k) => { historia.clarao.value = k; } });
      await anima.esperar(T.cobrir);
      aoCobrir();
      await anima.esperar(T.pico - T.cobrir);
      aoPico();
    },
    dispose() {
      parar();
      if (import.meta.env.DEV && janelaDev.__grimorioCena === bancadaDev) delete janelaDev.__grimorioCena;
      ro.disconnect();
      document.removeEventListener('visibilitychange', visibilidade);
      canvas.removeEventListener('webglcontextlost', aoPerderGL);
      anima.limpar();
      pos.dispose(); agua.dispose(); terra.dispose(); fogo.dispose(); ar.dispose(); conselho.dispose(); livro.dispose(); luz.dispose(); ceu.dispose();
      renderer.dispose();
    },
  };
}
