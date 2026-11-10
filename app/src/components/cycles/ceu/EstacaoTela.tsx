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

type Tipo = 'petala' | 'polen' | 'brasa' | 'folha' | 'neve';

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
}

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

  if (tom === 'spring') {
    for (let i = 0; i < 8; i += 1) {
      lista.push({ tipo: 'petala', ...base(), vy: faixa(8, 12), deriva: 5, balanco: 6, hz: 0.3, tamanho: 5, giro: 0.6, alfa: 0.9, pisca: 0 });
    }
    for (let i = 0; i < 12; i += 1) {
      lista.push({ tipo: 'polen', ...base(), vy: faixa(4, 8), deriva: 3, balanco: 3, hz: 0.25, tamanho: 1.5, giro: 0, alfa: 0.9, pisca: faixa(1.2, 2.6) });
    }
  } else if (tom === 'summer') {
    for (let i = 0; i < 10; i += 1) {
      lista.push({ tipo: 'brasa', ...base(), vy: -faixa(11, 17), deriva: 0, balanco: 3, hz: 0.7, tamanho: 3, giro: 0, alfa: 1, pisca: faixa(5, 9) });
    }
  } else if (tom === 'autumn') {
    for (let i = 0; i < 5; i += 1) {
      lista.push({ tipo: 'folha', ...base(), vy: faixa(10, 14), deriva: 3, balanco: 10, hz: 0.25, tamanho: 8, giro: 0.4, alfa: 0.95, pisca: 0 });
    }
  } else {
    const camadas = [
      { n: 18, vy: 5, tamanho: 1, alfa: 0.45 },
      { n: 12, vy: 9, tamanho: 1.6, alfa: 0.7 },
      { n: 6, vy: 15, tamanho: 2.4, alfa: 0.9 },
    ];
    for (const camada of camadas) {
      for (let i = 0; i < camada.n; i += 1) {
        lista.push({ tipo: 'neve', ...base(), vy: camada.vy * faixa(0.9, 1.1), deriva: 0, balanco: 4, hz: 0.2, tamanho: camada.tamanho, giro: 0, alfa: camada.alfa, pisca: 0 });
      }
    }
  }
  return lista;
}

/** Wrap into [0, total) for negative values too. */
const volta = (valor: number, total: number) => ((valor % total) + total) % total;
const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Autumn's gust: a smooth push every 7s, accumulating, so it never snaps back. */
function rajada(t: number) {
  return 18 * (Math.floor(t / RAJADA) + suave(5, 6.5, t % RAJADA));
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
        const vento = tom === 'autumn' ? rajada(t) : 0;
        const x = volta(p.x0 * totalX + p.deriva * t + vento + p.balanco * Math.sin(Math.PI * 2 * p.hz * t + p.fase), totalX) - MARGEM;
        const progresso = volta(p.y0 * totalY + p.vy * t, totalY);
        const y = progresso - MARGEM;

        let alfa = p.alfa;
        if (p.pisca) alfa *= p.tipo === 'brasa'
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
        ctx.scale(p.tipo === 'neve' ? p.tamanho / 6 : 1, (p.tipo === 'neve' ? p.tamanho / 6 : 1) * alturaEscala);
        ctx.drawImage(face, -sprite.l / 2, -sprite.h / 2, sprite.l, sprite.h);
      }
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
      </div>
      <canvas ref={canvasRef} className="ceu-tela" />
    </div>
  );
}
