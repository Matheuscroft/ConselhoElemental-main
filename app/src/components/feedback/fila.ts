import type { ConclusaoNova } from '@/lib/progresso/eventos';
import type { ElementoDoDia } from '@/lib/momentos/elemento-do-dia';

/** At most this many notices are on screen at once; the oldest leaves first. */
export const MAX_VISIVEIS = 3;

/** An XP value at or above this counts as a full-strength completion sound. */
export const XP_DE_INTENSIDADE_MAXIMA = 40;

export interface Noticia {
  readonly id: string;
  readonly tipo: 'conclusao' | 'ascensao' | 'resumo';
  readonly nome: string;
  readonly elemento: ElementoDoDia | null;
  readonly xp: number;
  /** Ascension only: 2 = Fluxo, 3 = Domínio. */
  readonly nivel?: 2 | 3;
  /** Summary only: how many completions it stands for. */
  readonly quantidade?: number;
  /** Ascension only: no screen heard it, so offer the way to the frame. */
  readonly semTela?: boolean;
}

/** Sound intensity from XP: min(1, xp / 40), never below 0. */
export const intensidadeDoXp = (xp: number): number =>
  Number.isFinite(xp) ? Math.min(1, Math.max(0, xp / XP_DE_INTENSIDADE_MAXIMA)) : 0;

/**
 * Completions arriving together. Up to MAX_VISIVEIS each gets its own notice;
 * more than that is a burst and becomes one summary with the XP added up.
 */
export function noticiasDeConclusoes(
  conclusoes: readonly ConclusaoNova[],
  novoId: () => string,
  max: number = MAX_VISIVEIS,
): Noticia[] {
  if (conclusoes.length <= max) {
    return conclusoes.map((c) => ({ id: novoId(), tipo: 'conclusao', nome: c.nome, elemento: c.elemento, xp: c.xp }));
  }
  const elementos = new Set(conclusoes.map((c) => c.elemento));
  const unico = elementos.size === 1 ? [...elementos][0] : null;
  return [{
    id: novoId(), tipo: 'resumo', nome: `${conclusoes.length} conclusões`, elemento: unico,
    xp: conclusoes.reduce((soma, c) => soma + c.xp, 0), quantidade: conclusoes.length,
  }];
}

/** Adds notices at the end and drops the oldest so that at most `max` remain. */
export function empilhar(fila: readonly Noticia[], novas: readonly Noticia[], max: number = MAX_VISIVEIS): Noticia[] {
  const todas = [...fila, ...novas];
  return todas.length > max ? todas.slice(todas.length - max) : todas;
}

export const remover = (fila: readonly Noticia[], id: string): Noticia[] => fila.filter((n) => n.id !== id);
