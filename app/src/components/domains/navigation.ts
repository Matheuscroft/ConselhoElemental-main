import type { ElementId } from '@/types';

export interface DomainFilters { element: ElementId | null; mode: 'active' | 'inactive'; query: string; expanded?: ElementId | null }
const elements: ElementId[] = ['terra', 'fogo', 'agua', 'ar'];
/** UI-only URL state. Accept known fields; never accept a return URL from router state. */
export function readDomainFilters(search: string): DomainFilters {
  const params = new URLSearchParams(search);
  const value = params.get('elemento');
  const group = params.get('grupo');
  return { element: elements.includes(value as ElementId) ? value as ElementId : null, mode: params.get('vinculo') === 'inactive' ? 'inactive' : 'active', query: params.get('q') ?? '', ...(elements.includes(group as ElementId) ? { expanded: group as ElementId } : {}) };
}
export function domainFilterSearch(filters: DomainFilters): string {
  const params = new URLSearchParams();
  if (filters.element) params.set('elemento', filters.element);
  if (filters.mode === 'inactive') params.set('vinculo', filters.mode);
  if (filters.query) params.set('q', filters.query);
  if (filters.expanded && elements.includes(filters.expanded)) params.set('grupo', filters.expanded);
  return params.toString();
}
export function domainReturnHref(search: unknown): string {
  const query = domainFilterSearch(readDomainFilters(typeof search === 'string' ? search : ''));
  return `/dominios${query ? `?${query}` : ''}#domains-areas-heading`;
}

export function focusDomainSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}
