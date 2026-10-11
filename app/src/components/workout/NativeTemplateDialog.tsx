import { useMemo, useState } from 'react';
import { ArrowUp, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FitnessButton, FitnessCard } from '@/components/fitness-kit';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Exercise, PlannedExercise, UUIDv4, WorkoutExerciseCategory, WorkoutSet, WorkoutTemplate } from '@/types/workout';
import { calculateEstimatedDuration } from '@/lib/workout/workout-duration';
import { formatEarthXp, projectTemplateReward } from '@/lib/workout/native-reward-preview';
import { FitnessIntegerField } from './FitnessIntegerField';

const newId = () => crypto.randomUUID() as UUIDv4;
const field = 'h-11 w-full min-w-0 rounded-xl border border-white/10 bg-fitness-canvas px-3 text-fitness-text outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary';

function plannedExercise(exercise: Exercise, order: number): PlannedExercise {
  return {
    id: newId(), exerciseId: exercise.id, exerciseNameSnapshot: exercise.name,
    modality: exercise.modality, order, instanceMode: 'planned',
    muscleDistribution: structuredClone(exercise.muscleDistribution),
    sets: Array.from({ length: Math.max(1, exercise.defaultSets) }, (_, index): WorkoutSet => ({
      id: newId(), setNumber: index + 1, targetLoadKg: exercise.defaultLoadKg,
      completed: false, loadFactor: 1, restSeconds: 60,
      ...(exercise.measureMode === 'reps'
        ? { measureMode: 'reps', targetReps: Math.max(1, exercise.defaultReps) }
        : { measureMode: 'duration', targetDurationSeconds: Math.max(1, exercise.defaultDurationSeconds) }),
    })),
  };
}

export function NativeTemplateDialog({ catalog, modality, presetId, template, onClose }: {
  catalog: Exercise[]; modality: WorkoutExerciseCategory; presetId?: string; template?: WorkoutTemplate; onClose: () => void;
}) {
  const saveTemplate = useWorkoutStore((state) => state.saveTemplate);
  const [name, setName] = useState(template?.name ?? '');
  const [manualMinutes, setManualMinutes] = useState<string | null>(() => template && (template.durationEstimateMode === 'manual' || (!template.durationEstimateMode && (template.estimatedDurationMinutes ?? 0) > 0)) ? String(template.estimatedDurationMinutes ?? 0) : null);
  const [effortLevel, setEffortLevel] = useState(template ? template.effortLevel ?? 1 : 3);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(() => new Set());
  const [collapsedSeries, setCollapsedSeries] = useState<Set<string>>(() => new Set());
  const [plans, setPlans] = useState<PlannedExercise[]>(() => {
    if (template) return structuredClone(template.exercises).sort((a, b) => a.order - b.order);
    const preset = catalog.find((exercise) => exercise.id === presetId);
    return preset ? [plannedExercise(preset, 0)] : [];
  });
  const matches = useMemo(() => catalog.filter((exercise) => exercise.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))), [catalog, search]);
  const automaticMinutes = calculateEstimatedDuration(plans);
  const estimatedMinutes = manualMinutes ?? String(automaticMinutes);
  const safeMinutes = Math.max(0, Number(estimatedMinutes) || 0);
  const reward = projectTemplateReward({ exercises: plans, estimatedDurationMinutes: safeMinutes,
    durationEstimateMode: manualMinutes === null ? 'auto' : 'manual', effortLevel });
  const updateSeries = (exerciseId: string, setId: string, update: (series: WorkoutSet) => WorkoutSet) =>
    setPlans((current) => current.map((plan) => plan.id !== exerciseId ? plan : { ...plan, sets: plan.sets.map((series) => series.id === setId ? update(series) : series) }));

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent
      overlayClassName="bottom-[calc(4rem+env(safe-area-inset-bottom))]"
      className="max-w-xl overflow-y-auto border-white/10 bg-fitness-canvas text-fitness-text"
      style={{
        top: 'calc((100dvh - 4rem - env(safe-area-inset-bottom) + env(safe-area-inset-top)) / 2)',
        maxHeight: 'calc(100dvh - 6rem - env(safe-area-inset-bottom) - env(safe-area-inset-top))',
      }}
    >
      <DialogHeader><DialogTitle>{template ? 'Editar treino' : 'Criar treino'}</DialogTitle><DialogDescription>Escolha os exercícios e configure cada série. O treino fica salvo na sua biblioteca.</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={(event) => {
        event.preventDefault();
        if (!plans.length) { setError('Adicione pelo menos um exercício.'); return; }
        const saved = saveTemplate({ ...template, name, modality, source: template?.source ?? 'custom', effortLevel,
          durationEstimateMode: manualMinutes === null ? 'auto' : 'manual', estimatedDurationMinutes: Number(estimatedMinutes),
          exercises: plans.map((plan, order) => ({ ...plan, order })) });
        if (!saved) { setError('Confira o nome e use valores inteiros positivos nas repetições e nos segundos.'); return; }
        onClose();
      }}>
        <label className="block space-y-2 text-sm">Nome do treino<input required value={name} onChange={(event) => setName(event.target.value)} className={field} placeholder="Ex.: Força e equilíbrio" maxLength={100} /></label>
        <label className="block space-y-2 text-sm">Nível de esforço global<select className={field} value={effortLevel} onChange={(event) => setEffortLevel(Number(event.target.value))}><option value={1}>1 · Muito leve</option><option value={2}>2 · Leve</option><option value={3}>3 · Moderado</option><option value={4}>4 · Intenso</option><option value={5}>5 · Muito intenso</option></select><span className="block text-xs text-fitness-muted">Esforço do treino inteiro. É diferente da intensidade de cada série e influencia o custo de Prana.</span></label>
        <label className="block space-y-2 text-sm">Duração estimada (minutos)<input type="number" min="0" step="1" value={estimatedMinutes} onChange={(event) => setManualMinutes(event.target.value === '' ? null : event.target.value)} className={field} /><span className="block text-xs text-fitness-muted">{manualMinutes === null ? 'Calculada pelas séries, descansos e transições.' : `Ajuste manual ativo. Estimativa automática: ${automaticMinutes} min.`} A recompensa final usa o tempo real.</span></label>
        {manualMinutes !== null && <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => setManualMinutes(null)}>Usar estimativa automática</FitnessButton>}
        <div className="space-y-2 rounded-2xl bg-emerald-100 p-4 text-emerald-800"><p className="text-2xl font-semibold">{formatEarthXp(reward.earthXp)} XP <span aria-label="Terra">🌿</span></p><p className="text-xs">Estimativa · {reward.estimatedDurationMinutes} min · esforço {effortLevel}. Presume a conclusão de todas as séries.</p></div>
        <fieldset className="space-y-3"><legend className="mb-2 font-semibold">Exercícios do treino</legend>
          {plans.length === 0 && <p className="text-sm text-fitness-muted">Adicione exercícios do catálogo abaixo.</p>}
          {plans.map((plan, index) => <FitnessCard key={plan.id} className="space-y-4 p-4">
            <div className="flex items-center gap-2"><h3 className="min-w-0 flex-1 font-medium"><button type="button" aria-expanded={!collapsedExercises.has(plan.id)} aria-controls={`exercise-series-${plan.id}`} className="flex min-h-11 w-full items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => setCollapsedExercises((current) => { const next = new Set(current); if (next.has(plan.id)) next.delete(plan.id); else next.add(plan.id); return next; })}><ChevronDown size={18} className={`shrink-0 transition-transform ${collapsedExercises.has(plan.id) ? '-rotate-90' : ''}`} /><span className="min-w-0 break-words">{plan.exerciseNameSnapshot}<span className="mt-1 block text-xs font-normal text-fitness-muted">{plan.sets.length} séries</span></span></button></h3>
              <button type="button" disabled={index === 0} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/5 disabled:opacity-30" aria-label={`Mover ${plan.exerciseNameSnapshot} para cima`} onClick={() => setPlans((current) => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}><ArrowUp size={18} /></button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-fitness-muted hover:text-fitness-red" aria-label={`Remover ${plan.exerciseNameSnapshot}`} onClick={() => setPlans((current) => current.filter((item) => item.id !== plan.id))}><Trash2 size={18} /></button>
            </div>
            <div id={`exercise-series-${plan.id}`} hidden={collapsedExercises.has(plan.id)} className="space-y-4" onInvalidCapture={(event) => { if (!collapsedExercises.has(plan.id)) return; event.preventDefault(); const input = event.target as HTMLInputElement; setCollapsedExercises((current) => { const next = new Set(current); next.delete(plan.id); return next; }); requestAnimationFrame(() => input.focus()); }}>
            {plan.sets.map((series) => <div key={series.id} className="space-y-2 rounded-xl bg-fitness-canvas/50 p-3">
              <div className="flex items-center gap-2"><button type="button" aria-expanded={!collapsedSeries.has(series.id)} aria-controls={`series-fields-${series.id}`} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => setCollapsedSeries((current) => { const next = new Set(current); if (next.has(series.id)) next.delete(series.id); else next.add(series.id); return next; })}><ChevronDown size={15} className={`shrink-0 text-fitness-muted transition-transform ${collapsedSeries.has(series.id) ? '-rotate-90' : ''}`} /><span className="min-w-0 space-y-1"><span className="block text-sm font-medium">Série {series.setNumber}</span>{collapsedSeries.has(series.id) && <span className="flex flex-wrap items-center gap-1.5 text-xs"><span className="rounded-md bg-fitness-primary/10 px-2 py-0.5 text-fitness-primary">{series.measureMode === 'reps' ? `${series.targetReps ?? '—'} reps` : `${series.targetDurationSeconds ?? '—'}s`}</span>{(series.targetLoadKg ?? 0) > 0 && <span className="text-fitness-muted">{series.targetLoadKg?.toLocaleString('pt-BR')} kg ·</span>}<span className="text-fitness-muted">{series.restSeconds ?? 0}s pausa</span>{series.loadFactor === 1.5 && <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-emerald-300">PR</span>}{series.loadFactor === 0.8 && <span className="text-fitness-muted">Leve</span>}</span>}</span></button><button type="button" disabled={plan.sets.length === 1} aria-label={`Remover série ${series.setNumber} de ${plan.exerciseNameSnapshot}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fitness-muted disabled:opacity-30" onClick={() => setPlans((current) => current.map((item) => item.id !== plan.id ? item : { ...item, sets: item.sets.filter((set) => set.id !== series.id).map((set, i) => ({ ...set, setNumber: i + 1 })) }))}><Trash2 size={15} /></button></div>
              <div id={`series-fields-${series.id}`} hidden={collapsedSeries.has(series.id)} onInvalidCapture={(event) => { if (!collapsedSeries.has(series.id)) return; event.preventDefault(); const input = event.target as HTMLInputElement; setCollapsedSeries((current) => { const next = new Set(current); next.delete(series.id); return next; }); requestAnimationFrame(() => input.focus()); }}><div className="grid grid-cols-2 gap-3">
                <FitnessIntegerField label={series.measureMode === 'reps' ? 'Repetições' : 'Duração (segundos)'} value={series.measureMode === 'reps' ? series.targetReps : series.targetDurationSeconds} onChange={(value) => updateSeries(plan.id, series.id, (set) => set.measureMode === 'reps' ? { ...set, targetReps: value } : { ...set, targetDurationSeconds: value })} />
                <label className="space-y-1 text-xs text-fitness-muted">Carga (kg)<input type="number" min="0" step="0.1" required className={field} value={series.targetLoadKg ?? 0} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, targetLoadKg: Number(event.target.value) }))} /></label>
                <label className="col-span-2 space-y-1 text-xs text-fitness-muted">Descanso (segundos)<input type="number" min="0" step="1" required className={field} value={series.restSeconds ?? 0} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, restSeconds: Number(event.target.value) }))} /></label>
                <label className="col-span-2 space-y-1 text-xs text-fitness-muted">Fator de carga da série<select className={field} value={series.loadFactor ?? 1} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 }))}><option value="0.8">Leve (×0,8)</option><option value="1">Manutenção (×1,0)</option><option value="1.5">Progressão / PR (×1,5)</option></select></label>
              </div></div>
            </div>)}
            <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => setPlans((current) => current.map((item) => item.id !== plan.id ? item : { ...item, sets: [...item.sets, { ...structuredClone(item.sets[item.sets.length - 1]), id: newId(), setNumber: item.sets.length + 1 }] }))}><Plus size={16} />Adicionar série</FitnessButton>
            </div>
          </FitnessCard>)}
        </fieldset>
        <section className="space-y-3"><h3 className="font-semibold">Adicionar do catálogo</h3><label className="block"><span className="sr-only">Buscar exercícios</span><input className={field} placeholder="Buscar exercício" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="max-h-52 space-y-2 overflow-y-auto">{matches.map((exercise) => <button type="button" key={exercise.id} disabled={plans.some((plan) => plan.exerciseId === exercise.id)} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-fitness-surface px-4 text-left text-sm disabled:opacity-40" onClick={() => setPlans((current) => [...current, plannedExercise(exercise, current.length)])}>{exercise.name}<Plus size={16} /></button>)}{matches.length === 0 && <p className="py-3 text-sm text-fitness-muted">Nenhum exercício encontrado nesta modalidade.</p>}</div>
        </section>
        {error && <p role="alert" className="text-sm text-fitness-coral">{error}</p>}
        <FitnessButton type="submit" size="md" className="w-full" disabled={!plans.length}>Salvar treino</FitnessButton>
      </form>
    </DialogContent>
  </Dialog>;
}
