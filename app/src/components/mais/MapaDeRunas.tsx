import { useId, useRef, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DISCOVERY_NAVIGATION_OPTIONS } from '@/components/layout/discovery-scroll';
import { ATLAS_GROUPS, readAtlasFilters, updateAtlasFilters } from '@/components/elemental/atlas-navigation';
import { ArcaneIcon, RouteIcon, type ArcaneIconName } from '@/components/elemental/ArcaneIcon';
import { matchesAreaName } from '@/components/elemental/navigation';
import type { AppRoute, RouteGroup } from '@/lib/app-routes';
import type { ElementId } from '@/types';
import { elementoDaRota } from './constelacoes';
import { Destacado } from './destaque';
import './mapa-runas.css';

/** Same rule as the page atlas: the label, the description and the group answer the search. */
export function filtrarPaginas(routes: AppRoute[], query: string, group: RouteGroup | null) {
  return routes.filter((route) => (!group || route.group === group) && matchesAreaName(`${route.label} ${route.description} ${route.group}`, query));
}

const GRUPOS: Record<RouteGroup, { icone: ArcaneIconName; elemento: ElementId; texto: string }> = {
  'Núcleo': { icone: 'santuario', elemento: 'fogo', texto: 'Suas ações, evolução e conhecimento.' },
  'Tempo e ciclos': { icone: 'ciclo', elemento: 'ar', texto: 'Organize a rotina e acompanhe seus planos.' },
  'Treino': { icone: 'treino', elemento: 'terra', texto: 'Treinos, histórico e cuidado com o corpo.' },
  'Domínios': { icone: 'dominios', elemento: 'agua', texto: 'Explore suas áreas da vida e recompensas.' },
};

/** Past this many, the cascade does not wait any longer: the last runes arrive together. */
const CASCATA_MAXIMA = 10;

/**
 * Every page as a rune, grouped, with the search and the category filter in
 * the screen's one pane of glass. Filters live in the URL (`busca`, `categoria`),
 * as they always did, so the hub can send someone here with a search in hand.
 */
export function MapaDeRunas({ routes, liveStatus }: { routes: AppRoute[]; liveStatus: Record<string, string> }) {
  const idBusca = useId();
  const campoRef = useRef<HTMLInputElement>(null);
  const [params, setParams] = useSearchParams();
  const { query, group } = readAtlasFilters(params.toString());
  const mudarBusca = (valor: string) => setParams(updateAtlasFilters(params.toString(), { query: valor }), DISCOVERY_NAVIGATION_OPTIONS);
  const mudarGrupo = (valor: RouteGroup | null) => setParams(updateAtlasFilters(params.toString(), { group: valor }), DISCOVERY_NAVIGATION_OPTIONS);
  const resultados = filtrarPaginas(routes, query, group);
  const filtrando = !!query.trim() || !!group;
  const limpar = () => {
    setParams(updateAtlasFilters(params.toString(), { query: '', group: null }), DISCOVERY_NAVIGATION_OPTIONS);
    campoRef.current?.focus();
  };

  // The order the runes are drawn in (group by group), which is the order they arrive in.
  const desenhadas = ATLAS_GROUPS.flatMap((item) => resultados.filter((rota) => rota.group === item));
  const ordemDe = (id: string) => Math.min(desenhadas.findIndex((rota) => rota.id === id), CASCATA_MAXIMA);
  return (
    <div className="mapa">
      <div className="cena-vidro mapa-vidro">
        <span className="cena-vidro-luz" aria-hidden="true" />
        <div className="mapa-painel ds-glass-float" data-luz="">
          <div className="mapa-busca">
            <ArcaneIcon name="buscar" size={20} />
            <label className="sr-only" htmlFor={idBusca}>Buscar páginas</label>
            <input
              ref={campoRef}
              id={idBusca}
              type="search"
              value={query}
              autoComplete="off"
              spellCheck={false}
              placeholder="O que você quer fazer?"
              onChange={(evento) => mudarBusca(evento.target.value)}
            />
            {query ? (
              <button type="button" className="mapa-limpar" aria-label="Limpar busca" onClick={() => { mudarBusca(''); campoRef.current?.focus(); }}>
                <ArcaneIcon name="fechar" size={18} />
              </button>
            ) : null}
          </div>
          <div className="mapa-filtros" role="group" aria-label="Filtrar páginas por categoria">
            <button type="button" aria-pressed={!group} onClick={() => mudarGrupo(null)}>Todas</button>
            {ATLAS_GROUPS.map((item) => (
              <button type="button" key={item} aria-pressed={group === item} data-element={GRUPOS[item].elemento} onClick={() => mudarGrupo(group === item ? null : item)}>{item}</button>
            ))}
          </div>
          <p className="mapa-contagem" role="status">
            {resultados.length} {resultados.length === 1 ? 'página disponível' : 'páginas disponíveis'}
            {filtrando ? <button type="button" onClick={limpar}>Limpar filtros</button> : null}
          </p>
        </div>
      </div>

      {resultados.length === 0 ? (
        <div className="mapa-vazio ds-pane">
          <ArcaneIcon name="mapa" size={36} />
          <h2>Nenhuma página encontrada</h2>
          <p>Tente outro nome ou volte a todas as categorias.</p>
          <button type="button" onClick={limpar}>Ver todas as páginas</button>
        </div>
      ) : null}

      <div className="mapa-grupos">
        {ATLAS_GROUPS.filter((item) => resultados.some((rota) => rota.group === item)).map((item) => {
          const visual = GRUPOS[item];
          const daqui = resultados.filter((rota) => rota.group === item);
          return (
            <section key={item} className="mapa-grupo" data-element={visual.elemento} style={{ '--k': ordemDe(daqui[0].id) } as CSSProperties}>
              <header className="mapa-grupo-cabeca">
                <span className="mapa-selo"><ArcaneIcon name={visual.icone} size={28} /></span>
                <div>
                  <h2>{item}</h2>
                  <p>{visual.texto}</p>
                </div>
                <span className="mapa-grupo-conta">{daqui.length}<span className="sr-only"> páginas</span></span>
              </header>
              <ul className="mapa-runas">
                {daqui.map((rota) => {
                  const elemento = elementoDaRota(rota.id) ?? visual.elemento;
                  const estado = liveStatus[rota.id];
                  return (
                    <li key={rota.id} className="mapa-item" style={{ '--k': ordemDe(rota.id) } as CSSProperties}>
                      <Link to={rota.path} className="mapa-runa elemental-press" data-element={elemento} data-luz="">
                        <span className="mapa-runa-selo"><RouteIcon routeId={rota.id} size={28} /></span>
                        <span className="mapa-runa-texto">
                          <span className="mapa-runa-nome"><Destacado texto={rota.label} busca={query} /></span>
                          <span className="mapa-runa-descricao"><Destacado texto={rota.description} busca={query} /></span>
                          {estado ? <span className="mapa-runa-estado">{estado}</span> : null}
                        </span>
                        <ArcaneIcon name="chevron" size={16} className="mapa-runa-seta" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default MapaDeRunas;
