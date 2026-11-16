import { ACENTO, AURA, type ElementoId } from '@/lib/design/palette';

/**
 * The living scene behind the focus screen: one light canvas, one loop, a few
 * dozen shapes per element. Fire sends embers up, water lays moving swells and
 * lets bubbles rise, air weaves ribbons of wind, earth lets gold dust drift
 * between crystals.
 *
 * It is cheap on purpose. The canvas is capped at a device pixel ratio of 1.5,
 * nothing is allocated per frame, the loop stops while the page is hidden, and
 * the whole thing is never created for someone who asked for less motion.
 *
 * `energia` is the one number the owner can change: 1 while the session runs,
 * lower while it is paused, so a pause reads as the scene taking a slow breath.
 */

export interface CenaFoco {
  /** A short burst of light at a point, in fractions of the canvas. */
  rajada(x: number, y: number, forca?: number): void;
  parar(): void;
}

interface Rgb { readonly r: number; readonly g: number; readonly b: number }

function rgb(hex: string): Rgb {
  const valor = parseInt(hex.slice(1), 16);
  return { r: (valor >> 16) & 255, g: (valor >> 8) & 255, b: valor & 255 };
}
const cor = ({ r, g, b }: Rgb, alfa: number) => `rgba(${r},${g},${b},${alfa.toFixed(3)})`;
const misturar = (a: Rgb, b: Rgb, t: number): Rgb => ({
  r: Math.round(a.r + (b.r - a.r) * t), g: Math.round(a.g + (b.g - a.g) * t), b: Math.round(a.b + (b.b - a.b) * t),
});

interface Particula { x: number; y: number; vx: number; vy: number; tam: number; vida: number; duracao: number; fase: number }
interface Faisca { x: number; y: number; vx: number; vy: number; vida: number; duracao: number; tam: number }

const TAU = Math.PI * 2;
const sortear = (min: number, max: number) => min + Math.random() * (max - min);
/** Fewer shapes on a narrow phone: the screen is smaller, not the effect. */
const QUANTIDADE = { fogo: 46, agua: 22, ar: 36, terra: 54 } as const satisfies Record<ElementoId, number>;
const FAISCAS_MAX = 48;

export function criarCena(canvas: HTMLCanvasElement, elemento: ElementoId, lerEnergia: () => number): CenaFoco | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const acento = rgb(ACENTO[elemento]);
  const aura = rgb(AURA[elemento]);
  const brasa = rgb('#ffd9a0');
  const ouro = rgb('#f0d27a');
  const claro = misturar(acento, rgb('#ffffff'), 0.45);

  let largura = 0;
  let altura = 0;
  let quadro = 0;
  let anterior = 0;
  let tempo = 0;
  let energia = lerEnergia();
  let ativa = true;
  const particulas: Particula[] = [];
  const faiscas: Faisca[] = [];
  /** Crystals are laid out once per size, not per frame. */
  let cristais: { x: number; largura: number; altura: number; incl: number; fase: number }[] = [];

  const nova = (inicial: boolean): Particula => {
    const p: Particula = { x: 0, y: 0, vx: 0, vy: 0, tam: 1, vida: 0, duracao: 1, fase: Math.random() * TAU };
    reiniciar(p, inicial);
    return p;
  };

  function reiniciar(p: Particula, inicial: boolean) {
    p.fase = Math.random() * TAU;
    p.vida = inicial ? Math.random() : 0;
    if (elemento === 'fogo') {
      // Embers leave from a wide bed at the bottom, mostly toward the middle.
      p.x = largura * (0.5 + (Math.random() + Math.random() - 1) * 0.55);
      p.y = altura * sortear(1, 1.08);
      p.vy = -sortear(34, 96);
      p.vx = sortear(-6, 6);
      p.tam = sortear(0.8, 2.7);
      p.duracao = sortear(3.4, 7);
    } else if (elemento === 'agua') {
      p.x = Math.random() * largura;
      p.y = altura * sortear(0.7, 1.05);
      p.vy = -sortear(9, 26);
      p.vx = 0;
      p.tam = sortear(1.6, 5);
      p.duracao = sortear(6, 12);
    } else if (elemento === 'ar') {
      // Motes ride the wind from left to right across the whole height.
      p.x = -10;
      p.y = Math.random() * altura;
      p.vx = sortear(26, 70);
      p.vy = sortear(-6, 6);
      p.tam = sortear(0.7, 1.8);
      p.duracao = sortear(8, 15);
    } else {
      p.x = Math.random() * largura;
      p.y = Math.random() * altura;
      p.vx = sortear(-4, 4);
      p.vy = sortear(-7, 3);
      p.tam = sortear(0.6, 2.2);
      p.duracao = sortear(5, 11);
    }
    if (inicial) {
      // Spread the first frame, so the scene is already alive when it appears.
      if (elemento === 'fogo') p.y = altura * (1.05 - p.vida * 0.9);
      if (elemento === 'agua') p.y = altura * (1.05 - p.vida * 0.8);
      if (elemento === 'ar') p.x = p.vida * largura;
    }
  }

  const medir = () => {
    const caixa = canvas.getBoundingClientRect();
    const escala = Math.min(window.devicePixelRatio || 1, 1.5);
    largura = Math.max(1, Math.round(caixa.width));
    altura = Math.max(1, Math.round(caixa.height));
    canvas.width = Math.round(largura * escala);
    canvas.height = Math.round(altura * escala);
    ctx.setTransform(escala, 0, 0, escala, 0, 0);
    if (!particulas.length) {
      for (let i = 0; i < QUANTIDADE[elemento]; i += 1) particulas.push(nova(true));
    }
    cristais = Array.from({ length: 7 }, (_, i) => ({
      x: largura * ((i + 0.5) / 7) + sortear(-12, 12),
      largura: sortear(26, 52),
      altura: altura * sortear(0.07, 0.2),
      incl: sortear(-0.22, 0.22),
      fase: Math.random() * TAU,
    }));
  };

  const desenharFogo = (dt: number) => {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particulas) {
      p.vida += dt / p.duracao;
      if (p.vida >= 1) { reiniciar(p, false); continue; }
      p.fase += dt * 2.2;
      p.y += p.vy * dt * energia;
      p.x += (p.vx + Math.sin(p.fase) * 14) * dt * energia;
      const fase = p.vida;
      const alfa = Math.sin(Math.PI * fase) * 0.85 * (0.35 + energia * 0.65);
      const tam = p.tam * (1 - fase * 0.55);
      const cinza = misturar(brasa, aura, fase);
      ctx.fillStyle = cor(cinza, alfa * 0.22);
      ctx.beginPath(); ctx.arc(p.x, p.y, tam * 4.2, 0, TAU); ctx.fill();
      ctx.fillStyle = cor(cinza, alfa);
      ctx.beginPath(); ctx.arc(p.x, p.y, tam, 0, TAU); ctx.fill();
    }
  };

  const desenharAgua = (dt: number) => {
    // Three swells, each slower and fainter than the one in front of it.
    for (let camada = 0; camada < 3; camada += 1) {
      const base = altura * (0.7 + camada * 0.07);
      const amp = 9 + camada * 4;
      const onda = (0.011 - camada * 0.0017);
      const velocidade = 0.55 + camada * 0.2;
      const gradiente = ctx.createLinearGradient(0, base - amp, 0, altura);
      gradiente.addColorStop(0, cor(claro, 0.2 - camada * 0.04));
      gradiente.addColorStop(1, cor(acento, 0));
      ctx.fillStyle = gradiente;
      ctx.beginPath();
      ctx.moveTo(0, altura);
      for (let x = 0; x <= largura + 12; x += 12) {
        ctx.lineTo(x, base + Math.sin(x * onda + tempo * velocidade + camada * 1.7) * amp + Math.sin(x * onda * 2.3 - tempo * velocidade * 0.7) * amp * 0.35);
      }
      ctx.lineTo(largura, altura);
      ctx.closePath();
      ctx.fill();
      // The crest catches the light.
      ctx.strokeStyle = cor(claro, (0.32 - camada * 0.08) * (0.4 + energia * 0.6));
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= largura + 12; x += 12) {
        const y = base + Math.sin(x * onda + tempo * velocidade + camada * 1.7) * amp + Math.sin(x * onda * 2.3 - tempo * velocidade * 0.7) * amp * 0.35;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (const p of particulas) {
      p.vida += dt / p.duracao;
      if (p.vida >= 1) { reiniciar(p, false); continue; }
      p.fase += dt * 1.4;
      p.y += p.vy * dt * energia;
      p.x += Math.sin(p.fase) * 8 * dt * energia;
      const alfa = Math.sin(Math.PI * p.vida) * 0.5;
      ctx.strokeStyle = cor(claro, alfa);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.tam, 0, TAU); ctx.stroke();
      ctx.fillStyle = cor(claro, alfa * 0.7);
      ctx.beginPath(); ctx.arc(p.x - p.tam * 0.35, p.y - p.tam * 0.35, p.tam * 0.22, 0, TAU); ctx.fill();
    }
  };

  const desenharAr = (dt: number) => {
    for (let i = 0; i < 7; i += 1) {
      const base = altura * (0.12 + i * 0.125);
      const amp = 14 + (i % 3) * 9;
      const onda = 0.006 + (i % 4) * 0.0015;
      const velocidade = (0.45 + (i % 3) * 0.22) * (i % 2 ? -1 : 1);
      const gradiente = ctx.createLinearGradient(0, 0, largura, 0);
      gradiente.addColorStop(0, cor(claro, 0));
      gradiente.addColorStop(0.5, cor(claro, (0.16 + (i % 3) * 0.05) * (0.4 + energia * 0.6)));
      gradiente.addColorStop(1, cor(claro, 0));
      ctx.strokeStyle = gradiente;
      ctx.lineWidth = 0.8 + (i % 3) * 0.55;
      ctx.beginPath();
      for (let x = -8; x <= largura + 8; x += 10) {
        const y = base + Math.sin(x * onda + tempo * velocidade + i) * amp + Math.sin(x * onda * 0.5 + tempo * velocidade * 0.6) * amp * 0.8;
        if (x === -8) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    for (const p of particulas) {
      p.vida += dt / p.duracao;
      if (p.vida >= 1 || p.x > largura + 12) { reiniciar(p, false); continue; }
      p.fase += dt;
      p.x += p.vx * dt * energia;
      p.y += (p.vy + Math.sin(p.fase * 1.6) * 9) * dt * energia;
      ctx.fillStyle = cor(claro, Math.sin(Math.PI * p.vida) * 0.55);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.tam, 0, TAU); ctx.fill();
    }
  };

  const desenharTerra = (dt: number) => {
    // Crystals stand along the bottom edge; each catches the light now and then.
    for (const c of cristais) {
      const brilho = 0.5 + 0.5 * Math.sin(tempo * 0.7 + c.fase);
      const topoX = c.x + c.incl * c.altura * 2;
      const topoY = altura - c.altura;
      ctx.beginPath();
      ctx.moveTo(c.x - c.largura / 2, altura + 2);
      ctx.lineTo(c.x - c.largura * 0.28, altura - c.altura * 0.55);
      ctx.lineTo(topoX, topoY);
      ctx.lineTo(c.x + c.largura * 0.3, altura - c.altura * 0.5);
      ctx.lineTo(c.x + c.largura / 2, altura + 2);
      ctx.closePath();
      const gradiente = ctx.createLinearGradient(0, topoY, 0, altura);
      gradiente.addColorStop(0, cor(aura, 0.2 + brilho * 0.16 * energia));
      gradiente.addColorStop(1, cor(acento, 0.02));
      ctx.fillStyle = gradiente;
      ctx.fill();
      ctx.strokeStyle = cor(acento, 0.22 + brilho * 0.2 * energia);
      ctx.lineWidth = 1;
      ctx.stroke();
      // One lit facet.
      ctx.beginPath();
      ctx.moveTo(topoX, topoY);
      ctx.lineTo(c.x - c.largura * 0.28, altura - c.altura * 0.55);
      ctx.lineTo(c.x + c.incl * 10, altura - c.altura * 0.3);
      ctx.closePath();
      ctx.fillStyle = cor(ouro, 0.06 + brilho * 0.14 * energia);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const p of particulas) {
      p.vida += dt / p.duracao;
      if (p.vida >= 1) { reiniciar(p, false); continue; }
      p.fase += dt * 1.1;
      p.x += (p.vx + Math.sin(p.fase) * 4) * dt * energia;
      p.y += (p.vy + Math.cos(p.fase * 0.8) * 3) * dt * energia;
      const alfa = Math.sin(Math.PI * p.vida) * (0.45 + 0.4 * Math.sin(p.fase * 3)) * (0.35 + energia * 0.65);
      ctx.fillStyle = cor(ouro, Math.max(0, alfa));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.tam, 0, TAU); ctx.fill();
    }
  };

  const desenharFaiscas = (dt: number) => {
    ctx.globalCompositeOperation = 'lighter';
    for (let i = faiscas.length - 1; i >= 0; i -= 1) {
      const f = faiscas[i];
      f.vida += dt / f.duracao;
      if (f.vida >= 1) { faiscas.splice(i, 1); continue; }
      f.vx *= 1 - dt * 1.6;
      f.vy *= 1 - dt * 1.6;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      const alfa = 1 - f.vida;
      ctx.fillStyle = cor(claro, alfa * 0.9);
      ctx.beginPath(); ctx.arc(f.x, f.y, f.tam * (1 - f.vida * 0.5), 0, TAU); ctx.fill();
      ctx.fillStyle = cor(aura, alfa * 0.2);
      ctx.beginPath(); ctx.arc(f.x, f.y, f.tam * 3.4, 0, TAU); ctx.fill();
    }
  };

  const desenhar = (dt: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, largura, altura);
    if (elemento === 'fogo') desenharFogo(dt);
    else if (elemento === 'agua') desenharAgua(dt);
    else if (elemento === 'ar') desenharAr(dt);
    else desenharTerra(dt);
    desenharFaiscas(dt);
    ctx.globalCompositeOperation = 'source-over';
  };

  const passo = (agora: number) => {
    quadro = 0;
    if (!ativa) return;
    const dt = anterior ? Math.min((agora - anterior) / 1000, 0.05) : 0.016;
    anterior = agora;
    // The scene eases toward the energy it is asked for, so a pause is a slow breath.
    energia += (lerEnergia() - energia) * Math.min(1, dt * 2.4);
    tempo += dt * (0.25 + energia * 0.75);
    desenhar(dt);
    quadro = requestAnimationFrame(passo);
  };

  const acordar = () => {
    if (quadro || !ativa || document.hidden) return;
    anterior = 0;
    quadro = requestAnimationFrame(passo);
  };
  const aoMudarVisibilidade = () => {
    if (document.hidden) { cancelAnimationFrame(quadro); quadro = 0; } else acordar();
  };

  const observador = new ResizeObserver(() => { medir(); });
  observador.observe(canvas);
  medir();
  document.addEventListener('visibilitychange', aoMudarVisibilidade);
  acordar();

  return {
    rajada(x, y, forca = 1) {
      const quantidade = Math.round(16 * forca);
      for (let i = 0; i < quantidade && faiscas.length < FAISCAS_MAX; i += 1) {
        const angulo = Math.random() * TAU;
        const velocidade = sortear(50, 150) * Math.min(1.4, forca);
        faiscas.push({
          x: x * largura, y: y * altura, vx: Math.cos(angulo) * velocidade, vy: Math.sin(angulo) * velocidade,
          vida: 0, duracao: sortear(0.7, 1.4), tam: sortear(0.9, 2.2),
        });
      }
    },
    parar() {
      ativa = false;
      cancelAnimationFrame(quadro);
      observador.disconnect();
      document.removeEventListener('visibilitychange', aoMudarVisibilidade);
    },
  };
}
