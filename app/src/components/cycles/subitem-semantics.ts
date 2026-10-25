import type { SemanticType } from '@/types';

export type SubitemKind = 'valuable' | 'structural' | 'text';
/** Compatibility at the view boundary. Never mutates the stored semantic type. */
export function subitemKind(item: { semanticType?: SemanticType | null; executionType?: SemanticType | null }): SubitemKind {
  switch (item.semanticType ?? item.executionType) {
    case 'NOTE': case 'text': return 'text';
    case 'VALUELESS': case 'structural': return 'structural';
    default: return 'valuable';
  }
}

export function summarizeSubitems<T extends { semanticType?: SemanticType | null; executionType?: SemanticType | null }>(items: readonly T[], isCompleted: (item: T) => boolean) {
  const actionable = items.filter(item => subitemKind(item) !== 'text');
  return { actionableCount: actionable.length, completedCount: actionable.filter(isCompleted).length, noteCount: items.length - actionable.length };
}
