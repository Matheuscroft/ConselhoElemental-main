import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { Contagem } from '@/components/motion/Contagem';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { tocarToque } from '@/lib/audio';
import { ACENTO } from '@/lib/design/palette';
import {
  ACENDE_EM,
  CARTAO_INICIO,
  CARTAO_PASSO,
  CENA,
  ELEMENTOS_DOS_CARTOES,
  niveisDosElementos,
  type ElementoDoCartao,
} from '@/lib/cerimonia/nivel';
import { useAppStore } from '@/stores/appStore';
import './cerimonia-de-nivel.css';

export interface CerimoniaDeNivelProps {
  readonly de: number;
  readonly para: number;
  /** Mastery title of the new level. */
  readonly titulo: string;
  /** How far through the new level the mage already is (0..1). */
  readonly fracao: number;
  /** XP still missing for the next level. */
  readonly faltam: number;
  readonly onFechar: () => void;
}

type Cena = 'impacto' | 'cartoes' | 'numero' | 'fim';

const ROTULO: Record<ElementoDoCartao, string> = { fogo: 'Fogo', agua: 'Água', ar: 'Ar', terra: 'Terra' };
const CORPO = '/sanctuary/elemental-body-v1.png';
const esfera = (e: ElementoDoCartao) => `/sanctuary/elements/${e}-v1.webp`;

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
const FEIXES = [8, 30, 56, 80] as const;

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

/**
 * The ceremony for the mage's level, in three scenes that hit one after the
 * other: the impact (a flash, a slanted panel with the mage, the title), the
 * four element cards jumping in one by one, and the number -- a grey seal that
 * drops, lights up, counts to the new level and shows the bar to the next.
 *
 * The end state is the base style of every element; each scene only animates
 * towards it. Skipping (a tap or Esc) therefore just removes the animations,
 * and only the button closes from the end. Reduced motion, and server
 * rendering, show the final scene at once.
 */
export function CerimoniaDeNivel({ de, para, titulo, fracao, faltam, onFechar }: CerimoniaDeNivelProps) {
  const reduced = useMotionPreference();
  const [cena, setCena] = useState<Cena>('impacto');
  const [contando, setContando] = useState(false);
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const user = useAppStore((estado) => estado.user);
  const niveis = useMemo(() => niveisDosElementos(user), [user]);

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

  // The clock of the three scenes, and the sounds that sit on it.
  useEffect(() => {
    if (fim) return;
    const relogios: number[] = [];
    const em = (atraso: number, fazer: () => void) => relogios.push(window.setTimeout(fazer, atraso));
    if (cena === 'impacto') {
      em(CENA.impacto, () => setCena('cartoes'));
    } else if (cena === 'cartoes') {
      ELEMENTOS_DOS_CARTOES.forEach((_, i) => em(CARTAO_INICIO + i * CARTAO_PASSO, tocarToque));
      em(CENA.cartoes, () => setCena('numero'));
    } else {
      tocarToque();
      em(ACENDE_EM, () => setContando(true));
      em(CENA.numero, () => setCena('fim'));
    }
    return () => relogios.forEach((id) => window.clearTimeout(id));
  }, [cena, fim]);

  const numero = fim || contando ? para : de;

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
      {ativa === 'impacto' ? (
        <div className="cn-cena cn-c1" aria-hidden="true">
          <div className="cn-painel">
            <div className="cn-painel__cor" />
            {FEIXES.map((esq, i) => (
              <i key={esq} className="cn-feixe" style={{ '--esq': `${esq}%`, '--i': i } as CSSProperties} />
            ))}
            <Imagem src={CORPO} largura={913} altura={1723} className="cn-painel__mago" />
          </div>
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
        </div>
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

      {ativa === 'fim' ? null : <div key={ativa} className="cn-flash" aria-hidden="true" />}

      {ativa === 'impacto' || ativa === 'cartoes' ? null : (
        <div className="cn-cena cn-c3">
          <div className="cn-halo" aria-hidden="true" />
          <div className="cn-selo" data-pulsa={contando && !fim} aria-hidden="true">
            <span className="cn-selo__onda cn-selo__onda--a" />
            <span className="cn-selo__onda cn-selo__onda--b" />
            <div className="cn-selo__corpo">
              <span className="cn-selo__aceso" />
              <strong>
                <Contagem valor={numero} beat="conjure" />
              </strong>
            </div>
            {fim
              ? null
              : FAISCAS_DO_SELO.map((f, k) => (
                  <i key={k} className="cn-faisca cn-faisca--selo" style={{ '--tx': px(f.x), '--ty': px(f.y), '--k': k } as CSSProperties} />
                ))}
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
