import { useId, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { dateFromInput, dateToInput } from '@/lib/temporal/recurrence';

/** View-only selection; the parent retains its existing date/window callbacks. */
export function CycleCalendarNavigation({ selectedDate, onSelect, onPrevious, onNext, onToday }: {
  selectedDate: Date; onSelect: (date: Date) => void; onPrevious: () => void; onNext: () => void; onToday: () => void;
}) {
  const id = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(''), [error, setError] = useState('');
  function changeOpen(value: boolean) {
    if (value) { setDraft(dateToInput(selectedDate)); setError(''); }
    setOpen(value);
  }
  function choose(date: Date | undefined) {
    if (!date) return;
    onSelect(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
    setOpen(false);
  }
  return <>
    <div className="cycle-date-navigation">
      <button type="button" className="cycle-date-arrow" aria-label="Mostrar sete dias anteriores" onClick={onPrevious}><ChevronLeft size={20} aria-hidden="true" /></button>
      <button type="button" ref={trigger} className="cycle-date-selected" aria-controls={`${id}-calendar`} aria-haspopup="dialog" aria-expanded={open} onClick={() => changeOpen(true)}>
        <span>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</span>
        <strong>{selectedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
        <small><CalendarDays size={14} aria-hidden="true" />Escolher outra data</small>
      </button>
      <button type="button" className="cycle-date-arrow" aria-label="Mostrar próximos sete dias" onClick={onNext}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>
    <div className="cycle-date-shortcuts"><span>Toque em um dia para ver sua rotina.</span><button type="button" onClick={onToday}>Voltar para hoje</button></div>
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent id={`${id}-calendar`} className="cycle-dialog cycle-calendar-dialog" onCloseAutoFocus={event => { event.preventDefault(); trigger.current?.focus({ preventScroll: true }); }}>
        <DialogHeader><DialogTitle>Escolha seu dia</DialogTitle><DialogDescription>Consulte a rotina de outra data. A seleção não conclui nem altera atividades.</DialogDescription></DialogHeader>
        <Calendar className="cycle-month-picker" mode="single" locale={ptBR} defaultMonth={selectedDate} selected={selectedDate} onSelect={choose} captionLayout="label" />
        <form className="cycle-date-jump" onSubmit={event => {
          event.preventDefault();
          let date: Date | null = null;
          try { date = dateFromInput(draft); } catch { /* Keep the field for correction. */ }
          if (!date) { setError('Informe uma data válida.'); return; }
          choose(date);
        }}>
          <label htmlFor={`${id}-date`}>Ir direto à data</label>
          <div><input id={`${id}-date`} type="date" required value={draft} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={event => { setDraft(event.target.value); setError(''); }} /><button type="submit">Abrir dia</button></div>
          {error && <p id={`${id}-error`} role="alert">{error}</p>}
        </form>
        <footer className="cycle-date-footer"><button type="button" onClick={() => { onToday(); setOpen(false); }}>Ir para hoje</button><button type="button" onClick={() => setOpen(false)}>Cancelar</button></footer>
      </DialogContent>
    </Dialog>
  </>;
}
