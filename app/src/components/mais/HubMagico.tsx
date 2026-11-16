import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ElementId } from '@/types';
import { APP_ROUTES } from '@/lib/app-routes';
import { ativarSom, tocarToque } from '@/lib/audio';
import { PreferenciasDeSom } from '@/components/feedback/PreferenciasDeSom';
import { ArcaneIcon, ROUTE_ICONS } from '@/components/elemental/ArcaneIcon';
import { Vazio } from '@/components/elemental/blocos/Vazio';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import {
  ELEMENTOS_DA_ROSA, INSCRICOES, PORTAIS, ROTAS_POR_ELEMENTO, ehLatente, ehSubportal, elementoDaRota, elementoDoCaminho,
  conjurar, rotaPorId, type Portal,
} from './constelacoes';
import { recentesParaMostrar } from './trilha';
import { RosaElemental } from './RosaElemental';
import { InscricaoElemental, type ItemDaInscricao } from './InscricaoElemental';
import { nomeDaRota, type EstadoDaLinha, type LinhaDeRotaProps } from './LinhaDeRota';
import { useEspiaoDeElemento, lerDuracao } from './useEspiaoDeElemento';
import { useArrastoDaFolha } from './useArrastoDaFolha';
import { useEntradaDaTela, useLuzDaSemana } from './useCenaDaTela';
import './hub.css';
import './hub-uau.css';

export interface HubMagicoProps {
  /** Caminho da página aberta (useLocation().pathname). */
  pathname: string;
  /** Depois de qualquer toque que leva a uma página (link ou Enter no campo): quem chama fecha a folha. */
  onNavegar?: (caminho: string) => void;
  onFechar: () => void;
  /** Reservado: o hub é igual nas duas variantes por ora. */
  variant?: 'mystic' | 'fitness';
  /** A folha inteira (o conteúdo do Sheet): é ela que desce com o dedo. Sem isto, o hub usa o ancestral role="dialog". */
  conteudoRef?: RefObject<HTMLElement | null>;
  /** Título "Todas as páginas": recebe o foco no celular, para não abrir o teclado. */
  titleRef?: RefObject<HTMLHeadingElement | null>;
}

const TITULO = 'Todas as páginas';
const ordenadas = [...APP_ROUTES].sort((a, b) => b.path.length - a.path.length);
const rotaDoCaminho = (pathname: string) => ordenadas.find((rota) => pathname === rota.path || pathname.startsWith(`${rota.path}/`));
const plural = (n: number) => `${n} ${n === 1 ? 'página' : 'páginas'}`;
const pontoFino = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;
const ehMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

/** Um dos quatro atalhos: mini-runa com véu do elemento e uma assinatura curta ao toque. */
function PortalDeAtalho({ portal, indice, atual, aoNavegar }: { portal: Portal; indice: number; atual: boolean; aoNavegar: (caminho: string) => void }) {
  const rota = rotaPorId(portal.id);
  const [tocado, setTocado] = useState(false);
  const relogio = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(relogio.current), []);
  if (!rota) return null;
  const tocar = () => {
    setTocado(false);
    clearTimeout(relogio.current);
    relogio.current = setTimeout(() => {
      setTocado(true);
      relogio.current = setTimeout(() => setTocado(false), lerDuracao(document.documentElement, '--ds-duration-settle'));
    }, 0);
  };
  return (
    <Link
      to={rota.path}
      className="hub-portal"
      data-element={portal.elemento}
      data-luz=""
      data-tocado={tocado || undefined}
      style={{ ['--i' as string]: indice }}
      aria-current={atual ? 'page' : undefined}
      onPointerDown={tocar}
      onClick={() => aoNavegar(rota.path)}
    >
      <ArcaneIcon name={ROUTE_ICONS[portal.id] ?? portal.elemento} size={24} className="hub-portal-sigilo" />
      <span className="hub-portal-rotulo">{portal.rotulo}</span>
    </Link>
  );
}

/** A folha "Todas as páginas" como a Rosa dos Quatro: rosa, busca, atalhos, quatro inscrições e as preferências de som. */
export function HubMagico({ pathname, onNavegar, onFechar, conteudoRef, titleRef }: HubMagicoProps) {
  const navigate = useNavigate();
  const reduzido = useMotionPreference();
  const idCampo = useId();
  const raizRef = useRef<HTMLDivElement>(null);
  const corpoRef = useRef<HTMLDivElement>(null);
  const campoRef = useRef<HTMLInputElement>(null);
  const tituloInterno = useRef<HTMLHeadingElement>(null);
  const tituloRef = titleRef ?? tituloInterno;
  const focoNoCorpo = useRef(false);
  // Staged once per opening of the app; every later opening is the short rise. The week's leader lights the sheet.
  const { entrada } = useEntradaDaTela('hub');
  const luzDaSemana = useLuzDaSemana();

  const rotaAtual = rotaDoCaminho(pathname);
  const idAtual = rotaAtual?.id ?? null;
  const [ativo, setAtivo] = useState<ElementId>(() => elementoDoCaminho(pathname) ?? 'fogo');
  const [query, setQuery] = useState('');
  const [somAberto, setSomAberto] = useState(false);
  // Lidos uma vez ao abrir: a lista não se mexe sob o dedo.
  const [recentes] = useState(() => recentesParaMostrar(idAtual ?? undefined));
  const [mac] = useState(ehMac);

  const buscando = query.trim().length > 0;
  const conj = useMemo(() => conjurar(query), [query]);
  const semResposta = buscando && conj.primeira === null;
  const agulha: ElementId = buscando && conj.primeira ? (elementoDaRota(conj.primeira.id) ?? ativo) : ativo;
  const acesos = buscando ? ELEMENTOS_DA_ROSA.filter((elemento) => conj.contagemPorElemento[elemento] > 0) : undefined;

  useParalaxe(raizRef, !reduzido);
  useLuzDoToque(raizRef);

  const espiao = useEspiaoDeElemento({ raiz: corpoRef, ativo: !buscando, aoMudar: setAtivo });

  const escolher = (elemento: ElementId) => {
    setAtivo(elemento);
    espiao.rolarPara(elemento, reduzido);
    void ativarSom().then(() => tocarToque());
  };

  const alvoDaFolha = () => conteudoRef?.current ?? raizRef.current?.closest<HTMLElement>('[role="dialog"]') ?? raizRef.current;
  const arrasto = useArrastoDaFolha({
    alvo: alvoDaFolha,
    aoFechar: onFechar,
    reduzido,
    aoElemento: (passo) => {
      if (buscando) return;
      const i = ELEMENTOS_DA_ROSA.indexOf(agulha);
      escolher(ELEMENTOS_DA_ROSA[(i + passo + ELEMENTOS_DA_ROSA.length) % ELEMENTOS_DA_ROSA.length]);
    },
  });

  // Abertura: sem animação, o corpo vai até a linha da página atual (o espião ignora esta rolagem).
  useLayoutEffect(() => {
    const corpo = corpoRef.current;
    if (!corpo) return;
    espiao.suspender();
    const linha = corpo.querySelector<HTMLElement>('[aria-current="page"]');
    if (!linha) return;
    const folga = 8;
    const caixa = corpo.getBoundingClientRect();
    const alvo = linha.getBoundingClientRect();
    if (alvo.top < caixa.top) corpo.scrollTop += alvo.top - caixa.top - folga;
    else if (alvo.bottom > caixa.bottom) corpo.scrollTop += alvo.bottom - caixa.bottom + folga;
    // Só na abertura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Foco: ponteiro fino vai ao campo; no celular, ao título (o teclado não sobe sozinho).
  useEffect(() => {
    if (pontoFino()) campoRef.current?.focus({ preventScroll: true });
    else tituloRef.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Se o foco estava numa linha que recuou, volta ao campo.
  useEffect(() => {
    if (!buscando) return;
    const foco = document.activeElement;
    const perdido = foco === document.body ? focoNoCorpo.current : foco instanceof Element && foco.closest('[inert]') !== null;
    if (perdido) campoRef.current?.focus({ preventScroll: true });
  }, [query, buscando]);

  const mudarBusca = (valor: string) => {
    if (!buscando && valor.trim() && corpoRef.current) {
      espiao.suspender();
      corpoRef.current.scrollTop = 0;
    }
    setQuery(valor);
  };
  const limpar = () => {
    setQuery('');
    campoRef.current?.focus({ preventScroll: true });
  };

  const abrir = (caminho: string) => {
    navigate(caminho);
    onNavegar?.(caminho);
  };
  const aoNavegar: NonNullable<LinhaDeRotaProps['aoNavegar']> = (rota) => onNavegar?.(rota.path);

  const aoTeclarNoCampo = (evento: KeyboardEvent<HTMLInputElement>) => {
    if (evento.key !== 'Enter' || !conj.primeira || !buscando) return;
    evento.preventDefault();
    void ativarSom().then(() => tocarToque());
    abrir(conj.primeira.path);
  };

  const estadoDe = (id: string): EstadoDaLinha => {
    if (!buscando) return ehLatente(id) ? 'latente' : 'normal';
    if (conj.acesas.some((rota) => rota.id === id)) return 'acesa';
    return ehLatente(id) ? 'latente' : 'adormecida';
  };

  const inscricoes = ELEMENTOS_DA_ROSA.map((elemento) => {
    const ordemDaResposta = (id: string) => {
      const posicao = conj.acesas.findIndex((rota) => rota.id === id);
      return posicao < 0 ? undefined : posicao;
    };
    const itens: ItemDaInscricao[] = ROTAS_POR_ELEMENTO[elemento]
      .filter((id) => !ehSubportal(id))
      .flatMap((id) => {
        const rota = rotaPorId(id);
        if (!rota) return [];
        const item: ItemDaInscricao = { rota, estado: estadoDe(id), primeira: conj.primeira?.id === id || undefined, ordem: ordemDaResposta(id) };
        if (id === 'temporal') {
          item.subportais = Object.fromEntries(
            ROTAS_POR_ELEMENTO[elemento].filter(ehSubportal).map((sub) => [sub, estadoDe(sub)] as const),
          );
        }
        return [item];
      });
    return { elemento, itens };
  });

  const total = conj.acesas.length;
  const respostas = semResposta ? 'Nenhuma página responde' : `${total} ${total === 1 ? 'página responde' : 'páginas respondem'}`;
  const textoBusca = query.trim();
  const mostraPouco = !buscando && recentes.length >= 2;

  return (
    <div className="hub" ref={raizRef} data-buscando={buscando || undefined} data-entrada={entrada} style={luzDaSemana}>
      <div className="hub-luz" aria-hidden="true" />
      <div className="hub-alca" aria-hidden="true" {...arrasto.alca}><span /></div>

      <div className="hub-rosa-linha" {...arrasto.rosa}>
        <button type="button" className="hub-fechar" aria-label="Fechar" onClick={onFechar}>
          <ArcaneIcon name="fechar" size={20} />
        </button>
        <div className="hub-rosa">
          <RosaElemental
            ativo={agulha}
            contagens={conj.contagemPorElemento}
            acesos={acesos}
            compacta={buscando}
            reduzido={reduzido}
            onEscolher={escolher}
          />
        </div>
        <div className="hub-titulos">
          <h2 ref={tituloRef} tabIndex={-1} className="hub-titulo">{TITULO}</h2>
          <div className="hub-leitor" data-element={agulha}>
            <ArcaneIcon name={agulha} size={16} className="hub-leitor-sigilo" />
            <span className="hub-leitor-verbo">{INSCRICOES[agulha].verbo}</span>
            <span className="hub-leitor-linha">{buscando ? respostas : INSCRICOES[agulha].linha}</span>
            {buscando ? null : <span className="hub-leitor-conta">{plural(conj.contagemPorElemento[agulha])}</span>}
          </div>
        </div>
      </div>

      <div className="ds-campo hub-busca" data-tipo="busca">
        <ArcaneIcon name="buscar" size={18} />
        <label htmlFor={idCampo} className="sr-only">Buscar uma página</label>
        <input
          ref={campoRef}
          id={idCampo}
          type="search"
          value={query}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="Buscar uma página: lua, treino, semana"
          onChange={(evento) => mudarBusca(evento.target.value)}
          onKeyDown={aoTeclarNoCampo}
        />
        {query ? (
          <button type="button" className="hub-limpar" aria-label="Limpar a busca" onClick={limpar}>
            <ArcaneIcon name="fechar" size={16} />
          </button>
        ) : null}
      </div>
      <p className="ds-nota hub-status" role="status">{buscando ? respostas : ''}</p>

      <div
        className="hub-corpo"
        ref={corpoRef}
        onFocusCapture={() => { focoNoCorpo.current = true; }}
        onBlurCapture={() => { focoNoCorpo.current = false; }}
      >
        {buscando ? null : (
          <nav className="hub-portais" aria-label="Atalhos">
            {PORTAIS.map((portal, indice) => (
              <PortalDeAtalho
                key={portal.id}
                portal={portal}
                indice={indice}
                atual={rotaPorId(portal.id)?.path === pathname}
                aoNavegar={(caminho) => onNavegar?.(caminho)}
              />
            ))}
          </nav>
        )}

        {mostraPouco ? (
          <nav className="hub-pouco" aria-label="Há pouco">
            <p className="hub-rotulo" aria-hidden="true">Há pouco</p>
            <ul>
              {recentes.map((id) => {
                const rota = rotaPorId(id);
                if (!rota) return null;
                return (
                  <li key={id}>
                    <Link to={rota.path} className="hub-pouco-link ds-pane" data-luz="" data-element={elementoDaRota(id)} onClick={() => onNavegar?.(rota.path)}>
                      <ArcaneIcon name={ROUTE_ICONS[id] ?? 'santuario'} size={18} />
                      <span>{nomeDaRota(rota)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        {semResposta ? (
          <div className="hub-vazio">
            <Vazio
              compacto
              titulo={`Nenhuma página responde a "${textoBusca}"`}
              acao={(
                <>
                  <button type="button" onClick={limpar}>Limpar a busca</button>
                  <Link to={`/mapa?busca=${encodeURIComponent(textoBusca)}`} className="ds-elo" onClick={() => onNavegar?.('/mapa')}>
                    Procurar no Mapa de páginas
                  </Link>
                </>
              )}
            />
          </div>
        ) : null}

        <div className="hub-inscricoes">
          {inscricoes.map(({ elemento, itens }) => (
            <InscricaoElemental
              key={elemento}
              elemento={elemento}
              verbo={INSCRICOES[elemento].verbo}
              linha={INSCRICOES[elemento].linha}
              rotas={itens}
              contagem={conj.contagemPorElemento[elemento]}
              abertoAtual={idAtual}
              aoNavegar={aoNavegar}
              busca={buscando ? textoBusca : undefined}
            />
          ))}
        </div>

        <div className="hub-rodape">
          <details className="ds-grupo" onToggle={(evento) => setSomAberto(evento.currentTarget.open)}>
            <summary>
              <span>Som e vibração</span>
              <ArcaneIcon name="chevron" size={16} />
            </summary>
            {somAberto ? <PreferenciasDeSom /> : null}
          </details>
          <p className="ds-nota hub-dica">
            <kbd>{mac ? '⌘' : 'Ctrl'}</kbd> <kbd>K</kbd> abre de qualquer tela; setas percorrem; <kbd>Enter</kbd> abre a primeira.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HubMagico;
