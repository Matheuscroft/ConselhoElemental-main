import { useState } from 'react';
import { FitnessButton } from '@/components/fitness-kit';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Exercise, WorkoutExerciseCategory } from '@/types/workout';

export function CustomExerciseFields({ modality, proposedName, onAdded, onCancel }: {
  modality: WorkoutExerciseCategory; proposedName: string; onAdded: (exercise: Exercise) => void; onCancel: () => void;
}) {
  const save = useWorkoutStore((state) => state.saveCustomExercise);
  const [name, setName] = useState(proposedName);
  const [mode, setMode] = useState<'reps' | 'duration'>(['running', 'swimming', 'cycling', 'martial_arts', 'yoga'].includes(modality) ? 'duration' : 'reps');
  const [error, setError] = useState('');
  return <fieldset className="space-y-3 rounded-2xl border border-fitness-primary/30 bg-fitness-primary/5 p-4">
    <legend className="px-1 font-sans font-semibold">Criar exercício</legend>
    <label className="block text-sm">Nome do exercício<input className="workout-builder-input mt-2" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Supino com halteres" /></label>
    <label className="block text-sm">Como registrar<select className="workout-builder-input mt-2" value={mode} onChange={(event) => setMode(event.target.value as 'reps' | 'duration')}><option value="reps">Repetições e carga</option><option value="duration">Tempo ativo</option></select></label>
    <p className="text-xs text-fitness-muted">Fica salvo no seu catálogo. Configure séries e mídia depois de adicionar. A distribuição muscular ficará sem estimativa até ser informada.</p>
    {error && <p role="alert" className="text-sm text-fitness-coral">{error}</p>}
    <div className="flex gap-2"><FitnessButton size="md" disabled={!name.trim()} onClick={() => { const exercise = save({ name, modality, measureMode: mode }); if (exercise) onAdded(exercise); else setError('Confira o nome do exercício.'); }}>Adicionar ao treino</FitnessButton><FitnessButton size="md" variant="secondary" onClick={onCancel}>Cancelar</FitnessButton></div>
  </fieldset>;
}
