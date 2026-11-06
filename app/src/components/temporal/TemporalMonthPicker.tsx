import type { DayAggregate } from '@/lib/temporal/metrics';
import type { WeekStartsOn } from '@/lib/temporal/date';
import { toDayStamp } from '@/lib/temporal/date';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** Calendar geometry only; all day totals come from the existing metrics projection. */
export function TemporalMonthPicker({ days, weekStartsOn, selectedDayStamp, onSelect }: {
  days: DayAggregate[]; weekStartsOn: WeekStartsOn; selectedDayStamp: number | null; onSelect: (stamp: number) => void;
}) {
  if (!days.length) return null;
  const offset = (days[0].date.getDay() - weekStartsOn + 7) % 7;
  const today = toDayStamp(new Date());
  return <section className="temporal-month-picker" aria-label="Resumo diário do mês">
    <p>Escolha um dia para abrir sua agenda e os registros de conclusão.</p>
    <div className="temporal-month-weekdays" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index}>{weekdays[(index + weekStartsOn) % 7]}</span>)}</div>
    <div className="temporal-month-days" role="group" aria-label="Dias do mês">
      {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
      {days.map(day => <button key={day.dayStamp} type="button" aria-pressed={selectedDayStamp === day.dayStamp}
        aria-current={day.dayStamp === today ? 'date' : undefined}
        aria-label={`${day.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}, ${day.commitmentsCount} na agenda, ${day.totalCompleted} registros de conclusão`}
        onClick={() => onSelect(day.dayStamp)}>
        <strong>{day.date.getDate()}</strong><span>{day.commitmentsCount} agenda</span><small>{day.totalCompleted} feitos</small>
      </button>)}
    </div>
  </section>;
}
