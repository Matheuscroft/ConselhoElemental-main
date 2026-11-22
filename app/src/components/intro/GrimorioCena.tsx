import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type PointerEvent as PointerEventReact } from 'react';
import { lunarSnapshot } from '@/components/temporal/celestial/lunar-presentation';
import type { SanctuaryCityId } from '@/lib/temporal/sanctuary-city';
import {
  avancar, avancarPorToque, elementoAtual, encerrado, ESTADO_INICIAL, type ElementoCerimonia, type EstadoGrimorio, type SinalGrimorio,
} from '@/lib/intro/cerimonia';
import {
  ARCO_AGUA, avaliarRisco, iniciarSulco, largar, levantouOSuficiente, moverSulco, passoSegurar, pressionar, progressoLevantar, SEGURAR_INICIAL,
  soltarSulco, SULCO_INICIAL, TRACO_FOGO,
  type Amostra, type EstadoSegurar, type EstadoSulco,
} from '@/lib/intro/gestos';
import { criarMonitorQuadros, nivelInicial, type NivelGrimorio } from '@/lib/intro/qualidade';
import { INSTRUCAO, LENDA, LENDA_INTEIRA, oracoesVisiveis, TEXTO, TOTAL_ORACOES } from '@/lib/intro/textos';
import { criarSomGrimorio, type SomGrimorio } from '@/lib/intro/som';
import type { ControleGrimorio3D, PontoTela } from './cena';
import './grimorio.css';

/**
 * The first-run grimoire: replaces the old awakening scene with the same contract.
 *
 * `onComplete({ soundEnabled })` = the ceremony was done; `onSkip` = it was skipped. Both are called
 * exactly once. Nothing here reads or writes progress, scoring, the account or storage: the parent
 * remembers that the opening was seen, exactly as before.
 */
export interface GrimorioCenaProps {
  readonly at?: Date;
  readonly cityId?: SanctuaryCityId;
  readonly onSkip?: () => void;
  readonly onComplete?: (detail: { soundEnabled: boolean }) => void;
  /** Laboratory only: start straight on a beat, or force a level. */
  readonly bancada?: { readonly nivel?: NivelGrimorio; readonly aoControle?: (c: ControleGrimorio3D | null) => void };
}

const reduzMovimento = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const temWebGPU = () => typeof navigator !== 'undefined' && 'gpu' in navigator;
const temWebGL2 = () => {
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};

const reducer = (estado: EstadoGrimorio, sinal: SinalGrimorio) => avancar(estado, sinal, TOTAL_ORACOES);

export function GrimorioCena({ at, onSkip, onComplete, bancada }: GrimorioCenaProps) {
  const momento = useMemo(() => at ?? new Date(), [at]);
  const lua = useMemo(() => lunarSnapshot(momento), [momento]);
  const [nivel, setNivel] = useState<NivelGrimorio>(() => bancada?.nivel ?? nivelInicial({
    movimentoReduzido: reduzMovimento(), webgpu: temWebGPU(), webgl2: temWebGL2(),
  }));
  const [estado, enviar] = useReducer(reducer, ESTADO_INICIAL);
  const [pronta, setPronta] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [alvoFecho, setAlvoFecho] = useState<PontoTela | null>(null);
  const [saindo, setSaindo] = useState(false);
  const [somLigado, setSomLigado] = useState(false);
  const [somIniciado, setSomIniciado] = useState(false);
  const somRef = useRef<SomGrimorio | null>(null);
  const palcoRef = useRef<HTMLDivElement | null>(null);
  const cenaRef = useRef<ControleGrimorio3D | null>(null);
  const entregue = useRef(false);

  /* ---------------- 3D sob demanda ---------------- */
  useEffect(() => {
    if (nivel === 'C') return;
    const palco = palcoRef.current;
    if (!palco) return;
    // cada instância 3D tem o próprio canvas: duas montagens seguidas (modo estrito, troca de nível) nunca
    // dividem um contexto; no WebGL2, descartar uma derrubava o contexto da outra
    const canvas = document.createElement('canvas');
    canvas.className = 'grimorio-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    palco.appendChild(canvas);
    let vivo = true;
    let controle: ControleGrimorio3D | null = null;
    const monitor = criarMonitorQuadros();
    let estavel = 0;
    import('./cena')
      .then(({ criarGrimorio3D }) => criarGrimorio3D(canvas, {
        nivel,
        lua: { fracao: lua.illuminated, crescente: lua.waxing },
        aoQuadro: (ms, visivel) => {
          // na bancada, um nível escolhido à mão é ensaio daquele nível: sem queda automática
          if (bancada?.nivel) return;
          // mede só depois do primeiro quadro estável (meio segundo de cena visível)
          if (estavel < 30) { estavel += 1; return; }
          if (monitor.registrar(ms, visivel)) {
            console.warn('[grimório] quadros lentos: passando para a versão estática', monitor.ultimaMediana);
            setNivel('C');
          }
        },
        aoPerder: (motivo) => { if (!vivo) return; console.warn('[grimório]', motivo); setNivel('C'); },
      }))
      .then((c) => {
        if (!vivo) { c.dispose(); return; }
        controle = c; cenaRef.current = c; setPronta(true);
        bancada?.aoControle?.(c);
      })
      .catch((erro) => { console.warn('[grimório] o 3D não carregou; versão estática', erro); if (vivo) setNivel('C'); });
    return () => {
      vivo = false;
      controle?.dispose(); cenaRef.current = null;
      canvas.remove();
      bancada?.aoControle?.(null);
    };
    // o 3D nasce uma vez por nível; a lua não muda durante a cerimônia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivel]);

  /* ---------------- alvo acessível sobre o fecho ---------------- */
  useEffect(() => {
    if (!pronta || estado.fase !== 'poster') { setAlvoFecho(null); return; }
    let quadro = 0;
    const seguir = () => {
      const p = cenaRef.current?.posicaoNaTela('cabecaFecho') ?? null;
      setAlvoFecho((ant) => (ant && p && Math.abs(ant.x - p.x) < 0.5 && Math.abs(ant.y - p.y) < 0.5 && Math.abs(ant.raio - p.raio) < 0.5 ? ant : p));
      quadro = requestAnimationFrame(seguir);
    };
    seguir();
    return () => cancelAnimationFrame(quadro);
  }, [pronta, estado.fase]);

  /* ---------------- entrega (uma vez) ---------------- */
  const entregar = useCallback((como: 'pular' | 'concluir') => {
    if (entregue.current) return;
    entregue.current = true;
    setSaindo(true);
    window.setTimeout(() => {
      if (como === 'pular') onSkip?.();
      else onComplete?.({ soundEnabled: somLigado });
    }, 300);
    void somRef.current?.encerrar(300);
  }, [onSkip, onComplete, somLigado]);

  useEffect(() => {
    if (estado.fase === 'pulado') entregar('pular');
    if (estado.fase === 'concluido') entregar('concluir');
  }, [estado.fase, entregar]);

  /* ---------------- abertura ---------------- */
  const abrir = useCallback(async () => {
    if (estado.fase !== 'poster' || ocupado) return;
    // o primeiro toque é o gesto que o iOS exige: o som nasce aqui, e o próprio trinco já soa
    if (!somRef.current) somRef.current = criarSomGrimorio();
    const som = somRef.current;
    const iniciando = som.iniciar().then(() => { setSomIniciado(som.iniciado); setSomLigado(som.iniciado && !som.mudo); });
    enviar({ tipo: 'abrir' });
    const c = cenaRef.current;
    if (!c) { enviar({ tipo: 'aberto' }); return; }
    setOcupado(true);
    await iniciando;
    await c.abrir((evento, dur) => {
      if (evento === 'toque') som.cue('fecho.toque', { pan: 0.35 });
      else if (evento === 'giro') som.cue('fecho.giro', { pan: 0.35 });
      else if (evento === 'capa') som.cue('capa', { dur });
      else if (evento === 'luz') som.cue('luz.sobe');
    });
    setOcupado(false);
    enviar({ tipo: 'aberto' });
  }, [estado.fase, ocupado]);

  /* ---------------- lenda: uma oração por vez; o toque adianta ---------------- */
  useEffect(() => {
    if (estado.fase !== 'lenda') return;
    const { paragrafo, ate } = oracoesVisiveis(estado.oracao);
    const fimParagrafo = ate === LENDA[paragrafo].length;
    const espera = fimParagrafo ? 3200 : 1500;
    somRef.current?.cue('lenda.linha');
    const id = window.setTimeout(() => enviar({ tipo: 'oracao' }), espera);
    return () => window.clearTimeout(id);
  }, [estado.fase, estado.oracao]);

  /* ---------------- som: aba oculta suspende; o botão alterna ---------------- */
  useEffect(() => {
    const vis = () => { void (document.hidden ? somRef.current?.suspender() : somRef.current?.retomar()); };
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); void somRef.current?.encerrar(300); };
  }, []);
  const alternarSom = useCallback(() => {
    const som = somRef.current; if (!som?.iniciado) return;
    som.definirMudo(!som.mudo); setSomLigado(!som.mudo);
  }, []);

  const tocarFundo = useCallback(() => {
    if (nivel === 'C') { enviar(avancarPorToqueSinal(estado)); return; }
    if (estado.fase === 'lenda') enviar({ tipo: 'oracao' });
  }, [estado, nivel]);

  const pular = useCallback(() => enviar({ tipo: 'pular' }), []);
  const comecar = useCallback(() => { somRef.current?.cue('final.botao'); enviar({ tipo: 'comecar' }); }, []);

  /* ---------------- gestos (níveis A e B): câmera, convite, dedo e alternativa de toque ---------------- */
  const em3D = nivel !== 'C' && pronta;
  const elementoGesto: ElementoCerimonia | null = estado.fase === 'gesto' ? elementoAtual(estado) : null;
  const gesto = useRef<{
    sulco: EstadoSulco; segurar: EstadoSegurar; amostras: Amostra[]; direcao: -1 | 0 | 1; pan: number; levanta: number;
    ponteiro: number | null; t: number; inicio: { x: number; y: number; t: number } | null; arrastou: boolean; ocupado: boolean;
  }>({ sulco: SULCO_INICIAL, segurar: SEGURAR_INICIAL, amostras: [], direcao: 1, pan: 0.35, levanta: 0, ponteiro: null, t: 0, inicio: null, arrastou: false, ocupado: false });
  const [alvoGesto, setAlvoGesto] = useState<{ x: number; y: number } | null>(null);

  const despertar = useCallback(async (el: ElementoCerimonia) => {
    const c = cenaRef.current; const g = gesto.current;
    if (g.ocupado) return;
    g.ocupado = true;
    const som = somRef.current;
    som?.continuo('agua', 0); som?.continuo('terra', 0);
    if (c && el === 'agua') { som?.cue('agua.solta'); await c.agua.concluir(c.anima); }
    else if (c && el === 'terra') { c.tremer(0); som?.cue('terra.firma'); await c.terra.concluir(c.anima); }
    else if (c && el === 'ar') {
      som?.continuo('ar', 0.8);
      await c.ar.concluir(c.anima, () => { som?.continuo('ar', 0); som?.cue('ar.assenta'); });
    }
    else if (c && el === 'fogo') {
      som?.cue('fogo.risco', { forca: 1, pan: g.pan });
      await c.fogo.acender(c.anima, g.direcao, () => som?.cue('fogo.assenta'));
    }
    else if (c) await c.revelarTinta(el);
    enviar({ tipo: 'despertou', elemento: el });
  }, []);

  useEffect(() => {
    const c = cenaRef.current;
    if (!em3D || !c || !elementoGesto) return;
    if (estado.indice === 0) void c.irPara('gesto', 1.6);
    gesto.current = { sulco: SULCO_INICIAL, segurar: SEGURAR_INICIAL, amostras: [], direcao: 1, pan: 0.35, levanta: 0, ponteiro: null, t: 0, inicio: null, arrastou: false, ocupado: false };
    if (elementoGesto === 'fogo') { c.fogo.mostrar(); return; }
    if (elementoGesto === 'ar') {
      // a câmera abre um pouco para o canto da página caber no quadro
      c.ar.mostrar(); void c.irPara('gestoAr', 1.2);
      return () => somRef.current?.continuo('ar', 0);
    }
    if (elementoGesto === 'terra') {
      c.terra.mostrar();
      // o segurar anda a cada quadro: sobe com o dedo, recua (mais rápido) sem ele
      let quadro = 0, antes = performance.now();
      const passo = () => {
        const agora = performance.now(); const dt = Math.min(64, agora - antes); antes = agora;
        const g = gesto.current;
        if (!g.ocupado) {
          g.segurar = passoSegurar(g.segurar, dt);
          const k = g.segurar.progresso;
          c.terra.definir(k, g.segurar.segurando);
          c.tremer(g.segurar.segurando ? k : k * 0.3);
          somRef.current?.continuo('terra', k);
          if (g.segurar.concluido) { g.ponteiro = null; void despertar('terra'); }
        }
        quadro = requestAnimationFrame(passo);
      };
      quadro = requestAnimationFrame(passo);
      return () => { cancelAnimationFrame(quadro); c.tremer(0); somRef.current?.continuo('terra', 0); };
    }
    if (elementoGesto !== 'agua') return;
    c.agua.mostrar();
    somRef.current?.cue('gota.convite');
    // a gota volta a chamar a cada 8 s enquanto ninguém a pega; a voz da água se cala se o dedo para
    const convite = window.setInterval(() => {
      const g = gesto.current;
      if (g.sulco.progresso === 0 && g.ponteiro === null && !g.ocupado) somRef.current?.cue('gota.convite');
    }, 8000);
    const silencio = window.setInterval(() => { if (performance.now() - gesto.current.t > 160) somRef.current?.continuo('agua', 0); }, 100);
    return () => { window.clearInterval(convite); window.clearInterval(silencio); somRef.current?.continuo('agua', 0); };
  }, [em3D, elementoGesto, estado.indice, despertar]);

  useEffect(() => {
    const c = cenaRef.current;
    if (!em3D || !c || !elementoGesto) { setAlvoGesto(null); return; }
    let quadro = 0;
    const seguir = () => {
      const p = elementoGesto === 'agua' ? c.naTela(c.agua.posicaoGota())
        : elementoGesto === 'terra' ? c.naTela(c.terra.posicaoPedra())
        : elementoGesto === 'fogo' ? c.naTela(c.fogo.posicaoBrasa())
        : elementoGesto === 'ar' ? c.naTela(c.ar.posicaoCanto())
        : c.posicaoNaTela('selo');
      setAlvoGesto((ant) => (ant && p && Math.abs(ant.x - p.x) < 0.5 && Math.abs(ant.y - p.y) < 0.5 ? ant : p ? { x: p.x, y: p.y } : null));
      quadro = requestAnimationFrame(seguir);
    };
    seguir();
    return () => cancelAnimationFrame(quadro);
  }, [em3D, elementoGesto]);


  /** The touch alternative: one tap and the element completes through its own animation. */
  const automatico = useCallback(async () => {
    const c = cenaRef.current; const el = elementoGesto;
    if (!el || gesto.current.ocupado) return;
    if (!c || nivel === 'C') { enviar({ tipo: 'despertou', elemento: el }); return; }
    if (el === 'agua') {
      gesto.current.ocupado = true;
      gesto.current.t = performance.now();
      await c.agua.automatico(c.anima, (_k, vel) => { gesto.current.t = performance.now(); somRef.current?.continuo('agua', Math.min(1, vel * 0.8)); });
      gesto.current.ocupado = false;
    } else if (el === 'ar') {
      // a ponta sobe sozinha até o vento pegar
      gesto.current.ocupado = true;
      await c.anima.animar({ de: gesto.current.levanta, para: 0.7, duracao: 0.55, aplicar: (k) => { c.ar.definir(k); somRef.current?.continuo('ar', k); } });
      gesto.current.ocupado = false;
    } else if (el === 'fogo') {
      // o risco sozinho: faíscas correm o fio de dentro para fora, e ele acende
      gesto.current.ocupado = true;
      await c.anima.animar({ de: 0, para: 1, duracao: 0.28, aplicar: (k) => c.fogo.faisca(TRACO_FOGO.de.x + (TRACO_FOGO.ate.x - TRACO_FOGO.de.x) * k, TRACO_FOGO.de.y + (TRACO_FOGO.ate.y - TRACO_FOGO.de.y) * k, 1) });
      gesto.current.direcao = 1;
      gesto.current.ocupado = false;
    } else if (el === 'terra') {
      // as pedras sobem num tempo só, com o mesmo ronco e tremor do segurar
      gesto.current.ocupado = true;
      const de = gesto.current.segurar.progresso;
      await c.anima.animar({ de, para: 1, duracao: 1.0 * (1 - de) + 0.15, aplicar: (k) => { c.terra.definir(k, true); c.tremer(k); somRef.current?.continuo('terra', k); } });
      gesto.current.ocupado = false;
    }
    await despertar(el);
  }, [elementoGesto, nivel, despertar]);

  const aoTocarPagina = useCallback((e: PointerEventReact<HTMLDivElement>) => {
    const c = cenaRef.current; const g = gesto.current;
    if (!c || g.ocupado || !elementoGesto) return;
    if (elementoGesto === 'ar') {
      if (g.ponteiro !== null) { g.ponteiro = null; void c.ar.cair(c.anima); somRef.current?.continuo('ar', 0); return; }
      const ponto = c.projetarNaPagina(e.clientX, e.clientY);
      // generoso: o canto e uns 4 cm em volta dele começam o puxar
      if (!ponto || Math.hypot(ponto.x - c.ar.canto.x, ponto.y - c.ar.canto.y) > 0.045) return;
      g.ponteiro = e.pointerId; g.inicio = { x: e.clientX, y: e.clientY, t: performance.now() }; g.arrastou = false; g.levanta = 0;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético ou já solto */ }
      return;
    }
    if (elementoGesto === 'fogo') {
      if (g.ponteiro !== null) { g.ponteiro = null; g.amostras = []; return; }
      const ponto = c.projetarNaPagina(e.clientX, e.clientY);
      if (!ponto) return;
      g.ponteiro = e.pointerId; g.amostras = [{ ...ponto, t: performance.now() }]; g.inicio = { x: e.clientX, y: e.clientY, t: performance.now() }; g.arrastou = false;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético ou já solto */ }
      c.fogo.faisca(ponto.x, ponto.y, 0.3);
      return;
    }
    if (elementoGesto === 'terra') {
      if (g.ponteiro !== null) { g.segurar = largar(g.segurar); g.ponteiro = null; return; }
      const ponto = c.projetarNaPagina(e.clientX, e.clientY);
      // generoso: qualquer ponto a ~3 cm da pedra (o quadrante inteiro) começa o segurar
      if (!ponto || Math.hypot(ponto.x - c.terra.centro.x, ponto.y - c.terra.centro.y) > 0.032) return;
      g.segurar = pressionar(g.segurar); g.ponteiro = e.pointerId; g.inicio = { x: e.clientX, y: e.clientY, t: performance.now() }; g.arrastou = false;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético ou já solto */ }
      return;
    }
    if (g.ponteiro !== null) {
      // segundo dedo: cancela o gesto, sem perder o que já foi feito
      g.sulco = soltarSulco(g.sulco); g.ponteiro = null; c.agua.definir(g.sulco.progresso, false); somRef.current?.continuo('agua', 0);
      return;
    }
    const ponto = c.projetarNaPagina(e.clientX, e.clientY);
    if (!ponto) return;
    const s = iniciarSulco(g.sulco, ARCO_AGUA, ponto);
    if (!s.ativo) return;
    g.sulco = s; g.ponteiro = e.pointerId; g.t = performance.now(); g.inicio = { x: e.clientX, y: e.clientY, t: g.t }; g.arrastou = false;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ponteiro sintético ou já solto */ }
    c.agua.definir(s.progresso, true);
  }, [elementoGesto]);

  const aoMover = useCallback((e: PointerEventReact<HTMLDivElement>) => {
    const c = cenaRef.current; const g = gesto.current;
    if (!c || g.ponteiro !== e.pointerId) return;
    if (g.inicio && Math.hypot(e.clientX - g.inicio.x, e.clientY - g.inicio.y) > 8) g.arrastou = true;
    if (elementoGesto === 'ar' && g.inicio) {
      g.levanta = progressoLevantar(e.clientY - g.inicio.y, window.innerHeight);
      c.ar.definir(g.levanta);
      somRef.current?.continuo('ar', g.levanta);
      return;
    }
    if (elementoGesto === 'fogo') {
      const ponto = c.projetarNaPagina(e.clientX, e.clientY);
      if (!ponto) return;
      const agora = performance.now(); const ant = g.amostras[g.amostras.length - 1];
      const vel = ant ? Math.hypot(ponto.x - ant.x, ponto.y - ant.y) / Math.max(0.008, (agora - ant.t) / 1000) : 0;
      g.amostras.push({ ...ponto, t: agora });
      // as faíscas saem do dedo, mais vivas quanto mais rápido o risco
      c.fogo.faisca(ponto.x, ponto.y, Math.min(1, vel / 0.3));
      g.pan = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1));
      return;
    }
    const ponto = c.projetarNaPagina(e.clientX, e.clientY);
    if (!ponto) return;
    const s = moverSulco(g.sulco, ARCO_AGUA, ponto);
    const agora = performance.now();
    if (s.progresso > g.sulco.progresso) {
      // velocidade em "sulcos por segundo": 1 = o arco inteiro em um segundo
      const vel = (s.progresso - g.sulco.progresso) / Math.max(0.008, (agora - g.t) / 1000);
      somRef.current?.continuo('agua', Math.min(1, vel / 1.2));
      g.t = agora;
    }
    g.sulco = s;
    c.agua.definir(s.progresso, !s.concluido);
    if (s.concluido) { g.ponteiro = null; void despertar('agua'); }
  }, [despertar, elementoGesto]);

  const aoSoltar = useCallback((e: PointerEventReact<HTMLDivElement>) => {
    const c = cenaRef.current; const g = gesto.current;
    if (!c || g.ponteiro !== e.pointerId) return;
    g.ponteiro = null;
    if (elementoGesto === 'ar') {
      if (levantouOSuficiente(g.levanta)) { void despertar('ar'); return; }
      if (e.type === 'pointerup' && !g.arrastou && g.inicio && performance.now() - g.inicio.t < 350) { void automatico(); return; }
      somRef.current?.continuo('ar', 0);
      void c.ar.cair(c.anima);
      return;
    }
    if (elementoGesto === 'fogo') {
      const r = avaliarRisco(TRACO_FOGO, g.amostras);
      g.amostras = [];
      if (r.aceso) { g.direcao = r.direcao; void despertar('fogo'); return; }
      // um toque curto perto da brasa é a alternativa; um risco fraco só faz a brasa piscar
      const ponto = c.projetarNaPagina(e.clientX, e.clientY);
      const pertoDaBrasa = ponto && Math.hypot(ponto.x - TRACO_FOGO.de.x, ponto.y - TRACO_FOGO.de.y) < 0.022;
      if (e.type === 'pointerup' && !g.arrastou && pertoDaBrasa && g.inicio && performance.now() - g.inicio.t < 350) { void automatico(); return; }
      if (g.arrastou) { c.fogo.falhar(); somRef.current?.cue('fogo.risco', { forca: Math.max(0.2, r.cobertura * 0.6), pan: g.pan }); }
      return;
    }
    if (elementoGesto === 'terra') {
      g.segurar = largar(g.segurar);
      // um toque curto (soltou antes de 300 ms) é a alternativa: as pedras sobem sozinhas
      if (e.type === 'pointerup' && g.inicio && performance.now() - g.inicio.t < 300) void automatico();
      return;
    }
    g.sulco = soltarSulco(g.sulco);
    c.agua.definir(g.sulco.progresso, false);
    somRef.current?.continuo('agua', 0);
    // um toque curto na gota (sem arrastar) é a alternativa: ela corre sozinha
    if (e.type === 'pointerup' && !g.arrastou && g.inicio && performance.now() - g.inicio.t < 350) void automatico();
  }, [automatico, elementoGesto, despertar]);

  /* ---------------- Conselho: o Selo se completa e a luz desce ao fecho; depois a tela final ---------------- */
  useEffect(() => {
    if (estado.fase !== 'conselho') return;
    const c = cenaRef.current;
    let vivo = true;
    if (c && em3D) {
      somRef.current?.cue('selo.completo');
      // a câmera visita o fecho enquanto a luz desce e as cavidades acendem; depois recua para o quadro final
      const visita = window.setTimeout(() => { if (vivo) void c.irPara('fecho', 1.1); }, 550);
      void (async () => {
        await c.conselho();
        if (!vivo) return;
        await c.irPara('final', 2.0);
        if (vivo) enviar({ tipo: 'conselhoAssentou' });
      })();
      return () => { vivo = false; window.clearTimeout(visita); };
    }
    enviar({ tipo: 'conselhoAssentou' });
    return () => { vivo = false; };
  }, [estado.fase, em3D]);


  /* ---------------- texto na tela ---------------- */
  const lenda = estado.fase === 'lenda' ? oracoesVisiveis(estado.oracao) : null;
  const elemento = elementoAtual(estado);
  const instrucao = estado.fase === 'poster' ? TEXTO.abrir
    : estado.fase === 'gesto' && elemento ? INSTRUCAO[elemento].gesto
    : null;

  return (
    <section className="grimorio" data-fase={estado.fase} data-nivel={nivel} data-pronta={pronta} data-saindo={saindo} aria-labelledby="grimorio-titulo">
      <h2 id="grimorio-titulo" className="sr-only">{TEXTO.titulo}</h2>
      <div className="grimorio-poster" aria-hidden="true" />
      {nivel !== 'C' ? <div ref={palcoRef} className="grimorio-palco" aria-hidden="true" /> : null}
      <div className="grimorio-toque" onClick={tocarFundo} aria-hidden="true" />

      {alvoFecho && estado.fase === 'poster' ? (
        <button
          type="button"
          className="grimorio-alvo"
          style={{ left: alvoFecho.x, top: alvoFecho.y, width: Math.max(56, alvoFecho.raio * 2.4), height: Math.max(56, alvoFecho.raio * 2.4) }}
          onClick={() => void abrir()}
        >
          <span className="sr-only">{TEXTO.abrirRotulo}</span>
        </button>
      ) : null}

      {em3D && elementoGesto ? (
        <div className="grimorio-gesto" onPointerDown={aoTocarPagina} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar} aria-hidden="true" />
      ) : null}
      {elementoGesto && alvoGesto ? (
        <button
          type="button"
          className="grimorio-alvo"
          data-passa={em3D ? 'sim' : undefined}
          style={{ left: alvoGesto.x, top: alvoGesto.y, width: 56, height: 56 }}
          onClick={() => void automatico()}
        >
          <span className="sr-only">{INSTRUCAO[elementoGesto].alvo}</span>
        </button>
      ) : null}

      <div className="grimorio-topo">
        {somIniciado ? (
          <button type="button" className="grimorio-pilula" aria-pressed={somLigado} onClick={alternarSom}>{somLigado ? TEXTO.somDesligar : TEXTO.somLigar}</button>
        ) : <span />}
        {!encerrado(estado) && estado.fase !== 'final' ? <button type="button" className="grimorio-pilula" onClick={pular}>{TEXTO.pular}</button> : null}
      </div>

      {lenda ? (
        <p className="grimorio-lenda" key={lenda.paragrafo} aria-live="polite">
          <span className="sr-only">{LENDA_INTEIRA[lenda.paragrafo]}</span>
          <span aria-hidden="true">
            {LENDA[lenda.paragrafo].map((oracao, i) => (
              <span key={oracao} className="grimorio-oracao" data-visivel={i < lenda.ate}>{oracao} </span>
            ))}
          </span>
        </p>
      ) : null}

      {estado.fase === 'final' ? (
        <p className="grimorio-lenda grimorio-final"><span className="grimorio-nome">{TEXTO.nome}</span>{TEXTO.frase}</p>
      ) : null}

      <div className="grimorio-base">
        {instrucao ? <p className="grimorio-instrucao" aria-live="polite">{instrucao}</p> : null}
        {estado.fase === 'gesto' && elemento ? <p className="grimorio-alternativa">{INSTRUCAO[elemento].toque}</p> : null}
        {nivel === 'C' && !encerrado(estado) && estado.fase !== 'final' ? <p className="grimorio-alternativa">{TEXTO.avancar}</p> : null}
        {estado.fase === 'final' ? <button type="button" className="grimorio-comecar" onClick={comecar}>{TEXTO.comecar}</button> : null}
      </div>
      <p className="sr-only" aria-live="polite">{TEXTO.progresso(estado.despertos.length)}</p>
    </section>
  );
}

/** The static version moves one beat per tap; this turns that into the signal the reducer expects. */
function avancarPorToqueSinal(estado: EstadoGrimorio): SinalGrimorio {
  const proximo = avancarPorToque(estado, TOTAL_ORACOES);
  if (proximo.fase === 'final' && estado.fase === 'conselho') return { tipo: 'conselhoAssentou' };
  if (estado.fase === 'poster') return { tipo: 'abrir' };
  if (estado.fase === 'abrindo') return { tipo: 'aberto' };
  if (estado.fase === 'lenda') return { tipo: 'lendaLida' };
  const el = elementoAtual(estado);
  if (el) return { tipo: 'despertou', elemento: el };
  return { tipo: 'comecar' };
}

export default GrimorioCena;
