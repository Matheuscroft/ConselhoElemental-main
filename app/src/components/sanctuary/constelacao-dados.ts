/**
 * What the focus card says about an element, from data the app already keeps.
 * Pure: nothing here reads a store or writes anything.
 */

interface RituaisLidos {
  readonly isCompleted: boolean;
  readonly elementId: string;
  readonly dueDate?: string | null;
}

interface AreaLida {
  readonly id: string;
  readonly name: string;
  readonly elementId: string;
}

/** Local date as YYYY-MM-DD, the same shape as a ritual's due date. */
export function dataLocal(data: Date): string {
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${dois(data.getMonth() + 1)}-${dois(data.getDate())}`;
}

/**
 * Rituals still open for today, by element: not finished, and either with no
 * date (they wait for the person) or due today or earlier. A ritual due in the
 * future is not today's.
 */
export function pendentesDeHoje(tasks: readonly RituaisLidos[], hoje: string): Record<string, number> {
  const total: Record<string, number> = {};
  for (const task of tasks) {
    if (task.isCompleted) continue;
    if (task.dueDate && task.dueDate > hoje) continue;
    total[task.elementId] = (total[task.elementId] ?? 0) + 1;
  }
  return total;
}

export const textoDePendentes = (pendentes: number) =>
  pendentes === 1 ? '1 ritual hoje' : `${pendentes} rituais hoje`;

/**
 * The life areas ("vertentes") of an element for the chips: the person's active
 * areas first; with none active, the first ones the element has. Three at most,
 * and how many were left out.
 */
export function vertentesDoElemento(
  id: string,
  areas: readonly AreaLida[],
  ativas: readonly string[],
  maximo = 3,
): { readonly nomes: readonly string[]; readonly restantes: number; readonly total: number } {
  const doElemento = areas.filter((area) => area.elementId === id);
  const ativasDele = doElemento.filter((area) => ativas.includes(area.id));
  const base = ativasDele.length > 0 ? ativasDele : doElemento;
  return {
    nomes: base.slice(0, maximo).map((area) => area.name),
    restantes: Math.max(0, base.length - maximo),
    total: base.length,
  };
}
