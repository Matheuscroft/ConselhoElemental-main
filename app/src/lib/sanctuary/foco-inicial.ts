import { AREAS_WITH_SUBAREAS } from '@/constants/areas-with-subareas';

/**
 * The areas the opening offers, grouped by element: the same thirty top-level areas the Pilares page shows. Read
 * straight from the areas file (not the constants barrel) so the opening stays light.
 */
export type ElementoDoFoco = 'terra' | 'fogo' | 'agua' | 'ar';
export interface AreaDoFoco { readonly id: string; readonly nome: string; readonly elemento: ElementoDoFoco }

export const ORDEM_DO_FOCO: readonly ElementoDoFoco[] = ['terra', 'fogo', 'agua', 'ar'];

const TODAS: readonly AreaDoFoco[] = AREAS_WITH_SUBAREAS
  .filter((area) => area.id !== 'sem-categoria' && area.parentId === null)
  .map((area) => ({ id: area.id, nome: area.name, elemento: area.elementId }));

export const areasDoElemento = (elemento: ElementoDoFoco): readonly AreaDoFoco[] => TODAS.filter((area) => area.elemento === elemento);

/** Keeps only ids the app knows, in a stable order: what was stored on the device is data, never trusted. */
export function sanearAreas(ids: readonly string[]): string[] {
  const conhecidas = new Set(TODAS.map((area) => area.id));
  return [...new Set(ids)].filter((id) => conhecidas.has(id));
}

/** How many of the chosen areas belong to each element. */
export function contagemPorElemento(escolhidas: ReadonlySet<string>): Record<ElementoDoFoco, number> {
  const saida: Record<ElementoDoFoco, number> = { terra: 0, fogo: 0, agua: 0, ar: 0 };
  for (const area of TODAS) if (escolhidas.has(area.id)) saida[area.elemento] += 1;
  return saida;
}
