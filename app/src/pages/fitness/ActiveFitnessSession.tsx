import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { sessionClockSeconds } from '@/lib/workout/session-clock';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { ExerciseCard, FitnessHeader, FitnessPageShell, VideoExercisePlayer } from '@/components/fitness-kit';
import { TreinoAnel } from '@/components/fitness-kit/treino-anel';
import { TreinoBarraAcao } from '@/components/fitness-kit/treino-barra';
import { TreinoCena } from '@/components/fitness-kit/treino-cena';
import { TreinoDescanso, useDescanso } from '@/components/fitness-kit/treino-descanso';
import { TreinoEstatisticas } from '@/components/fitness-kit/treino-estatisticas';
import '@/components/fitness-kit/treino-uau.css';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import { FitnessDurationField } from '@/components/workout/FitnessDurationField';
import { FitnessIntegerField } from '@/components/workout/FitnessIntegerField';
import { formatClock } from '@/lib/fitness-kit/format';
import { coreLevelToDefaultPerceivedExertion } from '@/lib/core/native-workout-reward';
import { resolveExerciseMedia } from '@/lib/workout/exercise-media';
import type { ExecutedExercise, NativeWorkoutSession, WorkoutSet } from '@/types/workout';

function NativeSetRow({ exercise, series, defaultEffortLevel }: { exercise: ExecutedExercise; series: WorkoutSet; defaultEffortLevel: number }) {
  const logSet = useWorkoutStore((state) => state.logSet);
  const [amount, setAmount] = useState(String(series.measureMode === 'reps' ? series.reps || series.targetReps || 0 : series.durationSeconds || series.targetDurationSeconds || 0));
  const [load, setLoad] = useState(String(series.loadKg ?? series.targetLoadKg ?? 0));
  const [distance, setDistance] = useState(String(series.distanceMeters ?? ''));
  const [notes, setNotes] = useState(series.activityNotes ?? '');
  const defaultRpe = coreLevelToDefaultPerceivedExertion(defaultEffortLevel);
  const [perceivedExertion, setPerceivedExertion] = useState(String(series.perceivedExertion ?? defaultRpe));
  const save = (completed = series.completed) => {
    const value = Number(amount.replace(',', '.'));
    const kg = Number(load.replace(',', '.'));
    if (!amount.trim() || !load.trim() || !Number.isFinite(value) || !Number.isFinite(kg)) return false;
    if (distance && (!Number.isFinite(Number(distance.replace(',', '.'))) || Number(distance.replace(',', '.')) < 0)) return false;
    return !!logSet(exercise.id, series.id, { distanceMeters: distance ? Number(distance.replace(',', '.')) : undefined, activityNotes: notes, loadKg: kg, perceivedExertion: Number(perceivedExertion), completed, skipped: false,
      ...(series.measureMode === 'reps' ? { reps: value } : { durationSeconds: value }) });
  };
  const inputClass = 'treino-campo';
  if (series.completed && !series.skipped) return <div className="treino-recibo fitness-set-receipt items-center justify-between">
    <p className="min-w-0 flex-1 text-base leading-snug text-fitness-text">Série {series.setNumber} · Concluída · {series.measureMode === 'reps' ? `${series.reps ?? 0} reps` : `${series.durationSeconds ?? 0}s`} · esforço {series.perceivedExertion ?? defaultRpe}/10</p>
    <button type="button" aria-label={`Desmarcar série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className="fitness-set-receipt-seal shrink-0 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[rgb(var(--el-gold))]" style={{ width: 48, height: 48 }} onClick={() => save(false)}><Check size={24} strokeWidth={2.75} /></button>
  </div>;
  return <div className="treino-serie">
    <div className="flex items-center justify-between gap-3"><span className="treino-serie-nome">Série {series.setNumber}</span><button type="button" aria-label={`${series.completed ? 'Desmarcar' : 'Concluir'} série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} aria-pressed={series.completed} className="treino-acao treino-acao--concluir !min-h-0 !p-0" style={{ width: 56, height: 56, borderRadius: '50%' }} onClick={() => { if (!save(!series.completed)) toast.error('Informe repetições ou segundos positivos e uma carga válida.'); }}><Check size={26} strokeWidth={2.75} /></button></div>
    <div className="treino-serie-campos" data-colunas="2">{series.measureMode === 'reps' ? <FitnessIntegerField label="Repetições" value={amount === '' ? undefined : Number(amount)} onChange={(value) => { setAmount(value == null ? '' : String(value)); if (value != null) logSet(exercise.id, series.id, { reps: value }); }} /> : <FitnessDurationField seconds={amount === '' ? undefined : Number(amount)} minutes={['running', 'swimming', 'cycling', 'martial_arts'].includes(exercise.modality ?? '')} onChange={(value) => { setAmount(value == null ? '' : String(value)); if (value != null) logSet(exercise.id, series.id, { durationSeconds: value }); }} />}{['running', 'swimming', 'cycling', 'martial_arts'].includes(exercise.modality ?? '') ? <p className="treino-campo-leitura">Descanso: {series.restSeconds ?? 0}s</p> : <label className="treino-campo-rotulo">Carga (kg)<input aria-label={`Carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} inputMode="decimal" className={inputClass} value={load} onChange={(event) => { const next = event.target.value; if (!/^\d*[.,]?\d*$/.test(next)) return; setLoad(next); if (next !== '') logSet(exercise.id, series.id, { loadKg: Number(next.replace(',', '.')) }); }} onBlur={() => save()} /></label>}</div>
    <label className="treino-campo-rotulo">Esforço percebido (1–10)<select name={`perceivedExertion-${series.id}`} autoComplete="off" aria-label={`Esforço percebido da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className={inputClass} value={perceivedExertion} onChange={(event) => { const next = event.target.value; setPerceivedExertion(next); logSet(exercise.id, series.id, { perceivedExertion: Number(next) }); }}>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value} · {value <= 2 ? 'Muito leve' : value <= 4 ? 'Leve' : value <= 6 ? 'Moderado' : value <= 8 ? 'Intenso' : 'Máximo'}</option>)}</select></label>
    {['running', 'swimming', 'cycling'].includes(exercise.modality ?? '') && <label className="treino-campo-rotulo">Distância deste bloco (metros, opcional)<input aria-label={`Distância da série ${series.setNumber}`} inputMode="decimal" className={inputClass} value={distance} onChange={event => { const next = event.target.value; if (!/^\d*[.,]?\d*$/.test(next)) return; setDistance(next); logSet(exercise.id, series.id, { distanceMeters: next ? Number(next.replace(',', '.')) : undefined }); }} /></label>}
    <label className="treino-campo-rotulo">O que você fez? (opcional)<textarea aria-label={`Descrição da série ${series.setNumber}`} maxLength={2000} rows={2} className="treino-campo mt-1" placeholder="Ex.: corrida leve, subida, técnica praticada…" value={notes} onChange={event => { setNotes(event.target.value); logSet(exercise.id, series.id, { activityNotes: event.target.value }); }} /></label>
    <p className="treino-ajuda">Descanso: {series.restSeconds ?? 0}s{series.completed ? ' · Concluída' : series.skipped ? ' · Pulada' : ''}</p>
    {!['running', 'swimming', 'cycling', 'martial_arts'].includes(exercise.modality ?? '') && <label className="treino-campo-rotulo">Fator de carga da série<select aria-label={`Fator de carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className={inputClass} value={series.loadFactor ?? 1} onChange={(event) => { if (!logSet(exercise.id, series.id, { loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 })) toast.error('Não foi possível atualizar o fator desta série.'); }}><option value="0.8">Leve (×0,8)</option><option value="1">Manutenção (×1,0)</option><option value="1.5">Progressão / PR (×1,5)</option></select></label>}
    {!series.completed && <button type="button" className="treino-acao w-full" onClick={() => logSet(exercise.id, series.id, { skipped: !series.skipped, completed: false })}>{series.skipped ? 'Retomar série' : 'Pular série'}</button>}
  </div>;
}

export function ActiveFitnessSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const session = useWorkoutStore((state) => state.activeNativeSession);
  const completedSession = useWorkoutStore((state) => state.nativeHistory.find((item) => item.id === sessionId && item.status === 'completed'));
  if (completedSession) return <Navigate to={`/treinos/resumo/${completedSession.id}`} replace />;
  return session && session.id === sessionId ? <SessionExecution key={session.id} onFinished={(finished) => navigate(`/treinos/resumo/${finished.id}`, { replace: true })} /> : <Navigate to="/fitness?tab=history" replace />;
}

function SessionExecution({ onFinished }: { onFinished: (session: NativeWorkoutSession) => void }) {
  const navigate = useNavigate();
  const session = useWorkoutStore((state) => state.activeNativeSession)!;
  const catalog = useWorkoutStore((state) => state.nativeCatalog);
  const togglePause = useWorkoutStore(state => state.toggleSessionPause);
  const finishSession = useWorkoutStore((state) => state.finishSession);
  const discardNativeSession = useWorkoutStore((state) => state.discardNativeSession);
  const [expanded, setExpanded] = useState<string | null>(session.exerciseResults[0]?.id ?? null);
  const [now, setNow] = useState(Date.now);
  const [confirm, setConfirm] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [actionHeight, setActionHeight] = useState<number>();
  const [finishing, setFinishing] = useState(false);
  // Rest only reads which sets are done: it never delays or records anything.
  // The session can vanish while finishing, before the screen navigates away, so it is read defensively.
  const resultados = session?.exerciseResults;
  const setsConcluidas = useMemo(
    () => (resultados ?? []).flatMap((exercise) => exercise.sets.filter((series) => series.completed && !series.skipped).map((series) => ({ id: series.id, descansoSegundos: series.restSeconds ?? 0 }))),
    [resultados],
  );
  const haSeriePendente = (resultados ?? []).some((exercise) => exercise.sets.some((series) => !series.completed && !series.skipped));
  const { descanso, dispensar } = useDescanso(setsConcluidas, haSeriePendente);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  // A conclusão pode remover a sessão antes da navegação ser processada.
  if (!session) return <Navigate to="/fitness?tab=history" replace />;
  const sets = session.exerciseResults.flatMap((exercise) => exercise.sets);
  const completed = sets.filter((series) => series.completed && !series.skipped).length;
  const doneSets = sets.filter(series => series.completed && !series.skipped);
  const activeMinutes = doneSets.reduce((sum, series) => sum + (series.measureMode === 'reps' ? (series.reps ?? 0) * 4 : series.durationSeconds ?? 0), 0) / 60;
  const distanceMeters = doneSets.reduce((sum, series) => sum + (series.distanceMeters ?? 0), 0);
  const pending = sets.some((series) => !series.completed && !series.skipped);
  const finish = () => {
    setFinishing(true);
    try { const result = finishSession(); if (result) { onFinished(result); } else {
      setFinishing(false);
      if (!useWorkoutStore.getState().activeNativeSession) { toast.info('Sessão vazia descartada, sem registro ou Prana.'); navigate('/fitness', { replace: true }); }
    } }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o treino. Tente novamente.'); setFinishing(false); }
  };
  return <FitnessPageShell focused withFixedAction fixedActionHeight={actionHeight} showPageMap={false}>
    <TreinoCena>
    <FitnessHeader title={session.nameSnapshot} subtitle={`${formatClock(sessionClockSeconds(session, now))} ${session.pausedAt ? '· pausado' : 'decorridos'}`} onBack={() => navigate('/fitness')} backLabel="Voltar à biblioteca mantendo o treino" />
    <section className="treino-progresso ds-pane treino-entra" aria-label="Progresso da sessão">
      <TreinoAnel valor={sets.length ? completed / sets.length : 0} tamanho={68} espessura={7} rotulo="Progresso do treino">{sets.length ? Math.round((completed / sets.length) * 100) : 0}%</TreinoAnel>
      <div className="treino-progresso-texto"><span className="treino-progresso-numero">{completed} de {sets.length}</span><p className="treino-progresso-rotulo" aria-live="polite">séries concluídas</p></div>
    </section>
    <button type="button" className="treino-acao mt-3 w-full" onClick={togglePause}>{session.pausedAt ? 'Retomar relógio' : 'Pausar relógio'}</button>
    <p className="mt-2 text-sm leading-snug text-fitness-muted">{session.pausedAt ? 'Interrupção pausada: este período não conta no treino.' : 'Descansos entre séries contam no tempo total. Pause apenas para interromper o treino.'}</p>
    {doneSets.length > 0 && <TreinoEstatisticas denso metrics={[
      { id: 'ativo', label: 'Tempo ativo registrado', value: activeMinutes.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), unit: 'min' },
      { id: 'distancia', label: 'Distância informada', value: distanceMeters > 0 ? (distanceMeters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—', unit: distanceMeters > 0 ? 'km' : undefined },
    ]} />}
    <div className="mt-5 space-y-4">{session.exerciseResults.slice().sort((a, b) => a.order - b.order).map((exercise) => {
      const done = exercise.sets.filter((series) => series.completed && !series.skipped).length;
      const definition = catalog.find((item) => item.id === exercise.exerciseId);
      const legacy = definition?.legacyId ? useWorkoutStore.getState().getExerciseById(definition.legacyId) : undefined;
      const media = resolveExerciseMedia(exercise, definition, legacy);
      return <ExerciseCard key={exercise.id} title={exercise.exerciseNameSnapshot} subtitle={`${done} de ${exercise.sets.length} séries`} state={done === exercise.sets.length ? 'completed' : expanded === exercise.id ? 'active' : 'pending'} progress={exercise.sets.length ? done / exercise.sets.length * 100 : 0} expanded={expanded === exercise.id} onToggle={() => setExpanded(expanded === exercise.id ? null : exercise.id)}><VideoExercisePlayer title={exercise.exerciseNameSnapshot} {...media} />{exercise.sets.map((series) => <NativeSetRow key={series.id} exercise={exercise} series={series} defaultEffortLevel={session.effortLevel ?? 1} />)}</ExerciseCard>;
    })}</div>
    </TreinoCena>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent className="fitness-dialog border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Finalizar com séries pendentes?</AlertDialogTitle><AlertDialogDescription>Somente as séries marcadas como concluídas entram no volume do treino.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar treino</AlertDialogCancel><AlertDialogAction disabled={finishing} className="bg-[rgb(var(--el-gold))] text-[rgb(var(--el-canvas))]" onClick={(event) => { event.preventDefault(); finish(); }}>Confirmar finalização</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}><AlertDialogContent className="fitness-dialog border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Cancelar este treino?</AlertDialogTitle><AlertDialogDescription>A sessão será descartada sem salvar no histórico e sem gerar XP ou alterar Prana. Seu template continuará na biblioteca.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar treino</AlertDialogCancel><AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => { if (discardNativeSession(session.id)) { navigate('/fitness', { replace: true }); toast.success('Treino cancelado sem salvar.'); } else toast.error('Não foi possível cancelar esta sessão.'); }}>Descartar treino</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <TreinoBarraAcao onHeightChange={setActionHeight}>
      {descanso && <TreinoDescanso key={descanso.fim} descanso={descanso} onDispensar={dispensar} />}
      <div className="treino-barra-botoes">
        <button type="button" className="treino-acao treino-acao--principal" disabled={finishing || confirm || confirmDiscard} onClick={() => pending ? setConfirm(true) : finish()}>{finishing ? 'Registrando…' : pending ? 'Finalizar treino' : 'Concluir treino'}</button>
        <button type="button" className="treino-acao" disabled={finishing || confirm || confirmDiscard} onClick={() => setConfirmDiscard(true)}>Cancelar treino</button>
      </div>
    </TreinoBarraAcao>
  </FitnessPageShell>;
}
