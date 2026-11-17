import { QuestNextSteps } from '@/components/quests/QuestNextSteps';
import { TopBar } from '@/components/layout/TopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SanctuaryRituals } from '@/components/elemental/SanctuaryRituals';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { ElementoCena } from '@/components/elemento/ElementoCena';
import { ElementoCabecalho } from '@/components/elemento/ElementoCabecalho';
import { ElementoPortais } from '@/components/elemento/ElementoPortais';
import { ElementoAbas } from '@/components/elemento/ElementoAbas';
import { ElementoBusca } from '@/components/elemento/ElementoBusca';
import { ElementoRuna } from '@/components/elemento/ElementoRuna';
import { ElementoVazio } from '@/components/elemento/ElementoVazio';
import { AREAS, ELEMENTS, type ElementId } from '@/constants';
import { ACENTO, AURA } from '@/lib/design/palette';
import { conclusoesDoApp, elementoDaSemana } from '@/lib/momentos/elemento-da-semana';
import { Contagem } from '@/components/motion/Contagem';
import { useLuzDoToque } from '@/components/sanctuary/useCenaViva';
import { useAppStore } from '@/stores/appStore';
import { ELEMENT_ORDER as ORDER, elementHref, parseElement, previewRedirect, legacyElementHref, areaFilters, updateAreaFilters, matchesAreaName } from '@/components/elemental/navigation';
import './elemental-preview.css';
import '@/components/elemento/elemento-uau.css';
import { AURA_SEM_SIGNO, Constelacao, ElementSigil } from '@/components/sanctuary/Constelacao';
import '@/components/sanctuary/constelacao.css';

/**
 * The whole entrance plays once per time the app is opened. Coming back to the
 * Sanctuary from another screen gets a short fade instead: a scene that
 * unfolds every single time stops being a welcome and becomes a wait.
 */
let cenaJaVista = false;

const ACCENTS = ACENTO;
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function ElementDirectory() {
  return <nav className="ep-element-directory" aria-label="Acesso direto aos quatro elementos">
    {ORDER.map((id) => <Link id={`ep-entry-${id}`} key={id} to={elementHref(id)} style={{ '--element-accent': ACCENTS[id] } as CSSProperties}>
      <ElementSigil id={id} /><span>{ELEMENTS[id].name}</span>
    </Link>)}
  </nav>;
}

function SanctuaryComposition() {
  // Existing getters read several slices; subscribe to updates from both stores.
  const { user, currentAccountId, getLevelProgress, tasks, habits, actions } = useAppStore();
  const level = getLevelProgress();

  // The light of the scene is the element leading the person's week, read from
  // what they already finished. Nothing is written and nothing is scored.
  const [hoje] = useState(() => new Date());
  const semana = useMemo(() => elementoDaSemana(conclusoesDoApp(habits, actions), hoje).elemento, [habits, actions, hoje]);
  const luzDaSemana = {
    '--semana-acento': semana ? ACENTO[semana] : 'rgb(var(--el-gold))',
    '--semana-aura': semana ? AURA[semana] : AURA_SEM_SIGNO.colour,
  } as CSSProperties;

  const [entrada] = useState<'plena' | 'breve'>(() => (cenaJaVista ? 'breve' : 'plena'));
  useEffect(() => { cenaJaVista = true; }, []);

  const cenaRef = useRef<HTMLDivElement>(null);
  useLuzDoToque(cenaRef);

  // With nothing waiting, creating the first ritual is the one thing to do here.
  const temPendentes = tasks.some((task) => !task.isCompleted);
  const faltam = Math.max(0, level.xpToNextLevel - (level.xpTotal - level.xpAtLevelStart));

  return <>
    <div ref={cenaRef} className="ep-cena" data-entrada={entrada} style={luzDaSemana}>
      <section className="ep-sanctuary" aria-labelledby="ep-title">
        <div className="ep-character-navigation"><Constelacao fracao={level.progressFraction} /></div>
        <div className="ep-identity">
          <h1 id="ep-title">{user.name || 'Mago Iniciante'}</h1>
          <p className="ep-level-line"><span className="ep-nivel-selo">Nível <Contagem valor={level.level} /></span></p>
          <p className="ep-level-remaining">faltam <Contagem valor={faltam} formatar={format} /> XP para o nível {level.level + 1}</p>
        </div>
      </section>
      <div className="ep-altar">
        <div className="ep-altar-luz" aria-hidden="true" />
        <section className="ep-next ds-altar ep-vidro" data-luz aria-labelledby="ep-next-heading">
          <div className="ds-secao ep-next-heading"><h2 id="ep-next-heading">Seu próximo passo</h2><Link className="ds-botao ep-mola" data-tipo={temPendentes ? 'secundario' : 'primario'} to="/invocar"><ArcaneIcon name="criar" size={18} />Criar ritual</Link></div>
          <SanctuaryRituals key={currentAccountId ?? "local"} />
        </section>
      </div>
      <div className="ep-painel ep-revela" data-luz><QuestNextSteps /></div>
      <Link className="ds-linha ep-cycle ep-painel ep-revela" data-luz to="/ciclos"><ArcaneIcon className="ds-linha-sigilo" name="ciclo" size={28} /><div><h3>O poder da constância</h3><p className="ds-nota">Encontre seus hábitos e sequências em Ciclos.</p></div><ArcaneIcon className="ds-linha-chevron" name="seta" size={16} /></Link>
      <Link className="ds-elo ep-all-paths ep-revela" to="/mapa"><ArcaneIcon name="mapa" size={16} />Todos os caminhos</Link>
    </div>
  </>;
}

function ElementComposition({ id }: { id: ElementId }) {
  const [params, setParams] = useSearchParams();
  const { query, activeOnly } = areaFilters(params);
  const updateFilters = (patch: { query?: string; activeOnly?: boolean }) => setParams((current) => updateAreaFilters(current, patch), { replace: true, state: { elementalFilter: true } });
  const { customAreas, onboarding, getAreaScores, getElementScores } = useAppStore();
  const selectedAreas = onboarding.selectedAreas;
  const element = ELEMENTS[id];
  const areas = [...AREAS, ...customAreas].filter((area) => area.elementId === id);
  const activeCount = areas.filter((area) => selectedAreas.includes(area.id)).length;
  const filtered = areas.filter((area) => matchesAreaName(area.name, query) && (!activeOnly || selectedAreas.includes(area.id)));
  const scores = getAreaScores();
  const elementScore = getElementScores().find((entry) => entry.elementId === id);
  const points = elementScore?.score ?? 0;
  // Each rune's ring is its share of the strongest area of this element.
  const strongest = Math.max(0, ...areas.map((area) => scores.find((entry) => entry.areaId === area.id)?.score ?? 0));
  const searching = query.trim().length > 0;
  // The scene stays mounted while the person moves between elements: the light, the colour and the art
  // change in place. Only the list of areas is replaced, so it arrives again, element by element.
  return <ElementoCena id={id}>
    <ElementoCabecalho nome={element.name} lema={element.description} pontos={points} areas={areas.length} percentual={elementScore?.percentage ?? 0} />
    <ElementoPortais id={id} />
    <section className="elemento-areas" aria-labelledby="ep-areas-title">
      <div className="elemento-areas-cabeca">
        <h2 id="ep-areas-title">Suas áreas de vida</h2>
        <p className="ds-nota">Abra uma área para ver seus caminhos.</p>
      </div>
      <ElementoBusca nomeDoElemento={element.name} valor={query} aoMudar={(value) => updateFilters({ query: value })} />
      <ElementoAbas className="elemento-filtros" role="group" aria-label="Filtrar áreas de vida">
        <button type="button" aria-pressed={!activeOnly} onClick={() => updateFilters({ activeOnly: false })}>Todas as áreas <span>{areas.length}</span></button>
        <button type="button" aria-pressed={activeOnly} onClick={() => updateFilters({ activeOnly: true })}>Minhas áreas ativas <span>{activeCount}</span></button>
      </ElementoAbas>
      <p className="ds-nota elemento-contagem" role="status">{filtered.length} de {areas.length} áreas{activeOnly ? ', só as áreas ativas' : ''}</p>
      <div className="elemento-lista" key={id}>{filtered.map((area, ordem) => {
        const score = scores.find((entry) => entry.areaId === area.id);
        return <ElementoRuna
          key={area.id}
          elemento={id}
          nomeDoElemento={element.name}
          areaId={area.id}
          nome={area.name}
          descricao={area.description}
          ativa={selectedAreas.includes(area.id)}
          pontos={score?.score ?? 0}
          rituais={score?.taskCount ?? 0}
          fracao={strongest > 0 ? (score?.score ?? 0) / strongest : 0}
          ordem={ordem}
        />;
      })}</div>
      {filtered.length === 0 && <ElementoVazio
        elemento={id}
        titulo={searching ? 'Nenhuma área encontrada' : 'Nenhuma área ativa'}
        texto={searching ? `Nada para “${query}”${activeOnly ? ' entre as áreas ativas' : ''}.` : `Você ainda não ativou áreas de ${element.name}. Explore as disponíveis e escolha por onde começar.`}
        acoes={<>
          <button type="button" className="ds-botao" data-tipo="secundario" onClick={() => updateFilters({ query: '', activeOnly: false })}>Mostrar todas as áreas</button>
          {searching ? null : <Link to="/dominios" className="ds-elo">Ativar áreas em Domínios</Link>}
        </>}
      />}
      <Link to="/dominios" className="ds-elo elemento-gerenciar">Gerenciar áreas ativas e personalizadas</Link>
    </section>
  </ElementoCena>;
}

export default function ElementalPreview() {
  const timerRunning = useAppStore((state) => state.timer.isRunning);
  const tickTimer = useAppStore((state) => state.tickTimer);
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(tickTimer, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, tickTimer]);

  const { elementId } = useParams<{ elementId: string }>();
  const location = useLocation();
  const [params] = useSearchParams();
  const requested = elementId ?? params.get('elemento');
  const id = parseElement(requested);
  const redirect = previewRedirect(location.pathname, location.search) ?? (!elementId ? legacyElementHref(location.search) : undefined);
  const mainRef = useRef<HTMLElement>(null);
  const previousPage = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (redirect) return;
    const page = `${location.pathname}:${requested ?? ''}`;
    if (previousPage.current !== page) {
      previousPage.current = page;
      const focusElement = parseElement(location.state?.focusElement);
      const target = !requested && focusElement ? document.getElementById(`ep-entry-${focusElement}`) : mainRef.current;
      target?.focus({ preventScroll: true });
      if (!requested && focusElement) target?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, location.state, requested, redirect]);
  if (redirect) return <Navigate to={redirect} replace />;
  return <div className="elemental-preview ep-page">
    <a className="ep-skip" href="#ep-main">Ir para o conteúdo</a>
    <TopBar lugar="santuario" />
    <main id="ep-main" ref={mainRef} tabIndex={-1} className="ep-main" aria-label={id ? `Elemento ${ELEMENTS[id].name}` : requested ? 'Elemento não encontrado' : 'Santuário'}>
      {requested && !id ? <section className="ep-not-found"><h1 id="ep-title">Elemento não encontrado</h1><p>Escolha um dos quatro elementos para continuar sua jornada.</p><ElementDirectory /></section> : id ? <ElementComposition id={id} /> : <SanctuaryComposition />}
    </main>
    <MobileBottomNav />
    {/* The Sanctuary already ends on "Todos os caminhos", which goes to the same map. */}
    <footer className="ep-footer" data-so={requested ? undefined : ''}><span>Uma jornada. Quatro elementos.</span>{requested ? <Link className="ds-elo" to="/mapa">Explorar sua jornada</Link> : null}</footer>
  </div>;
}
