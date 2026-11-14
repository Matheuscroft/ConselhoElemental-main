export type ElementoDoDia = 'terra' | 'fogo' | 'agua' | 'ar';

const ORDEM: readonly ElementoDoDia[] = ['fogo', 'agua', 'ar', 'terra'];

/**
 * The element that leads a day: the one with the most cycles scheduled, then
 * the most done. Null when the day is empty or no element leads, so the frame
 * falls back to the neutral gold.
 */
export function elementoDominante(
  ciclos: readonly { readonly elementId: ElementoDoDia; readonly feito: boolean }[],
): ElementoDoDia | null {
  const total = new Map<ElementoDoDia, number>();
  const feitos = new Map<ElementoDoDia, number>();
  for (const ciclo of ciclos) {
    total.set(ciclo.elementId, (total.get(ciclo.elementId) ?? 0) + 1);
    if (ciclo.feito) feitos.set(ciclo.elementId, (feitos.get(ciclo.elementId) ?? 0) + 1);
  }
  let lider: ElementoDoDia | null = null;
  let empate = false;
  for (const elemento of ORDEM) {
    const n = total.get(elemento) ?? 0;
    if (n === 0) continue;
    if (lider === null) { lider = elemento; empate = false; continue; }
    const m = total.get(lider) ?? 0;
    const diferenca = n - m || (feitos.get(elemento) ?? 0) - (feitos.get(lider) ?? 0);
    if (diferenca > 0) { lider = elemento; empate = false; }
    else if (diferenca === 0) empate = true;
  }
  return empate ? null : lider;
}
