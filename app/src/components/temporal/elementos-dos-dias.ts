import { toDayStamp } from '@/lib/temporal/date';
import type { ConclusaoDoElemento } from '@/lib/momentos/elemento-da-semana';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';

export const ORDEM_DOS_ELEMENTOS: readonly ElementoDoDia[] = ['fogo', 'agua', 'ar', 'terra'];

export type ContagemDoDia = Readonly<Record<ElementoDoDia, number>>;

/**
 * What was finished on each day, split by element. Read-only: it only groups
 * the completions the app already keeps (the same list that decides the
 * week's colour); nothing is written, scored or inferred from a plan.
 */
export function elementosPorDia(conclusoes: readonly ConclusaoDoElemento[]): Map<number, ContagemDoDia> {
  const mapa = new Map<number, Record<ElementoDoDia, number>>();
  for (const { data, elemento } of conclusoes) {
    const dia = toDayStamp(data);
    if (dia == null) continue;
    const atual = mapa.get(dia) ?? { fogo: 0, agua: 0, ar: 0, terra: 0 };
    atual[elemento] += 1;
    mapa.set(dia, atual);
  }
  return mapa;
}

/** The elements that have something finished in the day, in the fixed order. */
export function elementosDoDia(contagem: ContagemDoDia | undefined): ElementoDoDia[] {
  return contagem ? ORDEM_DOS_ELEMENTOS.filter((elemento) => contagem[elemento] > 0) : [];
}

/** 0 to 1: how lit a day is, against the brightest day of its period. */
export function calor(valor: number, maximo: number): number {
  return maximo > 0 && valor > 0 ? Math.min(1, Math.max(0.18, valor / maximo)) : 0;
}
