import { QuestNextSteps } from '@/components/quests/QuestNextSteps';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { TopBar } from '@/components/layout/TopBar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { SanctuaryRituals } from '@/components/elemental/SanctuaryRituals';
import { AllRoutesSheet } from '@/components/layout/AllRoutesSheet';
import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Menu, Plus, RotateCw, Search } from 'lucide-react';
import { AREAS, ELEMENTS, type ElementId } from '@/constants';
import { ACENTO } from '@/lib/design/palette';
import { useAppStore } from '@/stores/appStore';
import { createMaterialEffect } from '@/components/elemental/material-effects';
import { ELEMENT_ORDER as ORDER, SANCTUARY_HOME as HOME, elementHref, parseElement, previewRedirect, legacyElementHref, areaFilters, updateAreaFilters, matchesAreaName } from '@/components/elemental/navigation';
import { auraScale, useZodiacPreference, type ZodiacModality } from '@/lib/sanctuary/zodiac';
import { Cerimonia } from '@/components/cerimonia/Cerimonia';
import type { Premio } from '@/lib/cerimonia/cerimonia';
import './elemental-preview.css';
import { HudRecursos } from '@/components/layout/HudRecursos';
import { AnelXp } from '@/components/sanctuary/AnelXp';

/** The aura costs a shader and three.js, so it arrives after the page does. */
const AuraElemental = lazy(() => import('@/components/sanctuary/AuraElemental'));

/** Before anyone gives a birth date the aura still burns, in the app's gold. */
const AURA_SEM_SIGNO = { colour: '#d6b66f', modality: 'fixo' as ZodiacModality };

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

  return <div className="ep-character-section">
    <div ref={orbitRef} className="ep-orbit" data-motion-paused={reducedMotion} aria-label="Personagem e portais elementais"
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      <div className="ep-orbit-track ep-orbit-track-outer" aria-hidden="true" />
      <div className="ep-orbit-track ep-orbit-track-inner" aria-hidden="true" />
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
        return <div key={id} className="ep-orbit-position" style={{ '--element-accent': ACCENTS[id], ...orbitStyle(index, 0) } as CSSProperties}>
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
      <ElementSigil id={id} /><span>{ELEMENTS[id].name}</span><ArrowRight size={14} aria-hidden="true" />
    </Link>)}
  </nav>;
}

function SanctuaryComposition() {
  // Existing getters read several slices; subscribe to updates from both stores.
  const { user, currentAccountId, getLevelProgress } = useAppStore();
  const level = getLevelProgress();
  const { profile: signo } = useZodiacPreference();

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
    <section className="ep-sanctuary" aria-labelledby="ep-title">
      <div className="ep-character-navigation"><ElementalOrbit fracao={level.progressFraction} /></div>
      <div className="ep-identity">
        <h1 id="ep-title">{user.name || 'Mago Iniciante'}</h1>
        <p className="ep-level-line">Nível {level.level}</p>
      </div>
    </section>
    <section className="ep-next ds-pane" aria-labelledby="ep-next-heading">
      <div className="ep-next-heading"><div><p className="ep-kicker">Da intenção à prática</p><h2 id="ep-next-heading">Seu próximo passo</h2></div><Link className="ep-button ep-primary" to="/invocar"><Plus size={18} />Criar ritual</Link></div>
      <SanctuaryRituals key={currentAccountId ?? "local"} />
    </section>
    <QuestNextSteps />
    <Link className="ep-cycle-card" to="/ciclos"><RotateCw size={22} strokeWidth={1.25} aria-hidden="true" /><div><h3>O poder da constância</h3><p>Encontre seus hábitos e sequências em Ciclos.</p></div><ArrowRight size={20} aria-hidden="true" /></Link>
    <Link className="ep-all-paths" to="/mapa">Todos os caminhos<ArrowRight size={16} aria-hidden="true" /></Link>
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
  return <div className="ep-element-page" style={{ '--element-accent': ACCENTS[id] } as CSSProperties}>
    <Link to={HOME} state={{ focusElement: id }} className="ep-back"><ArrowLeft size={17} />Voltar ao Santuário</Link>
    <section className="ep-element-hero" aria-labelledby="ep-title">
      <div><p className="ep-kicker">{element.domain}</p><h1 id="ep-title">{element.name}</h1><p className="ep-intro">{element.description}.</p><div className="ep-element-facts"><span><strong>{format(points)}</strong> pontos registrados</span><span><strong>{areas.length}</strong> áreas para explorar</span><span><strong>{format(elementScore?.percentage ?? 0)}%</strong> dos pontos totais</span></div></div>
      <div className="ep-large-magic"><ElementMagic id={id} /></div>
    </section>
    <nav className="ep-element-switcher" aria-label="Trocar elemento">{ORDER.map((item) => <Link key={item} to={elementHref(item)} aria-current={item === id ? 'page' : undefined} style={{ '--element-accent': ACCENTS[item] } as CSSProperties}><ElementSigil id={item} /><span>{ELEMENTS[item].name}</span></Link>)}</nav>
    <section className="ep-areas" aria-labelledby="ep-areas-title">
      <div className="ep-area-toolbar"><div><h2 id="ep-areas-title">Suas áreas de vida</h2><p>Abra uma área para ver seus caminhos.</p></div><label className="ep-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar áreas de {element.name}</span><input type="search" name="elemental-area-search" autoComplete="off" spellCheck={false} placeholder="Buscar uma área…" value={query} onChange={(event) => updateFilters({ query: event.target.value })} /></label></div>
      <div className="ep-area-filters" role="group" aria-label="Filtrar áreas de vida">
        <button type="button" aria-pressed={!activeOnly} onClick={() => updateFilters({ activeOnly: false })}>Todas as áreas <span>{areas.length}</span></button>
        <button type="button" aria-pressed={activeOnly} onClick={() => updateFilters({ activeOnly: true })}>Minhas áreas ativas <span>{activeCount}</span></button>
      </div>
      <p className="ep-count" role="status">{filtered.length} de {areas.length} áreas{activeOnly ? ' · filtro de áreas ativas' : ''}</p>
      <div className="ep-area-grid">{filtered.map((area) => {
        const score = scores.find((entry) => entry.areaId === area.id);
        const active = selectedAreas.includes(area.id);
        return <details className="ep-area-card" key={area.id}>
          <summary><span className="ep-area-mark"><ElementSigil id={id} /></span><span className="ep-area-name">{area.name}<small>{active ? 'Área ativa' : 'Disponível para explorar'}</small></span><Plus size={19} className="ep-expand-icon" aria-hidden="true" /></summary>
          <div className="ep-area-content"><p>{area.description || `Uma área da sua jornada em ${element.name}.`}</p><span className="ep-area-score">{format(score?.score ?? 0)} pontos registrados · {score?.taskCount ?? 0} rituais</span><Link className="ep-button" to={area.id === 'area-saude' ? '/treinos' : `/dominios/${encodeURIComponent(area.id)}`}>{area.id === 'area-saude' ? 'Abrir treinos' : 'Explorar área'}<ArrowRight size={16} /></Link>{area.id === 'area-saude' && <Link className="ep-area-secondary" to={`/dominios/${encodeURIComponent(area.id)}`}>Ver subáreas de exercício físico<ArrowRight size={14} /></Link>}</div>
        </details>;
      })}</div>
      {filtered.length === 0 && <div className="ep-empty"><p>{query.trim() ? `Nenhuma área encontrada para “${query}”${activeOnly ? ' entre as áreas ativas' : ''}.` : 'Você ainda não ativou áreas deste elemento.'}</p><button type="button" className="ep-button" onClick={() => updateFilters({ query: '', activeOnly: false })}>Mostrar todas as áreas</button></div>}
      <Link to="/dominios" className="ep-manage">Gerenciar áreas ativas e personalizadas <ArrowRight size={16} /></Link>
    </section>
  </div>;
}

export default function ElementalPreview() {
  const [routesOpen, setRoutesOpen] = useState(false);
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
    <header className="ep-header"><Link to={HOME} className="ep-brand"><span className="ep-brand-symbol" aria-hidden="true"><ArcaneIcon name="santuario" /></span><span>Conselho<br /><strong>Elemental</strong></span></Link><nav aria-label="Navegação principal"><Link to={HOME} aria-current={!requested ? 'page' : undefined}>Santuário</Link><Link to="/pilares">Pilares</Link><button type="button" className="ep-app-menu" aria-label="Explorar todas as páginas" onClick={() => setRoutesOpen(true)} aria-expanded={routesOpen} aria-haspopup="dialog"><Menu size={18} aria-hidden="true" /><span>Explorar</span></button><TopBar accountOnly /></nav><HudRecursos /></header>
    <main id="ep-main" ref={mainRef} tabIndex={-1} className="ep-main" aria-label={id ? `Elemento ${ELEMENTS[id].name}` : requested ? 'Elemento não encontrado' : 'Santuário'}>
      {requested && !id ? <section className="ep-not-found"><h1 id="ep-title">Elemento não encontrado</h1><p>Escolha um dos quatro elementos para continuar sua jornada.</p><ElementDirectory /><Link className="ep-back" to={HOME}><ArrowLeft size={17} />Voltar ao Santuário</Link></section> : id ? <ElementComposition key={id} id={id} /> : <SanctuaryComposition />}
    </main>
    <AllRoutesSheet open={routesOpen} onOpenChange={setRoutesOpen} />
    <MobileBottomNav />
    <footer className="ep-footer"><span>Uma jornada. Quatro elementos.</span><Link to="/mapa">Explorar sua jornada <ArrowRight size={14} /></Link></footer>
  </div>;
}
