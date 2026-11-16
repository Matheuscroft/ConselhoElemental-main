import { operationalDate } from '@/lib/temporal/recurrence';
import { useTemporalView } from '@/components/temporal/useTemporalView';
import { CommitmentForm, type CommitmentFormInput } from '@/components/temporal/TemporalEntryForms';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarioDosDias } from '@/components/temporal/CalendarioDosDias';
import { TituloDoPeriodo } from '@/components/temporal/TituloDoPeriodo';
import { useAppStore } from '@/stores/appStore';
import {
  addDays,
  buildDayAggregates,
  buildTemporalCommitments,
  buildTemporalEvents,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDayStamp,
  useWeekStartsOnPreference,
} from '@/lib/temporal';
import type { TemporalCommitment } from '@/lib/temporal';
import type { Commitment } from '@/types';
import { WEEKDAYS_SHORT, getZodiacIngresses } from '@/constants';
import { TemporalLayout } from '@/pages/temporal/TemporalLayout';
import { DayDetailsDialog } from '@/components/temporal/DayDetailsDialog';
import {
  isGoogleCalendarIntegrationEnabled,
  listGoogleCalendarEventsCache,
} from '@/services/googleCalendarIntegration';

type ZodiacIngressEntry = {
  date: Date;
  name: string;
  icon: string;
  planet: string;
};

const ZODIAC_PLANETS = ['Todos', 'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão'];

export const TemporalCalendarPage: React.FC = () => {
  const { anchorDate, selectedDayStamp, setAnchorDate, setSelectedDayStamp, returnTo } = useTemporalView('calendar');
  const { weekStartsOn } = useWeekStartsOnPreference();
  const chaveDoMes = `${anchorDate.getFullYear()}-${String(anchorDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedIngressPlanet, setSelectedIngressPlanet] = useState('Todos');
  const [showCommitmentForm, setShowCommitmentForm] = useState(false);
  const [editingCommitmentId, setEditingCommitmentId] = useState<string | null>(null);
  const [commitmentMessage, setCommitmentMessage] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [googleCommitments, setGoogleCommitments] = useState<TemporalCommitment[]>([]);

  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const cycleSequences = useAppStore((state) => state.cycleSequences);
  const projects = useAppStore((state) => state.projects);
  const quests = useAppStore((state) => state.quests);
  const commitments = useAppStore((state) => state.commitments);
  const addCommitment = useAppStore((state) => state.addCommitment);
  const updateCommitment = useAppStore((state) => state.updateCommitment);
  const deleteCommitment = useAppStore((state) => state.deleteCommitment);

  const snapshot = useMemo(
    () => ({ tasks, habits, cycleSequences, projects, quests, commitments }),
    [tasks, habits, cycleSequences, projects, quests, commitments]
  );

  const events = useMemo(() => buildTemporalEvents(snapshot), [snapshot]);

  const gridWindow = useMemo(() => {
    const monthStart = startOfMonth(anchorDate);
    const monthEnd = endOfMonth(anchorDate);
    const gridStart = startOfWeek(monthStart, weekStartsOn);
    const gridEnd = endOfWeek(monthEnd, weekStartsOn);

    return {
      monthStart,
      monthEnd,
      gridStart,
      gridEnd,
    };
  }, [anchorDate, weekStartsOn]);

  const internalCommitments = useMemo(
    () => buildTemporalCommitments(snapshot, gridWindow.gridStart, gridWindow.gridEnd),
    [snapshot, gridWindow.gridStart, gridWindow.gridEnd]
  );

  const handleCommitmentSubmit = (input: CommitmentFormInput) => {
    if (editingCommitmentId) updateCommitment(editingCommitmentId, input);
    else addCommitment(input);
    setCommitmentMessage(editingCommitmentId ? 'Compromisso atualizado.' : 'Compromisso adicionado à agenda.');
    setShowCommitmentForm(false);
  };

  const startEditingCommitment = (commitment: Commitment) => {
    setEditingCommitmentId(commitment.id);
    setShowCommitmentForm(true);
  };

  const confirmDelete = (id: string) => {
    try {
      deleteCommitment(id);
      setPendingDeleteId(null);
      setCommitmentMessage('Compromisso excluído.');
    } catch { setCommitmentMessage('Não foi possível excluir. Tente novamente.'); }
  };

  useEffect(() => {
    let isCancelled = false;

    const loadGoogleCommitments = async () => {
      if (!isGoogleCalendarIntegrationEnabled()) {
        if (!isCancelled) setGoogleCommitments([]);
        return;
      }

      try {
        const rows = await listGoogleCalendarEventsCache({
          startIso: gridWindow.gridStart.toISOString(),
          endIso: gridWindow.gridEnd.toISOString(),
        });

        if (isCancelled) return;

        const mapped: TemporalCommitment[] = rows
          .map((row) => {
            if (!row.starts_at) return null;
            const startsAt = new Date(row.starts_at);
            if (Number.isNaN(startsAt.getTime())) return null;

            const dayStamp = toDayStamp(startsAt);
            if (dayStamp == null) return null;

            return {
              id: `google:${row.id}`,
              sourceType: 'google',
              sourceId: row.id,
              title: row.title ?? 'Evento Google Agenda',
              date: startOfDay(startsAt),
              dayStamp,
              kind: 'external',
            };
          })
          .filter((item): item is TemporalCommitment => item != null);

        setGoogleCommitments(mapped);
      } catch {
        if (!isCancelled) {
          setGoogleCommitments([]);
        }
      }
    };

    void loadGoogleCommitments();

    return () => {
      isCancelled = true;
    };
  }, [gridWindow.gridEnd, gridWindow.gridStart]);

  const combinedCommitments = useMemo(
    () => [...internalCommitments, ...googleCommitments],
    [internalCommitments, googleCommitments]
  );

  const grid = useMemo(() => {
    const days = buildDayAggregates(events, combinedCommitments, gridWindow.gridStart, gridWindow.gridEnd);

    return {
      monthStart: gridWindow.monthStart,
      monthEnd: gridWindow.monthEnd,
      days,
      gridStart: gridWindow.gridStart,
      gridEnd: gridWindow.gridEnd,
    };
  }, [combinedCommitments, events, gridWindow.gridEnd, gridWindow.gridStart, gridWindow.monthEnd, gridWindow.monthStart]);

  const selectedMonthCommitments = useMemo(() => {
    const monthCommitments = combinedCommitments.filter((item) => {
      const month = item.date.getMonth();
      const year = item.date.getFullYear();
      return month === grid.monthStart.getMonth() && year === grid.monthStart.getFullYear();
    });
    return monthCommitments;
  }, [combinedCommitments, grid.monthStart]);

  const ownMonthCommitments = useMemo(
    () => [...new Map(selectedMonthCommitments.filter(item => item.sourceType === 'commitment').map(item => [item.sourceId, item])).values()],
    [selectedMonthCommitments]
  );

  const zodiacIngressesInMonth = useMemo(() => {
    return getZodiacIngresses(grid.monthStart, grid.monthEnd) satisfies ZodiacIngressEntry[];
  }, [grid.monthEnd, grid.monthStart]);

  const filteredZodiacIngresses = useMemo(
    () => selectedIngressPlanet === 'Todos'
      ? zodiacIngressesInMonth
      : zodiacIngressesInMonth.filter((entry) => entry.planet === selectedIngressPlanet),
    [selectedIngressPlanet, zodiacIngressesInMonth]
  );

  const daysByStamp = useMemo(() => new Map(grid.days.map((day) => [day.dayStamp, day])), [grid.days]);

  const selectedDayAggregate = useMemo(
    () => grid.days.find((day) => day.dayStamp === selectedDayStamp) ?? null,
    [grid.days, selectedDayStamp]
  );

  const selectedDayEvents = useMemo(
    () => events.filter((event) => event.dayStamp === selectedDayStamp),
    [events, selectedDayStamp]
  );

  const selectedDayCommitments = useMemo(
    () => combinedCommitments.filter((item) => item.dayStamp === selectedDayStamp),
    [selectedDayStamp, combinedCommitments]
  );

  const weeks = useMemo(() => {
    const rows: Date[][] = [];
    let cursor = new Date(grid.gridStart);

    while (cursor <= grid.gridEnd) {
      const row = eachDayOfInterval(cursor, addDays(cursor, 6));
      rows.push(row);
      cursor = addDays(cursor, 7);
    }

    return rows;
  }, [grid.gridEnd, grid.gridStart]);

  return (
    <Dialog open={showCommitmentForm} onOpenChange={setShowCommitmentForm}>
    <TemporalLayout
      title="Temporal - Calendário"
      subtitle="Escolha um dia para ver sua rotina, seus compromissos e seus registros."
    >
      <div className="temporal-period-controls" aria-label="Escolher mês">
        <button type="button" aria-label="Mês anterior" onClick={() => setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <div><TituloDoPeriodo chave={chaveDoMes}>{anchorDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</TituloDoPeriodo></div>
        <button type="button" aria-label="Próximo mês" onClick={() => setAnchorDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="temporal-vidro">
        <div className="temporal-vidro-luz" aria-hidden="true" />
        <section className="temporal-calendario ds-pane" data-luz aria-label="Calendário do mês">
          <div className="temporal-cal-semana" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => WEEKDAYS_SHORT[(index + weekStartsOn) % 7]).map((label) => (
              <p key={label}>{label}</p>
            ))}
          </div>

          <CalendarioDosDias weeks={weeks} daysByStamp={daysByStamp} anchorDate={anchorDate} selectedDayStamp={selectedDayStamp} onSelect={setSelectedDayStamp} chave={chaveDoMes} />
          <p className="temporal-legenda"><i className="temporal-marca-agenda" aria-hidden="true" /> compromissos <i className="temporal-marca-elemento" data-element="fogo" aria-hidden="true" /><i className="temporal-marca-elemento" data-element="agua" aria-hidden="true" /><i className="temporal-marca-elemento" data-element="ar" aria-hidden="true" /><i className="temporal-marca-elemento" data-element="terra" aria-hidden="true" /> feitos, na cor do elemento</p>
        </section>
      </div>

      <details className="temporal-section temporal-gaveta ds-pane">
        <summary>Contexto celeste do mês</summary>
        <div className="temporal-painel-topo">
          <div>
            <h3 className="temporal-painel-titulo">Entradas de signo no mês</h3>
            <p className="temporal-nota">Filtre as entradas pelo planeta em trânsito.</p>
          </div>
          <label className="temporal-filtro">
            <span>Planeta</span>
            <select
              value={selectedIngressPlanet}
              onChange={(event) => setSelectedIngressPlanet(event.target.value)}
            >
              {ZODIAC_PLANETS.map((planet) => (
                <option key={planet} value={planet}>
                  {planet}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="temporal-lista-cartoes">
          {filteredZodiacIngresses.length === 0 ? (
            <p className="temporal-vazio-texto">
              {zodiacIngressesInMonth.length === 0
                ? 'Sem entradas de signo mapeadas neste mês.'
                : `Nenhuma entrada de ${selectedIngressPlanet} neste mês.`}
            </p>
          ) : (
            filteredZodiacIngresses.map((entry) => (
              <article key={entry.date.toISOString()} className="temporal-cartao">
                <div className="temporal-cartao-linha">
                  <p>{entry.icon} {entry.name}</p>
                  <span className="temporal-etiqueta">
                    {entry.planet}
                  </span>
                </div>
                <p className="temporal-nota">{entry.date.toLocaleDateString('pt-BR')}</p>
              </article>
            ))
          )}
        </div>
      </details>

      <section className="temporal-painel ds-pane">
        <div className="temporal-painel-topo">
          <div>
            <h3 className="temporal-painel-titulo">Compromissos do mês</h3>
            <p className="temporal-nota">Compromissos independentes de treinos, hábitos e ciclos.</p>
          </div>
          <DialogTrigger asChild><button
            type="button"
            onClick={() => { setEditingCommitmentId(null); setShowCommitmentForm(true); }}
            className="temporal-action"
          >
            <CalendarPlus size={18} aria-hidden="true" />Novo compromisso
          </button></DialogTrigger>
        </div>

        <p role="status" className="temporal-entry-status">{commitmentMessage}</p>
        <DialogContent className="temporal-entry-dialog" aria-labelledby="commitment-form-title" aria-describedby="commitment-form-description">
          <DialogTitle id="commitment-form-title">{editingCommitmentId ? 'Editar compromisso' : 'Novo compromisso'}</DialogTitle>
          <DialogDescription id="commitment-form-description">Organize uma data importante. Compromissos recorrentes usam o mesmo cadastro.</DialogDescription>
          <CommitmentForm key={editingCommitmentId ?? 'new'} initial={commitments.find(item => item.id === editingCommitmentId)} initialDate={selectedDayStamp ? new Date(selectedDayStamp) : anchorDate} onSave={handleCommitmentSubmit} onCancel={() => setShowCommitmentForm(false)} />
        </DialogContent>

        <div className="temporal-lista-cartoes">
          {ownMonthCommitments.length === 0 ? (
            <div className="temporal-vazio temporal-vazio-largo"><span className="temporal-vazio-selo" aria-hidden="true"><CalendarPlus size={22} /></span><p className="temporal-vazio-texto">Nenhum compromisso próprio neste mês.</p></div>
          ) : (
            ownMonthCommitments.map((item) => {
              const source = commitments.find((commitment) => commitment.id === item.sourceId);
              return (
                <article key={item.id} className="temporal-cartao">
                  <div className="temporal-commitment-row">
                    <div>
                      <p className="temporal-cartao-titulo">{item.title}</p>
                      <p className="temporal-nota">
                        {source?.recurrence === 'ONCE' ? 'Data: ' : 'A partir de '}{operationalDate(source?.date)?.toLocaleDateString('pt-BR') ?? 'data não disponível'} • {source?.recurrence === 'ONCE' ? 'uma vez' : 'recorrente'}
                        {source?.recurrence !== 'ONCE' && ` · ${selectedMonthCommitments.filter(occurrence => occurrence.sourceType === 'commitment' && occurrence.sourceId === item.sourceId).length} ocorrências neste mês`}
                      </p>
                    </div>
                    {source ? (
                      <div className="temporal-commitment-actions">
                        <button type="button" onClick={() => startEditingCommitment(source)} className="temporal-botao-fantasma">Editar</button>
                        <button type="button" onClick={() => setPendingDeleteId(source.id)} className="temporal-botao-fantasma" data-perigo>Excluir</button>
                      </div>
                    ) : null}
                  </div>
                  {source && pendingDeleteId === source.id && <div className="temporal-delete-confirm" role="group" aria-label={`Excluir ${source.title}`}>
                    <p>Excluir “{source.title}”{source.recurrence === 'ONCE' ? '?' : ' e suas repetições na agenda?'} Esta ação não pode ser desfeita.</p>
                    <div className="temporal-entry-actions"><button type="button" onClick={() => setPendingDeleteId(null)}>Manter compromisso</button><button type="button" onClick={() => confirmDelete(source.id)}>Confirmar exclusão</button></div>
                  </div>}
                </article>
              );
            })
          )}
        </div>
      </section>

      <details className="temporal-section temporal-gaveta ds-pane">
        <summary>Outros prazos e eventos do mês</summary>
        <div className="temporal-lista-cartoes">
          {selectedMonthCommitments.filter(item => item.sourceType !== 'commitment').length === 0 ? (
            <p className="temporal-vazio-texto">Nenhum outro prazo encontrado para este mês.</p>
          ) : (
            selectedMonthCommitments.filter(item => item.sourceType !== 'commitment').map((item) => (
              <article key={item.id} className="temporal-cartao">
                <p className="temporal-cartao-titulo">{item.title}</p>
                <p className="temporal-nota">
                  {item.date.toLocaleDateString('pt-BR')} • {item.kind === 'due' ? 'vencimento' : 'recorrente'}
                </p>
              </article>
            ))
          )}
        </div>
      </details>

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
    </Dialog>
  );
};
