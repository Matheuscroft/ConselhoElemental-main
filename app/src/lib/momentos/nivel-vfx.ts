export type NivelVfx = 1 | 2 | 3;

/**
 * The element's mastery level at which the frame of the open day evolves:
 * from 10 it is level 2 (Fluxo), from 25 level 3 (Domínio). Below, and on a
 * day with no leading element, it stays level 1 (Faísca).
 */
export const LIMIARES: readonly [number, number] = [10, 25];

export function nivelDeVfx(maestria: number | null | undefined): NivelVfx {
  if (!maestria || !Number.isFinite(maestria)) return 1;
  if (maestria >= LIMIARES[1]) return 3;
  if (maestria >= LIMIARES[0]) return 2;
  return 1;
}

/**
 * A forced level from the address (`?vfx=1|2|3`), for seeing the three levels
 * without the XP. The caller only passes it in development.
 */
export function nivelForcado(busca: string): NivelVfx | null {
  const valor = new URLSearchParams(busca).get('vfx');
  return valor === '1' || valor === '2' || valor === '3' ? (Number(valor) as NivelVfx) : null;
}
