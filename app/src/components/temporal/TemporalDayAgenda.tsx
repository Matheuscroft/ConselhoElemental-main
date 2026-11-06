import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Check, ChevronDown } from 'lucide-react';
import type { TemporalCommitment, TemporalEvent } from '@/lib/temporal/selectors';
import { TemporalReminderControl } from '@/components/reminders/TemporalReminderControl';
import { dateToInput } from '@/lib/temporal/recurrence';

const labels: Record<TemporalCommitment['sourceType'], string> = {
  task: 'Ritual', habit: 'Ciclo', sequence: 'Sequência', project: 'Grande Obra', quest: 'Jornada',
  mission: 'Missão', commitment: 'Lembrete', google: 'Google Agenda',
};
export function temporalActivityHref(item: Pick<TemporalCommitment, 'sourceType' | 'sourceId' | 'date'>): string | null {
  if (item.sourceType === 'task') return `/rituais?${new URLSearchParams({ view: 'lista', atividade: item.sourceId })}`;
  if (item.sourceType === 'habit') return `/ciclos?${new URLSearchParams({ atividade: item.sourceId, data: dateToInput(item.date) })}`;
  if (item.sourceType === 'sequence') return `/ciclos?${new URLSearchParams({ data: dateToInput(item.date) })}`;
  if (item.sourceType === 'project' || item.sourceType === 'quest') return `/rituais?${new URLSearchParams({ trilha: `${item.sourceType}:${item.sourceId}` })}`;
  if (item.sourceType === 'mission') return '/grandes-obras';
  return null;
}

/** Completion is supplied by real history, never inferred from a planning count. */
export function TemporalDayAgenda({ date, events, commitments, returnTo }: {
  date: Date; events: TemporalEvent[]; commitments: TemporalCommitment[]; returnTo: string;
}) {
  const id = useId();
  const done = new Set(events.map(event => `${event.sourceType}:${event.sourceId}`));
  const agenda = commitments.filter(item => !done.has(`${item.sourceType}:${item.sourceId}`));
  const linkState = { temporalReturn: returnTo };
  return <div className="temporal-day-agenda">
    <section aria-labelledby={`${id}-agenda`}>
      <div className="temporal-agenda-heading"><h3 id={`${id}-agenda`}><CalendarDays size={19} aria-hidden="true" />Na agenda</h3><span>{agenda.length} {agenda.length === 1 ? 'item' : 'itens'}</span></div>
      {agenda.length ? <ul className="temporal-agenda-list">{agenda.map(item => {
        const href = temporalActivityHref(item);
        const contents = <><span><strong>{item.title}</strong><small>{labels[item.sourceType]}{!href ? ' · compromisso sem conclusão automática' : ''}</small></span>{href && <ArrowUpRight size={20} aria-hidden="true" />}</>;
        return <li key={item.id}>{href ? <Link to={href} state={linkState} aria-label={`${item.sourceType === 'sequence' ? 'Ver rotina de' : 'Abrir'} ${item.title}`}>{contents}</Link> : <div>{contents}</div>}<TemporalReminderControl item={item} returnTo={returnTo} /></li>;
      })}</ul> : <p className="temporal-agenda-empty">Sem itens pendentes na agenda desta data. Você pode conferir os registros abaixo ou organizar outra atividade.</p>}
      <Link className="temporal-agenda-routine" to={`/ciclos?${new URLSearchParams({ data: dateToInput(date) })}`} state={linkState}>Abrir rotina deste dia<ArrowUpRight size={17} aria-hidden="true" /></Link>
    </section>
    {events.length > 0 && <details className="temporal-day-history"><summary><span><Check size={18} aria-hidden="true" />{events.length} {events.length === 1 ? 'registro de conclusão' : 'registros de conclusão'}</span><ChevronDown size={18} aria-hidden="true" /></summary>
      <ul className="temporal-agenda-list">{events.map(event => <li key={event.id}><div><span><strong>{event.title}</strong><small>{event.sourceType === 'task' ? 'Ritual' : 'Ciclo'} · {event.score.toLocaleString('pt-BR')} pontos registrados</small></span><Check size={18} aria-hidden="true" /></div></li>)}</ul>
    </details>}
  </div>;
}
