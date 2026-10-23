import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { monthHref } from './celestial/month-navigation';

export function MonthShowcase({ date, completed, commitments, score, current }: { date: Date; completed: number; commitments: number; score: number; current: boolean }) {
  const label = date.toLocaleDateString('pt-BR', { month: 'long' });
  return <details className="elemental-showcase temporal-month-showcase" data-current={current}>
    <summary><span className="elemental-showcase-art" aria-hidden="true"><span>{String(date.getMonth() + 1).padStart(2, '0')}</span></span><span className="elemental-showcase-heading"><small>{current ? 'Mês atual' : date.getFullYear()}</small><strong>{label}</strong><span>{completed} concluídos · {score.toLocaleString('pt-BR')} pontos</span></span><ChevronDown className="elemental-showcase-chevron" size={18} aria-hidden="true" /></summary>
    <div className="elemental-showcase-content"><p>{commitments > 0 ? `${commitments} compromissos neste mês.` : 'Sem compromissos registrados para este mês.'}</p><Link className="temporal-month-open" to={monthHref(date)}>Abrir {label}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
  </details>;
}
