import type { ReactNode } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { CycleFilters as Filters, CycleStatusFilter } from './cycle-discovery';
import { hasCycleFilters } from './cycle-discovery';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';

export function CycleFilters({ filters, onChange, shown, total, showStatus = true, children }: { filters: Filters; onChange: (filters: Filters) => void; shown: number; total: number; showStatus?: boolean; children?: ReactNode }) {
  return <div className="cycle-filters">
    <label className="cycle-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar ciclos e sequências do dia</span><input type="search" value={filters.query} onChange={event => onChange({ ...filters, query: event.target.value })} placeholder="Buscar na rotina" /></label>
    <details className="cycle-filter-options"><summary aria-label={children ? 'Filtrar por elemento e organizar rotina' : undefined}>
      <SlidersHorizontal size={18} aria-hidden="true" />
      <span className={children ? 'sr-only' : undefined}>{children ? 'Filtrar e organizar' : `Elemento${showStatus ? ' e estado' : ''}`}</span>
      {(filters.element !== 'all' || (showStatus && filters.status !== 'all')) && <span className={children ? 'cycle-filter-indicator' : undefined}>{children ? <span className="sr-only">Filtros ativos</span> : 'Filtros ativos'}</span>}
    </summary>
    <div className="cycle-filter-row">
      <div className="cycle-elements" role="group" aria-label="Filtrar por elemento">
        <button type="button" aria-pressed={filters.element === 'all'} onClick={() => onChange({ ...filters, element: 'all' })}>Todos</button>
        {(['terra', 'fogo', 'agua', 'ar'] as ElementId[]).map(element => <button type="button" key={element} aria-label={`Filtrar por ${element === 'agua' ? 'Água' : element}`} aria-pressed={filters.element === element} onClick={() => onChange({ ...filters, element })}><ElementIcon element={element} size={18} /><span>{element === 'agua' ? 'Água' : element[0].toUpperCase() + element.slice(1)}</span></button>)}
      </div>
      {showStatus && <label className="cycle-status-filter"><span>Mostrar</span><select value={filters.status} onChange={event => onChange({ ...filters, status: event.target.value as CycleStatusFilter })}><option value="all">Todos os estados</option><option value="pending">Pendentes</option><option value="completed">Concluídos</option></select></label>}
      {children}
    </div>
    </details>
    <div className="cycle-filter-result"><p role="status">{shown} de {total} {total === 1 ? 'item do dia' : 'itens do dia'}</p>{hasCycleFilters(filters) && <button type="button" onClick={() => onChange({ query: '', element: 'all', status: 'all' })}><X size={15} aria-hidden="true" />Limpar filtros</button>}</div>
  </div>;
}
