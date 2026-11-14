import { hasCycleFilters, type CycleFilters as Filters } from './cycle-discovery';
import { CycleFilters } from './CycleFilters';
import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import type { CSSProperties } from 'react';
import { CycleSigil, type ElementoDoCiclo } from './CycleSigil';

const LIMITE_TRILHA = 14;

interface Props {
  title: string;
  filters: Filters;
  onChange: (filters: Filters) => void;
  total: number;
  completed: number;
  shown: number;
  order: 'ordered' | 'pending-first';
  onOrder: (order: 'ordered' | 'pending-first') => void;
  agendaHref?: string;
  selos?: readonly { element: ElementoDoCiclo; done: boolean }[];
}
/** Counts describe visible routine cards, not points or completed leaf activities. */
export function CycleRoutineToolbar({ title, filters, onChange, total, completed, shown, order, onOrder, agendaHref, selos }: Props) {
  const counts = { all: total, pending: total - completed, completed };
  return <div className="cycle-routine-toolbar" id="cycles-today-routine">
    <header><div><h3>{title}</h3><p className="sr-only">{completed} de {total} itens concluídos</p></div><span className="cycle-day-fraction" aria-hidden="true">{completed}/{total}</span></header>
    {agendaHref && <Link className="cycle-plan-link inline-flex min-h-12 items-center gap-2 text-sm text-mystic-gold" to={agendaHref}><CalendarDays size={18} aria-hidden="true" />Planejar esta semana</Link>}
    {selos ? <>
      <div className="sr-only" role="progressbar" aria-label="Itens da rotina concluídos" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={completed} />
      {selos.length > LIMITE_TRILHA
        ? <div className="cycle-seal-thread" aria-hidden="true" style={{ '--cyc-feito': `${total ? completed / total * 100 : 0}%` } as CSSProperties} />
        : <ol className="cycle-seal-trail" aria-hidden="true">{selos.map((selo, index) => <li key={index} data-element={selo.element} data-done={selo.done}><CycleSigil size="trail" element={selo.element} filled={selo.done} /></li>)}</ol>}
    </> : <div className="cycle-day-progress" role="progressbar" aria-label="Itens da rotina concluídos" aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={completed}><span style={{ width: `${total ? completed / total * 100 : 0}%` }} /></div>}
    <div className="cycle-quick-status" role="group" aria-label="Mostrar ciclos por estado">
      {(['all', 'pending', 'completed'] as const).map(status => <button key={status} type="button" aria-pressed={filters.status === status} onClick={() => onChange({ ...filters, status })}>{status === 'all' ? 'Todos' : status === 'pending' ? 'Pendentes' : 'Feitos'}<span>{counts[status]}</span></button>)}
    </div>
    <CycleFilters filters={filters} onChange={onChange} shown={shown} total={total} showStatus={false}>
    <label className="cycle-order-control"><span>Organizar</span><select value={order} onChange={event => onOrder(event.target.value as Props['order'])}><option value="ordered">Minha ordem</option><option value="pending-first">Pendentes primeiro</option></select></label>
    </CycleFilters>
    {(hasCycleFilters(filters) || order !== 'ordered') && <p className="cycle-order-hint">Para mover itens, limpe os filtros e use Minha ordem.</p>}
  </div>;
}
