import type { ElementoCerimonia } from '@/lib/intro/cerimonia';

/**
 * The grimoire's colours, straight from the design-system tokens (02-tokens-v2.css / DECISOES §5).
 * Hex in sRGB; Three's colour management converts them to the linear working space.
 * The CSS layer declares the same values as --mat-* and --intro-* in the scene's scope.
 */
export const COR = {
  // matéria
  couro: '#2b1d17',
  couroClaro: '#4a3328',
  couroFundo: '#1a110d',
  papel: '#e8dcc2',
  papelSombra: '#cbb995',
  tinta: '#2a211b',
  latao: '#8f7a55',
  ouro: '#d5b66f',
  // atmosfera
  noite: '#14122a',
  horizonte: '#3a3270',
  horizonteQuente: '#8f6fb0',
  nevoa: '#6f68b8',
  nevoaClara: '#9a93d6',
  contraluz: '#f3e3c1',
  contraluzFria: '#b7aef0',
  poca: '#f3c98a',
  lua: '#f2ecff',
  cristaLonge: '#3b3566',
  cristaMeio: '#2a2448',
  cristaPerto: '#1b1730',
  pedra: '#4e4858',
} as const;

/** Four levels per element: base (body), acento (sigil, ring), tinta (stain on paper), aura (light). */
export const ELEMENTO: Record<ElementoCerimonia, { base: string; acento: string; tinta: string; aura: string }> = {
  agua: { base: '#1b4965', acento: '#8bcee3', tinta: '#203d4e', aura: '#5cc8f5' },
  terra: { base: '#3e5f44', acento: '#a3ce9b', tinta: '#263e36', aura: '#86e07a' },
  fogo: { base: '#d14900', acento: '#f5ad83', tinta: '#4b302b', aura: '#ff8a4d' },
  ar: { base: '#655181', acento: '#dfcef6', tinta: '#392d49', aura: '#c49cf5' },
};
