import { lazy, Suspense, useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import { elementHref } from '@/components/elemental/navigation';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { AURA, TINTA } from '@/lib/design/palette';
import { indiceAtivo } from '@/lib/momentos/reel';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import type { ElementId } from '@/constants';
import { BRASAS } from './brasas';
import './palco-pilares.css';

// three.js only arrives with the stage; the pills never wait for it.
const MolduraFeitico = lazy(() => import('@/components/momentos/MolduraFeitico'));

/** Read-only data of one pillar, as the page already computes it. */
export interface PilarPalco {
  readonly id: ElementId;
  readonly nome: string;
  /** What the pillar is about, as a short line under the name (optional). */
  readonly dominio?: string;
  readonly descricao: string;
  readonly pontos: number;
  readonly porcentagem: number;
  readonly areas: number;
  readonly ativas: number;
}

/** After this long without a scroll event the rail counts as settled. */
const ASSENTAR_MS = 120;
/** Half the pill width: the outline of the living frame is a full pill. */
const RAIO_PILULA = 66;

/** The stage is staged once per opening of the app; coming back only fades. */
let palcoJaVisto = false;
/** Dots shown for the areas of a pillar; more than this would stop reading as dots. */
const PONTOS_MAXIMOS = 14;

const formatar = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Most points first; a tie, or all zeros, keeps the first in order. */
const focoInicial = (itens: readonly PilarPalco[]) => {
  let melhor = 0;
  itens.forEach((item, indice) => { if (item.pontos > itens[melhor].pontos) melhor = indice; });
  return melhor;
};

const tema = (id: ElementId) => ({
  '--pilar-aura': AURA[id],
  '--pilar-tinta': TINTA[id],
  '--pilar-acento': `var(--element-${id})`,
}) as CSSProperties;

const semAssinatura = () => () => {};
/** True in the browser, false on the server and during hydration: portals only exist where there is a document. */
const useNoNavegador = () => useSyncExternalStore(semAssinatura, () => true, () => false);

export function PalcoPilares({ itens }: { itens: readonly PilarPalco[] }) {
  const reduzido = useMotionPreference();
  const noNavegador = useNoNavegador();
  const [foco, setFoco] = useState(() => focoInicial(itens));
  const [rolando, setRolando] = useState(false);
  const trilhoRef = useRef<HTMLDivElement>(null);
  const raizRef = useRef<HTMLDivElement>(null);
  const cenaRef = useRef<HTMLDivElement>(null);
  const [entrada] = useState<'plena' | 'breve'>(() => (palcoJaVisto ? 'breve' : 'plena'));
  useEffect(() => { palcoJaVisto = true; }, []);
  useParalaxe(cenaRef, !reduzido);
  useLuzDoToque(raizRef);
  const gestoRef = useRef(false);
  const focoRef = useRef(foco);
  useEffect(() => { focoRef.current = foco; });

  const total = itens.length;

  const centralizar = useCallback((indice: number, suave: boolean) => {
    const aba = trilhoRef.current?.children[indice] as HTMLElement | undefined;
    aba?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: suave && !reduzido ? 'smooth' : 'auto' });
  }, [reduzido]);

  // Only a scroll made by the person, and only once the rail settles, changes the focus.
  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    let parar = 0;

    const assentou = () => {
      window.clearTimeout(parar);
      setRolando(false);
      if (!gestoRef.current) return;
      gestoRef.current = false;
      const abas = [...trilho.children] as HTMLElement[];
      if (!abas.length) return;
      const passo = abas.length > 1 ? abas[1].offsetLeft - abas[0].offsetLeft : abas[0].offsetWidth;
      const indice = indiceAtivo(trilho.scrollLeft, trilho.clientWidth, passo, abas[0].offsetWidth, abas[0].offsetLeft, abas.length);
      if (indice !== focoRef.current) setFoco(indice);
    };
    const aoRolar = () => {
      setRolando(true);
      window.clearTimeout(parar);
      parar = window.setTimeout(assentou, ASSENTAR_MS);
    };

    trilho.addEventListener('scroll', aoRolar, { passive: true });
    trilho.addEventListener('scrollend', assentou);
    return () => {
      window.clearTimeout(parar);
      trilho.removeEventListener('scroll', aoRolar);
      trilho.removeEventListener('scrollend', assentou);
    };
  }, []);

  // Arrive centred on the initial pillar, and stay centred when the width changes.
  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;
    gestoRef.current = false;
    centralizar(focoRef.current, false);
    const observador = new ResizeObserver(() => { gestoRef.current = false; centralizar(focoRef.current, false); });
    observador.observe(trilho);
    return () => observador.disconnect();
  }, [centralizar]);

  const escolher = (indice: number, focar = false) => {
    gestoRef.current = false;
    setFoco(indice);
    centralizar(indice, true);
    if (focar) (trilhoRef.current?.children[indice] as HTMLElement | undefined)?.focus({ preventScroll: true });
  };

  const aoTeclar = (evento: KeyboardEvent<HTMLDivElement>) => {
    const alvo = evento.key === 'ArrowLeft' ? Math.max(0, foco - 1)
      : evento.key === 'ArrowRight' ? Math.min(total - 1, foco + 1)
        : evento.key === 'Home' ? 0
          : evento.key === 'End' ? total - 1
            : -1;
    if (alvo < 0) return;
    evento.preventDefault();
    escolher(alvo, true);
  };

  const atual = itens[foco];
  if (!atual) return null;
  const vazio = atual.pontos <= 0;

  return (
    <div ref={raizRef} className="palco-pilares" data-entrada={entrada}>
      {noNavegador && createPortal(
        <div className="pilar-ambiente" aria-hidden="true">
          {itens.map((item, indice) => <span key={item.id} data-ativo={indice === foco} data-elemento={item.id} style={tema(item.id)} />)}
        </div>,
        document.body,
      )}
      <div ref={cenaRef} className="palco-cena" data-rolando={rolando}>
        <div className="palco-camadas" aria-hidden="true">
          {itens.map((item, indice) => (
            <span key={item.id} className="palco-camada" data-ativo={indice === foco} data-elemento={item.id} style={tema(item.id)}>
              <span className="palco-aura" />
              <span className="palco-chao" />
              <span className="palco-horizonte" />
            </span>
          ))}
        </div>
        <div
          ref={trilhoRef}
          className="palco-trilho"
          role="tablist"
          aria-label="Pilares elementais"
          onKeyDown={aoTeclar}
          onPointerDown={() => { gestoRef.current = true; }}
          onWheel={() => { gestoRef.current = true; }}
          onTouchStart={() => { gestoRef.current = true; }}
        >
          {itens.map((item, indice) => {
            const selecionado = indice === foco;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`pilar-aba-${item.id}`}
                className="palco-pilula"
                data-foco={selecionado}
                style={{ ...tema(item.id), '--ordem': indice } as CSSProperties}
                aria-selected={selecionado}
                aria-controls="pilar-leitura"
                tabIndex={selecionado ? 0 : -1}
                aria-label={`${item.nome}, ${formatar(item.pontos)} pontos, ${formatar(item.porcentagem)}% do equilíbrio`}
                onClick={() => { if (!selecionado) escolher(indice); }}
              >
                <span className="palco-numero" aria-hidden="true">{String(indice + 1).padStart(2, '0')}</span>
                <ElementIcon element={item.id} size={28} aria-hidden="true" />
                <strong className="palco-nome" aria-hidden="true">{item.nome}</strong>
                <span className="palco-pontos" data-vazio={item.pontos <= 0} aria-hidden="true">{item.pontos > 0 ? `${formatar(item.pontos)} pontos` : 'Ainda sem pontos'}</span>
                <span className="palco-eco" data-foco={selecionado} aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <div className="palco-camadas palco-camadas-frente" aria-hidden="true">
          {itens.map((item, indice) => (
            <span key={item.id} className="palco-camada" data-ativo={indice === foco} data-elemento={item.id} style={tema(item.id)}>
              <span className="palco-brasas">
                {BRASAS.map((brasa, posicao) => (
                  <span
                    key={posicao}
                    className="palco-brasa"
                    style={{ '--x': `${brasa.x}%`, '--t': brasa.tamanho / 10, '--v': brasa.deriva, '--c': brasa.ciclo, '--a': brasa.avanco } as CSSProperties}
                  />
                ))}
              </span>
            </span>
          ))}
        </div>
        <Suspense fallback={null}>
          <MolduraFeitico
            elemento={atual.id}
            nivel={vazio ? 1 : 2}
            completo={false}
            conquista={0}
            ativo
            rolando={rolando}
            reduzido={reduzido}
            raio={RAIO_PILULA}
          />
        </Suspense>
      </div>

      <div key={atual.id} className="palco-altar" style={tema(atual.id)}>
        <span className="palco-altar-luz" aria-hidden="true" />
        <section
          id="pilar-leitura"
          className="palco-leitura"
          data-luz
          role="tabpanel"
          aria-labelledby={`pilar-aba-${atual.id}`}
        >
          <header className="palco-leitura-topo">
            <div>
              {atual.dominio ? <p className="palco-leitura-dominio">{atual.dominio}</p> : null}
              <h2 className="palco-leitura-nome">{atual.nome}</h2>
            </div>
            <span className="palco-leitura-sigilo" aria-hidden="true"><ElementIcon element={atual.id} size={40} /></span>
          </header>
          <p className="palco-leitura-texto">{atual.descricao}</p>
          {vazio
            ? <p className="palco-leitura-dados" data-vazio="true">{atual.nome === 'Água' || atual.nome === 'Terra' ? 'Sua' : 'Seu'} {atual.nome} aparece aqui quando você registrar atividades.</p>
            : <p className="palco-leitura-dados"><strong>{formatar(atual.pontos)} pontos</strong> <span aria-hidden="true">·</span> {formatar(atual.porcentagem)}% do equilíbrio</p>}
          <p className="palco-leitura-areas">
            <span className="palco-pontinhos" aria-hidden="true">
              {Array.from({ length: Math.min(atual.areas, PONTOS_MAXIMOS) }, (_, posicao) => <i key={posicao} data-acesa={posicao < atual.ativas} />)}
            </span>
            <span>{atual.areas} áreas · {atual.ativas} ativas</span>
          </p>
          <Link className="palco-explorar" to={elementHref(atual.id)}>Explorar {atual.nome} <ArrowRight size={16} aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
}

export default PalcoPilares;
