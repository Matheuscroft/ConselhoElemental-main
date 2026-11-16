import { Link } from 'react-router-dom';
import { createAnnualEntry } from '@/lib/temporal/annual-entry';
import { operationalDate } from '@/lib/temporal/recurrence';
import React, { useMemo, useState } from 'react';
import { AnnualEntryForm, type AnnualFormInput } from '@/components/temporal/TemporalEntryForms';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTemporalView } from '@/components/temporal/useTemporalView';
import { temporalActivityHref } from '@/components/temporal/TemporalDayAgenda';
import { useLiveDate } from '@/components/temporal/celestial/useLiveDate';
import { MonthShowcase } from '@/components/temporal/MonthShowcase';
import { MapaDoAno } from '@/components/temporal/MapaDoAno';
import { useDirecao } from '@/components/temporal/useDirecao';
import { TituloDoPeriodo } from '@/components/temporal/TituloDoPeriodo';
import { calor } from '@/components/temporal/elementos-dos-dias';
import { Contagem } from '@/components/motion/Contagem';
import { ChevronLeft, ChevronRight, CalendarHeart } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import {
  buildTemporalCommitments,
  buildTemporalEvents,
  endOfYear,
  getMonthMetrics,
  getYearMetrics,
  startOfYear,
} from '@/lib/temporal';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';

const ANNUAL_ENTRY_MARKER = '[ANUAL_ENTRY]';
const LEGACY_ANNUAL_TASK_MARKER = '[ANUAL_TASK]';
const ANNUAL_CATEGORY_PREFIX = '[ANUAL_CATEGORY:';
const ANNUAL_REPEAT_PREFIX = '[ANUAL_REPEAT:';
const ANNUAL_END_PREFIX = '[ANUAL_END:';

const toValidDate = operationalDate;

type AnnualEntryCategory = 'task' | 'birthday';
type AnnualEntryRepeat = 'infinite' | 'until';

type ParsedAnnualEntry = {
  category: AnnualEntryCategory;
  repeat: AnnualEntryRepeat;
  endDate: Date | null;
  notes: string;
};

const parseMarkerValue = (description: string, prefix: string): string | null => {
  const line = description
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix) && item.endsWith(']'));

  if (!line) return null;
  return line.slice(prefix.length, -1).trim();
};

const isAnnualTask = (description: string | undefined): boolean => {
  return (
    description?.includes(ANNUAL_ENTRY_MARKER)
    || description?.includes(LEGACY_ANNUAL_TASK_MARKER)
    || false
  );
};

const parseAnnualEntry = (description: string | undefined): ParsedAnnualEntry => {
  const raw = description ?? '';

  const categoryRaw = parseMarkerValue(raw, ANNUAL_CATEGORY_PREFIX);
  const category: AnnualEntryCategory = categoryRaw === 'birthday' ? 'birthday' : 'task';

  const repeatRaw = parseMarkerValue(raw, ANNUAL_REPEAT_PREFIX);
  const repeat: AnnualEntryRepeat = repeatRaw === 'until' ? 'until' : 'infinite';

  const endRaw = parseMarkerValue(raw, ANNUAL_END_PREFIX);
  const endDate = endRaw ? toValidDate(endRaw) : null;

  const notes = raw
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      if (item === ANNUAL_ENTRY_MARKER) return false;
      if (item === LEGACY_ANNUAL_TASK_MARKER) return false;
      if (item.startsWith(ANNUAL_CATEGORY_PREFIX) && item.endsWith(']')) return false;
      if (item.startsWith(ANNUAL_REPEAT_PREFIX) && item.endsWith(']')) return false;
      if (item.startsWith(ANNUAL_END_PREFIX) && item.endsWith(']')) return false;
      return true;
    })
    .join('\n')
    .trim();

  return {
    category,
    repeat,
    endDate,
    notes,
  };
};


export const TemporalYearPage: React.FC = () => {
  const { now } = useLiveDate();
  const { anchorDate, setAnchorDate, returnTo } = useTemporalView('year');
  const year = anchorDate.getFullYear();
  const setYear = (next: number) => setAnchorDate(new Date(next, 0, 1));
  const direcao = useDirecao(String(year));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [annualMessage, setAnnualMessage] = useState('');
  const addHabit = useAppStore((state) => state.addHabit);
  const addCommitment = useAppStore((state) => state.addCommitment);
  const completeTask = useAppStore((state) => state.completeTask);
  const uncompleteTask = useAppStore((state) => state.uncompleteTask);
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

  const yearMetrics = useMemo(() => {
    const start = startOfYear(anchorDate);
    const end = endOfYear(anchorDate);
    const commitments = buildTemporalCommitments(snapshot, start, end);
    return getYearMetrics(events, commitments, anchorDate);
  }, [anchorDate, events, snapshot]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const monthDate = new Date(year, index, 1);
      const monthStart = new Date(year, index, 1);
      const monthEnd = new Date(year, index + 1, 0);
      const commitments = buildTemporalCommitments(snapshot, monthStart, monthEnd);
      const metrics = getMonthMetrics(events, commitments, monthDate);

      return {
        monthDate,
        metrics,
      };
    });
  }, [events, snapshot, year]);

  const maiorMes = useMemo(() => months.reduce((mais, { metrics }) => Math.max(mais, metrics.totals.totalCompleted), 0), [months]);

  const recurrenceGroups = useMemo(() => {
    const yearly: string[] = [];
    const monthly: string[] = [];
    const weekly: string[] = [];

    const walk = (habits: typeof snapshot.habits): void => {
      habits.forEach((habit) => {
        if (habit.recurrenceType === 'YEARLY') yearly.push(habit.name);
        if (habit.recurrenceType === 'MONTHLY') monthly.push(habit.name);
        if (habit.recurrenceType === 'WEEKLY') weekly.push(habit.name);
        if (habit.childHabits.length > 0) walk(habit.childHabits);
      });
    };

    walk(snapshot.habits);

    return {
      yearly,
      monthly,
      weekly,
    };
  }, [snapshot]);

  const annualTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (!isAnnualTask(task.description)) return false;
        const createdAt = toValidDate(task.dueDate ?? task.createdAt);
        if (!createdAt) return false;
        return createdAt.getFullYear() === year;
      })
      .sort((left, right) => {
        const leftDate = toValidDate(left.dueDate ?? left.createdAt)?.getTime() ?? 0;
        const rightDate = toValidDate(right.dueDate ?? right.createdAt)?.getTime() ?? 0;
        return leftDate - rightDate;
      });
  }, [tasks, year]);

  const annualAgenda = useMemo(() => {
    const annualHabitIds = new Set(habits.filter(habit => habit.recurrenceType === 'YEARLY').map(habit => habit.id));
    const annualCommitmentIds = new Set(commitments.filter(item => item.recurrence === 'YEARLY').map(item => item.id));
    return buildTemporalCommitments(snapshot, startOfYear(anchorDate), endOfYear(anchorDate)).filter(item =>
      (item.sourceType === 'habit' && annualHabitIds.has(item.sourceId))
      || (item.sourceType === 'commitment' && annualCommitmentIds.has(item.sourceId)));
  }, [snapshot, anchorDate, habits, commitments]);

  const openCreateModal = () => setIsCreateModalOpen(true);
  const handleCreateAnnualTask = (input: AnnualFormInput) => {
    createAnnualEntry({ addHabit, addCommitment }, input);
    setAnnualMessage(input.category === 'birthday' ? 'Aniversário adicionado à agenda.' : 'Ciclo anual criado. Abra Ciclos para registrar sua execução.');
    setIsCreateModalOpen(false);
  };

  return (
    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
    <TemporalLayout
      title="Temporal - Ano"
      subtitle="Acompanhe seus meses e guarde as datas que importam."
      className="temporal-year"
    >
      <div className="temporal-vidro">
        <div className="temporal-vidro-luz" aria-hidden="true" />
        <section className="temporal-ano-heroi ds-glass-float" data-luz aria-label={`Resumo de ${year}`}>
          <div className="temporal-year-selector">
            <button type="button" aria-label="Ano anterior" onClick={() => setYear(year - 1)} className="temporal-icon-button">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <div>
              <TituloDoPeriodo como="p" chave={String(year)} className="temporal-year-number">{year}</TituloDoPeriodo>
              <button type="button" onClick={() => setYear(new Date().getFullYear())} className="temporal-year-today">Voltar ao ano atual</button>
            </div>
            <button type="button" aria-label="Próximo ano" onClick={() => setYear(year + 1)} className="temporal-icon-button">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </div>

          <p role="status" className="temporal-entry-status">{annualMessage}</p>
          <div className="temporal-year-stats">
            <article className="temporal-stat"><p>Concluído</p><p><Contagem valor={yearMetrics.totals.totalCompleted} /></p></article>
            <article className="temporal-stat"><p>Compromissos</p><p><Contagem valor={yearMetrics.totals.commitments} /></p></article>
            <article className="temporal-stat"><p>Pontos</p><p><Contagem valor={yearMetrics.totals.score} formatar={(valor) => valor.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} /></p></article>
            <article className="temporal-stat"><p>Dias ativos</p><p><Contagem valor={yearMetrics.totals.activeDays} /></p></article>
            <article className="temporal-stat"><p>Média mensal</p><p><Contagem valor={Math.round(yearMetrics.totals.score / 12)} /></p></article>
          </div>
        </section>
      </div>

      <MapaDoAno ano={year} direcao={direcao} returnTo={returnTo} atual={year === now.getFullYear() ? now.getMonth() : null}
        meses={months.map(({ monthDate, metrics }) => ({ data: monthDate, concluidos: metrics.totals.totalCompleted, compromissos: metrics.totals.commitments }))} />

      <section className="temporal-painel ds-pane">
        <h3 className="temporal-section-title">Tarefas anuais e aniversários</h3>

        <div className="temporal-painel-acoes">
          <DialogTrigger asChild><button
            type="button"
            onClick={openCreateModal}
            aria-label="Adicionar entrada anual"
            className="temporal-action"
          >
            Criar entrada anual
          </button></DialogTrigger>
        </div>

        {annualAgenda.length > 0 && <ul className="temporal-lista-cartoes" aria-label={`Agenda anual de ${year}`}>
          {annualAgenda.map(item => {
            const habit = item.sourceType === 'habit' ? habits.find(habit => habit.id === item.sourceId) : undefined;
            const commitment = item.sourceType === 'commitment' ? commitments.find(commitment => commitment.id === item.sourceId) : undefined;
            const notes = habit?.description || commitment?.description;
            const until = operationalDate(habit?.recurrenceConfig.until || commitment?.untilDate);
            return <li key={item.id} className="temporal-cartao">
              <p className="temporal-cartao-titulo">{item.title}</p>
              <p className="temporal-nota">{item.date.toLocaleDateString('pt-BR')} · {habit ? 'Ciclo anual' : 'Lembrete anual'}</p>
              {until && <p className="temporal-nota">Repete até {until.toLocaleDateString('pt-BR')}</p>}
              {notes && <p className="temporal-nota temporal-nota-livre">{notes}</p>}
              {habit && <Link className="temporal-link-ouro" to={temporalActivityHref(item)!} state={{ temporalReturn: returnTo }}>Abrir ciclo nesta data</Link>}
            </li>;
          })}
        </ul>}
        <div className="temporal-lista-cartoes">
          {annualTasks.length === 0 && annualAgenda.length === 0 ? (
            <div className="temporal-vazio temporal-vazio-largo">
              <span className="temporal-vazio-selo" aria-hidden="true"><CalendarHeart size={22} /></span>
              <p className="temporal-vazio-titulo">Nenhuma entrada anual cadastrada para {year}</p>
              <p className="temporal-vazio-texto">Crie ciclos anuais e lembretes de aniversário para organizar o ano.</p>
              <button
                type="button"
                onClick={openCreateModal}
                className="temporal-action"
              >
                Criar primeira entrada
              </button>
            </div>
          ) : (
            annualTasks.map((task) => {
              const plannedDate = toValidDate(task.dueDate ?? task.createdAt);
              const parsed = parseAnnualEntry(task.description);

              return (
                <article key={task.id} className="temporal-cartao">
                  <div className="temporal-cartao-linha">
                    <p className="temporal-cartao-titulo" data-feito={task.isCompleted}>
                      {parsed.category === 'birthday' ? 'Aniversário: ' : ''}
                      {task.title}
                    </p>
                    <button
                      type="button"
                      onClick={() => (task.isCompleted ? uncompleteTask(task.id) : completeTask(task.id))}
                      className="annual-entry-action temporal-botao-fantasma"
                    >
                      {task.isCompleted ? 'Reabrir' : 'Concluir'}
                    </button>
                  </div>

                  <p className="temporal-nota">
                    {plannedDate
                      ? `Data configurada: ${plannedDate.toLocaleDateString('pt-BR')}`
                      : 'Data configurada: não definida'}
                  </p>

                  <p className="temporal-nota">
                    Registro anterior: a repetição ainda não está configurada como Ciclo. Histórico preservado.
                  </p>

                  {parsed.notes ? (
                    <p className="temporal-nota temporal-nota-livre">{parsed.notes}</p>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </section>

        <DialogContent className="temporal-entry-dialog" aria-labelledby="annual-form-title" aria-describedby="annual-form-description">
          <DialogTitle id="annual-form-title">Nova entrada anual</DialogTitle>
          <DialogDescription id="annual-form-description">Guarde uma data importante ou planeje um ciclo que se repete a cada ano.</DialogDescription>
          <AnnualEntryForm initialDate={new Date(year, now.getMonth(), Math.min(now.getDate(), new Date(year, now.getMonth() + 1, 0).getDate()))} onSave={handleCreateAnnualTask} onCancel={() => setIsCreateModalOpen(false)} />
        </DialogContent>

      <section className="temporal-painel ds-pane">
        <h3 className="temporal-section-title">O ritmo dos seus hábitos</h3>
        <div className="temporal-ritmo">
          <div className="temporal-ritmo-item"><p>Anuais</p><p><Contagem valor={recurrenceGroups.yearly.length} /> atividades</p></div>
          <div className="temporal-ritmo-item"><p>Mensais</p><p><Contagem valor={recurrenceGroups.monthly.length} /> atividades</p></div>
          <div className="temporal-ritmo-item"><p>Semanais</p><p><Contagem valor={recurrenceGroups.weekly.length} /> atividades</p></div>
        </div>
      </section>

      <section className="temporal-section" aria-labelledby="year-months-title">
        <div className="temporal-section-heading"><h3 id="year-months-title">Seus doze capítulos</h3><span>Abra um mês para explorar seus registros</span></div>
        <div className="temporal-month-grid" key={year} data-direcao={direcao}>
          {months.map(({ monthDate, metrics }) => <MonthShowcase returnTo={returnTo} key={`${year}-${monthDate.getMonth()}`} calor={calor(metrics.totals.totalCompleted, maiorMes)} ordem={monthDate.getMonth()} date={monthDate} completed={metrics.totals.totalCompleted} commitments={metrics.totals.commitments} score={metrics.totals.score} current={year === now.getFullYear() && monthDate.getMonth() === now.getMonth()} />)}
        </div>
      </section>
    </TemporalLayout>
    </Dialog>
  );
};
