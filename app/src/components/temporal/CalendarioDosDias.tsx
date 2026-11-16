import { useMemo, type CSSProperties } from 'react';
import type { DayAggregate } from '@/lib/temporal/metrics';
import { toDayStamp } from '@/lib/temporal/date';
import { getMoonPhase, getMeteorShowerPeak, getZodiacIngress, getZodiacSign } from '@/constants';
import { calor, elementosDoDia } from './elementos-dos-dias';
import { useDirecao } from './useDirecao';
import { useElementosDosDias } from './useElementosDosDias';

const pontosDeAgenda = (quantidade: number): number[] => (quantidade <= 0 ? [] : Array.from({ length: Math.min(quantidade, 3) }, (_, indice) => indice + 1));

/**
 * The weeks of the calendar month, day by day: the moon, the sign and the
 * meteors of each date, a ring for what is on the agenda and a dot in each
 * element's colour for what was finished. Presentation only; the page keeps
 * every total, the selection and the commands.
 */
export function CalendarioDosDias({ weeks, daysByStamp, anchorDate, selectedDayStamp, onSelect, chave }: {
  weeks: Date[][]; daysByStamp: ReadonlyMap<number, DayAggregate>; anchorDate: Date;
  selectedDayStamp: number | null; onSelect: (stamp: number) => void; chave: string;
}) {
  const elementos = useElementosDosDias();
  const direcao = useDirecao(chave);
  const maior = useMemo(() => [...daysByStamp.values()].reduce((mais, day) => Math.max(mais, day.totalCompleted), 0), [daysByStamp]);
  const hoje = toDayStamp(new Date());
  return (
    <div className="temporal-cal-dias" key={chave} data-direcao={direcao}>
      {weeks.map((week, rowIndex) => (
        <div key={rowIndex} className="temporal-cal-linha" style={{ '--linha': rowIndex } as CSSProperties}>
          {week.map((date) => {
            const stamp = toDayStamp(date);
            if (stamp == null) return null;
            const day = daysByStamp.get(stamp);
            const isCurrentMonth = date.getMonth() === anchorDate.getMonth();
            const moonPhase = getMoonPhase(date);
            const meteorPeak = getMeteorShowerPeak(date);
            const zodiacIngress = getZodiacIngress(date);
            const zodiacSign = getZodiacSign(date);
            const feitos = elementosDoDia(elementos.get(stamp));
            const ceu = `${moonPhase.name}. Signo: ${zodiacSign.name}.${meteorPeak ? ` ${meteorPeak.name}.` : ''}${zodiacIngress ? ` ${zodiacIngress.name}.` : ''}`;
            return (
              <button
                type="button"
                key={stamp}
                onClick={() => onSelect(stamp)}
                aria-label={`${date.toLocaleDateString('pt-BR', { dateStyle: 'full' })}. ${day?.commitmentsCount ?? 0} compromissos. ${day?.totalCompleted ?? 0} concluídos.`}
                aria-current={stamp === hoje ? 'date' : undefined}
                aria-pressed={selectedDayStamp === stamp}
                data-fora={!isCurrentMonth}
                style={{ '--calor': calor(day?.totalCompleted ?? 0, maior).toFixed(2) } as CSSProperties}
                className="temporal-cal-dia"
              >
                <strong>{date.getDate()}</strong>
                <span className="temporal-cal-ceu" title={ceu.replace('. ', ' • ')} aria-hidden="true">
                  <span>{moonPhase.icon}</span>
                  {meteorPeak ? <span>{meteorPeak.icon}</span> : null}
                  {zodiacIngress ? <span>{zodiacIngress.icon}</span> : null}
                </span>
                <em className="temporal-marcas" aria-hidden="true">
                  {pontosDeAgenda(day?.commitmentsCount ?? 0).map((ponto) => <i key={ponto} className="temporal-marca-agenda" />)}
                  {feitos.map((elemento) => <i key={elemento} className="temporal-marca-elemento" data-element={elemento} />)}
                </em>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
