import type { CSSProperties } from 'react';
import { Check, ChevronDown, SkipForward } from 'lucide-react';
import { MuscleBars, TrendAreaChart, VideoExercisePlayer } from '@/components/fitness-kit';
import { NumeroQueConta } from '@/components/fitness-kit/treino-numero';
import { elementoDaModalidade } from '@/components/fitness-kit/treinos-elementos';
import '@/components/fitness-kit/dialogo-uau.css';
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
  const ordem = (indice: number) => ({ '--i': indice }) as CSSProperties;
  const elemento = elementoDaModalidade(session.exerciseResults[0]?.modality ?? 'mixed');
  const totalSets = session.exerciseResults.reduce((sum, exercise) => sum + exercise.sets.length, 0);
  const oneDecimal = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return <>
    <section className="dg-bloco dg-avalia ds-pane" style={ordem(0)} aria-labelledby="dg-avalia-titulo">
      <h3 id="dg-avalia-titulo" className="dg-bloco-titulo">Como foi este treino?</h3>
      <div className="dg-estrelas"><StarRating variant="fitness" value={stars} onRate={onRate} /></div>
      <p className="dg-nota" role="status">{stars ? `${stars} de 5 estrelas · avaliação salva` : 'Toque nas estrelas para avaliar sua experiência.'}</p>
    </section>
    <section className="dg-bloco ds-pane" data-element={elemento} style={ordem(1)} aria-labelledby="dg-realizou-titulo">
      <h3 id="dg-realizou-titulo" className="dg-bloco-titulo">O que você realizou</h3>
      <dl className="dg-cifras">
        <div className="dg-cifra"><dt>Séries feitas</dt><dd><NumeroQueConta texto={String(sets.length)} atraso={120} /><small> de {totalSets}</small></dd></div>
        <div className="dg-cifra"><dt>Esforço médio</dt><dd>{active ? <><NumeroQueConta texto={oneDecimal(rpe)} atraso={180} /><small>/10</small></> : '—'}</dd></div>
        <div className="dg-cifra" data-larga=""><dt>Volume com carga</dt><dd>{volume > 0 ? <>{volume < 1000 ? <NumeroQueConta texto={oneDecimal(volume)} atraso={240} /> : volume.toLocaleString('pt-BR')}<small> kg·reps</small></> : <span className="dg-cifra-vazia">Sem carga registrada</span>}</dd></div>
      </dl>
      <details className="dg-grupo"><summary>Como o tempo é calculado<ChevronDown size={16} aria-hidden="true" /></summary><p className="dg-nota">O relógio mostra o tempo da sessão, descontando as pausas registradas. O tempo ativo usa as séries concluídas: duração informada nos blocos por tempo e estimativa de 4 segundos por repetição. Descansos e séries puladas ficam de fora.</p></details>
      <ol className="dg-lista" aria-label="Exercícios realizados">{session.exerciseResults.slice().sort((a, b) => a.order - b.order).map((exercise, indice) => {
        const definition = catalog.find(item => item.id === exercise.exerciseId);
        const media = resolveExerciseMedia(exercise, definition, definition?.legacyId ? getLegacy(definition.legacyId) : undefined);
        const done = exercise.sets.filter((set) => set.completed && !set.skipped).length;
        return <li key={exercise.id}><details className="dg-recibo" open={session.exerciseResults.length === 1}>
          <summary>
            <span className="dg-ordem" aria-hidden="true">{indice + 1}</span>
            <span className="dg-recibo-texto"><span className="dg-exercicio-nome">{exercise.exerciseNameSnapshot}<small>{done}/{exercise.sets.length} séries realizadas</small></span>
              <span className="dg-pips" aria-hidden="true">{exercise.sets.map((set) => <i key={set.id} className="dg-pip" data-estado={set.skipped ? 'pulada' : set.completed ? 'feita' : 'aberta'} />)}</span></span>
            <ChevronDown size={18} aria-hidden="true" className="dg-seta" />
          </summary>
          {(media.poster || media.src) && <div className="dg-recibo-midia"><VideoExercisePlayer title={exercise.exerciseNameSnapshot} {...media} /></div>}
          <ul className="dg-recibo-series">{exercise.sets.map((set) => {
            const feita = set.completed && !set.skipped;
            return <li key={set.id} className="dg-recibo-serie" data-estado={set.skipped ? 'pulada' : set.completed ? 'feita' : 'aberta'}>
              <span className="dg-recibo-selo" aria-hidden="true">{set.skipped ? <SkipForward size={16} /> : set.completed ? <Check size={16} strokeWidth={2.75} /> : set.setNumber}</span>
              <div className="dg-recibo-corpo">
                <p className="dg-recibo-nome">Série {set.setNumber} · {set.skipped ? 'Pulada' : set.completed ? 'Concluída' : 'Não realizada'}</p>
                {feita && <ul className="dg-runas">
                  <li className="dg-runa-valor">{set.measureMode === 'reps' ? `${set.reps ?? 0} repetições` : formatLongClock(set.durationSeconds ?? 0)}</li>
                  {set.measureMode === 'reps' && !!set.loadKg && <li>{set.loadKg} kg</li>}
                  <li>esforço {set.perceivedExertion ?? fallbackRpe}/10{set.perceivedExertion == null ? ' (padrão do treino)' : ''}</li>
                  <li>fator ×{set.loadFactor ?? 1}</li>
                  {set.distanceMeters != null && <li>{set.distanceMeters.toLocaleString('pt-BR')} m informados</li>}
                </ul>}
                {set.activityNotes && <p className="dg-recibo-nota">{set.activityNotes}</p>}
              </div>
            </li>;
          })}</ul>
          {exercise.notes && <p className="dg-recibo-nota dg-recibo-obs">{exercise.notes}</p>}
        </details></li>;
      })}</ol>
    </section>
    <section className="dg-bloco ds-pane" style={ordem(2)} aria-labelledby="dg-musculos-titulo">
      <h3 id="dg-musculos-titulo" className="dg-bloco-titulo">Perfil muscular estimado</h3>
      <p className="dg-nota">Perfil dos exercícios ponderado pelo tempo ativo realizado. É uma estimativa de distribuição, não uma medição do corpo.{mappedSeconds > 0 && mappedSeconds < active ? ' Alguns exercícios não têm perfil cadastrado e não entram nas barras.' : ''}</p>
      <MuscleBars distribution={distribution} maxItems={20} emptyMessage="Este treino não tem perfil muscular informado. Você pode adicioná-lo ao exercício para as próximas sessões." />
    </section>
    <section className="dg-bloco ds-pane" style={ordem(3)} aria-labelledby="dg-evolucao-titulo">
      <h3 id="dg-evolucao-titulo" className="dg-bloco-titulo">Evolução deste treino</h3>
      {trend.length > 1 ? <><p className="dg-nota">Tempo ativo registrado nas últimas sessões deste plano, em minutos. Inclui estimativas de repetições.</p><TrendAreaChart data={trend} height={180} unit="min" /></> : <p className="dg-nota">Sua primeira sessão é o ponto de partida. Ao repetir este plano, você verá a evolução aqui.</p>}
    </section>
  </>;
}
