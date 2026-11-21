import { useId, type CSSProperties } from 'react';
import type { RecurrenceConfig, RecurrenceType } from '@/types';
import { defaultRecurrenceConfig } from '@/lib/temporal/recurrence';
import './recurrence-editor.css';

export interface RecurrenceEditorValue { type: RecurrenceType; config: RecurrenceConfig }
const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const TIPOS: ReadonlyArray<{ type: RecurrenceType; rotulo: string }> = [
  { type: 'DAILY', rotulo: 'Diário' }, { type: 'WEEKLY', rotulo: 'Semanal' }, { type: 'MONTHLY', rotulo: 'Mensal' }, { type: 'YEARLY', rotulo: 'Anual' },
];
const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const control = 'min-h-12 w-full rounded-xl border border-white/20 bg-void p-3 text-base text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mystic-gold';

/** Edits only when the user acts. Opening a legacy record does not normalize it. */
export function RecurrenceEditor({ value, onChange, referenceDate = new Date(), disabled = false }: {
  value: RecurrenceEditorValue;
  onChange: (next: RecurrenceEditorValue) => void;
  referenceDate?: Date;
  disabled?: boolean;
}) {
  const id = useId();
  const monthly = value.type === 'MONTHLY';
  const yearly = value.type === 'YEARLY';
  const days = monthly ? value.config.daysOfMonth : value.config.daysOfWeek;
  const changeDays = (day: number) => {
    const next = days?.includes(day) ? days.filter(item => item !== day) : [...(days ?? []), day].sort((a, b) => a - b);
    onChange({ ...value, config: { ...value.config, [monthly ? 'daysOfMonth' : 'daysOfWeek']: next } });
  };
  const day = value.config.day ?? referenceDate.getDate();
  const month = value.config.month ?? referenceDate.getMonth() + 1;
  return <fieldset disabled={disabled} className="space-y-3 min-w-0">
    <legend className="rec-titulo">Agenda do ciclo</legend>
    <div className="rec-campo">
      <span id={`${id}-type`} className="rec-rotulo">Quando repetir</span>
      <div role="radiogroup" aria-labelledby={`${id}-type`} className="rec-segmentos" style={{ '--rec-i': Math.max(0, TIPOS.findIndex(item => item.type === value.type)) } as CSSProperties}>
        <span className="rec-pilula" aria-hidden="true" />
        {TIPOS.map(item => <button key={item.type} type="button" role="radio" aria-checked={value.type === item.type} className="rec-segmento" onClick={() => {
          if (item.type === value.type) return;
          onChange({ type: item.type, config: { ...defaultRecurrenceConfig(item.type, referenceDate), ...(value.config.until ? { until: value.config.until } : {}) } });
        }}>{item.rotulo}</button>)}
      </div>
    </div>
    {yearly ? <div className="grid grid-cols-2 gap-3">
      <label className="space-y-2" htmlFor={`${id}-month`}><span className="rec-rotulo">Mês</span><select id={`${id}-month`} className={control} value={month} onChange={event => onChange({ ...value, config: { ...value.config, month: Number(event.target.value), day } })}>
        {months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
      </select></label>
      <label className="space-y-2" htmlFor={`${id}-day`}><span className="rec-rotulo">Dia</span><input id={`${id}-day`} className={control} type="number" inputMode="numeric" min={1} max={31} value={day} onChange={event => onChange({ ...value, config: { ...value.config, month, day: Number(event.target.value) } })} /></label>
    </div> : <fieldset className="rec-dias"><legend className="rec-rotulo">{monthly ? 'Dias do mês' : 'Dias da semana'}</legend>
      <div className="rec-dias-grade" data-modo={monthly ? 'mes' : 'semana'}>
        {(monthly ? Array.from({ length: 31 }, (_, index) => index + 1) : [0, 1, 2, 3, 4, 5, 6]).map(day => <button
          key={day} type="button" aria-label={monthly ? `Dia ${day}` : names[day]} aria-pressed={days?.includes(day) ?? false}
          onClick={() => changeDays(day)} className="rec-dia">
          {monthly ? day : names[day].slice(0, 3)}
        </button>)}
      </div>
    </fieldset>}
    <label htmlFor={`${id}-until`} className="block space-y-2"><span className="rec-rotulo">Repetir até (opcional)</span>
      <input id={`${id}-until`} type="date" className={control} value={value.config.until ?? ''}
        onChange={event => { const config = { ...value.config }; if (event.target.value) config.until = event.target.value; else delete config.until; onChange({ ...value, config }); }} />
    </label>
    {disabled ? <p className="text-sm text-white/60">A agenda é definida no ciclo principal.</p>
      : <p className="text-sm text-white/60">{yearly ? `Uma vez por ano, em ${day}/${month}. ` : monthly ? 'Repete nos dias do mês escolhidos. ' : 'Repete nos dias da semana escolhidos. '}{(monthly || yearly) && 'Datas inexistentes são puladas, sem antecipação. '}O histórico de conclusões é preservado.</p>}
    {!yearly && !days && <p className="text-sm text-mystic-gold">Agenda anterior sem dias definidos: aparece todos os dias. Escolha os dias para ajustar.</p>}
    {yearly && (value.config.month == null || value.config.day == null) && <p className="text-sm text-mystic-gold">Agenda anterior: mês e dia seguem a data de início. Altere os campos para definir outra data.</p>}
  </fieldset>;
}
