import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  buildExercisePlan,
  createDefaultDraftConfig,
  estimateWorkoutDurationMinutes,
  type ExerciseDraftConfig,
} from '@/lib/workout';
import type { Workout, WorkoutExercise, WorkoutExerciseCategory, WorkoutExerciseSource } from '@/types/workout';
import { FitnessButton } from '@/components/fitness';

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

const NumberField: React.FC<NumberFieldProps> = ({ label, value, onChange, min }) => (
  <label className="block">
    <span className="text-[10px] text-fitness-muted block mb-0.5">{label}</span>
    <Input
      type="number"
      inputMode="decimal"
      min={min}
      value={value}
      onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))}
      className="h-9 bg-fitness-surface-hover border-transparent font-mono text-xs px-2 text-fitness-text focus-visible:ring-fitness-primary"
    />
  </label>
);

export const CreateWorkoutDialog: React.FC<CreateWorkoutDialogProps> = ({
  open,
  onOpenChange,
  defaultCategory,
  presetExerciseId,
  onCreated,
}) => {
  const { getExerciseCatalog, createWorkout } = useWorkoutStore();
  const catalog = getExerciseCatalog();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<WorkoutExerciseCategory>(defaultCategory ?? 'mixed');
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<'all' | WorkoutExerciseSource>('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [configs, setConfigs] = useState<Record<string, ExerciseDraftConfig>>({});

  useEffect(() => {
    if (!open) return;
    setName('');
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
      if (sourceFilter !== 'all' && exercise.source !== sourceFilter) return false;
      if (term && !exercise.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [catalog, sourceFilter, search]);

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

  const canSubmit = name.trim().length > 0 && selectedExercises.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const exercisePlans = selectedExercises.map((exercise, index) =>
      buildExercisePlan(exercise, index + 1, configs[exercise.id] ?? createDefaultDraftConfig(exercise))
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-fitness-surface border-transparent rounded-[24px] max-w-md max-h-[90vh] overflow-y-auto text-fitness-text shadow-fitness-elevated">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold text-fitness-text uppercase tracking-wider">Criar Treino</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <label className="block">
            <span className="text-[13px] text-fitness-muted mb-1 block">Nome do treino</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Treino de Empurrar"
              className="bg-fitness-surface-hover border-transparent h-12 rounded-2xl px-4 text-[15px] focus-visible:ring-fitness-primary placeholder:text-fitness-muted/50"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[13px] text-fitness-muted mb-1 block">Categoria</span>
              <Select value={category} onValueChange={(value) => setCategory(value as WorkoutExerciseCategory)}>
                <SelectTrigger className="bg-fitness-surface-hover border-transparent h-12 rounded-2xl px-4 focus-visible:ring-fitness-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-fitness-surface border-fitness-surface-hover rounded-xl shadow-fitness-elevated">
                  {ALL_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item} className="focus:bg-fitness-surface-hover focus:text-fitness-primary">
                      {CATEGORY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div>
              <span className="text-[13px] text-fitness-muted mb-1 block">Data planejada</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full flex items-center bg-fitness-surface-hover border-transparent h-12 rounded-2xl px-4 text-left text-[14px] text-fitness-text hover:bg-fitness-surface-hover/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fitness-primary">
                    <CalendarIcon className="w-4 h-4 mr-2 text-fitness-muted" aria-hidden="true" />
                    {scheduledDate ? scheduledDate.toLocaleDateString('pt-BR') : 'Sem data'}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-transparent bg-fitness-surface shadow-fitness-elevated rounded-2xl">
                  <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} captionLayout="dropdown" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <span className="text-[13px] text-fitness-muted mb-1 block">Adicionar exercícios</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar exercício"
              className="bg-fitness-surface-hover border-transparent h-10 rounded-xl px-4 mb-3 text-[14px] focus-visible:ring-fitness-primary placeholder:text-fitness-muted/50"
              aria-label="Buscar exercício no catálogo"
            />
            <div className="flex gap-2 mb-3">
              {SOURCE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSourceFilter(item.value)}
                  aria-pressed={sourceFilter === item.value}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                    sourceFilter === item.value
                      ? 'bg-fitness-primary/20 text-fitness-primary border border-fitness-primary/50'
                      : 'bg-fitness-surface-hover text-fitness-muted hover:text-fitness-text border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 rounded-2xl border border-fitness-surface-hover bg-fitness-surface/50 p-2 scrollbar-thin scrollbar-thumb-fitness-surface-hover">
              {filteredCatalog.length === 0 && (
                <p className="text-[13px] text-fitness-muted text-center py-6">Nenhum exercício encontrado.</p>
              )}
              {filteredCatalog.map((exercise) => {
                const checked = selectedIds.includes(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => toggleExercise(exercise)}
                    aria-pressed={checked}
                    className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      checked ? 'bg-fitness-primary/10 text-fitness-text' : 'text-fitness-muted hover:bg-fitness-surface-hover hover:text-fitness-text'
                    }`}
                  >
                    <span className="truncate text-[14px] font-medium">{exercise.name}</span>
                    {checked ? (
                      <X className="w-4 h-4 shrink-0 text-fitness-primary" aria-hidden="true" />
                    ) : (
                      <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedExercises.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[13px] text-fitness-muted">Configuração das séries</span>
              {selectedExercises.map((exercise) => {
                const config = configs[exercise.id] ?? createDefaultDraftConfig(exercise);
                return (
                  <div key={exercise.id} className="rounded-2xl border border-fitness-surface-hover bg-fitness-surface p-3 shadow-sm">
                    <p className="text-[14px] font-medium text-fitness-text mb-3 truncate">{exercise.name}</p>
                    <div className="grid grid-cols-4 gap-2">
                      <NumberField label="Séries" value={config.sets} onChange={(value) => updateConfig(exercise.id, { sets: value })} min={1} />
                      {exercise.measureMode === 'reps' ? (
                        <NumberField label="Reps" value={config.reps} onChange={(value) => updateConfig(exercise.id, { reps: value })} min={1} />
                      ) : (
                        <NumberField
                          label="Segundos"
                          value={config.durationSeconds}
                          onChange={(value) => updateConfig(exercise.id, { durationSeconds: value })}
                          min={1}
                        />
                      )}
                      {exercise.loadMode === 'weighted' && (
                        <NumberField label="Carga (kg)" value={config.loadKg} onChange={(value) => updateConfig(exercise.id, { loadKg: value })} min={0} />
                      )}
                      <NumberField
                        label="Descanso (s)"
                        value={config.restSeconds}
                        onChange={(value) => updateConfig(exercise.id, { restSeconds: value })}
                        min={0}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
          <FitnessButton variant="secondary" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
            Cancelar
          </FitnessButton>
          <FitnessButton variant="primary" disabled={!canSubmit} onClick={handleSubmit} className="flex-1 sm:flex-none">
            Criar Treino
          </FitnessButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
