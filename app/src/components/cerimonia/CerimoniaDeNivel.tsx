import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { tocarToque } from '@/lib/audio';
import { ACENTO, AURA, TINTA } from '@/lib/design/palette';
import {
  ANEL,
  CARTAO_INICIO,
  CARTAO_PASSO,
  CENA,
  ELEMENTOS_DOS_CARTOES,
  elementoDominante,
  faseDaAscensao,
  fracaoAntesValida,
  fracaoDoAnelEm,
  marcosDoPreenchimento,
  niveisDosElementos,
  tabelaDoAnel,
  type ElementoDoCartao,
  type FaseDaAscensao,
} from '@/lib/cerimonia/nivel';
import { useAppStore } from '@/stores/appStore';
import type { CenaDaAscensao, LayoutDaAscensao } from './ascensao-cena';
import './cerimonia-de-nivel.css';

export interface CerimoniaDeNivelProps {
  readonly de: number;
  readonly para: number;
  /** Mastery title of the new level. */
  readonly titulo: string;
  /** How far through the new level the mage already is (0..1). */
  readonly fracao: number;
  /** How far through the level just beaten the mage was before the gain (0..1); the ring starts here. */
  readonly fracaoAntes?: number;
  /** XP still missing for the next level. */
  readonly faltam: number;
  readonly onFechar: () => void;
}

type Cena = 'anel' | 'cartoes' | 'numero' | 'fim';

const ROTULO: Record<ElementoDoCartao, string> = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
const CORPO = '/sanctuary/elemental-body-v1.png';
const esfera = (e: ElementoDoCartao) => `/sanctuary/elements/${e}-v1.webp`;

/** The ring of the sanctuary (`AnelXp`): same ellipse, same path, normalised to a length of 1. */
const CAMINHO_DO_ANEL = 'M100 2A98 14 0 1 1 100 30A98 14 0 1 1 100 2';
const BRILHO = 0.07;
const PONTA = 0.012;
/** One lap of the glint that runs along the filled ring, in ms. */
const VOLTA_DO_BRILHO = 2400;
/** How long the ceremony waits for the WebGL chunk before it settles for the CSS version. */
const ESPERA_DO_WEBGL = 1800;

/** Shards that burst out of the title: where they end up (px), how far they spin, their size. */
const ESTILHACOS = [
  { x: -150, y: -70, r: 220, s: 14, f: 'losango' },
  { x: 140, y: -90, r: -260, s: 18, f: 'losango' },
  { x: -110, y: 60, r: 300, s: 10, f: 'triangulo' },
  { x: 120, y: 70, r: -180, s: 12, f: 'losango' },
  { x: -60, y: -130, r: 160, s: 9, f: 'triangulo' },
  { x: 70, y: -140, r: -200, s: 11, f: 'losango' },
  { x: -170, y: 0, r: -320, s: 8, f: 'ponto' },
  { x: 170, y: 10, r: 280, s: 8, f: 'ponto' },
  { x: 0, y: 110, r: 240, s: 9, f: 'ponto' },
  { x: -30, y: -40, r: 120, s: 7, f: 'ponto' },
] as const;

/** Four-pointed sparks around a card: direction in px. */
const FAISCAS = [
  { x: -34, y: -26 }, { x: 36, y: -30 }, { x: -30, y: 28 }, { x: 40, y: 24 },
] as const;
/** The same sparks, bigger, for the shock of the seal lighting up. */
const FAISCAS_DO_SELO = [
  { x: -150, y: -90 }, { x: 140, y: -110 }, { x: -170, y: 40 }, { x: 160, y: 60 },
  { x: -70, y: -170 }, { x: 80, y: 150 }, { x: 0, y: -190 }, { x: -110, y: 130 },
] as const;
/** Sparks along the ring for the CSS version of the burst (no WebGL): how many. */
const FAISCAS_DO_ANEL = 14;

const px = (n: number) => `${n}px`;
const ms = (n: number) => `${n}ms`;

/** An image that is only decoration: if it fails to load it just goes away. */
function Imagem({ src, largura, altura, className }: { src: string; largura: number; altura: number; className?: string }) {
  const esconder = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.visibility = 'hidden';
  };
  return (
    <img
      src={src}
      alt=""
      width={largura}
      height={altura}
      loading="eager"
      decoding="async"
      draggable={false}
      className={className}
      onError={esconder}
    />
  );
}

/** The number seal: grey until it lights up, with its waves and sparks. Small in the ring scene, large in the summary. */
function Selo({ numero, pulsa, faiscas, mini }: { numero: number; pulsa: boolean; faiscas: boolean; mini?: boolean }) {
  return (
    <div className={mini ? 'cn-selo cn-selo--mini' : 'cn-selo'} data-pulsa={pulsa} aria-hidden="true">
      <span className="cn-selo__onda cn-selo__onda--a" />
      <span className="cn-selo__onda cn-selo__onda--b" />
      <div className="cn-selo__corpo">
        <span className="cn-selo__aceso" />
        <strong>
          <Contagem valor={numero} beat="conjure" />
        </strong>
      </div>
      {faiscas
        ? FAISCAS_DO_SELO.map((f, k) => (
            <i key={k} className="cn-faisca cn-faisca--selo" style={{ '--tx': px(f.x), '--ty': px(f.y), '--k': k } as CSSProperties} />
          ))
        : null}
    </div>
  );
}

interface TracosDoAnel {
  readonly fio: RefObject<SVGPathElement | null>;
  readonly recorte: RefObject<SVGPathElement | null>;
  readonly brilho: RefObject<SVGPathElement | null>;
  readonly ponta: RefObject<SVGPathElement | null>;
}

/** The ring as an SVG: track, fill, glint (seen only through the fill) and tip. `fracao` is only the first paint; the loop moves it. */
function AnelSvg({ fracao, mascara, tracos }: { fracao: number; mascara: string; tracos?: TracosDoAnel }) {
  return (
    <svg className="cn-anel" viewBox="0 0 200 32" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <mask id={mascara} maskUnits="userSpaceOnUse" x={-4} y={-4} width={208} height={40}>
          <path ref={tracos?.recorte} className="cn-anel__recorte" pathLength={1} d={CAMINHO_DO_ANEL}
            strokeDasharray="1 1" strokeDashoffset={1 - fracao} />
        </mask>
      </defs>
      <path className="cn-anel__trilho" pathLength={1} d={`${CAMINHO_DO_ANEL}Z`} />
      <path ref={tracos?.fio} className="cn-anel__fio" pathLength={1} d={CAMINHO_DO_ANEL}
        strokeDasharray="1 1" strokeDashoffset={1 - fracao} />
      <g mask={`url(#${mascara})`}>
        <path ref={tracos?.brilho} className="cn-anel__brilho" pathLength={1} d={CAMINHO_DO_ANEL}
          strokeDasharray={`${BRILHO} ${1 - BRILHO}`} />
      </g>
      <path ref={tracos?.ponta} className="cn-anel__ponta" pathLength={1} d={CAMINHO_DO_ANEL}
        strokeDasharray={`${PONTA} ${1 - PONTA}`} strokeDashoffset={PONTA - fracao} />
    </svg>
  );
}

type ModoDaAscensao = 'carregando' | 'webgl' | 'css';

interface AscensaoProps {
  readonly de: number;
  readonly para: number;
  readonly inicio: number;
  readonly elemento: ElementoDoCartao;
  readonly aoTerminar: () => void;
}

/**
 * The opening scene, "the bar completes". The ring at the mage's feet is the
 * XP bar of the level just beaten: it fills from where it was to the end,
 * faster and faster, throwing sparks that spiral up from its tip; when it
 * closes, shock rings run across the floor, a flash, and a burst of particles
 * flies into the seal, which lights up and counts from the old level to the
 * new one while the title lands.
 *
 * One clock drives it all (`requestAnimationFrame`, with the step clamped so a
 * hidden tab simply pauses it). The loop moves the ring's SVG, ticks the
 * sounds on the marks, and feeds the WebGL scene (`ascensao-cena`, imported on
 * demand, never in the entry bundle). If WebGL is missing, fails to load or is
 * lost, the same sequence plays with the SVG ring and CSS sparks.
 */
function Ascensao({ de, para, inicio, elemento, aoTerminar }: AscensaoProps) {
  const [fase, setFase] = useState<FaseDaAscensao>('entra');
  const [modo, setModo] = useState<ModoDaAscensao>('carregando');
  const raizRef = useRef<HTMLDivElement>(null);
  const palcoRef = useRef<HTMLDivElement>(null);
  const anelRef = useRef<HTMLDivElement>(null);
  const seloRef = useRef<HTMLDivElement>(null);
  const fioRef = useRef<SVGPathElement>(null);
  const recorteRef = useRef<SVGPathElement>(null);
  const brilhoRef = useRef<SVGPathElement>(null);
  const pontaRef = useRef<SVGPathElement>(null);
  const terminarRef = useRef(aoTerminar);
  const mascara = `cn-anel-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const cor = AURA[elemento];

  useEffect(() => {
    terminarRef.current = aoTerminar;
  }, [aoTerminar]);

  useEffect(() => {
    let ativo = true;
    let desistiu = false;
    let raf = 0;
    let iniciado = false;
    let cena3d: CenaDaAscensao | null = null;
    let relogio = 0;
    let ultimo = 0;
    let faseAtual: FaseDaAscensao = 'entra';
    let proximoMarco = 0;
    let terminou = false;
    const marcos = marcosDoPreenchimento(inicio);

    const lerLayout = (): LayoutDaAscensao | null => {
      const raiz = raizRef.current;
      const anel = anelRef.current;
      const selo = seloRef.current;
      if (!raiz || !anel || !selo) return null;
      const o = raiz.getBoundingClientRect();
      const a = anel.getBoundingClientRect();
      const s = selo.getBoundingClientRect();
      raiz.style.setProperty('--asc-dy', px(s.top + s.height / 2 - (a.top + a.height / 2)));
      return {
        largura: o.width,
        altura: o.height,
        anel: { x: a.left - o.left + a.width / 2, y: a.top - o.top + a.height / 2, rx: a.width * 0.49, ry: a.height * 0.4375 },
        alvo: { x: s.left - o.left + s.width / 2, y: s.top - o.top + s.height / 2 },
      };
    };
    const medir = () => {
      const layout = lerLayout();
      if (layout) cena3d?.medir(layout);
    };

    const pintar = (fracao: number, agora: number) => {
      const falta = String(1 - fracao);
      fioRef.current?.setAttribute('stroke-dashoffset', falta);
      recorteRef.current?.setAttribute('stroke-dashoffset', falta);
      pontaRef.current?.setAttribute('stroke-dashoffset', String(PONTA - fracao));
      brilhoRef.current?.setAttribute('stroke-dashoffset', String(-((agora / VOLTA_DO_BRILHO) % 1)));
      raizRef.current?.style.setProperty('--asc-fill', fracao.toFixed(3));
    };

    const quadro = (agora: number) => {
      raf = requestAnimationFrame(quadro);
      // The step is clamped: a hidden tab (no frames) resumes where it left off.
      relogio += Math.min(agora - ultimo, 50);
      ultimo = agora;
      const fracao = fracaoDoAnelEm(relogio, inicio);
      pintar(fracao, relogio);
      while (proximoMarco < marcos.length && relogio >= marcos[proximoMarco].instante) {
        tocarToque();
        proximoMarco += 1;
      }
      const nova = faseDaAscensao(relogio);
      if (nova !== faseAtual) {
        faseAtual = nova;
        tocarToque();
        if (nova === 'fecha') medir();
        setFase(nova);
      }
      cena3d?.desenhar(relogio, fracao);
      if (relogio >= CENA.anel && !terminou) {
        terminou = true;
        terminarRef.current();
      }
    };

    const comecar = () => {
      if (iniciado || !ativo) return;
      iniciado = true;
      ultimo = performance.now();
      raf = requestAnimationFrame(quadro);
    };

    const passarParaCss = () => {
      cena3d?.desmontar();
      cena3d = null;
      if (ativo) setModo('css');
    };

    const espera = window.setTimeout(() => {
      if (iniciado) return;
      desistiu = true;
      passarParaCss();
      comecar();
    }, ESPERA_DO_WEBGL);

    import('./ascensao-cena')
      .then(({ criarCenaDaAscensao }) => {
        if (!ativo || desistiu) return;
        const palco = palcoRef.current;
        const criada = palco
          ? criarCenaDaAscensao({ palco, cor, fracaoAntes: inicio, aoPerder: passarParaCss })
          : null;
        window.clearTimeout(espera);
        if (criada) {
          cena3d = criada;
          setModo('webgl');
          medir();
        } else {
          setModo('css');
        }
        comecar();
      })
      .catch(() => {
        window.clearTimeout(espera);
        if (!ativo || desistiu) return;
        setModo('css');
        comecar();
      });

    window.addEventListener('resize', medir);
    return () => {
      ativo = false;
      window.clearTimeout(espera);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', medir);
      cena3d?.desmontar();
      cena3d = null;
    };
  }, [inicio, cor]);

  const sparks = useMemo(() => {
    const tabela = tabelaDoAnel(FAISCAS_DO_ANEL);
    return Array.from({ length: FAISCAS_DO_ANEL }, (_, i) => ({ ux: tabela[i * 2], uy: tabela[i * 2 + 1] }));
  }, []);

  const aceso = fase === 'aceso';
  const estilo = { '--asc-cor': cor, '--asc-tinta': TINTA[elemento] } as CSSProperties;

  return (
    <div ref={raizRef} className="cn-cena cn-asc" data-fase={fase} data-modo={modo} style={estilo} aria-hidden="true">
      <div className="cn-asc__fundo" />
      <div className="cn-asc__anel" ref={anelRef}>
        <AnelSvg
          fracao={inicio}
          mascara={mascara}
          tracos={{ fio: fioRef, recorte: recorteRef, brilho: brilhoRef, ponta: pontaRef }}
        />
        {modo === 'css' && fase !== 'entra' ? (
          <>
            <i className="cn-asc__onda" />
            <i className="cn-asc__onda cn-asc__onda--b" />
            <i className="cn-asc__onda cn-asc__onda--c" />
            {sparks.map((f, i) => (
              <i
                key={i}
                className="cn-faisca cn-faisca--anel"
                style={{
                  '--ux': (50 + f.ux * 49).toFixed(2),
                  '--uy': (50 + f.uy * 43.75).toFixed(2),
                  '--k': i % 7,
                } as CSSProperties}
              />
            ))}
          </>
        ) : null}
      </div>
      <Imagem src={CORPO} largura={913} altura={1723} className="cn-asc__mago" />
      <div className="cn-asc__selo" ref={seloRef}>
        <Selo numero={aceso ? para : de} pulsa={aceso} faiscas={aceso} mini />
      </div>
      <div className="cn-asc__palco" ref={palcoRef} />
      {fase === 'entra' ? null : (
        <>
          <div className="cn-asc__clarao" />
          <div className="cn-titulo-caixa">
            <h2 className="cn-titulo">Novo nível!</h2>
            {ESTILHACOS.map((e, i) => (
              <i
                key={i}
                className={`cn-estilhaco cn-estilhaco--${e.f}`}
                style={{ '--tx': px(e.x), '--ty': px(e.y), '--rot': `${e.r}deg`, '--s': px(e.s), '--i': i } as CSSProperties}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The ceremony for the mage's level, in three scenes that hit one after the
 * other: the ring (the bar completes, the title lands, the seal counts), the
 * four element cards jumping in one by one, and the summary -- the seal, the
 * level, the title and the bar to the next level.
 *
 * The end state is the base style of every element; each scene only animates
 * towards it. Skipping (a tap or Esc) therefore just removes the animations,
 * and only the button closes from the end. Reduced motion, and server
 * rendering, show the final scene at once: no particles, the ring already
 * closed and the seal lit.
 */
export function CerimoniaDeNivel({ de, para, titulo, fracao, fracaoAntes, faltam, onFechar }: CerimoniaDeNivelProps) {
  const reduced = useMotionPreference();
  const [cena, setCena] = useState<Cena>('anel');
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const user = useAppStore((estado) => estado.user);
  const niveis = useMemo(() => niveisDosElementos(user), [user]);
  const elemento = useMemo(() => elementoDominante(niveis), [niveis]);
  const inicio = fracaoAntesValida(fracaoAntes);
  const mascaraFinal = `cn-anel-final-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const fim = reduced || cena === 'fim';
  const ativa: Cena = fim ? 'fim' : cena;
  const proximo = para + 1;
  const rotulo = `Nível ${para}: ${titulo}`;

  // Focus goes in and comes back to where it was.
  useEffect(() => {
    const anterior = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    raizRef.current?.focus();
    return () => anterior?.focus?.();
  }, []);

  useEffect(() => {
    if (fim) botaoRef.current?.focus();
  }, [fim]);

  const encerrar = useCallback(() => {
    if (fim) onFechar();
    else setCena('fim');
  }, [fim, onFechar]);

  useEffect(() => {
    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        encerrar();
      } else if (evento.key === 'Tab') {
        // The dialog has one control; keep focus on it (or on the dialog until it shows).
        evento.preventDefault();
        (fim ? botaoRef.current : raizRef.current)?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [encerrar, fim]);

  // The clock of the cards and the summary, and the sounds that sit on it. The
  // ring scene runs on its own clock and hands over through `aoTerminar`; the
  // timer here is only a net in case it never does.
  useEffect(() => {
    if (fim) return;
    const relogios: number[] = [];
    const em = (atraso: number, fazer: () => void) => relogios.push(window.setTimeout(fazer, atraso));
    if (cena === 'anel') {
      em(ESPERA_DO_WEBGL + CENA.anel + ANEL.entrada * 4, () => setCena('cartoes'));
    } else if (cena === 'cartoes') {
      ELEMENTOS_DOS_CARTOES.forEach((_, i) => em(CARTAO_INICIO + i * CARTAO_PASSO, tocarToque));
      em(CENA.cartoes, () => setCena('numero'));
    } else {
      tocarToque();
      em(CENA.numero, () => setCena('fim'));
    }
    return () => relogios.forEach((id) => window.clearTimeout(id));
  }, [cena, fim]);

  const aoTerminarOAnel = useCallback(() => setCena((atual) => (atual === 'anel' ? 'cartoes' : atual)), []);

  return (
    <div
      ref={raizRef}
      className="cerimonia-nivel"
      role="dialog"
      aria-modal="true"
      aria-label={rotulo}
      tabIndex={-1}
      data-cena={ativa}
      data-reduzido={reduced}
      onClick={fim ? undefined : encerrar}
    >
      {ativa === 'anel' ? (
        <Ascensao de={de} para={para} inicio={inicio} elemento={elemento} aoTerminar={aoTerminarOAnel} />
      ) : null}

      {ativa === 'cartoes' ? (
        <div className="cn-cena cn-c2" aria-hidden="true">
          <div className="cn-halo cn-halo--topo" />
          <Imagem src={CORPO} largura={913} altura={1723} className="cn-mago" />
          <p className="cn-subtitulo">{titulo}</p>
          <ul className="cn-cartoes">
            {ELEMENTOS_DOS_CARTOES.map((el, i) => (
              <li
                key={el}
                className="cn-cartao"
                style={{ '--cor': ACENTO[el], '--atraso': ms(CARTAO_INICIO + i * CARTAO_PASSO) } as CSSProperties}
              >
                <Imagem src={esfera(el)} largura={1254} altura={1254} className="cn-cartao__esfera" />
                <span className="cn-cartao__nome">{ROTULO[el]}</span>
                <span className="cn-cartao__nivel">Nv {niveis[el]}</span>
                {FAISCAS.map((f, k) => (
                  <i key={k} className="cn-faisca" style={{ '--tx': px(f.x), '--ty': px(f.y), '--k': k } as CSSProperties} />
                ))}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {ativa === 'fim' || ativa === 'anel' ? null : <div key={ativa} className="cn-flash" aria-hidden="true" />}

      {ativa === 'anel' || ativa === 'cartoes' ? null : (
        <div className="cn-cena cn-c3" style={{ '--asc-cor': AURA[elemento] } as CSSProperties}>
          <div className="cn-halo" aria-hidden="true" />
          <Selo numero={para} pulsa={false} faiscas={!fim} />
          <div className="cn-anel-final" aria-hidden="true">
            <AnelSvg fracao={1} mascara={mascaraFinal} />
          </div>

          <h2 className="cn-nivel">Nível {para}</h2>
          <p className="cn-titulo-pilula">{titulo}</p>

          <div className="cn-progresso">
            <div
              className="cn-barra"
              role="img"
              aria-label={`${Math.round(fracao * 100)}% do caminho até o nível ${proximo}`}
            >
              <i style={{ '--fracao': fracao } as CSSProperties} />
            </div>
            <p>
              Faltam {faltam} XP para o nível {proximo}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        className="cn-continuar"
        ref={botaoRef}
        data-pronto={fim}
        onClick={encerrar}
        tabIndex={fim ? 0 : -1}
      >
        Continuar
      </button>
    </div>
  );
}

export default CerimoniaDeNivel;
