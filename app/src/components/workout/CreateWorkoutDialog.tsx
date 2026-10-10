import React, { useEffect, useMemo, useState, useId, useRef } from 'react';
import { MARTIAL_DISCIPLINES } from '@/constants/sport-activities';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, X, Check, Search, ChevronDown } from 'lucide-react';
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
  estimateWorkoutDurationMinutes,
  type ExerciseDraftConfig,
} from '@/lib/workout';
import type { Workout, WorkoutExercise, WorkoutExerciseCategory, WorkoutExerciseSource, MuscleContribution, MuscleGroupId } from '@/types/workout';
import './create-workout.css';

interface CreateWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultCategory?: WorkoutExerciseCategory;
  presetExerciseId?: string;
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
  onCreated,
}) => {
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { getExerciseCatalog, createWorkout } = useWorkoutStore();
  const catalog = getExerciseCatalog();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkoutExerciseCategory>(defaultCategory ?? 'mixed');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<'all' | WorkoutExerciseSource>('all');
  const [search, setSearch] = useState('');
  const [discipline, setDiscipline] = useState('Taekwondo');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [muscleOverrides, setMuscleOverrides] = useState<Record<string, MuscleContribution[]>>({});
  const [configs, setConfigs] = useState<Record<string, ExerciseDraftConfig>>({});

  useEffect(() => {
    if (!open) return;
    setName('');
    setMuscleOverrides({});
    setCategory(defaultCategory ?? 'mixed');
    setScheduledDate(undefined);
    setSourceFilter('all');
    setSearch('');

    const preset = presetExerciseId ? catalog.find((exercise) => exercise.id === presetExerciseId) : undefined;
    if (preset) {
      setSelectedIds([preset.id]);
      setConfigs({ [preset.id]: createDefaultDraftConfig(preset) });
      setCategory(preset.category);
    } else {
      setSelectedIds([]);
      setConfigs({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, presetExerciseId]);

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

  const toggleExercise = (exercise: WorkoutExercise) => {
    setSelectedIds((prev) =>
      prev.includes(exercise.id) ? prev.filter((id) => id !== exercise.id) : [...prev, exercise.id]
    );
    setConfigs((prev) => (prev[exercise.id] ? prev : { ...prev, [exercise.id]: createDefaultDraftConfig(exercise) }));
  };

  const updateConfig = (exerciseId: string, patch: Partial<ExerciseDraftConfig>) => {
    setConfigs((prev) => ({ ...prev, [exerciseId]: { ...prev[exerciseId], ...patch } }));
  };

  const compatible = selectedExercises.every((exercise) => ['mixed', 'custom'].includes(category) || exercise.category === category && (category !== 'martial_arts' || exercise.family === discipline));
  const musclesValid = selectedExercises.every((exercise) => !muscleOverrides[exercise.id] || Math.abs(muscleOverrides[exercise.id].reduce((total,entry)=>total+entry.percentage,0)-100)<0.01);
  const canSubmit = name.trim().length > 0 && selectedExercises.length > 0 && compatible && musclesValid;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const exercisePlans = selectedExercises.map((exercise, index) =>
      ({...buildExercisePlan(exercise, index + 1, configs[exercise.id] ?? createDefaultDraftConfig(exercise)), muscleDistributionOverride: muscleOverrides[exercise.id]})
    );

    const workout = createWorkout({
      name: name.trim(),
      category,
      scheduledAt: scheduledDate?.toISOString(),
      estimatedDurationMinutes: estimateWorkoutDurationMinutes(exercisePlans),
      exercises: exercisePlans,
    });

    if (!workout) {
      toast.error('Não foi possível criar o treino.');
      return;
    }

    toast.success('Treino criado com sucesso.');
    onCreated?.(workout);
    onOpenChange(false);
  };

  const plannedMinutes = estimateWorkoutDurationMinutes(selectedExercises.map((exercise, index) =>
    buildExercisePlan(exercise, index + 1, configs[exercise.id] ?? createDefaultDraftConfig(exercise))
  ));
  const submitHint = !musclesValid ? 'O perfil muscular personalizado precisa somar 100%.' : !compatible ? 'Remova as atividades de outra modalidade ou escolha Treino misto.' : !name.trim() ? 'Dê um nome ao treino para continuar.' : !selectedExercises.length ? 'Adicione pelo menos um exercício.' : `${selectedExercises.length} exercício${selectedExercises.length === 1 ? '' : 's'} · cerca de ${plannedMinutes} min`;

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
            <DialogTitle ref={titleRef} tabIndex={-1} id={titleId} className="workout-builder-title">Criar treino</DialogTitle>
            <p>Monte uma rotina que faça sentido para você.</p>
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
                const config = configs[exercise.id] ?? createDefaultDraftConfig(exercise);
                return <div key={exercise.id} className="workout-builder-exercise">
                  <div className="workout-builder-exercise-head"><span className="workout-builder-order">{index + 1}</span><div><p>{exercise.name}</p><span>{config.sets} {config.sets === 1 ? 'série' : 'séries'} · {exercise.measureMode === 'reps' ? `${config.reps} repetições` : `${config.durationSeconds}s por série`} · {config.restSeconds}s de descanso</span></div><button type="button" className="workout-builder-remove" aria-label={`Remover ${exercise.name}`} onClick={() => toggleExercise(exercise)}><X size={18} aria-hidden="true" /></button></div>
                  <details className="workout-builder-config"><summary>Ajustar séries <ChevronDown size={16} aria-hidden="true" /></summary><div className="workout-builder-numbers">
                    <NumberField label="Séries" value={config.sets} onChange={(value) => updateConfig(exercise.id, { sets: value })} min={1} />
                    {exercise.measureMode === 'reps' ? <NumberField label="Repetições" value={config.reps} onChange={(value) => updateConfig(exercise.id, { reps: value })} min={1} /> : <NumberField label={exercise.source === 'native' ? "Tempo ativo (min)" : "Duração (s)"} value={config.durationSeconds / (exercise.source === 'native' ? 60 : 1)} onChange={(value) => updateConfig(exercise.id, { durationSeconds: value * (exercise.source === 'native' ? 60 : 1) })} min={1} />}
                    {exercise.loadMode === 'weighted' && <NumberField label="Carga (kg)" value={config.loadKg} onChange={(value) => updateConfig(exercise.id, { loadKg: value })} min={0} />}
                    <NumberField label="Descanso (s)" value={config.restSeconds} onChange={(value) => updateConfig(exercise.id, { restSeconds: value })} min={0} />
                  </div></details>
                  <details className="workout-builder-config"><summary>Personalizar perfil muscular <ChevronDown size={16} aria-hidden="true" /></summary>
                    <p className="px-4 pb-3 text-xs text-fitness-muted">Estimativa do planejamento, não medição. Ajuste os grupos envolvidos; a soma deve ser 100%. Somente blocos concluídos entram na distribuição final.</p>
                    <div className="workout-builder-numbers">{Object.entries(MUSCLE_LABELS).map(([muscleId,label]) => <NumberField key={muscleId} label={`${label} (%)`} min={0} value={(muscleOverrides[exercise.id] ?? exercise.muscleDistribution).find((row)=>row.muscleId===muscleId)?.percentage ?? 0} onChange={(value)=>setMuscleOverrides((previous)=>{const rows=previous[exercise.id] ?? exercise.muscleDistribution;return {...previous,[exercise.id]:[...rows.filter((row)=>row.muscleId!==muscleId),{muscleId:muscleId as MuscleGroupId,percentage:value}]};})} />)}</div>
                  </details>
                </div>;
              })}
            </div>
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
          <div><button type="button" className="workout-builder-cancel" onClick={() => onOpenChange(false)}>Cancelar</button><button type="button" className="workout-builder-submit" disabled={!canSubmit} aria-describedby="workout-submit-hint" onClick={handleSubmit}>Criar treino</button></div>
        </footer>
      </DialogContent>
    </Dialog>
  );
};
