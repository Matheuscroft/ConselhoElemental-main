import type { CSSProperties } from 'react';
import type { DayAggregate } from '@/lib/temporal/metrics';
import type { WeekStartsOn } from '@/lib/temporal/date';
import { toDayStamp } from '@/lib/temporal/date';
import { calor, elementosDoDia, type ContagemDoDia } from './elementos-dos-dias';
import type { Direcao } from './useDirecao';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Calendar geometry only; all day totals come from the existing metrics projection.
 * The optional props only dress it: `elementos` lights a dot per element finished
 * in the day, `chave` and `direcao` stage the turn of the page when the month changes.
 */
export function TemporalMonthPicker({ days, weekStartsOn, selectedDayStamp, onSelect, elementos, chave, direcao }: {
  days: DayAggregate[]; weekStartsOn: WeekStartsOn; selectedDayStamp: number | null; onSelect: (stamp: number) => void;
  elementos?: ReadonlyMap<number, ContagemDoDia>; chave?: string; direcao?: Direcao;
}) {
  if (!days.length) return null;
  const offset = (days[0].date.getDay() - weekStartsOn + 7) % 7;
  const today = toDayStamp(new Date());
  const maximo = days.reduce((mais, day) => Math.max(mais, day.totalCompleted), 0);
  return <div className="temporal-vidro">
    <div className="temporal-vidro-luz" aria-hidden="true" />
    <section className="temporal-month-picker ds-glass-float" data-luz aria-label="Resumo diário do mês">
      <p>Escolha um dia para abrir sua agenda e os registros de conclusão.</p>
      <div className="temporal-month-weekdays" aria-hidden="true">{Array.from({ length: 7 }, (_, index) => <span key={index}>{weekdays[(index + weekStartsOn) % 7]}</span>)}</div>
      <div className="temporal-month-days" key={chave} data-direcao={direcao} role="group" aria-label="Dias do mês">
        {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
        {days.map((day, index) => {
          const feitos = elementosDoDia(elementos?.get(day.dayStamp));
          return <button key={day.dayStamp} type="button" aria-pressed={selectedDayStamp === day.dayStamp}
            aria-current={day.dayStamp === today ? 'date' : undefined}
            style={{ '--calor': calor(day.totalCompleted, maximo).toFixed(2), '--linha': Math.floor((offset + index) / 7) } as CSSProperties}
            aria-label={`${day.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}, ${day.commitmentsCount} na agenda, ${day.totalCompleted} registros de conclusão`}
            onClick={() => onSelect(day.dayStamp)}>
            <strong>{day.date.getDate()}</strong>
            <em className="temporal-marcas" aria-hidden="true">
              {day.commitmentsCount > 0 && <i className="temporal-marca-agenda" />}
              {feitos.map((elemento) => <i key={elemento} className="temporal-marca-elemento" data-element={elemento} />)}
            </em>
          </button>;
        })}
      </div>
      <p className="temporal-legenda"><i className="temporal-marca-agenda" aria-hidden="true" /> na agenda <i className="temporal-marca-elemento" data-element="fogo" aria-hidden="true" /><i className="temporal-marca-elemento" data-element="agua" aria-hidden="true" /><i className="temporal-marca-elemento" data-element="ar" aria-hidden="true" /><i className="temporal-marca-elemento" data-element="terra" aria-hidden="true" /> feito, na cor do elemento</p>
    </section>
  </div>;
}
