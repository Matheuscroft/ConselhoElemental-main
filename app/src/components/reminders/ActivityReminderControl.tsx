import { useEffect, useId, useRef, useState } from 'react';
import { BellRing, ChevronDown, X } from 'lucide-react';
import { REMINDER_WRITES_RELEASED } from '@/lib/reminders/reminder-release';
import { reminderWorkspaceHref } from '@/lib/reminders/reminder-return';
import type { ActivityReminderDraft, ActivityReminderIdentity, ActivityReminderReview } from '@/lib/reminders/reminder-preparation';
import type { ReminderAction } from '@/lib/reminders/occurrence-reminder';

export default function ActivityReminderControl({ identity, returnTo }: { identity: ActivityReminderIdentity; returnTo: string }) {
  const id = useId();
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [review, setReview] = useState<ActivityReminderReview | null>(null);
  const [time, setTime] = useState(''), [action, setAction] = useState<ReminderAction>('one-hour'), [confirmed, setConfirmed] = useState(false);
  const generation = useRef(0), working = useRef(false), alive = useRef(true);
  useEffect(() => {
    const token = generation;
    alive.current = true;
    return () => { token.current++; alive.current = false; };
  }, []);
  async function inspect() {
    if (!REMINDER_WRITES_RELEASED || working.current) return;
    const token = ++generation.current, current = () => alive.current && generation.current === token;
    working.current = true; setOpen(true); setBusy(true); setError(''); setReview(null); setConfirmed(false);
    try {
      const { reviewLiveActivityReminder } = await import('@/lib/reminders/activity-reminder-adapter');
      if (!current()) return;
      const next = reviewLiveActivityReminder(identity, current);
      if (current()) setReview(next);
    } catch (reason) {
      if (current()) setError(reason instanceof Error ? reason.message : 'Não foi possível conferir esta atividade. Tente novamente.');
    } finally { working.current = false; if (alive.current) setBusy(false); }
  }
  async function prepare() {
    if (!REMINDER_WRITES_RELEASED || working.current || !review || !confirmed) return;
    const selected = review, token = ++generation.current, current = () => alive.current && generation.current === token;
    const draft: ActivityReminderDraft = selected.existing ? { kind: 'command', action } : { kind: 'configure', time };
    working.current = true; setBusy(true); setError(''); setConfirmed(false);
    try {
      const { prepareLiveActivityReminder } = await import('@/lib/reminders/activity-reminder-adapter');
      if (!current()) return;
      const href = await prepareLiveActivityReminder(selected, draft, returnTo, true, current);
      if (current()) window.location.assign(href);
    } catch (reason) {
      if (current()) setError(reason instanceof Error ? reason.message : 'Não foi possível preparar o aviso. Seu preenchimento foi preservado.');
    } finally { working.current = false; if (alive.current) setBusy(false); }
  }
  if (!REMINDER_WRITES_RELEASED) return null;
  return <section className="temporal-reminder" aria-label="Aviso desta atividade">
    <button type="button" className="temporal-reminder-toggle" aria-expanded={open} aria-controls={`${id}-panel`} disabled={busy} onClick={() => {
      if (open) { generation.current++; setOpen(false); setConfirmed(false); } else void inspect();
    }}><BellRing size={18} aria-hidden="true" />Aviso da atividade<ChevronDown size={16} aria-hidden="true" /></button>
    {open && <div id={`${id}-panel`} className="temporal-reminder-panel" aria-busy={busy}>
      <div className="temporal-reminder-heading"><h4>{review?.title ?? 'Confira o aviso'}</h4><button type="button" aria-label="Fechar configuração do aviso" disabled={busy} onClick={() => { generation.current++; setOpen(false); setConfirmed(false); }}><X size={18} aria-hidden="true" /></button></div>
      <p>{identity.day.split('-').reverse().join('/')} · Um aviso não conclui a atividade.</p>
      <p role="status" aria-live="polite">{busy ? 'Preparando a conferência…' : ''}</p>
      {error && <><p role="alert">{error}</p><button type="button" disabled={busy} onClick={() => void inspect()}>Conferir atividade novamente</button><a href={reminderWorkspaceHref(returnTo)}>Conferir alteração pendente nesta aba</a></>}
      {review && (review.existing?.status === 'dismissed' ? <p>O aviso desta ocorrência foi dispensado. A atividade continua na sua agenda.</p> : <form onSubmit={event => { event.preventDefault(); void prepare(); }}>
        {review.existing ? <>
          <p>Aviso atual: <time dateTime={review.existing.dueAt}>{new Date(review.existing.dueAt).toLocaleString('pt-BR')}</time></p>
          <label htmlFor={`${id}-action`}>O que fazer com o aviso</label><select id={`${id}-action`} value={action} disabled={busy} onChange={event => { setAction(event.target.value as ReminderAction); setConfirmed(false); }}>
            <option value="one-hour">Adiar por uma hora</option><option value="tomorrow-nine">Amanhã às 9h</option><option value="tomorrow-same-time">Amanhã no mesmo horário</option><option value="dismiss">Dispensar este aviso</option>
          </select>
        </> : <><label htmlFor={`${id}-time`}>Horário do aviso</label><input id={`${id}-time`} type="time" required value={time} disabled={busy} onChange={event => { setTime(event.target.value); setConfirmed(false); }} /></>}
        <p>Ao continuar, esta tela será pausada para conferir o aviso. Depois você volta ao mesmo dia da agenda.</p>
        <label className="temporal-reminder-consent"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} />Quero abrir a conferência antes de salvar.</label>
        <button type="submit" disabled={busy || !confirmed || (!review.existing && !time)}>Continuar para conferência</button>
      </form>)}
    </div>}
  </section>;
}
