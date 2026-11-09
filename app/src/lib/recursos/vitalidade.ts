/**
 * Vitality: the one place the HP figure is worked out.
 *
 * It was written out by hand in the sidebar, the grimoire and the sanctuary,
 * three copies of the same arithmetic that nothing kept in step. A resource
 * shown in four places has to be one calculation, or the four will disagree
 * and the app will look broken to the only person who sees all of them.
 */

/** Everyone starts the day standing. */
export const HP_BASE = 70;
export const HP_MAXIMO = 100;
/** What one habit carried through is worth. */
export const HP_POR_HABITO = 5;
/** Keeping a streak at all is worth something on its own. */
export const HP_POR_OFENSIVA = 10;

export interface DiaDaPessoa {
  readonly habitosHoje: number;
  readonly ofensiva: number;
}

export function hpDoDia({ habitosHoje, ofensiva }: DiaDaPessoa): number {
  const habitos = Math.max(0, Math.floor(habitosHoje));
  const bonus = ofensiva > 0 ? HP_POR_OFENSIVA : 0;
  return Math.min(HP_MAXIMO, HP_BASE + habitos * HP_POR_HABITO + bonus);
}
