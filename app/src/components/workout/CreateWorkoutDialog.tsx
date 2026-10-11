import React, { useEffect, useMemo, useState, useId, useRef } from 'react';
import { MARTIAL_DISCIPLINES } from '@/constants/sport-activities';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, X, Check, Search, ChevronDown, Minus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkoutStore } from '@/stores/workoutStore';
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  MUSCLE_LABELS,
  buildExercisePlan,
  createDefaultDraftConfig,
  createDefaultDraftConfigs,
  draftConfigsFromPlan,
  estimateWorkoutDurationMinutes,
  estimatePlannedWorkoutEquivalents,
  type ExerciseDraftConfig,
} from '@/lib/workout';
import type { Workout, WorkoutExercise, WorkoutExerciseCategory, WorkoutExerciseSource, MuscleContribution, MuscleGroupId } from '@/types/workout';
import './create-workout.css';

interface CreateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: WorkoutExerciseCategory;
  presetExerciseId?: string;
  workoutToEdit?: Workout;
  onCreated?: (workout: Workout) => void;
}

const SOURCE_FILTERS: Array<{ value: 'all' | WorkoutExerciseSource; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'calistenia', label: 'Calistenia' },
];

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange, min }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className="block">
      <span>{label}</span>
      <Input type="number" inputMode="decimal" min={min} value={draft ?? String(value)}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (next !== '' && Number.isFinite(Number(next))) onChange(Math.max(min, Number(next)));
        }}
        onBlur={() => {
          const next = Math.max(min, Number(draft ?? value) || min);
          setDraft(null);
          onChange(next);
        }}
        className="workout-builder-input" />
    </label>
  );
};

export const CreateWorkoutDialog: React.FC<CreateWorkoutDialogProps> = ({
  open,
  onOpenChange,
  defaultCategory,
  presetExerciseId,
  workoutToEdit,
  onCreated,
}) => {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { getExerciseCatalog, createWorkout, updateWorkout, rescheduleWorkout } = useWorkoutStore();
  const catalog = getExerciseCatalog();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkoutExerciseCategory>(defaultCategory ?? 'mixed');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<'all' | WorkoutExerciseSource>('all');
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('Taekwondo');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [muscleOverrides, setMuscleOverrides] = useState<Record<string, MuscleContribution[]>>({});
  const [configs, setConfigs] = useState<Record<string, ExerciseDraftConfig[]>>({});

  useEffect(() => {
    if (!open) return;
    setMuscleOverrides({});
    setSourceFilter('all');
    setSearch('');

    if (workoutToEdit) {
    setName(workoutToEdit.name);
    setCategory(workoutToEdit.category);
      const martialFamily = workoutToEdit.exercises
        .map((plan) => catalog.find((item) => item.id === plan.exerciseId)?.family)
        .find((family): family is string => Boolean(family));
      setDiscipline(martialFamily ?? 'Taekwondo');
      const scheduled = workoutToEdit.scheduledAt ? new Date(workoutToEdit.scheduledAt) : undefined;
      setScheduledDate(scheduled && Number.isFinite(scheduled.getTime()) ? scheduled : undefined);
      const nextConfigs: Record<string, ExerciseDraftConfig[]> = {};
      const nextMuscleOverrides: Record<string, MuscleContribution[]> = {};
      workoutToEdit.exercises.forEach((plan) => {
        const exercise = catalog.find((item) => item.id === plan.exerciseId);
        if (!exercise) return;
        nextConfigs[exercise.id] = draftConfigsFromPlan(exercise, plan.sets);
        if (plan.muscleDistributionOverride) nextMuscleOverrides[exercise.id] = plan.muscleDistributionOverride;
      });
      setSelectedIds(workoutToEdit.exercises.map((plan) => plan.exerciseId));
      setConfigs(nextConfigs);
      setMuscleOverrides(nextMuscleOverrides);
      return;
    }

    setName('');
    setCategory(defaultCategory ?? 'mixed');
    setScheduledDate(undefined);
    setDiscipline('Taekwondo');

    const preset = presetExerciseId ? catalog.find((exercise) => exercise.id === presetExerciseId) : undefined;
    if (preset) {
      setSelectedIds([preset.id]);
      setConfigs({ [preset.id]: createDefaultDraftConfigs(preset) });
      setCategory(preset.category);
      if (preset.family) setDiscipline(preset.family);
    } else {
      setSelectedIds([]);
      setConfigs({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetExerciseId, workoutToEdit?.id]);

  const filteredCatalog = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalog.filter((exercise) => {
      if (!['mixed', 'custom'].includes(category) && exercise.category !== category) return false;
      if (category === 'martial_arts' && exercise.family !== discipline) return false;
      if (['mixed', 'custom'].includes(category) && sourceFilter !== 'all' && exercise.source !== sourceFilter) return false;
      if (term && !exercise.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [catalog, sourceFilter, search, category, discipline]);

  const selectedExercises = selectedIds
    .map((id) => catalog.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is WorkoutExercise => Boolean(exercise));
  const hasUnavailableExercise = selectedIds.some((id) => !catalog.some((exercise) => exercise.id === id));

  const toggleExercise = (exercise: WorkoutExercise) => {
    setSelectedIds((prev) =>
      prev.includes(exercise.id) ? prev.filter((id) => id !== exercise.id) : [...prev, exercise.id]
    );
    setConfigs((prev) => (prev[exercise.id] ? prev : { ...prev, [exercise.id]: createDefaultDraftConfigs(exercise) }));
  };

  const updateConfig = (exerciseId: string, setIndex: number, patch: Partial<ExerciseDraftConfig>) => {
    setConfigs((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).map((config, index) => index === setIndex ? { ...config, ...patch } : config),
    }));
  };

  const addSet = (exercise: WorkoutExercise) => setConfigs((prev) => ({
    ...prev,
    [exercise.id]: [...(prev[exercise.id] ?? createDefaultDraftConfigs(exercise)), createDefaultDraftConfig(exercise)],
  }));

  const removeSet = (exerciseId: string, setIndex: number) => setConfigs((prev) => ({
    ...prev,
    [exerciseId]: (prev[exerciseId] ?? []).filter((_, index) => index !== setIndex),
  }));

  const compatible = selectedExercises.every((exercise) => ['mixed', 'custom'].includes(category) || exercise.category === category && (category !== 'martial_arts' || exercise.family === discipline));
  const musclesValid = selectedExercises.every((exercise) => !muscleOverrides[exercise.id] || Math.abs(muscleOverrides[exercise.id].reduce((total,entry)=>total+entry.percentage,0)-100)<0.01);
  const canSubmit = name.trim().length > 0 && selectedExercises.length > 0 && !hasUnavailableExercise && selectedExercises.every((exercise) => (configs[exercise.id]?.length ?? 0) > 0) && compatible && musclesValid;

  const exercisePlans = selectedExercises.map((exercise, index) => ({
    ...buildExercisePlan(exercise, index + 1, configs[exercise.id] ?? createDefaultDraftConfigs(exercise), workoutToEdit?.exercises.find((plan) => plan.exerciseId === exercise.id)?.id),
    muscleDistributionOverride: muscleOverrides[exercise.id],
  }));
  const plannedEquivalents = estimatePlannedWorkoutEquivalents(exercisePlans, catalog);
  const hasEquivalentExercises = exercisePlans.some((plan) => catalog.some((exercise) => exercise.id === plan.exerciseId && exercise.source !== 'native'));

  const handleSubmit = () => {
    if (!canSubmit) return;

    const workout = workoutToEdit
      ? updateWorkout(workoutToEdit.id, {
          name: name.trim(),
          category,
          estimatedDurationMinutes: estimateWorkoutDurationMinutes(exercisePlans),
          exercises: exercisePlans,
        })
      : createWorkout({
          name: name.trim(),
          category,
          scheduledAt: scheduledDate?.toISOString(),
          estimatedDurationMinutes: estimateWorkoutDurationMinutes(exercisePlans),
          exercises: exercisePlans,
        });

    if (!workout) {
      toast.error(workoutToEdit ? 'Não foi possível salvar as alterações.' : 'Não foi possível criar o treino.');
      return;
    }

    if (workoutToEdit) rescheduleWorkout(workout.id, scheduledDate?.toISOString());

    toast.success(workoutToEdit ? 'Treino atualizado.' : 'Treino criado com sucesso.');
    onCreated?.(workout);
    onOpenChange(false);
  };

  const plannedMinutes = estimateWorkoutDurationMinutes(exercisePlans);
  const submitHint = hasUnavailableExercise ? 'Um exercício deste treino não está no catálogo disponível; salve após restaurar o catálogo para preservar o planejamento.' : !musclesValid ? 'O perfil muscular personalizado precisa somar 100%.' : !compatible ? 'Remova as atividades de outra modalidade ou escolha Treino misto.' : !name.trim() ? 'Dê um nome ao treino para continuar.' : !selectedExercises.length ? 'Adicione pelo menos um exercício.' : `${selectedExercises.length} exercício${selectedExercises.length === 1 ? '' : 's'} · cerca de ${plannedMinutes} min`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} aria-labelledby={titleId} aria-describedby={undefined} className="workout-builder"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          titleRef.current?.focus();
        }}
        onCloseAutoFocus={(event) => {
          if (returnFocus.current?.isConnected) {
            event.preventDefault();
            returnFocus.current.focus();
          }
        }}>
        <DialogHeader className="workout-builder-header">
          <div>
            <DialogTitle ref={titleRef} tabIndex={-1} id={titleId} className="workout-builder-title">{workoutToEdit ? 'Editar treino' : 'Criar treino'}</DialogTitle>
            <p>{workoutToEdit ? 'Ajuste o planejamento para as próximas sessões.' : 'Monte uma rotina que faça sentido para você.'}</p>
          </div>
          <DialogClose className="workout-builder-close" aria-label="Fechar criação de treino"><X size={20} aria-hidden="true" /></DialogClose>
        </DialogHeader>

        <div className="workout-builder-body">
          <section className="workout-builder-section" aria-label="Dados do treino">
            <label className="workout-builder-field" htmlFor="workout-name">
              <span>Nome do treino</span>
              <Input id="workout-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Mobilidade da manhã" className="workout-builder-input" />
            </label>
            <div className="workout-builder-meta">
              <div className="workout-builder-field">
                <label htmlFor="workout-category">Modalidade</label>
                <Select value={category} onValueChange={(value) => setCategory(value as WorkoutExerciseCategory)}>
                  <SelectTrigger id="workout-category" className="workout-builder-input"><SelectValue /></SelectTrigger>
                  <SelectContent className="workout-builder-popover">
                    {ALL_CATEGORIES.map((item) => <SelectItem key={item} value={item}>{CATEGORY_LABELS[item]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="workout-builder-field">
                <span id="workout-date-label">Data <small>(opcional)</small></span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" aria-labelledby="workout-date-label workout-date-value" className="workout-builder-input workout-builder-date">
                      <CalendarIcon size={17} aria-hidden="true" /><span id="workout-date-value">{scheduledDate ? scheduledDate.toLocaleDateString('pt-BR') : 'Escolher data'}</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="workout-builder-popover w-auto p-0">
                    <Calendar locale={ptBR} mode="single" selected={scheduledDate} onSelect={setScheduledDate} captionLayout="dropdown" />
                    {scheduledDate && <button type="button" className="workout-builder-clear-date" onClick={() => setScheduledDate(undefined)}>Remover data</button>}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {category === 'martial_arts' && <label className="workout-builder-field mt-4"><span>Arte marcial</span><select className="workout-builder-input" value={discipline} onChange={(event) => setDiscipline(event.target.value)}>{MARTIAL_DISCIPLINES.map((item) => <option key={item}>{item}</option>)}</select></label>}
            {['running','swimming','cycling','martial_arts'].includes(category) && <p className="mt-3 text-xs text-fitness-muted">Planeje blocos ou rounds por tempo. Ao executar, informe tempo ativo e esforço; {category === 'swimming' ? 'distância em metros' : category === 'martial_arts' ? 'descreva técnicas e rounds praticados' : 'distância percorrida'}.</p>}
          </section>

          <section className="workout-builder-section" aria-labelledby="workout-selected-heading">
            <div className="workout-builder-section-title">
              <h3 id="workout-selected-heading">Seu treino</h3><span className="workout-builder-count" aria-live="polite">{selectedExercises.length} escolhido{selectedExercises.length === 1 ? '' : 's'}</span>
            </div>
            {!selectedExercises.length && <div className="workout-builder-empty"><Plus size={20} aria-hidden="true" /><p>Adicione exercícios do catálogo abaixo.<span>Depois, ajuste as séries e o descanso.</span></p></div>}
            <div className="workout-builder-selected">
              {selectedExercises.map((exercise, index) => {
                const setConfigs = configs[exercise.id] ?? createDefaultDraftConfigs(exercise);
                const summaryConfig = setConfigs[0] ?? createDefaultDraftConfig(exercise);
                return <div key={exercise.id} className="workout-builder-exercise">
                  <div className="workout-builder-exercise-head"><span className="workout-builder-order">{index + 1}</span><div><p>{exercise.name}</p><span>{setConfigs.length} {setConfigs.length === 1 ? 'série' : 'séries'} · {exercise.measureMode === 'reps' ? `${summaryConfig.reps} repetições` : `${summaryConfig.durationSeconds}s por série`} · {summaryConfig.restSeconds}s de descanso</span></div><button type="button" className="workout-builder-remove" aria-label={`Remover ${exercise.name}`} onClick={() => toggleExercise(exercise)}><X size={18} aria-hidden="true" /></button></div>
                  <details className="workout-builder-config" open><summary>Configurar séries <ChevronDown size={16} aria-hidden="true" /></summary>
                    <div className="workout-builder-set-list">
                      {setConfigs.map((config, setIndex) => <div className="workout-builder-set" key={config.id ?? `${exercise.id}-${setIndex}`}>
                        <div className="workout-builder-set-heading"><strong>Série {setIndex + 1}</strong><button type="button" className="workout-builder-set-remove" aria-label={`Remover série ${setIndex + 1} de ${exercise.name}`} disabled={setConfigs.length <= 1} onClick={() => removeSet(exercise.id, setIndex)}><Minus size={16} aria-hidden="true" /></button></div>
                        <div className="workout-builder-numbers">
                          {exercise.measureMode === 'reps' ? <NumberField label="Repetições" value={config.reps} onChange={(value) => updateConfig(exercise.id, setIndex, { reps: Math.round(value) })} min={1} /> : <NumberField label={exercise.source === 'native' ? 'Tempo ativo (min)' : 'Isometria (s)'} value={config.durationSeconds / (exercise.source === 'native' ? 60 : 1)} onChange={(value) => updateConfig(exercise.id, setIndex, { durationSeconds: exercise.source === 'native' ? value * 60 : Math.round(value) })} min={1} />}
                          {exercise.loadMode === 'weighted' && <NumberField label="Carga (kg)" value={config.loadKg} onChange={(value) => updateConfig(exercise.id, setIndex, { loadKg: value })} min={0} />}
                          <NumberField label="Descanso (s)" value={config.restSeconds} onChange={(value) => updateConfig(exercise.id, setIndex, { restSeconds: value })} min={0} />
                          <label className="workout-builder-field workout-builder-factor"><span>Fator da série</span><select className="workout-builder-input" value={config.loadFactor} onChange={(event) => updateConfig(exercise.id, setIndex, { loadFactor: Number(event.target.value) as ExerciseDraftConfig['loadFactor'] })}><option value={0.8}>Leve / aquecimento · ×0,8</option><option value={1}>Manutenção / atual · ×1,0</option><option value={1.5}>Progressão / recorde · ×1,5</option></select></label>
                        </div>
                      </div>)}
                      <button type="button" className="workout-builder-add-set" onClick={() => addSet(exercise)}><Plus size={16} aria-hidden="true" /> Adicionar série</button>
                    </div>
                  </details>
                  <details className="workout-builder-config"><summary>Personalizar perfil muscular <ChevronDown size={16} aria-hidden="true" /></summary>
                    <p className="px-4 pb-3 text-xs text-fitness-muted">Estimativa do planejamento, não medição. Ajuste os grupos envolvidos; a soma deve ser 100%. Somente blocos concluídos entram na distribuição final.</p>
                    <div className="workout-builder-numbers">{Object.entries(MUSCLE_LABELS).map(([muscleId,label]) => <NumberField key={muscleId} label={`${label} (%)`} min={0} value={(muscleOverrides[exercise.id] ?? exercise.muscleDistribution).find((row)=>row.muscleId===muscleId)?.percentage ?? 0} onChange={(value)=>setMuscleOverrides((previous)=>{const rows=previous[exercise.id] ?? exercise.muscleDistribution;return {...previous,[exercise.id]:[...rows.filter((row)=>row.muscleId!==muscleId),{muscleId:muscleId as MuscleGroupId,percentage:value}]};})} />)}</div>
                  </details>
                </div>;
              })}
            </div>
          </section>

          <section className="workout-builder-estimate" aria-live="polite" aria-label="Projeção de equivalentes de repetição">
            <div><span>Projeção do treino completo</span><strong>{plannedEquivalents.equivalents.toLocaleString('pt-BR')} ER</strong></div>
            <p>{hasEquivalentExercises ? <>≈ {plannedEquivalents.baseValue.toLocaleString('pt-BR', { maximumFractionDigits: 4 })} de base_value. Projeção ER de séries por repetição/isometria (1 ER = 0,03); blocos de esporte por tempo usam outra métrica.</> : 'Adicione exercícios com repetição ou isometria para estimar ER. Modalidades medidas por tempo/distância usam outra métrica.'} É uma estimativa do plano, não XP ou Prana concedidos.</p>
          </section>

          <section className="workout-builder-section" aria-labelledby="workout-catalog-heading">
            <div className="workout-builder-section-title"><h3 id="workout-catalog-heading">Catálogo de exercícios</h3><span>{filteredCatalog.length} disponíveis</span></div>
            <div className="workout-builder-search"><Search size={18} aria-hidden="true" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome" className="workout-builder-input" aria-label="Buscar exercício no catálogo" /></div>
            <div className="workout-builder-filters" role="group" aria-label="Filtrar catálogo" hidden={!(['mixed', 'custom'].includes(category))}>
              {SOURCE_FILTERS.map((item) => <button key={item.value} type="button" onClick={() => setSourceFilter(item.value)} aria-pressed={sourceFilter === item.value}>{item.label}</button>)}
            </div>
            <div className="workout-builder-catalog" role="region" aria-label="Exercícios disponíveis" tabIndex={0}>
              {!filteredCatalog.length && <p className="workout-builder-no-results">Nenhum exercício encontrado. Tente outro nome ou filtro.</p>}
              {filteredCatalog.map((exercise) => {
                const checked = selectedIds.includes(exercise.id);
                return <button key={exercise.id} type="button" onClick={() => toggleExercise(exercise)} aria-pressed={checked} className="workout-builder-catalog-row">
                  <span><strong>{exercise.name}</strong><small>{CATEGORY_LABELS[exercise.category]} · {exercise.measureMode === 'reps' ? 'Repetições' : 'Duração'}</small></span>
                  <span className="workout-builder-add">{checked ? <Check size={18} aria-hidden="true" /> : <Plus size={18} aria-hidden="true" />}</span>
                </button>;
              })}
            </div>
          </section>
        </div>

        <footer className="workout-builder-footer">
          <p id="workout-submit-hint" aria-live="polite">{submitHint}</p>
          <div><button type="button" className="workout-builder-cancel" onClick={() => onOpenChange(false)}>Cancelar</button><button type="button" className="workout-builder-submit" disabled={!canSubmit} aria-describedby="workout-submit-hint" onClick={handleSubmit}>{workoutToEdit ? 'Salvar alterações' : 'Criar treino'}</button></div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};
