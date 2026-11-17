import { useState } from 'react';
import { useWorkoutStore } from '@/stores/workoutStore';
import type { Exercise, WorkoutExerciseCategory } from '@/types/workout';

export function CustomExerciseFields({ modality, proposedName, onAdded, onCancel }: {
  modality: WorkoutExerciseCategory; proposedName: string; onAdded: (exercise: Exercise) => void; onCancel: () => void;
}) {
  const save = useWorkoutStore((state) => state.saveCustomExercise);
  const [name, setName] = useState(proposedName);
  const [mode, setMode] = useState<'reps' | 'duration'>(['running', 'swimming', 'cycling', 'martial_arts', 'yoga'].includes(modality) ? 'duration' : 'reps');
  const [error, setError] = useState('');
  return <fieldset className="dg-custom">
    <legend className="dg-custom-legenda">Criar exercício</legend>
    <label className="dg-campo"><span className="dg-rotulo">Nome do exercício</span><input className="workout-builder-input" value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Supino com halteres" /></label>
    <label className="dg-campo"><span className="dg-rotulo">Como registrar</span><select className="workout-builder-input" value={mode} onChange={(event) => setMode(event.target.value as 'reps' | 'duration')}><option value="reps">Repetições e carga</option><option value="duration">Tempo ativo</option></select></label>
    <p className="dg-nota">Fica salvo no seu catálogo. Configure séries e mídia depois de adicionar. A distribuição muscular ficará sem estimativa até ser informada.</p>
    {error && <p role="alert" className="dg-erro">{error}</p>}
    <div className="dg-custom-acoes"><button type="button" className="dg-btn" data-tipo="primario" disabled={!name.trim()} onClick={() => { const exercise = save({ name, modality, measureMode: mode }); if (exercise) onAdded(exercise); else setError('Confira o nome do exercício.'); }}>Adicionar ao treino</button><button type="button" className="dg-btn" data-tipo="fantasma" onClick={onCancel}>Cancelar</button></div>
  </fieldset>;
}
