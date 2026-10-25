import { hasCycleFilters, type CycleFilters as Filters } from './cycle-discovery';
import { CycleFilters } from './CycleFilters';

interface Props {
  title: string;
  filters: Filters;
  onChange: (filters: Filters) => void;
  total: number;
  completed: number;
  shown: number;
  order: 'ordered' | 'pending-first';
  onOrder: (order: 'ordered' | 'pending-first') => void;
}
/** Counts describe visible routine cards, not points or completed leaf activities. */
export function CycleRoutineToolbar({ title, filters, onChange, total, completed, shown, order, onOrder }: Props) {
  const counts = { all: total, pending: total - completed, completed };
  return <div className="cycle-routine-toolbar" id="cycles-today-routine">
    <header><div><h3>{title}</h3><p>{completed} de {total} itens concluídos</p></div><span className="cycle-day-fraction" aria-hidden="true">{completed}<small>/{total}</small></span></header>
    <div className="cycle-day-progress" role="progressbar" aria-label="Itens da rotina concluídos" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={completed}><span style={{ width: `${total ? completed / total * 100 : 0}%` }} /></div>
    <div className="cycle-quick-status" role="group" aria-label="Mostrar ciclos por estado">
      {(['all', 'pending', 'completed'] as const).map(status => <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => onChange({ ...filters, status })}>{status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : 'Feitos'}<span>{counts[status]}</span></button>)}
    </div>
    <CycleFilters filters={filters} onChange={onChange} shown={shown} total={total} showStatus={false}>
    <label className="cycle-order-control"><span>Organizar</span><select value={order} onChange={event => onOrder(event.target.value as Props['order'])}><option value="ordered">Minha ordem</option><option value="pending-first">Pendentes primeiro</option></select></label>
    </CycleFilters>
    {(hasCycleFilters(filters) || order !== 'ordered') && <p className="cycle-order-hint">Para mover itens, limpe os filtros e use Minha ordem.</p>}
  </div>;
}
