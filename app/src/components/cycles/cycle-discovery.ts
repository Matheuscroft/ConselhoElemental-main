import type { ElementId } from '@/types';

export type CycleStatusFilter = 'all' | 'pending' | 'completed';
export type CycleFilters = { query: string; element: ElementId | 'all'; status: CycleStatusFilter };
export const normalizeCycleSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
export function matchesCycleFilters(item: { text: string; element?: ElementId; completed: boolean }, filters: CycleFilters) {
  const terms = normalizeCycleSearch(filters.query).split(/\s+/).filter(Boolean);
  const text = normalizeCycleSearch(item.text);
  return terms.every(term => text.includes(term))
    && (filters.element === 'all' || item.element === filters.element)
    && (filters.status === 'all' || item.completed === (filters.status === 'completed'));
}
export function hasCycleFilters(filters: CycleFilters) {
  return !!filters.query.trim() || filters.element !== 'all' || filters.status !== 'all';
}
