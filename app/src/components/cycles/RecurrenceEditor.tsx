import { useId } from 'react';
import type { RecurrenceConfig, RecurrenceType } from '@/types';
import { defaultRecurrenceConfig } from '@/lib/temporal/recurrence';

export interface RecurrenceEditorValue { type: RecurrenceType; config: RecurrenceConfig }
const names = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
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
    <legend className="mb-2 text-sm text-white/80">Agenda do ciclo</legend>
    <label className="block space-y-2" htmlFor={`${id}-type`}><span>Quando repetir</span>
      <select id={`${id}-type`} className={control} value={value.type} onChange={event => {
        const type = event.target.value as RecurrenceType;
        onChange({ type, config: { ...defaultRecurrenceConfig(type, referenceDate), ...(value.config.until ? { until: value.config.until } : {}) } });
      }}>
        <option value="DAILY">Diário</option><option value="WEEKLY">Semanal</option><option value="MONTHLY">Mensal</option><option value="YEARLY">Anual</option>
      </select>
    </label>
    {yearly ? <div className="grid grid-cols-2 gap-3">
      <label className="space-y-2" htmlFor={`${id}-month`}><span>Mês</span><select id={`${id}-month`} className={control} value={month} onChange={event => onChange({ ...value, config: { ...value.config, month: Number(event.target.value), day } })}>
        {months.map((name, index) => <option key={name} value={index + 1}>{name}</option>)}
      </select></label>
      <label className="space-y-2" htmlFor={`${id}-day`}><span>Dia</span><input id={`${id}-day`} className={control} type="number" inputMode="numeric" min={1} max={31} value={day} onChange={event => onChange({ ...value, config: { ...value.config, month, day: Number(event.target.value) } })} /></label>
    </div> : <fieldset><legend className="mb-2 text-sm text-white/70">{monthly ? 'Dias do mês' : 'Dias da semana'}</legend>
      <div className={`grid gap-2 ${monthly ? 'grid-cols-6' : 'grid-cols-4'}`}>
        {(monthly ? Array.from({ length: 31 }, (_, index) => index + 1) : [0, 1, 2, 3, 4, 5, 6]).map(day => <button
          key={day} type="button" aria-label={monthly ? `Dia ${day}` : names[day]} aria-pressed={days?.includes(day) ?? false}
          onClick={() => changeDays(day)} className={`min-h-12 rounded-lg border px-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-mystic-gold ${days?.includes(day) ? 'border-mystic-gold bg-mystic-gold/15 text-mystic-gold' : 'border-white/20 bg-white/5 text-white/70'}`}>
          {monthly ? day : names[day].slice(0, 3)}
        </button>)}
      </div>
    </fieldset>}
    <label htmlFor={`${id}-until`} className="block space-y-2"><span>Repetir até (opcional)</span>
      <input id={`${id}-until`} type="date" className={control} value={value.config.until ?? ''}
        onChange={event => { const config = { ...value.config }; if (event.target.value) config.until = event.target.value; else delete config.until; onChange({ ...value, config }); }} />
    </label>
    {disabled ? <p className="text-sm text-white/60">A agenda é definida no ciclo principal.</p>
      : <p className="text-sm text-white/60">{yearly ? `Uma vez por ano, em ${day}/${month}. ` : monthly ? 'Repete nos dias do mês escolhidos. ' : 'Repete nos dias da semana escolhidos. '}{(monthly || yearly) && 'Datas inexistentes são puladas, sem antecipação. '}O histórico de conclusões é preservado.</p>}
    {!yearly && !days && <p className="text-sm text-mystic-gold">Agenda anterior sem dias definidos: aparece todos os dias. Escolha os dias para ajustar.</p>}
    {yearly && (value.config.month == null || value.config.day == null) && <p className="text-sm text-mystic-gold">Agenda anterior: mês e dia seguem a data de início. Altere os campos para definir outra data.</p>}
  </fieldset>;
}
