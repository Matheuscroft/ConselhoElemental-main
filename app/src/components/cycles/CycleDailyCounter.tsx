import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus, Settings2, Undo2 } from 'lucide-react';
import type { Habit, HabitDailyTracking } from '@/types';
import { dailyQuantity } from '@/lib/cycles/daily-tracking';

interface Props {
  habit: Habit;
  date: Date;
  onConfigure: (config: HabitDailyTracking) => void;
  onRecord: () => void;
  onRemove: (id: string) => void;
}
const format = (number: number) => number.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
export function CycleDailyCounter({ habit, date, onConfigure, onRecord, onRemove }: Props) {
  const id = useId();
  const config = habit.dailyTracking;
  const toggleRef = useRef<HTMLButtonElement>(null);
  const recordRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<'toggle' | 'record' | null>(null);
  // Resolve after React mounts the replacement control, without timers or scrolling.
  useLayoutEffect(() => {
    const destination = pendingFocus.current;
    pendingFocus.current = null;
    if (!destination) return;
    const target = destination === 'record' ? recordRef.current ?? toggleRef.current : toggleRef.current;
    target?.focus({ preventScroll: true });
  });
  const [draft, setDraft] = useState(config ?? { target: 1, step: 1, unit: 'repetições' });
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { items, total } = dailyQuantity(habit.dailyEntries ?? [], date, config?.unit ?? 'repetições');
  const perform = (action: () => void, message: string, focus?: 'record') => {
    try { action(); if (focus) pendingFocus.current = focus; setError(''); setNotice(message); }
    catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível salvar.'); }
  };
  return <section className="cycle-daily-counter" aria-label={`Quantidades de ${habit.name}`}>
    {config ? <>
      <header><div><span>Registros de {date.toLocaleDateString('pt-BR')}</span><strong>{format(total)} <small>de {format(config.target)} {config.unit}</small></strong></div>
        <button ref={toggleRef} type="button" aria-label={`Ajustar meta de ${habit.name}`} aria-expanded={editing} aria-controls={`${id}-setup`} onClick={() => { setDraft(config); setError(''); setEditing(!editing); }}><Settings2 size={18} /></button>
      </header>
      <div role="progressbar" aria-label="Quantidade registrada em relação à meta" aria-valuemin={0} aria-valuemax={config.target} aria-valuenow={Math.min(total, config.target)} aria-valuetext={`${format(total)} de ${format(config.target)} ${config.unit}`} className="cycle-quantity-track"><span style={{ transform: `scaleX(${Math.min(1, total / config.target)})` }} /></div>
      <div className="cycle-quantity-actions"><button ref={recordRef} className="elemental-press" type="button" aria-label={`Somar ${format(config.step)} ${config.unit} a ${habit.name}`} onClick={() => perform(onRecord, `Registro confirmado. ${items.length + 1} registros nesta data.`)}><Plus size={18} /><strong>{format(config.step)}</strong><span>Somar ao dia</span></button>
        {total >= config.target && <span><Check size={16} />Meta atingida</span>}</div>
      <p>Registrar não conclui o ciclo nem concede pontos. Você pode adicionar mais, mesmo após concluir.</p>
      {items.length > 0 && <details className="cycle-quantity-history"><summary>{items.length} {items.length === 1 ? 'registro neste dia' : 'registros neste dia'}<ChevronDown size={16} /></summary>
        <ol>{items.map((entry, index) => <li key={entry.id}><span>Registro {index + 1} · {format(entry.quantity)} {entry.unit}</span><button type="button" aria-label={`Desfazer registro ${index + 1} de ${habit.name}`} onClick={() => perform(() => onRemove(entry.id), 'Registro desfeito. A conclusão do ciclo não foi alterada.', 'record')}><Undo2 size={16} />Desfazer</button></li>)}</ol>
      </details>}
    </> : <button ref={toggleRef} className="cycle-counter-enable" type="button" aria-expanded={editing} aria-controls={`${id}-setup`} onClick={() => { setError(''); setEditing(!editing); }}><Plus size={18} /><span><strong>Adicionar contador</strong><small>Some repetições ou quantidades desta atividade</small></span><ChevronDown size={16} /></button>}
    {editing && <form id={`${id}-setup`} className="cycle-quantity-form" onInvalid={event => { const details = (event.target as HTMLElement).closest('details'); if (details) details.open = true; }} onSubmit={event => {
      event.preventDefault();
      try { onConfigure(draft); pendingFocus.current = 'record'; setError(''); setNotice('Contador salvo. Use Somar ao dia para registrar sua atividade.'); setEditing(false); }
      catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível salvar.'); }
    }}>
      <div className="cycle-counter-context"><strong>{habit.name}</strong><p>Um contador para esta atividade. Cada toque soma ao total da data selecionada.</p></div>
      <label htmlFor={`${id}-target`}>Meta diária ({draft.unit || 'unidade'})<input id={`${id}-target`} type="number" inputMode="decimal" min="0.001" max="1000000" step="0.001" required value={draft.target} onChange={event => setDraft({ ...draft, target: Number(event.target.value) })} /></label>
      <details className="cycle-counter-measure" open={config ? true : undefined}>
        <summary>Personalizar unidade e quantidade<ChevronDown size={16} /></summary>
        <label htmlFor={`${id}-unit`}>O que você quer contar?<input id={`${id}-unit`} maxLength={24} required value={draft.unit} disabled={!!habit.dailyEntries?.length} placeholder="Ex.: repetições, páginas, minutos, km" onChange={event => setDraft({ ...draft, unit: event.target.value })} /></label>
        <label htmlFor={`${id}-step`}>Quanto somar a cada toque?<input id={`${id}-step`} type="number" inputMode="decimal" min="0.001" max="1000000" step="0.001" required value={draft.step} onChange={event => setDraft({ ...draft, step: Number(event.target.value) })} /></label>
        {!!habit.dailyEntries?.length && <p>A unidade foi preservada para manter seu histórico consistente.</p>}
      </details>
      <output className="cycle-counter-preview" htmlFor={`${id}-target ${id}-step ${id}-unit`}><Plus size={20} aria-hidden="true" /><span><strong>{format(draft.step)} {draft.unit}</strong><small>por toque · meta de {format(draft.target)} no dia</small></span></output>
      <p>A meta é uma referência: você pode continuar somando além dela. A conclusão do ciclo é separada.</p>
      <footer><button type="button" onClick={() => { pendingFocus.current = 'toggle'; setEditing(false); setError(''); }}>Cancelar</button><button type="submit">{config ? 'Salvar ajustes' : 'Ativar contador'}</button></footer>
    </form>}
    {error && <p role="alert">{error}</p>}
    <div role="status" aria-live="polite">{notice && <span className="cycle-quantity-notice"><Check size={16} />{notice}</span>}</div>
  </section>;
}
