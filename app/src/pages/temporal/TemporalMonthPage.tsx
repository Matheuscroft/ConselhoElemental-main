import { TemporalMonthPicker } from '@/components/temporal/TemporalMonthPicker';
import { useMemo } from 'react';
import { useTemporalView } from '@/components/temporal/useTemporalView';
import { useDirecao } from '@/components/temporal/useDirecao';
import { TituloDoPeriodo } from '@/components/temporal/TituloDoPeriodo';
import { useElementosDosDias } from '@/components/temporal/useElementosDosDias';
import { Contagem } from '@/components/motion/Contagem';
import { dateToInput } from '@/lib/temporal/recurrence';
import { ChevronLeft, ChevronRight, ChevronDown, Trophy } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import {
  buildTemporalCommitments,
  buildTemporalEvents,
  endOfMonth,
  getMonthMetrics,
  startOfMonth,
  toDayStamp,
  useWeekStartsOnPreference,
} from '@/lib/temporal';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { DayDetailsDialog } from '@/components/temporal/DayDetailsDialog';

const formatMonthLabel = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
};

export const TemporalMonthPage = () => {
  const { anchorDate, selectedDayStamp, setAnchorDate, setSelectedDayStamp, returnTo } = useTemporalView('month');
  const { weekStartsOn } = useWeekStartsOnPreference();
  const elementos = useElementosDosDias();

  const tasks = useAppStore((state) => state.tasks);
  const commitments = useAppStore((state) => state.commitments);
  const habits = useAppStore((state) => state.habits);
  const cycleSequences = useAppStore((state) => state.cycleSequences);
  const projects = useAppStore((state) => state.projects);
  const quests = useAppStore((state) => state.quests);

  const snapshot = useMemo(
    () => ({ tasks, habits, cycleSequences, projects, quests, commitments }),
    [tasks, habits, cycleSequences, projects, quests, commitments]
  );

  const events = useMemo(() => buildTemporalEvents(snapshot), [snapshot]);

  const interval = useMemo(() => {
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    const commitments = buildTemporalCommitments(snapshot, start, end);
    return getMonthMetrics(events, commitments, anchorDate);
  }, [anchorDate, events, snapshot]);

  const monthCommitments = useMemo(() => {
    const start = startOfMonth(anchorDate);
    const end = endOfMonth(anchorDate);
    return buildTemporalCommitments(snapshot, start, end);
  }, [anchorDate, snapshot]);

  const bestDay = useMemo(() => {
    return interval.days.filter(day => day.totalCompleted > 0).reduce((best, current) => {
      if (!best) return current;
      if (current.score > best.score) return current;
      return best;
    }, null as (typeof interval.days)[number] | null);
  }, [interval]);

  const chaveDoMes = dateToInput(anchorDate).slice(0, 7);
  const direcao = useDirecao(chaveDoMes);

  const selectedDayAggregate = useMemo(
    () => interval.days.find((day) => day.dayStamp === selectedDayStamp) ?? null,
    [interval.days, selectedDayStamp]
  );

  const selectedDayEvents = useMemo(
    () => events.filter((event) => event.dayStamp === selectedDayStamp),
    [events, selectedDayStamp]
  );

  const selectedDayCommitments = useMemo(
    () => monthCommitments.filter((item) => item.dayStamp === selectedDayStamp),
    [monthCommitments, selectedDayStamp]
  );

  return (
    <TemporalLayout
      title="Temporal - Mês"
      subtitle={`Visão operacional mensal (semana inicia em ${weekStartsOn === 0 ? 'domingo' : 'segunda'})`}
    >
      <div className="temporal-period-controls" aria-label="Escolher mês">
        <button type="button" aria-label="Mês anterior" onClick={() => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() - 1, 1))}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div><TituloDoPeriodo chave={chaveDoMes}>{formatMonthLabel(anchorDate)}</TituloDoPeriodo></div>
        <button type="button" aria-label="Próximo mês" onClick={() => setAnchorDate(new Date(anchorDate.getFullYear(), anchorDate.getMonth() + 1, 1))}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <TemporalMonthPicker days={interval.days} weekStartsOn={weekStartsOn} selectedDayStamp={selectedDayStamp} onSelect={setSelectedDayStamp} elementos={elementos} chave={chaveDoMes} direcao={direcao} />

      <details className="temporal-week-summary"><summary>Resumo do mês<ChevronDown size={18} aria-hidden="true" /></summary>
        <dl>
          <div><dt>Concluído</dt><dd><Contagem valor={interval.totals.totalCompleted} /></dd></div>
          <div><dt>Compromissos</dt><dd><Contagem valor={interval.totals.commitments} /></dd></div>
          <div><dt>Pontuação</dt><dd><Contagem valor={interval.totals.score} formatar={(valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} /></dd></div>
          <div><dt>Dias ativos</dt><dd><Contagem valor={interval.totals.activeDays} /></dd></div>
        </dl>
      </details>

      {bestDay && toDayStamp(bestDay.date) != null ? (
        <section className="temporal-destaque" aria-labelledby="temporal-melhor-dia">
          <span className="temporal-vazio-selo" aria-hidden="true"><Trophy size={20} /></span>
          <div>
            <h3 id="temporal-melhor-dia">Melhor dia do mês</h3>
            <p>{bestDay.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} com {bestDay.score} pontos.</p>
          </div>
        </section>
      ) : (
        <section className="temporal-destaque" data-vazio aria-labelledby="temporal-melhor-dia">
          <span className="temporal-vazio-selo" aria-hidden="true"><Trophy size={20} /></span>
          <div>
            <h3 id="temporal-melhor-dia">Melhor dia do mês</h3>
            <p>Ele aparece aqui quando você registrar a primeira conclusão deste mês.</p>
          </div>
        </section>
      )}

      <DayDetailsDialog
        returnTo={returnTo}
        open={selectedDayAggregate != null}
        onOpenChange={(open) => {
          if (!open) setSelectedDayStamp(null);
        }}
        date={selectedDayAggregate?.date ?? null}
        aggregate={selectedDayAggregate}
        events={selectedDayEvents}
        commitments={selectedDayCommitments}
      />
    </TemporalLayout>
  );
};
