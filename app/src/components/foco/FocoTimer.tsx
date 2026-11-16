import './foco.css';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, PointerEvent, ReactNode } from 'react';
import { Check, ChevronDown, Info, Pause, Play } from 'lucide-react';
import { ELEMENTS, formatDuration } from '@/constants';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import { useParalaxe } from '@/components/sanctuary/useCenaViva';
import { dispararHaptico } from '@/lib/audio/haptico';
import { lerPreferencias } from '@/lib/audio/preferencias';
import { DURATION } from '@/lib/motion/motion';
import type { ElementId } from '@/types';
import { FocoAnel } from './FocoAnel';
import { FocoCena, type RajadaFoco } from './FocoCena';
import { celebrarFoco } from './FocoCelebracao';
import { alemDaMeta, anuncioDoMarco, fracaoDoPlano, marcoAlcancado, segundosDoRelogio, segundosDoRotulo } from './foco-tempo';

export interface FocoTimerProps {
  title: string;
  element: ElementId;
  time: string;
  running: boolean;
  plannedLabel?: string;
  effortLabel?: string;
  /** Exact seconds, when the owner has them; otherwise they are read from `time`. */
  elapsedSeconds?: number;
  /** The plan in minutes, when the owner has it; otherwise it is read from `plannedLabel`. */
  plannedMinutes?: number;
  onToggle: () => void;
  /** May answer `false` when the completion was not recorded, so nothing is celebrated. */
  onComplete: () => void | boolean;
  /** Shrinks the focus screen to the floating bar. Escape does the same through the dialog. */
  onMinimize?: () => void;
  /** Turn off the closing seal when the owner already shows a celebration of its own. */
  celebrar?: boolean;
  /** Decorative material drawn behind the element's seal. */
  ornamento?: ReactNode;
}

/** Holding the bar for this long completes the session: long enough that a stray touch never does. */
const SEGURAR_MS = DURATION.conjure * 2;
/** A press shorter than this reads as a tap, which only teaches the gesture. */
const TOQUE_MS = DURATION.settle;

function vibrar(padrao: number[]) {
  try { if (lerPreferencias().haptico) dispararHaptico(padrao); } catch { /* no haptics here */ }
}

/** The digits, one box each, so only the ones that change are redrawn and nothing shifts sideways. */
function Digitos({ time }: { time: string }) {
  const simbolos = time.split('');
  return <span className="foco-digitos" aria-hidden="true">
    {simbolos.map((simbolo, i) => {
      // Keyed from the right, so an hour appearing does not remount the minutes.
      const posicao = simbolos.length - i;
      return simbolo === ':'
        ? <span key={posicao} className="foco-doispontos">:</span>
        : <span key={posicao} className="foco-digito"><span key={simbolo} className="foco-digito-valor">{simbolo}</span></span>;
    })}
  </span>;
}

/**
 * The focus screen: the element's scene fills the viewport and the time is the
 * protagonist. It is presentation only. Time, pause, completion and reward stay
 * with the owner and arrive as props, exactly as they did for the old dialog.
 *
 * It expects to fill the box it is given (the dialog styled by `.foco-dialog`).
 * Escape and the close of that dialog are its way to minimise; the owner keeps
 * the clock running either way.
 */
export function FocoTimer({
  title, element, time, running, plannedLabel, effortLabel, elapsedSeconds, plannedMinutes,
  onToggle, onComplete, onMinimize, celebrar = true, ornamento,
}: FocoTimerProps) {
  const reduzido = useMotionPreference();
  const raiz = useRef<HTMLDivElement>(null);
  const relogio = useRef<HTMLDivElement>(null);
  const botaoPausar = useRef<HTMLButtonElement>(null);
  const barra = useRef<HTMLButtonElement>(null);
  const [toque, setToque] = useState(0);
  const [dica, setDica] = useState(0);
  const [onda, setOnda] = useState(0);
  const [anuncio, setAnuncio] = useState('');
  const [rajada, setRajada] = useState<RajadaFoco>({ n: 0, forca: 1 });
  const [segurando, setSegurando] = useState(false);

  const decorrido = elapsedSeconds ?? segundosDoRelogio(time);
  const planejado = plannedMinutes && plannedMinutes > 0 ? Math.round(plannedMinutes * 60) : segundosDoRotulo(plannedLabel);
  const comPlano = !!planejado;
  const fracao = fracaoDoPlano(decorrido, planejado);
  const marco = comPlano ? marcoAlcancado(fracao) : 0;
  const meta = marco >= 4;
  const alem = alemDaMeta(decorrido, planejado);
  const rotuloDoPlano = plannedLabel ?? (planejado ? formatDuration(planejado / 60) : undefined);

  // A mark reached while watching is a small event; one already behind us when the screen opens is not.
  const [marcoVisto, setMarcoVisto] = useState(marco);
  if (marco !== marcoVisto) {
    setMarcoVisto(marco);
    if (marco > marcoVisto) {
      setAnuncio(anuncioDoMarco(marco, rotuloDoPlano));
      setOnda((n) => n + 1);
      setRajada((anterior) => ({ n: anterior.n + 1, forca: marco >= 4 ? 2.2 : 1.3 }));
      vibrar(marco >= 4 ? [14, 50, 14] : [10]);
    }
  }

  useParalaxe(raiz, !reduzido);

  // The latest props for the hold gesture, which outlives the render it started in.
  const ultimo = useRef({ element, title, decorrido, onComplete, celebrar });
  useEffect(() => { ultimo.current = { element, title, decorrido, onComplete, celebrar }; });

  // Focus lands on the main control, and the dialog gives it back to whatever opened the screen.
  useEffect(() => { botaoPausar.current?.focus({ preventScroll: true }); }, []);

  // Keep the screen awake while a session runs. Best effort: a refusal is not an error.
  useEffect(() => {
    if (!running || typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    let sentinela: WakeLockSentinel | null = null;
    let ativo = true;
    const pedir = async () => {
      try {
        const obtida = await navigator.wakeLock.request('screen');
        if (ativo) sentinela = obtida; else void obtida.release().catch(() => undefined);
      } catch { /* the device or the battery said no */ }
    };
    const aoVoltar = () => { if (document.visibilityState === 'visible' && (!sentinela || sentinela.released)) void pedir(); };
    void pedir();
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      ativo = false;
      document.removeEventListener('visibilitychange', aoVoltar);
      void sentinela?.release().catch(() => undefined);
    };
  }, [running]);

  const gesto = useRef({ ativo: false, inicio: 0, quadro: 0, feito: false });
  useEffect(() => () => cancelAnimationFrame(gesto.current.quadro), []);

  const preencher = (valor: number) => barra.current?.style.setProperty('--seg', valor.toFixed(3));

  const concluir = () => {
    if (gesto.current.feito) return;
    gesto.current.feito = true;
    const { element: el, title: titulo, decorrido: total, onComplete: terminar, celebrar: festejar } = ultimo.current;
    vibrar([12, 40, 18]);
    const resultado = terminar();
    if (festejar && resultado !== false) celebrarFoco({ elemento: el, titulo, segundos: total });
    // If the owner kept the screen open, the bar must work again.
    window.setTimeout(() => { gesto.current.feito = false; preencher(0); }, DURATION.conjure);
  };

  const comecarASegurar = (evento: PointerEvent<HTMLButtonElement>) => {
    if (evento.button !== 0 || gesto.current.feito || gesto.current.ativo) return;
    evento.currentTarget.setPointerCapture?.(evento.pointerId);
    gesto.current.ativo = true;
    gesto.current.inicio = performance.now();
    setSegurando(true);
    vibrar([6]);
    const passo = (agora: number) => {
      if (!gesto.current.ativo) return;
      const progresso = (agora - gesto.current.inicio) / SEGURAR_MS;
      preencher(Math.min(1, progresso));
      if (progresso >= 1) {
        gesto.current.ativo = false;
        setSegurando(false);
        concluir();
        return;
      }
      gesto.current.quadro = requestAnimationFrame(passo);
    };
    gesto.current.quadro = requestAnimationFrame(passo);
  };

  const soltar = () => {
    if (!gesto.current.ativo) return;
    gesto.current.ativo = false;
    cancelAnimationFrame(gesto.current.quadro);
    setSegurando(false);
    preencher(0);
    if (performance.now() - gesto.current.inicio < TOQUE_MS) setDica((n) => n + 1);
  };

  // A click that is not the end of a press (a key, a switch, a screen reader) is a deliberate command.
  const aoAtivar = (evento: MouseEvent<HTMLButtonElement>) => { if (evento.detail === 0) concluir(); };

  const alternar = () => { vibrar([8]); onToggle(); };

  const sentir = () => {
    setToque((n) => n + 1);
    setRajada((anterior) => ({ n: anterior.n + 1, forca: 0.9 }));
    vibrar([6]);
  };

  const legenda = !comPlano ? 'foco livre'
    : meta ? (alem > 0 ? `meta atingida · +${Math.floor(alem / 60)}:${String(alem % 60).padStart(2, '0')}` : 'meta atingida')
      : `de ${rotuloDoPlano}`;

  return <div ref={raiz} className="foco" data-element={element} data-running={running} data-meta={meta} data-plano={comPlano}
    style={{ '--foco-cor': `var(--element-${element})`, '--foco-aura': `var(--aura-${element}, var(--element-${element}))` } as CSSProperties}>
    <div className="foco-fundo" aria-hidden="true">
      <span className="foco-luz" />
      <FocoCena element={element} running={running} rajada={rajada} centroRef={relogio} />
      <span className="foco-sombra" />
    </div>

    <header className="foco-topo">
      {onMinimize
        ? <button type="button" className="foco-icone" onClick={onMinimize} aria-label="Minimizar cronômetro"><ChevronDown size={24} aria-hidden="true" /></button>
        : <span className="foco-icone" aria-hidden="true" />}
      <p className="foco-estado"><span className="foco-estado-ponto" aria-hidden="true" />{running ? 'Em foco' : 'Pausado'}</p>
      <span className="foco-pct" aria-hidden="true">{comPlano ? `${Math.round(fracao * 100)}%` : ''}</span>
    </header>

    <div className="foco-palco">
      <h3 className="foco-titulo">{title}</h3>
      {(plannedLabel || effortLabel) && <p className="foco-meta">
        {effortLabel && <span>Esforço: {effortLabel}</span>}
        {plannedLabel && <span>Planejado: {plannedLabel}</span>}
      </p>}
      <div ref={relogio} className="foco-relogio">
        <FocoAnel fracao={fracao} comPlano={comPlano} segundoDoMinuto={decorrido % 60} marco={marco} onda={onda} />
        <div className="foco-miolo">
          <div className="foco-emblema">
            {ornamento}
            <button type="button" className="foco-selo" aria-label={`Sentir a energia de ${ELEMENTS[element].name}`} onClick={sentir}>
              {toque > 0 && <span key={toque} className="foco-selo-luz" aria-hidden="true" />}
              <img src={`/sanctuary/elements/${element}-v1.webp`} alt="" className="foco-selo-arte" width={112} height={112} />
            </button>
          </div>
          <div className="foco-tempo" role="timer" aria-label={`Tempo decorrido: ${time}`} aria-live="off" data-longo={time.length > 5}>
            <Digitos time={time} />
          </div>
          <p className="foco-legenda">{legenda}</p>
        </div>
      </div>
    </div>

    <div className="foco-comandos">
      <button ref={botaoPausar} type="button" className="foco-pausar" data-pausado={!running} onClick={alternar}>
        <span key={String(running)} className="foco-pausar-icone" aria-hidden="true">{running ? <Pause size={30} /> : <Play size={30} />}</span>
        <span className="foco-rotulo">{running ? 'Pausar' : 'Retomar'}</span>
      </button>
      <button ref={barra} type="button" className="foco-concluir ds-pane" data-segurando={segurando}
        onPointerDown={comecarASegurar} onPointerUp={soltar} onPointerCancel={soltar} onLostPointerCapture={soltar}
        onContextMenu={(evento) => evento.preventDefault()} onClick={aoAtivar}>
        <span className="foco-concluir-fio" aria-hidden="true" />
        <Check size={20} aria-hidden="true" />
        <span className="foco-concluir-texto"><span className="foco-concluir-rotulo">Concluir</span><small key={dica} className={dica ? 'foco-dica' : undefined}>Segure para concluir</small></span>
      </button>
      <p className="foco-nota"><Info size={14} aria-hidden="true" />Pode bloquear a tela: o tempo continua contando.</p>
    </div>
    <p className="sr-only" role="status">{anuncio}</p>
  </div>;
}
