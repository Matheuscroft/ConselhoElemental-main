import { useMemo, type CSSProperties } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { addDays, buildTemporalCommitments, buildTemporalEvents, endOfWeek, getWeekMetrics, startOfWeek, toDayStamp, useWeekStartsOnPreference } from '@/lib/temporal';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { TemporalDayAgenda } from '@/components/temporal/TemporalDayAgenda';
import { useTemporalView } from '@/components/temporal/useTemporalView';
import { useDirecao } from '@/components/temporal/useDirecao';
import { useElementosDosDias } from '@/components/temporal/useElementosDosDias';
import { elementosDoDia } from '@/components/temporal/elementos-dos-dias';
import { Contagem } from '@/components/motion/Contagem';
import { dateToInput } from '@/lib/temporal/recurrence';

const formatDate = (date: Date) => date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export const TemporalWeekPage = () => {
  const { anchorDate, selectedDayStamp, setAnchorDate, setSelectedDayStamp, returnTo } = useTemporalView('week', true);
  const { weekStartsOn, setWeekStartsOn } = useWeekStartsOnPreference();
  const tasks = useAppStore((state) => state.tasks);
  const commitments = useAppStore((state) => state.commitments);
  const habits = useAppStore((state) => state.habits);
  const cycleSequences = useAppStore((state) => state.cycleSequences);
  const projects = useAppStore((state) => state.projects);
  const quests = useAppStore((state) => state.quests);
  const streak = useAppStore((state) => state.user.streak);
  const snapshot = useMemo(() => ({ tasks, habits, cycleSequences, projects, quests, commitments }), [tasks, habits, cycleSequences, projects, quests, commitments]);
  const events = useMemo(() => buildTemporalEvents(snapshot), [snapshot]);
  const weekCommitments = useMemo(() => buildTemporalCommitments(snapshot, startOfWeek(anchorDate, weekStartsOn), endOfWeek(anchorDate, weekStartsOn)), [anchorDate, snapshot, weekStartsOn]);
  const interval = useMemo(() => getWeekMetrics(events, weekCommitments, anchorDate, weekStartsOn), [anchorDate, events, weekCommitments, weekStartsOn]);
  const selected = interval.days.find(day => day.dayStamp === selectedDayStamp) ?? interval.days.find(day => day.dayStamp === toDayStamp(anchorDate)) ?? interval.days[0];
  const today = toDayStamp(new Date());
  const elementos = useElementosDosDias();
  const direcao = useDirecao(dateToInput(interval.start));
  const dayEvents = events.filter(event => event.dayStamp === selected?.dayStamp);
  const dayCommitments = weekCommitments.filter(item => item.dayStamp === selected?.dayStamp);

  return <TemporalLayout className="temporal-week-view" title="Temporal - Semana" subtitle="Escolha um dia e encontre seu próximo passo.">
    <div className="temporal-period-controls" aria-label="Escolher semana">
      <button type="button" aria-label="Semana anterior" onClick={() => setAnchorDate(addDays(anchorDate, -7))}><ChevronLeft size={20} aria-hidden="true" /></button>
      <div><strong>{formatDate(interval.start)} a {formatDate(interval.end)}</strong><span>{interval.start.getFullYear() === interval.end.getFullYear() ? interval.start.getFullYear() : `${interval.start.getFullYear()} / ${interval.end.getFullYear()}`}</span></div>
      <button type="button" aria-label="Próxima semana" onClick={() => setAnchorDate(addDays(anchorDate, 7))}><ChevronRight size={20} aria-hidden="true" /></button>
    </div>
    <div className="temporal-week-options">
      <button type="button" className="temporal-action" onClick={() => setSelectedDayStamp(Date.now())}>Ir para hoje</button>
      <label>Semana começa em<select value={weekStartsOn} onChange={event => setWeekStartsOn(Number(event.target.value) as 0 | 1)}><option value={0}>Domingo</option><option value={1}>Segunda</option></select></label>
    </div>
    <div className="temporal-week-days" key={dateToInput(interval.start)} data-direcao={direcao} role="group" aria-label="Dias da semana">
      {interval.days.map((day, index) => {
        const total = Math.max(day.commitmentsCount, day.totalCompleted);
        const feitos = elementosDoDia(elementos.get(day.dayStamp));
        return <button key={day.dayStamp} type="button" aria-pressed={selected?.dayStamp === day.dayStamp} aria-current={day.dayStamp === today ? 'date' : undefined}
          aria-controls="temporal-selected-day" aria-label={`${day.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}, ${day.commitmentsCount} na agenda, ${day.totalCompleted} registros de conclusão`}
          style={{ '--parte': total > 0 ? (day.totalCompleted / total).toFixed(3) : '0', '--i': index } as CSSProperties}
          onClick={() => setSelectedDayStamp(day.dayStamp)}>
          <span>{day.date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}</span>
          <span className="temporal-runa-anel" aria-hidden="true">
            <svg viewBox="0 0 40 40" focusable="false"><circle className="temporal-anel-trilha" cx="20" cy="20" r="17" />{day.totalCompleted > 0 && <circle className="temporal-anel-arco" cx="20" cy="20" r="17" pathLength={100} />}</svg>
            <strong>{day.date.getDate()}</strong>
          </span>
          <small aria-hidden="true">{day.commitmentsCount > 0 ? day.commitmentsCount : '\u00a0'}</small>
          <em className="temporal-marcas" aria-hidden="true">{feitos.map((elemento) => <i key={elemento} className="temporal-marca-elemento" data-element={elemento} />)}</em>
        </button>;
      })}
    </div>
    <p className="temporal-legenda">O anel mostra o que foi concluído do que estava na agenda; o número abaixo é a agenda do dia.</p>
    {selected && <div className="temporal-vidro">
      <div className="temporal-vidro-luz" aria-hidden="true" />
      <section id="temporal-selected-day" className="temporal-selected-day ds-glass-float" data-luz aria-labelledby="temporal-selected-heading">
        <div className="temporal-troca" key={selected.dayStamp}>
          <header><p>{selected.dayStamp === today ? 'Hoje' : 'Seu dia em foco'}</p><h3 id="temporal-selected-heading" aria-live="polite">{selected.date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3></header>
          <TemporalDayAgenda date={selected.date} events={dayEvents} commitments={dayCommitments} returnTo={returnTo} />
        </div>
      </section>
    </div>}
    <details className="temporal-week-summary"><summary>Resumo da semana<ChevronDown size={18} aria-hidden="true" /></summary>
      <dl><div><dt>Rituais concluídos</dt><dd><Contagem valor={interval.totals.completedTasks} /></dd></div><div><dt>Ciclos concluídos</dt><dd><Contagem valor={interval.totals.completedHabits} /></dd></div><div><dt>Pontos registrados</dt><dd><Contagem valor={interval.totals.score} formatar={(valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} /></dd></div><div><dt>Constância do personagem</dt><dd><Contagem valor={streak} /></dd></div></dl>
    </details>
  </TemporalLayout>;
};
