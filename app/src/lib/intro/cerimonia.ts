/**
 * The grimoire ceremony as pure state: which beat the opening is on and what may happen next.
 *
 * No timers, no DOM, no Three.js here, so the React shell, the 3D scene and the audio can all be
 * driven from it and the order can be tested on its own. Nothing here touches scoring, progress or
 * the account: the ceremony only ever ends in `onComplete` or `onSkip`, exactly like the scene it
 * replaces.
 */

/** The ceremony order (water, earth, fire, air). Local to this scene: the app keeps its own order elsewhere. */
export const ORDEM_CERIMONIA = ['agua', 'terra', 'fogo', 'ar'] as const;
export type ElementoCerimonia = (typeof ORDEM_CERIMONIA)[number];

export type FaseGrimorio =
  | 'poster' // closed book, waiting for the first touch on the clasp
  | 'abrindo' // clasp releases, cover opens, light rises
  | 'lenda' // the legend is read, clause by clause
  | 'gesto' // one element at a time, in ORDEM_CERIMONIA
  | 'conselho' // the circle completes, recedes, light settles on the clasp
  | 'final' // the closing line and "Começar"
  | 'concluido' // Começar pressed: hands over with onComplete
  | 'pulado'; // Pular pressed: hands over with onSkip

export interface EstadoGrimorio {
  readonly fase: FaseGrimorio;
  /** Index into ORDEM_CERIMONIA while in 'gesto'. */
  readonly indice: number;
  /** Elements already awakened, in the order they were awakened. */
  readonly despertos: readonly ElementoCerimonia[];
  /** Clause of the legend currently shown (0-based), while in 'lenda'. */
  readonly oracao: number;
}

export type SinalGrimorio =
  | { tipo: 'abrir' }
  | { tipo: 'aberto' }
  | { tipo: 'oracao' }
  | { tipo: 'lendaLida' }
  | { tipo: 'despertou'; elemento: ElementoCerimonia }
  | { tipo: 'conselhoAssentou' }
  | { tipo: 'comecar' }
  | { tipo: 'pular' };

export const ESTADO_INICIAL: EstadoGrimorio = { fase: 'poster', indice: 0, despertos: [], oracao: 0 };

/** Settled: nothing further happens on its own. */
export const encerrado = (estado: EstadoGrimorio): boolean => estado.fase === 'concluido' || estado.fase === 'pulado';

export const elementoAtual = (estado: EstadoGrimorio): ElementoCerimonia | null =>
  estado.fase === 'gesto' ? ORDEM_CERIMONIA[estado.indice] ?? null : null;

/**
 * Only the listed moves happen; anything else returns the same object. A stray tap, a second
 * finger or a late animation callback can never push the ceremony out of order.
 */
export function avancar(estado: EstadoGrimorio, sinal: SinalGrimorio, totalOracoes: number): EstadoGrimorio {
  if (encerrado(estado)) return estado;
  if (sinal.tipo === 'pular') return { ...estado, fase: 'pulado' };

  switch (estado.fase) {
    case 'poster':
      return sinal.tipo === 'abrir' ? { ...estado, fase: 'abrindo' } : estado;
    case 'abrindo':
      return sinal.tipo === 'aberto' ? { ...estado, fase: 'lenda', oracao: 0 } : estado;
    case 'lenda':
      if (sinal.tipo === 'oracao') {
        const proxima = estado.oracao + 1;
        return proxima >= totalOracoes ? { ...estado, fase: 'gesto', indice: 0 } : { ...estado, oracao: proxima };
      }
      return sinal.tipo === 'lendaLida' ? { ...estado, fase: 'gesto', indice: 0 } : estado;
    case 'gesto': {
      if (sinal.tipo !== 'despertou') return estado;
      const esperado = ORDEM_CERIMONIA[estado.indice];
      if (sinal.elemento !== esperado || estado.despertos.includes(esperado)) return estado;
      const despertos = [...estado.despertos, esperado];
      return despertos.length === ORDEM_CERIMONIA.length
        ? { ...estado, fase: 'conselho', despertos, indice: estado.indice }
        : { ...estado, despertos, indice: estado.indice + 1 };
    }
    case 'conselho':
      return sinal.tipo === 'conselhoAssentou' ? { ...estado, fase: 'final' } : estado;
    case 'final':
      return sinal.tipo === 'comecar' ? { ...estado, fase: 'concluido' } : estado;
    default:
      return estado;
  }
}

/**
 * Reduced motion and the static level jump straight to the end state of each beat: every tap moves
 * one page forward, and the ceremony still visits every element so nothing is hidden from anyone.
 */
export function avancarPorToque(estado: EstadoGrimorio, totalOracoes: number): EstadoGrimorio {
  switch (estado.fase) {
    case 'poster': return avancar(avancar(estado, { tipo: 'abrir' }, totalOracoes), { tipo: 'aberto' }, totalOracoes);
    case 'lenda': return avancar(estado, { tipo: 'lendaLida' }, totalOracoes);
    case 'gesto': {
      const el = elementoAtual(estado);
      return el ? avancar(estado, { tipo: 'despertou', elemento: el }, totalOracoes) : estado;
    }
    case 'conselho': return avancar(estado, { tipo: 'conselhoAssentou' }, totalOracoes);
    default: return estado;
  }
}
