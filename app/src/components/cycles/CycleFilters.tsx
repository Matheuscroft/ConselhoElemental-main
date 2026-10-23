import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { CycleFilters as Filters, CycleStatusFilter } from './cycle-discovery';
import { hasCycleFilters } from './cycle-discovery';
import { ElementIcon } from '@/components/elemental/ArcaneIcon';
import type { ElementId } from '@/types';

export function CycleFilters({ filters, onChange, shown, total }: { filters: Filters; onChange: (filters: Filters) => void; shown: number; total: number }) {
  return <div className="cycle-filters">
    <label className="cycle-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar ciclos e sequências do dia</span><input type="search" value={filters.query} onChange={event => onChange({ ...filters, query: event.target.value })} placeholder="Buscar por nome, descrição ou área" /></label>
    <details className="cycle-filter-options"><summary><SlidersHorizontal size={16} aria-hidden="true" />Filtrar por elemento e estado{(filters.element !== 'all' || filters.status !== 'all') && <span>Filtros ativos</span>}</summary>
    <div className="cycle-filter-row">
      <div className="cycle-elements" role="group" aria-label="Filtrar por elemento">
        <button type="button" aria-pressed={filters.element === 'all'} onClick={() => onChange({ ...filters, element: 'all' })}>Todos</button>
        {(['terra', 'fogo', 'agua', 'ar'] as ElementId[]).map(element => <button type="button" key={element} aria-label={`Filtrar por ${element === 'agua' ? 'Água' : element}`} aria-pressed={filters.element === element} onClick={() => onChange({ ...filters, element })}><ElementIcon element={element} size={18} /><span>{element === 'agua' ? 'Água' : element[0].toUpperCase() + element.slice(1)}</span></button>)}
      </div>
      <label className="cycle-status-filter"><span>Mostrar</span><select value={filters.status} onChange={event => onChange({ ...filters, status: event.target.value as CycleStatusFilter })}><option value="all">Todos os estados</option><option value="pending">Pendentes</option><option value="completed">Concluídos</option></select></label>
    </div>
    </details>
    <div className="cycle-filter-result"><p role="status">{shown} de {total} {total === 1 ? 'item do dia' : 'itens do dia'}</p>{hasCycleFilters(filters) && <button type="button" onClick={() => onChange({ query: '', element: 'all', status: 'all' })}><X size={15} aria-hidden="true" />Limpar filtros</button>}</div>
  </div>;
}
