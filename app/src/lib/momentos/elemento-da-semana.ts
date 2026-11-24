import type { ElementoDoDia } from './elemento-do-dia.ts';

const ELEMENTOS_VALIDOS: ReadonlySet<string> = new Set(['fogo', 'agua', 'ar', 'terra']);

/** One thing the person finished, and the element it belongs to. */
export interface ConclusaoDoElemento {
  readonly data: Date;
  readonly elemento: ElementoDoDia;
}

export interface ElementoDaSemana {
  /** The element that led the week; null when nothing was finished in it. */
  readonly elemento: ElementoDoDia | null;
  readonly contagem: Readonly<Record<ElementoDoDia, number>>;
  readonly total: number;
}

const ELEMENTOS: readonly ElementoDoDia[] = ['fogo', 'agua', 'ar', 'terra'];

/** Monday 00:00, local time, of the week that holds `data`. */
export function inicioDaSemana(data: Date): Date {
  const inicio = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const diasDesdeSegunda = (inicio.getDay() + 6) % 7;
  inicio.setDate(inicio.getDate() - diasDesdeSegunda);
  return inicio;
}

/**
 * The element that leads the week of `referencia` (Monday to Sunday): the one
 * with the most things finished. A tie goes to the element finished most
 * recently, so the frame follows where the week is heading and the colour
 * changes the moment another element passes the leader. Everything resets on
 * Monday because only that week's completions are counted.
 */
export function elementoDaSemana(
  conclusoes: readonly ConclusaoDoElemento[],
  referencia: Date,
): ElementoDaSemana {
  const inicio = inicioDaSemana(referencia).getTime();
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 7);
  const contagem: Record<ElementoDoDia, number> = { fogo: 0, agua: 0, ar: 0, terra: 0 };
  const ultima: Record<ElementoDoDia, number> = { fogo: 0, agua: 0, ar: 0, terra: 0 };
  let total = 0;
  for (const { data, elemento } of conclusoes) {
    const instante = data.getTime();
    if (!Number.isFinite(instante) || instante < inicio || instante >= fim.getTime()) continue;
    contagem[elemento] += 1;
    ultima[elemento] = Math.max(ultima[elemento], instante);
    total += 1;
  }
  let lider: ElementoDoDia | null = null;
  for (const elemento of ELEMENTOS) {
    if (contagem[elemento] === 0) continue;
    if (
      lider === null
      || contagem[elemento] > contagem[lider]
      || (contagem[elemento] === contagem[lider] && ultima[elemento] > ultima[lider])
    ) lider = elemento;
  }
  return { elemento: lider, contagem, total };
}

interface HabitoLido {
  readonly elementId: string;
  readonly completions?: readonly { readonly completionDate: Date | string; readonly xpElementId?: string }[];
}
interface AcaoLida {
  readonly elementId: string;
  readonly isCompleted?: boolean;
  readonly completedAt?: Date | string | null;
  readonly completionXp?: { readonly elementId: string };
}

/** A finished trail (quest or Great Work): it carries the bonus it paid, with its element and moment. */
interface ConquistaLida {
  readonly isCompleted?: boolean;
  readonly elementId: string;
  readonly completionBonus?: { readonly elementId: string; readonly completedAt: string };
}
/** Finishing a whole trail weighs like this many ordinary completions in the week's element. */
export const PESO_DE_TRILHA = 3;

const comoElemento = (id: string | undefined): ElementoDoDia | null =>
  id !== undefined && ELEMENTOS_VALIDOS.has(id) ? (id as ElementoDoDia) : null;

/**
 * Everything the person finished, read from the same data the app already
 * keeps: the completions of each cycle and the completed rituals and tasks.
 * Read-only; it never writes or scores anything.
 */
export function conclusoesDoApp(
  habitos: readonly HabitoLido[],
  acoes: readonly AcaoLida[],
  conquistas: readonly ConquistaLida[] = [],
): ConclusaoDoElemento[] {
  const conclusoes: ConclusaoDoElemento[] = [];
  for (const habito of habitos) {
    for (const conclusao of habito.completions ?? []) {
      const elemento = comoElemento(conclusao.xpElementId ?? habito.elementId);
      if (elemento) conclusoes.push({ data: new Date(conclusao.completionDate), elemento });
    }
  }
  for (const acao of acoes) {
    if (!acao.completedAt || acao.isCompleted === false) continue;
    const elemento = comoElemento(acao.completionXp?.elementId ?? acao.elementId);
    if (elemento) conclusoes.push({ data: new Date(acao.completedAt), elemento });
  }
  for (const conquista of conquistas) {
    if (!conquista.isCompleted || !conquista.completionBonus?.completedAt) continue;
    const elemento = comoElemento(conquista.completionBonus.elementId ?? conquista.elementId);
    const data = new Date(conquista.completionBonus.completedAt);
    if (elemento) for (let i = 0; i < PESO_DE_TRILHA; i += 1) conclusoes.push({ data, elemento });
  }
  return conclusoes;
}
