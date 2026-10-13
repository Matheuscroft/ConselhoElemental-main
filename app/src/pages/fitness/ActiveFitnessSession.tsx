import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { sessionClockSeconds } from '@/lib/workout/session-clock';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { ExerciseCard, FitnessButton, FitnessHeader, FitnessPageShell, FitnessStickyAction, VideoExercisePlayer } from '@/components/fitness-kit';
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
  const inputClass = 'h-11 w-full rounded-xl bg-fitness-canvas px-3 text-base text-fitness-text outline-none focus:ring-2 focus:ring-fitness-primary';
  if (series.completed && !series.skipped) return <div className="flex items-center justify-between gap-3 rounded-2xl bg-fitness-green/10 p-4">
    <p className="text-sm text-fitness-text-soft">Série {series.setNumber} · Concluída · {series.measureMode === 'reps' ? `${series.reps ?? 0} reps` : `${series.durationSeconds ?? 0}s`} · esforço {series.perceivedExertion ?? defaultRpe}/10</p>
    <button type="button" aria-label={`Desmarcar série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fitness-green/15 text-fitness-green focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => save(false)}><Check size={20} /></button>
  </div>;
  return <div className={`space-y-3 rounded-2xl p-4 ${series.completed ? 'bg-fitness-green/10' : 'bg-fitness-surface-muted'}`}>
    <div className="flex items-center justify-between"><span className="font-medium">Série {series.setNumber}</span><button type="button" aria-label={`${series.completed ? 'Desmarcar' : 'Concluir'} série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} aria-pressed={series.completed} className={`grid h-11 w-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-fitness-primary ${series.completed ? 'bg-fitness-green text-white' : 'bg-fitness-primary/15 text-fitness-primary'}`} onClick={() => { if (!save(!series.completed)) toast.error('Informe repetições ou segundos positivos e uma carga válida.'); }}><Check size={20} /></button></div>
    <div className="grid grid-cols-2 gap-3">{series.measureMode === 'reps' ? <FitnessIntegerField label="Repetições" value={amount === '' ? undefined : Number(amount)} onChange={(value) => { setAmount(value == null ? '' : String(value)); if (value != null) logSet(exercise.id, series.id, { reps: value }); }} /> : <FitnessDurationField seconds={amount === '' ? undefined : Number(amount)} minutes={['running', 'swimming', 'cycling', 'martial_arts'].includes(exercise.modality ?? '')} onChange={(value) => { setAmount(value == null ? '' : String(value)); if (value != null) logSet(exercise.id, series.id, { durationSeconds: value }); }} />}{['running', 'swimming', 'cycling', 'martial_arts'].includes(exercise.modality ?? '') ? <p className="self-center text-sm text-fitness-muted">Descanso: {series.restSeconds ?? 0}s</p> : <label className="text-xs text-fitness-muted">Carga (kg)<input aria-label={`Carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} inputMode="decimal" className={inputClass} value={load} onChange={(event) => { const next = event.target.value; if (!/^\d*[.,]?\d*$/.test(next)) return; setLoad(next); if (next !== '') logSet(exercise.id, series.id, { loadKg: Number(next.replace(',', '.')) }); }} onBlur={() => save()} /></label>}</div>
    <label className="block text-xs text-fitness-muted">Esforço percebido (1–10)<select name={`perceivedExertion-${series.id}`} autoComplete="off" aria-label={`Esforço percebido da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className={inputClass} value={perceivedExertion} onChange={(event) => { const next = event.target.value; setPerceivedExertion(next); logSet(exercise.id, series.id, { perceivedExertion: Number(next) }); }}>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value} · {value <= 2 ? 'Muito leve' : value <= 4 ? 'Leve' : value <= 6 ? 'Moderado' : value <= 8 ? 'Intenso' : 'Máximo'}</option>)}</select></label>
    {['running', 'swimming', 'cycling'].includes(exercise.modality ?? '') && <label className="block text-xs text-fitness-muted">Distância deste bloco (metros, opcional)<input aria-label={`Distância da série ${series.setNumber}`} inputMode="decimal" className={inputClass} value={distance} onChange={event => { const next = event.target.value; if (!/^\d*[.,]?\d*$/.test(next)) return; setDistance(next); logSet(exercise.id, series.id, { distanceMeters: next ? Number(next.replace(',', '.')) : undefined }); }} /></label>}
    <label className="block text-xs text-fitness-muted">O que você fez? (opcional)<textarea aria-label={`Descrição da série ${series.setNumber}`} maxLength={2000} rows={2} className="mt-1 w-full resize-y rounded-xl bg-fitness-canvas p-3 text-sm text-fitness-text focus:ring-2 focus:ring-fitness-primary" placeholder="Ex.: corrida leve, subida, técnica praticada…" value={notes} onChange={event => { setNotes(event.target.value); logSet(exercise.id, series.id, { activityNotes: event.target.value }); }} /></label>
    <p className="text-xs text-fitness-muted">Descanso: {series.restSeconds ?? 0}s{series.completed ? ' · Concluída' : series.skipped ? ' · Pulada' : ''}</p>
    {!['running', 'swimming', 'cycling', 'martial_arts'].includes(exercise.modality ?? '') && <label className="block space-y-1 text-xs text-fitness-muted">Fator de carga da série<select aria-label={`Fator de carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className={inputClass} value={series.loadFactor ?? 1} onChange={(event) => { if (!logSet(exercise.id, series.id, { loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 })) toast.error('Não foi possível atualizar o fator desta série.'); }}><option value="0.8">Leve (×0,8)</option><option value="1">Manutenção (×1,0)</option><option value="1.5">Progressão / PR (×1,5)</option></select></label>}
    {!series.completed && <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => logSet(exercise.id, series.id, { skipped: !series.skipped, completed: false })}>{series.skipped ? 'Retomar série' : 'Pular série'}</FitnessButton>}
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
    try { const result = finishSession(); if (result) { onFinished(result); } else setFinishing(false); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o treino. Tente novamente.'); setFinishing(false); }
  };
  return <FitnessPageShell focused withFixedAction fixedActionHeight={actionHeight} showPageMap={false}>
    <FitnessHeader title={session.nameSnapshot} subtitle={`${formatClock(sessionClockSeconds(session, now))} ${session.pausedAt ? '· pausado' : 'decorridos'}`} onBack={() => navigate('/fitness')} backLabel="Voltar à biblioteca mantendo o treino" />
    <div className="mt-4 flex justify-center"><FitnessButton size="md" variant="secondary" onClick={togglePause}>{session.pausedAt ? 'Retomar relógio' : 'Pausar relógio'}</FitnessButton></div>
    {session.pausedAt && <p className="mt-2 text-center text-xs text-fitness-muted">Relógio pausado. Você pode revisar seus registros.</p>}
    <div className="mt-6"><p className="text-center text-sm text-fitness-muted" aria-live="polite">{completed} de {sets.length} séries concluídas</p><progress className="mt-3 h-1.5 w-full accent-fitness-green" value={completed} max={Math.max(1, sets.length)} aria-label="Progresso do treino" /></div>
    {doneSets.length > 0 && <dl className="mt-5 grid grid-cols-2 gap-4 rounded-2xl bg-fitness-surface p-4 text-sm"><div><dt className="text-fitness-muted">Tempo ativo registrado</dt><dd className="mt-1 text-xl text-fitness-primary">{activeMinutes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min</dd></div><div><dt className="text-fitness-muted">Distância informada</dt><dd className="mt-1 text-xl text-fitness-primary">{distanceMeters > 0 ? `${(distanceMeters / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} km` : '—'}</dd></div></dl>}
    <div className="mt-6 space-y-5">{session.exerciseResults.slice().sort((a, b) => a.order - b.order).map((exercise) => {
      const done = exercise.sets.filter((series) => series.completed && !series.skipped).length;
      const definition = catalog.find((item) => item.id === exercise.exerciseId);
      const legacy = definition?.legacyId ? useWorkoutStore.getState().getExerciseById(definition.legacyId) : undefined;
      const media = resolveExerciseMedia(exercise, definition, legacy);
      return <ExerciseCard key={exercise.id} title={exercise.exerciseNameSnapshot} subtitle={`${done} de ${exercise.sets.length} séries`} state={done === exercise.sets.length ? 'completed' : expanded === exercise.id ? 'active' : 'pending'} progress={exercise.sets.length ? done / exercise.sets.length * 100 : 0} expanded={expanded === exercise.id} onToggle={() => setExpanded(expanded === exercise.id ? null : exercise.id)}><VideoExercisePlayer title={exercise.exerciseNameSnapshot} {...media} />{exercise.sets.map((series) => <NativeSetRow key={series.id} exercise={exercise} series={series} defaultEffortLevel={session.effortLevel ?? 1} />)}</ExerciseCard>;
    })}</div>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent className="border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Finalizar com séries pendentes?</AlertDialogTitle><AlertDialogDescription>Somente as séries marcadas como concluídas entram no volume do treino.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar treino</AlertDialogCancel><AlertDialogAction disabled={finishing} className="bg-fitness-primary text-white" onClick={(event) => { event.preventDefault(); finish(); }}>Confirmar finalização</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}><AlertDialogContent className="border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Cancelar este treino?</AlertDialogTitle><AlertDialogDescription>A sessão será descartada sem salvar no histórico e sem gerar XP ou alterar Prana. Seu template continuará na biblioteca.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar treino</AlertDialogCancel><AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => { if (discardNativeSession(session.id)) { navigate('/fitness', { replace: true }); toast.success('Treino cancelado sem salvar.'); } else toast.error('Não foi possível cancelar esta sessão.'); }}>Descartar treino</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <FitnessStickyAction focused layout="row" onHeightChange={setActionHeight}><div className="grid w-full grid-cols-2 gap-3"><FitnessButton size="md" className="w-full whitespace-nowrap px-3 text-sm" disabled={finishing || confirm || confirmDiscard} onClick={() => pending ? setConfirm(true) : finish()}>{finishing ? 'Registrando…' : pending ? 'Finalizar treino' : 'Concluir treino'}</FitnessButton><FitnessButton variant="secondary" size="md" className="w-full whitespace-nowrap px-3 text-sm" disabled={finishing || confirm || confirmDiscard} onClick={() => setConfirmDiscard(true)}>Cancelar treino</FitnessButton></div></FitnessStickyAction>
  </FitnessPageShell>;
}
