/**
 * Pure helpers for the focus screen. They only read numbers the timer owner
 * already supplies: nothing here counts time, stores it or rewards it.
 */

/** The four moments of a planned session, as fractions of the plan. */
export const MARCOS = [0.25, 0.5, 0.75, 1] as const;

/** "mm:ss" or "h:mm:ss", as `formatTime` writes it, back to seconds. */
export function segundosDoRelogio(time: string): number {
  const partes = time.split(':').map((parte) => Number(parte));
  if (!partes.length || partes.length > 3 || partes.some((parte) => !Number.isFinite(parte))) return 0;
  return partes.reduce((soma, parte) => soma * 60 + parte, 0);
}

/** "30min", "1h 30min", "45s" (as `formatDuration` writes them) to seconds. */
export function segundosDoRotulo(rotulo?: string): number | undefined {
  if (!rotulo) return undefined;
  const horas = /(\d+)\s*h/.exec(rotulo);
  const minutos = /(\d+)\s*min/.exec(rotulo);
  const segundos = /(\d+)\s*s\b/.exec(rotulo);
  const total = (horas ? Number(horas[1]) * 3600 : 0) + (minutos ? Number(minutos[1]) * 60 : 0) + (segundos ? Number(segundos[1]) : 0);
  return total > 0 ? total : undefined;
}

/** How much of the plan has passed, never below 0 and never above 1. */
export function fracaoDoPlano(decorrido: number, planejado?: number): number {
  if (!planejado || planejado <= 0 || !Number.isFinite(decorrido)) return 0;
  return Math.min(1, Math.max(0, decorrido / planejado));
}

/** How many of the four marks have been reached: 0 to 4. */
export function marcoAlcancado(fracao: number): number {
  return MARCOS.filter((marco) => fracao >= marco).length;
}

/** What a screen reader is told when a mark is reached. Only marks are announced, never seconds. */
export function anuncioDoMarco(marco: number, planejadoRotulo?: string): string {
  if (marco >= 4) return `Meta atingida${planejadoRotulo ? `: ${planejadoRotulo}` : ''}. Você pode continuar ou concluir.`;
  const porcento = Math.round(MARCOS[Math.max(0, marco - 1)] * 100);
  return `${porcento}% do tempo planejado.`;
}

/** Seconds past the plan, once the plan has been met. */
export function alemDaMeta(decorrido: number, planejado?: number): number {
  return planejado && decorrido > planejado ? decorrido - planejado : 0;
}
