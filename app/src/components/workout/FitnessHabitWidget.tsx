import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';
import type { Habit } from '@/types';
import { useWorkoutStore } from '@/stores/workoutStore';
import { useAppStore } from '@/stores/appStore';
import { projectNativeLeafReward } from '@/lib/core/native-action-completion';
import { formatEarthXp } from '@/lib/workout/native-reward-preview';
import { FitnessButton } from '@/components/fitness-kit';
import { FitnessIntegerField } from './FitnessIntegerField';

export function FitnessHabitWidget({ habit, date }: { habit: Habit; date: Date }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const template = useWorkoutStore((state) => state.templates.find((item) => item.id === habit.sourceRefId));
  const active = useWorkoutStore((state) => state.activeNativeSession);
  const history = useWorkoutStore((state) => state.nativeHistory);
  const start = useWorkoutStore((state) => state.startSession);
  const logSet = useWorkoutStore((state) => state.logSet);
  const finish = useWorkoutStore((state) => state.finishSession);
  const logs = useAppStore((state) => state.executionLogs);
  const today = new Date().toDateString();
  const completed = habit.completions.some((item) => new Date(item.completionDate).toDateString() === date.toDateString());
  const receipt = logs.find((item) => item.subjectId === habit.id && item.subjectType === 'HABIT' && new Date(item.timestamp).toDateString() === date.toDateString());
  const matching = !!active && active.templateId === template?.id && new Date(active.startedAt).toDateString() === today;
  const disabled = completed || !template || date.toDateString() !== today || (!!active && !matching);
  const recorded = receipt ? history.find((session) => session.coreExecutionLogId === receipt.id) : undefined;
  const sessionExercises = recorded?.exerciseResults ?? (matching ? active!.exerciseResults : template?.exercises ?? []);
  const minutes = habit.plannedTimeMinutes ?? 0;
  const preview = projectNativeLeafReward(habit.baseValue ?? habit.plannedPoints ?? 0, minutes * 60, habit.effortLevel ?? 3, minutes > 0).executedValue;
  const ensureSession = () => {
    if (disabled || !template) return undefined;
    return matching ? active : start(template.id, habit.effortLevel ?? 3);
  };
  const openModule = (action: 'edit' | 'delete') => {
    if (template) navigate(`/fitness?modalidade=${template.modality}&${action}=${template.id}`);
    else navigate('/fitness');
  };
  return <div className="glass-card space-y-4 rounded-2xl border border-white/10 p-4 shadow-lg">
    <button type="button" className="flex min-h-11 w-full items-center gap-3 text-left" aria-expanded={expanded} aria-controls={`fitness-habit-${habit.id}`} onClick={() => setExpanded((value) => !value)}><Dumbbell className="shrink-0 text-violet-400" size={20} /><span className="min-w-0 flex-1 break-words font-semibold">{habit.title}</span><ChevronDown size={18} className={expanded ? 'rotate-180' : ''} /></button>
    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">{formatEarthXp(receipt?.executedValue ?? preview)} XP 🌿{completed ? ' · Concluído' : ' · Estimativa'}</span>
    <div id={`fitness-habit-${habit.id}`} hidden={!expanded} className="space-y-4">
      {!template && <p className="text-sm text-white/60">O template não está mais na biblioteca.</p>}
      {sessionExercises.map((exercise, exerciseIndex) => <section key={exercise.id} className="space-y-2"><h3 className="text-sm font-medium">{exercise.exerciseNameSnapshot}</h3>{exercise.sets.map((series, setIndex) => {
        const update = (updates: Parameters<typeof logSet>[2]) => {
          const session = ensureSession();
          const nativeExercise = session?.exerciseResults[exerciseIndex];
          const nativeSet = nativeExercise?.sets[setIndex];
          if (nativeExercise && nativeSet && !logSet(nativeExercise.id, nativeSet.id, updates)) toast.error('Confira os valores desta série.');
        };
        const checked = (matching || !!recorded) && series.completed;
        return <div key={series.id} className="space-y-2 rounded-xl bg-white/5 p-3"><label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" className="h-5 w-5 accent-emerald-500" disabled={disabled} checked={!!checked} onChange={(event) => update({ completed: event.target.checked, skipped: false, ...(series.measureMode === 'reps' ? { reps: series.reps ?? series.targetReps } : { durationSeconds: series.durationSeconds ?? series.targetDurationSeconds }), loadKg: series.loadKg ?? series.targetLoadKg ?? 0 })} />Série {series.setNumber}</label><fieldset disabled={disabled} className="grid grid-cols-2 gap-2"><FitnessIntegerField label={series.measureMode === 'reps' ? 'Repetições' : 'Segundos'} value={series.measureMode === 'reps' ? series.reps ?? series.targetReps : series.durationSeconds ?? series.targetDurationSeconds} onChange={(value) => { if (value !== undefined) update(series.measureMode === 'reps' ? { reps: value } : { durationSeconds: value }); }} /><label className="text-xs text-white/60">Carga (kg)<input type="number" min="0" step="0.1" className="mt-1 h-12 w-full rounded-xl bg-fitness-canvas px-3 text-base text-white" value={series.loadKg ?? series.targetLoadKg ?? 0} onChange={(event) => update({ loadKg: Number(event.target.value) })} /></label><select aria-label={`Fator de carga da série ${series.setNumber} de ${exercise.exerciseNameSnapshot}`} className="col-span-2 h-11 rounded-xl bg-fitness-canvas px-3 text-sm" value={series.loadFactor ?? 1} onChange={(event) => update({ loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 })}><option value="0.8">Leve ×0,8</option><option value="1">Manutenção ×1</option><option value="1.5">Progressão / PR ×1,5</option></select></fieldset></div>;
      })}</section>)}
      {!completed && date.toDateString() !== today && <p className="text-xs text-white/60">Execução inline disponível no dia de hoje.</p>}
      {active && !matching && <p className="text-xs text-white/60">Conclua ou cancele a outra sessão ativa antes de iniciar este ciclo.</p>}
      <FitnessButton size="md" className="w-full" disabled={disabled || !matching || !active?.exerciseResults.some((exercise) => exercise.sets.some((set) => set.completed && !set.skipped))} onClick={() => { try { const result = finish(habit.id); if (result) toast.success('Treino e ciclo concluídos!'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível concluir.'); } }}>Concluir Treino</FitnessButton>
      <div className="grid grid-cols-2 gap-2"><FitnessButton size="md" variant="secondary" onClick={() => openModule('edit')}>Editar</FitnessButton><FitnessButton size="md" variant="secondary" className="text-red-400" onClick={() => openModule('delete')}>Excluir</FitnessButton></div>
    </div>
  </div>;
}
