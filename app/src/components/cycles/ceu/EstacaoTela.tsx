import { useEffect, useRef } from 'react';
import { useMotionPreference } from '@/components/motion/useMotionPreference';
import type { TomDaEstacao } from '@/lib/temporal/ceu-dos-ciclos';

/**
 * The Season button's weather: a few dozen particles on a 2D canvas, drawn
 * from pre-rendered sprites. Every position is a pure function of time, so the
 * still frame for reduced motion is just the same function at t = 4.2s, and a
 * pause never makes the weather jump on resume.
 *
 * The sky and the sun are CSS under the canvas (`.ceu-fundo`), which is also
 * the fallback if the canvas never runs.
 */

type Tipo = 'petala' | 'polen' | 'vagalume' | 'brasa' | 'folha' | 'neve';

interface Particula {
  readonly tipo: Tipo;
  readonly x0: number;
  readonly y0: number;
  /** px/s, positive falls. */
  readonly vy: number;
  /** px/s sideways. */
  readonly deriva: number;
  readonly balanco: number;
  readonly hz: number;
  readonly fase: number;
  readonly tamanho: number;
  readonly giro: number;
  readonly alfa: number;
  /** 0 steady; otherwise blink or flicker speed in rad/s. */
  readonly pisca: number;
  /** Depth layer: 1 near, 0.55 far. Scales size, speed and parallax. */
  readonly prof: number;
  /** How much of the autumn gust this particle catches; 0 stays out of it. */
  readonly vento: number;
}

const PERTO = 1;
const LONGE = 0.55;
/** The winter shooting star: every 9s, 0.7s long, the first one at 6.2s. */
const CICLO_CADENTE = 9;
const INICIO_CADENTE = 6.2;
const DURACAO_CADENTE = 0.7;

const QUADRO_ESTATICO = 4.2;
const INTERVALO = 1000 / 30;
const MARGEM = 12;
const RAJADA = 7;

/** Small deterministic generator: the same season always scatters the same way. */
function semente(valor: number) {
  let s = valor >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function criarParticulas(tom: TomDaEstacao): Particula[] {
  const rnd = semente({ spring: 11, summer: 23, autumn: 37, winter: 53 }[tom]);
  const lista: Particula[] = [];
  const faixa = (min: number, max: number) => min + (max - min) * rnd();
  const base = () => ({ x0: rnd(), y0: rnd(), fase: rnd() * Math.PI * 2 });

  /** Each kind is scattered in both layers; the far one is slower, smaller and dimmer. */
  const camadas = (tipo: Tipo, perto: number, longe: number, f: (prof: number) => Omit<Particula, 'tipo' | 'x0' | 'y0' | 'fase' | 'prof' | 'vento'>, vento = 0) => {
    for (const [n, prof] of [[longe, LONGE], [perto, PERTO]] as const) {
      for (let i = 0; i < n; i += 1) {
        lista.push({ tipo, ...base(), ...f(prof), prof, vento: vento && rnd() < 0.7 ? vento * prof * faixa(0.8, 1.3) : 0 });
      }
    }
  };

  if (tom === 'spring') {
    camadas('petala', 6, 6, (k) => ({ vy: faixa(8, 12) * k, deriva: 5 * k, balanco: 6 * k, hz: 0.3, tamanho: 5, giro: 0.6, alfa: 0.9 * (0.5 + 0.5 * k), pisca: 0 }));
    camadas('polen', 8, 8, (k) => ({ vy: faixa(4, 8) * k, deriva: 3 * k, balanco: 3 * k, hz: 0.25, tamanho: 1.5, giro: 0, alfa: 0.9 * (0.5 + 0.5 * k), pisca: faixa(1.2, 2.6) }));
    camadas('vagalume', 4, 3, (k) => ({ vy: faixa(-2, 2) * k, deriva: 2 * k, balanco: 12 * k, hz: 0.16, tamanho: 4, giro: 0, alfa: 1, pisca: faixa(0.9, 1.6) }));
  } else if (tom === 'summer') {
    camadas('brasa', 7, 7, (k) => ({ vy: -faixa(11, 17) * k, deriva: 0, balanco: 3 * k, hz: 0.7, tamanho: 3, giro: 0, alfa: 1 * (0.5 + 0.5 * k), pisca: faixa(5, 9) }));
  } else if (tom === 'autumn') {
    camadas('folha', 5, 5, (k) => ({ vy: faixa(10, 14) * k, deriva: 3 * k, balanco: 10 * k, hz: 0.25, tamanho: 8, giro: 0.4, alfa: 0.95 * (0.55 + 0.45 * k), pisca: 0 }), 1);
  } else {
    // Three snow layers: far, middle, near.
    const niveis = [
      { n: 20, vy: 5, tamanho: 1, alfa: 0.4, prof: LONGE },
      { n: 12, vy: 9, tamanho: 1.6, alfa: 0.7, prof: 0.8 },
      { n: 7, vy: 15, tamanho: 2.4, alfa: 0.9, prof: PERTO },
    ];
    for (const nivel of niveis) {
      for (let i = 0; i < nivel.n; i += 1) {
        lista.push({ tipo: 'neve', ...base(), vy: nivel.vy * faixa(0.9, 1.1), deriva: 0, balanco: 4 * nivel.prof, hz: 0.2, tamanho: nivel.tamanho, giro: 0, alfa: nivel.alfa, pisca: 0, prof: nivel.prof, vento: 0 });
      }
    }
  }
  return lista.sort((a, b) => a.prof - b.prof);
}

/** Wrap into [0, total) for negative values too. */
const volta = (valor: number, total: number) => ((valor % total) + total) % total;
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Autumn's gust: a smooth push every 7s, accumulating, so it never snaps back. Only the leaves with `vento` catch it. */
function rajada(t: number) {
  return 18 * (Math.floor(t / RAJADA) + suave(5, 6.5, t % RAJADA));
}

/** 0..1 bump while the gust blows: the leaves it catches lift a little. */
function sopro(t: number) {
  const u = t % RAJADA;
  return suave(5, 5.7, u) * (1 - suave(5.7, 6.5, u));
}

function rgb(tripla: string, alfa = 1) {
  return `rgb(${tripla} / ${alfa})`;
}

type Sprite = HTMLCanvasElement;

function novoSprite(largura: number, altura: number, escala: number, desenhar: (c: CanvasRenderingContext2D, l: number, a: number) => void): Sprite {
  const sprite = document.createElement('canvas');
  sprite.width = Math.max(2, Math.ceil(largura * escala));
  sprite.height = Math.max(2, Math.ceil(altura * escala));
  const c = sprite.getContext('2d');
  if (c) {
    c.scale(escala, escala);
    desenhar(c, largura, altura);
  }
  return sprite;
}

function brilho(c: CanvasRenderingContext2D, l: number, a: number, centro: string, borda: string) {
  const g = c.createRadialGradient(l / 2, a / 2, 0, l / 2, a / 2, Math.min(l, a) / 2);
  g.addColorStop(0, centro);
  g.addColorStop(1, borda);
  c.fillStyle = g;
  c.fillRect(0, 0, l, a);
}

function folha(c: CanvasRenderingContext2D, l: number, a: number, cor: string) {
  c.fillStyle = cor;
  c.beginPath();
  c.moveTo(0, a / 2);
  c.quadraticCurveTo(l / 2, -a * 0.2, l, a / 2);
  c.quadraticCurveTo(l / 2, a * 1.2, 0, a / 2);
  c.fill();
  c.strokeStyle = 'rgb(0 0 0 / .25)';
  c.lineWidth = 0.5;
  c.beginPath();
  c.moveTo(0, a / 2);
  c.lineTo(l, a / 2);
  c.stroke();
}

interface Sprites {
  readonly [tipo: string]: { readonly a: Sprite; readonly b?: Sprite; readonly l: number; readonly h: number };
}

function criarSprites(cor: string, cor2: string, escala: number): Sprites {
  const e = escala * 2;
  return {
    petala: {
      l: 5, h: 3,
      a: novoSprite(5, 3, e, (c, l, a) => { c.fillStyle = rgb(cor2); c.beginPath(); c.ellipse(l / 2, a / 2, l / 2, a / 2, 0, 0, Math.PI * 2); c.fill(); }),
    },
    polen: {
      l: 4, h: 4,
      a: novoSprite(4, 4, e, (c, l, a) => brilho(c, l, a, rgb(cor, 1), rgb(cor, 0))),
    },
    vagalume: {
      l: 8, h: 8,
      a: novoSprite(8, 8, e, (c, l, a) => brilho(c, l, a, 'rgb(236 255 170 / 1)', 'rgb(190 240 120 / 0)')),
    },
    brasa: {
      l: 10, h: 10,
      a: novoSprite(10, 10, e, (c, l, a) => brilho(c, l, a, 'rgb(255 236 200 / 1)', rgb(cor2, 0))),
    },
    folha: {
      l: 8, h: 5,
      a: novoSprite(8, 5, e, (c, l, a) => folha(c, l, a, rgb(cor))),
      b: novoSprite(8, 5, e, (c, l, a) => folha(c, l, a, rgb(cor2))),
    },
    neve: {
      l: 6, h: 6,
      a: novoSprite(6, 6, e, (c, l, a) => brilho(c, l, a, rgb(cor2, 1), rgb(cor2, 0))),
    },
  };
}

const arvore = (x: number, topo: number) =>
  `M${x} 40V${topo}M${x} ${topo + 12}L${x - 10} ${topo + 2}M${x} ${topo + 8}L${x + 10} ${topo - 2}M${x - 10} ${topo + 2}l-4 -5M${x + 10} ${topo - 2}l4 -5M${x} ${topo + 18}L${x + 8} ${topo + 11}`;

const pinheiro = (x: number, topo: number) =>
  `M${x} ${topo}L${x + 7} ${topo + 14}H${x + 4}L${x + 11} ${topo + 28}H${x + 5}L${x + 14} ${topo + 44}H${x - 14}L${x - 5} ${topo + 28}H${x - 11}L${x - 4} ${topo + 14}H${x - 7}Z`;
const neve = (x: number, topo: number) => `M${x} ${topo}L${x + 7} ${topo + 14}H${x + 3}L${x} ${topo + 10}L${x - 3} ${topo + 14}H${x - 7}Z`;

/** Dark horizon at the foot of the sky; the glass sill hides its lower half. */
function horizonte(tom: TomDaEstacao) {
  if (tom === 'spring') {
    return (
      <>
        <path className="ceu-solo" d="M0 80V34C40 14 80 16 120 26C160 36 200 12 250 16C290 20 320 28 340 22V80Z" />
        {[[38, 19], [62, 16], [100, 21], [212, 15], [240, 14], [300, 24]].map(([x, y], i) => (
          <circle key={i} className={i % 2 ? 'ceu-flor-a' : 'ceu-flor-b'} cx={x} cy={y} r="1.8" />
        ))}
      </>
    );
  }
  if (tom === 'summer') {
    return <path className="ceu-solo" d="M0 80V36C50 20 90 22 140 34C190 46 230 24 290 22C315 21 330 26 340 28V80Z" />;
  }
  if (tom === 'autumn') {
    return (
      <>
        <path className="ceu-solo" d="M0 80V38C80 32 260 36 340 34V80Z" />
        <path className="ceu-galho" d={[48, 130, 214, 296].map((x, i) => arvore(x, 8 + (i % 2) * 6)).join('')} />
      </>
    );
  }
  return (
    <>
      <path className="ceu-solo" d="M0 80V44C90 40 250 44 340 42V80Z" />
      <path className="ceu-solo" d={[30, 92, 160, 238, 304].map((x, i) => pinheiro(x, 6 + (i % 3) * 5)).join('')} />
      <path className="ceu-neve" d={[30, 92, 160, 238, 304].map((x, i) => neve(x, 6 + (i % 3) * 5)).join('')} />
    </>
  );
}

export interface EstacaoTelaProps {
  readonly tom: TomDaEstacao;
  readonly cor: string;
  readonly cor2: string;
}

export function EstacaoTela({ tom, cor, cor2 }: EstacaoTelaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const movimentoReduzido = useMotionPreference();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return undefined;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particulas = criarParticulas(tom);
    const sprites = criarSprites(cor, cor2, dpr);
    let largura = 0;
    let altura = 0;
    let t = movimentoReduzido ? QUADRO_ESTATICO : 0;
    let quadro = 0;
    let amostra = 0;
    let visivel = true;
    let morto = false;

    const desenhar = () => {
      if (!largura || !altura) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const totalX = largura + MARGEM * 2;
      const totalY = altura + MARGEM * 2;

      for (const p of particulas) {
        const sprite = sprites[p.tipo];
        if (!sprite) continue;
        const vento = p.vento ? rajada(t) * p.vento : 0;
        // Parallax: the whole sky leans slowly, the near layer more than the far one.
        const paralaxe = Math.sin(t * 0.22) * 6 * p.prof * p.prof;
        const x = volta(p.x0 * totalX + p.deriva * t + vento + p.balanco * Math.sin(Math.PI * 2 * p.hz * t + p.fase) + paralaxe, totalX) - MARGEM;
        const progresso = volta(p.y0 * totalY + p.vy * t, totalY);
        const y = progresso - MARGEM - (p.vento ? 9 * sopro(t) * p.vento : 0);

        let alfa = p.alfa;
        if (p.pisca) alfa *= p.tipo === 'vagalume'
          ? (0.5 + 0.5 * Math.sin(p.pisca * t + p.fase)) ** 2
          : p.tipo === 'brasa'
          ? (0.55 + 0.45 * Math.sin(p.pisca * t + p.fase)) * (p.vy < 0 ? Math.min(1, (progresso / totalY) * 2.2) : 1)
          : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.pisca * t + p.fase));
        if (alfa <= 0.01) continue;

        let alturaEscala = 1;
        let face = sprite.a;
        if (p.tipo === 'folha') {
          const giro3d = Math.cos(t * 1.4 + p.fase);
          alturaEscala = Math.max(0.15, Math.abs(giro3d));
          if (giro3d < 0 && sprite.b) face = sprite.b;
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalAlpha = Math.min(1, alfa);
        ctx.translate(x, y);
        ctx.rotate(p.giro * t + p.fase);
        const escala = (p.tipo === 'neve' ? p.tamanho / 6 : 1) * (p.tipo === 'neve' ? 1 : 0.65 + 0.35 * p.prof);
        ctx.scale(escala, escala * alturaEscala);
        ctx.drawImage(face, -sprite.l / 2, -sprite.h / 2, sprite.l, sprite.h);
      }
      ctx.globalAlpha = 1;
      if (tom === 'winter') estrelaCadente();
    };

    /** A pure function of time like everything else: the same t always draws the same streak. */
    const estrelaCadente = () => {
      const ciclo = Math.floor(t / CICLO_CADENTE);
      const k = ((t % CICLO_CADENTE) - INICIO_CADENTE) / DURACAO_CADENTE;
      if (k < 0 || k > 1) return;
      const rnd = semente(ciclo * 7919 + 101);
      const x = largura * (0.08 + 0.5 * rnd()) + k * 64;
      const y = 4 + rnd() * 12 + k * 26;
      const cauda = 30;
      const norma = Math.hypot(64, 26);
      const tx = x - (64 / norma) * cauda;
      const ty = y - (26 / norma) * cauda;
      const g = ctx.createLinearGradient(tx, ty, x, y);
      g.addColorStop(0, 'rgb(226 240 248 / 0)');
      g.addColorStop(1, 'rgb(240 250 255 / 1)');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalAlpha = Math.sin(Math.PI * k);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const ajustar = () => {
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      if (!largura || !altura) return;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      desenhar();
    };

    const passo = (agora: number) => {
      quadro = requestAnimationFrame(passo);
      if (agora - amostra < INTERVALO) return;
      // The step is capped, so a long stall never throws particles across the button.
      t += Math.min((agora - (amostra || agora)) / 1000, 0.05);
      amostra = agora;
      desenhar();
    };

    const parar = () => {
      if (!quadro) return;
      cancelAnimationFrame(quadro);
      quadro = 0;
      amostra = 0;
    };

    const tocar = () => {
      if (quadro || morto || movimentoReduzido || !visivel || document.hidden) return;
      amostra = performance.now();
      quadro = requestAnimationFrame(passo);
    };

    const aoMudarVisibilidade = () => (document.hidden ? parar() : tocar());
    const redimensionador = new ResizeObserver(ajustar);
    const naTela = new IntersectionObserver(([entrada]) => {
      visivel = entrada?.isIntersecting ?? true;
      if (visivel) tocar();
      else parar();
    });

    document.addEventListener('visibilitychange', aoMudarVisibilidade);
    redimensionador.observe(canvas);
    naTela.observe(canvas);
    ajustar();
    tocar();

    return () => {
      morto = true;
      parar();
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
      redimensionador.disconnect();
      naTela.disconnect();
    };
  }, [tom, cor, cor2, movimentoReduzido]);

  return (
    <div className="ceu-janela" data-estacao={tom} aria-hidden="true">
      <div className="ceu-fundo ceu-fundo-estacao">
        <span className="ceu-sol" />
        <span className="ceu-geada" />
        <span className="ceu-raios" />
        <span className="ceu-cristal ceu-cristal-a" />
        <span className="ceu-cristal ceu-cristal-b" />
        <span className="ceu-calor" />
      </div>
      <svg className="ceu-horizonte" viewBox="0 0 340 80" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {horizonte(tom)}
      </svg>
      <canvas ref={canvasRef} className="ceu-tela" />
    </div>
  );
}
