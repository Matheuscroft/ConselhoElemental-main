/**
 * Capas das modalidades: arte decorativa (16:9, WebP) em public/fitness/capas.
 * Yoga's poses have their own illustrations; its cover is only the card and hero art.
 */
const CAPAS: Readonly<Record<string, string>> = {
  running: 'corrida',
  calisthenics: 'calistenia',
  strength: 'musculacao',
  martial_arts: 'artes-marciais',
  swimming: 'natacao',
  cycling: 'ciclismo',
  yoga: 'yoga',
};

export function capaDaModalidade(id: string): string | undefined {
  const arquivo = CAPAS[id];
  return arquivo ? `/fitness/capas/${arquivo}.webp` : undefined;
}
