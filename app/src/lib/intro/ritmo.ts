/**
 * The grimoire's frame pacing, measured instead of assumed.
 *
 * - Detects the display's refresh from the rAF tick intervals (30 in iOS Low Power Mode, 60, 90, 120, 144).
 * - Paces to a uniform target: 120 Hz only while the device sustains it; otherwise it locks to 60 for the rest
 *   of the ceremony and renders every other tick (an even 60 is worth more than an uneven 80–110).
 * - Scales quality in steps (pixel ratio, then particle density) from the p95 of the rendered intervals, before
 *   any drop to the static level, with hysteresis so it never oscillates.
 * - Keeps the numbers the laboratory shows: rates, p50/p95, missed frames, CPU cost and input-to-frame latency.
 *
 * Pure (no DOM, no Three.js), allocation-free per tick, so it can be tested and run every frame.
 */

export const TAXAS = [30, 60, 90, 120, 144] as const;
export type HzForcado = 60 | 120 | null;

/** Nearest standard refresh rate for a tick interval (the caller passes the p10 of the ticks). */
export function taxaPorIntervalo(medianaMs: number): number {
  let melhor: number = TAXAS[0];
  for (const t of TAXAS) if (Math.abs(1000 / t - medianaMs) < Math.abs(1000 / melhor - medianaMs)) melhor = t;
  return melhor;
}

/** Percentile of the first `n` values of a buffer (copies into `scratch`, sorts it). */
export function percentil(buf: Float64Array, n: number, p: number, scratch: Float64Array): number {
  if (n <= 0) return 0;
  for (let i = 0; i < n; i += 1) scratch[i] = buf[i];
  const v = scratch.subarray(0, n).sort();
  return v[Math.min(n - 1, Math.max(0, Math.round((n - 1) * p)))];
}

/** Quality steps: 0 = full; each step trades pixels first, then particles. */
export const ESCALAS = [
  { pixel: 1, particulas: 1 },
  { pixel: 0.85, particulas: 1 },
  { pixel: 0.72, particulas: 0.6 },
  { pixel: 0.6, particulas: 0.35 },
] as const;

/** A rendered window is bad when its p95 is this far over the target period, good under the other. */
export const RUIM = 1.35;
export const BOM = 1.12;
const JANELA_MS = 1000;
const N = 256;

export interface Estatisticas {
  telaHz: number | null;
  alvoHz: number;
  travado60: boolean;
  p50: number;
  p95: number;
  perdidos: number;
  custoP95: number;
  escala: number;
  entradaP50: number | null;
  entradaP95: number | null;
}

export interface Ritmo {
  /** One rAF tick at `agora` (ms). Returns the ms to advance the scene by, or -1 to skip this tick (pacing). */
  tick(agora: number, visivel: boolean): number;
  /** CPU ms spent on the frame just rendered. */
  custo(ms: number): void;
  /** Time from an input event to the frame that applied it. */
  entrada(ms: number): void;
  forcar(hz: HzForcado): void;
  /** Called when the quality step changes (0..3). */
  aoEscalar: ((escala: number) => void) | null;
  readonly escala: number;
  readonly alvoHz: number;
  readonly periodoAlvo: number;
  estatisticas(): Estatisticas;
  /** Start / finish a measured stretch (e.g. the closing transition); `fim` returns its p95 and cost. */
  trecho(): { fim(): { p95: number; perdidos: number; custoP95: number; quadros: number } };
}

export function criarRitmo(): Ritmo {
  const ticks = new Float64Array(N); let nt = 0, it = 0;          // raw tick intervals (display rate)
  const quadros = new Float64Array(N); let nq = 0, iq = 0;        // rendered intervals (last N)
  const custos = new Float64Array(N); let nc = 0, ic = 0;
  const entradas = new Float64Array(64); let ne = 0, ie = 0;
  const janela = new Float64Array(N); let nj = 0, somaJ = 0;      // current 1 s window
  const scratch = new Float64Array(N);
  let ultimoTick = -1, ultimoRender = -1;
  let telaHz: number | null = null;
  let forcado: HzForcado = null;
  let travado60 = false;
  let escala = 0;
  let ruins = 0, bons = 0, ultimaQueda = 0, relogio = 0;
  let perdidos = 0;
  let trechoAtivo: { q: number[]; c: number[]; perdidos: number } | null = null;

  const alvo = () => {
    const tela = telaHz ?? 60;
    if (forcado) return Math.min(forcado, tela);
    if (travado60 && tela > 60) return 60;
    return tela;
  };

  const r: Ritmo = {
    aoEscalar: null,
    get escala() { return escala; },
    get alvoHz() { return alvo(); },
    get periodoAlvo() { return 1000 / alvo(); },
    tick(agora, visivel) {
      if (!visivel) { ultimoTick = -1; ultimoRender = -1; nj = 0; somaJ = 0; return -1; }
      if (ultimoTick < 0) { ultimoTick = agora; ultimoRender = agora; return 0; }
      const dTick = agora - ultimoTick; ultimoTick = agora;
      if (dTick > 250) { ultimoRender = agora; nj = 0; somaJ = 0; return 0; } // voltou de uma pausa
      ticks[it] = dTick; it = (it + 1) % N; nt = Math.min(N, nt + 1);
      // o p10 dos ticks é a taxa da tela: um aparelho que não acompanha 120 ainda entrega alguns ticks de 8,3 ms
      if (nt >= 30 && (nt & 15) === 0) telaHz = taxaPorIntervalo(percentil(ticks, Math.min(nt, 120), 0.1, scratch));
      const periodoTela = telaHz ? 1000 / telaHz : dTick;
      const periodo = 1000 / alvo();
      const desde = agora - ultimoRender;
      // ritmo uniforme: abaixo da taxa da tela, desenha só quando o período do alvo venceu (meio quadro de folga)
      if (desde < periodo - periodoTela / 2) return -1;
      ultimoRender = agora;
      quadros[iq] = desde; iq = (iq + 1) % N; nq = Math.min(N, nq + 1);
      if (desde > periodo * 1.5) {
        const n = Math.round(desde / periodo) - 1;
        perdidos += n;
        if (trechoAtivo) trechoAtivo.perdidos += n;
      }
      if (trechoAtivo) trechoAtivo.q.push(desde);
      janela[nj] = desde; nj = Math.min(N - 1, nj + 1); somaJ += desde; relogio += desde;
      if (somaJ >= JANELA_MS) {
        const p95 = percentil(janela, nj, 0.95, scratch);
        nj = 0; somaJ = 0;
        const ruim = p95 > periodo * RUIM;
        ruins = ruim ? ruins + 1 : 0;
        bons = p95 <= periodo * BOM ? bons + 1 : 0;
        if (ruins >= 2) {
          ruins = 0; bons = 0; ultimaQueda = relogio;
          // primeiro desiste dos 120 Hz (uma vez, para sempre nesta cerimônia), depois troca pixels e partículas
          if (!forcado && !travado60 && (telaHz ?? 60) > 60) travado60 = true;
          else if (escala < ESCALAS.length - 1) { escala += 1; r.aoEscalar?.(escala); }
        } else if (bons >= 5 && escala > 0 && relogio - ultimaQueda > 8000) {
          bons = 0; escala -= 1; r.aoEscalar?.(escala);
        }
      }
      return Math.min(100, desde);
    },
    custo(ms) {
      custos[ic] = ms; ic = (ic + 1) % N; nc = Math.min(N, nc + 1);
      if (trechoAtivo) trechoAtivo.c.push(ms);
    },
    entrada(ms) { entradas[ie] = ms; ie = (ie + 1) % 64; ne = Math.min(64, ne + 1); },
    forcar(hz) { forcado = hz; ruins = 0; bons = 0; },
    estatisticas() {
      return {
        telaHz, alvoHz: alvo(), travado60,
        p50: percentil(quadros, nq, 0.5, scratch), p95: percentil(quadros, nq, 0.95, scratch),
        perdidos, custoP95: percentil(custos, nc, 0.95, scratch), escala,
        entradaP50: ne ? percentil(entradas, ne, 0.5, scratch) : null,
        entradaP95: ne ? percentil(entradas, ne, 0.95, scratch) : null,
      };
    },
    trecho() {
      const t = { q: [] as number[], c: [] as number[], perdidos: 0 };
      trechoAtivo = t;
      return {
        fim() {
          if (trechoAtivo === t) trechoAtivo = null;
          const q = Float64Array.from(t.q), c = Float64Array.from(t.c);
          const s = new Float64Array(Math.max(q.length, c.length, 1));
          return { p95: percentil(q, q.length, 0.95, s), perdidos: t.perdidos, custoP95: percentil(c, c.length, 0.95, s), quadros: q.length };
        },
      };
    },
  };
  return r;
}
