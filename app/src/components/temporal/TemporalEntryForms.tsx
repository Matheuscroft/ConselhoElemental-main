import { useId, useState, type FormEvent } from 'react';
import type { Commitment, CommitmentRecurrence } from '@/types';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';

export type AnnualFormInput = { title: string; notes: string; category: 'task' | 'birthday'; date: Date; untilDate: Date | null };
export type CommitmentFormInput = { title: string; date: Date; recurrence: CommitmentRecurrence; untilDate?: string };
const RECURRENCES: Record<CommitmentRecurrence, string> = { ONCE: 'Uma vez', DAILY: 'Todos os dias', WEEKLY: 'Toda semana', MONTHLY: 'Todo mês', YEARLY: 'Todo ano' };

function parseDates(dateText: string, untilText: string) {
  const date = dateFromInput(dateText);
  if (!date) throw new Error('Escolha uma data válida para começar.');
  const untilDate = dateFromInput(untilText);
  if (untilDate && untilDate < date) throw new Error('A data final deve ser igual ou posterior ao início.');
  return { date, untilDate };
}

/** Presentation only: the caller keeps ownership of existing store commands. */
export function AnnualEntryForm({ initialDate, onSave, onCancel }: { initialDate: Date; onSave: (input: AnnualFormInput) => void; onCancel: () => void }) {
  const id = useId();
  const [category, setCategory] = useState<'task' | 'birthday'>('task');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(() => dateToInput(initialDate));
  const [until, setUntil] = useState('');
  const [limited, setLimited] = useState(false);
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      if (!title.trim()) throw new Error('Dê um nome à entrada anual.');
      if (limited && !until) throw new Error('Escolha até quando a entrada deve se repetir.');
      onSave({ title: title.trim(), notes, category, ...parseDates(date, limited ? until : '') });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar. Seus campos foram mantidos.'); }
  }
  return <form className="temporal-entry-form" onSubmit={submit}>
    <fieldset className="temporal-entry-types"><legend>O que deseja guardar?</legend>
      {(['task', 'birthday'] as const).map(value => <label key={value}><input type="radio" name={`${id}-category`} value={value} checked={category === value} onChange={() => setCategory(value)} /><span>{value === 'task' ? 'Ciclo anual' : 'Aniversário'}</span></label>)}
    </fieldset>
    <label htmlFor={`${id}-title`}>{category === 'birthday' ? 'Nome da pessoa' : 'Nome do ciclo anual'}<input id={`${id}-title`} name="title" value={title} onChange={e => setTitle(e.target.value)} required autoComplete="off" placeholder={category === 'birthday' ? 'Quem você quer lembrar?' : 'Ex.: Revisar meus objetivos'} /></label>
    <label htmlFor={`${id}-date`}>Primeira data<input id={`${id}-date`} name="date" type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
    <p id={`${id}-repeat`}>Repete uma vez por ano nesta data. Datas inexistentes, como 29 de fevereiro em anos comuns, não são antecipadas.</p>
    <label className="temporal-entry-check"><input type="checkbox" checked={limited} onChange={e => setLimited(e.target.checked)} aria-controls={`${id}-until-panel`} />Definir uma data final</label>
    {limited && <label id={`${id}-until-panel`} htmlFor={`${id}-until`}>Repetir até (inclusive)<input id={`${id}-until`} name="until" type="date" required min={date || undefined} value={until} onChange={e => setUntil(e.target.value)} /></label>}
    <label htmlFor={`${id}-notes`}>Notas (opcional)<textarea id={`${id}-notes`} name="notes" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="O que você quer lembrar nesta data?" /></label>
    <p>{category === 'birthday' ? 'Cria um lembrete na agenda, sem conclusão ou XP automático.' : 'Cria um Ciclo anual. A conclusão e as recompensas seguem o fluxo normal em Ciclos.'}</p>
    {error && <p role="alert" className="temporal-entry-error">{error}</p>}
    <div className="temporal-entry-actions"><button type="button" onClick={onCancel}>Cancelar</button><button type="submit" className="temporal-action">Criar entrada anual</button></div>
  </form>;
}

export function CommitmentForm({ initial, initialDate, onSave, onCancel }: { initial?: Commitment; initialDate: Date; onSave: (input: CommitmentFormInput) => void; onCancel: () => void }) {
  const id = useId();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [date, setDate] = useState(() => dateToInput(initial?.date ?? initialDate));
  const [recurrence, setRecurrence] = useState<CommitmentRecurrence>(initial?.recurrence ?? 'ONCE');
  const [until, setUntil] = useState(initial?.untilDate ?? '');
  const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      if (!title.trim()) throw new Error('Dê um nome ao compromisso.');
      const dates = parseDates(date, recurrence === 'ONCE' ? '' : until);
      onSave({ title: title.trim(), date: dates.date, recurrence, untilDate: dates.untilDate ? dateToInput(dates.untilDate) : undefined });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar. Seus campos foram mantidos.'); }
  }
  return <form className="temporal-entry-form" onSubmit={submit}>
    <label htmlFor={`${id}-title`}>Nome do compromisso<input id={`${id}-title`} name="title" required value={title} onChange={e => setTitle(e.target.value)} autoComplete="off" placeholder="Ex.: Consulta médica" /></label>
    <label htmlFor={`${id}-date`}>Data inicial<input id={`${id}-date`} name="date" type="date" required value={date} onChange={e => setDate(e.target.value)} /></label>
    <label htmlFor={`${id}-recurrence`}>Repetição<select id={`${id}-recurrence`} name="recurrence" value={recurrence} onChange={e => setRecurrence(e.target.value as CommitmentRecurrence)}>{Object.entries(RECURRENCES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {recurrence !== 'ONCE' && <label htmlFor={`${id}-until`}>Repetir até (opcional)<input id={`${id}-until`} name="until" type="date" min={date || undefined} value={until} onChange={e => setUntil(e.target.value)} /></label>}
    <p>Este compromisso aparece na agenda. Ele não conclui atividades nem gera XP automaticamente.</p>
    {error && <p role="alert" className="temporal-entry-error">{error}</p>}
    <div className="temporal-entry-actions"><button type="button" onClick={onCancel}>Cancelar</button><button type="submit" className="temporal-action">{initial ? 'Salvar alterações' : 'Adicionar compromisso'}</button></div>
  </form>;
}
