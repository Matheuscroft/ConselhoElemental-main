import React, { useContext, useMemo, useState } from 'react';
import { FitnessEmbeddedContext } from '@/components/fitness-kit/FitnessEmbeddedContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { FitnessButton, FitnessTopTabs, FitnessEmptyState, FitnessPageShell, SectionHeader, WorkoutHistoryCard } from '@/components/fitness-kit';
import { mapSessionsToHistoryItems } from '@/lib/fitness-kit/adapters';
import { FITNESS_COPY } from '@/lib/fitness-kit/copy';
import { formatDayLabel, formatMonthLabel } from '@/lib/fitness-kit/format';
import { CATEGORY_ICONS } from '@/lib/workout';
import { useWorkoutStore } from '@/stores/workoutStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { resolveNativeSessionXp } from '@/lib/workout/native-session-reward';
import { useAppStore } from '@/stores/appStore';
import { isEmptyShortNativeSession } from '@/lib/workout/empty-native-session';
import { toast } from 'sonner';

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

  return (
    <FitnessPageShell withNav>
      <FitnessTopTabs />
      {emptyRecords.length > 0 && <div className="mb-4 rounded-xl border border-white/10 p-3">
        <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => {
          try { const result = cleanupEmpty();
            if (result.removed) toast.success(`${result.removed} registro(s) vazio(s) removido(s).`);
            if (result.unavailable) toast.info(`${result.unavailable} registro(s) preservado(s): recibo insuficiente para reverter com segurança.`);
          } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível limpar os registros.'); }
        }}>Remover {emptyRecords.length} registro(s) vazio(s)</FitnessButton>
        <p className="mt-2 text-xs text-fitness-muted">Somente 0 XP, menos de 1 minuto e nenhuma série realizada. Eventual Prana é revertido pelo recibo original.</p>
      </div>}
      <SectionHeader
        level={embedded ? 'section' : 'page'}
        title="Histórico de treinos"
        subtitle={day ? new Date(`${day}T12:00:00`).toLocaleDateString('pt-BR') : showAll ? 'Todo o histórico' : formatMonthLabel()}
        actionLabel={day ? 'Limpar filtro' : hasAnyCompleted ? (showAll ? 'Este mês' : isMonthEmpty ? 'Ver tudo' : FITNESS_COPY.showAll) : undefined}
        onAction={() => day ? clearDay() : setShowAll((current) => !current)}
      />

      <div className="mt-8 space-y-5">
        {items.length === 0 ? (
          <FitnessEmptyState
            message={hasAnyCompleted ? 'Nenhum treino registrado neste período.' : FITNESS_COPY.empty.history}
            action={isMonthEmpty ? (
              <FitnessButton variant="primary" onClick={() => setShowAll(true)}>
                Ver todo o histórico
              </FitnessButton>
            ) : !hasAnyCompleted ? (
              <FitnessButton variant="primary" onClick={() => navigate(embedded ? '/fitness' : '/treinos')}>
                Iniciar treino
              </FitnessButton>
            ) : undefined}
          />
        ) : (
          items.map((item) => (
            <WorkoutHistoryCard
              key={item.id}
              name={item.name}
              dateLabel={item.dateLabel}
              metricValue={item.reward == null ? 'XP indisponível' : `+${formatEarthXp(item.reward)} XP 🌿`}
              metricUnit=""
              icon={CATEGORY_ICONS[item.category] ?? CATEGORY_ICONS.mixed}
              onClick={() => navigate(`/treinos/resumo/${item.id}`)}
            />
          ))
        )}
      </div>

    </FitnessPageShell>
  );
};
