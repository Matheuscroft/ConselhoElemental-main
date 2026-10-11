import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { ExerciseCard, FitnessButton, FitnessHeader, FitnessPageShell, FitnessStickyAction } from '@/components/fitness-kit';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { FitnessIntegerField } from '@/components/workout/FitnessIntegerField';
import { formatClock } from '@/lib/fitness-kit/format';
import type { ExecutedExercise, NativeWorkoutSession, WorkoutSet } from '@/types/workout';

function NativeSetRow({ exercise, series }: { exercise: ExecutedExercise; series: WorkoutSet }) {
  const logSet = useWorkoutStore((state) => state.logSet);
  const [amount, setAmount] = useState(String(series.measureMode === 'reps' ? series.reps || series.targetReps || 0 : series.durationSeconds || series.targetDurationSeconds || 0));
  const [load, setLoad] = useState(String(series.loadKg ?? series.targetLoadKg ?? 0));
  const save = (completed = series.completed) => {
    const value = Number(amount.replace(',', '.'));
    const kg = Number(load.replace(',', '.'));
    if (!amount.trim() || !load.trim() || !Number.isFinite(value) || !Number.isFinite(kg)) return false;
    return !!logSet(exercise.id, series.id, { loadKg: kg, completed, skipped: false,
      ...(series.measureMode === 'reps' ? { reps: value } : { durationSeconds: value }) });
  };
  const inputClass = 'h-11 w-full rounded-xl bg-fitness-canvas px-3 text-base text-fitness-text outline-none focus:ring-2 focus:ring-fitness-primary';
  return <div className={`space-y-3 rounded-2xl p-4 ${series.completed ? 'bg-fitness-green/10' : 'bg-fitness-surface-muted'}`}>
    <div className="flex items-center justify-between"><span className="font-medium">Série {series.setNumber}</span><button type="button" aria-label={`${series.completed ? 'Desmarcar' : 'Concluir'} série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} aria-pressed={series.completed} className={`grid h-11 w-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-fitness-primary ${series.completed ? 'bg-fitness-green text-white' : 'bg-fitness-primary/15 text-fitness-primary'}`} onClick={() => { if (!save(!series.completed)) toast.error('Informe repetições ou segundos positivos e uma carga válida.'); }}><Check size={20} /></button></div>
    <div className="grid grid-cols-2 gap-3"><FitnessIntegerField label={series.measureMode === 'reps' ? 'Repetições' : 'Segundos'} value={amount === '' ? undefined : Number(amount)} onChange={(value) => { setAmount(value == null ? '' : String(value)); if (value != null) logSet(exercise.id, series.id, series.measureMode === 'reps' ? { reps: value } : { durationSeconds: value }); }} /><label className="text-xs text-fitness-muted">Carga (kg)<input aria-label={`Carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} inputMode="decimal" className={inputClass} value={load} onChange={(event) => { const next = event.target.value; if (!/^\d*[.,]?\d*$/.test(next)) return; setLoad(next); if (next !== '') logSet(exercise.id, series.id, { loadKg: Number(next.replace(',', '.')) }); }} onBlur={() => save()} /></label></div>
    <p className="text-xs text-fitness-muted">Descanso: {series.restSeconds ?? 0}s{series.completed ? ' · Concluída' : series.skipped ? ' · Pulada' : ''}</p>
    <label className="block space-y-1 text-xs text-fitness-muted">Fator de carga da série<select aria-label={`Fator de carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className={inputClass} value={series.loadFactor ?? 1} onChange={(event) => { if (!logSet(exercise.id, series.id, { loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 })) toast.error('Não foi possível atualizar o fator desta série.'); }}><option value="0.8">Leve (×0,8)</option><option value="1">Manutenção (×1,0)</option><option value="1.5">Progressão / PR (×1,5)</option></select></label>
    {!series.completed && <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => logSet(exercise.id, series.id, { skipped: !series.skipped, completed: false })}>{series.skipped ? 'Retomar série' : 'Pular série'}</FitnessButton>}
  </div>;
}

export function ActiveFitnessSession() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const session = useWorkoutStore((state) => state.activeNativeSession);
  const accountId = useWorkoutStore((state) => state.currentAccountId);
  const logs = useAppStore((state) => state.executionLogs);
  const [receipt, setReceipt] = useState<{ session: NativeWorkoutSession; accountId: string | null } | null>(null);
  if (receipt && receipt.accountId === accountId && receipt.session.id === sessionId) {
    const log = logs.find((item) => item.id === receipt.session.coreExecutionLogId);
    const showHistory = () => navigate('/fitness?tab=history', { replace: true });
    return <FitnessPageShell fullscreen focused showPageMap={false}><FitnessHeader title="Treino concluído!" /><AlertDialog open onOpenChange={(open) => { if (!open) showHistory(); }}><AlertDialogContent className="border-emerald-400/20 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle className="text-center text-2xl">Treino concluído!</AlertDialogTitle><AlertDialogDescription className="text-center">Sua execução foi registrada. Você deu mais um passo em Terra.</AlertDialogDescription></AlertDialogHeader><div className="space-y-3 rounded-2xl bg-emerald-400/10 px-4 py-8 text-center"><span className="text-4xl" aria-hidden="true">🌿</span>{log ? <p className="break-words text-5xl font-bold tabular-nums text-emerald-300 motion-safe:animate-in motion-safe:slide-in-from-top-4 motion-safe:duration-500">+{formatEarthXp(log.executedValue)} XP</p> : <p className="text-lg text-fitness-muted">Recompensa sem registro ativo.</p>}<p className="font-medium text-emerald-200">Terra</p><p className="text-sm text-fitness-muted">{receipt.session.nameSnapshot}</p></div><AlertDialogFooter><AlertDialogAction className="w-full rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-200" onClick={showHistory}>Ver Histórico</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></FitnessPageShell>;
  }
  return session && session.id === sessionId ? <SessionExecution key={session.id} onFinished={(finished) => setReceipt({ session: finished, accountId })} /> : <Navigate to="/fitness?tab=history" replace />;
}

function SessionExecution({ onFinished }: { onFinished: (session: NativeWorkoutSession) => void }) {
  const navigate = useNavigate();
  const session = useWorkoutStore((state) => state.activeNativeSession)!;
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
  const pending = sets.some((series) => !series.completed && !series.skipped);
  const finish = () => {
    setFinishing(true);
    try { const result = finishSession(); if (result) { onFinished(result); } else setFinishing(false); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o treino. Tente novamente.'); setFinishing(false); }
  };
  return <FitnessPageShell fullscreen focused withFixedAction fixedActionHeight={actionHeight} showPageMap={false}>
    <FitnessHeader title={session.nameSnapshot} subtitle={`${formatClock(Math.max(0, Math.floor((now - Date.parse(session.startedAt)) / 1000)))} decorridos · esforço ${session.effortLevel ?? 1}`} onBack={() => navigate('/fitness')} backLabel="Voltar à biblioteca mantendo o treino" />
    <div className="mt-6"><p className="text-center text-sm text-fitness-muted" aria-live="polite">{completed} de {sets.length} séries concluídas</p><progress className="mt-3 h-1.5 w-full accent-fitness-green" value={completed} max={Math.max(1, sets.length)} aria-label="Progresso do treino" /></div>
    <div className="mt-6 space-y-5">{session.exerciseResults.slice().sort((a, b) => a.order - b.order).map((exercise) => {
      const done = exercise.sets.filter((series) => series.completed && !series.skipped).length;
      return <ExerciseCard key={exercise.id} title={exercise.exerciseNameSnapshot} subtitle={`${done} de ${exercise.sets.length} séries`} state={done === exercise.sets.length ? 'completed' : expanded === exercise.id ? 'active' : 'pending'} progress={exercise.sets.length ? done / exercise.sets.length * 100 : 0} expanded={expanded === exercise.id} onToggle={() => setExpanded(expanded === exercise.id ? null : exercise.id)}>{exercise.sets.map((series) => <NativeSetRow key={series.id} exercise={exercise} series={series} />)}</ExerciseCard>;
    })}</div>
    <AlertDialog open={confirm} onOpenChange={setConfirm}><AlertDialogContent className="border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Finalizar com séries pendentes?</AlertDialogTitle><AlertDialogDescription>Somente as séries marcadas como concluídas entram no volume do treino.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar treino</AlertDialogCancel><AlertDialogAction disabled={finishing} className="bg-fitness-primary text-white" onClick={(event) => { event.preventDefault(); finish(); }}>Confirmar finalização</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}><AlertDialogContent className="border-white/10 bg-fitness-canvas text-fitness-text"><AlertDialogHeader><AlertDialogTitle>Cancelar este treino?</AlertDialogTitle><AlertDialogDescription>A sessão será descartada sem salvar no histórico e sem gerar XP ou alterar Prana. Seu template continuará na biblioteca.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Continuar treino</AlertDialogCancel><AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => { if (discardNativeSession(session.id)) { navigate('/fitness', { replace: true }); toast.success('Treino cancelado sem salvar.'); } else toast.error('Não foi possível cancelar esta sessão.'); }}>Descartar treino</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    <FitnessStickyAction focused onHeightChange={setActionHeight}><div className="flex w-full flex-col gap-2"><FitnessButton className="w-full" disabled={finishing || confirm || confirmDiscard} onClick={() => pending ? setConfirm(true) : finish()}>{finishing ? 'Registrando…' : 'Finalizar Treino'}</FitnessButton><FitnessButton variant="secondary" size="md" className="w-full" disabled={finishing || confirm || confirmDiscard} onClick={() => setConfirmDiscard(true)}>Cancelar treino</FitnessButton></div></FitnessStickyAction>
  </FitnessPageShell>;
}
