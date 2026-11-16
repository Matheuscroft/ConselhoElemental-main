import { QuestNextSteps } from '@/components/quests/QuestNextSteps';
import { TopBar } from '@/components/layout/TopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SanctuaryRituals } from '@/components/elemental/SanctuaryRituals';
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
import { useLuzDoToque, useParalaxe } from '@/components/sanctuary/useCenaViva';
import { useAppStore } from '@/stores/appStore';
import { createMaterialEffect } from '@/components/elemental/material-effects';
import { ELEMENT_ORDER as ORDER, elementHref, parseElement, previewRedirect, legacyElementHref, areaFilters, updateAreaFilters, matchesAreaName } from '@/components/elemental/navigation';
import { auraScale, useZodiacPreference, type ZodiacModality } from '@/lib/sanctuary/zodiac';
import { Cerimonia } from '@/components/cerimonia/Cerimonia';
import type { Premio } from '@/lib/cerimonia/cerimonia';
import './elemental-preview.css';
import '@/components/elemento/elemento-uau.css';
import { AnelXp } from '@/components/sanctuary/AnelXp';

/** The aura costs a shader and three.js, so it arrives after the page does. */
const AuraElemental = lazy(() => import('@/components/sanctuary/AuraElemental'));

/** Before anyone gives a birth date the aura still burns, in the app's gold. */
const AURA_SEM_SIGNO = { colour: '#d6b66f', modality: 'fixo' as ZodiacModality };

/**
 * The whole entrance plays once per time the app is opened. Coming back to the
 * Sanctuary from another screen gets a short fade instead: a scene that
 * unfolds every single time stops being a welcome and becomes a wait.
 */
let cenaJaVista = false;

const ACCENTS = ACENTO;
const format = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

function ElementMagic({ id, animated = false }: { id: ElementId; animated?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <span className={`ep-magic ep-magic-${id}`} aria-hidden="true">
    <span className="ep-magic-aura" />
    {failed ? <ElementSigil id={id} className="ep-magic-fallback" /> : <>
      <img className="ep-magic-image" src={`/sanctuary/elements/${id}-v1.webp`} alt="" width={1254} height={1254} draggable={false} decoding="async" onError={() => setFailed(true)} />
      {animated && <canvas className="ep-material-canvas" data-element-effect={id} width={192} height={192} />}
    </>}
  </span>;
}

function ElementSigil({ id, className }: { id: ElementId; className?: string }) {
  const down = id === 'agua' || id === 'terra';
  return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d={down ? 'M7 10H41L24 39Z' : 'M24 8L41 37H7Z'} strokeLinejoin="round" />
    {(id === 'terra' || id === 'ar') && <path d={down ? 'M8 20H40' : 'M8 27H40'} />}
  </svg>;
}

function orbitStyle(index: number, phase: number): CSSProperties {
  const angle = -Math.PI * .75 + index * Math.PI / 2 + phase;
  const depth = Math.sin(angle);
  const scale = 1 / (1 - depth * .16);
  return {
    '--orbit-x': Math.cos(angle) * scale,
    '--orbit-y': (depth - Math.cos(angle) * .45) * scale,
    '--orbit-scale': scale,
    '--orbit-opacity': .8 + (depth + 1) * .1,
    // The body sits at 100: rear portals really pass behind its silhouette.
    zIndex: Math.round(depth * 90) + 100,
  } as CSSProperties;
}

function paintOrbit(orbit: HTMLDivElement, phase: number) {
  orbit.querySelectorAll<HTMLElement>('.ep-orbit-position').forEach((position, index) => {
    const style = orbitStyle(index, phase);
    Object.entries(style).forEach(([key, value]) => {
      if (key === 'zIndex') position.style.zIndex = String(value);
      else position.style.setProperty(key, String(value));
    });
  });
}

function ElementalOrbit({ fracao }: { fracao: number }) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const phase = useRef(0);
  const materialTime = useRef(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  // The aura is the person's: their sign gives it colour, their level its reach.
  const { profile: perfil } = useZodiacPreference();
  const { getLevelProgress } = useAppStore();
  const nivel = getLevelProgress().level;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    if (reducedMotion) return;
    const surfaces = [...orbit.querySelectorAll<HTMLCanvasElement>('[data-element-effect]')].flatMap((canvas) => {
      const id = ORDER.find((element) => element === canvas.dataset.elementEffect);
      const surface = id && createMaterialEffect(canvas, id, canvas.parentElement?.querySelector('img') ?? null);
      return surface ? [surface] : [];
    });
    const resizeObserver = new ResizeObserver(() => {
      surfaces.forEach((surface) => { surface.resize(); surface.paint(materialTime.current); });
    });
    orbit.querySelectorAll('[data-element-effect]').forEach((canvas) => resizeObserver.observe(canvas));
    let frame = 0;
    let previous: number | undefined;
    let visible = false;
    const tick = (now: number) => {
      // Keep the phase when paused; never catch up after a hidden tab or long frame.
      const delta = previous === undefined ? 0 : Math.min(now - previous, 64);
      materialTime.current += delta / 1000;
      if (!hovered && !focused) phase.current = (phase.current + delta / 48000 * Math.PI * 2) % (Math.PI * 2);
      previous = now;
      if (!hovered && !focused) paintOrbit(orbit, phase.current);
      surfaces.forEach((surface) => surface.paint(materialTime.current));
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previous = undefined;
      orbit.dataset.motionPaused = String(!visible || document.hidden);
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(orbit);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [hovered, focused, reducedMotion]);

  // Depth: the scene leans a few pixels toward the finger, or with the phone.
  useParalaxe(orbitRef, !reducedMotion);

  return <div className="ep-character-section">
    <div ref={orbitRef} className="ep-orbit" data-motion-paused={reducedMotion} aria-label="Personagem e portais elementais"
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="ep-orbit-track ep-orbit-track-outer" aria-hidden="true" />
      <div className="ep-orbit-track ep-orbit-track-inner" aria-hidden="true" />
      <div className="ep-chao" aria-hidden="true" />
      <AnelXp fracao={fracao} />
      <div className="ep-avatar-stage">
        <div className="ep-avatar-halo" aria-hidden="true" />
        <Suspense fallback={null}>
          <AuraElemental
            colour={perfil?.colour ?? AURA_SEM_SIGNO.colour}
            modality={perfil?.modality ?? AURA_SEM_SIGNO.modality}
            scale={auraScale(nivel)}
            reducedMotion={reducedMotion}
          />
        </Suspense>
        <img className="ep-elemental-body" src="/sanctuary/elemental-body-v1.png" width={913} height={1723} alt="Personagem elemental com vestes escuras, detalhes dourados e cristal luminoso" draggable={false} />
      </div>
      <nav className="ep-portals" aria-label="Escolha um elemento">{ORDER.map((id, index) => {
        return <div key={id} className="ep-orbit-position" style={{ '--element-accent': ACCENTS[id], '--ordem': index, ...orbitStyle(index, 0) } as CSSProperties}>
          <Link id={`ep-entry-${id}`} to={elementHref(id)} className="ep-portal"
            onPointerEnter={(event) => { if (event.pointerType === 'mouse') setHovered(true); }}
            onPointerLeave={() => setHovered(false)}>
            <ElementMagic id={id} animated /><span className="ep-portal-name">{ELEMENTS[id].name}</span>
          </Link>
        </div>;
      })}</nav>
    </div>
  </div>;
}

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
  const { profile: signo } = useZodiacPreference();

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

  /**
   * Levelling up is rare and earned, which is what a ceremony is for. A habit
   * ticked keeps the small pop instead: three full screens every time would
   * be a punishment by the second day.
   *
   * Adjusted during render, React's own recipe for state that follows a prop,
   * so the ceremony opens on the same paint as the level it is marking.
   */
  const [nivelVisto, setNivelVisto] = useState(level.level);
  const [premio, setPremio] = useState<Premio | null>(null);
  if (nivelVisto !== level.level) {
    const subiu = level.level > nivelVisto;
    setNivelVisto(level.level);
    if (subiu) {
      setPremio({
        elemento: signo?.element,
        titulo: 'Você subiu de nível',
        numero: { rotulo: 'Nível', de: nivelVisto, para: level.level },
        destrave: { titulo: 'Próximo nível', detalhe: `${format(level.xpToNextLevel)} XP pela frente` },
      });
    }
  }

  return <>
    {premio ? <Cerimonia premio={premio} onFechar={() => setPremio(null)} /> : null}
    <div ref={cenaRef} className="ep-cena" data-entrada={entrada} style={luzDaSemana}>
      <section className="ep-sanctuary" aria-labelledby="ep-title">
        <div className="ep-character-navigation"><ElementalOrbit fracao={level.progressFraction} /></div>
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
