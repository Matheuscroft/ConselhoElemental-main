import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { obterCompartilhado } from './compartilhado';
import { criarTecla, type EstadoDaTecla, type Tecla } from './tecla';
import './vitro-key.css';

/** One animation loop for every key of the page: it runs only while some visible key is still moving. */
interface Instancia { quadro(dt: number, tempo: number): boolean; visivel: boolean }
const instancias = new Set<Instancia>();
let laco = 0;
let ultimo = 0;
function acordar() {
  if (laco) return;
  ultimo = performance.now();
  const rodar = (agora: number) => {
    const dt = (agora - ultimo) / 1000; ultimo = agora;
    let algum = false;
    for (const instancia of instancias) if (instancia.visivel && instancia.quadro(dt, agora / 1000)) algum = true;
    laco = algum ? requestAnimationFrame(rodar) : 0;
  };
  laco = requestAnimationFrame(rodar);
}

const reduzido = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/**
 * A glass keycap you can press, in real 3D: it turns toward the finger or the cursor, bends and splits the light at its
 * bevels, and sinks when pressed. The label is sunk into a dark plate inside the glass, not printed on it. It is a real
 * button (keyboard, focus, screen reader read `rotulo`), the 3D is only its face. Where WebGL is not available, or
 * motion is reduced to the minimum, it stays a plain button with the same label.
 */
export function VitroKey({ rotulo, rotuloAcessivel, tom = '#d5b66f', estado = 'normal', proporcao = 3.2, flutuar = false, aoClicar, desabilitado = false, comoFace = false, className = '', children }: {
  /** The text sunk into the key. */
  rotulo: string;
  /** What a screen reader says; defaults to `rotulo`. */
  rotuloAcessivel?: string;
  /** The element's colour: it lights the plate when the key is done. */
  tom?: string;
  estado?: EstadoDaTecla;
  /** Width over height: 3.2 is a wide call to action, 1 a square key. */
  proporcao?: number;
  /** A slow, gentle sway while it waits to be pressed. */
  flutuar?: boolean;
  aoClicar?: (botao: HTMLButtonElement) => void;
  desabilitado?: boolean;
  /** Only the face: no button of its own. For a key that sits inside a bigger button, which then owns the click, the focus and the label. */
  comoFace?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const botao = useRef<HTMLButtonElement & HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const tecla = useRef<Tecla | null>(null);
  const acordarRef = useRef<() => void>(() => {});
  const [sem3d, setSem3d] = useState(false);

  useEffect(() => {
    const el = botao.current, tela = canvas.current;
    const compartilhado = obterCompartilhado();
    if (!el || !tela || !compartilhado) { setSem3d(true); return undefined; }
    const ctx = tela.getContext('2d');
    if (!ctx) { setSem3d(true); return undefined; }
    const instancia: Instancia = { visivel: true, quadro: () => false };
    const k = criarTecla(compartilhado, { largura: proporcao, rotulo, tom, estado });
    tecla.current = k;
    let larg = 0, alt = 0, dpr = 1;
    let sujo = true;
    let acumulado = 0;

    const medir = () => {
      const caixa = tela.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      larg = Math.max(8, Math.round(caixa.width * dpr)); alt = Math.max(8, Math.round(caixa.height * dpr));
      if (tela.width !== larg || tela.height !== alt) { tela.width = larg; tela.height = alt; }
      k.ajustar(larg / alt);
      sujo = true;
    };
    const desenhar = () => {
      const r = compartilhado.renderizador;
      compartilhado.garantir(larg, alt);
      r.setViewport(0, 0, larg, alt); r.setScissor(0, 0, larg, alt); r.setScissorTest(true);
      r.render(k.cena, k.camera);
      ctx.clearRect(0, 0, larg, alt);
      ctx.drawImage(r.domElement, 0, r.domElement.height - alt, larg, alt, 0, 0, larg, alt);
    };
    instancia.quadro = (dt, tempo) => {
      acumulado += dt;
      const flut = flutuar && !reduzido();
      // a swaying key needs 30 frames a second, not 60: it is a slow thing
      if (flut && !sujo && acumulado < 1 / 30) return true;
      const passo = acumulado; acumulado = 0;
      const movendo = k.passo(passo, tempo, flut);
      desenhar(); sujo = false;
      return movendo;
    };
    instancia.visivel = true;
    instancias.add(instancia);
    acordarRef.current = () => { sujo = true; acordar(); };

    medir();
    const observadorTamanho = new ResizeObserver(() => { medir(); acordar(); });
    observadorTamanho.observe(el);
    const observadorVisao = new IntersectionObserver(([e]) => { instancia.visivel = Boolean(e?.isIntersecting); if (instancia.visivel) acordar(); }, { rootMargin: '120px' });
    observadorVisao.observe(el);

    // aim at the pointer while it is near the key; let go when it leaves
    const aoMover = (e: globalThis.PointerEvent) => {
      if (reduzido()) return;
      const c = el.getBoundingClientRect();
      const cx = c.left + c.width / 2, cy = c.top + c.height / 2;
      const dx = (e.clientX - cx) / Math.max(c.width / 2, 60), dy = (e.clientY - cy) / Math.max(c.height / 2, 60);
      const perto = Math.abs(dx) < 2.4 && Math.abs(dy) < 3.4;
      k.mirar(perto ? Math.max(-1, Math.min(1, dx)) : 0, perto ? Math.max(-1, Math.min(1, dy)) : 0);
      acordar();
    };
    window.addEventListener('pointermove', aoMover, { passive: true });
    // as a face, the press comes from the button that holds it
    const dono = comoFace ? el.closest('button') : null;
    const premir = () => { k.apertar(true); acordar(); };
    const soltar = () => { k.apertar(false); acordar(); };
    dono?.addEventListener('pointerdown', premir); dono?.addEventListener('pointerup', soltar);
    dono?.addEventListener('pointercancel', soltar); dono?.addEventListener('pointerleave', soltar);
    // first picture once the label font is ready
    void document.fonts?.ready.then(() => { k.definir({ rotulo }); sujo = true; acordar(); });
    acordar();

    return () => {
      window.removeEventListener('pointermove', aoMover);
      dono?.removeEventListener('pointerdown', premir); dono?.removeEventListener('pointerup', soltar);
      dono?.removeEventListener('pointercancel', soltar); dono?.removeEventListener('pointerleave', soltar);
      observadorTamanho.disconnect(); observadorVisao.disconnect();
      instancias.delete(instancia);
      k.descartar(); tecla.current = null;
    };
    // The key is built once per size ratio; text, colour and state are sent to it below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proporcao, flutuar, comoFace]);

  useEffect(() => { tecla.current?.definir({ rotulo, tom, estado }); acordarRef.current(); }, [rotulo, tom, estado]);

  const apertar = (valor: boolean) => () => { tecla.current?.apertar(valor); acordarRef.current(); };
  const estilo = { '--vk-proporcao': proporcao, '--vk-tom': tom } as CSSProperties;
  const miolo = <>
    <canvas ref={canvas} className="vk-tela" aria-hidden="true" />
    <span className="vk-reserva" aria-hidden="true">{rotulo}</span>
    {children}
  </>;
  if (comoFace) return <span ref={botao} className={`vk vk-face ${className}`} data-estado={estado} data-sem3d={sem3d || undefined} style={estilo} aria-hidden="true">{miolo}</span>;
  return (
    <button ref={botao} type="button" className={`vk ${className}`} data-estado={estado} data-sem3d={sem3d || undefined} style={estilo} disabled={desabilitado || estado === 'bloqueado'}
      aria-label={rotuloAcessivel ?? rotulo} onClick={(evento) => aoClicar?.(evento.currentTarget)} onPointerDown={apertar(true)} onPointerUp={apertar(false)} onPointerCancel={apertar(false)} onPointerLeave={apertar(false)}>
      {miolo}
    </button>
  );
}

export default VitroKey;
