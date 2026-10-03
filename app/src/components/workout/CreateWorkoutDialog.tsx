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
import { Button } from '@/components/ui/button';
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
    <span className="text-[10px] text-white/50 block mb-0.5">{label}</span>
    <Input
      type="number"
      inputMode="decimal"
      min={min}
      value={value}
      onChange={(event) => onChange(Math.max(min, Number(event.target.value) || min))}
      className="h-8 bg-white/5 border-white/15 font-mono text-xs px-2"
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
      <DialogContent className="bg-mystic-purple/95 border-white/10 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mystic">Criar treino</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <label className="block">
            <span className="text-xs text-white/60 mb-1 block">Nome do treino</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Treino de Empurrar"
              className="bg-white/5 border-white/15"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-white/60 mb-1 block">Categoria</span>
              <Select value={category} onValueChange={(value) => setCategory(value as WorkoutExerciseCategory)}>
                <SelectTrigger className="bg-white/5 border-white/15 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {CATEGORY_LABELS[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div>
              <span className="text-xs text-white/60 mb-1 block">Data planejada</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="w-full justify-start border-white/15 bg-white/5 font-normal">
                    <CalendarIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                    {scheduledDate ? scheduledDate.toLocaleDateString('pt-BR') : 'Sem data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-white/10 bg-void/95">
                  <Calendar mode="single" selected={scheduledDate} onSelect={setScheduledDate} captionLayout="dropdown" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <span className="text-xs text-white/60 mb-1 block">Adicionar exercícios</span>
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar exercício"
              className="bg-white/5 border-white/15 h-8 mb-2"
              aria-label="Buscar exercício no catálogo"
            />
            <div className="flex gap-1.5 mb-2">
              {SOURCE_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setSourceFilter(item.value)}
                  aria-pressed={sourceFilter === item.value}
                  className={`px-2.5 py-1 rounded-lg text-[11px] border transition-colors ${
                    sourceFilter === item.value
                      ? 'bg-mystic-gold/20 border-mystic-gold/50 text-mystic-gold'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="max-h-44 overflow-y-auto space-y-1 rounded-xl border border-white/10 bg-black/20 p-2">
              {filteredCatalog.length === 0 && (
                <p className="text-xs text-white/50 text-center py-4">Nenhum exercício encontrado.</p>
              )}
              {filteredCatalog.map((exercise) => {
                const checked = selectedIds.includes(exercise.id);
                return (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => toggleExercise(exercise)}
                    aria-pressed={checked}
                    className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${
                      checked ? 'bg-mystic-arcane/20 text-white' : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="truncate">{exercise.name}</span>
                    {checked ? (
                      <X className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedExercises.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-white/60">Configuração das séries</span>
              {selectedExercises.map((exercise) => {
                const config = configs[exercise.id] ?? createDefaultDraftConfig(exercise);
                return (
                  <div key={exercise.id} className="rounded-xl border border-white/10 bg-black/20 p-2.5">
                    <p className="text-sm text-white mb-2 truncate">{exercise.name}</p>
                    <div className="grid grid-cols-4 gap-1.5">
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

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" className="bg-mystic-arcane hover:bg-mystic-arcane/80" disabled={!canSubmit} onClick={handleSubmit}>
            Criar treino
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
