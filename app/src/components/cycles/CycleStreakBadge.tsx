import type { Habit } from '@/types';
import { calculateHabitStreak } from '@/lib/temporal/habit-streak';
import { useEffect, useId, useRef } from 'react';
import { Check, ChevronDown, Minus } from 'lucide-react';
import { recordedCompletionWeek, shouldCelebrateStreak } from './streak-presentation';

interface Props {
  schedule?: Habit;
  rotates?: boolean;
  habitId: string;
  name: string;
  value: number;
  record: number;
  lastCompletedAt: Date | string | null;
  referenceDate: Date;
  completions: readonly { completionDate: Date | string }[];
}

/** Read-only projection of the same rule used by the completion commands. */
export function CycleStreakBadge({ habitId, name, value: storedValue, record: storedRecord, lastCompletedAt, referenceDate, completions, schedule, rotates }: Props) {
  const calculated = schedule ? calculateHabitStreak(completions, schedule, rotates) : null;
  const scheduled = calculated?.rule === 'scheduled';
  const value = scheduled ? calculated.streak : storedValue;
  const record = scheduled ? Math.max(storedRecord, calculated.longestStreak) : storedRecord;
  const icon = useRef<SVGSVGElement>(null);
  const previous = useRef({ habitId, value, completionCount: completions.length });
  const id = useId();
  useEffect(() => {
    const before = previous.current;
    previous.current = { habitId, value, completionCount: completions.length };
    if (!shouldCelebrateStreak(before, { habitId, value, completionCount: completions.length }) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = icon.current?.animate?.([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(1.18)', opacity: .75, offset: .35 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
    return () => animation?.cancel();
  }, [habitId, value, completions.length]);
  const date = lastCompletedAt ? new Date(lastCompletedAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString('pt-BR') : 'Sem registro';
  const days = recordedCompletionWeek(referenceDate, completions);
  return <details className="cycle-constancy" data-active={value > 0}>
    <summary aria-label={`Constância de ${name}: sequência registrada ${value}. Ver detalhes`}>
      <svg ref={icon} className="cycle-constancy-rune" width="26" height="30" viewBox="0 0 28 32" fill="none" aria-hidden="true" focusable="false">
        <path d="M14 2 25 9v14l-11 7L3 23V9L14 2Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M15 7c1 6-5 6-3 11 2-1 3-3 3-5 4 3 5 6 3 9-2 3-7 3-9 0-3-5 3-8 6-15Z" fill="currentColor" opacity=".85" />
        <path d="m14 19 2 3-2 3-2-3 2-3Z" fill="var(--constancy-core, #151c28)" />
      </svg>
      <span>Constância <strong>{value}</strong></span><ChevronDown size={14} aria-hidden="true" />
    </summary>
    <div className="cycle-constancy-details" id={id}>
      <p>Sequência registrada até a última execução deste ciclo. Independente da constância geral do personagem.</p>
      <dl><div><dt>Sequência registrada</dt><dd>{value}</dd></div><div><dt>Recorde registrado</dt><dd>{record}</dd></div><div><dt>Última conclusão</dt><dd>{dateLabel}</dd></div></dl>
      <p>Registros nos sete dias até {referenceDate.toLocaleDateString('pt-BR')}</p>
      <ol className="cycle-constancy-week" aria-label="Histórico de conclusões registrado">
        {days.map(day => <li key={day.date.toDateString()} data-completed={day.completed} aria-label={`${day.date.toLocaleDateString('pt-BR')}: ${day.completed ? 'concluído' : 'sem registro'}`}>
          <span>{day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
          {day.completed ? <Check size={16} aria-hidden="true" /> : <Minus size={14} aria-hidden="true" />}
          <small>{day.date.getDate()}</small>
        </li>)}
      </ol>
      <p>Sem registro não significa falta: pode ser um dia fora da sua agenda.</p>
      {scheduled
        ? <p>Cada data programada concluída conta uma vez. Dias de descanso não quebram a sequência. Uma data programada sem conclusão interrompe a contagem entre execuções. Usa a agenda atual; não é um contador de atrasos de hoje.</p>
        : <p>{calculated?.rule === 'legacy-rotation' ? 'Sequência rotativa: o histórico de turnos ainda não está disponível.' : calculated?.rule === 'legacy-yearly' ? 'A recorrência anual ainda não tem uma agenda própria.' : 'Agenda indisponível.'} Este contador mantém o cálculo anterior por dias consecutivos do calendário.</p>}
    </div>
  </details>;
}
