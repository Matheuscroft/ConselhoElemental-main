import { FitnessCard, MuscleBars, TrendAreaChart, VideoExercisePlayer } from '@/components/fitness-kit';
import { useWorkoutStore } from '@/stores/workoutStore';
import { resolveExerciseMedia } from '@/lib/workout/exercise-media';
import { StarRating } from './StarRating';
import { coreLevelToDefaultPerceivedExertion } from '@/lib/core/native-workout-reward';
import { formatLongClock } from '@/lib/fitness-kit/format';
import type { MuscleContribution, MuscleGroupId, NativeWorkoutSession } from '@/types/workout';

const performed = (session: NativeWorkoutSession) => session.exerciseResults.flatMap((exercise) => exercise.sets).filter((set) => set.completed && !set.skipped);

/** Uses immutable session snapshots, never a projection of the current template. */
export function NativeSessionDetails({ session, history, stars, onRate }: {
  session: NativeWorkoutSession; history: NativeWorkoutSession[]; stars: number;
  onRate: (stars: 1 | 2 | 3 | 4 | 5) => void;
}) {
  const catalog = useWorkoutStore(state => state.nativeCatalog);
  const getLegacy = useWorkoutStore(state => state.getExerciseById);
  const sets = performed(session);
  const fallbackRpe = coreLevelToDefaultPerceivedExertion(session.effortLevel ?? 1);
  const seconds = (set: typeof sets[number]) => set.measureMode === 'reps' ? (set.reps ?? 0) * 4 : set.durationSeconds ?? 0;
  const active = sets.reduce((sum, set) => sum + seconds(set), 0);
  const rpe = active ? sets.reduce((sum, set) => sum + seconds(set) * (set.perceivedExertion ?? fallbackRpe), 0) / active : 0;
  const volume = sets.reduce((sum, set) => sum + (set.measureMode === 'reps' ? (set.reps ?? 0) * (set.loadKg ?? 0) : 0), 0);
  const muscles = new Map<MuscleGroupId, number>();
  let mappedSeconds = 0;
  for (const exercise of session.exerciseResults) {
    const profile = exercise.muscleDistributionOverride ?? exercise.muscleDistribution ?? [];
    const weight = exercise.sets.filter((set) => set.completed && !set.skipped).reduce((sum, set) => sum + seconds(set), 0);
    if (!profile.length || !weight) continue;
    mappedSeconds += weight;
    for (const entry of profile) muscles.set(entry.muscleId, (muscles.get(entry.muscleId) ?? 0) + entry.percentage * weight);
  }
  const distribution: MuscleContribution[] = Array.from(muscles, ([muscleId, weight]) => ({ muscleId, percentage: weight / mappedSeconds }));
  const trend = history.filter((item) => item.status === 'completed' && !!session.templateId && item.templateId === session.templateId && item.completedAt && item.completedAt <= (session.completedAt ?? '') && item.activeDurationSeconds != null)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt)).slice(-7)
    .map((item) => ({ label: new Date(item.startedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), value: (item.activeDurationSeconds ?? 0) / 60 }));
  return <>
    <FitnessCard radius="lg" className="p-5 text-center">
      <h3 className="font-sans text-lg font-semibold">Como foi este treino?</h3>
      <div className="mt-3 flex justify-center"><StarRating variant="fitness" value={stars} onRate={onRate} /></div>
      <p className="mt-2 text-sm text-fitness-muted" role="status">{stars ? `${stars} de 5 estrelas · avaliação salva` : 'Toque nas estrelas para avaliar sua experiência.'}</p>
    </FitnessCard>
    <FitnessCard radius="lg" className="p-5">
      <h3 className="font-sans text-lg font-semibold">O que você realizou</h3>
      <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-fitness-muted">Esforço médio</dt><dd className="mt-1 text-xl font-semibold">{active ? `${rpe.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}/10` : '—'}</dd></div>
        <div><dt className="text-fitness-muted">Volume com carga</dt><dd className="mt-1 text-xl font-semibold">{volume > 0 ? `${volume.toLocaleString('pt-BR')} kg·reps` : 'Sem carga registrada'}</dd></div>
      </dl>
      <p className="mt-4 text-sm leading-relaxed text-fitness-muted">O relógio mostra o tempo da sessão, descontando as pausas registradas. O tempo ativo usa as séries concluídas: duração informada nos blocos por tempo e estimativa de 4 segundos por repetição. Descansos e séries puladas ficam de fora.</p>
      <ul className="mt-4 space-y-3">{session.exerciseResults.slice().sort((a, b) => a.order - b.order).map((exercise) => {
        const definition = catalog.find(item => item.id === exercise.exerciseId);
        const media = resolveExerciseMedia(exercise, definition, definition?.legacyId ? getLegacy(definition.legacyId) : undefined);
        const done = exercise.sets.filter((set) => set.completed && !set.skipped).length;
        return <li key={exercise.id}><details className="rounded-2xl bg-fitness-surface-muted p-4" open={session.exerciseResults.length === 1}>
          <summary className="min-h-11 cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-fitness-primary"><span className="break-words">{exercise.exerciseNameSnapshot}</span><span className="mt-1 block text-sm font-normal text-fitness-muted">{done}/{exercise.sets.length} séries realizadas</span></summary>
          {(media.poster || media.src) && <div className="mt-3"><VideoExercisePlayer title={exercise.exerciseNameSnapshot} {...media} /></div>}
          <ul className="mt-3 divide-y divide-white/10">{exercise.sets.map((set) => <li key={set.id} className="py-3 text-sm">
            <p className={set.completed && !set.skipped ? 'text-fitness-text' : 'text-fitness-muted'}>Série {set.setNumber} · {set.skipped ? 'Pulada' : set.completed ? 'Concluída' : 'Não realizada'}</p>
            {set.completed && !set.skipped && <p className="mt-1 text-fitness-muted">{set.measureMode === 'reps' ? `${set.reps ?? 0} repetições${set.loadKg ? ` · ${set.loadKg} kg` : ''}` : formatLongClock(set.durationSeconds ?? 0)} · esforço {set.perceivedExertion ?? fallbackRpe}/10{set.perceivedExertion == null ? ' (padrão do treino)' : ''} · fator ×{set.loadFactor ?? 1}</p>}
            {set.completed && !set.skipped && set.distanceMeters != null && <p className="mt-1 text-sm text-fitness-muted">{set.distanceMeters.toLocaleString('pt-BR')} m informados</p>}
            {set.activityNotes && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-fitness-muted">{set.activityNotes}</p>}
          </li>)}</ul>
          {exercise.notes && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-fitness-muted">{exercise.notes}</p>}
        </details></li>;
      })}</ul>
    </FitnessCard>
    <FitnessCard radius="lg" className="p-5">
      <h3 className="font-sans text-lg font-semibold">Perfil muscular estimado</h3>
      <p className="my-3 text-sm text-fitness-muted">Perfil dos exercícios ponderado pelo tempo ativo realizado. É uma estimativa de distribuição, não uma medição do corpo.{mappedSeconds > 0 && mappedSeconds < active ? ' Alguns exercícios não têm perfil cadastrado e não entram nas barras.' : ''}</p>
      <MuscleBars distribution={distribution} maxItems={20} emptyMessage="Este treino não tem perfil muscular informado. Você pode adicioná-lo ao exercício para as próximas sessões." />
    </FitnessCard>
    <FitnessCard radius="lg" className="p-5">
      <h3 className="font-sans text-lg font-semibold">Evolução deste treino</h3>
      {trend.length > 1 ? <><p className="my-3 text-sm text-fitness-muted">Tempo ativo registrado nas últimas sessões deste plano, em minutos. Inclui estimativas de repetições.</p><TrendAreaChart data={trend} height={180} unit="min" /></> : <p className="mt-3 text-sm text-fitness-muted">Sua primeira sessão é o ponto de partida. Ao repetir este plano, você verá a evolução aqui.</p>}
    </FitnessCard>
  </>;
}
