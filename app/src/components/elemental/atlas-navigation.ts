import type { RouteGroup } from '@/lib/app-routes';

export const ATLAS_GROUPS: RouteGroup[] = ['Núcleo', 'Tempo e ciclos', 'Treino', 'Domínios'];
export interface AtlasFilters { query: string; group: RouteGroup | null }

/** URL state belongs to navigation, not the user's persisted activity data. */
export function readAtlasFilters(search: string): AtlasFilters {
  const params = new URLSearchParams(search);
  const category = params.get('categoria');
  return { query: params.get('busca') ?? '', group: ATLAS_GROUPS.find(group => group === category) ?? null };
}

export function updateAtlasFilters(search: string, patch: Partial<AtlasFilters>) {
  const params = new URLSearchParams(search);
  const filters = { ...readAtlasFilters(search), ...patch };
  if (filters.query) params.set('busca', filters.query); else params.delete('busca');
  if (filters.group && ATLAS_GROUPS.includes(filters.group)) params.set('categoria', filters.group); else params.delete('categoria');
  return params;
}
