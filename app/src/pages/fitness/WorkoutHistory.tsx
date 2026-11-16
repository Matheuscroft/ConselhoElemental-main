import { ElementalXpBadge } from '@/components/rewards/ElementalXpBadge';
import React, { useContext, useMemo, useRef, useState, type CSSProperties } from 'react';
import { History as HistoryIcon } from 'lucide-react';
import { FitnessEmbeddedContext } from '@/components/fitness-kit/FitnessEmbeddedContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { FitnessButton, FitnessTopTabs, FitnessPageShell, WorkoutHistoryCard } from '@/components/fitness-kit';
import '@/components/fitness-kit/saude-uau.css';
import { SaudeCena } from '@/components/fitness-kit/saude-cena';
import { useChegadaSaude } from '@/components/fitness-kit/saude-chegada';
import { elementoDaModalidade } from '@/components/fitness-kit/saude-luz';
import { SaudeCabeca, SaudeNumeroVivo } from '@/components/fitness-kit/saude-painel';
import { SaudeVazio } from '@/components/fitness-kit/saude-vazio';
import { FITNESS_ICONS } from '@/components/fitness-kit/FitnessGlyph';
import { mapSessionsToHistoryItems } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatDayLabel, formatMonthLabel } from '@/lib/fitness-kit/format';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { resolveNativeSessionXp } from '@/lib/workout/native-session-reward';
import { useAppStore } from '@/stores/appStore';
import { isEmptyShortNativeSession } from '@/lib/workout/empty-native-session';
import { toast } from 'sonner';

/** The one pane of glass of this tab: how many sessions the period holds, counted when it is first seen. */
const ResumoHistorico: React.FC<{ total: number; periodLabel: string }> = ({ total, periodLabel }) => {
  const ref = useRef<HTMLElement>(null);
  const arrived = useChegadaSaude(ref, 'historico-resumo');
  return (
    <section ref={ref} className="saude-resumo saude-vidro ds-glass-float saude-entra" data-luz="" style={{ '--ordem': 1 } as CSSProperties} aria-label="Resumo do período">
      <span className="saude-resumo-sigilo" aria-hidden="true"><HistoryIcon strokeWidth={1.75} /></span>
      <div>
        <strong><SaudeNumeroVivo number={{ value: total, format: (value) => String(Math.round(value)) }} arrived={arrived} /></strong>
        <p>{total === 1 ? 'treino registrado' : 'treinos registrados'}</p>
      </div>
      <small>{periodLabel}</small>
    </section>
  );
};

export const WorkoutHistory: React.FC = () => {
  const embedded = useContext(FitnessEmbeddedContext);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const day = /^\d{4}-\d{2}-\d{2}$/.test(params.get('day') ?? '') ? params.get('day') : null;
  const clearDay = () => { const next = new URLSearchParams(params); next.delete('day'); setParams(next); };
  const [showAll, setShowAll] = useState(false);

  const sessions = useWorkoutStore(useShallow((state) => state.getWorkoutHistory()));
  const workouts = useWorkoutStore(useShallow((state) => state.getCompletedWorkouts()));
  const plannedWorkouts = useWorkoutStore(useShallow((state) => state.getPlannedWorkouts()));
  const ledger = useWorkoutStore(useShallow((state) => state.accountDataById[state.currentAccountId ?? 'local']?.gamificationLedger ?? []));
  const nativeHistory = useWorkoutStore((state) => state.nativeHistory);
  const cleanupEmpty = useWorkoutStore((state) => state.cleanupEmptyNativeSessions);
  const templates = useWorkoutStore((state) => state.templates);
  const executionLogs = useAppStore((state) => state.executionLogs);
  const actions = useAppStore((state) => state.actions);
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  const coreState = useMemo(() => ({ executionLogs, actions, tasks, habits }), [executionLogs, actions, tasks, habits]);
  const emptyRecords = nativeHistory.filter((session) => isEmptyShortNativeSession(session, resolveNativeSessionXp(session, coreState)));

  const items = useMemo(() => {
    const now = new Date();
    const categoryByWorkoutId = new Map([...workouts, ...plannedWorkouts].map((workout) => [workout.id, workout.category]));
    const legacy = mapSessionsToHistoryItems(sessions.filter((session) => session.status === 'completed'), (workoutId) => categoryByWorkoutId.get(workoutId))
      .map((item) => {
        const session = sessions.find((entry) => entry.id === item.id)!;
        const reward = ledger.find((entry) => entry.sessionId === item.id)?.xpAwarded;
        return { ...item, sortDate: session.completedAt ?? session.startedAt, reward };
      });
    const native = nativeHistory.filter((session) => session.status === 'completed').map((session) => {
      const date = session.completedAt ?? session.startedAt;
      const template = templates.find((item) => item.id === session.templateId);
      return {
        id: session.id,
        name: session.nameSnapshot,
        dateLabel: formatDayLabel(date),
        metricValue: '', metricUnit: '', strengthGain: 0, pranaCost: 0, staminaCost: 0, gamificationApplied: true, formulaVersion: 'core',
        sortDate: date,
        reward: resolveNativeSessionXp(session, coreState),
        category: session.exerciseResults[0]?.modality ?? template?.modality ?? 'mixed',
      };
    });
    return [...legacy, ...native]
      .filter((item) => day ? (() => { const date = new Date(item.sortDate); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` === day; })() : showAll || (() => { const date = new Date(item.sortDate); return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth(); })())
      .sort((a, b) => Date.parse(b.sortDate) - Date.parse(a.sortDate));
  }, [sessions, workouts, plannedWorkouts, nativeHistory, templates, ledger, coreState, showAll, day]);

  const hasAnyCompleted = sessions.some((session) => session.status === 'completed') || nativeHistory.some((session) => session.status === 'completed');
  const isMonthEmpty = items.length === 0 && hasAnyCompleted && !showAll;

  const periodLabel = day ? new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR') : showAll ? 'Todo o histórico' : formatMonthLabel();
  const actionLabel = day ? 'Limpar filtro' : hasAnyCompleted ? (showAll ? 'Este mês' : isMonthEmpty ? 'Ver tudo' : FITNESS_COPY.showAll) : undefined;
  const startPath = embedded ? '/fitness' : '/treinos';

  return (
    <FitnessPageShell withNav>
      <FitnessTopTabs />
      <SaudeCena chave="historico">
        {emptyRecords.length > 0 && <div className="saude-aviso ds-pane">
          <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => {
            try { const result = cleanupEmpty();
              if (result.removed) toast.success(`${result.removed} registro(s) vazio(s) removido(s).`);
              if (result.unavailable) toast.info(`${result.unavailable} registro(s) preservado(s): recibo insuficiente para reverter com segurança.`);
            } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível limpar os registros.'); }
          }}>Remover {emptyRecords.length} registro(s) vazio(s)</FitnessButton>
          <p>Somente 0 XP, menos de 1 minuto e nenhuma série realizada. Eventual Prana é revertido pelo recibo original.</p>
        </div>}
        <SaudeCabeca
          level={embedded ? 'section' : 'page'}
          title="Histórico de treinos"
          subtitle={periodLabel}
          actionLabel={actionLabel}
          onAction={() => day ? clearDay() : setShowAll((current) => !current)}
        />

        <div className="saude-pilha">
          {!hasAnyCompleted ? (
            <div className="saude-vazio-painel saude-vidro ds-glass-float saude-entra" style={{ '--ordem': 1 } as CSSProperties}>
              <SaudeVazio
                icon={FITNESS_ICONS.strength}
                title="Seu histórico começa no primeiro treino"
                text={FITNESS_COPY.empty.history}
                action={<FitnessButton variant="primary" onClick={() => navigate(startPath)}>Iniciar treino</FitnessButton>}
              />
            </div>
          ) : (
            <ResumoHistorico total={items.length} periodLabel={periodLabel} />
          )}

          {items.length === 0 ? (hasAnyCompleted && (
            <div className="ds-pane saude-vazio-painel saude-entra" style={{ '--ordem': 2 } as CSSProperties}>
              <SaudeVazio
                icon={HistoryIcon}
                title={isMonthEmpty ? 'Este mês ainda está em branco' : 'Nada por aqui'}
                text="Nenhum treino registrado neste período."
                action={isMonthEmpty ? (
                  <FitnessButton variant="primary" onClick={() => setShowAll(true)}>
                    Ver todo o histórico
                  </FitnessButton>
                ) : undefined}
              />
            </div>
          )) : (
            <div className="saude-lista">
              {items.map((item, index) => (
                <WorkoutHistoryCard
                  key={item.id}
                  order={Math.min(index + 2, 9)}
                  name={item.name}
                  dateLabel={`${item.dateLabel}, ${new Date(item.sortDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`}
                  modalityLabel={CATEGORY_LABELS[item.category] ?? undefined}
                  element={elementoDaModalidade(item.category)}
                  metricValue={item.reward == null ? 'XP indisponível' : `+${formatEarthXp(item.reward)} XP`}
                  metricNode={item.reward == null ? undefined : <ElementalXpBadge value={`+${formatEarthXp(item.reward)}`} element="terra" size="sm" />}
                  metricUnit=""
                  icon={CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.mixed}
                  onClick={() => navigate(`/treinos/resumo/${item.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </SaudeCena>
    </FitnessPageShell>
  );
};
