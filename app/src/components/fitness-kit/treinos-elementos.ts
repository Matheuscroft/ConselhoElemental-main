import type { ElementoId } from '@/lib/design/palette';

/**
 * The element each modality is painted in. This is presentation only: it
 * colours a rune and never touches what a workout is worth. The fire of
 * effort is the fallback, because exercise is the pillar of fire.
 */
const ELEMENTO_DA_MODALIDADE: Readonly<Record<string, ElementoId>> = {
  running: 'ar',
  cycling: 'ar',
  swimming: 'agua',
  yoga: 'agua',
  mobility: 'agua',
  martial_arts: 'fogo',
  conditioning: 'fogo',
  strength: 'terra',
  hypertrophy: 'terra',
  calisthenics: 'terra',
};

export const ELEMENTO_DO_ESFORCO: ElementoId = 'fogo';

export function elementoDaModalidade(id: string): ElementoId {
  return ELEMENTO_DA_MODALIDADE[id] ?? ELEMENTO_DO_ESFORCO;
}
