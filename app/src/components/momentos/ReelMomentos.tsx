import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { MENSAGEM_RECUSA } from '@/lib/momentos/momento';
import {
  apagarMomento,
  enderecoTemporario,
  lerMomento,
  momentosDisponiveis,
  salvarMomento,
} from '@/lib/momentos/momento-store';
import { AURA, TINTA } from '@/lib/design/palette';
import { DURATION } from '@/lib/motion/motion';
import { corDaMoldura, diaConquistado, type EstadoDoDia } from '@/lib/momentos/moldura';
import { distanciaDoCentro, indiceAtivo, posicaoReel } from '@/lib/momentos/reel';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';
import { AcoesMomento } from './AcoesMomento';
import { RunasMoldura } from './RunasMoldura';
import './reel-momentos.css';

// three.js only arrives when a card is open; the SVG frame never waits for it.
const MolduraFeitico = lazy(() => import('./MolduraFeitico'));

/** How long a conquest stays on the frame before it is cleared. */
const CONQUISTA_DURA_MS = 1800;

export interface DiaDoReel {
  /** Chave local do dia, a mesma do Temporal e dos Momentos. */
  readonly dia: string;
  readonly data: Date;
  readonly feitos: number;
  readonly total: number;
  readonly hoje: boolean;
  /** O elemento que lidera os ciclos do dia; null no dia vazio ou empatado. */
  readonly elemento: ElementoDoDia | null;
}

const MENSAGENS: Record<string, string> = {
  ...MENSAGEM_RECUSA,
  indisponivel: 'Este navegador não guarda fotos. Tente pelo app instalado.',
  espaco: 'Não há espaço no aparelho para mais uma foto.',
  falha: 'Não consegui guardar essa foto. Tente de novo.',
};

/** After this long without a scroll event the rail counts as settled. */
const ASSENTAR_MS = 120;

/**
 * Neighbours fade no lower than this: the text on a card at 0.38 measured
 * 2.2-3.2:1. At 0.75 the muted text (170 180 196 over 8 11 18) estimates at
 * about 5.5:1. The depth is carried by tilt, scale and the fixed blur instead.
 */
const PISO_OPACIDADE = 0.75;

const rotulo = (item: DiaDoReel, comFoto: boolean) => {
  const data = item.data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const ciclos = item.total ? `${item.feitos} de ${item.total} ciclos` : 'sem ciclos';
  return `${data}${item.hoje ? ', hoje' : ''}, ${ciclos}${comFoto ? ', com foto' : ''}`;
};

/**
 * The days as a coverflow you throw with a finger, and the calendar itself:
 * the card in front is the open day.
 *
 * The rail is a native scroller with snap points, so momentum, keyboard and
 * screen reader are the browser's own. The turn is written straight to the
 * cards from a rAF loop (transform and opacity only); the softening is a fixed
 * blur per distance class, never animated. Scrolling selects a day only after
 * a gesture of the person and only once the rail settles: a scroll the
 * component started itself never selects.
 */
export function ReelMomentos({ dias, selecionado, aoEscolher }: {
  dias: DiaDoReel[];
  /** Index of the open day in `dias`, or -1 when it is outside the window. */
  selecionado: number;
  aoEscolher: (indice: number) => void;
}) {
  const reduced = useMotionPreference();
  const trilhoRef = useRef<HTMLUListElement>(null);
  const [fotos, setFotos] = useState<Record<string, string>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const soltarRef = useRef<Array<() => void>>([]);
  const carregadosRef = useRef(new Set<string>());
  const gestoRef = useRef(false);
  const visualRef = useRef(0);
  const [rolando, setRolando] = useState(false);
  const [conquista, setConquista] = useState({ dia: '', n: 0 });
  const anteriorRef = useRef<EstadoDoDia | null>(null);
  const selecionadoRef = useRef(selecionado);
  const aoEscolherRef = useRef(aoEscolher);
  useEffect(() => {
    selecionadoRef.current = selecionado;
    aoEscolherRef.current = aoEscolher;
  });

  const chaves = dias.map((item) => item.dia).join('|');

  // Every object URL is released on the way out. Thirty blobs held by URLs
  // nobody revoked is how a gallery eats a phone's memory.
  useEffect(() => () => {
    soltarRef.current.forEach((soltar) => soltar());
    soltarRef.current = [];
  }, []);

  useEffect(() => {
    if (!momentosDisponiveis()) return;
    let vivo = true;

    void (async () => {
      for (const chave of chaves.split('|')) {
        if (!chave || carregadosRef.current.has(chave)) continue;
        const momento = await lerMomento(chave);
        if (!vivo) return;
        carregadosRef.current.add(chave);
        if (!momento) continue;
        const { url, soltar } = enderecoTemporario(momento.miniatura);
        soltarRef.current.push(soltar);
        setFotos((atual) => ({ ...atual, [chave]: url }));
      }
    })();

    return () => { vivo = false; };
  }, [chaves]);

  // The turn follows the finger, so it is written per frame rather than per
  // render, and only while the rail is actually moving.
  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    let frame = 0;
    let parar = 0;

    const medidas = () => {
      const cartoes = [...trilho.children] as HTMLElement[];
      if (!cartoes.length) return null;
      const largura = cartoes[0].offsetWidth;
      const passo = cartoes.length > 1 ? cartoes[1].offsetLeft - cartoes[0].offsetLeft : largura;
      return { cartoes, largura, passo, recuo: cartoes[0].offsetLeft };
    };

    const pintar = () => {
      const m = medidas();
      if (!m) return;
      m.cartoes.forEach((cartao, indice) => {
        const d = distanciaDoCentro(trilho.scrollLeft, trilho.clientWidth, m.passo, m.largura, m.recuo, indice);
        const p = posicaoReel(d);
        cartao.style.transform = reduced
          ? 'none'
          : `perspective(1100px) translateZ(${p.profundidade}px) rotateY(${p.rotacao}deg) scale(${p.escala})`;
        cartao.style.opacity = String(reduced ? 1 : Math.max(p.opacidade, PISO_OPACIDADE));
        const classe = String(Math.min(3, Math.round(Math.abs(d))));
        if (cartao.dataset.distancia !== classe) cartao.dataset.distancia = classe;
      });
      visualRef.current = indiceAtivo(trilho.scrollLeft, trilho.clientWidth, m.passo, m.largura, m.recuo, m.cartoes.length);
    };

    const assentou = () => {
      pintar();
      setRolando(false);
      if (!gestoRef.current) return;
      gestoRef.current = false;
      if (visualRef.current !== selecionadoRef.current) aoEscolherRef.current(visualRef.current);
    };

    const aoRolar = () => {
      setRolando(true);
      if (!frame) frame = requestAnimationFrame(() => { frame = 0; pintar(); });
      window.clearTimeout(parar);
      parar = window.setTimeout(assentou, ASSENTAR_MS);
    };

    // A resize moves every card, so the open day is brought back to the middle.
    // Programmatic, so it never selects.
    const recentrar = () => {
      pintar();
      const cartao = trilho.children[selecionadoRef.current] as HTMLElement | undefined;
      if (!cartao) return;
      gestoRef.current = false;
      trilho.scrollTo({ left: cartao.offsetLeft - (trilho.clientWidth - cartao.offsetWidth) / 2, behavior: 'auto' });
    };

    pintar();
    trilho.addEventListener('scroll', aoRolar, { passive: true });
    const observador = new ResizeObserver(recentrar);
    observador.observe(trilho);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.clearTimeout(parar);
      trilho.removeEventListener('scroll', aoRolar);
      observador.disconnect();
    };
  }, [reduced, chaves]);

  // The open day is brought to the middle by the component itself. That scroll
  // is programmatic: it drops any pending gesture so it can never select.
  useEffect(() => {
    const trilho = trilhoRef.current;
    const cartao = trilho?.children[selecionado] as HTMLElement | undefined;
    if (!trilho || !cartao) return;
    gestoRef.current = false;
    trilho.scrollTo({
      left: cartao.offsetLeft - (trilho.clientWidth - cartao.offsetWidth) / 2,
      behavior: reduced ? 'auto' : 'smooth',
    });
    if (trilho.contains(document.activeElement)) {
      (cartao.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
    }
  }, [selecionado, chaves, reduced]);

  const abertoDia = selecionado >= 0 ? dias[selecionado] : undefined;
  const abertoChave = abertoDia?.dia;
  const abertoFeitos = abertoDia?.feitos ?? 0;
  const abertoTotal = abertoDia?.total ?? 0;

  // Only the last cycle of the open day, completed right here, is a conquest.
  // It is held back one conjure beat so it never lands on top of the XP receipt.
  useEffect(() => {
    const atual: EstadoDoDia | null = abertoChave === undefined
      ? null
      : { dia: abertoChave, feitos: abertoFeitos, total: abertoTotal };
    const conquistou = diaConquistado(anteriorRef.current, atual);
    anteriorRef.current = atual;
    if (!conquistou || !atual) return;
    let limpar = 0;
    const atraso = window.setTimeout(() => {
      setConquista((c) => ({ dia: atual.dia, n: c.n + 1 }));
      limpar = window.setTimeout(() => setConquista((c) => ({ ...c, dia: '' })), CONQUISTA_DURA_MS);
    }, DURATION.conjure);
    return () => { window.clearTimeout(atraso); window.clearTimeout(limpar); };
  }, [abertoChave, abertoFeitos, abertoTotal]);

  const anotarGesto = useCallback(() => { gestoRef.current = true; }, []);

  const mover = useCallback((passo: number) => {
    const base = selecionadoRef.current >= 0 ? selecionadoRef.current : visualRef.current;
    const alvo = base + passo;
    if (alvo >= 0 && alvo < dias.length) aoEscolherRef.current(alvo);
  }, [dias.length]);

  const guardar = useCallback(async (dia: string, arquivo: File | undefined) => {
    if (!arquivo) return;
    setAviso(null);
    const resultado = await salvarMomento(dia, arquivo);
    if (!resultado.ok) {
      setAviso(MENSAGENS[resultado.motivo] ?? MENSAGENS.falha);
      return;
    }
    const { url, soltar } = enderecoTemporario(resultado.momento.miniatura);
    soltarRef.current.push(soltar);
    setFotos((atual) => ({ ...atual, [dia]: url }));
  }, []);

  const remover = useCallback(async (dia: string) => {
    if (!(await apagarMomento(dia))) return;
    setFotos((atual) => {
      const proximo = { ...atual };
      delete proximo[dia];
      return proximo;
    });
  }, []);

  const aberto = selecionado >= 0 ? dias[selecionado] : undefined;
  const podeVoltar = selecionado !== 0;
  const podeAvancar = selecionado !== dias.length - 1;

  return (
    <div className="reel-momentos" data-reduzido={reduced}>
      <div className="reel-palco" data-rolando={rolando}>
        <ul
          className="reel-trilho"
          ref={trilhoRef}
          aria-label="Seus dias"
          onPointerDown={anotarGesto}
          onWheel={anotarGesto}
          onTouchStart={anotarGesto}
          onKeyDown={(evento) => {
            if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
            evento.preventDefault();
            mover(evento.key === 'ArrowLeft' ? -1 : 1);
          }}
        >
          {dias.map((item, indice) => {
            const foto = fotos[item.dia];
            const eAberto = indice === selecionado;
            const cor = item.elemento ? corDaMoldura(item.elemento, AURA) : undefined;
            const completo = item.total > 0 && item.feitos >= item.total;
            return (
              <li key={item.dia} className="reel-cartao" data-distancia="0">
                <button
                  type="button"
                  className="reel-moldura"
                  data-ativo={eAberto}
                  data-foto={foto ? 'sim' : 'nao'}
                  data-tinta={eAberto && item.elemento ? item.elemento : undefined}
                  style={eAberto && item.elemento
                    ? ({ '--runa-cor': cor, '--runa-tinta': TINTA[item.elemento] } as React.CSSProperties)
                    : undefined}
                  aria-pressed={eAberto}
                  aria-current={item.hoje ? 'date' : undefined}
                  aria-label={rotulo(item, Boolean(foto))}
                  tabIndex={eAberto || selecionado < 0 ? 0 : -1}
                  onClick={() => {
                    gestoRef.current = false;
                    if (!eAberto) aoEscolher(indice);
                  }}
                >
                  {foto ? <img src={foto} alt="" loading="lazy" decoding="async" draggable={false} /> : null}
                  <span className="reel-pelicula" aria-hidden="true" />
                  {eAberto ? (
                    <RunasMoldura
                      elemento={item.elemento}
                      completo={completo}
                      conquista={conquista.dia === item.dia ? conquista.n : 0}
                    />
                  ) : null}
                  <span className="reel-texto" aria-hidden="true">
                    <span className="reel-semana">{item.data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
                    <strong className="reel-numero">{String(item.data.getDate()).padStart(2, '0')}</strong>
                    <span className="reel-mes">{item.data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    <span className="reel-hoje">{item.hoje ? 'Hoje' : ' '}</span>
                    <span className="reel-ciclos">{item.total ? `${item.feitos}/${item.total} ciclos` : 'Sem ciclos'}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {aberto ? (
          <Suspense fallback={null}>
            <MolduraFeitico
              elemento={aberto.elemento}
              completo={aberto.total > 0 && aberto.feitos >= aberto.total}
              rolando={rolando}
              ativo
              conquista={conquista.dia === aberto.dia ? conquista.n : 0}
              reduzido={reduced}
            />
          </Suspense>
        ) : null}
      </div>

      <div className="reel-navegacao">
      <button
        type="button"
        className="reel-seta"
        data-lado="anterior"
        aria-label="Dia anterior"
        disabled={!podeVoltar}
        onClick={() => mover(-1)}
      >
        <ChevronLeft size={18} aria-hidden="true" />
      </button>
        <div className="reel-pontos" aria-hidden="true">
          {dias.map((item, indice) => <i key={item.dia} data-ativo={indice === selecionado} />)}
        </div>
      <button
        type="button"
        className="reel-seta"
        data-lado="proximo"
        aria-label="Próximo dia"
        disabled={!podeAvancar}
        onClick={() => mover(1)}
      >
        <ChevronRight size={18} aria-hidden="true" />
      </button>
      </div>

      {aberto ? (
        <AcoesMomento
          temFoto={Boolean(fotos[aberto.dia])}
          aoEscolher={(arquivo) => void guardar(aberto.dia, arquivo)}
          aoRemover={() => void remover(aberto.dia)}
        />
      ) : null}
      <p className="reel-privado">Fica só neste aparelho.</p>
      {aviso ? <p className="reel-aviso" role="alert">{aviso}</p> : null}
    </div>
  );
}

export default ReelMomentos;
