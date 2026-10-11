import { FitnessCard, SectionHeader } from '@/components/fitness-kit';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';

export function NativeSessionHistory() {
  const history = useWorkoutStore((state) => state.nativeHistory);
  const logs = useAppStore((state) => state.executionLogs);
  const actions = useAppStore((state) => state.actions);
  const tasks = useAppStore((state) => state.tasks);
  const habits = useAppStore((state) => state.habits);
  if (!history.length) return null;
  return <section className="mb-8 space-y-4" aria-label="Histórico de sessões nativas"><SectionHeader title="Sessões registradas" />{history.slice().sort((a, b) => Date.parse(b.completedAt ?? b.startedAt) - Date.parse(a.completedAt ?? a.startedAt)).map((session) => {
    const log = logs.find((item) => (session.coreExecutionLogId && item.id === session.coreExecutionLogId) || (item.sourceModule === 'modulo_treino' && item.sourceRefId === session.id));
    // A hidratação cloud atual restaura a projeção tasks, não o array actions.
    const action = [...tasks, ...actions].find((item) => item.isCompleted &&
      ((session.coreEntityId && item.id === session.coreEntityId && item.lifecycleType === 'ACTION') ||
        (item.sourceModule === 'modulo_treino' && item.sourceRefId === session.id)));
    const completion = habits.find((item) => item.id === session.coreEntityId)?.completions.find((item) =>
      (session.coreExecutionLogId && item.id === session.coreExecutionLogId) ||
      (session.completedAt && new Date(item.completionDate).getTime() === Date.parse(session.completedAt)));
    const xp = [log?.executedValue, session.earnedXp, completion?.executedScore, completion?.scoreEarned, action?.completedScore]
      .find((value): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0);
    return <FitnessCard key={session.id} className="space-y-3 p-5"><h3 className="font-semibold">{session.nameSnapshot}</h3><p className="text-sm text-fitness-muted">{new Date(session.completedAt ?? session.startedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {Math.floor(session.durationSeconds / 60)}min {session.durationSeconds % 60}s{session.durationSource === 'DECLARED_PLANNED' ? ' · tempo informado' : ''}</p>{typeof xp === 'number' && Number.isFinite(xp) ? <p className="flex flex-wrap items-center gap-2 text-2xl font-semibold text-emerald-300">Ganho: +{formatEarthXp(xp)} XP <span aria-label="Terra">🌿</span></p> : <p className="text-sm text-fitness-muted">XP recebido não disponível neste registro.</p>}</FitnessCard>;
  })}</section>;
}

