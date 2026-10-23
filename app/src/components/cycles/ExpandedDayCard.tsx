import type { Ref } from 'react';
import { ArcaneIcon } from '@/components/elemental/ArcaneIcon';

/** Date selection only. Completion values are supplied by the existing routine. */
export function ExpandedDayCard({ date, selected, today, completed, total, onSelect, buttonRef, preview = [] }: {
  date: Date; selected: boolean; today: boolean; completed: number; total: number;
  preview?: string[];
  onSelect: () => void; buttonRef?: Ref<HTMLButtonElement>;
}) {
  const detailId = `cycle-day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return <button type="button" ref={buttonRef} className="cycle-day-card"
    aria-pressed={selected} aria-expanded={selected} aria-controls={selected ? detailId : undefined} aria-current={today ? 'date' : undefined}
    aria-label={`${date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}${today ? ', hoje' : ''}`}
    onClick={onSelect}>
    <span className="cycle-day-orbit" aria-hidden="true"><i /><i /><ArcaneIcon name="ciclo" size={52} /></span>
    <span className="cycle-day-weekday">{date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
    <strong className="cycle-day-number">{date.getDate().toString().padStart(2, '0')}</strong>
    <span className="cycle-day-month">{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
    <span className="cycle-day-today">{today ? 'Hoje' : '\u00a0'}</span>
    {selected && <span className="cycle-day-detail" id={detailId}><span>Seu dia em foco</span><strong>{total ? `${completed}/${total} ciclos` : 'Sem ciclos'}</strong>{preview.length > 0 && <span className="cycle-day-preview">{preview.map((name, index) => <span key={index}>{name}</span>)}</span>}</span>}
  </button>;
}
