import type { ElementId } from '@/constants';

export const ELEMENT_ORDER: ElementId[] = ['fogo', 'ar', 'agua', 'terra'];
export const SANCTUARY_HOME = '/santuario';
export const PREVIEW_HOME = '/previa-elemental';

export function parseElement(value: string | null | undefined): ElementId | undefined {
  return ELEMENT_ORDER.find((id) => id === value);
}

export const elementHref = (id: ElementId) => `${SANCTUARY_HOME}/elementos/${id}`;

// Old preview bookmarks keep their search/filter without adding a history entry.
export function legacyElementHref(search: string): string | undefined {
  const params = new URLSearchParams(search);
  const id = parseElement(params.get('elemento'));
  if (!id) return undefined;
  params.delete('elemento');
  return `${elementHref(id)}${params.size ? `?${params}` : ''}`;
}

export function areaFilters(search: string | URLSearchParams) {
  const params = new URLSearchParams(search);
  return { query: params.get('busca') ?? '', activeOnly: params.get('areas') === 'ativas' };
}

export function updateAreaFilters(search: URLSearchParams, patch: { query?: string; activeOnly?: boolean }) {
  const next = new URLSearchParams(search);
  if (patch.query !== undefined) {
    if (patch.query) next.set('busca', patch.query);
    else next.delete('busca');
  }
  if (patch.activeOnly !== undefined) {
    if (patch.activeOnly) next.set('areas', 'ativas');
    else next.delete('areas');
  }
  return next;
}

export function matchesAreaName(name: string, query: string) {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  return normalize(name).includes(normalize(query.trim()));
}

export function preserveAreaFilterScroll(previousPath: string | undefined, pathname: string, state: unknown) {
  const id = parseElement(pathname.split('/').at(-1));
  return previousPath === pathname && !!id && pathname === elementHref(id)
    && typeof state === 'object' && state !== null && 'elementalFilter' in state && state.elementalFilter === true;
}

export function filterNavigationRoutes<T extends { id: string; group: string; label: string; description: string }>(routes: readonly T[], query: string): T[] {
  return routes.filter((route) => query.trim()
    ? matchesAreaName(`${route.label} ${route.description} ${route.group}`, query)
    : route.group !== 'Treino' || route.id === 'treinos');
}

/** Redirect existing preview bookmarks without changing their filters. */
export function previewRedirect(pathname: string, search: string): string | undefined {
  if (pathname !== PREVIEW_HOME && !pathname.startsWith(`${PREVIEW_HOME}/elementos/`)) return undefined;
  if (pathname === PREVIEW_HOME) return legacyElementHref(search) ?? `${SANCTUARY_HOME}${search}`;
  return `${SANCTUARY_HOME}${pathname.slice(PREVIEW_HOME.length)}${search}`;
}
