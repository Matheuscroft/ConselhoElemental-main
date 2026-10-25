import { useId, useState } from 'react';
import { Search, X } from 'lucide-react';
import { NavigationGroup, RouteShowcase } from './NavigationCards';
import { matchesAreaName } from './navigation';
import { ArcaneIcon } from './ArcaneIcon';
import type { AppRoute, RouteGroup } from '@/lib/app-routes';

const GROUPS: RouteGroup[] = ['Núcleo', 'Tempo e ciclos', 'Treino', 'Domínios'];

export function filterAtlasRoutes(routes: AppRoute[], query: string, group: RouteGroup | null) {
  return routes.filter(route => (!group || route.group === group) && matchesAreaName(`${route.label} ${route.description} ${route.group}`, query));
}

/** All destinations remain discoverable. Filtering changes presentation only. */
export function PageAtlas({ routes, liveStatus }: { routes: AppRoute[]; liveStatus: Record<string, string> }) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<RouteGroup | null>(null);
  const results = filterAtlasRoutes(routes, query, group);
  const filtering = !!query.trim() || !!group;
  const reset = () => { setQuery(''); setGroup(null); };
  return <div className="page-atlas">
    <div className="page-atlas-discovery">
      <div className="page-atlas-search"><Search size={20} aria-hidden="true" /><label className="sr-only" htmlFor={searchId}>Buscar páginas</label><input id={searchId} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você quer fazer?" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca"><X size={18} aria-hidden="true" /></button>}</div>
      <div className="page-atlas-filters" role="group" aria-label="Filtrar páginas por categoria"><button type="button" aria-pressed={!group} onClick={() => setGroup(null)}>Todas</button>{GROUPS.map(item => <button type="button" key={item} aria-pressed={group === item} onClick={() => setGroup(group === item ? null : item)}>{item}</button>)}</div>
      <p className="page-atlas-count" role="status">{results.length} {results.length === 1 ? 'página disponível' : 'páginas disponíveis'}{filtering && <button type="button" onClick={reset}>Limpar filtros</button>}</p>
    </div>
    {results.length === 0 && <div className="page-atlas-empty"><ArcaneIcon name="mapa" size={36} /><h2>Nenhuma página encontrada</h2><p>Tente outro nome ou volte a todas as categorias.</p><button type="button" onClick={reset}>Ver todas as páginas</button></div>}
    <div className="elemental-atlas">{GROUPS.filter(item => results.some(route => route.group === item)).map(item => {
      const groupRoutes = results.filter(route => route.group === item);
      return <NavigationGroup key={item} group={item} count={groupRoutes.length} initiallyOpen={false} reveal={filtering} illustrated><div className="elemental-route-grid">{groupRoutes.map(route => <RouteShowcase key={route.id} route={route} status={liveStatus[route.id]} />)}</div></NavigationGroup>;
    })}</div>
  </div>;
}
