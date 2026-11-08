import {
  type CSSProperties,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { lunarSnapshot } from '@/components/temporal/celestial/lunar-presentation';
import { createAwakeningAudio, type AwakeningAudio } from '@/lib/sanctuary/awakening-audio';
import {
  advance,
  INITIAL_PHASE,
  isPlaying,
  isSettled,
  onVisibility,
} from '@/lib/sanctuary/awakening-controller';
import {
  ALTAR,
  AWAKENING_ELEMENTS,
  type AwakeningElementId,
  PARALLAX,
  PLATE_ASPECT,
  awaken,
  createAwakening,
  isAwakeningComplete,
  isLit,
  parallaxOffset,
  type ScenePoint,
} from '@/lib/sanctuary/awakening-scene';
import {
  getSanctuaryCity,
  type SanctuaryCityId,
  useSanctuaryCityPreference,
} from '@/lib/temporal/sanctuary-city';
import { COMPOSED_MOON, COMPOSED_SUN, sanctuaryCaption, sanctuarySky } from '@/lib/temporal/sanctuary-sky';
import './despertar-cena.css';

/**
 * The real Moon costs three.js and two NASA maps, so it is only fetched when
 * the sky actually has a Moon to show. Until it arrives the flat sprite stands
 * in, which is also what a browser without WebGL keeps.
 */
const MoonScene = lazy(() => import('@/components/temporal/celestial/MoonScene'));

const BASE = '/sanctuary/despertar';
/** Below this lit fraction the Moon gives the scene no usable light. */
const NEW_MOON_LIMIT = 0.08;
/** Matches the procedural Sun in the scene manifest: core plus two glows. */
const SUN_DIAMETER = 0.2246 * 1.35 * 2;
const MOON_WIDTH = 0.166;
const PARTICLES_PER_ELEMENT = 14;
/**
 * The closing beat. Completing used to hand over on the same frame the fourth
 * element lit, so the bloom and the closing line were never seen: the payoff
 * of the whole scene was cut. The scene now holds, then darkens into what
 * follows. Skipping still leaves at once, because that is what skipping means.
 */
const FECHO_MS = 2600;
/** The first line holds alone, so the sanctuary is seen before it asks. */
const ABERTURA_MS = 2600;

const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/** Width in plate fractions turned into a square box of that physical size. */
const squareOf = (widthFraction: number) => ({
  inlineSize: `${widthFraction * 100}%`,
  aspectRatio: '1',
});

const centredAt = (point: ScenePoint) => ({
  insetInlineStart: `${point.x * 100}%`,
  insetBlockStart: `${point.y * 100}%`,
  translate: '-50% -50%',
});

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  rise: number;
}

const seedParticles = (): Map<AwakeningElementId, Particle[]> => {
  const map = new Map<AwakeningElementId, Particle[]>();
  for (const element of AWAKENING_ELEMENTS) {
    map.set(
      element.id,
      Array.from({ length: PARTICLES_PER_ELEMENT }, (_, index) => ({
        angle: (index / PARTICLES_PER_ELEMENT) * Math.PI * 2,
        radius: element.glowRadius * (0.45 + (index % 5) * 0.14),
        speed: 0.18 + (index % 3) * 0.08,
        size: 1.2 + (index % 4) * 0.5,
        rise: 0.01 + (index % 6) * 0.004,
      })),
    );
  }
  return map;
};

export interface DespertarCenaProps {
  /** Overridable so tests and the Studio can pin a moment. */
  readonly at?: Date;
  readonly cityId?: SanctuaryCityId;
  readonly onSkip?: () => void;
  /**
   * Fires once, when the closing beat ends or the scene is skipped.
   * `soundEnabled` says whether the person kept sound on, which is the only
   * thing that may later authorise the music that follows the introduction.
   */
  readonly onComplete?: (detail: { soundEnabled: boolean }) => void;
}

export function DespertarCena({ at, cityId, onSkip, onComplete }: DespertarCenaProps) {
  const preference = useSanctuaryCityPreference();
  const city = cityId ? getSanctuaryCity(cityId) : preference.city;
  const moment = useMemo(() => at ?? new Date(), [at]);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  const [basePhase, setPhase] = useState(reduced ? 'running' : INITIAL_PHASE);
  const [state, setState] = useState(createAwakening);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundStarted, setSoundStarted] = useState(false);
  const [pronta, setPronta] = useState(false);
  const [abertura, setAbertura] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const skyRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<AwakeningAudio | null>(null);
  /** Asked for quiet. A later touch must never speak over that. */
  const hushed = useRef(false);
  /** Read by the closing beat, which must not restart when sound changes. */
  const soundRef = useRef(false);
  const announced = useRef(false);

  const sky = useMemo(() => sanctuarySky(moment, city), [moment, city]);
  const lunar = useMemo(() => lunarSnapshot(moment), [moment]);
  // Composed, not live. `COMPOSED_SUN` carries the reasoning: the plate is one
  // late afternoon and its light already falls from the right, so a Sun placed
  // by the current hour contradicts the painting it is drawn on.
  const sun = COMPOSED_SUN;
  const moon = COMPOSED_MOON;
  // In full daylight a Moon is washed out, so the flat sprite is enough and
  // three.js is never fetched. A new Moon still earns the 3D pass: the dark
  // disc against the sky is the point.
  const showRealMoon = sky.daylight !== 'day';
  const newMoon = sky.moon.illuminated < NEW_MOON_LIMIT;
  const complete = isAwakeningComplete(state);
  // Finishing is derived, not stored: the lit elements already say it, and a
  // second copy in state would only be a render behind. Skipping still wins,
  // because 'skipped' is terminal and ignores the completion signal.
  const phase = complete ? advance(basePhase, 'complete') : basePhase;
  const settled = isSettled(phase);
  /** Derived, like the phase: finishing is the only thing that darkens. */
  const saindo = phase === 'done';

  const marcarSom = useCallback((ligado: boolean) => {
    soundRef.current = ligado;
    setSoundEnabled(ligado);
  }, []);

  // One teardown for the whole scene: the audio graph never outlives it.
  useEffect(() => {
    return () => {
      void audioRef.current?.stop();
      audioRef.current = null;
    };
  }, []);

  /**
   * The closing beat, held so the bloom and the last line are actually seen.
   * Sound is only suspended at the end of it, so the scene does not fall
   * silent on the very frame it is trying to land.
   */
  useEffect(() => {
    if (!settled || announced.current) return;
    announced.current = true;

    if (phase === 'skipped') {
      void audioRef.current?.stop();
      return;
    }

    const fim = window.setTimeout(() => {
      void audioRef.current?.suspend();
      onComplete?.({ soundEnabled: soundRef.current });
    }, FECHO_MS);
    return () => window.clearTimeout(fim);
  }, [settled, phase, onComplete]);

  // Leaving the app pauses the scene and the sound; coming back resumes both.
  useEffect(() => {
    const sync = () => {
      setPhase((current) => onVisibility(current, document.hidden));
      if (document.hidden) void audioRef.current?.suspend();
      else if (!isSettled(phase)) void audioRef.current?.resume();
    };
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, [phase]);

  // The opening line gives way on its own, or the moment a hand arrives.
  useEffect(() => {
    if (!abertura || !isPlaying(phase)) return;
    const fim = window.setTimeout(() => setAbertura(false), ABERTURA_MS);
    return () => window.clearTimeout(fim);
  }, [abertura, phase]);

  /**
   * Sound arrives with the first element: that press is the gesture every
   * browser requires, and the moment the scene has earned a voice. Asking
   * about audio before anything has happened was a decision with no context.
   */
  const ensureAudio = useCallback(async (): Promise<AwakeningAudio | null> => {
    if (hushed.current) return null;
    if (!audioRef.current) audioRef.current = createAwakeningAudio();
    const audio = audioRef.current;
    if (!audio.started) {
      await audio.start();
      audio.setMuted(false);
      setSoundStarted(true);
      marcarSom(true);
    }
    return audio;
  }, [marcarSom]);

  const light = useCallback(
    (id: AwakeningElementId) => {
      setState((current) => awaken(current, id));
      setAbertura(false);
      void ensureAudio().then((audio) => audio?.lightVoice(id));
    },
    [ensureAudio],
  );

  const skip = useCallback(() => {
    setPhase((current) => advance(current, 'skip'));
    onSkip?.();
  }, [onSkip]);

  const toggleSound = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio?.started) {
      hushed.current = false;
      const started = await ensureAudio();
      if (!started) return;
      for (const id of state.lit) started.lightVoice(id);
      return;
    }

    const next = !audio.muted;
    audio.setMuted(next);
    hushed.current = next;
    marcarSom(!next);
  }, [ensureAudio, marcarSom, state.lit]);

  /** The plate decides when the scene appears, and a failed plate still does. */
  const aoCarregar = useCallback(() => {
    setPronta(true);
    setPhase((current) => advance(current, current === 'idle' ? 'start' : 'ready'));
  }, []);

  /**
   * Parallax is written straight to the two layers, never through state: a
   * pointer fires far more often than React should re-render a scene with a
   * canvas in it. The drift also eases toward the target instead of snapping,
   * which is what makes it read as a camera rather than a cursor.
   */
  useEffect(() => {
    if (reduced) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const onPointer = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return;
      target.x = event.gamma / 45;
      target.y = (event.beta - 45) / 45;
    };

    const step = () => {
      current.x += (target.x - current.x) * 0.06;
      current.y += (target.y - current.y) * 0.06;

      const stage = parallaxOffset(current, PARALLAX.plate);
      const sky = parallaxOffset(current, PARALLAX.sky - PARALLAX.plate);
      if (stageRef.current) {
        stageRef.current.style.translate = `calc(-50% + ${stage.x * 100}%) calc(-50% + ${(stage.y / PLATE_ASPECT) * 100}%)`;
      }
      if (skyRef.current) {
        skyRef.current.style.translate = `${sky.x * 100}% ${(sky.y / PLATE_ASPECT) * 100}%`;
      }
      frame = requestAnimationFrame(step);
    };

    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const start = () => {
      if (frame || document.hidden) return;
      frame = requestAnimationFrame(step);
    };
    const onVisibilityChange = () => (document.hidden ? stop() : start());

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onOrientation);
    document.addEventListener('visibilitychange', onVisibilityChange);
    start();

    return () => {
      stop();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onOrientation);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [reduced]);

  // Particles. Nothing is drawn unless the scene is actually playing.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (reduced || !canvas || !isPlaying(phase)) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const particles = seedParticles();
    let frame = 0;
    let last = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
    };

    const draw = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (const element of AWAKENING_ELEMENTS) {
        if (!isLit(state, element.id)) continue;
        context.fillStyle = element.colour;

        for (const particle of particles.get(element.id) ?? []) {
          particle.angle += particle.speed * delta;
          const x = element.x + Math.cos(particle.angle) * particle.radius;
          const y =
            element.y +
            (Math.sin(particle.angle) * particle.radius) / PLATE_ASPECT -
            Math.sin(particle.angle * 0.5) * particle.rise;

          context.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(particle.angle * 2));
          context.beginPath();
          context.arc(x * canvas.width, y * canvas.height, particle.size * (canvas.width / 390), 0, Math.PI * 2);
          context.fill();
        }
      }

      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [reduced, phase, state]);

  const fechamento = `Os quatro responderam. ${sanctuaryCaption(sky)}.`;
  const saudando = abertura && state.lit.length === 0;
  const convite = saudando
    ? 'O santuário reconhece você.'
    : 'Toque os elementos ao redor do altar, na ordem que quiser.';

  return (
    <section
      className="despertar-cena"
      aria-labelledby="despertar-titulo"
      data-fase={phase}
      data-pronta={pronta}
    >
      <h2 id="despertar-titulo" className="sr-only">
        Despertar dos quatro elementos no santuário
      </h2>

      <div
        className="despertar-palco"
        ref={stageRef}
        style={{ scale: reduced ? '1' : '1.03' }}
      >
        <picture>
          <source
            type="image/avif"
            srcSet={`${BASE}/placa-base-390w.avif 390w, ${BASE}/placa-base-780w.avif 780w, ${BASE}/placa-base-1024w.avif 1024w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${BASE}/placa-base-390w.webp 390w, ${BASE}/placa-base-780w.webp 780w, ${BASE}/placa-base-1024w.webp 1024w`}
            sizes="100vw"
          />
          <img
            className="despertar-placa"
            src={`${BASE}/reserva-780w.jpg`}
            alt="Santuário ancestral de pedra sobre a água, com um altar de runas douradas ao centro."
            decoding="async"
            onLoad={aoCarregar}
            onError={aoCarregar}
          />
        </picture>

        <div className="despertar-ceu" ref={skyRef}>
          {sun.visible ? (
            <div className="despertar-sol" style={{ ...squareOf(SUN_DIAMETER), ...centredAt(sun) }} />
          ) : null}
          {showRealMoon ? (
            <div
              className="despertar-lua-3d"
              aria-hidden="true"
              style={{ ...squareOf(MOON_WIDTH), ...centredAt(moon) }}
            >
              <Suspense fallback={<img className="despertar-lua" src={`${BASE}/sprite-lua.webp`} alt="" />}>
                <MoonScene moon={lunar} south={sky.hemisphere === 'south'} />
              </Suspense>
            </div>
          ) : (
            <img
              className="despertar-lua"
              src={`${BASE}/sprite-lua.webp`}
              alt=""
              aria-hidden="true"
              style={{ ...squareOf(MOON_WIDTH), ...centredAt(moon) }}
            />
          )}
        </div>

        {complete && !reduced ? (
          <div
            className="despertar-conclusao"
            aria-hidden="true"
            style={{
              background: `radial-gradient(circle at ${ALTAR.x * 100}% ${ALTAR.y * 100}%, rgba(255,246,220,0.9) 0%, rgba(255,214,138,0.45) 16%, rgba(255,214,138,0) 44%)`,
            }}
          />
        ) : null}

        {newMoon ? (
          <div
            className="despertar-realce"
            aria-hidden="true"
            style={{
              background: `radial-gradient(ellipse 34% 20% at ${ALTAR.x * 100}% ${ALTAR.y * 100}%, rgba(214,182,111,0.3) 0%, rgba(214,182,111,0) 70%)`,
            }}
          />
        ) : null}

        {AWAKENING_ELEMENTS.map((element, index) =>
          isLit(state, element.id) ? null : (
            <div
              key={`dormente-${element.id}`}
              className="despertar-dormente"
              aria-hidden="true"
              style={{
                ...squareOf(element.glowRadius * 1.45),
                ...centredAt(element),
                animationDelay: `${index * 620}ms`,
                background: `radial-gradient(circle, ${element.colour}00 54%, ${element.colour}40 73%, ${element.colour}00 90%)`,
              }}
            />
          ),
        )}

        {AWAKENING_ELEMENTS.map((element) => (
          <div
            key={`brilho-${element.id}`}
            className="despertar-brilho"
            data-aceso={isLit(state, element.id)}
            data-respirando={isLit(state, element.id) && isPlaying(phase)}
            style={{
              ...squareOf(element.glowRadius * 2),
              ...centredAt(element),
              background: `radial-gradient(circle, ${element.colour} 0%, ${element.colour}cc 14%, ${element.colour}55 34%, ${element.colour}00 66%)`,
            }}
          />
        ))}

        <canvas className="despertar-particulas" ref={canvasRef} aria-hidden="true" />

        {AWAKENING_ELEMENTS.map((element) => (
          <button
            key={`alvo-${element.id}`}
            type="button"
            className="despertar-alvo"
            style={{ ...squareOf(element.touchRadius * 2), ...centredAt(element) }}
            aria-pressed={isLit(state, element.id)}
            onClick={() => light(element.id)}
          >
            <span className="sr-only">
              {isLit(state, element.id) ? `${element.name} desperto` : `Despertar ${element.name}`}
            </span>
          </button>
        ))}
      </div>

      <div className="despertar-controles">
        {soundStarted ? (
          <button
            type="button"
            className="despertar-som"
            aria-pressed={soundEnabled}
            onClick={() => void toggleSound()}
          >
            {soundEnabled ? 'Silenciar' : 'Com som'}
          </button>
        ) : null}
        <button type="button" className="despertar-pular" onClick={skip}>
          Pular
        </button>
      </div>

      <div className="despertar-rodape">
        <p className="despertar-legenda" key={complete ? 'fecho' : convite} aria-live="polite">
          {complete ? fechamento : convite}
          {/* While the greeting holds the line, assistive tech still gets the
              instruction, so nothing has to wait on a beat it cannot see. */}
          <span className="sr-only">
            {saudando ? ' Toque os elementos ao redor do altar, na ordem que quiser.' : ''}
            {` ${state.lit.length} de ${AWAKENING_ELEMENTS.length} elementos despertos.`}
          </span>
        </p>
        <ol className="despertar-marcas" aria-hidden="true">
          {AWAKENING_ELEMENTS.map((element) => (
            <li
              key={`marca-${element.id}`}
              data-aceso={isLit(state, element.id)}
              style={{ '--marca': element.colour } as CSSProperties}
            />
          ))}
        </ol>
      </div>

      {saindo && !reduced ? <div className="despertar-fecho" aria-hidden="true" /> : null}
    </section>
  );
}

export default DespertarCena;
