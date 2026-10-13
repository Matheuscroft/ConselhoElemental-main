import { useNavigate } from 'react-router-dom';
import { useId, useMemo, useState } from 'react';
import { ArrowUp, ChevronDown, Grid2X2, Plus, Trash2, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FitnessButton, FitnessCard, VideoExercisePlayer } from '@/components/fitness-kit';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Exercise, PlannedExercise, UUIDv4, WorkoutExerciseCategory, WorkoutSet, WorkoutTemplate, Workout, MuscleGroupId } from '@/types/workout';
import { calculateEstimatedDuration } from '@/lib/workout/workout-duration';
import { formatEarthXp, projectTemplateReward } from '@/lib/workout/native-reward-preview';
import { FitnessDurationField } from './FitnessDurationField';
import { FitnessIntegerField } from './FitnessIntegerField';
import { MUSCLE_REGIONS } from '@/constants/muscle-regions';
import { getExerciseFocus } from '@/lib/workout/workout-focus';
import './create-workout.css';
import { CATEGORY_LABELS, MUSCLE_LABELS } from '@/lib/workout';
import { CustomExerciseFields } from './CustomExerciseFields';
import { resolveExerciseMedia, validExerciseMediaUrl } from '@/lib/workout/exercise-media';

const newId = () => crypto.randomUUID() as UUIDv4;
const field = 'workout-builder-input';

function plannedExercise(exercise: Exercise, order: number): PlannedExercise {
  return {
    id: newId(), exerciseId: exercise.id, exerciseNameSnapshot: exercise.name,
    imageUrl: exercise.imageUrl, videoUrl: exercise.videoUrl, modality: exercise.modality, order, instanceMode: 'planned',
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

export function NativeTemplateDialog({ catalog, modality, presetId, template, legacyWorkout, onClose }: {
  catalog: Exercise[]; modality: WorkoutExerciseCategory; presetId?: string; template?: WorkoutTemplate; legacyWorkout?: Workout; onClose: () => void;
}) {
  const navigate = useNavigate();
  const startSession = useWorkoutStore((state) => state.startSession);
  const activeSession = useWorkoutStore((state) => state.activeNativeSession);
  const timedActivity = ['running', 'swimming', 'cycling', 'martial_arts'].includes(modality);
  const formId = useId();
  const saveTemplate = useWorkoutStore((state) => state.saveTemplate);
  const updateWorkout = useWorkoutStore((state) => state.updateWorkout);
  const [name, setName] = useState(template?.name ?? legacyWorkout?.name ?? '');
  const [manualMinutes, setManualMinutes] = useState<string | null>(() => legacyWorkout ? String(legacyWorkout.estimatedDurationMinutes) : template && (template.durationEstimateMode === 'manual' || (!template.durationEstimateMode && (template.estimatedDurationMinutes ?? 0) > 0)) ? String(template.estimatedDurationMinutes ?? 0) : null);
  const [effortLevel, setEffortLevel] = useState(template ? template.effortLevel ?? 1 : legacyWorkout ? legacyWorkout.effortLevel ?? 1 : 3);
  const [search, setSearch] = useState('');
  const [scheduledDate, setScheduledDate] = useState((template?.scheduledAt ?? legacyWorkout?.scheduledAt)?.slice(0, 10) ?? '');
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(() => new Set());
  const [collapsedSeries, setCollapsedSeries] = useState<Set<string>>(() => new Set());
  const [plans, setPlans] = useState<PlannedExercise[]>(() => {
    if (template) return structuredClone(template.exercises).sort((a, b) => a.order - b.order);
    if (legacyWorkout) return legacyWorkout.exercises.map((plan) => {
      const exercise = catalog.find((item) => item.legacyId === plan.exerciseId);
      return { ...structuredClone(plan), id: plan.id as UUIDv4, exerciseId: exercise?.id ?? plan.exerciseId as UUIDv4,
        exerciseNameSnapshot: exercise?.name ?? plan.exerciseId, modality, instanceMode: 'planned' as const,
        muscleDistribution: exercise?.muscleDistribution,
        sets: plan.sets.map((series): WorkoutSet => {
          const { targetReps, targetDurationSeconds, ...values } = series;
          const base = { ...values, id: series.id as UUIDv4, completed: false };
          return (exercise?.measureMode ?? (targetReps != null ? 'reps' : 'duration')) === 'reps'
            ? { ...base, measureMode: 'reps', targetReps }
            : { ...base, measureMode: 'duration', targetDurationSeconds };
        }) };
    });
    const preset = catalog.find((exercise) => exercise.id === presetId);
    return preset ? [plannedExercise(preset, 0)] : [];
  });
  const matches = useMemo(() => catalog.filter((exercise) => exercise.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')) &&
    (!muscleFilter || MUSCLE_REGIONS.find((region) => region.id === muscleFilter)?.muscles.some((muscle) => exercise.primaryMuscles?.includes(muscle)))), [catalog, search, muscleFilter]);
  const automaticMinutes = calculateEstimatedDuration(plans);
  const estimatedMinutes = manualMinutes ?? String(automaticMinutes);
  const safeMinutes = Math.max(0, Number(estimatedMinutes) || 0);
  const reward = projectTemplateReward({ exercises: plans, estimatedDurationMinutes: safeMinutes,
    durationEstimateMode: manualMinutes === null ? 'auto' : 'manual', effortLevel });
  const updateSeries = (exerciseId: string, setId: string, update: (series: WorkoutSet) => WorkoutSet) =>
    setPlans((current) => current.map((plan) => plan.id !== exerciseId ? plan : { ...plan, sets: plan.sets.map((series) => series.id === setId ? update(series) : series) }));

  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent
      className="workout-builder" showCloseButton={false}
    >
      <DialogHeader className="workout-builder-header"><div><DialogTitle className="workout-builder-title">{template || legacyWorkout ? 'Editar treino' : 'Criar treino'}</DialogTitle><DialogDescription>Escolha os exercícios e configure cada série. O treino fica salvo na sua biblioteca.</DialogDescription></div><DialogClose className="workout-builder-close" aria-label="Fechar criação de treino"><X size={20} /></DialogClose></DialogHeader>
      <form id={formId} className="workout-builder-body space-y-5" onSubmit={(event) => {
        event.preventDefault();
        if (!plans.length) { setError('Adicione pelo menos um exercício.'); return; }
        if (plans.some((plan) => plan.muscleDistributionOverride?.length && Math.abs(plan.muscleDistributionOverride.reduce((sum, entry) => sum + entry.percentage, 0) - 100) > 0.01)) { setError('O perfil muscular informado precisa somar 100%.'); return; }
        if (plans.some((plan) => !validExerciseMediaUrl(plan.imageUrl) || !validExerciseMediaUrl(plan.videoUrl))) { setError('Use uma URL http/https ou um caminho de arquivo do app para a mídia.'); return; }
        if (legacyWorkout) {
          if (plans.some((plan) => !catalog.find((exercise) => exercise.id === plan.exerciseId)?.legacyId)) { setError('O catálogo deste treino está incompleto. Nenhum dado foi alterado.'); return; }
          const updated = updateWorkout(legacyWorkout.id, { name, effortLevel, scheduledAt: scheduledDate === (legacyWorkout.scheduledAt?.slice(0, 10) ?? '') ? legacyWorkout.scheduledAt : scheduledDate ? new Date(`${scheduledDate}T12:00:00`).toISOString() : '', estimatedDurationMinutes: Number(estimatedMinutes),
            exercises: plans.map((plan, order) => ({ id: plan.id, exerciseId: catalog.find((exercise) => exercise.id === plan.exerciseId)!.legacyId!, order,
              notes: plan.notes, imageUrl: plan.imageUrl, videoUrl: plan.videoUrl, muscleDistributionOverride: plan.muscleDistributionOverride,
              sets: plan.sets.map((series) => ({ id: series.id, setNumber: series.setNumber, targetLoadKg: series.targetLoadKg ?? 0,
                targetReps: series.targetReps, targetDurationSeconds: series.targetDurationSeconds, restSeconds: series.restSeconds ?? 0, loadFactor: series.loadFactor })) })) });
          if (!updated) { setError('Não foi possível salvar este treino. Confira os valores.'); return; }
          onClose(); return;
        }
        const saved = saveTemplate({ ...template, name, scheduledAt: scheduledDate === (template?.scheduledAt?.slice(0, 10) ?? '') ? template?.scheduledAt : scheduledDate ? new Date(`${scheduledDate}T12:00:00`).toISOString() : undefined, modality, source: template?.source ?? 'custom', effortLevel,
          durationEstimateMode: manualMinutes === null ? 'auto' : 'manual', estimatedDurationMinutes: Number(estimatedMinutes),
          exercises: plans.map((plan, order) => ({ ...plan, order })) });
        if (!saved) { setError('Confira o nome e use valores inteiros positivos nas repetições e nos segundos.'); return; }
        const startNow = (event.nativeEvent as SubmitEvent).submitter?.getAttribute('data-start') === 'true';
        if (startNow) {
          const session = startSession(saved.id);
          if (!session) { setError('Treino salvo. Conclua a sessão em andamento antes de iniciar outro.'); return; }
          onClose();
          navigate(`/fitness/ativo/${session.id}`);
        } else onClose();
      }}>
        <label className="block space-y-2 text-sm">Nome do treino<input required value={name} onChange={(event) => setName(event.target.value)} className={field} placeholder="Ex.: Força e equilíbrio" maxLength={100} /></label>
        <p className="text-sm text-fitness-muted">Modalidade: <span className="font-medium text-fitness-text">{CATEGORY_LABELS[modality]}</span></p>
        <label className="block space-y-2 text-sm">Data (opcional)<input type="date" className={field} value={scheduledDate} onChange={(event) => setScheduledDate(event.target.value)} /></label>
        <fieldset className="space-y-3"><legend className="mb-2 font-semibold">Seu treino</legend>
          {plans.length === 0 && <p className="text-sm text-fitness-muted">Escolha no catálogo abaixo ou crie um exercício próprio.</p>}
          {plans.map((plan, index) => <FitnessCard key={plan.id} className="space-y-4 p-4">
            <div className="flex items-center gap-2"><h3 className="min-w-0 flex-1 font-medium"><button type="button" aria-expanded={!collapsedExercises.has(plan.id)} aria-controls={`exercise-series-${plan.id}`} className="flex min-h-11 w-full items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => setCollapsedExercises((current) => { const next = new Set(current); if (next.has(plan.id)) next.delete(plan.id); else next.add(plan.id); return next; })}><ChevronDown size={18} className={`shrink-0 transition-transform ${collapsedExercises.has(plan.id) ? '-rotate-90' : ''}`} /><span className="min-w-0 break-words">{plan.exerciseNameSnapshot}<span className="mt-1 block text-xs font-normal text-fitness-muted">{plan.sets.length} séries</span></span></button></h3>
              <button type="button" disabled={index === 0} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/5 disabled:opacity-30" aria-label={`Mover ${plan.exerciseNameSnapshot} para cima`} onClick={() => setPlans((current) => { const next = [...current]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; return next; })}><ArrowUp size={18} /></button>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-fitness-muted hover:text-fitness-red" aria-label={`Remover ${plan.exerciseNameSnapshot}`} onClick={() => setPlans((current) => current.filter((item) => item.id !== plan.id))}><Trash2 size={18} /></button>
            </div>
            <VideoExercisePlayer key={`${plan.id}-${plan.imageUrl}-${plan.videoUrl}`} title={plan.exerciseNameSnapshot} {...resolveExerciseMedia(plan, catalog.find((exercise) => exercise.id === plan.exerciseId), useWorkoutStore.getState().getExerciseById(catalog.find((exercise) => exercise.id === plan.exerciseId)?.legacyId ?? ''))} />
            <details className="rounded-xl border border-white/10 p-3"><summary className="min-h-11 cursor-pointer text-sm text-fitness-primary">Imagem, vídeo e observações</summary><div className="mt-3 space-y-3">
              <label className="block text-xs text-fitness-muted">URL da imagem (opcional)<input className={field} defaultValue={plan.imageUrl ?? ''} placeholder="https://.../imagem.jpg" onBlur={(event) => setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, imageUrl: event.target.value.trim() || undefined } : item))} /></label>
              <label className="block text-xs text-fitness-muted">URL direta do vídeo (opcional)<input className={field} defaultValue={plan.videoUrl ?? ''} placeholder="https://.../video.mp4" onBlur={(event) => setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, videoUrl: event.target.value.trim() || undefined } : item))} /></label>
              <label className="block text-xs text-fitness-muted">Observações<textarea className="w-full rounded-xl border border-white/10 bg-fitness-canvas p-3 text-base" value={plan.notes ?? ''} onChange={(event) => setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, notes: event.target.value } : item))} /></label>
            </div></details>
            <details className="rounded-xl border border-white/10 p-3"><summary className="min-h-11 cursor-pointer text-sm text-fitness-primary">Perfil muscular informado (opcional)</summary><p className="mb-3 text-xs text-fitness-muted">Informe a distribuição desejada em %. Deixe vazio para usar o catálogo, quando disponível.</p><div className="grid grid-cols-2 gap-3">{Object.entries(MUSCLE_LABELS).map(([muscleId, label]) => <label key={muscleId} className="text-xs text-fitness-muted">{label}<input className={field} type="number" min="0" max="100" step="any" aria-label={`Contribuição de ${label} em ${plan.exerciseNameSnapshot}`} value={plan.muscleDistributionOverride?.find((entry) => entry.muscleId === muscleId)?.percentage ?? ''} onChange={(event) => setPlans((current) => current.map((item) => { if (item.id !== plan.id) return item; const entries = (item.muscleDistributionOverride ?? []).filter((entry) => entry.muscleId !== muscleId); if (Number(event.target.value) > 0) entries.push({ muscleId: muscleId as MuscleGroupId, percentage: Number(event.target.value) }); return { ...item, muscleDistributionOverride: entries.length ? entries : undefined }; }))} /></label>)}</div></details>
            <div id={`exercise-series-${plan.id}`} hidden={collapsedExercises.has(plan.id)} className="space-y-4" onInvalidCapture={(event) => { if (!collapsedExercises.has(plan.id)) return; event.preventDefault(); const input = event.target as HTMLInputElement; setCollapsedExercises((current) => { const next = new Set(current); next.delete(plan.id); return next; }); requestAnimationFrame(() => input.focus()); }}>
            {plan.sets.map((series) => <div key={series.id} className="space-y-2 rounded-xl bg-fitness-canvas/50 p-3">
              <div className="flex items-center gap-2"><button type="button" aria-expanded={!collapsedSeries.has(series.id)} aria-controls={`series-fields-${series.id}`} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary" onClick={() => setCollapsedSeries((current) => { const next = new Set(current); if (next.has(series.id)) next.delete(series.id); else next.add(series.id); return next; })}><ChevronDown size={15} className={`shrink-0 text-fitness-muted transition-transform ${collapsedSeries.has(series.id) ? '-rotate-90' : ''}`} /><span className="min-w-0 space-y-1"><span className="block text-sm font-medium">Série {series.setNumber}</span>{collapsedSeries.has(series.id) && <span className="flex flex-wrap items-center gap-1.5 text-xs"><span className="rounded-md bg-fitness-primary/10 px-2 py-0.5 text-fitness-primary">{series.measureMode === 'reps' ? `${series.targetReps ?? '—'} reps` : `${series.targetDurationSeconds ?? '—'}s`}</span>{(series.targetLoadKg ?? 0) > 0 && <span className="text-fitness-muted">{series.targetLoadKg?.toLocaleString('pt-BR')} kg ·</span>}<span className="text-fitness-muted">{series.restSeconds ?? 0}s pausa</span>{series.loadFactor === 1.5 && <span className="rounded-md bg-emerald-400/10 px-1.5 py-0.5 text-emerald-300">PR</span>}{series.loadFactor === 0.8 && <span className="text-fitness-muted">Leve</span>}</span>}</span></button><button type="button" disabled={plan.sets.length === 1} aria-label={`Remover série ${series.setNumber} de ${plan.exerciseNameSnapshot}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-fitness-muted disabled:opacity-30" onClick={() => setPlans((current) => current.map((item) => item.id !== plan.id ? item : { ...item, sets: item.sets.filter((set) => set.id !== series.id).map((set, i) => ({ ...set, setNumber: i + 1 })) }))}><Trash2 size={15} /></button></div>
              <div id={`series-fields-${series.id}`} hidden={collapsedSeries.has(series.id)} onInvalidCapture={(event) => { if (!collapsedSeries.has(series.id)) return; event.preventDefault(); const input = event.target as HTMLInputElement; setCollapsedSeries((current) => { const next = new Set(current); next.delete(series.id); return next; }); requestAnimationFrame(() => input.focus()); }}><div className="grid grid-cols-2 gap-3">
                {series.measureMode === 'reps' ? <FitnessIntegerField label="Repetições" value={series.targetReps} onChange={(value) => updateSeries(plan.id, series.id, (set) => set.measureMode === 'reps' ? { ...set, targetReps: value } : set)} /> : <FitnessDurationField seconds={series.targetDurationSeconds} minutes={['running', 'swimming', 'cycling', 'martial_arts'].includes(modality)} onChange={(value) => updateSeries(plan.id, series.id, (set) => set.measureMode === 'duration' ? { ...set, targetDurationSeconds: value } : set)} />}
                {!timedActivity && <label className="space-y-1 text-xs text-fitness-muted">Carga (kg)<input type="number" min="0" step="0.1" required className={field} value={series.targetLoadKg ?? 0} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, targetLoadKg: Number(event.target.value) }))} /></label>}
                <label className={`${timedActivity ? '' : 'col-span-2'} space-y-1 text-xs text-fitness-muted`}>Descanso (segundos)<input type="number" min="0" step="1" required className={field} value={series.restSeconds ?? 0} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, restSeconds: Number(event.target.value) }))} /></label>
                <label className="col-span-2 space-y-1 text-xs text-fitness-muted">Fator de carga da série<select className={field} value={series.loadFactor ?? 1} onChange={(event) => updateSeries(plan.id, series.id, (set) => ({ ...set, loadFactor: Number(event.target.value) as 0.8 | 1 | 1.5 }))}><option value="0.8">Leve (×0,8)</option><option value="1">Manutenção (×1,0)</option><option value="1.5">Progressão / PR (×1,5)</option></select></label>
              </div></div>
            </div>)}
            <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => setPlans((current) => current.map((item) => item.id !== plan.id ? item : { ...item, sets: [...item.sets, { ...structuredClone(item.sets[item.sets.length - 1]), id: newId(), setNumber: item.sets.length + 1 }] }))}><Plus size={16} />Adicionar série</FitnessButton>
            </div>
          </FitnessCard>)}
        </fieldset>
        <details className="rounded-2xl border border-white/10 p-4" onInvalidCapture={(event) => { event.currentTarget.open = true; }}><summary className="min-h-11 cursor-pointer font-medium text-fitness-primary">Esforço e estimativa · {estimatedMinutes} min</summary><div className="mt-3 space-y-4">
        <label className="block space-y-2 text-sm">Esforço do treino<select className={field} value={effortLevel} onChange={(event) => setEffortLevel(Number(event.target.value))}><option value={1}>1 · Muito leve</option><option value={2}>2 · Leve</option><option value={3}>3 · Moderado</option><option value={4}>4 · Intenso</option><option value={5}>5 · Muito intenso</option></select><span className="block text-xs text-fitness-muted">Esforço do treino inteiro. É diferente da intensidade de cada série e influencia o custo de Prana.</span></label>
        <label className="block space-y-2 text-sm">Duração estimada (minutos)<input type="number" min="0" step="1" value={estimatedMinutes} onChange={(event) => setManualMinutes(event.target.value === '' ? null : event.target.value)} className={field} /><span className="block text-xs text-fitness-muted">{manualMinutes === null ? 'Calculada pelas séries, descansos e transições.' : `Ajuste manual ativo. Estimativa automática: ${automaticMinutes} min.`} A recompensa final usa o tempo real.</span></label>
        {manualMinutes !== null && <FitnessButton size="md" variant="secondary" className="w-full" onClick={() => setManualMinutes(null)}>Usar estimativa automática</FitnessButton>}
        {!legacyWorkout && <div className="space-y-2 rounded-2xl bg-emerald-100 p-4 text-emerald-800"><p className="text-2xl font-semibold">{formatEarthXp(reward.earthXp)} XP <span aria-label="Terra">🌿</span></p><p className="text-xs">Estimativa · {(reward.activeDurationSeconds / 60).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} min ativos nas séries · esforço {effortLevel}. Os {reward.estimatedDurationMinutes} min planejados incluem o tempo total e não aumentam o XP.</p></div>}
        {legacyWorkout && <div className="rounded-2xl bg-fitness-primary/10 p-4 text-sm text-fitness-text-soft">{plans.length} exercícios · {plans.reduce((sum, plan) => sum + plan.sets.length, 0)} séries · {estimatedMinutes} min planejados. A recompensa será apresentada ao concluir a sessão.</div>}
</div></details>
        <section className="space-y-3"><h3 className="font-sans text-lg font-semibold">Adicionar do catálogo</h3>{catalog.some((exercise) => exercise.primaryMuscles?.length) && <div role="group" aria-label="Filtrar exercícios por região muscular" className="flex flex-wrap gap-1.5"><button type="button" title="Todos os exercícios" aria-label="Todos os exercícios" aria-pressed={!muscleFilter} onClick={() => setMuscleFilter(null)} className={`grid h-10 w-10 place-items-center rounded-xl border outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary ${!muscleFilter ? 'border-fitness-primary bg-fitness-primary/15 text-fitness-primary' : 'border-white/10 text-fitness-muted'}`}><Grid2X2 size={16} /></button>{MUSCLE_REGIONS.map((region) => <button key={region.id} type="button" title={region.label} aria-label={`Filtrar por ${region.label}`} aria-pressed={muscleFilter === region.id} onClick={() => setMuscleFilter((current) => current === region.id ? null : region.id)} className={`grid h-10 w-10 place-items-center rounded-xl border text-lg outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary ${muscleFilter === region.id ? 'border-fitness-primary bg-fitness-primary/15' : 'border-white/10 bg-fitness-surface'}`}><span aria-hidden="true">{region.emoji}</span></button>)}</div>}<label className="block"><span className="sr-only">Buscar exercícios</span><input className={field} placeholder="Buscar exercício" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <div className="max-h-52 space-y-2 overflow-y-auto">{matches.map((exercise) => { const focus = getExerciseFocus(exercise.id, catalog); return <button type="button" key={exercise.id} disabled={plans.some((plan) => plan.exerciseId === exercise.id)} className="flex min-h-12 w-full items-center justify-between rounded-xl bg-fitness-surface px-4 text-left text-sm disabled:opacity-40" onClick={() => setPlans((current) => [...current, plannedExercise(exercise, current.length)])}><span className="min-w-0 flex-1 break-words">{focus && <span role="img" aria-label={`Foco: ${focus.label}`} className="mr-2">{focus.emoji}</span>}{exercise.name}</span><Plus size={16} className="ml-2 shrink-0" /></button>; })}{matches.length === 0 && <p className="py-3 text-sm text-fitness-muted">Nenhum exercício encontrado nesta modalidade.</p>}</div>
        </section>
        {customOpen ? <CustomExerciseFields modality={modality} proposedName={search} onCancel={() => setCustomOpen(false)} onAdded={(exercise) => { setPlans((current) => [...current, plannedExercise(exercise, current.length)]); setSearch(''); setCustomOpen(false); }} /> : <FitnessButton variant="secondary" size="md" className="w-full" onClick={() => setCustomOpen(true)}><Plus size={16} />Criar exercício</FitnessButton>}
        {error && <p role="alert" className="text-sm text-fitness-coral">{error}</p>}
      </form>
      <footer className="workout-builder-footer"><p>{plans.length} exercícios · {estimatedMinutes} min planejados</p><div><button type="button" className="workout-builder-cancel" onClick={onClose}>Cancelar</button><button type="submit" form={formId} className={legacyWorkout ? "workout-builder-submit" : "workout-builder-cancel flex-1 bg-fitness-surface"} disabled={!plans.length || !name.trim()}>Salvar treino</button></div>{!legacyWorkout && <button type="submit" form={formId} data-start="true" className="workout-builder-submit mt-2 w-full" disabled={!plans.length || !name.trim() || !!activeSession}>Salvar e iniciar agora</button>}{activeSession && !legacyWorkout && <p className="mt-2">Há uma sessão em andamento. Você pode salvar este plano e iniciar depois.</p>}</footer>
    </DialogContent>
  </Dialog>;
}
