import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as TecladoReact, type PointerEvent as PonteiroReact } from 'react';
import { Link } from 'react-router-dom';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';
import { createMaterialEffect } from '@/components/elemental/material-effects';
import { ELEMENT_ORDER as ORDER, elementHref } from '@/components/elemental/navigation';
import { AREAS, ELEMENTS, type ElementId } from '@/constants';
import { ACENTO } from '@/lib/design/palette';
import { progressoDoNivel, niveisDosElementos } from '@/lib/cerimonia/nivel';
import { useAppStore } from '@/stores/appStore';
import { auraScale, useZodiacPreference, type ZodiacModality } from '@/lib/sanctuary/zodiac';
import { AnelXp } from './AnelXp';
import { useParalaxe } from './useCenaViva';
import type { CenaOrbes } from './orbes-tipos';
import {
  FASE_FRENTE, LIMIAR_ARRASTO, PAUSA_APOS_GESTO_MS, alvoDoEncaixe, avancoAutomatico, cargaDosPendentes,
  emRepousoDaMola, encaixeMaisProximo, estadosDasOrbes, faseDoArrasto, faseParaFrente, geometria, indiceDaFrente,
  passoDaMola, velocidadeSuavizada,
} from './constelacao-fisica';
import { dataLocal, pendentesDeHoje, textoDePendentes, vertentesDoElemento } from './constelacao-dados';

/**
 * Once per opening of the app, like the entrance of the scene: the hint to
 * drag is a welcome, and said every time it would be noise.
 */
let dicaJaVista = false;

/** The aura costs a shader and three.js, so it arrives after the page does. */
const AuraElemental = lazy(() => import('@/components/sanctuary/AuraElemental'));

/** Before anyone gives a birth date the aura still burns, in the app's gold. */
export const AURA_SEM_SIGNO = { colour: '#d6b66f', modality: 'fixo' as ZodiacModality };

const XP_DO_ELEMENTO: Record<ElementId, 'xp_fire' | 'xp_water' | 'xp_air' | 'xp_earth'> = {
  fogo: 'xp_fire', agua: 'xp_water', ar: 'xp_air', terra: 'xp_earth',
};

export function ElementSigil({ id, className }: { id: ElementId; className?: string }) {
  const down = id === 'agua' || id === 'terra';
  return <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d={down ? 'M7 10H41L24 39Z' : 'M24 8L41 37H7Z'} strokeLinejoin="round" />
    {(id === 'terra' || id === 'ar') && <path d={down ? 'M8 20H40' : 'M8 27H40'} />}
  </svg>;
}

/** The art of one orb in 2D. With the WebGL scene running it is hidden, never removed: the layout and the touch target stay. */
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

/** Pixels of canvas beyond each side of the stage (kept below the page's side padding, so nothing scrolls). */
const MARGEM_GL = 18;

function pintar(posicoes: readonly HTMLElement[], fase: number, largura: number) {
  posicoes.forEach((posicao, indice) => {
    const g = geometria(indice, fase, largura);
    posicao.style.setProperty('--orbit-x', String(g.orbitaX));
    posicao.style.setProperty('--orbit-y', String(g.orbitaY));
    posicao.style.setProperty('--orbit-scale', String(g.escala));
    posicao.style.setProperty('--orbit-opacity', String(g.opacidade));
    posicao.style.zIndex = String(g.z);
  });
}

/** The card of the orb in front: what that element is for this person, and the way in. */
function CartaoDeFoco({ id, pendentes }: { id: ElementId; pendentes: number }) {
  const user = useAppStore((state) => state.user);
  const customAreas = useAppStore((state) => state.customAreas);
  const selectedAreas = useAppStore((state) => state.onboarding.selectedAreas);
  const nome = ELEMENTS[id].name;
  const xp = user[XP_DO_ELEMENTO[id]] ?? 0;
  const progresso = progressoDoNivel(xp);
  const vertentes = vertentesDoElemento(id, [...AREAS, ...customAreas], selectedAreas);
  const format = (valor: number) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return <section className="ep-foco ds-pane" aria-label="Elemento em foco" style={{ '--element-accent': ACENTO[id] } as CSSProperties}>
    <div className="ep-foco-corpo" key={id}>
      <div className="ep-foco-topo">
        <svg className="ep-foco-anel" viewBox="0 0 40 40" aria-hidden="true">
          <circle className="ep-foco-trilho" cx="20" cy="20" r="16" pathLength="1" />
          <circle className="ep-foco-fio" cx="20" cy="20" r="16" pathLength="1" style={{ strokeDasharray: `${progresso.fracao} 1` }} />
        </svg>
        <div className="ep-foco-texto">
          <p className="ep-foco-nome">{nome}</p>
          <p className="ep-foco-nivel">Nível {progresso.nivel} · faltam {format(progresso.faltam)} XP</p>
        </div>
        <Link className="ds-botao ep-foco-entrar" data-tipo="secundario" to={elementHref(id)} aria-label={`Entrar em ${nome}`}>
          Entrar <ArcaneIcon name="seta" size={16} />
        </Link>
      </div>
      {vertentes.total > 0 || pendentes > 0 ? <div className="ep-foco-base">
        {vertentes.total > 0 ? <ul className="ep-foco-vertentes" aria-label={`Vertentes de ${nome}`}>
          {vertentes.nomes.map((area) => <li key={area}>{area}</li>)}
          {vertentes.restantes > 0 ? <li className="ep-foco-mais">+{vertentes.restantes}</li> : null}
        </ul> : null}
        {pendentes > 0 ? <p className="ep-foco-pendencia"><span className="ep-foco-ponto" aria-hidden="true" />{textoDePendentes(pendentes)}</p> : null}
      </div> : null}
    </div>
  </section>;
}

type Modo = 'auto' | 'arrasto' | 'mola';

interface Arrasto { id: number; x0: number; y0: number; x: number; t: number; ativo: boolean }

/**
 * The four elements as a constellation around the mage. They turn slowly in
 * front of the body; the one at the front is in focus and tells what it is in
 * a card below. A drag turns them and lands on the nearest one; a tap enters
 * it. The pixels of the orbs are drawn by a WebGL scene when the device can
 * hold it, and by the 2D art otherwise; the links people touch are always the
 * same real links.
 */
export function Constelacao({ fracao }: { fracao: number }) {
  const orbitRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<CenaOrbes | null>(null);
  const [gl, setGl] = useState<'pendente' | 'ativo' | 'recuo'>('pendente');
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [foco, setFoco] = useState(0);
  const [anuncio, setAnuncio] = useState('');
  const [dica, setDica] = useState(() => !dicaJaVista);

  const user = useAppStore((state) => state.user);
  const tasks = useAppStore((state) => state.tasks);
  const getLevelProgress = useAppStore((state) => state.getLevelProgress);
  // The aura is the person's: their sign gives it colour, their level its reach.
  const { profile: perfil } = useZodiacPreference();
  const nivelDoMago = getLevelProgress().level;
  const niveis = useMemo(() => niveisDosElementos(user), [user]);
  const pendentes = useMemo(() => pendentesDeHoje(tasks, dataLocal(new Date())), [tasks]);
  const cargas = useMemo(() => ORDER.map((id) => cargaDosPendentes(pendentes[id] ?? 0)), [pendentes]);

  // The loop reads these every frame; none of them is a reason to render.
  const fase = useRef(FASE_FRENTE);
  const velocidade = useRef(0);
  const modo = useRef<Modo>('auto');
  const alvo = useRef(FASE_FRENTE);
  const pausaAte = useRef(0);
  const largura = useRef(390);
  const pairando = useRef(-1);
  const tocado = useRef(-1);
  const comFoco = useRef(false);
  const interagiu = useRef(false);
  const sujo = useRef(true);
  const frente = useRef(0);
  const arrasto = useRef<Arrasto | null>(null);
  const cliqueBloqueado = useRef(false);
  const reduzidoRef = useRef(reducedMotion);
  const cargasRef = useRef(cargas);
  reduzidoRef.current = reducedMotion;
  cargasRef.current = cargas;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const esconderDica = useCallback(() => {
    dicaJaVista = true;
    setDica(false);
  }, []);
  useEffect(() => {
    if (!dica) return;
    const fim = window.setTimeout(esconderDica, 9000);
    return () => window.clearTimeout(fim);
  }, [dica, esconderDica]);

  const anunciar = useCallback(() => {
    if (!interagiu.current) return;
    interagiu.current = false;
    const id = ORDER[indiceDaFrente(fase.current)];
    setAnuncio(`${ELEMENTS[id].name} em foco`);
  }, []);

  /** Brings orb `indice` to the front: a short spring, or at once when motion is not wanted. */
  const levarAFrente = useCallback((indice: number) => {
    const destino = faseParaFrente(indice, modo.current === 'mola' ? alvo.current : fase.current);
    if (modo.current === 'mola' && destino === alvo.current) return;
    interagiu.current = true;
    pausaAte.current = performance.now() + PAUSA_APOS_GESTO_MS;
    alvo.current = destino;
    if (reduzidoRef.current) {
      fase.current = destino;
      velocidade.current = 0;
      modo.current = 'auto';
      sujo.current = true;
      anunciar();
    } else modo.current = 'mola';
  }, [anunciar]);

  // WebGL scene: dynamic, so the page never waits for it, and any failure is just the 2D art.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let vivo = true;
    let cena: CenaOrbes | null = null;
    let observador: ResizeObserver | undefined;
    const recuar = () => {
      cena?.parar();
      cena = null;
      glRef.current = null;
      if (vivo) setGl('recuo');
    };
    (async () => {
      try {
        const modulo = await import('@/components/sanctuary/orbes-cena');
        if (!vivo) return;
        cena = modulo.criarCenaOrbes(canvas, { elementos: ORDER, reduzido: reducedMotion, aoDegradar: recuar });
        if (!cena) { setGl('recuo'); return; }
        glRef.current = cena;
        sujo.current = true;
        setGl('ativo');
        observador = new ResizeObserver(() => { cena?.redimensionar(); sujo.current = true; });
        observador.observe(canvas);
      } catch {
        recuar();
      }
    })();
    return () => {
      vivo = false;
      observador?.disconnect();
      cena?.parar();
      glRef.current = null;
    };
  }, [reducedMotion]);

  const glAtivo = gl === 'ativo';

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return;
    const posicoes = [...orbit.querySelectorAll<HTMLElement>('.ep-orbit-position')];
    const medir = () => { largura.current = orbit.clientWidth || 390; sujo.current = true; };
    medir();

    // The 2D material effects are only worth their cost while they are the ones seen.
    const superficies = reducedMotion || glAtivo ? [] : [...orbit.querySelectorAll<HTMLCanvasElement>('[data-element-effect]')].flatMap((canvas) => {
      const id = ORDER.find((element) => element === canvas.dataset.elementEffect);
      const superficie = id && createMaterialEffect(canvas, id, canvas.parentElement?.querySelector('img') ?? null);
      return superficie ? [superficie] : [];
    });
    const observador = new ResizeObserver(() => { medir(); superficies.forEach((s) => s.resize()); });
    observador.observe(orbit);
    orbit.querySelectorAll('[data-element-effect]').forEach((canvas) => observador.observe(canvas));

    let quadro = 0;
    let anterior: number | undefined;
    let visivel = false;
    let relogio = 0;
    const tick = (agora: number) => {
      const reduzido = reduzidoRef.current;
      // Keep the phase when paused; never catch up after a hidden tab or a long frame.
      const dt = anterior === undefined ? 0 : Math.min((agora - anterior) / 1000, 0.064);
      anterior = agora;
      relogio += dt;
      let mexeu = false;
      if (modo.current === 'mola') {
        const proximo = passoDaMola(fase.current, velocidade.current, alvo.current, dt);
        fase.current = proximo.fase;
        velocidade.current = proximo.velocidade;
        if (emRepousoDaMola(fase.current, velocidade.current, alvo.current)) {
          fase.current = alvo.current;
          velocidade.current = 0;
          modo.current = 'auto';
          pausaAte.current = agora + PAUSA_APOS_GESTO_MS;
          anunciar();
        }
        mexeu = true;
      } else if (modo.current === 'auto' && !reduzido && pairando.current < 0 && !comFoco.current && agora >= pausaAte.current && dt > 0) {
        fase.current += avancoAutomatico(dt);
        mexeu = true;
      }
      if (mexeu || sujo.current) pintar(posicoes, fase.current, largura.current);
      const naFrente = indiceDaFrente(fase.current);
      if (naFrente !== frente.current) { frente.current = naFrente; setFoco(naFrente); }
      const cena = glRef.current;
      if (cena) {
        if (!reduzido || sujo.current) {
          // The canvas is wider than the stage by MARGEM_GL on each side, so a halo at the edge is not cut.
          const w = largura.current;
          const estados = estadosDasOrbes(ORDER, fase.current, w, cargasRef.current, tocado.current >= 0 ? tocado.current : pairando.current)
            .map((e) => ({ ...e, x: (e.x * w + MARGEM_GL) / (w + 2 * MARGEM_GL), escala: e.escala * w / (w + 2 * MARGEM_GL) }));
          cena.atualizar(estados, relogio);
        }
      } else if (superficies.length) superficies.forEach((s) => s.paint(relogio));
      sujo.current = false;
      quadro = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(quadro);
      anterior = undefined;
      orbit.dataset.motionPaused = String(!visivel || document.hidden);
      if (visivel && !document.hidden) quadro = requestAnimationFrame(tick);
    };
    const interseccao = new IntersectionObserver(([entrada]) => { visivel = entrada.isIntersecting; sync(); });
    interseccao.observe(orbit);
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(quadro);
      interseccao.disconnect();
      observador.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [reducedMotion, glAtivo, anunciar]);

  // Depth: the scene leans a few pixels toward the finger, or with the phone.
  useParalaxe(orbitRef, !reducedMotion);

  const indiceDoAlvo = (alvoDoEvento: EventTarget | null) => {
    const el = (alvoDoEvento as HTMLElement | null)?.closest?.<HTMLElement>('[data-indice]');
    return el ? Number(el.dataset.indice) : -1;
  };

  const aoPressionar = (evento: PonteiroReact<HTMLDivElement>) => {
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    cliqueBloqueado.current = false;
    tocado.current = indiceDoAlvo(evento.target);
    arrasto.current = { id: evento.pointerId, x0: evento.clientX, y0: evento.clientY, x: evento.clientX, t: evento.timeStamp, ativo: false };
  };
  const aoMover = (evento: PonteiroReact<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a || a.id !== evento.pointerId) return;
    if (!a.ativo) {
      const dx = evento.clientX - a.x0;
      const dy = evento.clientY - a.y0;
      if (Math.abs(dx) < LIMIAR_ARRASTO || Math.abs(dx) < Math.abs(dy)) return;
      a.ativo = true;
      a.x = evento.clientX;
      a.t = evento.timeStamp;
      modo.current = 'arrasto';
      velocidade.current = 0;
      cliqueBloqueado.current = true;
      interagiu.current = true;
      tocado.current = -1;
      esconderDica();
      try { evento.currentTarget.setPointerCapture(evento.pointerId); } catch { /* the pointer is already gone */ }
      return;
    }
    const delta = faseDoArrasto(evento.clientX - a.x, largura.current);
    const segundos = (evento.timeStamp - a.t) / 1000;
    fase.current += delta;
    velocidade.current = velocidadeSuavizada(velocidade.current, delta, segundos);
    a.x = evento.clientX;
    a.t = evento.timeStamp;
    sujo.current = true;
  };
  const aoSoltar = (evento: PonteiroReact<HTMLDivElement>) => {
    const a = arrasto.current;
    if (!a || a.id !== evento.pointerId) return;
    arrasto.current = null;
    tocado.current = -1;
    if (!a.ativo) return;
    try { evento.currentTarget.releasePointerCapture(evento.pointerId); } catch { /* already released */ }
    // A finger that rested before lifting throws nothing.
    const velocidadeFinal = evento.timeStamp - a.t > 100 || evento.type === 'pointercancel' ? 0 : velocidade.current;
    pausaAte.current = performance.now() + PAUSA_APOS_GESTO_MS;
    if (reduzidoRef.current) {
      fase.current = encaixeMaisProximo(fase.current);
      velocidade.current = 0;
      modo.current = 'auto';
      sujo.current = true;
      anunciar();
    } else {
      alvo.current = alvoDoEncaixe(fase.current, velocidadeFinal);
      velocidade.current = velocidadeFinal;
      modo.current = 'mola';
    }
  };

  const aoTeclar = (evento: TecladoReact<HTMLElement>) => {
    if (evento.altKey || evento.ctrlKey || evento.metaKey) return;
    const indice = indiceDoAlvo(evento.target);
    if (evento.key === ' ' && indice >= 0) {
      evento.preventDefault();
      (evento.target as HTMLElement).closest('a')?.click();
      return;
    }
    if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
    evento.preventDefault();
    esconderDica();
    // The orb standing at the right of the front is the next one to arrive when going right.
    const atual = indiceDaFrente(modo.current === 'mola' ? alvo.current : fase.current);
    const proximo = (atual + (evento.key === 'ArrowRight' ? 3 : 1)) % 4;
    levarAFrente(proximo);
    document.getElementById(`ep-entry-${ORDER[proximo]}`)?.focus({ preventScroll: true });
  };

  const emFoco = ORDER[foco];

  return <div className="ep-character-section">
    <div ref={orbitRef} className="ep-orbit" data-gl={glAtivo ? 'true' : 'false'} data-motion-paused={reducedMotion} aria-label="Personagem e portais elementais"
      onPointerDown={aoPressionar} onPointerMove={aoMover} onPointerUp={aoSoltar} onPointerCancel={aoSoltar}
      onClickCapture={(evento) => { if (cliqueBloqueado.current) { cliqueBloqueado.current = false; evento.preventDefault(); evento.stopPropagation(); } }}
      onDragStart={(evento) => evento.preventDefault()}
      onPointerLeave={() => { pairando.current = -1; }}
      onFocusCapture={(evento) => {
        comFoco.current = true;
        const indice = indiceDoAlvo(evento.target);
        // Tab moves the focus; the orb follows it. A mouse press must not: the orb would slide from under the finger.
        if (indice >= 0 && indice !== indiceDaFrente(modo.current === 'mola' ? alvo.current : fase.current) && (evento.target as HTMLElement).matches(':focus-visible')) levarAFrente(indice);
      }}
      onBlurCapture={(evento) => { if (!evento.currentTarget.contains(evento.relatedTarget)) comFoco.current = false; }}>
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
            scale={auraScale(nivelDoMago)}
            reducedMotion={reducedMotion}
          />
        </Suspense>
        <img className="ep-elemental-body" src="/sanctuary/elemental-body-v1.png" width={913} height={1723} alt="Personagem elemental com vestes escuras, detalhes dourados e cristal luminoso" draggable={false} />
        <div className="ep-corpo-tinge" key={emFoco} style={{ '--element-accent': ACENTO[emFoco] } as CSSProperties} aria-hidden="true" />
      </div>
      <canvas ref={canvasRef} className="ep-orbes-gl" aria-hidden="true" />
      <nav className="ep-portals" aria-label="Escolha um elemento" onKeyDown={aoTeclar}>{ORDER.map((id, index) => {
        const g = geometria(index, FASE_FRENTE, 390);
        const pendente = pendentes[id] ?? 0;
        const nome = ELEMENTS[id].name;
        return <div key={id} className="ep-orbit-position" data-frente={index === foco ? '' : undefined} data-pendente={pendente > 0 ? '' : undefined}
          style={{ '--element-accent': ACENTO[id], '--ordem': index, '--carga': cargas[index], '--orbit-x': g.orbitaX, '--orbit-y': g.orbitaY, '--orbit-scale': g.escala, '--orbit-opacity': g.opacidade, zIndex: g.z } as CSSProperties}>
          <Link id={`ep-entry-${id}`} to={elementHref(id)} className="ep-portal" draggable={false} data-indice={index}
            aria-label={`${nome}, nível ${niveis[id]}${pendente > 0 ? `, ${textoDePendentes(pendente)}` : ''}`}
            onPointerEnter={(evento) => { if (evento.pointerType === 'mouse') pairando.current = index; }}
            onPointerLeave={() => { pairando.current = -1; }}>
            <ElementMagic id={id} animated />
            <span className="ep-portal-name">{nome}{pendente > 0 ? <span className="ep-portal-ponto" aria-hidden="true" /> : null}</span>
          </Link>
        </div>;
      })}</nav>
      {dica ? <p className="ep-gesto-dica ds-pane" aria-hidden="true"><span>‹</span> arraste para girar <span>›</span></p> : null}
    </div>
    <CartaoDeFoco id={emFoco} pendentes={pendentes[emFoco] ?? 0} />
    <p className="sr-only" aria-live="polite">{anuncio}</p>
  </div>;
}
