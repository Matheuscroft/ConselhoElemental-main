import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { NativeWorkoutSession } from '@/types/workout';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Pencil, Play, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Habit } from '@/types';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { projectNativeLeafReward } from '@/lib/core/native-action-completion';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { projectWorkoutProgress } from '@/lib/workout/native-progress-reward';
import { getWorkoutFocus, getExerciseFocus } from '@/lib/workout/workout-focus';
import { FitnessButton } from '@/components/fitness-kit';
import { FitnessIntegerField } from './FitnessIntegerField';

export function FitnessHabitWidget({ habit, date, embedded = false, showAdministrativeActions = true }: { habit: Habit; date: Date; embedded?: boolean; showAdministrativeActions?: boolean }) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [rewardPopup, setRewardPopup] = useState<{ xp: number; id: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState<Record<number, boolean>>({});
  const [editingSets, setEditingSets] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!rewardPopup) return;
    const frame = requestAnimationFrame(() => cardRef.current?.scrollIntoView({ block: 'center', behavior: reducedMotion ? 'auto' : 'smooth' }));
    const timer = window.setTimeout(() => setRewardPopup(null), 2000);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(timer); };
  }, [rewardPopup, reducedMotion]);
  const template = useWorkoutStore((state) => state.templates.find((item) => item.id === habit.sourceRefId));
  const catalog = useWorkoutStore((state) => state.nativeCatalog);
  const focus = getWorkoutFocus(template, catalog);
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const history = useWorkoutStore((state) => state.nativeHistory);
  const beginWorkout = useWorkoutStore((state) => state.beginHabitWorkout);
  const checkin = useWorkoutStore((state) => state.nativeCheckins[habit.id]);
  const updateCheckin = useWorkoutStore((state) => state.updateHabitCheckin);
  const finishCheckin = useWorkoutStore((state) => state.finishHabitCheckin);
  const undoWorkout = useWorkoutStore((state) => state.undoHabitWorkout);
  const logSet = useWorkoutStore((state) => state.logSet);
  const finish = useWorkoutStore((state) => state.finishSession);
  const logs = useAppStore((state) => state.executionLogs);
  const today = new Date().toDateString();
  const completed = habit.completions.some((item) => new Date(item.completionDate).toDateString() === date.toDateString());
  const receipt = logs.find((item) => item.subjectId === habit.id && item.subjectType === 'HABIT' && new Date(item.timestamp).toDateString() === date.toDateString());
  const matching = !!active && active.executionMode === 'LIVE' && active.templateId === template?.id && active.coreHabitId === habit.id && new Date(active.startedAt).toDateString() === today;
  const disabled = completed || !template || date.toDateString() !== today || (!!active && !matching);
  const recorded = history.find((session) => (receipt ? session.coreExecutionLogId === receipt.id :
    session.coreHabitId === habit.id && new Date(session.completedAt ?? session.startedAt).toDateString() === date.toDateString()));
  const currentCheckin = checkin && new Date(checkin.startedAt).toDateString() === today ? checkin : undefined;
  const sessionExercises = recorded?.exerciseResults ?? (matching ? active!.exerciseResults : currentCheckin?.exerciseResults ?? template?.exercises ?? []);
  const minutes = habit.plannedTimeMinutes ?? 0;
  const preview = projectNativeLeafReward(habit.baseValue ?? habit.plannedPoints ?? 0, minutes * 60, habit.effortLevel ?? 3, minutes > 0).executedValue;
  const progressSession = recorded ?? (matching ? active : currentCheckin);
  const progress = progressSession ? projectWorkoutProgress(progressSession.exerciseResults, minutes, progressSession.effortLevel ?? habit.effortLevel ?? 3,
    progressSession.executionMode !== 'CHECKIN' ? recorded?.durationSeconds ?? Math.max(0, Math.floor((Date.now() - Date.parse(progressSession.startedAt)) / 1000)) : undefined) : undefined;
  const dayCompletion = habit.completions.find((item) => new Date(item.completionDate).toDateString() === date.toDateString());
  const earnedXp = receipt?.executedValue ?? recorded?.earnedXp ?? dayCompletion?.executedScore ?? dayCompletion?.scoreEarned;
  const cumulativeXp = completed ? earnedXp : progress?.earthXp;
  const hasProgress = !completed && !!progressSession?.exerciseResults.some((exercise) => exercise.sets.some((series) => series.completed && !series.skipped));
  const displayedXp = completed ? earnedXp : hasProgress ? cumulativeXp : preview;
  const aboveTarget = displayedXp !== undefined && Math.round(displayedXp * 10) > Math.round(preview * 10);
  const belowTarget = completed && displayedXp !== undefined && Math.round(displayedXp * 10) < Math.round(preview * 10);
  const partial = completed && (receipt?.fullCompletion === false || recorded?.exerciseResults.some((exercise) => exercise.sets.some((series) => !series.completed || series.skipped)));
  const badgeTitle = aboveTarget ? 'Meta superada' : completed ? partial ? 'Treino concluído parcialmente' : belowTarget ? 'Resultado abaixo do planejado' : 'Treino concluído'
    : hasProgress ? 'XP acumulado / XP planejado' : 'XP planejado';
  const badgeStyle = aboveTarget ? 'border-amber-300/50 bg-gradient-to-r from-emerald-500/25 via-teal-400/20 to-amber-400/25 text-amber-200 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
    : partial || belowTarget ? 'border-amber-400/25 bg-amber-500/15 text-amber-300'
    : 'border-emerald-400/20 bg-emerald-500/15 text-emerald-300';
  const exerciseXp = progress?.exerciseER.map((volume) => progress.totalER > 0
    ? (completed ? earnedXp ?? progress.earthXp : progress.earthXp) * volume / progress.totalER : 0);
  const ensureSession = () => {
    if (disabled || !template) return undefined;
    return beginWorkout(habit.id);
  };
  const openModule = (action: 'edit' | 'delete') => {
    if (template) navigate(`/fitness?modalidade=${template.modality}&${action}=${template.id}`);
    else navigate('/fitness');
  };
  const completeWorkout = () => {
    try { const result = matching ? finish(habit.id) : finishCheckin(habit.id); if (result) celebrateCompletion(result); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível concluir.'); }
  };
  const celebrateCompletion = (result: NativeWorkoutSession) => {
    setExpanded(false);
    if (result.earnedXp !== undefined) setRewardPopup({ xp: result.earnedXp, id: Date.now() });
  };
  const toggleWorkout = () => {
    if (!completed) { completeWorkout(); return; }
    try { undoWorkout(habit.id, date); toast.success('Registro desfeito. Séries e valores preservados.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível desfazer.'); }
  };
  const toggleExercise = (exerciseIndex: number, checked: boolean) => {
    try {
      const exercise = sessionExercises[exerciseIndex];
      const hasMarkedSeries = exercise.sets.some((series) => series.completed && !series.skipped);
      let updated: NativeWorkoutSession | undefined;
      for (let index = 0; index < exercise.sets.length; index++) {
        const series = exercise.sets[index];
        const performed = checked && (!hasMarkedSeries || (series.completed && !series.skipped));
        const updates = { completed: performed, skipped: checked && !performed, loadKg: series.loadKg ?? series.targetLoadKg ?? 0,
          ...(series.measureMode === 'reps' ? { reps: series.reps ?? series.targetReps } : { durationSeconds: series.durationSeconds ?? series.targetDurationSeconds }) };
        if (matching && active) {
          const nativeExercise = active.exerciseResults[exerciseIndex];
          updated = logSet(nativeExercise.id, nativeExercise.sets[index].id, updates);
        } else updated = updateCheckin(habit.id, exerciseIndex, index, updates);
        if (!updated) throw new Error('Confira os valores das séries deste exercício.');
      }
      if (checked) setCollapsedExercises((current) => ({ ...current, [exerciseIndex]: true }));
      if (checked && updated?.exerciseResults.length && updated.exerciseResults.every((item) => item.sets.every((set) => set.completed || set.skipped))) {
        const result = matching ? finish(habit.id) : finishCheckin(habit.id);
        if (result) celebrateCompletion(result);
      }
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o exercício.'); }
  };
  return <div ref={cardRef} className={embedded ? 'relative space-y-4 scroll-mt-20' : 'glass-card relative space-y-4 scroll-mt-20 rounded-2xl border border-white/10 p-4 shadow-lg'}>
    {createPortal(<AnimatePresence>{rewardPopup && <motion.div key={rewardPopup.id} role="status" aria-live="polite"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 12, scale: reducedMotion ? 1 : 0.9 }}
      animate={{ opacity: [0, 1, 1, 0], y: reducedMotion ? 0 : [12, -8, -28, -48], scale: reducedMotion ? 1 : [0.9, 1.05, 1, 1] }}
      transition={{ duration: 1.9, times: [0, 0.15, 0.7, 1] }}
      style={{ left: 'calc(50% - 3.5rem)', top: '45%' }}
      className="pointer-events-none fixed z-[9999] rounded-xl border border-emerald-300/40 bg-emerald-950/95 px-3 py-1.5 text-center text-emerald-200 shadow-[0_0_16px_rgba(52,211,153,0.25)]">
      <span className="block text-sm font-bold">+{formatEarthXp(rewardPopup.xp)} XP 🌿</span><span className="text-[10px] text-emerald-300">Terra</span>
    </motion.div>}</AnimatePresence>, document.body)}
    <div className="flex items-start gap-3">
      <input type="checkbox" aria-label={`${completed ? 'Desfazer' : 'Concluir'} ${habit.title}`} checked={completed} disabled={completed ? date.toDateString() !== today : disabled} onChange={toggleWorkout} className="mt-2 h-5 w-5 shrink-0 accent-emerald-500" />
      <div className="min-w-0 flex-1">
        <button type="button" className="flex min-h-9 w-full items-center gap-2 text-left" aria-expanded={expanded} aria-controls={`fitness-habit-${habit.id}`} onClick={() => setExpanded((value) => !value)}><span className={`min-w-0 flex-1 break-words font-medium ${completed ? 'text-white/60' : ''}`}>{focus && <span role="img" aria-label={`Foco predominante: ${focus.label}`} className="mr-2">{focus.emoji}</span>}{habit.title}</span><span aria-live="polite" aria-label={badgeTitle} title={badgeTitle} className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${badgeStyle}`}>{aboveTarget && <Sparkles size={12} />}{displayedXp === undefined ? '—' : hasProgress ? `${formatEarthXp(displayedXp)}/${formatEarthXp(preview)}` : formatEarthXp(displayedXp)} XP 🌿</span><ChevronDown size={16} className={`shrink-0 text-white/50 transition-transform ${expanded ? 'rotate-180' : ''}`} /></button>
        <div className="mt-1 flex flex-wrap items-center gap-2">

          {!completed && <button type="button" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-violet-500/15 px-3 text-xs font-medium text-violet-300 hover:bg-violet-500/25 disabled:opacity-40" disabled={disabled} onClick={() => { try { const session = ensureSession(); if (session) navigate(`/fitness/ativo/${session.id}`); else toast.error('Não foi possível iniciar este treino.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível abrir o treino.'); } }}><Play size={13} />Executar</button>}
        </div>
      </div>
    </div>
    <div id={`fitness-habit-${habit.id}`} hidden={!expanded} className="space-y-4">
      {!template && <p className="text-sm text-white/60">O template não está mais na biblioteca.</p>}
      {sessionExercises.map((exercise, exerciseIndex) => { const exerciseFocus = getExerciseFocus(exercise.exerciseId, catalog); const completedSeries = exercise.sets.filter((series) => series.completed && !series.skipped).length; const exerciseResolved = exercise.sets.length > 0 && exercise.sets.every((series) => series.completed || series.skipped); const partialExercise = (completed || exerciseResolved) && completedSeries < exercise.sets.length; return <section key={exercise.id} className="space-y-2 rounded-xl border border-white/10 p-3"><div className="flex items-center gap-2"><input type="checkbox" aria-label={`Encerrar ${exercise.exerciseNameSnapshot} com as séries realizadas`} className="h-5 w-5 shrink-0 accent-emerald-500" disabled={disabled || !exercise.sets.length} checked={!!(matching || recorded || currentCheckin) && exercise.sets.length > 0 && exercise.sets.every((series) => series.completed || series.skipped)} ref={(element) => { if (element) { const count = exercise.sets.filter((series) => series.completed && !series.skipped).length; element.indeterminate = count > 0 && exercise.sets.some((series) => !series.completed && !series.skipped); } }} onChange={(event) => toggleExercise(exerciseIndex, event.target.checked)} /><button type="button" className="flex min-h-10 w-full items-center gap-2 text-left" aria-expanded={!collapsedExercises[exerciseIndex]} aria-controls={`fitness-exercise-${habit.id}-${exerciseIndex}`} onClick={() => setCollapsedExercises((current) => ({ ...current, [exerciseIndex]: !current[exerciseIndex] }))}><span className="min-w-0 flex-1 break-words text-sm font-medium">{exerciseFocus && <span role="img" aria-label={`Foco: ${exerciseFocus.label}`} className="mr-2">{exerciseFocus.emoji}</span>}{exercise.exerciseNameSnapshot}</span><span className="flex shrink-0 flex-col items-end gap-1">{exerciseXp && <span aria-live="polite" title={partialExercise ? 'Exercício realizado parcialmente' : 'Participação deste exercício no XP acumulado do treino'} className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${partialExercise ? 'bg-amber-500/15 text-amber-300' : 'bg-emerald-500/15 text-emerald-300'}`}>+{formatEarthXp(exerciseXp[exerciseIndex] ?? 0)} XP 🌿</span>}<span className="shrink-0 text-xs text-white/40">{partialExercise ? `${completedSeries}/${exercise.sets.length}` : exercise.sets.length} séries</span></span><ChevronDown size={15} className={collapsedExercises[exerciseIndex] ? '' : 'rotate-180'} /></button></div><div id={`fitness-exercise-${habit.id}-${exerciseIndex}`} hidden={!!collapsedExercises[exerciseIndex]} className="space-y-2">{exercise.sets.map((series, setIndex) => {
        const update = (updates: Parameters<typeof logSet>[2]) => {
          try {
            let updated;
            if (matching && active) {
              const nativeExercise = active.exerciseResults[exerciseIndex];
              const nativeSet = nativeExercise?.sets[setIndex];
              updated = nativeExercise && nativeSet ? logSet(nativeExercise.id, nativeSet.id, updates) : undefined;
            } else updated = updateCheckin(habit.id, exerciseIndex, setIndex, updates);
            if (!updated) { toast.error('Confira os valores desta série.'); return; }
            const updatedExercise = updated.exerciseResults[exerciseIndex];
            if (updates.completed && updatedExercise?.sets.length && updatedExercise.sets.every((set) => set.completed || set.skipped)) {
              setCollapsedExercises((current) => ({ ...current, [exerciseIndex]: true }));
            }
            if (updates.completed && updated.exerciseResults.length && updated.exerciseResults.every((item) => item.sets.every((set) => set.completed || set.skipped))) {
              const result = matching ? finish(habit.id) : finishCheckin(habit.id);
              if (result) {
                celebrateCompletion(result);
              }
            }
          } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível registrar a série.'); }
        };
        const checked = (matching || !!recorded || !!currentCheckin) && series.completed;
        const editKey = `${exerciseIndex}-${setIndex}`;
        const showDetails = !checked || editingSets[editKey];
        return <div key={series.id} className={`rounded-xl bg-white/5 ${checked ? 'p-2' : 'p-3'}`}><div className="flex flex-wrap items-center gap-2"><label className="flex min-h-9 items-center gap-2 text-xs"><input type="checkbox" className="h-5 w-5 accent-emerald-500" disabled={disabled} checked={!!checked} onChange={(event) => update({ completed: event.target.checked, skipped: false, ...(series.measureMode === 'reps' ? { reps: series.reps ?? series.targetReps } : { durationSeconds: series.durationSeconds ?? series.targetDurationSeconds }), loadKg: series.loadKg ?? series.targetLoadKg ?? 0 })} />Série {series.setNumber}</label>{checked && <><span className="text-xs text-white/60">{series.measureMode === 'reps' ? `${series.reps ?? series.targetReps ?? 0} reps` : `${series.durationSeconds ?? series.targetDurationSeconds ?? 0} s`} · {series.loadKg ?? series.targetLoadKg ?? 0} kg</span><button type="button" disabled={disabled} aria-label={`Ajustar série ${series.setNumber}`} aria-expanded={!!editingSets[editKey]} onClick={() => setEditingSets((current) => ({ ...current, [editKey]: !current[editKey] }))} className="ml-auto grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 disabled:opacity-30"><Pencil size={14} /></button></>}</div>{showDetails && <fieldset disabled={disabled} className="mt-2 grid grid-cols-2 gap-2"><FitnessIntegerField label={series.measureMode === 'reps' ? 'Repetições' : 'Segundos'} value={series.measureMode === 'reps' ? series.reps ?? series.targetReps : series.durationSeconds ?? series.targetDurationSeconds} onChange={(value) => { if (value !== undefined) update(series.measureMode === 'reps' ? { reps: value } : { durationSeconds: value }); }} /><label className="text-xs text-white/60">Carga (kg)<input type="number" min="0" step="0.1" className="mt-1 h-12 w-full rounded-xl bg-fitness-canvas px-3 text-base text-white" value={series.loadKg ?? series.targetLoadKg ?? 0} onChange={(event) => update({ loadKg: Number(event.target.value) })} /></label><select aria-label={`Fator de carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className="col-span-2 h-11 rounded-xl bg-fitness-canvas px-3 text-sm" value={series.loadFactor ?? 1} onChange={(event) => update({ loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 })}><option value="0.8">Leve ×0,8</option><option value="1">Manutenção ×1</option><option value="1.5">Progressão / PR ×1,5</option></select></fieldset>}</div>;
      })}</div></section>; })}
      {!completed && date.toDateString() !== today && <p className="text-xs text-white/60">Execução inline disponível no dia de hoje.</p>}
      {active && !matching && <p className="text-xs text-white/60">Conclua ou cancele a outra sessão ativa antes de iniciar este ciclo.</p>}
      {showAdministrativeActions && <div className="grid grid-cols-2 gap-2"><FitnessButton size="md" variant="secondary" onClick={() => openModule('edit')}>Editar</FitnessButton><FitnessButton size="md" variant="secondary" className="text-red-400" onClick={() => openModule('delete')}>Excluir</FitnessButton></div>}
    </div>
  </div>;
}
