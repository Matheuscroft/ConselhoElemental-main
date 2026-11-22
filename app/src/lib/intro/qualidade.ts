/**
 * Which level of the grimoire a device gets, and when it has to step down.
 *
 * A: WebGPU (compute particles, full post). B: the same scene on the WebGL2 backend, lighter.
 * C: static pages, advanced by tap. One rule for C, the same as the design system's light mode
 * (07-movimento): the person asks for it, reduced motion is on, the 3D backends fail, or two
 * consecutive 2-second windows of visible 3D have a median frame interval above 25 ms, measured
 * after the first stable frame with the tab visible. Interrupted windows are discarded.
 */

export type NivelGrimorio = 'A' | 'B' | 'C';

export interface Capacidades {
  readonly movimentoReduzido: boolean;
  readonly webgpu: boolean;
  readonly webgl2: boolean;
  /** The person chose the light version during this session. */
  readonly escolhaLeve?: boolean;
}

export function nivelInicial(c: Capacidades): NivelGrimorio {
  if (c.movimentoReduzido || c.escolhaLeve) return 'C';
  if (c.webgpu) return 'A';
  if (c.webgl2) return 'B';
  return 'C';
}

export const JANELA_MS = 2000;
export const LIMITE_MEDIANA_MS = 25;
export const JANELAS_RUINS_PARA_CAIR = 2;

export interface MonitorQuadros {
  /** Feed one frame interval. `visivel` false discards the current window. Returns true when the scene must drop to C. */
  registrar(intervaloMs: number, visivel: boolean): boolean;
  readonly janelasRuins: number;
  readonly ultimaMediana: number | null;
}

export function mediana(valores: readonly number[]): number {
  if (valores.length === 0) return 0;
  const v = [...valores].sort((a, b) => a - b);
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

export function criarMonitorQuadros(): MonitorQuadros {
  let janela: number[] = [];
  let soma = 0;
  let ruins = 0;
  let ultima: number | null = null;
  let caiu = false;
  return {
    get janelasRuins() { return ruins; },
    get ultimaMediana() { return ultima; },
    registrar(intervaloMs, visivel) {
      if (caiu) return true;
      // A hidden tab or a huge gap (the tab was backgrounded) interrupts the window: start over.
      if (!visivel || intervaloMs > 500) { janela = []; soma = 0; return false; }
      janela.push(intervaloMs); soma += intervaloMs;
      if (soma < JANELA_MS) return false;
      ultima = mediana(janela);
      janela = []; soma = 0;
      ruins = ultima > LIMITE_MEDIANA_MS ? ruins + 1 : 0;
      if (ruins >= JANELAS_RUINS_PARA_CAIR) caiu = true;
      return caiu;
    },
  };
}

/** Particle and post budget per level, so the scene code has one place to read them from. */
export const ORCAMENTO = {
  A: { pixelRatio: 2, poeira: 360, faiscas: 600, bloom: true, profundidade: true, nevoaCamadas: 3 },
  B: { pixelRatio: 1.5, poeira: 160, faiscas: 160, bloom: true, profundidade: false, nevoaCamadas: 2 },
  C: { pixelRatio: 1, poeira: 0, faiscas: 0, bloom: false, profundidade: false, nevoaCamadas: 0 },
} as const;
